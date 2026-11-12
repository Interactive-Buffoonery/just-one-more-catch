import { HOUR, MINUTE, RateLimiter } from "@convex-dev/rate-limiter";
import { v } from "convex/values";
import { components, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import {
  action,
  internalMutation,
  mutation,
  query,
  type MutationCtx,
} from "./_generated/server";
import { clerkApi, identityOf } from "./auth";

export const CODE_ALPHABET = "BCDFGHJKLMNPQRSTVWXZ";
export const PAIRING_MS = 10 * MINUTE;
const TICKET_SECONDS = 120;

const limits = new RateLimiter(components.rateLimiter, {
  pairingStart: {
    kind: "token bucket",
    rate: 60,
    period: MINUTE,
    capacity: 20,
  },
  pairingAttempt: {
    kind: "token bucket",
    rate: 20,
    period: HOUR,
    capacity: 10,
  },
});

const randomBytes = (n: number) => crypto.getRandomValues(new Uint8Array(n));
const hex = (bytes: Uint8Array) =>
  Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
const sha256 = async (text: string) =>
  hex(
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)),
    ),
  );

function sameText(a: string, b: string) {
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++)
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function randomCode() {
  let code = "";
  while (code.length < 8)
    for (const b of randomBytes(16))
      if (b < 240 && code.length < 8)
        code += CODE_ALPHABET[b % CODE_ALPHABET.length];
  return code;
}

export const normalizeCode = (input: string) =>
  input.toUpperCase().replace(/[\s-]/g, "");
export const displayCode = (code: string) =>
  `${code.slice(0, 4)}-${code.slice(4)}`;

async function heldPairing(ctx: MutationCtx, id: string, secret: string) {
  const pairingId = ctx.db.normalizeId("pairings", id);
  const row = pairingId && (await ctx.db.get(pairingId));
  return row && sameText(row.secretHash, await sha256(secret)) ? row : null;
}

const cleanLabel = (label: string) =>
  label.trim().slice(0, 60) || "Another device";

export const start = mutation({
  args: { label: v.string() },
  returns: v.object({
    id: v.string(),
    code: v.string(),
    secret: v.string(),
    expiresAt: v.number(),
  }),
  handler: async (ctx, { label }) => {
    await limits.limit(ctx, "pairingStart", { throws: true });
    let code = randomCode();
    while (
      await ctx.db
        .query("pairings")
        .withIndex("by_code", (q) => q.eq("code", code))
        .first()
    )
      code = randomCode();
    const secret = hex(randomBytes(32));
    const expiresAt = Date.now() + PAIRING_MS;
    const id = await ctx.db.insert("pairings", {
      code,
      secretHash: await sha256(secret),
      label: cleanLabel(label),
      status: "pending",
      expiresAt,
    });
    await ctx.scheduler.runAt(expiresAt, internal.devices.cleanup, { id });
    return { id, code: displayCode(code), secret, expiresAt };
  },
});

export const status = query({
  args: { id: v.string(), secret: v.string() },
  returns: v.union(
    v.object({
      status: v.union(
        v.literal("pending"),
        v.literal("denied"),
        v.literal("expired"),
      ),
    }),
    v.object({ status: v.literal("approved"), ticket: v.string() }),
  ),
  handler: async (ctx, { id, secret }) => {
    const pairingId = ctx.db.normalizeId("pairings", id);
    const row = pairingId && (await ctx.db.get(pairingId));
    if (!row || !sameText(row.secretHash, await sha256(secret)))
      return { status: "expired" as const };
    if (row.status === "approved" && row.ticket)
      return { status: "approved" as const, ticket: row.ticket };
    return {
      status:
        row.status === "denied" ? ("denied" as const) : ("pending" as const),
    };
  },
});

export const finish = mutation({
  args: { id: v.string(), secret: v.string() },
  returns: v.null(),
  handler: async (ctx, { id, secret }) => {
    const row = await heldPairing(ctx, id, secret);
    if (row) await ctx.db.delete(row._id);
    return null;
  },
});

const missing = v.object({ status: v.literal("missing") });
const limited = v.object({
  status: v.literal("limited"),
  retryAfterSeconds: v.number(),
});

