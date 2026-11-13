import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { api } from "./_generated/api";
import { setup } from "./setup.testing";
import type { Id } from "./_generated/dataModel";
import { projectionOf } from "../shared/share-projection";

const secretBytes = new TextEncoder().encode("test-webhook-signing-key-only");
const secret = `whsec_${btoa(String.fromCharCode(...secretBytes))}`;
const identity = { subject: "clerk-A", tokenIdentifier: "https://issuer.example|canonical-A", sid: "sess_A" };
const body = JSON.stringify({ type: "user.deleted", data: { id: identity.subject } });
async function signedHeaders(payload = body, timestamp = Math.floor(Date.now() / 1000)) {
  const id = "msg_test";
  const key = await crypto.subtle.importKey("raw", secretBytes, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signed = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${id}.${timestamp}.${payload}`));
  return {
    "svix-id": id,
    "svix-timestamp": String(timestamp),
    "svix-signature": `v1,${btoa(String.fromCharCode(...new Uint8Array(signed)))}`,
  };
}
const deliver = (t: ReturnType<typeof setup>, payload: string, headers: Record<string, string>) =>
  t.fetch("/clerk-webhook", { method: "POST", headers, body: payload });
beforeEach(() => { vi.stubEnv("CLERK_WEBHOOK_SECRET", secret); });
afterEach(() => { vi.useRealTimers(); vi.unstubAllEnvs(); });

test("bad, missing, tampered and out-of-window signatures cannot delete an account", async () => {
  const t = setup(), account = t.withIdentity(identity);
  await account.mutation(api.runs.create, { version: "crystal" });
  const headers = await signedHeaders();
  for (const invalid of [
    {}, { ...headers, "svix-signature": "v1,invalid" },
    { ...headers, "svix-id": "different" }, { ...headers, "svix-timestamp": "NaN" },
    await signedHeaders(body, Math.floor(Date.now() / 1000) - 301),
    await signedHeaders(body, Math.floor(Date.now() / 1000) + 301),
  ]) expect((await deliver(t, body, invalid)).status).toBe(400);
  expect((await deliver(t, body.replace("clerk-A", "clerk-B"), headers)).status).toBe(400);
  vi.stubEnv("CLERK_WEBHOOK_SECRET", "");
  expect((await deliver(t, body, headers)).status).toBe(400);
  expect((await t.run(ctx => ctx.db.query("accounts").first()))?.deleting).toBeUndefined();
  expect(await account.query(api.runs.list, {})).toHaveLength(1);
});

test("a signed deletion uses the recorded canonical identity and is idempotent", async () => {
  vi.useFakeTimers();
  const t = setup(), account = t.withIdentity(identity);
  const runId = await account.mutation(api.runs.create, { version: "crystal" }) as Id<"runs">;
  const shared = await account.action(api.shares.publish, { runId, projection: projectionOf("{}", "crystal"), expectedRevision: 0 });
  const headers = await signedHeaders();
  expect((await deliver(t, body, headers)).status).toBe(204);
  expect((await t.run(ctx => ctx.db.query("accounts").first()))).toMatchObject({ owner: identity.tokenIdentifier, subject: identity.subject, deleting: true });
  expect((await t.fetch("/share", { headers: { "X-Share-Token": shared.token! } })).status).toBe(404);
  const jobs = await t.run(ctx => ctx.db.system.query("_scheduled_functions").collect());
  expect(jobs).toHaveLength(1);
  expect((await deliver(t, body, headers)).status).toBe(204);
  expect(await t.run(ctx => ctx.db.system.query("_scheduled_functions").collect())).toHaveLength(1);
  await t.finishAllScheduledFunctions(vi.runAllTimers);
  expect(await t.run(ctx => ctx.db.query("runs").take(1))).toEqual([]);
  expect(await t.run(ctx => ctx.db.query("shares").take(1))).toEqual([]);
  expect((await deliver(t, body, headers)).status).toBe(204);
  expect(await t.run(ctx => ctx.db.system.query("_scheduled_functions").collect())).toHaveLength(1);
});

test("unknown subjects do not synthesize token identifiers from webhook data", async () => {
  const t = setup(), account = t.withIdentity(identity);
  await account.mutation(api.runs.create, { version: "crystal" });
  const payload = JSON.stringify({ type: "user.deleted", data: { id: "unknown", tokenIdentifier: identity.tokenIdentifier } });
  expect((await deliver(t, payload, await signedHeaders(payload))).status).toBe(204);
  expect((await t.run(ctx => ctx.db.query("accounts").first()))?.deleting).toBeUndefined();
  expect(await t.run(ctx => ctx.db.system.query("_scheduled_functions").collect())).toEqual([]);
});

test("save records the mapping for legacy accounts before sharing", async () => {
  const t = setup();
  const runId = await t.run(ctx => ctx.db.insert("runs", { owner: identity.tokenIdentifier, version: "crystal", summary: { badges: [], caught: 0, party: [] } }));
  await t.withIdentity(identity).mutation(api.runs.save, { id: runId, state: "{}" });
  expect(await t.run(ctx => ctx.db.query("accounts").first())).toMatchObject({ owner: identity.tokenIdentifier, subject: identity.subject });
});

test("signed malformed events fail validation and unrelated events are ignored", async () => {
  const t = setup();
  for (const payload of ["{", "null", JSON.stringify({ type: "user.deleted", data: {} })])
    expect((await deliver(t, payload, await signedHeaders(payload))).status).toBe(400);
  const payload = JSON.stringify({ type: "user.updated", data: {} });
  const headers = await signedHeaders(payload);
  headers["svix-signature"] = `v2,ignored v1,invalid ${headers["svix-signature"]}`;
  expect((await deliver(t, payload, headers)).status).toBe(204);
});
