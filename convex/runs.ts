import { action, internalMutation, mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import { v } from "convex/values";
import { MAX_RUN_BYTES, MAX_RUNS, runBytes } from "../shared/limits";
import { summarize } from "../shared/summary";
import { VERSION_IDS } from "../shared/versions";
import { isAvatar } from "../shared/avatars";
import { importCaughtState, validateImportId, validateImportStart } from "../shared/save-import";

import { sendContact } from "./contactSpam";
import { verifiedVisitor } from "./verification";
import { identityOf } from "./auth";
import { preserveJournal, validateJournal } from "../shared/journal";
// Each run can carry up to MAX_RUN_BYTES, so batches stay well under the 16 MiB per-call read limit
const BATCH = 16;

async function owner(ctx: QueryCtx, expectedUserId?: string) {
  const me = await identityOf(ctx);
  if (!me) throw new Error("Sign in first");
  if (expectedUserId !== undefined && me.subject !== expectedUserId) throw new Error("Account changed");
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
  state = preserveJournal(state, old?.state ?? "{}");
  validateJournal(JSON.parse(state));
  if (runBytes(state) > MAX_RUN_BYTES) throw new Error("Playthrough is too large");
  if (old) await ctx.db.patch(old._id, { state });
  else await ctx.db.insert("states", { run: run._id, state });
  await ctx.db.patch(run._id, { ...fields, summary: summarize(state) });
}

async function dropRun(ctx: MutationCtx, run: Id<"runs">) {
  const s = await stateOf(ctx, run);
  if (s) await ctx.db.delete(s._id);
  await ctx.db.delete(run);
}

async function mine(ctx: QueryCtx, id: string, expectedUserId?: string) {
  const runId = ctx.db.normalizeId("runs", id);
  const run = runId && (await ctx.db.get(runId));
  if (!run || run.owner !== (await owner(ctx, expectedUserId))) throw new Error("Not your playthrough");
  return run;
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const me = await identityOf(ctx);
    if (!me) return [];
    return (await ownedBy(ctx, me.tokenIdentifier)).map((r) => ({
      id: r._id as string,
      version: r.version,
      summary: r.summary,
      createdAt: new Date(r.startedAt ?? r._creationTime).toISOString(),
      updatedAt: new Date(r.updatedAt ?? r._creationTime).toISOString(),
    }));
  },
});

export const get = query({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const run = await mine(ctx, id);
    return (await stateOf(ctx, run._id))?.state ?? "{}";
  },
});

export const create = mutation({
  args: { version: v.string(), expectedUserId: v.optional(v.string()) },
  handler: async (ctx, { version, expectedUserId }) => {
    const who = await owner(ctx, expectedUserId);
    if (!(VERSION_IDS as readonly string[]).includes(version)) throw new Error("Unknown game");
    if ((await ownedBy(ctx, who)).length >= MAX_RUNS) throw new Error("Too many playthroughs");
    return (await ctx.db.insert("runs", { owner: who, version, summary: summarize("{}") })) as string;
  },
});

export const importCaught = mutation({
  args: { version: v.string(), caught: v.array(v.number()), importId: v.string(), startedAt: v.optional(v.number()) },
  returns: v.string(),
  handler: async (ctx, { version, caught, importId, startedAt }) => {
    const who = await owner(ctx);
    validateImportId(importId);
    validateImportStart(startedAt);
    const state = importCaughtState(version, caught);
    const existing = await ctx.db.query("runs")
      .withIndex("by_owner_importId", (q) => q.eq("owner", who).eq("importId", importId))
      .unique();
    if (existing) {
      if (existing.version !== version || (await stateOf(ctx, existing._id))?.state !== state || existing.startedAt !== startedAt)
        throw new Error("Import ID already used for another playthrough");
      return existing._id as string;
    }
    if ((await ownedBy(ctx, who)).length >= MAX_RUNS) throw new Error("Too many playthroughs");
    const id = await ctx.db.insert("runs", { owner: who, version, importId, startedAt, summary: summarize(state) });
    await ctx.db.insert("states", { run: id, state });
    return id as string;
  },
});

