import { $, esc } from "../dom";
import {
  byN,
  cap,
  collectedForms,
  visibleForms,
  collectedGenders,
  GENDERS,
  hasGenders,
  dexList,
  e4,
  howElse,
  isHere,
  num,
  P,
  pad,
  R,
  isGuest,
  viewOf,
  regionalCaught,
  rowStatus,
  run,
  searching,
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
  missing: "Missing",
};
const SHORT: Record<string, string> = {
  caught: "Caught",
  now: "Now",
  soon: "Other time",
  later: "Later",
  other: "Evolve or trade",
  missing: "Missing",
};
const FILTERS: [string, string, (s: string) => boolean][] = [
  ["now", "Catchable now", (s) => s === "now"],
  ["missing", "Missing", (s) => s !== "caught"],
  ["caught", "Caught", (s) => s === "caught"],
  ["all", "All", () => true],
];
const SEARCH_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16 16l4.5 4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
export const DEX_SIZES: Record<string, [string, string]> = {
  compact: ["Compact", '<rect x="4" y="4" width="6" height="6"/><rect x="14" y="4" width="6" height="6"/><rect x="4" y="14" width="6" height="6"/><rect x="14" y="14" width="6" height="6"/>'],
  tiles: ["Tiles", '<rect x="4" y="4" width="6" height="6"/><rect x="14" y="4" width="6" height="6"/><rect x="4" y="14" width="6" height="6"/><rect x="14" y="14" width="6" height="6"/>'],
  large: ["Large", '<rect x="4" y="4" width="16" height="16"/>'],
  list: ["List", '<path d="M4 5h16M4 12h16M4 19h16"/>'],
};
let statusCache: { p: Species; s: string }[] | null = null;
export const resetDexCache = () => (statusCache = null);
const withStatus = () => (statusCache ||= dexList().map((p) => ({ p, s: speciesStatus(p) })));
const tile = (p: Species, s: string) => {
  if (viewOf(R()) === "dexonly") s = s === "caught" ? "caught" : "missing";
  const genders = collectedGenders(p),
    available = visibleForms(p);
  const progress = [
    R().trackGenders && hasGenders(p) ? `${genders.size} of 2 genders` : "",
    R().trackForms && available.length > 1 ? `${collectedForms(p).size} of ${available.length} forms` : "",
  ].filter(Boolean).map((text) => `, ${text}`).join("");
  const short = ui.dexSize !== "large" && (searching() || (s !== "caught" && ["missing", "all"].includes(ui.filter))) && SHORT[s];
  const typeText = p.types.map(cap).join(" "),
    place = s === "now" ? p.rows.find((r) => rowStatus(r).s === "now")?.place || "" : "";
  const extra = ui.dexSize === "list" ? `, ${typeText} type${place ? `, ${esc(place)}` : ""}` : ui.dexSize === "large" ? `, ${typeText} type` : "";
  const attrs = `type="button" class="dt${s === "now" ? " n" : ""}${s === "now" || s === "caught" ? "" : " dim"}" data-${ui.bulk ? "toggle" : "open"}="${p.n}" data-k="d${p.n}" ${ui.bulk ? `aria-pressed="${s === "caught"}"` : ""} aria-label="${p.name}, number ${num(p)}, ${STATUS_TEXT[s]}${extra}${progress}"`;
  const gx = R().trackGenders && hasGenders(p) ? `<span class="gx" aria-hidden="true">${GENDERS.map(([g, symbol]) => `<b class="${genders.has(g) ? "on" : ""}">${symbol}</b>`).join("")}</span>` : "";
  const forms = R().trackForms && available.length > 1 ? `<i class="fx" aria-hidden="true">${collectedForms(p).size}/${available.length}</i>` : "";
  const types = p.types.map((t) => `<span class="type" style="--tc:${TYPE[t]}">${cap(t)}</span>`).join(" ");
  if (ui.dexSize === "list")
    return `<button ${attrs}>${mon(p)}<span class="mid"><span class="nm">${p.name}<small>#${pad(num(p))}</small></span><span class="dmeta">${types}${gx}${forms}</span></span><span class="end"><b>${SHORT[s]}</b>${s === "now" ? `<span>${esc(place)}</span>` : ""}</span></button>`;
  return `<button ${attrs}>${s === "caught" || s === "now" ? `<span class="dexmarker ${s}" aria-hidden="true">${s === "caught" ? "✓" : ""}</span>` : ""}${mon(p)} <span class="nm">${p.name}</span><span class="no">#${pad(num(p))}${gx}${forms}${short ? `<i aria-hidden="true">${short}</i>` : ""}</span>${ui.dexSize === "large" ? `<span class="dextypes">${types}</span><span class="dexstatus">${SHORT[s]}</span>` : ""}</button>`;
};
const section = (title: string, list: { p: Species; s: string }[]) =>
  list.length
    ? `<section class="dexsec">${title ? `<div class="sec-h"><h2 class="lg">${title}<small>${list.length}</small></h2></div>` : ""}<div class="dgrid ${ui.dexSize}${ui.bulk ? " bulk" : ""}${searching() ? " q" : ""}">${list.map((x) => tile(x.p, x.s)).join("")}</div></section>`
    : "";
