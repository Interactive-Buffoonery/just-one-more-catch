import { DAY } from "@convex-dev/rate-limiter";
import { components, internal } from "./_generated/api";
import { internalMutation, type MutationCtx } from "./_generated/server";

export const QUOTA_IDLE_MS = 2 * DAY;
const names = ["eventCaller", "eventDaily", "contactSender", "pairingStart", "sharePublish"];

export async function touchQuota(ctx: MutationCtx, key: string) {
  const row = await ctx.db.query("quotaKeys").withIndex("by_key", q => q.eq("key", key)).unique();
  const expiresAt = Date.now() + QUOTA_IDLE_MS;
  if (row) await ctx.db.patch(row._id, { expiresAt });
  else await ctx.db.insert("quotaKeys", { key, expiresAt });
}

export const prune = internalMutation({
  args: {},
  handler: async (ctx): Promise<void> => {
    const rows = await ctx.db.query("quotaKeys")
      .withIndex("by_expiresAt", q => q.lt("expiresAt", Date.now())).take(10);
    for (const row of rows) {
      for (const name of names)
        await ctx.runMutation(components.rateLimiter.lib.resetRateLimit, { name, key: row.key });
      await ctx.db.delete(row._id);
    }
    if (rows.length === 10) await ctx.scheduler.runAfter(0, internal.quotaKeys.prune, {});
  },
});
