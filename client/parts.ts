import FIT from "./data/sprite-fit";
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

// Tabler Icons outline paths (MIT)
const STARTER_ICONS = {
  trade: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M21 17l-18 0" /><path d="M6 10l-3 -3l3 -3" /><path d="M3 7l18 0" /><path d="M18 20l3 -3l-3 -3" /></svg>`,
  starter: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" /></svg>`,
};

const ring = (types: string[]) => {
  const a = TYPE[types[0]],
    b = TYPE[types[1] || types[0]];
  return `--t1:${a};--t2:${b}`;
};
export const sprite = (p: Species, cls = "", shiny = false, form: string | undefined = p.forms?.[0]?.id) =>
  `<img class="sprite ${cls}" src="/sprites/${P().art}/${R().trackForms && form && p.forms?.some((f) => f.id === form) ? `forms/${shiny ? "shiny/" : ""}${form}` : `${shiny ? "shiny/" : ""}${p.n}`}.png" alt="${shiny ? "Shiny " : ""}${p.name}" width="80" height="80" loading="lazy">`;
export const mon = (p: Species, shiny = false, form: string | undefined = p.forms?.[0]?.id) =>
  `<span class="mon ${R().caught.has(p.n) ? "got" : ""}" style="${ring(p.types)}${FIT[P().art]?.[(R().trackForms && form) || p.n] ? `;--z:${FIT[P().art][(R().trackForms && form) || p.n]}%` : ""}" aria-hidden="true"><b>${sprite(p, "", shiny, form)}</b></span>`;
export const lvl = (r: Row) =>
  r.m === "npc-trade"
    ? ""
    : r.lo === r.hi
      ? `Lv ${r.lo}`
      : `Lv ${r.lo} to ${r.hi}`;
// Each tag, and whether a row shows it beside the name (time of day and what blocks it).
export function tagBits(r: Row, place = r.place, chance = "") {
  const st = rowStatus(r),
    t: [string, boolean][] = [];
  const add = (html: string, side = false) => t.push([html, side]);
  add(`<span class="tag">${METHOD[r.m]?.[0] || r.m}</span>`);
  if (r.place !== place)
    add(
      `<span class="tag plain">${r.place.slice(place.length).trim() || r.place}</span>`,
    );
  if (ONE_TIME.has(r.m)) add(`<span class="tag plain">One-time</span>`);
  if (lvl(r)) add(`<span class="tag plain">${lvl(r)}</span>`);
  if (r.c && r.c < 100 && !ONE_TIME.has(r.m))
    add(`<span class="tag plain">${r.c}%${chance}</span>`);
  r.cond.forEach((c) => {
    if (TIME[c]) add(`<span class="tag time">${TIME[c]}</span>`, true);
    else if (c.startsWith("weekday-"))
      add(`<span class="tag time">${cap(c.slice(8))}s</span>`, true);
    else if (OK_COND[c] || coinLabel(c))
      add(`<span class="tag plain">${OK_COND[c] || coinLabel(c)}</span>`);
  });
  if (
    R().view !== "dexonly" &&
    st.need &&
    EVENTS[st.need] &&
    !R().hidden.has("journey") &&
    inJourney(EVENTS[st.need].chap)
  )
    add(
      `<button class="tag goto" data-goevent="${st.need}" aria-label="${st.why}. Show it in Your journey">${st.why}<span aria-hidden="true"> ›</span></button>`,
      true,
    );
  else if (st.s !== "now" && st.s !== "wrongtime")
    add(`<span class="tag ${st.kind ? `icon${st.kind === "trade" ? " muted" : ""}` : "warn"}">${st.kind ? STARTER_ICONS[st.kind] : ""}${st.why}</span>`, true);
  return t;
}
const tagRow = (t: [string, boolean][]) =>
  `<div class="tags">${t.map((x) => x[0]).join("")}</div>`;
export const rowTags = (r: Row, place = r.place, chance = "") =>
  tagRow(tagBits(r, place, chance));
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
) => {
  const t = r ? tagBits(r, place) : [],
    side = t.filter((x) => x[1]).map((x) => x[0]);
  return `<div class="row">${mon(p, redGyarados(p, r))}<div class="grow"><div class="name">${p.name}${redGyarados(p, r) ? ` <span class="shiny small">✦ ${RED_NOTE}</span>` : ""}${side.length ? ` ${side.join(" ")}` : ""}</div>${r ? tagRow(t.filter((x) => !x[1])) : `<div class="small muted">${howElse(p)}</div>`}</div>${gotBtn(p, evo)}</div>`;
};
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
  caught: Species[];
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
          caught: [],
          now: [],
          later: [],
          once: [],
        });
        if (R().caught.has(p.n)) {
          if (k < 2) s.got++, s.caught.push(p);
        } else (k === 3 ? s.once : k === 2 ? s.later : s.now).push({ p, r });
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
// Attributes for a remembered <details>: open when the player opened it, or by default unless they closed it.
export const fold = (key: string, byDefault = false) =>
  `data-chap="${esc(key)}"${byDefault ? " data-def" : ""}${ui.open.has(key) || (byDefault && !ui.shut.has(key)) ? " open" : ""}`;
