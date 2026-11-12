import { expect, test } from "vitest";
import { importVersions, caughtForPack } from "../client/save-import";
import { VERSIONS } from "../client/packs";
import { IMPORT_SPECIES_LIMITS } from "../shared/save-import";

type Snapshot = Parameters<typeof importVersions>[0];
const snapshot = (versions = ["HG"]): Snapshot => ({
  status: "ok", schemaVersion: 1,
  game: { formatId: "pkhex", name: "HeartGold", version: "HG", versions },
  pokedex: { status: "available", coverage: "complete", speciesNamespace: "national-dex", caughtSpecies: [1, 25, 493], warnings: [] },
});

test("official identity maps explicitly and asks for platform choices", () => {
  expect(importVersions(snapshot(["FR", "LG"]))).toEqual(["firered", "firered-switch", "leafgreen", "leafgreen-switch"]);
  expect(importVersions(snapshot(["HG", "SS"]))).toEqual(["heartgold", "soulsilver"]);
  expect(importVersions(snapshot(["SL"]))).toEqual([]);
  const hack = snapshot(); hack.game.formatId = "radical-red";
  expect(importVersions(hack)).toEqual([]);
});

test("game caps match the pack data", () => {
  for (const [id, limit] of Object.entries(IMPORT_SPECIES_LIMITS))
    expect(VERSIONS[id as keyof typeof VERSIONS].pack.national).toBe(limit);
});

test("Emerald imports National Dex flags and keeps other Hoenn games unsupported", async () => {
  const data = await VERSIONS.emerald.pack.load();
  const s = snapshot(["E"]);
  expect(importVersions(s)).toEqual(["emerald"]);
  s.pokedex.caughtSpecies = [386, 252, 25, 252, 387];
  expect(caughtForPack(s, "emerald", data)).toEqual({ caught: [25, 252, 386], skipped: 1, partial: false });
  s.pokedex.caughtSpecies = [];
  expect(caughtForPack(s, "emerald", data).caught).toEqual([]);
  expect(importVersions(snapshot(["R", "S", "RS"]))).toEqual([]);
  expect(() => caughtForPack(snapshot(["R", "S"]), "emerald", data)).toThrow();
});

test("caught IDs are canonical, bounded and intersect the actual pack", async () => {
  const data = await VERSIONS.heartgold.pack.load();
  const s = snapshot();
  s.pokedex.caughtSpecies = [493, 1, 25, 25, 999];
  expect(caughtForPack(s, "heartgold", data)).toEqual({ caught: [1, 25, 493], skipped: 1, partial: false });
  s.pokedex.caughtSpecies = [];
  expect(caughtForPack(s, "heartgold", data).caught).toEqual([]);
  s.pokedex.coverage = "partial";
  expect(caughtForPack(s, "heartgold", data).partial).toBe(true);
  s.pokedex.speciesNamespace = "custom-hack";
  expect(() => caughtForPack(s, "heartgold", data)).toThrow("Unsupported Pokédex");
  s.pokedex.speciesNamespace = "national-dex";
  s.pokedex.status = "unavailable";
  expect(() => caughtForPack(s, "heartgold", data)).toThrow();
});

test("wrong games, future schemas and invalid IDs never become a preview", async () => {
  const data = await VERSIONS.heartgold.pack.load();
  for (const n of [0, -1, 1.5, NaN, Infinity, 2001]) {
    const s = snapshot(); s.pokedex.caughtSpecies = [n];
    expect(() => caughtForPack(s, "heartgold", data)).toThrow();
  }
  const s = snapshot(); s.schemaVersion = 2;
  expect(() => caughtForPack(s, "heartgold", data)).toThrow();
  expect(() => caughtForPack(snapshot(["C"]), "heartgold", data)).toThrow();
});

test("GB identities retain paired choices and exclude unsupported Green", async () => {
  expect(importVersions(snapshot(["RD", "GN", "BU"]))).toEqual(["red", "blue"]);
  expect(importVersions(snapshot(["GD", "SI"]))).toEqual(["gold", "silver"]);
  expect(importVersions(snapshot(["GN"]))).toEqual([]);
  for (const [identity, version, limit] of [
    ["RD", "red", 151], ["BU", "blue", 151], ["YW", "yellow", 151],
    ["GD", "gold", 251], ["SI", "silver", 251],
  ] as const) {
    const s = snapshot([identity]);
    expect(importVersions(s)).toEqual([version]);
    const data = await VERSIONS[version].pack.load();
    s.pokedex.caughtSpecies = [25, 133, limit, limit + 1];
    expect(caughtForPack(s, version, data)).toEqual({ caught: [25, 133, limit], skipped: 1, partial: false });
    s.pokedex.caughtSpecies = [];
    expect(caughtForPack(s, version, data).caught).toEqual([]);
  }
});
