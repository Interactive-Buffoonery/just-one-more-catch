import { HOUR, MINUTE, RateLimiter } from "@convex-dev/rate-limiter";
import { components, internal } from "./_generated/api";
import type { MutationCtx } from "./_generated/server";

const limits = new RateLimiter(components.rateLimiter, {
  contactSender: { kind: "token bucket", rate: 3, period: HOUR, capacity: 2 },
  contactGuests: { kind: "token bucket", rate: 20, period: HOUR, capacity: 5 },
  contactSiteBurst: { kind: "token bucket", rate: 5, period: MINUTE, capacity: 5 },
  contactSiteHour: { kind: "fixed window", rate: 20, period: HOUR },
});

export async function sendContact(
  ctx: MutationCtx,
  input: { email: string; message: string; website?: string },
) {
  if (input.website) return { ok: true };
  const email = input.email.trim(), message = input.message.trim();
  if (!message || message.length > 4000 || email.length > 200 ||
      (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)))
    return { ok: false };
  const identity = await ctx.auth.getUserIdentity();
  const sender = identity?.tokenIdentifier ?? "anonymous";
  const latest = await ctx.db.query("messages")
    .withIndex("by_sender", (q) => q.eq("sender", sender))
    .order("desc").first();
  if (latest?.message === message && latest.email.toLowerCase() === email.toLowerCase())
    return { ok: true };
  // Anonymous requests share a bucket: email and browser IDs can be forged.
  for (const [name, key] of [
    [identity ? "contactSender" : "contactGuests", sender],
    ["contactSiteBurst", undefined],
    ["contactSiteHour", undefined],
  ] as const) {
    const result = await limits.limit(ctx, name, { key });
    if (!result.ok)
      return { ok: false, retryAfterSeconds: Math.ceil(result.retryAfter / 1000) };
  }
  await ctx.db.insert("messages", { sender, email, message });
  await ctx.db.insert("events", {
    name: "contact_sent", owner: identity?.tokenIdentifier,
  });
  await ctx.scheduler.runAfter(0, internal.email.notify, { email, message });
  return { ok: true };
}
