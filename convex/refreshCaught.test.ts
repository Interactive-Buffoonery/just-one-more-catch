/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { expect, it } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";
const modules = import.meta.glob("./**/*.ts");
const link = { salt: "a".repeat(32), fingerprint: "b".repeat(64), playSeconds: 100 };
it("refreshes owned runs atomically with additive state and link history", async () => {
  const t = convexTest(schema, modules);
  const a = t.withIdentity({ sid: "sess_a", subject: "a", tokenIdentifier: "issuer|a" });
  const b = t.withIdentity({ sid: "sess_b", subject: "b", tokenIdentifier: "issuer|b" });
  const id = await a.mutation(api.runs.create, { version: "red", link });
  await a.mutation(api.runs.save, { id, state: '{"caught":[1],"notes":"keep"}' });
  await expect(b.mutation(api.runs.refreshCaught, { id, caught: [2] })).rejects.toThrow();
  await expect(a.mutation(api.runs.refreshCaught, { id, caught: [152] })).rejects.toThrow();
  expect(await a.mutation(api.runs.refreshCaught, { id, caught: [25], link: { ...link, playSeconds: 50 }, startedAt: 1000 })).toEqual({ added: [25] });
  expect(await a.mutation(api.runs.refreshCaught, { id, caught: [25] })).toEqual({ added: [] });
  const before = await a.query(api.runs.get, { id });
  await expect(a.mutation(api.runs.refreshCaught, { id, caught: [2], link: { ...link, fingerprint: "c".repeat(64) } })).rejects.toThrow("Different save");
  expect(await a.query(api.runs.get, { id })).toBe(before);
  expect(JSON.parse(before)).toEqual({ caught: [1,25], notes: "keep" });
  expect(await b.query(api.runs.saveLinks, { version: "red" })).toEqual([]);
  expect(await t.query(api.runs.saveLinks, { version: "red" })).toEqual([]);
  expect(await a.query(api.runs.saveLinks, { version: "blue" })).toEqual([]);
  expect(await a.query(api.runs.saveLinks, { version: "red" })).toEqual([{ id, ...link }]);
  expect((await a.query(api.runs.list, {}))[0]).toMatchObject({ summary: { caught: 2 }, createdAt: new Date(1000).toISOString() });
  await t.run(async ctx => {
    const row = await ctx.db.get(ctx.db.normalizeId("runs", id)!);
    expect(row?.updatedAt).toBeTypeOf("number");
    expect(row?.startedAt).toBe(1000);
  });
  await a.mutation(api.runs.refreshCaught, { id, caught: [], link: { ...link, playSeconds: 200 } });
  expect(await a.query(api.runs.saveLinks, { version: "red" })).toEqual([{ id, ...link, playSeconds: 200 }]);
  const imported = await a.mutation(api.runs.importCaught, { version: "blue", caught: [], importId: "d60f37e5-bef7-4e53-8726-1c964120c460", link });
  expect(await a.query(api.runs.saveLinks, { version: "blue" })).toEqual([{ id: imported, ...link }]);
});
