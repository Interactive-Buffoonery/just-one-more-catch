import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { api } from "./_generated/api";
import { setup } from "./setup.testing";

beforeEach(() => {
  vi.stubEnv("TURNSTILE_SECRET_KEY", "test-secret");
  vi.stubEnv("TURNSTILE_HOSTNAMES", "justonemorecatch.app");
  vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({
    success: true, hostname: "justonemorecatch.app", action: "contact", cdata: "a".repeat(32),
  }))));
});
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

test("honeypot and invalid submissions never store or schedule mail", async () => {
  const t = setup();
  for (const input of [
    { email: "", message: "Hello", website: "bot.example" },
    { email: "", message: " " },
    { email: "bad address", message: "Hello" },
    { email: "", message: "a".repeat(4001) },
  ]) await t.withIdentity({ subject: "A", sid: "sess_A" }).action(api.runs.contact, input);
  expect(await t.run((ctx) => ctx.db.query("messages").collect())).toEqual([]);
  expect(await t.run((ctx) => ctx.db.system.query("_scheduled_functions").collect())).toEqual([]);
});

test("anonymous requests cannot evade their limit by changing email", async () => {
  const t = setup();
  for (let i = 0; i < 2; i++)
    expect(await t.action(api.runs.contact, { token: "proof", email: `${i}@example.com`, message: `Hello ${i}` })).toEqual({ ok: true });
  const blocked = await t.action(api.runs.contact, { token: "proof", email: "other@example.com", message: "Again" });
  expect(blocked.ok).toBe(false);
  expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  expect(await t.run((ctx) => ctx.db.query("messages").collect())).toHaveLength(2);
  expect(await t.run((ctx) => ctx.db.query("events").collect())).toHaveLength(2);
  expect(await t.run((ctx) => ctx.db.system.query("_scheduled_functions").collect())).toHaveLength(2);
});

test("retries are deduplicated and authenticated senders keep independent limits", async () => {
  const t = setup(), a = t.withIdentity({ tokenIdentifier: "issuer|a", sid: "sess_test" });
  const input = { email: "A@example.com", message: "Hello" };
  await a.action(api.runs.contact, input);
  await a.action(api.runs.contact, input);
  await a.action(api.runs.contact, { ...input, message: "Second" });
  expect((await a.action(api.runs.contact, { ...input, message: "Third" })).ok).toBe(false);
  expect((await t.withIdentity({ tokenIdentifier: "issuer|b", sid: "sess_test" }).action(api.runs.contact, input)).ok).toBe(true);
  const messages = await t.run((ctx) => ctx.db.query("messages").collect());
  expect(messages).toHaveLength(3);
  expect(messages.map((m) => m.sender)).toEqual(["issuer|a", "issuer|a", "issuer|b"]);
});

test("rotating accounts cannot consume another sender's quota; quotas replenish", async () => {
  vi.useFakeTimers();
  const t = setup();
  for (let i = 0; i < 30; i++)
    expect((await t.withIdentity({ subject: `user-${i}`, sid: "sess_test" }).action(api.runs.contact, { email: "", message: "Hello" })).ok).toBe(true);
  const user = t.withIdentity({ subject: "own", sid: "sess_test" });
  for (let i = 0; i < 2; i++) expect((await user.action(api.runs.contact, { email: "", message: `Hello ${i}` })).ok).toBe(true);
  expect((await user.action(api.runs.contact, { email: "", message: "Blocked" })).ok).toBe(false);
  vi.advanceTimersByTime(1200000);
  expect((await user.action(api.runs.contact, { email: "", message: "After waiting" })).ok).toBe(true);
});

test("one verified guest cannot spend another guest or signed-in sender's contact allowance", async () => {
  const t = setup();
  for (let i = 0; i < 2; i++) expect((await t.action(api.runs.contact, { email: "", message: `A ${i}`, token: "proof" })).ok).toBe(true);
  expect((await t.action(api.runs.contact, { email: "", message: "A blocked", token: "proof" })).ok).toBe(false);
  vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({
    success: true, hostname: "justonemorecatch.app", action: "contact", cdata: "b".repeat(32),
  }))));
  expect((await t.action(api.runs.contact, { email: "", message: "B", token: "other-proof" })).ok).toBe(true);
  expect((await t.withIdentity({ subject: "A", sid: "sess_A" }).action(api.runs.contact, { email: "", message: "Signed in" })).ok).toBe(true);
});
