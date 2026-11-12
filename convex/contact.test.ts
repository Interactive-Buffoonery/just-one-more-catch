/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import rateLimiter from "@convex-dev/rate-limiter/test";
import { afterEach, expect, test, vi } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");
const setup = () => {
  const t = convexTest(schema, modules);
  rateLimiter.register(t);
  return t;
};
afterEach(() => vi.useRealTimers());

test("honeypot and invalid submissions never store or schedule mail", async () => {
  const t = setup();
  for (const input of [
    { email: "", message: "Hello", website: "bot.example" },
    { email: "", message: " " },
    { email: "bad address", message: "Hello" },
    { email: "", message: "a".repeat(4001) },
  ]) await t.mutation(api.runs.contact, input);
  expect(await t.run((ctx) => ctx.db.query("messages").collect())).toEqual([]);
  expect(await t.run((ctx) => ctx.db.system.query("_scheduled_functions").collect())).toEqual([]);
});

test("anonymous requests cannot evade their limit by changing email", async () => {
  const t = setup();
  for (let i = 0; i < 5; i++)
    expect(await t.mutation(api.runs.contact, { email: `${i}@example.com`, message: `Hello ${i}` })).toEqual({ ok: true });
  const blocked = await t.mutation(api.runs.contact, { email: "other@example.com", message: "Again" });
  expect(blocked.ok).toBe(false);
  expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  expect(await t.run((ctx) => ctx.db.query("messages").collect())).toHaveLength(5);
  expect(await t.run((ctx) => ctx.db.query("events").collect())).toHaveLength(5);
  expect(await t.run((ctx) => ctx.db.system.query("_scheduled_functions").collect())).toHaveLength(5);
});

test("retries are deduplicated and authenticated senders keep independent limits", async () => {
  const t = setup(), a = t.withIdentity({ tokenIdentifier: "issuer|a" });
  const input = { email: "A@example.com", message: "Hello" };
  await a.mutation(api.runs.contact, input);
  await a.mutation(api.runs.contact, input);
  await a.mutation(api.runs.contact, { ...input, message: "Second" });
  expect((await a.mutation(api.runs.contact, { ...input, message: "Third" })).ok).toBe(false);
  expect((await t.withIdentity({ tokenIdentifier: "issuer|b" }).mutation(api.runs.contact, input)).ok).toBe(true);
  const messages = await t.run((ctx) => ctx.db.query("messages").collect());
  expect(messages).toHaveLength(3);
  expect(messages.map((m) => m.sender)).toEqual(["issuer|a", "issuer|a", "issuer|b"]);
});

test("site limits stop rotating accounts and replenish after waiting", async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-11-12T12:00:00Z"));
  const t = setup();
  for (let i = 0; i < 5; i++)
    expect((await t.withIdentity({ subject: `user-${i}` }).mutation(api.runs.contact, { email: "", message: "Hello" })).ok).toBe(true);
  expect((await t.withIdentity({ subject: "sixth" }).mutation(api.runs.contact, { email: "", message: "Hello" })).ok).toBe(false);
  vi.advanceTimersByTime(60_000);
  expect((await t.withIdentity({ subject: "after-wait" }).mutation(api.runs.contact, { email: "", message: "Hello" })).ok).toBe(true);
  for (let i = 6; i < 20; i++) {
    vi.advanceTimersByTime(12_000);
    expect((await t.withIdentity({ subject: `user-${i}` }).mutation(api.runs.contact, { email: "", message: "Hello" })).ok).toBe(true);
  }
  vi.advanceTimersByTime(60_000);
  expect((await t.withIdentity({ subject: "over-hour-cap" }).mutation(api.runs.contact, { email: "", message: "Hello" })).ok).toBe(false);
  expect(await t.run((ctx) => ctx.db.query("messages").collect())).toHaveLength(20);
});
