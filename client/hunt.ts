import { ONE_TIME } from "./encounter-methods.ts";

export type Hunt = {
  species: number;
  place: string;
  unit: "encounters" | "eggs" | "resets";
  method: "full" | "masuda" | "custom";
  odds: number;
  count: number;
  startedAt: number;
};
export const chance = (count: number, odds: number) => count === 0 ? 0 : -Math.expm1(count * Math.log1p(-1 / odds));
export const fiftyAt = (odds: number) => odds === 1 ? 1 : Math.ceil(Math.log(0.5) / Math.log1p(-1 / odds));
export const unitFor = (method: string): Hunt["unit"] | null =>
  method === "npc-trade" ? null : method === "eggs" ? "eggs" : ONE_TIME.has(method) ? "resets" : "encounters";
export const baseOdds = (gen: number) => gen < 2 || gen > 9 ? null : gen < 6 ? 8192 : 4096;
export const masudaOdds = (gen: number) => gen === 5 ? 1365.3 : gen >= 6 && gen <= 9 ? 682.7 : null;

// The game's dex already excludes species introduced in later generations.
export function eggTarget(speciesId: number, game: { dex: { n: number; name: string; from: string | null; canBreed?: boolean }[] }): number | null {
  const dex = game.dex;
  if (dex.length <= 151) return null;
  const asked = dex.find((p) => p.n === speciesId);
  if (!asked || [132, 489, 490].includes(speciesId)) return null;
  const root = (p: typeof asked): typeof asked => {
    const parent = dex.find((q) => q.name === p.from);
    return parent ? root(parent) : p;
  };
  const base = root(asked);
  const family = dex.filter((p) => root(p).n === base.n);
  if (!family.some((p) => p.canBreed)) return null;
  const incense = new Set([298, 360, 406, 433, 438, 439, 440, 446, 458]);
  if (incense.has(base.n) && asked.n !== base.n) return family.find((p) => p.from === base.name)?.n ?? null;
  return base.n;
}
