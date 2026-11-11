import { $, esc } from "../dom";
import {
  byN,
  cap,
  dexList,
  e4,
  howElse,
  isHere,
  num,
  P,
  pad,
  R,
  regionalCaught,
  rowStatus,
  run,
  speciesStatus,
  ui,
} from "../game";
import { gotBtn, mon, rowTags } from "../parts";
import { Row } from "../types";
import { boxLabel, monLine } from "./boxes";
import { NoRun } from "./runs";

/* ---- Dex ---- */
const STATUS_TEXT: Record<string, string> = {
  caught: "Caught",
  now: "Catchable now",
  soon: "Other time or special",
  later: "Later in the story",
  other: "Evolve, breed or trade",
};
export function Dex() {
  if (!run) return NoRun();
  const f = ui.filter,
    title = e4() ? "National dex" : `${P().region} dex`,
    total = e4() ? P().national : P().regional,
    have = e4() ? R().caught.size : regionalCaught();
  const list = dexList().filter((p) => {
    const s = speciesStatus(p);
    return (
      f === "all" ||
      (f === "missing"
        ? s !== "caught"
        : f === "now"
          ? s === "now"
          : s === "caught")
    );
  });
  return `<div style="display:flex;gap:12px;align-items:baseline;flex-wrap:wrap"><h2>${title}</h2><span class="muted">${have} of ${total} caught</span></div>
  <div class="chips" style="margin:12px 0">${[
    ["now", "Catchable now"],
    ["missing", "Missing"],
    ["caught", "Caught"],
    ["all", "All"],
  ]
    .map(
      ([k, l]) =>
        `<button class="chip" data-filter="${k}" data-k="f-${k}" aria-pressed="${f === k}">${l}</button>`,
    )
    .join("")}
    <span class="spacer"></span><button class="chip" data-bulk="1" data-k="bulk" aria-pressed="${ui.bulk}">${ui.bulk ? "Done marking" : "Mark many"}</button></div>
  ${ui.bulk ? `<p class="small muted" style="margin-top:-4px">Tap every Pokémon you already have.</p>` : ""}
  <div class="grid">${
    list
      .map((p) => {
        const s = speciesStatus(p),
          m = R().mons.find((x) => x.n === p.n);
        return `<button class="tile ${s === "caught" ? "" : "miss"}" data-${ui.bulk ? "toggle" : "open"}="${p.n}" data-k="d${p.n}" ${ui.bulk ? `aria-pressed="${s === "caught"}"` : ""} aria-label="${p.name}, number ${num(p)}, ${STATUS_TEXT[s]}">${mon(p)}<span><span class="nm">${p.name}</span><br><span class="st">#${pad(num(p))} · ${STATUS_TEXT[s]}${m ? ` · ${esc(boxLabel(m.box))}` : ""}</span></span></button>`;
      })
      .join("") || `<p class="muted">Nothing here.</p>`
  }</div>`;
}
export function fillSpecies(n: number) {
  const p = byN[n],
    groups: Record<string, Row[]> = {
      now: [],
      wrongtime: [],
      special: [],
      later: [],
    };
  p.rows.forEach((r) => groups[rowStatus(r).s].push(r));
  const sect = (title: string, rows: Row[]) =>
    rows.length
      ? `<div class="eyebrow">${title}</div>${rows
          .sort((a, b) => +isHere(b.place) - +isHere(a.place))
          .map(
            (r) =>
              `<div style="padding:8px 0;border-top:1px solid var(--line)"><div style="font-weight:800">${r.place}</div>${rowTags(r)}</div>`,
          )
          .join("")}`
      : "";
  const other = groups.now.length ? "" : howElse(p);
  const mine = R().mons.filter((m) => m.n === n);
  $("#sheetbody").innerHTML =
    `<div style="display:flex;gap:12px;align-items:center">${mon(p)}<div style="flex:1"><h2 id="sheet-title">${p.name}</h2><div class="muted small">#${pad(num(p))} · ${p.types.map(cap).join(" / ")}</div></div>${gotBtn(p)}</div>
    ${R().caught.has(n) ? `<div class="eyebrow">Yours${mine.length ? ` · ${mine.length}` : ""}</div>${mine.map((m) => monLine(m, true)).join("") || `<p class="small muted" style="margin:0 0 8px">Not in your party or boxes right now.</p>`}<button class="chip" data-addmon="${n}" data-k="add${n}">+ Add ${mine.length ? "another" : "one"}</button>` : ""}
    ${sect("Catchable now", groups.now)}${sect("Other times of day", groups.wrongtime)}${sect("Special conditions", groups.special)}${sect("Later", groups.later)}
    ${other ? `<div class="eyebrow">Other ways</div><p style="margin:0">${other}</p>` : ""}
    <button class="btn" style="width:100%;margin-top:20px" data-close="1">Done</button>`;
}
