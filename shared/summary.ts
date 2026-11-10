// What the Dashboard shows for a playthrough, derived from its saved state.
// The server stores one per run so the list never has to carry full states.
export type Summary = {
  badges: string[];
  caught: number;
  party: { n: number; shiny: boolean; nick: string }[];
};

const PARTY_SIZE = 6;

export function summarize(state: string): Summary {
  let s: any;
  try {
    s = JSON.parse(state);
  } catch {}
  if (!s || typeof s !== "object") s = {};
  const list = (a: unknown): any[] => (Array.isArray(a) ? a : []);
  return {
    badges: list(s.badges)
      .filter((b) => typeof b === "string")
      .slice(0, 64)
      .map((b: string) => b.slice(0, 40)),
    caught: new Set(list(s.caught)).size,
    party: list(s.mons)
      .filter(
        (m) =>
          m?.box === "party" && Number.isInteger(m.n) && m.n > 0 && m.n < 10000,
      )
      .slice(0, PARTY_SIZE)
      .map((m) => ({
        n: m.n,
        shiny: m.shiny === true,
        nick: typeof m.nick === "string" ? m.nick.slice(0, 20) : "",
      })),
  };
}
