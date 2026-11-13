import { internal } from "./_generated/api";
import { env, type ActionCtx } from "./_generated/server";

export async function verifiedVisitor(ctx: ActionCtx, token: string | undefined, action: "contact" | "pairing" | "analytics"): Promise<string | undefined> {
  if (await ctx.runQuery(internal.auth.current, {})) return undefined;
  const secret = env.TURNSTILE_SECRET_KEY;
  const hosts = env.TURNSTILE_HOSTNAMES?.split(",").map(s => s.trim()).filter(Boolean);
  if (!secret || !hosts?.length || !token || token.length > 2048)
    throw new Error("Verification unavailable. Please try again.");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, response: token }),
      signal: controller.signal,
    });
    const result: unknown = response.ok ? await response.json() : null;
    if (!result || typeof result !== "object") throw new Error();
    const proof = result as Record<string, unknown>;
    if (proof.success !== true || proof.action !== action ||
        typeof proof.hostname !== "string" || !hosts.includes(proof.hostname) ||
        typeof proof.cdata !== "string" || !/^[a-f0-9]{32}$/.test(proof.cdata)) throw new Error();
    return `guest:${proof.cdata}`;
  } catch {
    throw new Error("Verification failed. Please try again.");
  } finally {
    clearTimeout(timeout);
  }
}
