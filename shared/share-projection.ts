import { VERSION_IDS, type VersionId } from "./versions.ts";
import { IMPORT_SPECIES_LIMITS } from "./save-import.ts";
import { MILESTONES } from "./milestones.ts";

export const SHARE_MAX_BYTES = 8192;
export type ShareProjection = { v: 1; game: VersionId; caught: number[]; badges: string[] };
export const canonical = (p: ShareProjection): string =>
  JSON.stringify({ v: p.v, game: p.game, caught: p.caught, badges: p.badges });

export function validateProjection(x: unknown): ShareProjection | null {
  if (!x || typeof x !== "object" || Array.isArray(x)) return null;
  const p = x as ShareProjection;
  if (Object.keys(p).sort().join() !== "badges,caught,game,v" || p.v !== 1 ||
    !VERSION_IDS.includes(p.game) || !Array.isArray(p.caught) || !Array.isArray(p.badges)) return null;
  const catalog = MILESTONES[p.game];
  if (p.caught.length > IMPORT_SPECIES_LIMITS[p.game] || p.badges.length > catalog.length) return null;
  if (p.caught.some((n, i) => !Number.isSafeInteger(n) || n < 1 || n > IMPORT_SPECIES_LIMITS[p.game] || (i > 0 && n <= p.caught[i - 1]))) return null;
  let previous = -1;
  for (const badge of p.badges) {
    const index = catalog.indexOf(badge);
    if (index <= previous) return null;
    previous = index;
  }
  return new TextEncoder().encode(canonical(p)).length <= SHARE_MAX_BYTES ? p : null;
}

export function projectionOf(stateJson: string, version: VersionId): ShareProjection {
  const state = JSON.parse(stateJson);
  const p: ShareProjection = {
    v: 1, game: version,
    caught: [...new Set<number>(Array.isArray(state?.caught) ? state.caught : [])].sort((a, b) => a - b),
    badges: MILESTONES[version].filter((b) => Array.isArray(state?.badges) && state.badges.includes(b)),
  };
  if (!validateProjection(p)) throw new Error("Invalid shared progress");
  return p;
}
