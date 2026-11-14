import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { markDeleting } from "./runs";

export async function validSignature(request: Request, body: string, secret: string | undefined) {
  if (!secret) return false;
  const id = request.headers.get("svix-id");
  const timestamp = request.headers.get("svix-timestamp");
  const signatures = request.headers.get("svix-signature");
  if (!id || !timestamp || !/^\d+$/.test(timestamp) || !signatures ||
    Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;
  try {
    const bytes = Uint8Array.from(atob(secret.replace(/^whsec_/, "")), c => c.charCodeAt(0));
    const key = await crypto.subtle.importKey("raw", bytes, { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
    const signed = new TextEncoder().encode(`${id}.${timestamp}.${body}`);
    for (const signature of signatures.split(" ")) {
      const [version, value] = signature.split(",");
      if (version !== "v1" || !value) continue;
      try {
        const digest = Uint8Array.from(atob(value), c => c.charCodeAt(0));
        if (await crypto.subtle.verify("HMAC", key, digest, signed)) return true;
      } catch {}
    }
  } catch {}
  return false;
}

export const deleted = internalMutation({
  args: { subject: v.string() },
  returns: v.null(),
  handler: async (ctx, { subject }) => {
    const account = await ctx.db.query("accounts").withIndex("by_subject", q => q.eq("subject", subject)).unique();
    if (account && await markDeleting(ctx, account.owner))
      await ctx.scheduler.runAfter(0, internal.runs.cleanup, { owner: account.owner });
    return null;
  },
});
