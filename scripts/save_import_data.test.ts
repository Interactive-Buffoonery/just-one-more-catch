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

test("Emerald imports National Dex flags separately from RS", async () => {
  const data = await VERSIONS.emerald.pack.load();
  const s = snapshot(["E"]);
  expect(importVersions(s)).toEqual(["emerald"]);
  s.pokedex.caughtSpecies = [386, 252, 25, 252, 387];
  expect(caughtForPack(s, "emerald", data)).toEqual({ caught: [25, 252, 386], skipped: 1, partial: false });
  s.pokedex.caughtSpecies = [];
  expect(caughtForPack(s, "emerald", data).caught).toEqual([]);
  expect(importVersions(snapshot(["S", "R"]))).toEqual(["sapphire", "ruby"]);
  expect(importVersions(snapshot(["RS"]))).toEqual([]);
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

test.each(["ruby", "sapphire"] as const)("%s imports bounded National Dex history", async version => {
  const data = await VERSIONS[version].pack.load();
  const s = snapshot(["S", "R"]);
  s.pokedex.caughtSpecies = [386, 252, 25, 252, 387];
  expect(caughtForPack(s, version, data)).toEqual({ caught: [25, 252, 386], skipped: 1, partial: false });
  s.pokedex.caughtSpecies = [];
  expect(caughtForPack(s, version, data).caught).toEqual([]);
  expect(() => caughtForPack(snapshot(["E"]), version, data)).toThrow();
});

test.each([["B", "black"], ["W", "white"]] as const)("%s imports only its original Unova title", async (identity, version) => {
  const data = await VERSIONS[version].pack.load();
  const s = snapshot([identity]);
  expect(importVersions(s)).toEqual([version]);
  s.pokedex.caughtSpecies = [649, 495, 25, 495, 650];
  expect(caughtForPack(s, version, data)).toEqual({ caught: [25, 495, 649], skipped: 1, partial: false });
  s.pokedex.caughtSpecies = [];
  expect(caughtForPack(s, version, data).caught).toEqual([]);
  for (const other of ["B2", "W2", "BW", "B2W2", identity === "B" ? "W" : "B"]) {
    expect(() => caughtForPack(snapshot([other]), version, data)).toThrow();
  }
});

test("sequel identities never map to original Unova games", () => {
  expect(importVersions(snapshot(["B2"]))).toEqual(["black-2"]);
  expect(importVersions(snapshot(["W2"]))).toEqual(["white-2"]);
  expect(importVersions(snapshot(["BW", "B2W2"]))).toEqual([]);
});

test.each([["X", "x"], ["Y", "y"]] as const)("%s imports only its Kalos title", async (identity, version) => {
  const data = await VERSIONS[version].pack.load();
  const s = snapshot([identity]);
  expect(importVersions(s)).toEqual([version]);
  s.pokedex.caughtSpecies = [721, 650, 25, 650, 722];
  expect(caughtForPack(s, version, data)).toEqual({ caught: [25, 650, 721], skipped: 1, partial: false });
  s.pokedex.caughtSpecies = [];
  expect(caughtForPack(s, version, data).caught).toEqual([]);
  for (const other of ["OR", "AS", "XY", identity === "X" ? "Y" : "X"]) {
    expect(() => caughtForPack(snapshot([other]), version, data)).toThrow();
  }
});

test("other Gen VI identities never map to Kalos games", () => {
  expect(importVersions(snapshot(["OR", "AS", "ORAS", "XY"]))).toEqual([]);
});

test.each(["diamond", "pearl"] as const)("%s imports paired DP National Dex history", async version => {
  const data = await VERSIONS[version].pack.load();
  const s = snapshot(["D", "P"]);
  expect(importVersions(s)).toEqual(["diamond", "pearl"]);
  s.pokedex.caughtSpecies = [493, 387, 25, 387, 494];
  expect(caughtForPack(s, version, data)).toEqual({ caught: [25, 387, 493], skipped: 1, partial: false });
  s.pokedex.caughtSpecies = [];
  expect(caughtForPack(s, version, data).caught).toEqual([]);
  for (const other of ["Pt", "HG", "SS", "HGSS", "DP"]) {
    expect(() => caughtForPack(snapshot([other]), version, data)).toThrow();
  }
});

test("Gen IV identities keep DP, Platinum and HGSS separate", async () => {
  expect(importVersions(snapshot(["Pt"]))).toEqual(["platinum"]);
  expect(importVersions(snapshot(["DP", "HGSS"]))).toEqual([]);
  expect(importVersions(snapshot(["D"]))).toEqual(["diamond"]);
  expect(importVersions(snapshot(["P"]))).toEqual(["pearl"]);
  expect(importVersions(snapshot(["HG", "SS"]))).toEqual(["heartgold", "soulsilver"]);
  for (const version of ["heartgold", "soulsilver"] as const) {
    const data = await VERSIONS[version].pack.load();
    expect(() => caughtForPack(snapshot(["D", "P"]), version, data)).toThrow();
  }
});

test.each([["B2", "black-2"], ["W2", "white-2"]] as const)("%s imports only its sequel Unova title", async (identity, version) => {
  const data = await VERSIONS[version].pack.load();
  const s = snapshot([identity]);
  expect(importVersions(s)).toEqual([version]);
  s.pokedex.caughtSpecies = [649, 495, 25, 495, 650];
  expect(caughtForPack(s, version, data)).toEqual({ caught: [25, 495, 649], skipped: 1, partial: false });
  s.pokedex.caughtSpecies = [];
  expect(caughtForPack(s, version, data).caught).toEqual([]);
  expect(IMPORT_SPECIES_LIMITS[version]).toBe(VERSIONS[version].pack.national);
  for (const other of ["B", "W", "BW", "B2W2", identity === "B2" ? "W2" : "B2"]) {
    expect(() => caughtForPack(snapshot([other]), version, data)).toThrow();
  }
});

test("Platinum imports only its own Gen IV National Dex history", async () => {
  const data = await VERSIONS.platinum.pack.load();
  const s = snapshot(["Pt"]);
  expect(importVersions(s)).toEqual(["platinum"]);
  expect(IMPORT_SPECIES_LIMITS.platinum).toBe(493);
  expect(IMPORT_SPECIES_LIMITS.platinum).toBe(VERSIONS.platinum.pack.national);
  s.pokedex.caughtSpecies = [493, 387, 25, 387, 494];
  expect(caughtForPack(s, "platinum", data)).toEqual({ caught: [25, 387, 493], skipped: 1, partial: false });
  s.pokedex.caughtSpecies = [];
  expect(caughtForPack(s, "platinum", data).caught).toEqual([]);
  for (const other of ["D", "P", "DP", "HG", "SS", "HGSS"]) {
    expect(importVersions(snapshot([other]))).not.toContain("platinum");
    expect(() => caughtForPack(snapshot([other]), "platinum", data)).toThrow();
  }
  for (const version of importVersions(snapshot(["D", "P", "HG", "SS"]))) {
    const otherData = await VERSIONS[version].pack.load();
    expect(() => caughtForPack(s, version, otherData)).toThrow();
  }
});
