import { VERSION_IDS, type VersionId } from "./versions";

export const IMPORT_SPECIES_LIMITS: Record<VersionId, number> = {
  x: 721,
  y: 721,
  "black-2": 649,
  "white-2": 649,
  platinum: 493,
  red: 151,
  blue: 151,
  yellow: 151,
  gold: 251,
  silver: 251,
  crystal: 251,
  ruby: 386,
  sapphire: 386,
  emerald: 386,
  firered: 386,
  leafgreen: 386,
  diamond: 493,
  pearl: 493,
  heartgold: 493,
  soulsilver: 493,
  black: 649,
  white: 649,
  ultrasun: 807,
  ultramoon: 807,
  "firered-switch": 386,
  "leafgreen-switch": 386,
};

export function validateImportId(importId: string): void {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(importId))
    throw new Error("Invalid import ID");
}

export function validateImportStart(startedAt: number | undefined): void {
  if (startedAt !== undefined && (!Number.isSafeInteger(startedAt) || startedAt < 0 || startedAt > Date.now() + 864e5))
    throw new Error("Pick a past date");
}

export function importCaughtState(version: string, caught: readonly number[]): string {
  if (!(VERSION_IDS as readonly string[]).includes(version)) throw new Error("Unknown game");
  const limit = IMPORT_SPECIES_LIMITS[version as VersionId];
  if (
    caught.length > limit ||
    caught.some((n) => !Number.isInteger(n) || n < 1 || n > limit) ||
    new Set(caught).size !== caught.length
  ) throw new Error("Invalid caught Pokémon");
  return JSON.stringify({ caught: [...caught].sort((a, b) => a - b) });
}
