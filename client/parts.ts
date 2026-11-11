import { esc } from "./dom";
import {
  badgeName,
  cap,
  CHAPTERS,
  coinLabel,
  DEX,
  EVENTS,
  howElse,
  inJourney,
  isHere,
  METHOD,
  NOT_HERE,
  OK_COND,
  ONE_TIME,
  ORDER,
  P,
  placeOf,
  R,
  rowStatus,
  TIME,
  TYPE,
  ui,
  visible,
} from "./game";
import { Row, Species } from "./types";

const ring = (types: string[]) => {
  const a = TYPE[types[0]],
    b = TYPE[types[1] || types[0]];
  return `--t1:${a};--t2:${b}`;
};
export const sprite = (p: Species, cls = "", shiny = false) =>
  `<img class="sprite ${cls}" src="/sprites/${P().art}/${shiny ? "shiny/" : ""}${p.n}.png" alt="${shiny ? "Shiny " : ""}${p.name}" width="80" height="80" loading="lazy">`;
export const mon = (p: Species, shiny = false) =>
  `<span class="mon ${R().caught.has(p.n) ? "got" : ""}" style="${ring(p.types)}" aria-hidden="true"><b>${sprite(p, "", shiny)}</b></span>`;
export const lvl = (r: Row) =>
  r.m === "npc-trade"
    ? ""
    : r.lo === r.hi
      ? `Lv ${r.lo}`
      : `Lv ${r.lo} to ${r.hi}`;
export function rowTags(r: Row, place = r.place) {
  const st = rowStatus(r),
    t = [`<span class="tag">${METHOD[r.m]?.[0] || r.m}</span>`];
  if (r.place !== place)
    t.push(
      `<span class="tag plain">${r.place.slice(place.length).trim() || r.place}</span>`,
    );
  if (ONE_TIME.has(r.m)) t.push(`<span class="tag plain">One-time</span>`);
  if (lvl(r)) t.push(`<span class="tag plain">${lvl(r)}</span>`);
  if (r.c && r.c < 100 && !ONE_TIME.has(r.m))
    t.push(`<span class="tag plain">${r.c}%</span>`);
  r.cond.forEach((c) => {
    if (TIME[c]) t.push(`<span class="tag time">${TIME[c]}</span>`);
    else if (c.startsWith("weekday-"))
      t.push(`<span class="tag time">${cap(c.slice(8))}s</span>`);
    else if (OK_COND[c] || coinLabel(c))
      t.push(`<span class="tag plain">${OK_COND[c] || coinLabel(c)}</span>`);
  });
  if (
    st.need &&
    EVENTS[st.need] &&
    !R().hidden.has("journey") &&
    inJourney(EVENTS[st.need].chap)
  )
    t.push(
      `<button class="tag goto" data-goevent="${st.need}" aria-label="${st.why}. Show it in Your journey">${st.why}<span aria-hidden="true"> ›</span></button>`,
    );
  else if (st.s !== "now" && st.s !== "wrongtime")
    t.push(`<span class="tag warn">${st.why}</span>`);
  return `<div class="tags">${t.join("")}</div>`;
}
export const gotBtn = (p: Species, evo = false) =>
  `<button class="got-btn" data-toggle="${p.n}" data-k="t${p.n}" aria-pressed="${R().caught.has(p.n)}" aria-label="${p.name} ${evo ? "caught or evolved" : "caught"}">${R().caught.has(p.n) ? (evo ? "✓ Obtained" : "✓ Caught") : evo ? "Caught/Evolved?" : "Caught?"}</button>`;
// ponytail: the only guaranteed shiny in the packs so far; move it into pack data when a second one appears
export const redGyarados = (p: Species, r: Row | null) =>
  p.n === 130 && r?.m === "static" && r.place === "Lake of Rage";
export const RED_NOTE = "The red Gyarados, always shiny";
export const monRow = (
  p: Species,
  r: Row | null,
  place?: string,
  evo = false,
) =>
  `<div class="row">${mon(p, redGyarados(p, r))}<div class="grow"><div class="name">${p.name}${redGyarados(p, r) ? ` <span class="shiny small">✦ ${RED_NOTE}</span>` : ""}</div>${r ? rowTags(r, place) : `<div class="small muted">${howElse(p)}</div>`}</div>${gotBtn(p, evo)}</div>`;
