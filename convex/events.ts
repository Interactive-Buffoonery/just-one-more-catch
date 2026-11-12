import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { eventName } from "./schema";
import { VERSION_IDS } from "../shared/versions";

// ponytail: unauthenticated counts can be inflated by spam; upgrade to @convex-dev/rate-limiter.
export const track = mutation({
  args: { name: eventName, version: v.optional(v.string()) },
  handler: async (ctx, { name, version }) => {
    const owner = (await ctx.auth.getUserIdentity())?.tokenIdentifier;
    await ctx.db.insert("events", {
      name, owner,
      version: version && (VERSION_IDS as readonly string[]).includes(version) ? version : undefined,
    });
  },
});
