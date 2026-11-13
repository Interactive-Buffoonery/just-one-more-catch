import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { api, internal } from "./_generated/api";
import { RETENTION_MS } from "./events";
import { setup } from "./setup.testing";

beforeEach(() => {
  vi.stubEnv("TURNSTILE_SECRET_KEY", "test-secret");
  vi.stubEnv("TURNSTILE_HOSTNAMES", "justonemorecatch.app");
  vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({
    success: true, hostname: "justonemorecatch.app", action: "analytics", cdata: "a".repeat(32),
  }))));
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

test("anonymous bursts are bounded and cannot spend signed-in telemetry capacity", async () => {
  vi.useFakeTimers();
  const t = setup();
  for (let i = 0; i < 30; i++) await t.action(api.events.track, { token: "proof", name: "guest_run_created", version: `forged-${i}` });
  const guest = await t.run(ctx => ctx.db.query("events").collect());
  expect(guest).toHaveLength(10);
  expect(guest.every(e => e.version === undefined && e.owner === undefined)).toBe(true);
  await t.withIdentity({ subject: "A", sid: "sess_A" }).action(api.events.track, { name: "export_used" });
  expect(await t.run(ctx => ctx.db.query("events").collect())).toHaveLength(11);
  await t.action(api.events.track, { name: "contact_sent" });
  expect(await t.run(ctx => ctx.db.query("events").withIndex("by_name", q => q.eq("name", "contact_sent")).collect())).toEqual([]);
});

test("repeated anonymous bursts stop at the daily cap and replenish next day", async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-11-13T00:00:00Z"));
  const t = setup();
  for (let burst = 0; burst < 12; burst++) {
    for (let i = 0; i < 10; i++) await t.action(api.events.track, { name: "export_used", token: "proof" });
    vi.advanceTimersByTime(60_000);
  }
  expect(await t.run(ctx => ctx.db.query("events").collect())).toHaveLength(100);
  vi.advanceTimersByTime(864e5);
  await t.action(api.events.track, { name: "export_used", token: "proof" });
  expect(await t.run(ctx => ctx.db.query("events").collect())).toHaveLength(101);
});

test("retention drains expired batches and preserves recent events", async () => {
  vi.useFakeTimers();
  const now = Date.now(), t = setup();
  await t.run(async ctx => {
    for (let i = 0; i < 205; i++) await ctx.db.insert("events", { name: "export_used" });
  });
  vi.setSystemTime(now + 1000);
  await t.run(ctx => ctx.db.insert("events", { name: "guest_run_created" }));
  vi.setSystemTime(now + RETENTION_MS + 1);
  await t.mutation(internal.events.prune, {});
  expect(await t.run(ctx => ctx.db.query("events").collect())).toHaveLength(106);
  await t.finishAllScheduledFunctions(vi.runAllTimers);
  const remaining = await t.run(ctx => ctx.db.query("events").collect());
  expect(remaining).toHaveLength(1);
  expect(remaining[0].name).toBe("guest_run_created");
});

test("retention keeps records at the exact 90-day cutoff", async () => {
  vi.useFakeTimers();
  const now = Date.now(), t = setup();
  await t.run(ctx => ctx.db.insert("events", { name: "export_used" }));
  vi.setSystemTime(now + RETENTION_MS);
  await t.mutation(internal.events.prune, {});
  expect(await t.run(ctx => ctx.db.query("events").collect())).toHaveLength(1);
});

test("one signed-in account cannot spend another account's daily allowance", async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-11-13T00:00:00Z"));
  const t = setup();
  const a = t.withIdentity({ subject: "A", sid: "sess_A" });
  const b = t.withIdentity({ subject: "B", sid: "sess_B" });
  for (let burst = 0; burst < 10; burst++) {
    for (let i = 0; i < 10; i++) await a.action(api.events.track, { name: "export_used" });
    vi.advanceTimersByTime(60_000);
  }
  await a.action(api.events.track, { name: "export_used" });
  await b.action(api.events.track, { name: "export_used" });
  const events = await t.run(ctx => ctx.db.query("events").collect());
  expect(events).toHaveLength(101);
  expect(events[100].owner).not.toBe(events[0].owner);
});

test("anonymous analytics requires proof bound to its action before writing", async () => {
  const t = setup();
  await expect(t.action(api.events.track, { name: "guest_run_created" })).rejects.toThrow("Verification unavailable");
  vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({
    success: true, hostname: "justonemorecatch.app", action: "contact", cdata: "a".repeat(32),
  }))));
  await expect(t.action(api.events.track, { name: "guest_run_created", token: "contact-proof" })).rejects.toThrow("Verification failed");
  expect(await t.run(ctx => ctx.db.query("events").collect())).toEqual([]);
});
