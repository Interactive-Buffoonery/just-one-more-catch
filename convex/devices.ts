import { MINUTE } from "@convex-dev/rate-limiter";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { action, internalMutation, mutation, query } from "./_generated/server";
import { clerkApi, identityOf, sessionOf } from "./auth";

export const REVOKED_MS = 10 * MINUTE;
const MAX_DEVICES = 100;

export const label = mutation({
  args: { label: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const me = await identityOf(ctx);
    const sid = me && sessionOf(me);
    if (!me || !sid) throw new Error("Sign in first");
    const label = args.label.trim().slice(0, 60);
    if (!label) return null;
    const existing = await ctx.db
      .query("deviceLabels")
      .withIndex("by_sid", (q) => q.eq("sid", sid))
      .first();
    if (existing)
      await ctx.db.patch(existing._id, { owner: me.tokenIdentifier, label });
    else
      await ctx.db.insert("deviceLabels", {
        sid,
        owner: me.tokenIdentifier,
        label,
      });
    return null;
  },
});

export const labels = query({
  args: {},
  returns: v.array(v.object({ sid: v.string(), label: v.string() })),
  handler: async (ctx) => {
    const me = await identityOf(ctx);
    if (!me) return [];
    const rows = await ctx.db
      .query("deviceLabels")
      .withIndex("by_owner", (q) => q.eq("owner", me.tokenIdentifier))
      .take(MAX_DEVICES);
    return rows.map(({ sid, label }) => ({ sid, label }));
  },
});

export const revoke = action({
  args: { sessionId: v.string() },
  returns: v.null(),
  handler: async (ctx, { sessionId }) => {
    const me: { subject: string; sid?: string } | null = await ctx.runQuery(
      internal.auth.current,
      {},
    );
    if (!me) throw new Error("Sign in first");
    if (!/^sess_[A-Za-z0-9]+$/.test(sessionId))
      throw new Error("Device not found");
    if (sessionId === me.sid) throw new Error("Use Sign out on this device");
    const session = await clerkApi(`/sessions/${sessionId}`, {
      method: "GET",
    }).catch(() => null);
    if (session?.user_id !== me.subject) throw new Error("Device not found");
    const revoked = await clerkApi(`/sessions/${sessionId}/revoke`, {
      method: "POST",
    }).catch(() => null);
    if (!revoked) throw new Error("Couldn't sign that device out. Try again.");
    await ctx.runMutation(internal.devices.markRevoked, { sid: sessionId });
    return null;
  },
});

export const markRevoked = internalMutation({
  args: { sid: v.string() },
  returns: v.null(),
  handler: async (ctx, { sid }) => {
    const expiresAt = Date.now() + REVOKED_MS;
    const id = await ctx.db.insert("revokedSessions", { sid, expiresAt });
    await ctx.scheduler.runAt(expiresAt, internal.devices.cleanup, { id });
    for (const row of await ctx.db
      .query("deviceLabels")
      .withIndex("by_sid", (q) => q.eq("sid", sid))
      .take(10))
      await ctx.db.delete(row._id);
    return null;
  },
});

export const cleanup = internalMutation({
  args: { id: v.union(v.id("pairings"), v.id("revokedSessions")) },
  returns: v.null(),
  handler: async (ctx, { id }) => {
    const row = await ctx.db.get(id);
    if (row && row.expiresAt <= Date.now()) await ctx.db.delete(id);
    return null;
  },
});
