import { v } from "convex/values";
import { internalQuery } from "./_generated/server";
import { accountOf } from "./auth";
import { projectionValidator } from "./shares";
import { validateProjection } from "../shared/share-projection";

export const read = internalQuery({
  args: { token: v.string() },
  returns: v.union(projectionValidator, v.null()),
  handler: async (ctx, { token }) => {
    if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
    const row = await ctx.db.query("shares").withIndex("by_token", q => q.eq("token", token)).unique();
    if (!row || (await accountOf(ctx, row.owner))?.deleting) return null;
    const projection = validateProjection(row.projection);
    if (!projection) console.error("Invalid share projection", row._id);
    return projection;
  },
});