export const CHEV = `<svg class="chev" viewBox="0 0 10 6" aria-hidden="true"><path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>`;
export const strip = (list: Species[], caught = false) =>
  list
    .map(
      (p) =>
        `<span class="st${caught ? " caught" : ""}" aria-hidden="true">${sprite(p)}</span>`,
    )
    .join("");
const AT: Record<string, string> = {
  "time-morning": "in the morning",
  "time-day": "by day",
  "time-night": "at night",
};
const subFold = (key: string, title: string, list: Catchable[], pl: string) =>
  list.length
    ? `<details class="fold" ${fold(key)}><summary>${title} <span class="n">· ${list.length}</span>${CHEV}</summary>${list.map((x) => monRow(x.p, x.r, pl)).join("")}</details>`
    : "";
export function placeCard(pl: string, s: Spot) {
  const here = isHere(pl),
    key = `p:${pl}`,
    rows = (l: Catchable[]) => l.map((x) => monRow(x.p, x.r, pl)).join(""),
    sorted = s.now.sort((a, b) => b.r.c - a.r.c),
    ready = sorted.filter((x) => rank(x.r) === 0),
    other = sorted.filter((x) => rank(x.r) === 1),
    times = new Set(other.map((x) => x.r.cond.find((c) => TIME[c]))),
    at = times.size === 1 ? AT[[...times][0] as string] : "",
    show = R().showLater,
    body = `<div class="body">${rows(ready)}${show ? rows(other) + rows(s.later) : ""}${s.caught.length ? `<div class="caught-here">Already caught here ${s.caught.map((p) => `<span class="st caught">${sprite(p)}</span>`).join("")}</div>` : ""}${show ? "" : subFold(`t:${pl}`, "Other times", other, pl) + subFold(`l:${pl}`, "Come back later", s.later, pl)}${subFold(`o:${pl}`, "One-time and special", s.once, pl)}</div>`,
    later = s.later.length && `${s.later.length} later`,
    open = fold(key, here),
    title = `<span class="title">${pl}${here ? `<span class="here-tag">You are here</span>` : ""}</span>`;
  if (!s.now.length && s.got)
    return `<details class="pl donepl${here ? " here" : ""}" ${open}><summary><span class="head"><span class="tick" aria-hidden="true">✓</span>${title}<span class="count">${[`All ${s.got} caught`, later].filter(Boolean).join(" · ")}${CHEV}</span></span></summary>${body}</details>`;
  if (!s.now.length)
    return `<details class="pl quietpl${here ? " here" : ""}" ${open}><summary><span class="head">${title}<span class="count">${[later && "Nothing yet", later, s.once.length && `${s.once.length} one-time`].filter(Boolean).join(" · ")}${CHEV}</span></span></summary>${body}</details>`;
  const total = s.got + s.now.length,
    extra = [
      other.length && `+${other.length} ${at || "other times"}`,
      later,
    ].filter(Boolean);
  return `<details class="pl${here ? " here" : ""}" ${open}><summary>
    <span class="head">${title}<span class="count"><span class="mini-meter" aria-hidden="true"><i style="width:${(s.got / total) * 100}%"></i></span><span><b>${s.got}</b> / ${total}<span class="sr"> caught</span></span>${CHEV}</span></span>
    <span class="strip">${strip(ready.map((x) => x.p))}${strip(s.caught, true)}${extra.length ? `<em>${extra.join(" · ")}</em>` : ""}</span>
  </summary>${body}</details>`;
}
// Places in a chapter, in the chapter's own order, then any extra places its rows use.
export function chapterSpots(
  all: Record<string, Spot>,
  i: number,
  show = (_pl: string) => true,
) {
  const list = Object.entries(all).filter(
    ([pl, s]) =>
      s.chap === i &&
      (s.now.length || s.later.length || s.once.length || s.got),
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
    html: list
      .filter(([pl]) => show(pl))
      .map(([pl, s]) => placeCard(pl, s))
      .join(""),
    left: left.size,
    later: later.size,
  };
}
export const kitGroup = (title: string, keep: (id: string) => boolean) => {
  const list = P().kit.filter((k) => keep(k[0]));
  return list.length
    ? `<h3>${title}</h3><div class="chips">${list
        .map(
          (k) =>
            `<button class="chip" data-kit="${k[0]}" data-k="k-${k[0]}" aria-pressed="${R().kit.has(k[0])}"><img src="/items/${k[0]}.png" alt="" width="24" height="24" aria-hidden="true">${k[1]}</button>`,
        )
        .join("")}</div>`
    : "";
};
export const badgeIcon = (b: string) => `/badges/${b.toLowerCase()}.png`;
export const badgeRow = (list: string[][]) =>
  `<div class="badges">${list.map((b) => `<button class="badge" data-badge="${b[0]}" data-k="b-${b[0]}" aria-pressed="${R().badges.has(b[0])}" aria-label="${badgeName(b[0])} from ${b[1]}" title="${badgeName(b[0])} · ${b[1]}"><img src="${badgeIcon(b[0])}" alt="${badgeName(b[0])}" width="32" height="32"></button>`).join("")}</div>`;

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
