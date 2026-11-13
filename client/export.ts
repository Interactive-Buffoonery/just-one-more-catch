import { withTimeout } from "./async";
import { bridge, dumpRun, loaded, R, run, startDay, verOf } from "./game";
import { Pack } from "./packs";
import { Mon, RunRow, Species } from "./types";
import { journalItems, type JournalEntry } from "../shared/journal";
import { csv } from "../shared/csv";

const tick = (ms: number) => new Promise((r) => setTimeout(r, ms));
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
    withTimeout(get(id), 20000, "Timed out").catch(() =>
      tick(500).then(() => withTimeout(get(id), 20000, "Timed out")),
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
  bridge.track("export_used");
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
        v.platform ? `${v.name} (${v.platform})` : v.name,
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

// User-entered text must remain text when opened in a spreadsheet.
const spreadsheetText = (value: unknown) => {
  const text = String(value ?? "");
  return /^[\s]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text) ? "'" + text : text;
};

export async function playthroughCsv(row: RunRow, state: string, journal = false) {
  const v = verOf(row.version), data = loaded.get(v.pack) || await v.pack.load();
  loaded.set(v.pack, data);
  const dex = new Map<number, Species>(data.dex.map((p: Species) => [p.n, p]));
  const s = JSON.parse(state || "{}"), mons: Mon[] = s.mons || [], notes: JournalEntry[] = s.journalEntries || [];
  const prefix = [v.platform ? `${v.name} (${v.platform})` : v.name, startDay(row), row.id];
  const name = (n: number) => dex.get(n)?.name ?? `#${n}`;
  const lines: unknown[][] = [];
  if (journal) {
    lines.push(["Game", "Started", "Playthrough ID", "Entry type", "Entry ID", "Date", "Method", "Location", "National No.", "Species", "Nickname", "Text"]);
    const byId = new Map(mons.map(m => [m.id, m]));
    for (const item of journalItems(mons, notes)) {
      if (item.kind === "note") lines.push([...prefix, "Note", item.entry.id, item.day, "", "", "", "", "", item.entry.text]);
      else {
        const m = byId.get(item.id)!;
        lines.push([...prefix, "Pokémon", m.id, item.day, m.acquisition?.method, m.acquisition?.place, m.n, name(m.n), m.nick, m.note]);
      }
    }
  } else {
    lines.push(["Game", "Started", "Playthrough ID", "Record type", "Pokémon ID", "National No.", "Species", "Caught", "Form", "Nickname", "Level", "Gender", "Shiny", "Held item", "Note", "Party or box", "Method", "Date", "Location"]);
    const caught = new Set<number>(s.caught || []);
    for (const m of mons) lines.push([...prefix, "Individual", m.id, m.n, name(m.n), caught.has(m.n) ? "yes" : "", m.form, m.nick, m.lvl, m.g, m.shiny ? "yes" : "", m.item, m.note, m.box, m.acquisition?.method, m.acquisition?.day, m.acquisition?.place]);
    const individuals = new Set(mons.map(m => m.n));
    for (const n of [...caught].sort((a, b) => a - b)) if (!individuals.has(n)) lines.push([...prefix, "Species completion", "", n, name(n), "yes", "", "", "", "", "", "", "", "", "", "", ""]);
  }
  return csv(lines.map(line => line.map(spreadsheetText)));
}
