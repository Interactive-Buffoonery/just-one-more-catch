import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { api } from "./_generated/api";
import { setup } from "./setup.testing";

const valid = { success: true, hostname: "justonemorecatch.app", action: "pairing", cdata: "a".repeat(32) };
beforeEach(() => {
  vi.stubEnv("TURNSTILE_SECRET_KEY", "test-secret");
  vi.stubEnv("TURNSTILE_HOSTNAMES", "justonemorecatch.app");
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
const respond = (body: unknown) => vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify(body))));

test.each([
  { success: false },
  { ...valid, success: "true" },
  { ...valid, hostname: "attacker.example" },
  { ...valid, action: "contact" },
  { ...valid, cdata: undefined },
  { ...valid, cdata: "forged-visitor" },
  null,
])("rejects invalid or mismatched anonymous pairing proof: %j", async proof => {
  respond(proof);
  const t = setup();
  await expect(t.action(api.pairing.start, { label: "Device", token: "proof" })).rejects.toThrow("Verification failed");
  expect(await t.run(ctx => ctx.db.query("pairings").collect())).toEqual([]);
});

test("missing configuration, absent/oversized tokens and outages fail closed", async () => {
  const t = setup();
  const fetcher = vi.fn(async () => { throw new Error("network down"); });
  vi.stubGlobal("fetch", fetcher);
  for (const token of [undefined, "x".repeat(2049)])
    await expect(t.action(api.runs.contact, { email: "", message: "Hello", token })).rejects.toThrow("Verification unavailable");
  vi.stubEnv("TURNSTILE_SECRET_KEY", "");
  await expect(t.action(api.pairing.start, { label: "Device", token: "proof" })).rejects.toThrow("Verification unavailable");
  expect(fetcher).not.toHaveBeenCalled();
  vi.stubEnv("TURNSTILE_SECRET_KEY", "test-secret");
  await expect(t.action(api.runs.contact, { email: "", message: "Hello", token: "proof" })).rejects.toThrow("Verification failed");
  expect(await t.run(ctx => ctx.db.query("messages").collect())).toEqual([]);
});

test("a contact token cannot start a pairing and replayed tokens cannot write twice", async () => {
  const spent = new Set<string>();
  vi.stubGlobal("fetch", vi.fn(async (url, init: RequestInit) => {
    expect(url).toBe("https://challenges.cloudflare.com/turnstile/v0/siteverify");
    const body = JSON.parse(String(init.body));
    expect(body.secret).toBe("test-secret");
    if (spent.has(body.response)) return new Response(JSON.stringify({ success: false, "error-codes": ["timeout-or-duplicate"] }));
    spent.add(body.response);
    return new Response(JSON.stringify({ ...valid, action: body.response === "contact-proof" ? "contact" : "pairing" }));
  }));
  const t = setup();
  await expect(t.action(api.pairing.start, { label: "Device", token: "contact-proof" })).rejects.toThrow();
  await t.action(api.pairing.start, { label: "Device", token: "pairing-proof" });
  await expect(t.action(api.pairing.start, { label: "Device", token: "pairing-proof" })).rejects.toThrow();
  expect(await t.run(ctx => ctx.db.query("pairings").collect())).toHaveLength(1);
});

test("a verified visitor cannot exhaust another visitor or account's pairing capacity", async () => {
  vi.stubGlobal("fetch", vi.fn(async (_url, init: RequestInit) => {
    const { response } = JSON.parse(String(init.body));
    return new Response(JSON.stringify({ ...valid, cdata: (response.startsWith("A") ? "a" : "b").repeat(32) }));
  }));
  const t = setup();
  for (let i = 0; i < 20; i++) await t.action(api.pairing.start, { label: "Device", token: `A${i}` });
  await expect(t.action(api.pairing.start, { label: "Device", token: "A20" })).rejects.toThrow();
  await expect(t.action(api.pairing.start, { label: "Other", token: "B0" })).resolves.toHaveProperty("code");
  await expect(t.withIdentity({ subject: "A", sid: "sess_A" }).action(api.pairing.start, { label: "Signed in" })).resolves.toHaveProperty("code");
});

test("signed-in actions do not depend on Turnstile; revoked sessions cannot bypass it", async () => {
  vi.stubEnv("TURNSTILE_SECRET_KEY", "");
  const fetcher = vi.fn();
  vi.stubGlobal("fetch", fetcher);
  const t = setup();
  const user = t.withIdentity({ subject: "A", sid: "sess_A" });
  await user.action(api.pairing.start, { label: "Device" });
  expect(await user.action(api.runs.contact, { email: "", message: "Hello" })).toEqual({ ok: true });
  await t.run(ctx => ctx.db.insert("revokedSessions", { sid: "sess_A", expiresAt: Date.now() + 10000 }));
  await expect(user.action(api.pairing.start, { label: "Device" })).rejects.toThrow("Verification unavailable");
  expect(fetcher).not.toHaveBeenCalled();
});

test("verification requests time out without writing", async () => {
  vi.useFakeTimers();
  vi.stubGlobal("fetch", vi.fn((_url, init: RequestInit) => new Promise((_resolve, reject) => {
    init.signal!.addEventListener("abort", () => reject(new Error("aborted")));
  })));
  const t = setup();
  const failed = expect(t.action(api.pairing.start, { label: "Device", token: "proof" })).rejects.toThrow("Verification failed");
  await vi.advanceTimersByTimeAsync(10000);
  await failed;
  expect(await t.run(ctx => ctx.db.query("pairings").collect())).toEqual([]);
});