const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
export function searchDex<T extends { p: Species }>(
  list: T[], query: string, number: (p: Species) => number,
  forms: (p: Species) => { name: string }[],
): T[] {
  const raw = query.trim().replace(/^#/, "").trim();
  if (!raw) return list;
  const q = norm(raw),
    digits = raw.replace(/^0+(?=\d)/, "");
  if (!q) return [];
  return list.map((x) => ({ x, name: norm(x.p.name) })).filter(({ x: { p }, name }) =>
    name.includes(q) ||
    (/^\d+$/.test(digits) &&
      [number(p), p.n].some((n) => String(n).startsWith(digits))) ||
    p.types.some((type) => norm(type) === q) ||
    (q.length > 1 && forms(p).some((form) => norm(form.name).includes(q))),
  ).sort((a, b) => Number(b.name.startsWith(q)) - Number(a.name.startsWith(q))).map(({ x }) => x);
}
export function dexGrid() {
  if (viewOf(R()) === "dexonly" && ui.filter === "now") ui.filter = "missing";
  const t = searching(),
    keep = FILTERS.find((f) => f[0] === ui.filter)![2];
  const list = searchDex(withStatus().filter((x) => t || keep(x.s)), t, num, (p) => (R().trackForms ? visibleForms(p) : []));
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
      : section(t ? "Results" : "", list)) ||
    `<div class="dexnone"><p class="muted">${t ? "No matches" : "Nothing here"}</p>${t ? '<button type="button" class="quietbtn" data-clearsearch="1">Clear</button>' : ""}</div>`
  );
}
export function Dex() {
  if (!run) return NoRun();
  if (viewOf(R()) === "dexonly" && ui.filter === "now") ui.filter = "missing";
  const all = withStatus(),
    total = e4() ? P().national : P().regional,
    have = e4() ? R().caught.size : regionalCaught();
  return `<section aria-labelledby="dex-h">
    <div class="where-k">${ver().name}</div>
    <div class="dexhead"><h1 class="lg" id="dex-h">${e4() ? "National" : P().region} dex</h1><div class="dexcount"><b>${have}</b>/ ${total}<span class="sr"> caught</span></div></div>
    <div class="bar"><i style="width:${(have / total) * 100}%"></i></div>
    <div class="dextop">
      <div class="filters${viewOf(R()) === "dexonly" ? " three" : ""}" role="group" aria-label="Show">${FILTERS.filter(([k]) => k !== "now" || viewOf(R()) !== "dexonly").map(
        ([k, l, f]) =>
          `<button type="button" data-filter="${k}" data-k="f-${k}" aria-pressed="${!searching() && ui.filter === k}"><b>${all.filter((x) => f(x.s)).length}</b>${k === "now" ? '<span class="nowlong">Catchable now</span><span class="nowshort">Now</span>' : l}</button>`,
      ).join("")}</div>
      <div class="dextools">
        <div class="search"><label><span class="sr">Search the dex</span>${SEARCH_ICON}<input id="dexq" data-k="dexq" type="search" placeholder="${matchMedia("(max-height:480px)").matches ? "Search" : "Name or number"}" autocomplete="off" value="${esc(ui.q || "")}"></label><button type="button" class="searchclear" data-clearsearch="1" aria-label="Clear search" ${searching() ? "" : "hidden"}>×</button></div>
        <div class="dexsizes" role="group" aria-label="Grid size">${Object.entries(DEX_SIZES).map(([size, [label, icon]]) => `<button type="button" data-dexsize="${size}" data-k="size-${size}" aria-pressed="${ui.dexSize === size}" aria-label="${label}"><svg viewBox="0 0 24 24" aria-hidden="true">${icon}</svg></button>`).join("")}</div>
        <button type="button" class="quietbtn" data-bulk="1" data-k="bulk" aria-label="${ui.bulk ? "Done marking" : "Mark many"}" aria-pressed="${ui.bulk}"><span class="toolicon" aria-hidden="true">✓</span><span class="tooltext">${ui.bulk ? "Done marking" : "Mark many"}</span></button>
        <button class="quietbtn" data-custom="1" data-k="custom" aria-label="Customize">${SLIDERS_ICON}<span class="tooltext">Customize</span></button>
      </div>
    </div>
    <div id="dexgrid">${dexGrid()}</div>
  </section>`;
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
  return `<div class="spot"><div class="pn">${place}${isHere(place) ? `<span class="here-tag">Selected</span>` : ""}</div>${tags(shared)}${bits.map((b) => tags(own(b))).join("")}</div>`;
}
export function fillSpecies(n: number) {
  const p = byN[n],
    caught = R().caught.has(n),
    forms = collectedForms(p),
    available = visibleForms(p),
    genders = collectedGenders(p),
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
    ${R().trackForms && available.length > 1 ? `<h3>Forms · ${forms.size} / ${available.length}</h3><div class="forms">${available.map((f) => `<button type="button" class="form" data-form="${f.id}" data-species="${n}" data-k="form-${f.id}" aria-pressed="${forms.has(f.id)}" aria-label="${esc(p.name + " " + f.name)}" ${mine.some((m) => (m.form || p.forms![0].id) === f.id) ? "disabled" : ""}>${sprite(p, "", false, f.id)}<span${f.name.split(" ").some((w) => w.length > 8) ? ' class="long"' : ""}>${esc(f.name)}</span></button>`).join("")}</div>` : ""}
    ${R().trackGenders && hasGenders(p) ? `<h3>Genders · ${genders.size} / 2</h3><div class="forms genders">${GENDERS.map(([g, symbol, label]) => `<button type="button" class="form" data-gender="${g}" data-species="${n}" data-k="gender-${n}-${g}" aria-pressed="${genders.has(g)}" aria-label="${esc(p.name + " " + label)}" ${mine.some((m) => m.g === g) ? "disabled" : ""}><span class="gsym" aria-hidden="true">${symbol}</span><span>${label}</span></button>`).join("")}</div>` : ""}
    ${caught && !isGuest() ? `<h3>Yours${mine.length ? ` · ${mine.length}` : ""}</h3><div class="card">${mine.map((m) => monLine(m, true)).join("")}<div class="yours">${mine.length ? "" : `<span class="muted small">Not in your party or boxes</span>`}<button type="button" class="quietbtn" data-addmon="${n}" data-k="add${n}">Add ${mine.length ? "another" : "one"}</button></div></div>` : ""}
    ${viewOf(R()) !== "dexonly" ? `${sect("Catchable now", groups.now)}${sect("Other times of day", groups.wrongtime)}${sect("Special conditions", groups.special)}${sect("Later", groups.later)}
    ${other ? `<h3>Other ways</h3><div class="card"><p class="spot">${other}</p></div>` : ""}
    ` : ""}
    <button type="button" class="app-quiet done" data-close="1">Done</button>
  </div>`;
}
