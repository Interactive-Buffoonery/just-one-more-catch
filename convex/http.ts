import { httpRouter } from "convex/server";
import { validSignature } from "./clerkWebhook";
import { env, httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { validateProjection } from "../shared/share-projection";

const http = httpRouter();
// Vite moves to the next free port when 5173 is taken, so any local port is allowed
const allowedOrigin = (origin: string) =>
  origin === "https://justonemorecatch.app" || /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);

function shareHeaders(request: Request) {
  const headers = new Headers({
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    "Referrer-Policy": "no-referrer",
    "X-Robots-Tag": "noindex",
    "Vary": "Origin",
  });
  const origin = request.headers.get("Origin");
  if (origin && allowedOrigin(origin)) headers.set("Access-Control-Allow-Origin", origin);
  return headers;
}

http.route({
  path: "/share",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const headers = shareHeaders(request);
    const unavailable = () => new Response(JSON.stringify({ error: "Unavailable" }), { status: 404, headers });
    const token = request.headers.get("X-Share-Token");
    if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) return unavailable();
    try {
      const projection = validateProjection(await ctx.runQuery(internal.shareReader.read, { token }));
      return projection ? new Response(JSON.stringify(projection), { headers }) : unavailable();
    } catch {
      return unavailable();
    }
  }),
});

http.route({
  path: "/share",
  method: "OPTIONS",
  handler: httpAction(async (_ctx, request) => {
    const headers = shareHeaders(request);
    headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "X-Share-Token");
    return new Response(null, { status: 204, headers });
  }),
});

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.text();
    if (!await validSignature(request, body, env.CLERK_WEBHOOK_SECRET))
      return new Response("Invalid signature", { status: 400 });
    let event: unknown;
    try { event = JSON.parse(body); }
    catch { return new Response("Invalid event", { status: 400 }); }
    if (!event || typeof event !== "object" || !("type" in event) || typeof event.type !== "string")
      return new Response("Invalid event", { status: 400 });
    if (event.type === "user.deleted") {
      if (!("data" in event) || !event.data || typeof event.data !== "object" ||
        !("id" in event.data) || typeof event.data.id !== "string" || !event.data.id)
        return new Response("Invalid event", { status: 400 });
      await ctx.runMutation(internal.clerkWebhook.deleted, { subject: event.data.id });
    }
    return new Response(null, { status: 204 });
  }),
});

export default http;
