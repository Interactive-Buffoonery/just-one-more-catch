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
