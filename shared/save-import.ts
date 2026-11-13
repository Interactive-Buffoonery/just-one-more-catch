import { MAX_RUN_BYTES, runBytes } from "./limits.ts";
import { VERSION_IDS, type VersionId } from "./versions.ts";

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
export const DIFFERENT_SAVE = "Different save";
export const RUN_MOVED = "This playthrough moved";

export function validateSaveLink(link: SaveLink): void {
  if (!link || !/^[0-9a-f]{32}$/.test(link.salt) ||
      !/^[0-9a-f]{64}$/.test(link.fingerprint) ||
      (link.playSeconds !== undefined && (!Number.isSafeInteger(link.playSeconds) || link.playSeconds < 0)))
    throw new Error("Invalid save link");
}

export const validLink = (link?: SaveLink) => {
  try {
    if (link) validateSaveLink(link);
    return link;
  } catch {}
};

export const sameSaveLink = (a?: SaveLink, b?: SaveLink) =>
  a?.salt === b?.salt && a?.fingerprint === b?.fingerprint && a?.playSeconds === b?.playSeconds;

const hex = (bytes: Uint8Array) => Array.from(bytes, (n) => n.toString(16).padStart(2, "0")).join("");
export function newSaveSalt(): string {
  return hex(crypto.getRandomValues(new Uint8Array(16)));
}
export async function saveFingerprint(salt: string, version: string, id32: number, name: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw",
    new TextEncoder().encode([version, id32, name.normalize("NFC").trim()].join("\n")), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", iterations: 100000,
    salt: Uint8Array.from(salt.match(/../g) ?? [], (b) => parseInt(b, 16)) }, key, 256);
  return hex(new Uint8Array(bits));
}

export function mergeSaveLink(old: SaveLink | undefined, link: SaveLink | undefined): SaveLink | undefined {
  if (link) validateSaveLink(link);
  if (!link) return old;
  if (!old) return link;
  if (old.salt !== link.salt || old.fingerprint !== link.fingerprint) throw new Error(DIFFERENT_SAVE);
  const times = [old.playSeconds, link.playSeconds].filter((n): n is number => n !== undefined);
  return { salt: old.salt, fingerprint: old.fingerprint, ...(times.length ? { playSeconds: Math.max(...times) } : {}) };
}

function stateObject(state: string) {
  const parsed = JSON.parse(state);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Invalid playthrough state");
  return parsed;
}
export const caughtOf = (state: unknown): number[] => {
  const caught = (state as { caught?: unknown } | null)?.caught;
  return Array.isArray(caught) ? caught.filter((n: unknown): n is number => typeof n === "number") : [];
};

export function mergeCaughtState(state: string, version: string, caught: readonly number[]): { state: string; added: number[] } {
  importCaughtState(version, caught);
  const parsed = stateObject(state);
  const existing = caughtOf(parsed);
  const added = caught.filter((n) => !existing.includes(n)).sort((a, b) => a - b);
  parsed.caught = [...new Set([...existing, ...caught])].sort((a, b) => a - b);
  const next = JSON.stringify(parsed);
  if (runBytes(next) > MAX_RUN_BYTES) throw new Error("Playthrough is too large");
  return { state: next, added };
}

export function unmergeCaughtState(state: string, added: readonly number[]): string {
  if (added.length > 2000 || added.some((n) => !Number.isInteger(n))) throw new Error("Invalid caught Pokémon");
  const parsed = stateObject(state);
  if (Array.isArray(parsed.caught)) parsed.caught = parsed.caught.filter((n: unknown) => !added.includes(n as number));
  return JSON.stringify(parsed);
}
