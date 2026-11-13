import { touchQuota } from "./quotaKeys";
import { HOUR, RateLimiter } from "@convex-dev/rate-limiter";
import { components, internal } from "./_generated/api";
import type { MutationCtx } from "./_generated/server";
import { identityOf } from "./auth";

const limits = new RateLimiter(components.rateLimiter, {
  contactSender: { kind: "token bucket", rate: 3, period: HOUR, capacity: 2 },
});

export async function sendContact(
  ctx: MutationCtx,
  input: { email: string; message: string; website?: string; visitor?: string },
) {
  if (input.website) return { ok: true };
  const email = input.email.trim(), message = input.message.trim();
  if (!message || message.length > 4000 || email.length > 200 ||
      (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)))
    return { ok: false };
  const identity = await identityOf(ctx);
  if (!identity && !input.visitor) throw new Error("Verification required");
  const sender = identity?.tokenIdentifier ?? input.visitor!;
  await touchQuota(ctx, sender);
  const latest = await ctx.db.query("messages")
    .withIndex("by_sender", (q) => q.eq("sender", sender))
    .order("desc").first();
  if (latest?.message === message && latest.email.toLowerCase() === email.toLowerCase())
    return { ok: true };
  // Visitor keys reach this internal function only after server verification.
  const result = await limits.limit(ctx, "contactSender", { key: sender });
  if (!result.ok)
    return { ok: false, retryAfterSeconds: Math.ceil(result.retryAfter / 1000) };
  await ctx.db.insert("messages", { sender, email, message });
  await ctx.db.insert("events", {
    name: "contact_sent", owner: identity?.tokenIdentifier,
  });
  await ctx.scheduler.runAfter(0, internal.email.notify, { email, message });
  return { ok: true };
}
