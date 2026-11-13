import { afterEach, expect, test, vi } from "vitest";
import { api, components, internal } from "./_generated/api";
import { QUOTA_IDLE_MS } from "./quotaKeys";
import { setup } from "./setup.testing";

afterEach(() => { vi.useRealTimers(); });
const identity = (subject: string) => ({ subject, tokenIdentifier: `issuer|${subject}`, sid: `sess_${subject}` });
const names = ["eventCaller", "eventDaily", "contactSender", "pairingStart"];
const config = { kind: "token bucket" as const, rate: 10, period: 60000, capacity: 10 };

test("cleans up all inactive component quotas and retains active callers", async () => {
  vi.useFakeTimers();
  const t = setup();
  const a = t.withIdentity(identity("A"));
  await a.action(api.events.track, { name: "export_used" });
  await a.action(api.runs.contact, { email: "", message: "Hello" });
  await a.action(api.pairing.start, { label: "Device" });
  const value = (name: string, key: string) => t.run(ctx => ctx.runQuery(components.rateLimiter.lib.getValue, { name, key, config }));
  for (const name of names) expect((await value(name, "issuer|A")).ts).not.toBe(0);
  const expiresAt = (await t.run(ctx => ctx.db.query("quotaKeys").first()))!.expiresAt;
  vi.setSystemTime(expiresAt - 1000);
  await t.withIdentity(identity("B")).action(api.events.track, { name: "export_used" });
  vi.setSystemTime(expiresAt + 1000);
  await t.mutation(internal.quotaKeys.prune, {});
  expect((await t.run(ctx => ctx.db.query("quotaKeys").collect())).map(r => r.key)).toEqual(["issuer|B"]);
  for (const name of names) expect((await value(name, "issuer|A")).ts).toBe(0);
  expect((await value("eventCaller", "issuer|B")).ts).not.toBe(0);
});

test("quota cleanup drains multiple bounded batches", async () => {
  vi.useFakeTimers();
  const t = setup();
  for (let i = 0; i < 25; i++) await t.withIdentity(identity(`user-${i}`)).action(api.events.track, { name: "export_used" });
  const expiry = Math.max(...(await t.run(ctx => ctx.db.query("quotaKeys").collect())).map(r => r.expiresAt));
  vi.setSystemTime(expiry + 1000);
  await t.mutation(internal.quotaKeys.prune, {});
  expect(await t.run(ctx => ctx.db.query("quotaKeys").collect())).toHaveLength(15);
  await t.finishAllScheduledFunctions(vi.runAllTimers);
  expect(await t.run(ctx => ctx.db.query("quotaKeys").collect())).toEqual([]);
});

test("recent traffic renews the key before cleanup without resetting its quota", async () => {
  vi.useFakeTimers();
  const t = setup(), a = t.withIdentity(identity("A"));
  await a.action(api.events.track, { name: "export_used" });
  vi.advanceTimersByTime(QUOTA_IDLE_MS - 1);
  await a.action(api.events.track, { name: "export_used" });
  vi.advanceTimersByTime(2);
  await t.mutation(internal.quotaKeys.prune, {});
  expect(await t.run(ctx => ctx.db.query("quotaKeys").collect())).toHaveLength(1);
  const value = await t.run(ctx => ctx.runQuery(components.rateLimiter.lib.getValue, { name: "eventCaller", key: "issuer|A", config }));
  expect(value.value).toBeLessThan(10);
});
