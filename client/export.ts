import { bridge, dumpRun, loaded, R, run, startDay, verOf } from "./game";
import { Pack } from "./packs";
import { RunRow, Species } from "./types";
import { csv } from "../shared/csv";

const tick = (ms: number) => new Promise((r) => setTimeout(r, ms));
const within = <T>(p: Promise<T>, ms: number) =>
  Promise.race([
    p,
    tick(ms).then(() => {
      throw new Error("Timed out");
    }),
  ]);
// ponytail: all-or-nothing, so a run deleted mid-export fails the whole export; just try again
export async function fetchStates(
  rows: RunRow[],
  onStep: (done: number) => void,
) {
  const get = bridge.getState,
    openId = run?.id,
    open = run && dumpRun(R()),
    out: string[] = [];
  const one = (id: string) =>
    within(get(id), 20000).catch(() =>
      tick(500).then(() => within(get(id), 20000)),
    );
  let next = 0,
    done = 0,
    failed = false;
  const worker = async () => {
    while (!failed && next < rows.length) {
      const i = next++;
      try {
        out[i] = rows[i].id === openId ? open! : await one(rows[i].id);
        onStep(++done);
      } catch {
        failed = true;
      }
    }
  };
  await Promise.all(Array.from({ length: 6 }, worker));
  if (failed) throw new Error("Couldn't fetch every playthrough");
  return out;
}
export function saveFile(name: string, type: string, parts: BlobPart[]) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob(parts, { type }));
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
// ponytail: the open run's updatedAt is its last save, even though its state is the live one
export const jsonParts = (rows: RunRow[], states: string[]) => [
  `{"exportedAt":${JSON.stringify(new Date().toISOString())},"account":${JSON.stringify(bridge.auth.displayName ?? null)},"runs":[\n`,
  ...rows.map(
    (r, i) =>
      (i ? ",\n" : "") +
      JSON.stringify(
        {
          id: r.id,
          game: r.version,
          startedAt: r.createdAt,
          updatedAt: r.updatedAt,
          ...JSON.parse(states[i] || "{}"),
        },
        null,
        2,
      ),
  ),
  "\n]}\n",
];
export async function caughtCsv(rows: RunRow[], states: string[]) {
  const lines: unknown[][] = [
    [
      "Game",
      "Started",
      "Playthrough ID",
      "National No.",
      "Regional No.",
      "Species",
      "Shiny",
    ],
  ];
  const dexes = new Map<Pack, Map<number, Species>>();
  for (const [i, r] of rows.entries()) {
    const v = verOf(r.version);
    if (!dexes.has(v.pack)) {
      const d = loaded.get(v.pack) || (await v.pack.load());
      loaded.set(v.pack, d);
      dexes.set(v.pack, new Map(d.dex.map((p: Species) => [p.n, p])));
    }
    const dex = dexes.get(v.pack)!,
      s = JSON.parse(states[i] || "{}") || {},
      list = (a: unknown): any[] => (Array.isArray(a) ? a : []),
      shiny = new Set(
        list(s.mons)
          .filter((m) => m?.shiny)
          .map((m) => m.n),
      ),
      caught = [...new Set(list(s.caught))]
        .filter((n) => Number.isInteger(n) && n > 0)
        .sort((a, b) => a - b);
    for (const n of caught) {
      const p = dex.get(n);
      lines.push([
        v.name,
        startDay(r),
        r.id,
        n,
        p?.j ?? "",
        p?.name ?? `#${n}`,
        shiny.has(n) ? "yes" : "",
      ]);
    }
  }
  return csv(lines);
}
