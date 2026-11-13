import { MAX_RUN_BYTES, runBytes } from "./limits";
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
  "omega-ruby": 721,
  "alpha-sapphire": 721,
  firered: 386,
  leafgreen: 386,
  diamond: 493,
  pearl: 493,
  heartgold: 493,
  soulsilver: 493,
  black: 649,
  white: 649,
  sun: 802,
  moon: 802,
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

export type SaveLink = { salt: string; fingerprint: string; playSeconds?: number };

export function validateSaveLink(link: SaveLink): void {
  if (!link || !/^[0-9a-f]{32}$/.test(link.salt) ||
      !/^[0-9a-f]{64}$/.test(link.fingerprint) ||
      (link.playSeconds !== undefined && (!Number.isSafeInteger(link.playSeconds) || link.playSeconds < 0)))
    throw new Error("Invalid save link");
}

const hex = (bytes: Uint8Array) => Array.from(bytes, (n) => n.toString(16).padStart(2, "0")).join("");
export function newSaveSalt(): string {
  return hex(crypto.getRandomValues(new Uint8Array(16)));
}
export async function saveFingerprint(salt: string, version: string, id32: number, name: string): Promise<string> {
  return hex(new Uint8Array(await crypto.subtle.digest("SHA-256",
    new TextEncoder().encode([salt, version, id32, name].join("\n")))));
}

export function mergeSaveLink(old: SaveLink | undefined, link: SaveLink | undefined): SaveLink | undefined {
  if (link) validateSaveLink(link);
  if (!link) return old;
  if (!old) return link;
  if (old.salt !== link.salt || old.fingerprint !== link.fingerprint) throw new Error("Different save");
  const times = [old.playSeconds, link.playSeconds].filter((n): n is number => n !== undefined);
  return { salt: old.salt, fingerprint: old.fingerprint, ...(times.length ? { playSeconds: Math.max(...times) } : {}) };
}

export function mergeCaughtState(state: string, version: string, caught: readonly number[]): { state: string; added: number[] } {
  importCaughtState(version, caught);
  const parsed = JSON.parse(state);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Invalid playthrough state");
  const existing: number[] = Array.isArray(parsed.caught) ? parsed.caught.filter((n: unknown) => typeof n === "number") : [];
  const added = caught.filter((n) => !existing.includes(n)).sort((a, b) => a - b);
  parsed.caught = [...new Set([...existing, ...caught])].sort((a, b) => a - b);
  const next = JSON.stringify(parsed);
  if (runBytes(next) > MAX_RUN_BYTES) throw new Error("Playthrough is too large");
  return { state: next, added };
}