export type Catchable = { p: Species; r: Row };
const pref = (a: Catchable, b: Catchable) =>
  +isHere(b.r.place) - +isHere(a.r.place) ||
  b.r.chap - a.r.chap ||
  b.r.c - a.r.c;
export function catchableNow() {
  const out: Catchable[] = [];
  DEX.forEach((p) => {
    if (R().caught.has(p.n) || !visible(p)) return;
    const rows = p.rows
      .filter((r) => rowStatus(r).s === "now")
      .map((r) => ({ p, r }))
      .sort(pref);
    if (rows.length) out.push(rows[0]);
  });
  return out.sort(pref);
}
export function chapterGroups(chap: number) {
  const g: Record<string, Catchable[]> = {};
  DEX.forEach((p) => {
    if (R().caught.has(p.n) || !visible(p)) return;
    const rs = p.rows
      .filter((r) => r.chap === chap)
      .sort(
        (a, b) => ORDER[rowStatus(a).s] - ORDER[rowStatus(b).s] || b.c - a.c,
      );
    if (rs.length) (g[rs[0].place] ||= []).push({ p, r: rs[0] });
  });
  return g;
}
export const uniq = (g: Record<string, Catchable[]>) =>
  Object.values(g).flat().length;

type Spot = {
  chap: number;
  got: number;
  now: Catchable[];
  later: Catchable[];
  once: Catchable[];
};
// 0 now, 1 other time of day, 2 not reachable yet, 3 one-time or special
const rank = (r: Row) => {
  const s = rowStatus(r).s;
  return ONE_TIME.has(r.m) || s === "special"
    ? 3
    : s === "later"
      ? 2
      : s === "wrongtime"
        ? 1
        : 0;
};
// Per place: caught species, ones you can catch with what you have (any time of day),
// ones that need more badges or items, and one-time or special ones (left out of the count).
export function spots() {
  const out: Record<string, Spot> = {};
  DEX.forEach((p) => {
    if (!visible(p)) return;
    const seen = new Set<string>();
    p.rows
      .map((r) => ({ r, k: rank(r) }))
      .sort((a, b) => a.k - b.k || b.r.c - a.r.c)
      .forEach(({ r, k }) => {
        const pl = placeOf(r.place),
          slot = redGyarados(p, r) ? `${pl}*` : pl;
        if (seen.has(slot)) return;
        seen.add(slot);
        const s = (out[pl] ||= {
          chap: r.chap,
          got: 0,
          now: [],
          later: [],
          once: [],
        });
        if (R().caught.has(p.n)) s.got += +(k < 2);
        else (k === 3 ? s.once : k === 2 ? s.later : s.now).push({ p, r });
      });
  });
  return out;
}
const complete = (pl: string, s?: Spot) =>
  !!s && !NOT_HERE.test(pl) && !s.now.length && !s.later.length && s.got > 0;
export const placeLabel = (pl: string, s?: Spot) =>
  !s || NOT_HERE.test(pl)
    ? ""
    : complete(pl, s)
      ? "✓ Complete"
      : s.now.length
        ? `${s.now.length} left`
        : s.later.length
          ? `${s.later.length} later`
          : "";
const laterBox = (
  key: string,
  title: string,
  list: Catchable[],
  place: string,
) =>
  list.length
    ? `<details class="later" data-chap="${esc(key)}" ${ui.open.has(key) ? "open" : ""}><summary>${title}</summary>${list.map((x) => monRow(x.p, x.r, place)).join("")}</details>`
    : "";
