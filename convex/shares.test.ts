import { afterEach, expect, test, vi } from "vitest";
import http from "./http";
import { read as readProjection } from "./shareReader";
import type { ActionCtx, QueryCtx } from "./_generated/server";
import { api, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { setup } from "./setup.testing";
import { projectionOf } from "../shared/share-projection";

const identity = (subject: string) => ({ subject, tokenIdentifier: `issuer|${subject}`, sid: `sess_${subject}` });
const projection = projectionOf('{"caught":[25],"badges":["Zephyr"]}', "crystal");
const state = JSON.stringify({ caught: [25], badges: ["Zephyr"], notes: "private", mons: [{ n: 25, nick: "private", shiny: true }] });
const read = (t: ReturnType<typeof setup>, token: string) => t.fetch("/share", { headers: { "X-Share-Token": token } });
async function fixture() {
  const t = setup(), owner = t.withIdentity(identity("A"));
  const runId = await owner.mutation(api.runs.create, { version: "crystal" }) as Id<"runs">;
  await owner.mutation(api.runs.save, { id: runId, state });
  return { t, owner, runId, input: { runId, projection, expectedRevision: 0 } };
}
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllEnvs(); });

test("sharing is opt-in and all owner operations reject other accounts and guests", async () => {
  const { t, owner, runId, input } = await fixture();
  expect(await owner.query(api.shares.status, { runId })).toEqual({ token: null, projection: null, revision: 0 });
  expect(await t.run(ctx => ctx.db.query("shares").take(1))).toEqual([]);
  for (const caller of [t, t.withIdentity(identity("B"))]) {
    await expect(caller.query(api.shares.status, { runId })).rejects.toThrow();
    await expect(caller.action(api.shares.publish, input)).rejects.toThrow();
    await expect(caller.action(api.shares.replace, input)).rejects.toThrow();
    await expect(caller.mutation(api.shares.stop, { runId, expectedRevision: 0 })).rejects.toThrow();
  }
  expect(await t.run(ctx => ctx.db.query("shares").take(1))).toEqual([]);
});

test("a delayed create cannot undo stop and stale stop is a conflict", async () => {
  const { owner, runId, input } = await fixture();
  expect(await owner.mutation(api.shares.stop, { runId, expectedRevision: 0 })).toEqual({ token: null, projection: null, revision: 1 });
  await expect(owner.action(api.shares.publish, input)).rejects.toThrow("SHARE_REVISION_CONFLICT");
  await expect(owner.mutation(api.shares.stop, { runId, expectedRevision: 0 })).rejects.toThrow("SHARE_REVISION_CONFLICT");
  expect((await owner.action(api.shares.publish, { ...input, expectedRevision: 1 })).revision).toBe(2);
});

test("publish recomputes the preview and gives the client a distinct mismatch code", async () => {
  const { t, owner, input } = await fixture();
  await expect(owner.action(api.shares.publish, { ...input, projection: { ...projection, caught: [] } })).rejects.toThrow("SHARE_PREVIEW_MISMATCH");
  expect(await t.run(ctx => ctx.db.query("shares").take(1))).toEqual([]);
  const first = await owner.action(api.shares.publish, input);
  await owner.mutation(api.runs.save, { id: input.runId, state: '{"caught":[1,25]}' });
  await expect(owner.action(api.shares.publish, { ...input, expectedRevision: 1 })).rejects.toThrow("SHARE_PREVIEW_MISMATCH");
  expect(await (await read(t, first.token!)).json()).toEqual(projection);
  const fresh = projectionOf('{"caught":[1,25]}', "crystal");
  const updated = await owner.action(api.shares.publish, { ...input, projection: fresh, expectedRevision: 1 });
  expect(updated).toEqual({ token: first.token, projection: fresh, revision: 2 });
  expect(await (await read(t, first.token!)).json()).toEqual(fresh);
});