// Wrong codes return rather than throw, so the spent attempt isn't rolled back.
async function attempt(ctx: MutationCtx, input: string) {
  const me = await identityOf(ctx);
  if (!me) throw new Error("Sign in first");
  const result = await limits.limit(ctx, "pairingAttempt", {
    key: me.tokenIdentifier,
  });
  if (!result.ok)
    return {
      status: "limited" as const,
      retryAfterSeconds: Math.ceil(result.retryAfter / 1000),
    };
  const code = normalizeCode(input);
  const row = await ctx.db
    .query("pairings")
    .withIndex("by_code", (q) => q.eq("code", code))
    .first();
  if (
    !row ||
    row.status !== "pending" ||
    row.userId ||
    row.expiresAt <= Date.now()
  )
    return { status: "missing" as const };
  return { status: "ok" as const, me, row };
}

const failure = (
  r: { status: "missing" } | { status: "limited"; retryAfterSeconds: number },
) => r;

export const lookup = mutation({
  args: { code: v.string() },
  returns: v.union(
    v.object({
      status: v.literal("ok"),
      code: v.string(),
      label: v.string(),
      startedAt: v.number(),
    }),
    missing,
    limited,
  ),
  handler: async (ctx, { code }) => {
    const r = await attempt(ctx, code);
    if (r.status !== "ok") return r;
    return {
      status: "ok" as const,
      code: displayCode(r.row.code),
      label: r.row.label,
      startedAt: r.row._creationTime,
    };
  },
});

export const deny = mutation({
  args: { code: v.string() },
  returns: v.union(v.object({ status: v.literal("ok") }), missing, limited),
  handler: async (ctx, { code }) => {
    const r = await attempt(ctx, code);
    if (r.status !== "ok") return r;
    await ctx.db.patch(r.row._id, { status: "denied" });
    return { status: "ok" as const };
  },
});

export const claim = internalMutation({
  args: { code: v.string() },
  returns: v.union(
    v.object({
      status: v.literal("ok"),
      id: v.id("pairings"),
      userId: v.string(),
    }),
    missing,
    limited,
  ),
  handler: async (ctx, { code }) => {
    const r = await attempt(ctx, code);
    if (r.status !== "ok") return r;
    await ctx.db.patch(r.row._id, { userId: r.me.subject });
    return { status: "ok" as const, id: r.row._id, userId: r.me.subject };
  },
});

export const release = internalMutation({
  args: { id: v.id("pairings") },
  returns: v.null(),
  handler: async (ctx, { id }) => {
    const row = await ctx.db.get(id);
    if (row?.status === "pending")
      await ctx.db.patch(id, { userId: undefined });
    return null;
  },
});

export const grant = internalMutation({
  args: { id: v.id("pairings"), ticket: v.string() },
  returns: v.null(),
  handler: async (ctx, { id, ticket }) => {
    if (await ctx.db.get(id))
      await ctx.db.patch(id, { status: "approved", ticket });
    return null;
  },
});

export const approve = action({
  args: { code: v.string() },
  returns: v.union(v.object({ status: v.literal("ok") }), missing, limited),
  handler: async (
    ctx,
    { code },
  ): Promise<
    | { status: "ok" }
    | { status: "missing" }
    | { status: "limited"; retryAfterSeconds: number }
  > => {
    const claimed:
      | { status: "ok"; id: Id<"pairings">; userId: string }
      | { status: "missing" }
      | { status: "limited"; retryAfterSeconds: number } =
      await ctx.runMutation(internal.pairing.claim, { code });
    if (claimed.status !== "ok") return claimed;
    const token = await clerkApi("/sign_in_tokens", {
      method: "POST",
      body: { user_id: claimed.userId, expires_in_seconds: TICKET_SECONDS },
    }).catch(() => null);
    if (typeof token?.token !== "string") {
      await ctx.runMutation(internal.pairing.release, { id: claimed.id });
      throw new Error("Couldn't approve that device. Try again.");
    }
    await ctx.runMutation(internal.pairing.grant, {
      id: claimed.id,
      ticket: token.token,
    });
    return { status: "ok" };
  },
});