function placeBlock(pl: string, s: Spot) {
  const later = R().showLater
      ? s.later.map((x) => monRow(x.p, x.r, pl)).join("")
      : laterBox(`l:${pl}`, `Come back later · ${s.later.length}`, s.later, pl),
    once = laterBox(
      `o:${pl}`,
      `One-time and special · ${s.once.length}`,
      s.once,
      pl,
    );
  if (complete(pl, s))
    return `<div class="done-place"><span class="tick" aria-hidden="true">✓</span><span style="flex:1">${pl} complete</span><span class="count ok">${s.got} / ${s.got}</span></div>${once}`;
  const count = NOT_HERE.test(pl)
    ? ""
    : s.now.length
      ? `${s.got} / ${s.got + s.now.length}`
      : s.got
        ? `${s.got} / ${s.got}`
        : s.later.length
          ? "Nothing to catch yet"
          : "";
  const sorted = s.now.sort((a, b) => b.r.c - a.r.c),
    ready = sorted.filter((x) => rank(x.r) === 0),
    other = sorted.filter((x) => rank(x.r) === 1),
    otherTime = R().showLater
      ? other.map((x) => monRow(x.p, x.r, pl)).join("")
      : laterBox(`t:${pl}`, `Other times · ${other.length}`, other, pl);
  const key = `p:${pl}`;
  return `<details class="place" data-chap="${esc(key)}" ${ui.open.has(key) ? "open" : ""}><summary class="placehead"><span>${pl}</span><span class="count">${count}</span></summary>${ready
    .map((x) => monRow(x.p, x.r, pl))
    .join("")}${otherTime}${later}${once}</details>`;
}
// Places in a chapter, in the chapter's own order, then any extra places its rows use.
export function chapterSpots(all: Record<string, Spot>, i: number) {
  const list = Object.entries(all).filter(
    ([pl, s]) =>
      s.chap === i && (s.now.length || s.later.length || s.once.length),
  );
  const at = (pl: string) => {
    const k = CHAPTERS[i].places.indexOf(pl);
    return k < 0 ? 999 : k;
  };
  list.sort((a, b) => at(a[0]) - at(b[0]));
  const left = new Set(list.flatMap(([, s]) => s.now.map((x) => x.p.n)));
  const later = new Set(
    list.flatMap(([, s]) =>
      s.later.map((x) => x.p.n).filter((n) => !left.has(n)),
    ),
  );
  return {
    html: list.map(([pl, s]) => placeBlock(pl, s)).join(""),
    left: left.size,
    later: later.size,
  };
}
export const kitGroup = (title: string, keep: (id: string) => boolean) => {
  const list = P().kit.filter((k) => keep(k[0]));
  return list.length
    ? `<h3 style="margin-top:12px">${title}</h3><div class="chips" style="margin-top:8px">${list
        .map(
          (k) =>
            `<button class="chip" data-kit="${k[0]}" data-k="k-${k[0]}" aria-pressed="${R().kit.has(k[0])}"><img src="/items/${k[0]}.png" alt="" width="24" height="24" aria-hidden="true">${k[1]}</button>`,
        )
        .join("")}</div>`
    : "";
};
export const badgeRow = (list: string[][]) =>
  `<div style="display:flex;flex-wrap:wrap;margin:6px -6px">${list.map((b) => `<button class="badge" data-badge="${b[0]}" data-k="b-${b[0]}" aria-pressed="${R().badges.has(b[0])}" aria-label="${badgeName(b[0])} from ${b[1]}" title="${badgeName(b[0])} · ${b[1]}"><img src="/badges/${b[0].toLowerCase()}.png" alt="${badgeName(b[0])}" width="32" height="32"></button>`).join("")}</div>`;

// ponytail: Tabler Icons outline paths (MIT), inlined like the settings gear
const tabIcon = (d: string) =>
  `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d
    .split("|")
    .map((p) => `<path d="${p}"/>`)
    .join("")}</svg>`;
export const SETTINGS_ICON = tabIcon(
  "M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z|M9 12a3 3 0 1 0 6 0a3 3 0 1 0 -6 0",
);
export const TAB_ICONS: Record<string, string> = {
  playthroughs: tabIcon(
    "M5 12l-2 0l9 -9l9 9l-2 0|M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7|M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6",
  ),
  journey: tabIcon(
    "M12 18.5l-3 -1.5l-6 3v-13l6 -3l6 3l6 -3v7.5|M9 4v13|M15 7v5.5|M21.121 20.121a3 3 0 1 0 -4.242 0c.418 .419 1.125 1.045 2.121 1.879c1.051 -.89 1.759 -1.516 2.121 -1.879z|M19 18v.01",
  ),
  dex: tabIcon(
    "M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0|M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0|M3 12h6|M15 12h6",
  ),
  boxes: tabIcon(
    "M12 3l8 4.5l0 9l-8 4.5l-8 -4.5l0 -9l8 -4.5|M12 12l8 -4.5|M12 12l0 9|M12 12l-8 -4.5",
  ),
};
export const SLIDERS_ICON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/></svg>`;
export const CLOCK_ICON = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>`;
