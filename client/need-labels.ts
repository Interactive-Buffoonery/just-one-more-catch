import type { Pack } from "./packs.ts";

export const badgeName = (badge: string, pack: Pack) =>
  `${badge} ${pack.badgeWord ?? "Badge"}`;

export function needLabel(
  need: string,
  pack: Pack,
  events: Record<string, { label: string }>,
  ownedKit: ReadonlySet<string> = new Set(),
): string {
  if (events[need]) return events[need].label;
  if (need === "Elite Four") return "Beat the Elite Four";
  if (/^[A-Z]/.test(need)) return badgeName(need, pack);
  if (ownedKit.has(need)) return badgeName(pack.hm[need], pack);
  const kit = pack.kit.find(k => k[0] === need);
  if (!kit) throw new Error(`Unknown requirement: ${need}`);
  return kit[1];
}