test("replace rotates the bearer token atomically and stop removes it", async () => {
  const { t, owner, runId, input } = await fixture();
  const first = await owner.action(api.shares.publish, input);
  expect(first.token).toMatch(/^[A-Za-z0-9_-]{43}$/);
  expect(await owner.query(api.shares.status, { runId })).toEqual(first);
  await owner.mutation(api.runs.save, { id: runId, state: '{"caught":[1,25]}' });
  const second = await owner.action(api.shares.replace, { ...input, expectedRevision: 1 });
  expect(second.token).not.toBe(first.token);
  expect(second.revision).toBe(2);
  expect((await read(t, first.token!)).status).toBe(404);
  expect(await (await read(t, second.token!)).json()).toEqual(projection);
  expect(await t.run(ctx => ctx.db.query("shares").take(2))).toHaveLength(1);
  await expect(owner.action(api.shares.replace, { ...input, expectedRevision: 1 })).rejects.toThrow("SHARE_REVISION_CONFLICT");
  await owner.mutation(api.shares.stop, { runId, expectedRevision: 2 });
  expect((await read(t, second.token!)).status).toBe(404);
});

test("dropRun removes its share and state together", async () => {
  const { t, owner, runId, input } = await fixture();
  const shared = await owner.action(api.shares.publish, input);
  await owner.mutation(api.runs.remove, { id: runId });
  expect((await read(t, shared.token!)).status).toBe(404);
  await t.run(async ctx => {
    expect(await ctx.db.get(runId)).toBeNull();
    expect(await ctx.db.query("shares").take(1)).toEqual([]);
    expect(await ctx.db.query("states").take(1)).toEqual([]);
  });
});

test("the deleting marker blocks reads and publishes before cleanup", async () => {
  const { t, owner, input } = await fixture();
  const shared = await owner.action(api.shares.publish, input);
  await t.run(async ctx => {
    const account = await ctx.db.query("accounts").withIndex("by_owner", q => q.eq("owner", identity("A").tokenIdentifier)).unique();
    await ctx.db.patch(account!._id, { deleting: true });
  });
  expect((await read(t, shared.token!)).status).toBe(404);
  for (const fn of [api.shares.publish, api.shares.replace])
    await expect(owner.action(fn, { ...input, expectedRevision: 1 })).rejects.toThrow("Account is being deleted");
  await expect(owner.mutation(internal.shares.commit, { ...input, token: "b".repeat(43), replace: false, expectedRevision: 1 })).rejects.toThrow("Account is being deleted");
  await expect(owner.mutation(api.runs.create, { version: "crystal" })).rejects.toThrow("Account is being deleted");
});

test("app deletion marks the account and drains shares in run batches", async () => {
  vi.useFakeTimers();
  const { t, owner, input } = await fixture();
  const shared = await owner.action(api.shares.publish, input);
  await t.run(async ctx => {
    for (let i = 0; i < 18; i++) {
      const runId = await ctx.db.insert("runs", { owner: identity("A").tokenIdentifier, version: "crystal", summary: { badges: [], caught: 0, party: [] } });
      await ctx.db.insert("shares", { runId, owner: identity("A").tokenIdentifier, token: String(i).padStart(43, "c"), projection, createdAt: 0, updatedAt: 0 });
    }
  });
  await owner.mutation(api.runs.deleteAccount, {});
  await expect(owner.mutation(api.runs.deleteAccount, {})).resolves.toBeNull();
  expect((await read(t, shared.token!)).status).toBe(404);
  expect((await t.run(ctx => ctx.db.query("accounts").first()))?.deleting).toBe(true);
  expect(await t.run(ctx => ctx.db.query("shares").take(20))).toHaveLength(3);
  await t.finishAllScheduledFunctions(vi.runAllTimers);
  expect(await t.run(ctx => ctx.db.query("shares").take(1))).toEqual([]);
  expect(await t.run(ctx => ctx.db.query("runs").take(1))).toEqual([]);
  expect(await t.run(ctx => ctx.db.query("accounts").take(1))).toEqual([]);
});

test("the reader returns exactly projection keys with privacy headers and tight CORS", async () => {
  const { t, owner, input } = await fixture();
  const shared = await owner.action(api.shares.publish, input);
  for (const origin of ["https://justonemorecatch.app", "http://localhost:5173", "http://127.0.0.1:5174", "https://attacker.example", "http://localhost.attacker.example:5173"]) {
    const response = await t.fetch("/share", { headers: { "X-Share-Token": shared.token!, Origin: origin } });
    expect(response.status).toBe(200);
    expect(Object.keys(await response.json()).sort()).toEqual(["badges", "caught", "game", "v"]);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(response.headers.get("Referrer-Policy")).toBe("no-referrer");
    expect(response.headers.get("X-Robots-Tag")).toBe("noindex");
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(origin.includes("attacker") ? null : origin);
    const preflight = await t.fetch("/share", { method: "OPTIONS", headers: { Origin: origin, "Access-Control-Request-Headers": "X-Share-Token" } });
    expect(preflight.status).toBe(204);
    expect(preflight.headers.get("Access-Control-Allow-Headers")).toBe("X-Share-Token");
    expect(preflight.headers.get("Access-Control-Allow-Origin")).toBe(origin.includes("attacker") ? null : origin);
  }
});

