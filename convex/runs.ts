import { internalMutation, mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import { v } from "convex/values";
import { MAX_RUN_BYTES, MAX_RUNS, runBytes } from "../shared/limits";
import { summarize } from "../shared/summary";
import { VERSION_IDS } from "../shared/versions";

const EMAILS_PER_HOUR = 20;
// Each run can carry up to MAX_RUN_BYTES, so batches stay well under the 16 MiB per-call read limit
const BATCH = 16;

async function owner(ctx: QueryCtx) {
  const me = await ctx.auth.getUserIdentity();
  if (!me) throw new Error("Sign in first");
  return me.tokenIdentifier;
}

const ownedBy = (ctx: QueryCtx, who: string) =>
  ctx.db
    .query("runs")
    .withIndex("by_owner", (q) => q.eq("owner", who))
    .take(MAX_RUNS);

const stateOf = (ctx: QueryCtx, run: Id<"runs">) =>
  ctx.db
    .query("states")
    .withIndex("by_run", (q) => q.eq("run", run))
    .unique();

async function putState(ctx: MutationCtx, run: Doc<"runs">, state: string, fields: { updatedAt?: number } = {}) {
  const old = await stateOf(ctx, run._id);
  if (old) await ctx.db.patch(old._id, { state });
  else await ctx.db.insert("states", { run: run._id, state });
  await ctx.db.patch(run._id, { ...fields, summary: summarize(state), state: undefined });
}

async function dropRun(ctx: MutationCtx, run: Id<"runs">) {
  const s = await stateOf(ctx, run);
  if (s) await ctx.db.delete(s._id);
  await ctx.db.delete(run);
}

async function mine(ctx: QueryCtx, id: string) {
  const runId = ctx.db.normalizeId("runs", id);
  const run = runId && (await ctx.db.get(runId));
  if (!run || run.owner !== (await owner(ctx))) throw new Error("Not your playthrough");
  return run;
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const me = await ctx.auth.getUserIdentity();
    if (!me) return [];
    return (await ownedBy(ctx, me.tokenIdentifier)).map((r) => ({
      id: r._id as string,
      version: r.version,
      summary: r.state !== undefined || !r.summary ? summarize(r.state ?? "{}") : r.summary,
      createdAt: new Date(r.startedAt ?? r._creationTime).toISOString(),
      updatedAt: new Date(r.updatedAt ?? r._creationTime).toISOString(),
    }));
  },
});

export const get = query({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const run = await mine(ctx, id);
    // Inline state is only ever the newest copy: putState clears it
    return run.state ?? (await stateOf(ctx, run._id))?.state ?? "{}";
  },
});

export const create = mutation({
  args: { version: v.string() },
  handler: async (ctx, { version }) => {
    const who = await owner(ctx);
    if (!(VERSION_IDS as readonly string[]).includes(version)) throw new Error("Unknown game");
    if ((await ownedBy(ctx, who)).length >= MAX_RUNS) throw new Error("Too many playthroughs");
    return (await ctx.db.insert("runs", { owner: who, version, summary: summarize("{}") })) as string;
  },
});

export const save = mutation({
  args: { id: v.string(), state: v.string() },
  handler: async (ctx, { id, state }) => {
    if (runBytes(state) > MAX_RUN_BYTES) throw new Error("Playthrough is too large");
    JSON.parse(state);
    const run = await mine(ctx, id);
    await putState(ctx, run, state, { updatedAt: Date.now() });
  },
});

export const setStart = mutation({
  args: { id: v.string(), startedAt: v.number() },
  handler: async (ctx, { id, startedAt }) => {
    if (!Number.isFinite(startedAt) || startedAt > Date.now() + 864e5) throw new Error("Pick a past date");
    const run = await mine(ctx, id);
    await ctx.db.patch(run._id, { startedAt });
  },
});

export const remove = mutation({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const run = await mine(ctx, id);
    await dropRun(ctx, run._id);
  },
});

async function purgeRuns(ctx: MutationCtx, who: string) {
  const runs = await ctx.db
    .query("runs")
    .withIndex("by_owner", (q) => q.eq("owner", who))
    .take(BATCH);
  for (const r of runs) await dropRun(ctx, r._id);
  if (runs.length === BATCH) await ctx.scheduler.runAfter(0, internal.runs.purge, { owner: who });
}

export const purge = internalMutation({
  args: { owner: v.string() },
  handler: (ctx, { owner }) => purgeRuns(ctx, owner),
});

// One-time move of inline states into `states`: npx convex run runs:backfill (add --prod for production)
export const backfill = internalMutation({
  args: { cursor: v.optional(v.union(v.string(), v.null())) },
  handler: async (ctx, { cursor }) => {
    const page = await ctx.db.query("runs").paginate({ numItems: BATCH, cursor: cursor ?? null });
    for (const r of page.page) if (r.state !== undefined) await putState(ctx, r, r.state);
    if (!page.isDone) await ctx.scheduler.runAfter(0, internal.runs.backfill, { cursor: page.continueCursor });
  },
});

export const deleteAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const who = await owner(ctx);
    await purgeRuns(ctx, who);
    const sent = await ctx.db
      .query("messages")
      .withIndex("by_sender", (q) => q.eq("sender", who))
      .collect();
    for (const m of sent) await ctx.db.delete(m._id);
  },
});

export const contact = mutation({
  args: { email: v.string(), message: v.string(), website: v.optional(v.string()) },
  handler: async (ctx, input) => {
    if (input.website) return { ok: true };
    const email = input.email.trim().slice(0, 200);
    const message = input.message.trim().slice(0, 4000);
    if (!message || (email && !email.includes("@"))) return { ok: false };
    const sender = (await ctx.auth.getUserIdentity())?.tokenIdentifier ?? "anonymous";
    const latest = await ctx.db
      .query("messages")
      .withIndex("by_sender", (q) => q.eq("sender", sender))
      .order("desc")
      .first();
    if (latest?.message === message) return { ok: true };
    await ctx.db.insert("messages", { sender, email, message });
    // ponytail: soft global cap on notification emails; concurrent sends can slip a few past it, use @convex-dev/rate-limiter if that matters
    const lastHour = await ctx.db
      .query("messages")
      .withIndex("by_creation_time", (q) => q.gt("_creationTime", Date.now() - 3_600_000))
      .take(EMAILS_PER_HOUR + 1);
    if (lastHour.length <= EMAILS_PER_HOUR)
      await ctx.scheduler.runAfter(0, internal.email.notify, { email, message });
    return { ok: true };
  },
});
