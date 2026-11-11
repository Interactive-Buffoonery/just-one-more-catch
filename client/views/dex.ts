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
  TYPE,
  ui,
  ver,
} from "../game";
import { mon, sprite, tagBits, SLIDERS_ICON } from "../parts";
import { Row, Species } from "../types";
import { monLine } from "./boxes";
import { NoRun } from "./runs";

/* ---- Dex ---- */
const STATUS_TEXT: Record<string, string> = {
  caught: "Caught",
  now: "Catchable now",
  soon: "Other time or special",
  later: "Later in the story",
  other: "Evolve, breed or trade",
};
const SHORT: Record<string, string> = {
  now: "Now",
  soon: "Other time",
  later: "Later",
  other: "Evolve or trade",
};
const FILTERS: [string, string, (s: string) => boolean][] = [
  ["now", "Catchable now", (s) => s === "now"],
  ["missing", "Missing", (s) => s !== "caught"],
  ["caught", "Caught", (s) => s === "caught"],
  ["all", "All", () => true],
];
const SEARCH_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16 16l4.5 4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
const withStatus = () => dexList().map((p) => ({ p, s: speciesStatus(p) }));
const tile = (p: Species, s: string) => {
  if (R().view === "dexonly") s = s === "caught" ? "caught" : "missing";
  const short = ["missing", "all"].includes(ui.filter) && SHORT[s];
  return `<button type="button" class="dt${s === "now" ? " n" : ""}${s === "now" || s === "caught" ? "" : " dim"}" data-${ui.bulk ? "toggle" : "open"}="${p.n}" data-k="d${p.n}" ${ui.bulk ? `aria-pressed="${s === "caught"}"` : ""} aria-label="${p.name}, number ${num(p)}, ${STATUS_TEXT[s]}">${mon(p)}<span class="nm">${p.name}</span><span class="no">#${pad(num(p))}${short ? `<i>${short}</i>` : ""}</span></button>`;
};
const section = (title: string, list: { p: Species; s: string }[]) =>
  list.length
    ? `<section class="dexsec">${title ? `<div class="sec-h"><h2 class="lg">${title}<small>${list.length}</small></h2></div>` : ""}<div class="dgrid${ui.bulk ? " bulk" : ""}">${list.map((x) => tile(x.p, x.s)).join("")}</div></section>`
    : "";