test("malformed, unknown and invalid stored projections all return the same 404", async () => {
  const { t, owner, input } = await fixture();
  const shared = await owner.action(api.shares.publish, input);
  const unavailable = { error: "Unavailable" };
  for (const token of ["", "bad", "a".repeat(42), "a".repeat(44), "+".repeat(43), "a".repeat(43)]) {
    const response = await read(t, token);
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual(unavailable);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  }
  const urlToken = await t.fetch(`/share?token=${shared.token}`);
  expect(urlToken.status).toBe(404);
  await t.run(async ctx => {
    const row = (await ctx.db.query("shares").first())!;
    await ctx.db.patch(row._id, { projection: { ...projection, caught: [9999] } });
  });
  const log = vi.spyOn(console, "error").mockImplementation(() => {});
  const response = await read(t, shared.token!);
  expect(response.status).toBe(404);
  expect(await response.json()).toEqual(unavailable);
  expect(log).toHaveBeenCalledWith("Invalid share projection", expect.any(String));
  expect(JSON.stringify(log.mock.calls)).not.toContain(shared.token);
});

test("publish quotas are per owner across runs and stop remains exempt", async () => {
  const { t, owner, input } = await fixture();
  for (let i = 0; i < 10; i++) await owner.action(api.shares.publish, { ...input, expectedRevision: i });
  const another = await owner.mutation(api.runs.create, { version: "crystal" }) as Id<"runs">;
  await expect(owner.action(api.shares.publish, { runId: another, projection: projectionOf("{}", "crystal"), expectedRevision: 0 })).rejects.toThrow("SHARE_RATE_LIMITED");
  await expect(owner.action(api.shares.publish, { ...input, expectedRevision: 10 })).rejects.toThrow("SHARE_RATE_LIMITED");
  await owner.mutation(api.shares.stop, { runId: input.runId, expectedRevision: 10 });
  const other = t.withIdentity(identity("B"));
  const runId = await other.mutation(api.runs.create, { version: "crystal" }) as Id<"runs">;
  await expect(other.action(api.shares.publish, { runId, projection: projectionOf("{}", "crystal"), expectedRevision: 0 })).resolves.toHaveProperty("revision", 1);
});

test("a revoked session cannot publish even through the internal commit", async () => {
  const { t, owner, input } = await fixture();
  await t.run(ctx => ctx.db.insert("revokedSessions", { sid: identity("A").sid, expiresAt: Date.now() + 60000 }));
  await expect(owner.action(api.shares.publish, input)).rejects.toThrow("Sign in first");
  await expect(owner.mutation(internal.shares.commit, { ...input, token: "a".repeat(43), replace: false })).rejects.toThrow("Sign in first");
});

test("malformed tokens do no database work and the reader never reads states", async () => {
  const runQuery = vi.fn();
  const handler = http.lookup("/share", "GET")![0] as unknown as {
    _handler: (ctx: ActionCtx, request: Request) => Promise<Response>;
  };
  const response = await handler._handler({ runQuery } as unknown as ActionCtx,
    new Request("https://example.convex.site/share", { headers: { "X-Share-Token": "bad" } }));
  expect(response.status).toBe(404);
  expect(runQuery).not.toHaveBeenCalled();
  const { t, owner, input } = await fixture();
  const shared = await owner.action(api.shares.publish, input);
  await t.run(async ctx => {
    const queries = vi.spyOn(ctx.db, "query");
    const reader = readProjection as unknown as {
      _handler: (ctx: QueryCtx, args: { token: string }) => Promise<unknown>;
    };
    expect(await reader._handler(ctx, { token: shared.token! })).toEqual(projection);
    expect(queries.mock.calls.map(([table]) => table)).toEqual(["shares", "accounts"]);
    queries.mockRestore();
  });
});
