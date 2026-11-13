import { ConvexError, v } from "convex/values";
import { HOUR, RateLimiter } from "@convex-dev/rate-limiter";
import { action, internalMutation, mutation, query } from "./_generated/server";
import { components, internal } from "./_generated/api";
import { mine } from "./runs";
import { rememberIdentity } from "./auth";
import { touchQuota } from "./quotaKeys";
import { canonical, projectionOf, validateProjection, type ShareProjection } from "../shared/share-projection";
import type { VersionId } from "../shared/versions";

export const projectionValidator = v.object({
  v: v.literal(1), game: v.string(), caught: v.array(v.number()), badges: v.array(v.string()),
});
const statusValidator = v.object({
  token: v.union(v.string(), v.null()),
  projection: v.union(projectionValidator, v.null()),
  revision: v.number(),
});
export type ShareStatus = { token: string | null; projection: ShareProjection | null; revision: number };
const publishArgs = { runId: v.id("runs"), projection: projectionValidator, expectedRevision: v.number() };
const limits = new RateLimiter(components.rateLimiter, {
  sharePublish: { kind: "token bucket", rate: 30, period: HOUR, capacity: 10 },
});

function checkRevision(actual: number | undefined, expected: number) {
  if (!Number.isSafeInteger(expected) || expected < 0 || (actual ?? 0) !== expected)
    throw new ConvexError({ code: "SHARE_REVISION_CONFLICT" });
}

export const status = query({
  args: { runId: v.id("runs") },
  returns: statusValidator,
  handler: async (ctx, { runId }): Promise<ShareStatus> => {
    const run = await mine(ctx, runId);
    const row = await ctx.db.query("shares").withIndex("by_runId", q => q.eq("runId", runId)).unique();
    return { token: row?.token ?? null, projection: row ? validateProjection(row.projection) : null, revision: run.shareRevision ?? 0 };
  },
});

export const commit = internalMutation({
  args: { ...publishArgs, token: v.string(), replace: v.boolean() },
  returns: statusValidator,
  handler: async (ctx, { runId, projection, expectedRevision, token, replace }): Promise<ShareStatus> => {
    const run = await mine(ctx, runId);
    await rememberIdentity(ctx);
    checkRevision(run.shareRevision, expectedRevision);
    const state = await ctx.db.query("states").withIndex("by_run", q => q.eq("run", runId)).unique();
    const fresh = projectionOf(state?.state ?? "{}", run.version as VersionId);
    const preview = validateProjection(projection);
    if (!preview || canonical(preview) !== canonical(fresh))
      throw new ConvexError({ code: "SHARE_PREVIEW_MISMATCH", projection: fresh });
    if (!/^[A-Za-z0-9_-]{43}$/.test(token)) throw new Error("Invalid share token");
    const row = await ctx.db.query("shares").withIndex("by_runId", q => q.eq("runId", runId)).unique();
    if (replace && !row) throw new ConvexError({ code: "SHARE_REVISION_CONFLICT" });
    const nextToken = row && !replace ? row.token : token;
    if (nextToken !== row?.token && await ctx.db.query("shares").withIndex("by_token", q => q.eq("token", nextToken)).unique())
      throw new Error("Share token collision");
    await touchQuota(ctx, run.owner);
    const limit = await limits.limit(ctx, "sharePublish", { key: run.owner });
    if (!limit.ok) throw new ConvexError({ code: "SHARE_RATE_LIMITED", retryAfter: limit.retryAfter });
    const now = Date.now();
    if (row) await ctx.db.patch(row._id, { token: nextToken, projection: fresh, updatedAt: now });
    else await ctx.db.insert("shares", { runId, owner: run.owner, token: nextToken, projection: fresh, createdAt: now, updatedAt: now });
    const revision = expectedRevision + 1;
    await ctx.db.patch(runId, { shareRevision: revision });
    return { token: nextToken, projection: fresh, revision };
  },
});

function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export const publish = action({
  args: publishArgs,
  returns: statusValidator,
  handler: async (ctx, args): Promise<ShareStatus> =>
    ctx.runMutation(internal.shares.commit, { ...args, token: randomToken(), replace: false }),
});

export const replace = action({
  args: publishArgs,
  returns: statusValidator,
  handler: async (ctx, args): Promise<ShareStatus> =>
    ctx.runMutation(internal.shares.commit, { ...args, token: randomToken(), replace: true }),
});

export const stop = mutation({
  args: { runId: v.id("runs"), expectedRevision: v.number() },
  returns: statusValidator,
  handler: async (ctx, { runId, expectedRevision }) => {
    const run = await mine(ctx, runId);
    checkRevision(run.shareRevision, expectedRevision);
    const row = await ctx.db.query("shares").withIndex("by_runId", q => q.eq("runId", runId)).unique();
    if (row) await ctx.db.delete(row._id);
    const revision = expectedRevision + 1;
    await ctx.db.patch(runId, { shareRevision: revision });
    return { token: null, projection: null, revision };
  },
});
