/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";
import { MAX_RUNS } from "../shared/limits";
import { IMPORT_SPECIES_LIMITS, importCaughtState } from "../shared/save-import";

const modules = import.meta.glob("./**/*.ts");
const importId = "d60f37e5-bef7-4e53-8726-1c964120c460";
const identity = { subject: "first-user", tokenIdentifier: "issuer|first-user" };

describe("caught-list imports", () => {
  it("creates one owned playthrough and its initial state together", async () => {
    const t = convexTest(schema, modules);
    const account = t.withIdentity(identity);
    const existing = await account.mutation(api.runs.create, { version: "crystal" });
    await account.mutation(api.runs.save, { id: existing, state: '{"caught":[1],"badges":["Zephyr"],"notes":"Keep me"}' });

    const id = await account.mutation(api.runs.importCaught, { importId, version: "heartgold", caught: [493, 25, 1] });
    expect(JSON.parse(await account.query(api.runs.get, { id }))).toEqual({ caught: [1, 25, 493] });
    expect(await account.query(api.runs.list, {})).toEqual(expect.arrayContaining([
      expect.objectContaining({ id, version: "heartgold", summary: { badges: [], caught: 3, party: [] } }),
    ]));
    expect(JSON.parse(await account.query(api.runs.get, { id: existing }))).toEqual({ caught: [1], badges: ["Zephyr"], notes: "Keep me" });
    await t.run(async (ctx) => {
      const run = await ctx.db.get(ctx.db.normalizeId("runs", id)!);
      expect(run?.owner).toBe(identity.tokenIdentifier);
      expect(run?.startedAt).toBeUndefined();
      expect(await ctx.db.query("states").withIndex("by_run", (q) => q.eq("run", run!._id)).unique()).toMatchObject({ state: '{"caught":[1,25,493]}' });
    });
  });

  it("creates the chosen start date atomically and binds retries to it", async () => {
    const t = convexTest(schema, modules);
    const account = t.withIdentity(identity);
    const startedAt = new Date(2010, 2, 14).getTime();
    const input = { importId, version: "heartgold", caught: [25], startedAt };
    const id = await account.mutation(api.runs.importCaught, input);
    expect((await account.query(api.runs.list, {}))[0].createdAt).toBe(new Date(startedAt).toISOString());
    expect(await account.mutation(api.runs.importCaught, input)).toBe(id);
    for (const changed of [undefined, startedAt + 864e5])
      await expect(account.mutation(api.runs.importCaught, { ...input, startedAt: changed })).rejects.toThrow("Import ID already used");
    expect(await account.query(api.runs.list, {})).toHaveLength(1);
  });

  it.each([NaN, Infinity, -1, 1.5, Date.now() + 3 * 864e5])("rejects invalid start dates before creating anything: %s", async (startedAt) => {
    const t = convexTest(schema, modules);
    const account = t.withIdentity(identity);
    await expect(account.mutation(api.runs.importCaught, { importId, version: "heartgold", caught: [25], startedAt })).rejects.toThrow("Pick a past date");
    expect(await account.query(api.runs.list, {})).toEqual([]);
    await t.run(async ctx => { expect(await ctx.db.query("states").take(1)).toEqual([]); });
  });

  it("requires authentication and enforces ownership after import", async () => {
    const t = convexTest(schema, modules);
    await expect(t.mutation(api.runs.importCaught, { importId, version: "crystal", caught: [1] })).rejects.toThrow("Sign in first");
    const id = await t.withIdentity(identity).mutation(api.runs.importCaught, { importId, version: "crystal", caught: [] });
    const other = t.withIdentity({ subject: "other-user" });
    expect(await other.query(api.runs.list, {})).toEqual([]);
    await expect(other.query(api.runs.get, { id })).rejects.toThrow("Not your playthrough");
    await expect(other.mutation(api.runs.save, { id, state: "{}" })).rejects.toThrow("Not your playthrough");
  });

  it("returns the same playthrough for a retry, including at the run limit", async () => {
    const t = convexTest(schema, modules);
    const account = t.withIdentity(identity);
    const id = await account.mutation(api.runs.importCaught, { importId, version: "heartgold", caught: [25, 1] });
    expect(await account.mutation(api.runs.importCaught, { importId, version: "heartgold", caught: [1, 25] })).toBe(id);
    expect(await account.query(api.runs.list, {})).toHaveLength(1);
    await t.run(async (ctx) => {
      for (let i = 1; i < MAX_RUNS; i++)
        await ctx.db.insert("runs", { owner: identity.tokenIdentifier, version: "crystal", summary: { badges: [], caught: 0, party: [] } });
    });
    expect(await account.mutation(api.runs.importCaught, { importId, version: "heartgold", caught: [25, 1] })).toBe(id);
    expect(await account.query(api.runs.list, {})).toHaveLength(MAX_RUNS);
    await t.run(async (ctx) => {
      expect(await ctx.db.query("states").take(2)).toHaveLength(1);
    });
  });

  it("keeps the same import ID independent between owners", async () => {
    const t = convexTest(schema, modules);
    const input = { importId, version: "crystal", caught: [25] };
    const first = t.withIdentity(identity);
    const second = t.withIdentity({ subject: "second-user" });
    const firstId = await first.mutation(api.runs.importCaught, input);
    const secondId = await second.mutation(api.runs.importCaught, input);
    expect(firstId).not.toBe(secondId);
    expect(await first.query(api.runs.list, {})).toHaveLength(1);
    expect(await second.query(api.runs.list, {})).toHaveLength(1);
  });

  it("rejects a reused key with a different payload", async () => {
    const t = convexTest(schema, modules);
    const account = t.withIdentity(identity);
    const id = await account.mutation(api.runs.importCaught, { importId, version: "heartgold", caught: [25] });
    await expect(account.mutation(api.runs.importCaught, { importId, version: "heartgold", caught: [26] })).rejects.toThrow("Import ID already used");
    await expect(account.mutation(api.runs.importCaught, { importId, version: "soulsilver", caught: [25] })).rejects.toThrow("Import ID already used");
    expect(await account.query(api.runs.list, {})).toHaveLength(1);
    expect(await account.query(api.runs.get, { id })).toBe('{"caught":[25]}');
  });

  it("rejects malformed import IDs without writing a run", async () => {
    const t = convexTest(schema, modules);
    const account = t.withIdentity(identity);
    await expect(account.mutation(api.runs.importCaught, { importId: "not-an-id", version: "crystal", caught: [25] })).rejects.toThrow("Invalid import ID");
    expect(await account.query(api.runs.list, {})).toEqual([]);
  });

  it.each([
    { version: "unknown", caught: [1] },
    { version: "crystal", caught: [252] },
    { version: "heartgold", caught: [0] },
    { version: "heartgold", caught: [-1] },
    { version: "heartgold", caught: [1.5] },
    { version: "heartgold", caught: [NaN] },
    { version: "heartgold", caught: [Infinity] },
    { version: "heartgold", caught: [25, 25] },
  ])("rejects invalid input without leaving a playthrough: %j", async (input) => {
    const t = convexTest(schema, modules);
    const account = t.withIdentity(identity);
    await expect(account.mutation(api.runs.importCaught, { ...input, importId })).rejects.toThrow();
    expect(await account.query(api.runs.list, {})).toEqual([]);
    await t.run(async (ctx) => {
      expect(await ctx.db.query("states").take(1)).toEqual([]);
    });
  });

  it("rejects the account limit without creating an initial state", async () => {
    const t = convexTest(schema, modules);
    await t.run(async (ctx) => {
      for (let i = 0; i < MAX_RUNS; i++)
        await ctx.db.insert("runs", { owner: identity.tokenIdentifier, version: "crystal", summary: { badges: [], caught: 0, party: [] } });
    });
    const account = t.withIdentity(identity);
    await expect(account.mutation(api.runs.importCaught, { importId, version: "crystal", caught: [25] })).rejects.toThrow("Too many playthroughs");
    expect(await account.query(api.runs.list, {})).toHaveLength(MAX_RUNS);
    await t.run(async (ctx) => {
      expect(await ctx.db.query("states").take(1)).toEqual([]);
    });
    const other = t.withIdentity({ subject: "other-user" });
    await expect(other.mutation(api.runs.importCaught, { importId, version: "crystal", caught: [25] })).resolves.toEqual(expect.any(String));
  });

  it("accepts an empty caught list and every current game's boundary", () => {
    for (const [version, limit] of Object.entries(IMPORT_SPECIES_LIMITS)) {
      expect(JSON.parse(importCaughtState(version, []))).toEqual({ caught: [] });
      expect(JSON.parse(importCaughtState(version, [limit, 1]))).toEqual({ caught: [1, limit] });
      expect(() => importCaughtState(version, [limit + 1])).toThrow("Invalid caught Pokémon");
    }
  });
});