export function dexGrid() {
  if (R().view === "dexonly" && ui.filter === "now") ui.filter = "missing";
  const t = (ui.q || "").trim().toLowerCase().replace(/^#/, ""),
    keep = FILTERS.find((f) => f[0] === ui.filter)![2];
  const list = withStatus().filter(
    (x) =>
      keep(x.s) &&
      (!t ||
        x.p.name.toLowerCase().includes(t) ||
        String(num(x.p)) === String(+t)),
  );
  const here = (p: Species) =>
    p.rows.some((r) => isHere(r.place) && rowStatus(r).s === "now");
  return (
    (ui.filter === "now" && !t
      ? section(
          `At ${esc(R().here)}`,
          list.filter((x) => here(x.p)),
        ) +
        section(
          "Elsewhere",
          list.filter((x) => !here(x.p)),
        )
      : section("", list)) ||
    `<p class="muted dexnone">${t ? "No matches" : "Nothing here"}</p>`
  );
}
export function Dex() {
  if (!run) return NoRun();
  if (R().view === "dexonly" && ui.filter === "now") ui.filter = "missing";
  const all = withStatus(),
    total = e4() ? P().national : P().regional,
    have = e4() ? R().caught.size : regionalCaught();
  return `<section aria-labelledby="dex-h">
    <div class="where-k">${ver().name}</div>
    <div class="dexhead"><h1 class="lg" id="dex-h">${e4() ? "National" : P().region} dex</h1><div class="dexcount"><b>${have}</b>/ ${total}<span class="sr"> caught</span></div></div>
    <div class="bar"><i style="width:${(have / total) * 100}%"></i></div>
    <div class="dextop">
      <div class="filters${R().view === "dexonly" ? " three" : ""}" role="group" aria-label="Show">${FILTERS.filter(([k]) => k !== "now" || R().view !== "dexonly").map(
        ([k, l, f]) =>
          `<button type="button" data-filter="${k}" data-k="f-${k}" aria-pressed="${ui.filter === k}"><b>${all.filter((x) => f(x.s)).length}</b>${l}</button>`,
      ).join("")}</div>
      <div class="dextools">
        <label class="search"><span class="sr">Search the dex</span>${SEARCH_ICON}<input id="dexq" data-k="dexq" type="search" placeholder="Name or number" autocomplete="off" value="${esc(ui.q || "")}"></label>
        <button type="button" class="quietbtn" data-bulk="1" data-k="bulk" aria-pressed="${ui.bulk}">${ui.bulk ? "Done marking" : "Mark many"}</button>
        <button class="quietbtn" data-custom="1" data-k="custom">${SLIDERS_ICON}Customize</button>
      </div>
    </div>
  </section>
  <div id="dexgrid">${dexGrid()}</div>`;
}
const tags = (t: [string, boolean][]) =>
  t.length ? `<div class="tags">${t.map((x) => x[0]).join("")}</div>` : "";
// One place, its rows merged; a requirement every row shares is shown once.
function spot(place: string, rows: Row[]) {
  const bits = rows.map((r) => tagBits(r)),
    shared =
      rows.length > 1
        ? bits[0].filter(
            (x) => x[1] && bits.every((b) => b.some((y) => y[0] === x[0])),
          )
        : [],
    own = (b: [string, boolean][]) =>
      b.filter((x) => !shared.some((y) => y[0] === x[0]));
  return `<div class="spot"><div class="pn">${place}${isHere(place) ? `<span class="here-tag">You are here</span>` : ""}</div>${tags(shared)}${bits.map((b) => tags(own(b))).join("")}</div>`;
}
export function fillSpecies(n: number) {
  const p = byN[n],
    caught = R().caught.has(n),
    groups: Record<string, Row[]> = {
      now: [],
      wrongtime: [],
      special: [],
      later: [],
    };
  p.rows.forEach((r) => groups[rowStatus(r).s].push(r));
  const sect = (title: string, rows: Row[]) => {
    if (!rows.length) return "";
    const byPlace = new Map<string, Row[]>();
    rows
      .sort((a, b) => +isHere(b.place) - +isHere(a.place))
      .forEach((r) =>
        byPlace.set(r.place, [...(byPlace.get(r.place) || []), r]),
      );
    return `<h3>${title}</h3><div class="card">${[...byPlace].map(([pl, rs]) => spot(pl, rs)).join("")}</div>`;
  };
  const other = groups.now.length ? "" : howElse(p);
  const mine = R().mons.filter((m) => m.n === n);
  const a = TYPE[p.types[0]],
    b = TYPE[p.types[1] || p.types[0]];
  $("#sheetbody").innerHTML = `<div class="dexsheet">
    <div class="grab" aria-hidden="true"></div>
    <section class="next" style="--t1:${a};--t2:${b}">
      <div class="band">${sprite(p, "hv-sprite")}<div class="k">#${pad(num(p))}</div><h2 class="lg" id="sheet-title">${p.name}</h2>${p.types.map((t) => `<span class="type" style="--tc:${TYPE[t]}">${cap(t)}</span>`).join(" ")}</div>
      <div class="hv-actions"><button type="button" class="app-primary grow" data-toggle="${n}" data-k="t${n}" aria-pressed="${caught}" aria-label="${p.name} caught">${caught ? "✓ Caught" : "Caught it"}</button></div>
    </section>
    ${caught ? `<h3>Yours${mine.length ? ` · ${mine.length}` : ""}</h3><div class="card">${mine.map((m) => monLine(m, true)).join("")}<div class="yours">${mine.length ? "" : `<span class="muted small">Not in your party or boxes</span>`}<button type="button" class="quietbtn" data-addmon="${n}" data-k="add${n}">Add ${mine.length ? "another" : "one"}</button></div></div>` : ""}
    ${R().view !== "dexonly" ? `${sect("Catchable now", groups.now)}${sect("Other times of day", groups.wrongtime)}${sect("Special conditions", groups.special)}${sect("Later", groups.later)}
    ${other ? `<h3>Other ways</h3><div class="card"><p class="spot">${other}</p></div>` : ""}
    ` : ""}
    <button type="button" class="app-quiet done" data-close="1">Done</button>
  </div>`;
}
