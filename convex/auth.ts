import { env, internalQuery, type QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import type { UserIdentity } from "convex/server";

export async function identityOf(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  const sid = sessionOf(identity);
  if (!sid || await ctx.db.query("revokedSessions").withIndex("by_sid", (q) => q.eq("sid", sid)).first())
    return null;
  return identity;
}

export const sessionOf = (identity: UserIdentity) =>
  typeof identity.sid === "string" && identity.sid ? identity.sid : undefined;

export const current = internalQuery({
  args: {},
  returns: v.union(v.null(), v.object({ subject: v.string(), tokenIdentifier: v.string(), sid: v.optional(v.string()) })),
  handler: async (ctx) => {
    const me = await identityOf(ctx);
    return me && { subject: me.subject, tokenIdentifier: me.tokenIdentifier, sid: sessionOf(me) };
  },
});

export async function clerkApi(path: string, init: { method: "GET" | "POST"; body?: unknown }) {
  if (!env.CLERK_SECRET_KEY) {
    console.error("CLERK_SECRET_KEY is not set");
    return null;
  }
  const res = await fetch(`https://api.clerk.com/v1${path}`, {
    method: init.method,
    headers: {
      Authorization: `Bearer ${env.CLERK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  if (!res.ok) {
    console.error(`Clerk ${init.method} ${path.split("/")[1]} failed with ${res.status}`);
    return null;
  }
  return (await res.json()) as Record<string, unknown>;
}