export const save = mutation({
  args: { id: v.string(), state: v.string(), expectedUserId: v.optional(v.string()) },
  handler: async (ctx, { id, state, expectedUserId }) => {
    if (runBytes(state) > MAX_RUN_BYTES) throw new Error("Playthrough is too large");
    JSON.parse(state);
    const run = await mine(ctx, id, expectedUserId);
    await putState(ctx, run, state, { updatedAt: Date.now() });
  },
});

export const setStart = mutation({
  args: { id: v.string(), startedAt: v.number(), expectedUserId: v.optional(v.string()) },
  handler: async (ctx, { id, startedAt, expectedUserId }) => {
    if (!Number.isFinite(startedAt) || startedAt > Date.now() + 864e5) throw new Error("Pick a past date");
    const run = await mine(ctx, id, expectedUserId);
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

const profileOf = (ctx: QueryCtx, who: string) =>
  ctx.db
    .query("profiles")
    .withIndex("by_owner", (q) => q.eq("owner", who))
    .take(2);

export const avatar = query({
  args: {},
  handler: async (ctx) => {
    const me = await identityOf(ctx);
    return (me && (await profileOf(ctx, me.tokenIdentifier))[0]?.avatar) ?? null;
  },
});

export const setAvatar = mutation({
  args: { avatar: v.number() },
  handler: async (ctx, { avatar }) => {
    if (!isAvatar(avatar)) throw new Error("Unknown avatar");
    const who = await owner(ctx);
    const [first, ...extras] = await profileOf(ctx, who);
    if (first) await ctx.db.patch(first._id, { avatar });
    else await ctx.db.insert("profiles", { owner: who, avatar });
    for (const p of extras) await ctx.db.delete(p._id);
  },
});

export const theme = query({
  args: {},
  handler: async (ctx) => {
    const me = await identityOf(ctx);
    const p = me && (await profileOf(ctx, me.tokenIdentifier))[0];
    return p?.look && p.mode ? { look: p.look, mode: p.mode } : null;
  },
});

export const setTheme = mutation({
  args: { look: v.string(), mode: v.union(v.literal("auto"), v.literal("light"), v.literal("dark")) },
  handler: async (ctx, { look, mode }) => {
    if (!/^[a-z-]{1,32}$/.test(look)) throw new Error("Unknown look");
    const who = await owner(ctx);
    const [first] = await profileOf(ctx, who);
    if (first) await ctx.db.patch(first._id, { look, mode });
    else await ctx.db.insert("profiles", { owner: who, look, mode });
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

export const deleteAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const who = await owner(ctx);
    await purgeRuns(ctx, who);
    await purgeEventsFor(ctx, who);
    for (const p of await profileOf(ctx, who)) await ctx.db.delete(p._id);
    const devices = await ctx.db
      .query("deviceLabels")
      .withIndex("by_owner", (q) => q.eq("owner", who))
      .take(100);
    for (const d of devices) await ctx.db.delete(d._id);
    const sent = await ctx.db
      .query("messages")
      .withIndex("by_sender", (q) => q.eq("sender", who))
      .collect();
    for (const m of sent) await ctx.db.delete(m._id);
  },
});

const contactArgs = { email: v.string(), message: v.string(), website: v.optional(v.string()) };
const contactResult = v.object({ ok: v.boolean(), retryAfterSeconds: v.optional(v.number()) });
export const contact = action({
  args: { ...contactArgs, token: v.optional(v.string()) },
  returns: contactResult,
  handler: async (ctx, { token, ...input }): Promise<{ ok: boolean; retryAfterSeconds?: number }> => {
    if (input.website) return { ok: true };
    const visitor = await verifiedVisitor(ctx, token, "contact");
    return ctx.runMutation(internal.runs.acceptContact, { ...input, visitor });
  },
});
export const acceptContact = internalMutation({
  args: { ...contactArgs, visitor: v.optional(v.string()) },
  returns: contactResult,
  handler: sendContact,
});

async function purgeEventsFor(ctx: MutationCtx, who: string) {
  const rows = await ctx.db.query("events").withIndex("by_owner", (q) => q.eq("owner", who)).take(BATCH);
  for (const row of rows) await ctx.db.delete(row._id);
  if (rows.length === BATCH) await ctx.scheduler.runAfter(0, internal.runs.purgeEvents, { owner: who });
}

export const purgeEvents = internalMutation({
  args: { owner: v.string() },
  handler: (ctx, { owner }) => purgeEventsFor(ctx, owner),
});
