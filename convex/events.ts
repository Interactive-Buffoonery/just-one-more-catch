import { touchQuota } from "./quotaKeys";
import { action, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { eventName } from "./schema";
import { VERSION_IDS } from "../shared/versions";
import { identityOf } from "./auth";
import { DAY, MINUTE, RateLimiter } from "@convex-dev/rate-limiter";
import { components, internal } from "./_generated/api";
import { verifiedVisitor } from "./verification";

export const RETENTION_MS = 90 * DAY;
const limits = new RateLimiter(components.rateLimiter, {
  eventCaller: { kind: "token bucket", rate: 10, period: MINUTE, capacity: 10 },
  eventDaily: { kind: "fixed window", rate: 100, period: DAY },
});

const eventArgs = { name: eventName, version: v.optional(v.string()) };
export const track = action({
  args: { ...eventArgs, token: v.optional(v.string()) },
  returns: v.null(),
  handler: async (ctx, { token, ...input }): Promise<null> => {
    if (input.name === "contact_sent") return null;
    const visitor = await verifiedVisitor(ctx, token, "analytics");
    return ctx.runMutation(internal.events.record, { ...input, visitor });
  },
});
export const record = internalMutation({
  args: { ...eventArgs, visitor: v.optional(v.string()) },
  returns: v.null(),
  handler: async (ctx, { name, version, visitor }) => {
    const owner = (await identityOf(ctx))?.tokenIdentifier;
    // Contact events are emitted only by the successful contact transaction.
    if (name === "contact_sent") return null;
    if (!owner && !visitor) throw new Error("Verification required");
    const key = owner ?? visitor!;
    await touchQuota(ctx, key);
    if (!(await limits.limit(ctx, "eventCaller", { key })).ok ||
        !(await limits.limit(ctx, "eventDaily", { key })).ok) return null;
    await ctx.db.insert("events", {
      name, owner,
      version: version && (VERSION_IDS as readonly string[]).includes(version) ? version : undefined,
    });
    return null;
  },
});

export const prune = internalMutation({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("events")
      .withIndex("by_creation_time", q => q.lt("_creationTime", Date.now() - RETENTION_MS))
      .take(100);
    for (const row of rows) await ctx.db.delete(row._id);
    if (rows.length === 100) await ctx.scheduler.runAfter(0, internal.events.prune, {});
  },
});
