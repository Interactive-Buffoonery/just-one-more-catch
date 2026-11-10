// Ported from the approved mockup: string-rendered views on one root, event delegation, no framework.
// main.ts owns auth and server calls and hands them in through the bridge.
import { VERSIONS, type GameData, type Pack } from "./packs";
import type { VersionId } from "../shared/versions";
import CSS from "./styles";
import { MAX_RUN_BYTES, runBytes } from "../shared/limits";

type Row = {
  place: string;
  chap: number;
  m: string;
  need: string | null;
  cond: string[];
  lo: number;
  hi: number;
  c: number;
  v: string;
};
type Species = {
  n: number;
  j: number | null;
  name: string;
  types: string[];
  from: string | null;
  evo: string | null;
  baby: boolean;
  rows: Row[];
  all: Row[];
};
type Mon = {
  id: number;
  n: number;
  box: "party" | number;
  nick: string;
  lvl: number | "";
  g: string;
  shiny: boolean;
  item: string;
  note: string;
};
type RunRow = {
  id: string;
  version: string;
  state: string;
  createdAt: string;
  updatedAt?: string;
};
export type Bridge = {
  auth: {
    isLoading: boolean;
    isAuthenticated: boolean;
    displayName?: string;
    email?: string;
  };
  runs: RunRow[] | undefined;
  mountSignIn(el: HTMLDivElement): boolean;
  unmountSignIn(el: HTMLDivElement): void;
  signOut(): void;
  createRun(version: string): Promise<string>;
  saveRun(id: string, state: string): Promise<unknown>;
  deleteRun(id: string): Promise<unknown>;
  deleteAccount(): Promise<unknown>;
  contact(input: {
    email: string;
    message: string;
    website: string;
  }): Promise<{ ok: boolean }>;
};

const TYPE: Record<string, string> = {
  normal: "#9a9a7c",
  fire: "#e2683c",
  water: "#4a86d8",
  grass: "#4fa25a",
  electric: "#d9b021",
  ice: "#5fbcc4",
  fighting: "#b8453a",
  poison: "#9551a6",
  ground: "#c79a4e",
  flying: "#7c8fd8",
  psychic: "#e0567f",
  bug: "#8fa531",
  rock: "#a89443",
  ghost: "#6a5aa0",
  dragon: "#5a49cf",
  dark: "#5d4c40",
  steel: "#7f97a8",
};
let CHAPTERS: GameData["chapters"] = [];
const METHOD: Record<string, [string, string | null]> = {
  walk: ["Walking", null],
  "old-rod": ["Old Rod", "old-rod"],
  "good-rod": ["Good Rod", "good-rod"],
  "super-rod": ["Super Rod", "super-rod"],
  surf: ["Surf", "surf"],
  headbutt: ["Headbutt", "headbutt"],
  "rock-smash": ["Rock Smash", "rock-smash"],
  gift: ["Gift", null],
  "gift-egg": ["Egg gift", null],
  "npc-trade": ["In-game trade", null],
  static: ["One-time encounter", null],
  "roaming-grass": ["Roaming", null],
  "squirt-bottle": ["SquirtBottle", null],
  pokeflute: ["Poké Flute", null],
};
const ONE_TIME = new Set([
  "gift",
  "gift-egg",
  "static",
  "squirt-bottle",
  "pokeflute",
  "npc-trade",
]);
const TIME: Record<string, string> = {
  "time-morning": "Morning",
  "time-day": "Day",
  "time-night": "Night",
};
const DAYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];
const OK_COND: Record<string, string> = {
  "headbutt-tree-common": "Common tree",
  "headbutt-tree-rare": "Rare tree",
  "story-progress-zephyr-badge": "After Zephyr Badge",
  "story-progress-national-dex": "After the Elite Four",
};
const STORY: Record<string, string> = {
  "story-progress-beat-red": "After beating Red",
  "story-progress-awakened-beasts": "After the Burned Tower beasts wake",
  "story-progress-vermilion-copycat": "After returning Copycat's doll",
  "story-progress-receive-tm-from-claire": "After Clair's TM",
  "story-progress-returned-machine-part": "After returning the Machine Part",
  "other-received-kanto-starter": "After getting a Kanto starter",
  "other-event-arceus-in-party": "Event Arceus in your party",
  "other-snorlax-11-beat-league": "After the Elite Four",
  "other-correct-password": "Primo's password egg",
  "radio-hoenn": "Hoenn Sound on the radio",
  "radio-sinnoh": "Sinnoh Sound on the radio",
  "swarm-yes": "Swarm only",
  "bug-catching-contest-yes": "Bug-Catching Contest",
  "trade-any-pokemon": "Trade any Pokémon",
  "headbutt-tree-secret": "Secret tree",
  "other-virtual-console": "Virtual Console event",
  "story-progress-beat-elite-four-round-two": "After the Elite Four rematch",
  "item-old-amber": "Bring the Old Amber",
  "first-party-pokemon-high-friendship": "Lead Pokémon has high friendship",
};
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);
function specialLabel(c: string) {
  if (STORY[c]) return STORY[c];
  let m = c.match(/^johto-safari-blocks-(\w+)-min-(\d+)$/);
  if (m) return `Safari: ${m[2]}+ ${m[1]} blocks`;
  m = c.match(/^item-(\w+)-fossil$/);
  if (m) return `Bring a ${cap(m[1])} Fossil`;
  if (c.startsWith("trade-"))
    return (
      "Trade a " +
      cap(c.slice(6)).replace(/-(m|f)$/, (_, g) => (g === "m" ? " ♂" : " ♀"))
    );
  if (c.startsWith("starter-")) return "If you chose " + cap(c.slice(8));
  return cap(c.replace(/-/g, " "));
}
const coinLabel = (c: string) => {
  const m = c.match(/^coins-(\d+)$/);
  return m ? `${m[1]} coins` : null;
};
const verOf = (id: string) => VERSIONS[id as VersionId];
const PARTY_SIZE = 6;
const HELD_ITEMS = [
  "Amulet Coin",
  "Black Belt",
  "BrightPowder",
  "Charcoal",
  "Dragon Scale",
  "Everstone",
  "Exp. Share",
  "King's Rock",
  "Leftovers",
  "Light Ball",
  "Lucky Egg",
  "Magnet",
  "Metal Coat",
  "Miracle Seed",
  "Mystic Water",
  "NeverMeltIce",
  "Oran Berry",
  "Poison Barb",
  "Quick Claw",
  "Scope Lens",
  "Sharp Beak",
  "Sitrus Berry",
  "Smoke Ball",
  "Soothe Bell",
  "Spell Tag",
  "Thick Club",
  "TwistedSpoon",
  "Up-Grade",
];
const LOOKS = [
  ["blossom", "Blossom", "Sakura / Rosé Pine"],
  ["vampire", "Vampire", "Alucard / Dracula"],
];
const PALETTE: Record<string, { light: string; dark: string }> = {
  blossom: { light: "sakura", dark: "rosepine" },
  vampire: { light: "alucard", dark: "dracula" },
};

/* ---- Run state ---- */
type Run = {
  id: string;
  version: string;
  badges: Set<string>;
  kit: Set<string>;
  safari: Set<string>;
  caught: Set<number>;
  skip: Set<number>;
  here: string;
  timeAuto: boolean;
  time: string;
  boxNames: string[];
  mons: Mon[];
  monSeq: number;
  lastBox: "party" | number;
};
const MON_DEFAULTS = {
  nick: "",
  lvl: "",
  g: "",
  shiny: false,
  item: "",
  note: "",
};
const compactMon = (m: Mon) =>
  Object.fromEntries(
    Object.entries(m).filter(([k, v]) => (MON_DEFAULTS as any)[k] !== v),
  );
function loadRun(row: RunRow): Run {
  const pack = verOf(row.version).pack;
  let s: any = {};
  try {
    s = JSON.parse(row.state) || {};
  } catch {}
  return {
    id: row.id,
    version: row.version,
    badges: new Set(s.badges || []),
    kit: new Set(s.kit || []),
    safari: new Set(s.safari || []),
    caught: new Set(s.caught || []),
    skip: new Set(s.skip || []),
    here: s.here || pack.start,
    timeAuto: s.timeAuto ?? true,
    time: s.time || "day",
    boxNames:
      s.boxNames ||
      Array.from({ length: pack.boxes[0] }, (_, i) => `Box ${i + 1}`),
    mons: (s.mons || []).map((m: Mon) => ({ ...MON_DEFAULTS, ...m })),
    monSeq: s.monSeq || 0,
    lastBox: s.lastBox ?? 1,
  };
}
const dumpRun = (r: Run) =>
  JSON.stringify({
    badges: [...r.badges],
    kit: [...r.kit],
    safari: [...r.safari],
    caught: [...r.caught],
    skip: [...r.skip],
    here: r.here,
    timeAuto: r.timeAuto,
    time: r.time,
    boxNames: r.boxNames,
    mons: r.mons.map(compactMon),
    monSeq: r.monSeq,
    lastBox: r.lastBox,
  });

let bridge: Bridge;
let run: Run | null = null;
let DEX: Species[] = [];
let byName: Record<string, Species> = {},
  byN: Record<number, Species> = {};
const ui: any = {
  tab: "journey",
  boxFilter: "all",
  filter: "now",
  bulk: false,
  undo: null,
  sheet: null,
  open: new Set(),
  look: "blossom",
  mode: "auto",
  saved: "",
  saving: false,
  sent: false,
  sendError: "",
};
const store = {
  get: (k: string) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set: (k: string, v: string) => {
    try {
      localStorage.setItem(k, v);
    } catch {}
  },
};

const loaded = new Map<Pack, GameData>();
let opening: string | null = null;
function useRun(row: RunRow) {
  const v = verOf(row.version),
    data = loaded.get(v.pack);
  if (!data) {
    run = null;
    opening = row.id;
    v.pack.load().then(
      (d) => {
        loaded.set(v.pack, d);
        if (opening !== row.id) return;
        opening = null;
        const latest = bridge.runs?.find((r) => r.id === row.id);
        if (latest) useRun(latest);
        if (!$("#sheet").open) render();
      },
      () => {
        if (opening !== row.id) return;
        opening = null;
        ui.loadError = true;
        render();
      },
    );
    return;
  }
  opening = null;
  ui.loadError = false;
  run = loadRun(row);
  CHAPTERS = data.chapters;
  DEX = data.dex.map((p) => ({
    ...p,
    all: p.rows,
    rows: p.rows.filter((r: Row) => r.v.includes(v.code)),
  }));
  byName = Object.fromEntries(DEX.map((p) => [p.name, p]));
  byN = Object.fromEntries(DEX.map((p) => [p.n, p]));
  ui.saved = dumpRun(run);
  ui.skip = new Set();
  store.set("jomc.run", row.id);
}
const R = () => run as Run;
const ver = () => verOf(R().version);
const P = () => ver().pack;
const e4 = () => R().badges.has("Elite Four");
const visible = (p: Species) => !!p.j || e4();
const dexList = () =>
  DEX.filter(visible).sort((a, b) =>
    e4() ? a.n - b.n : (a.j as number) - (b.j as number),
  );
const num = (p: Species) => (e4() || !p.j ? p.n : p.j);
const pad = (n: number) => String(n).padStart(3, "0");
const regionalCaught = () => [...R().caught].filter((n) => byN[n]?.j).length;

const gameTime = () => {
  const h = new Date().getHours(),
    night = P().nightFrom ?? 24;
  return h >= 4 && h < 10 ? "morning" : h >= 10 && h < night ? "day" : "night";
};
const nowTime = () => (R().timeAuto ? gameTime() : R().time);
const isHere = (pl: string) => pl === R().here || pl.startsWith(R().here + " ");
const kitName = (k: string) => (P().kit.find((x) => x[0] === k) as string[])[1];
const unlocked = (i: number) =>
  CHAPTERS[i].needs.every((b) => R().badges.has(b)) &&
  (!CHAPTERS[i].kit || R().kit.has(CHAPTERS[i].kit as string));
const chapterOf = (place: string) =>
  Math.max(
    0,
    CHAPTERS.findIndex((c) => c.places.includes(place)),
  );
const currentChap = () => {
  const h = chapterOf(R().here);
  return unlocked(h)
    ? h
    : CHAPTERS.reduce((c, _, i) => (unlocked(i) ? i : c), 0);
};
function rowStatus(r: Row): { s: string; why?: string } {
  const ch = CHAPTERS[r.chap],
    run = R();
  const missing = ch.needs.find((b) => !run.badges.has(b));
  if (missing)
    return {
      s: "later",
      why:
        missing === "Elite Four"
          ? "After the Elite Four"
          : `Opens with ${missing} Badge`,
    };
  for (const need of [ch.kit, METHOD[r.m]?.[1], r.need])
    if (need && !run.kit.has(need))
      return { s: "later", why: `Needs ${kitName(need)}` };
  if (
    r.cond.includes("story-progress-zephyr-badge") &&
    !run.badges.has("Zephyr")
  )
    return { s: "later", why: "Opens with Zephyr Badge" };
  if (
    (r.cond.includes("story-progress-national-dex") ||
      r.cond.includes("other-snorlax-11-beat-league")) &&
    !e4()
  )
    return { s: "later", why: "After the Elite Four" };
  const area = r.place.startsWith("Safari Zone ") && r.place.slice(12);
  if (area && P().safari?.includes(area) && !run.safari.has(area))
    return { s: "later", why: `Place the ${area} area` };
  if (
    r.m === "gift" &&
    r.place === P().start &&
    P().starters.some((n) => run.caught.has(n))
  )
    return { s: "special", why: "You chose a different starter" };
  const days = r.cond
    .filter((c) => c.startsWith("weekday-"))
    .map((c) => c.slice(8));
  const special = r.cond.filter(
    (c) =>
      !TIME[c] && !OK_COND[c] && !coinLabel(c) && !c.startsWith("weekday-"),
  );
  if (special.length)
    return { s: "special", why: special.map(specialLabel).join(", ") };
  const times = r.cond.filter((c) => TIME[c]).map((c) => TIME[c]);
  if (times.length && !times.map((t) => t.toLowerCase()).includes(nowTime()))
    return { s: "wrongtime", why: times.join(" / ") + " only" };
  if (days.length && !days.includes(DAYS[new Date().getDay()]))
    return {
      s: "wrongtime",
      why: days.map((d) => cap(d) + "s").join(" / ") + " only",
    };
  return { s: "now" };
}
function howElse(p: Species) {
  const v = ver();
  const elsewhere = (s: Species) => s.all.some((r) => !r.v.includes(v.code));
  const trade = (s: Species) =>
    elsewhere(s) && v.other
      ? `Not in ${v.name}. Trade from ${v.other}.`
      : `Not in ${v.name}${v.other ? ` or ${v.other}` : ""}. Trade from another game.`;
  if (!p.from) {
    if (p.baby) {
      const parent = DEX.find((x) => x.from === p.name);
      return `Breed ${parent ? parent.name : "its evolution"} and hatch the egg.`;
    }
    if (p.rows.length) return "";
    return trade(p);
  }
  const pre = byName[p.from];
  if (pre && !pre.rows.length && !pre.from && !pre.baby) return trade(pre);
  const how = p.evo || "evolution";
  return `Evolve ${p.from}: ${how}.${/Trade|Level up at/.test(how) ? " Needs a second game." : ""}`;
}
const ORDER: Record<string, number> = {
  now: 0,
  wrongtime: 1,
  special: 2,
  later: 3,
};
const speciesStatus = (p: Species) => {
  if (R().caught.has(p.n)) return "caught";
  const s = p.rows.map((r) => rowStatus(r).s);
  return s.includes("now")
    ? "now"
    : s.some((x) => x !== "later")
      ? "soon"
      : s.length
        ? "later"
        : "other";
};

/* ---- Rendering helpers ---- */
let root: HTMLElement;
const $ = (s: string) => root.querySelector(s) as any;
const esc = (v: unknown) =>
  String(v).replace(
    /[&<>"]/g,
    (c) =>
      (({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }) as any)[c],
  );
const ring = (types: string[]) => {
  const a = TYPE[types[0]],
    b = TYPE[types[1] || types[0]];
  return `background:linear-gradient(135deg,${a} 50%,${b} 50%)`;
};
const mon = (p: Species) =>
  `<span class="mon ${R().caught.has(p.n) ? "got" : ""}" style="${ring(p.types)}" aria-hidden="true"><b>${num(p)}</b></span>`;
const lvl = (r: Row) =>
  r.m === "npc-trade"
    ? ""
    : r.lo === r.hi
      ? `Lv ${r.lo}`
      : `Lv ${r.lo} to ${r.hi}`;
function rowTags(r: Row) {
  const st = rowStatus(r),
    t = [`<span class="tag">${METHOD[r.m]?.[0] || r.m}</span>`];
  if (ONE_TIME.has(r.m)) t.push(`<span class="tag plain">One-time</span>`);
  if (lvl(r)) t.push(`<span class="tag plain">${lvl(r)}</span>`);
  if (r.c && r.c < 100 && !ONE_TIME.has(r.m))
    t.push(`<span class="tag plain">${r.c}%</span>`);
  r.cond.forEach((c) => {
    if (TIME[c]) t.push(`<span class="tag time">${TIME[c]}</span>`);
    else if (OK_COND[c] || coinLabel(c))
      t.push(`<span class="tag plain">${OK_COND[c] || coinLabel(c)}</span>`);
  });
  if (st.s !== "now" && st.s !== "wrongtime")
    t.push(`<span class="tag warn">${st.why}</span>`);
  return `<div class="tags">${t.join("")}</div>`;
}
const gotBtn = (p: Species) =>
  `<button class="got-btn" data-toggle="${p.n}" data-k="t${p.n}" aria-pressed="${R().caught.has(p.n)}" aria-label="${p.name} caught">${R().caught.has(p.n) ? "✓ Caught" : "Caught?"}</button>`;
const monRow = (p: Species, r: Row | null) =>
  `<div class="row">${mon(p)}<div class="grow"><div class="name">${p.name}</div>${r ? rowTags(r) : `<div class="small muted">${howElse(p)}</div>`}</div>${gotBtn(p)}</div>`;
type Pick = { p: Species; r: Row };
const pref = (a: Pick, b: Pick) =>
  +isHere(b.r.place) - +isHere(a.r.place) ||
  b.r.chap - a.r.chap ||
  b.r.c - a.r.c;
function catchableNow() {
  const out: Pick[] = [];
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
function chapterGroups(chap: number) {
  const g: Record<string, Pick[]> = {};
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
const uniq = (g: Record<string, Pick[]>) => Object.values(g).flat().length;
const badgeRow = (list: string[][]) =>
  `<div style="display:flex;flex-wrap:wrap;margin:6px -6px">${list.map((b) => `<button class="badge" data-badge="${b[0]}" data-k="b-${b[0]}" aria-pressed="${R().badges.has(b[0])}" aria-label="${b[0]} Badge from ${b[1]}" title="${b[0]} Badge · ${b[1]}"><i></i></button>`).join("")}</div>`;

/* ---- Journey (home) ---- */
const why = (h: Pick) =>
  isHere(h.r.place)
    ? h.r.c
      ? `${h.r.c}% here, your best shot`
      : "Right here, your best shot"
    : h.r.chap === currentChap()
      ? "Best odds in this chapter"
      : `Best odds in ${CHAPTERS[h.r.chap].title}`;
function heroCard(h: Pick) {
  const a = TYPE[h.p.types[0]],
    b = TYPE[h.p.types[1] || h.p.types[0]],
    st = rowStatus(h.r);
  return `<section class="hv-field" aria-labelledby="hero-name">
      <div class="hv-band" style="--t1:${a};--t2:${b}"><span class="hv-no" aria-hidden="true">#${pad(num(h.p))}</span>
        <h2 id="hero-name">${h.p.name}</h2><div>${h.p.types.map((t) => `<span class="hv-type" style="--tc:${TYPE[t]}">${cap(t)}</span>`).join("")}</div><div class="hv-why">${why(h)}</div></div>
      <dl class="hv-facts"><div><dt>Where</dt><dd>${h.r.place}</dd></div><div><dt>How</dt><dd>${METHOD[h.r.m]?.[0] || h.r.m}</dd></div><div><dt>Level</dt><dd>${lvl(h.r) || "?"}</dd></div><div><dt>Chance</dt><dd>${h.r.c ? h.r.c + "%" : "?"}</dd></div></dl>
      ${h.r.cond.some((c) => TIME[c]) || st.s !== "now" ? rowTags(h.r) : ""}
      <div class="hv-actions"><button class="app-primary grow" data-catch="${h.p.n}" data-k="hero-${h.p.n}" aria-label="${h.p.name} caught">Caught it!</button><button class="app-quiet" data-skip="${h.p.n}" data-k="skip">Not now</button></div>
    </section>`;
}
const NOT_HERE =
  /Gym|Game Corner|North Gate|Roaming|House|Pokémon Center|Department Store|Prize Corner|Museum|Silph|Magnet Train|Dock|Embedded|Sinjoh|Celadon Mansion|Cinnabar Lab|Dojo/;
function Journey() {
  if (!run) return NoRun();
  const r = R(),
    cur = currentChap(),
    now = catchableNow();
  const hero = now.find((x) => !r.skip.has(x.p.n));
  const herePlaces = CHAPTERS.filter((_, i) => unlocked(i))
    .flatMap((c) => c.places)
    .filter((p) => !NOT_HERE.test(p));
  const atHere = now.filter((x) => isHere(x.r.place) && x.p.n !== hero?.p.n);
  const curG = chapterGroups(cur);
  const evolve = DEX.filter(
    (p) =>
      visible(p) &&
      !r.caught.has(p.n) &&
      p.from &&
      r.caught.has(byName[p.from]?.n) &&
      p.evo &&
      !/Trade|Level up at/.test(p.evo),
  );
  return `<div class="cols"><div class="colmain">
  <div class="chips">
    <label class="sr" for="here">Where you are in the game</label>
    <select class="pill" id="here" data-k="here">${herePlaces.map((p) => `<option ${p === r.here ? "selected" : ""} value="${p}">Near ${p}</option>`).join("")}</select>
    ${
      P().nightFrom
        ? `<div class="seg3" role="group" aria-label="In-game time of day">
      <button data-time="auto" data-k="ta" aria-pressed="${r.timeAuto}">Auto (${cap(gameTime())})</button>
      ${["morning", "day", "night"].map((x) => `<button data-time="${x}" data-k="t-${x}" aria-pressed="${!r.timeAuto && r.time === x}">${cap(x)}</button>`).join("")}
    </div>`
        : ""
    }
  </div>
  ${hero ? heroCard(hero) : now.length ? `<section class="hero"><h2>You've skipped every suggestion</h2><p style="margin:6px 0 12px">${now.length} Pokémon are still catchable right now.</p><button class="btn" data-unskip="1" data-k="unskip2">Show them again</button></section>` : `<section class="hero"><h2>Nothing left to catch right now</h2><p style="margin:6px 0 0">Try another time of day, or move ahead in the story.</p></section>`}
  ${r.skip.size ? `<div style="text-align:right;margin-top:8px"><button class="chip" data-unskip="1" data-k="unskip">Show ${r.skip.size} skipped</button></div>` : ""}
  ${atHere.length ? `<div class="eyebrow">Also near ${r.here}</div>${atHere.map((x) => monRow(x.p, x.r)).join("")}` : ""}
  <div class="eyebrow">${CHAPTERS[cur].title} · ${uniq(curG)} to find</div>
  ${
    Object.entries(curG)
      .map(
        ([place, list]) =>
          `<div class="place"><div class="placehead"><span>${place}</span><span>${list.length}</span></div>${list.map((x) => monRow(x.p, x.r)).join("")}</div>`,
      )
      .join("") ||
    `<p class="muted">You've caught everything in this chapter.</p>`
  }
  </div><aside class="colside">
  ${evolve.length ? `<div class="eyebrow">Evolution options · ${evolve.length}</div>${evolve.map((p) => monRow(p, null)).join("")}` : ""}
  <div class="eyebrow">Your journey</div>
  <div class="card" style="padding:4px 16px">
    ${CHAPTERS.map((c, i) => {
      if (
        i === cur ||
        (!e4() && c.needs.includes("Elite Four")) ||
        (!e4() && i === CHAPTERS.length - 1)
      )
        return "";
      const g = chapterGroups(i),
        n = uniq(g),
        open = unlocked(i);
      return `<details class="chap" data-chap="${i}" ${ui.open.has(i) ? "open" : ""}><summary><span class="node ${open ? "done" : ""}" aria-hidden="true">${open ? "✓" : i + 1}</span><span style="flex:1">${c.title}<span class="sr">${open ? ", reached" : ", not reached yet"}</span></span><span class="muted small">${n ? `${n} ${open ? "still out there" : "to come"}` : "all caught"}</span></summary>
        ${Object.entries(g)
          .map(
            ([place, list]) =>
              `<div class="place"><div class="placehead"><span>${place}</span></div>${list.map((x) => monRow(x.p, x.r)).join("")}</div>`,
          )
          .join("")}<div style="height:10px"></div></details>`;
    }).join("")}
  </div>
  <div class="eyebrow">Progress</div>
  <div class="card">
    <h3>${P().region} badges</h3>
    ${badgeRow(P().badges)}
    <button class="chip" style="margin-top:6px" data-badge="Elite Four" data-k="b-e4" aria-pressed="${e4()}">Beat the Elite Four</button>
    ${e4() && P().postgame ? `<h3 style="margin-top:12px">${P().postgame![0]}</h3>${badgeRow(P().postgame![1])}` : ""}
    <h3 style="margin-top:12px">Items and moves you have</h3>
    <div class="chips" style="margin-top:8px">${P().kit.map((k) => `<button class="chip" data-kit="${k[0]}" data-k="k-${k[0]}" aria-pressed="${r.kit.has(k[0])}">${k[1]}</button>`).join("")}</div>
    ${
      P().safari &&
      unlocked(CHAPTERS.findIndex((c) => c.places.includes("Safari Zone")))
        ? `<h3 style="margin-top:12px">Safari Zone: areas you've placed</h3>
    <p class="small muted" style="margin:4px 0 0">The game lets you place 6 of its 12 areas at a time. Pick the ones you've chosen:</p>
    <div class="chips" style="margin-top:8px">${P().safari!.map((a) => `<button class="chip" data-safari="${a}" data-k="s-${a}" aria-pressed="${r.safari.has(a)}" ${!r.safari.has(a) && r.safari.size >= 6 ? "disabled" : ""}>${a}</button>`).join("")}</div>`
        : ""
    }
    <div style="display:flex;justify-content:space-between;margin-top:16px"><h3>${P().region} dex</h3><span><b>${regionalCaught()}</b> <span class="muted">/ ${P().regional}</span></span></div>
    <div class="bar" style="margin-top:6px"><i style="width:${(regionalCaught() / P().regional) * 100}%"></i></div>
    ${
      e4() && P().national > P().regional
        ? `<div style="display:flex;justify-content:space-between;margin-top:12px"><h3>National dex</h3><span><b>${r.caught.size}</b> <span class="muted">/ ${P().national}</span></span></div>
    <div class="bar" style="margin-top:6px"><i style="width:${(r.caught.size / P().national) * 100}%"></i></div>`
        : ""
    }
  </div>
  </aside></div>`;
}
const NoRun = () => `<div class="narrow">${pickGame()}</div>`;

/* ---- Dex ---- */
const STATUS_TEXT: Record<string, string> = {
  caught: "Caught",
  now: "Catchable now",
  soon: "Other time or special",
  later: "Later in the story",
  other: "Evolve, breed or trade",
};
function Dex() {
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
function fillSpecies(n: number) {
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
function fillSheet(s: any) {
  typeof s === "number"
    ? fillSpecies(s)
    : s.kind === "signin"
      ? fillSignIn()
      : s.kind === "newrun"
        ? fillNewRun()
        : s.kind === "settings"
        ? ($("#sheetbody").innerHTML =
            `<h2 id="sheet-title">Settings</h2>${Appearance()}<div style="display:flex;justify-content:flex-end;margin-top:16px"><button class="chip" data-close="1">Done</button></div>`)
        : s.kind === "box"
          ? fillBoxSheet(s.b)
          : fillMonSheet(s);
}
function openSheet(s: any) {
  ui.sheet = s;
  fillSheet(s);
  if (!$("#sheet").open) $("#sheet").showModal();
}

/* ---- Boxes ---- */
const inBox = (b: Mon["box"]) => R().mons.filter((m) => m.box === b);
const boxLabel = (b: Mon["box"]) =>
  b === "party" ? "Party" : R().boxNames[b - 1];
const boxCap = (b: Mon["box"]) => (b === "party" ? PARTY_SIZE : P().boxes[1]);
const allBoxes = (): Mon["box"][] => [
  "party",
  ...Array.from({ length: P().boxes[0] }, (_, i) => i + 1),
];
const GENDER: Record<string, string> = { m: "♂", f: "♀" };
function monLine(m: Mon, showBox?: boolean) {
  const p = byN[m.n];
  return `<button class="row monrow" data-editmon="${m.id}" data-k="m${m.id}" aria-label="${esc(m.nick || p.name)}${m.nick ? `, ${p.name}` : ""}${m.shiny ? ", shiny" : ""}, ${esc(boxLabel(m.box))}. Edit">${mon(p)}<span class="grow">
    <span class="name">${m.nick ? `${esc(m.nick)} <span class="muted small">${p.name}</span>` : p.name}${m.shiny ? ` <span class="shiny" title="Shiny">✦</span>` : ""}</span>
    <span class="tags">${showBox ? `<span class="tag">${esc(boxLabel(m.box))}</span>` : ""}${m.lvl ? `<span class="tag plain">Lv ${m.lvl}</span>` : ""}${m.g ? `<span class="tag plain">${GENDER[m.g]}</span>` : ""}${m.item ? `<span class="tag time">${esc(m.item)}</span>` : ""}${m.note ? `<span class="small muted">${esc(m.note)}</span>` : ""}</span></span></button>`;
}
function Boxes() {
  if (!run) return NoRun();
  const f = ui.boxFilter,
    keep = (m: Mon) => f === "all" || (f === "items" ? !!m.item : m.shiny);
  const card = (b: Mon["box"]) => {
    const ms = inBox(b).filter(keep);
    if (!ms.length && (f !== "all" || b !== "party")) return "";
    return `<section class="card boxcard"><div class="boxhead"><h3>${esc(boxLabel(b))}</h3><span class="muted small">${inBox(b).length} / ${boxCap(b)}</span><span class="spacer"></span>${b === "party" ? "" : `<button class="chip" data-renamebox="${b}" data-k="rb${b}">Rename</button>`}</div>${ms.map((m) => monLine(m)).join("") || `<p class="small muted" style="margin:0">Nobody in your party yet.</p>`}</section>`;
  };
  const empty = allBoxes().filter((b) => b !== "party" && !inBox(b).length);
  return `<div style="display:flex;gap:12px;align-items:baseline;flex-wrap:wrap"><h2>Boxes</h2><span class="muted">${R().mons.length} Pokémon</span></div>
  <div class="chips" style="margin:12px 0">${[
    ["all", "All"],
    ["items", "Holding an item"],
    ["shiny", "Shiny"],
  ]
    .map(
      ([k, l]) =>
        `<button class="chip" data-boxfilter="${k}" data-k="bf-${k}" aria-pressed="${f === k}">${l}</button>`,
    )
    .join("")}</div>
  <div class="boxgrid">${allBoxes().map(card).join("") || `<p class="muted">Nothing here.</p>`}</div>
  ${f === "all" && empty.length ? `<details class="card" style="margin-top:12px"><summary><b>${empty.length} empty boxes</b></summary><div class="chips" style="margin-top:10px">${empty.map((b) => `<button class="chip" data-renamebox="${b}" data-k="rb${b}">${esc(boxLabel(b))}</button>`).join("")}</div></details>` : ""}`;
}
function fillMonSheet(s: any) {
  const m = s.id ? R().mons.find((x) => x.id === s.id) : null,
    p = byN[m ? m.n : s.n];
  const cur = m ? m.box : R().lastBox,
    full = (b: Mon["box"]) =>
      inBox(b).filter((x) => x !== m).length >= boxCap(b);
  const title = m
    ? `Edit ${esc(m.nick || p.name)}`
    : s.isNew
      ? `Where did you put ${p.name}?`
      : `Add another ${p.name}`;
  $("#sheetbody").innerHTML =
    `<div style="display:flex;gap:12px;align-items:center">${mon(p)}<div><h2 id="sheet-title">${title}</h2></div></div>
    <label class="field"><span>Box</span><select id="f-box">${allBoxes().map((b) => `<option value="${b}" ${b === cur ? "selected" : ""} ${full(b) && b !== cur ? "disabled" : ""}>${esc(boxLabel(b))} (${inBox(b).length}/${boxCap(b)})</option>`).join("")}</select></label>
    <details class="more" ${m ? "open" : ""}><summary>More details <span class="muted small">nickname, level, held item</span></summary><div class="fgrid">
      <label class="field"><span>Nickname</span><input id="f-nick" maxlength="10" autocomplete="off" value="${esc(m?.nick || "")}"></label>
      <label class="field"><span>Level</span><input id="f-lvl" type="number" min="1" max="100" inputmode="numeric" value="${m?.lvl || ""}"></label>
      <label class="field"><span>Gender</span><select id="f-g">${[
        ["", "Not set"],
        ["m", "♂ Male"],
        ["f", "♀ Female"],
      ]
        .map(
          ([v, l]) =>
            `<option value="${v}" ${(m?.g || "") === v ? "selected" : ""}>${l}</option>`,
        )
        .join("")}</select></label>
      <label class="field"><span>Held item</span><input id="f-item" list="held-items" placeholder="None" maxlength="20" autocomplete="off" value="${esc(m?.item || "")}"></label>
      <label class="field span2"><span>Note</span><input id="f-note" placeholder="Knows Surf, saving for a trade" maxlength="80" autocomplete="off" value="${esc(m?.note || "")}"></label>
      <label class="check span2"><input id="f-shiny" type="checkbox" ${m?.shiny ? "checked" : ""}> Shiny</label>
    </div></details>
    <datalist id="held-items">${HELD_ITEMS.map((i) => `<option value="${esc(i)}">`).join("")}</datalist>
    <div class="hv-actions" style="margin-top:20px"><button class="app-primary grow" data-savemon="1">Save</button>${m ? `<button class="app-quiet" data-delmon="${m.id}">Remove</button>` : `<button class="app-quiet" data-close="1">${s.isNew ? "Skip" : "Cancel"}</button>`}</div>`;
}
function fillBoxSheet(b: number) {
  $("#sheetbody").innerHTML =
    `<h2 id="sheet-title">Rename ${esc(boxLabel(b))}</h2>
    <label class="field"><span>Name</span><input id="f-boxname" maxlength="8" autocomplete="off" value="${esc(boxLabel(b))}"></label>
    <div class="hv-actions" style="margin-top:20px"><button class="app-primary grow" data-savebox="1">Save</button><button class="app-quiet" data-close="1">Cancel</button></div>`;
}
function saveMon() {
  const s = ui.sheet,
    v = (id: string) => $("#" + id),
    raw = v("f-box").value,
    box = raw === "party" ? "party" : +raw;
  const lvl = v("f-lvl").value
    ? Math.min(100, Math.max(1, Math.round(+v("f-lvl").value)))
    : "";
  const data = {
    box,
    lvl,
    nick: v("f-nick").value.trim().slice(0, 10),
    g: v("f-g").value,
    item: v("f-item").value.trim().slice(0, 20),
    note: v("f-note").value.trim().slice(0, 80),
    shiny: v("f-shiny").checked,
  };
  const r = R();
  if (s.id) Object.assign(r.mons.find((m) => m.id === s.id) as Mon, data);
  else {
    const m = { id: ++r.monSeq, n: s.n, ...data } as Mon;
    r.mons.push(m);
    r.caught.add(s.n);
    if (ui.undo?.n === s.n && !ui.undo.had) ui.undo.monId = m.id;
  }
  r.lastBox = box;
  $("#live").textContent = `Saved to ${boxLabel(box)}`;
}

/* ---- Runs, account and sign-in ---- */
const badgeCount = (r: Run) => {
  const p = verOf(r.version).pack;
  return [...p.badges, ...(p.postgame?.[1] || [])].filter((b) =>
    r.badges.has(b[0]),
  ).length;
};
const cover = (v: (typeof VERSIONS)[VersionId], cls = "") =>
  `<img class="cover ${cls}" src="/covers/${v.short.toLowerCase()}.jpg" alt="" width="46" height="46">`;
const gameChoices = () =>
  `<div class="game-options">${Object.entries(VERSIONS)
    .map(
      ([id, v]) =>
        `<button class="game-choice" data-newrun="${id}">${cover(v, "sm")}${v.name}</button>`,
    )
    .join("")}</div>`;
const pickGame = () =>
  `<section class="empty"><h2>Pick a game</h2>${gameChoices()}<p class="muted small">No account needed. More games coming soon.</p></section>`;
const MAX_RUNS = 20;
function fillNewRun() {
  const full = (bridge.runs?.length || 0) >= MAX_RUNS;
  $("#sheetbody").innerHTML =
    `<h2 id="sheet-title">New playthrough</h2>${full ? `<p class="muted">You have ${MAX_RUNS} playthroughs. Delete one to start another.</p>` : gameChoices()}<div style="display:flex;justify-content:flex-end;margin-top:16px"><button class="chip" data-close="1">Cancel</button></div>`;
}
const lastPlayed = (iso: string) => {
  const day = (d: Date) => new Date(d).setHours(0, 0, 0, 0),
    n = Math.round((day(new Date()) - day(new Date(iso))) / 864e5);
  return n <= 0
    ? "today"
    : n === 1
      ? "yesterday"
      : n < 7
        ? `${n} days ago`
        : `on ${new Date(iso).toLocaleDateString()}`;
};
const champion = (r: Run) => r.badges.has("Elite Four");
function nextGoal(r: Run) {
  const p = verOf(r.version).pack,
    badge = (list: string[][]) => list.find((b) => !r.badges.has(b[0]));
  const next = champion(r)
    ? badge(p.postgame?.[1] || [])
    : badge(p.badges) || ["the Elite Four"];
  return next
    ? `Next: ${next[0]}${next[1] ? ` Badge, ${next[1]}` : ""}`
    : "Finish the Pokédex";
}
function playthroughRow(row: RunRow, r: Run) {
  const v = verOf(row.version),
    p = v.pack,
    all = [...p.badges, ...(p.postgame?.[1] || [])];
  return `<article class="pt"><div class="pt-id">${cover(v)}<div><h3>${v.name}</h3><span class="small muted">Started ${new Date(row.createdAt).toLocaleDateString()}</span></div></div>
    <div class="pt-m"><b>${badgeCount(r)} / ${all.length}</b><span class="pt-ml"> badges</span><div class="diamonds" aria-hidden="true">${all.map((b) => `<i class="${r.badges.has(b[0]) ? "on" : ""}"></i>`).join("")}</div></div>
    <div class="pt-m"><b>${r.caught.size}</b> / ${p.national}<span class="pt-ml"> caught</span><div class="catchbar" aria-hidden="true"><i style="width:${(r.caught.size / p.national) * 100}%"></i></div></div>
    <div class="pt-goal">${champion(r) ? `<b class="champ">Champion</b> ` : ""}${nextGoal(r)}<span class="small muted">${p.region} · last played ${lastPlayed(row.updatedAt || row.createdAt)}</span></div>
    <div class="pt-act"><button class="app-quiet" data-switch="${row.id}" aria-label="Continue ${v.name}">Continue <span aria-hidden="true">→</span></button><button class="linkish small muted" data-delrun="${row.id}" aria-label="Delete this ${v.name} playthrough">Delete</button></div></article>`;
}
function Runs() {
  const a = bridge.auth,
    rows = [...(bridge.runs || [])]
      .map((row) => ({
        row,
        r: row.id === run?.id ? R() : loadRun(row),
        at: row.updatedAt || row.createdAt,
      }))
      .sort((x, y) => y.at.localeCompare(x.at)),
    f = ui.runFilter || "all",
    many = rows.length > 1,
    done = rows.filter((x) => champion(x.r)).length,
    top = rows[0];
  const shown = rows.filter(
    (x) => f === "all" || (f === "finished") === champion(x.r),
  );
  return `<div class="dash"><div class="home-title"><h2>Your playthroughs</h2>${rows.length ? `<button class="app-primary" data-newsheet="1">+ New playthrough</button>` : ""}</div>
  ${
    !rows.length
      ? pickGame()
      : `${
          many && f === "all"
            ? `<section class="resume">${cover(verOf(top.row.version), "lg")}<div class="grow"><p class="small">Last played ${lastPlayed(top.at)}</p><h3>${verOf(top.row.version).name}</h3><p class="small">${badgeCount(top.r)} badges · ${top.r.caught.size} caught</p></div><button class="app-primary" data-switch="${top.row.id}">Continue <span aria-hidden="true">→</span></button></section>`
            : ""
        }${
          many
            ? `<div class="chips pt-filters" role="group" aria-label="Filter playthroughs">${[
                ["all", "All", rows.length],
                ["playing", "Playing", rows.length - done],
                ["finished", "Finished", done],
              ]
                .map(
                  ([k, l, n]) =>
                    `<button class="chip" data-runfilter="${k}" aria-pressed="${f === k}">${l} ${n}</button>`,
                )
                .join("")}</div>`
            : ""
        }<div class="pt-head" aria-hidden="true"><span>Game</span><span>Badges</span><span>Caught</span><span>Next goal</span><span></span></div>
  ${shown.map((x) => playthroughRow(x.row, x.r)).join("") || `<p class="muted">Nothing here yet.</p>`}`
  }
  <div class="narrow"><div class="eyebrow">Account</div>
  ${
    a.isAuthenticated
      ? `<div class="card"><div style="display:flex;gap:12px;align-items:center"><span class="avatar" aria-hidden="true">${esc(initial())}</span><div style="flex:1"><b>${esc(a.displayName || "Trainer")}</b><div class="small muted">${a.email ? `Signed in as ${esc(a.email)}` : "Signed in"}</div></div><button class="chip" data-signout="1">Sign out</button></div>
  <div class="chips" style="margin-top:12px"><button class="chip" data-download="1">Download my data</button><button class="chip" data-delaccount="1">Delete account</button></div></div>`
      : `<div class="card"><button class="chip" data-signinsheet="1">Sign in</button><p class="muted small" style="margin:12px 0 0">${MOVE_NOTE}</p></div>`
  }</div></div>`;
}
const MOVE_NOTE =
  "Playthroughs already saved in your local browser are moved to your account once you sign in.";
function fillSignIn() {
  $("#sheetbody").innerHTML =
    `<h2 id="sheet-title">Sign in</h2><div id="clerk-signin" style="margin-top:16px"></div><p class="muted small" style="margin:12px 0 0">${MOVE_NOTE}</p>`;
  const el = $("#clerk-signin") as HTMLDivElement;
  if (!bridge.mountSignIn(el))
    el.innerHTML = `<p class="muted" style="margin:0">Sign-in isn't available right now. You can keep playing as a guest.</p>`;
}
const Appearance = () => `<div class="card" style="margin-top:16px">
    <div class="name">Look</div>
    <div class="chips" style="margin-top:6px">${LOOKS.map(([k, l, sub]) => `<button class="chip" data-look="${k}" data-k="look-${k}" aria-pressed="${ui.look === k}">${l} <span class="small" style="opacity:.75">${sub}</span></button>`).join("")}</div>
    <div class="name" style="margin-top:14px">Mode</div>
    <div class="chips" style="margin-top:6px">${[
      ["auto", "Match device"],
      ["light", "Light"],
      ["dark", "Dark"],
    ]
      .map(
        ([k, l]) =>
          `<button class="chip" data-mode="${k}" data-k="mode-${k}" aria-pressed="${ui.mode === k}">${l}</button>`,
      )
      .join("")}</div>
  </div>`;
const initial = () =>
  (bridge.auth.displayName || "T").trim()[0]?.toUpperCase() || "T";

/* ---- About, Contact ---- */
const contactLink = (text: string) =>
  `<button class="linkish" data-tab="contact">${text}</button>`;
function About() {
  return `<div class="narrow doc">
  <section id="about"><div class="about-intro"><p class="about-wordmark"><span>Just One</span><span>More Catch</span></p><h2>About</h2>
    <p>Just One More Catch is your Pokédex for retro games. It shows you what's available to catch at your point in the story, and where to find it.</p>
    <p>This is a free fan project, and not affiliated with Nintendo, Creatures, GAME FREAK or The Pokémon Company.</p>
    </div><h3>Thanks</h3>
    <ul><li>Encounter data comes from <a href="https://pokeapi.co" target="_blank" rel="noopener">PokeAPI</a>, a free and open Pokémon database built by volunteers.</li>
    <li>Colour themes are inspired by <a href="https://rosepinetheme.com" target="_blank" rel="noopener">Rosé Pine</a> and <a href="https://draculatheme.com" target="_blank" rel="noopener">Dracula</a>.</li></ul>
    <p>Spotted a mistake? ${contactLink("Let us know")}.</p>
  </section>
  </div>`;
}
function Contact() {
  return `<div class="narrow doc"><section><h2>Contact</h2>
    <p>Questions, ideas or a mistake in the data? Send us a note.</p>
    ${
      ui.sent
        ? `<p>Thanks, we got your message.</p><button class="chip" data-another="1">Send another</button>`
        : `<form class="form" data-contact="1">
      <label class="field"><span>Message</span><textarea id="c-msg" name="message" maxlength="4000" required></textarea></label>
      <label class="field"><span>Email, if you'd like a reply</span><input id="c-email" name="email" type="email" maxlength="200" autocomplete="email"></label>
      <div class="sr" aria-hidden="true"><label>Leave this empty<input id="c-website" name="website" tabindex="-1" autocomplete="off"></label></div>
      <button class="app-primary" style="margin-top:14px" type="submit">Send</button>${ui.sendError ? `<p class="small" role="alert" style="color:var(--coral)">${ui.sendError}</p>` : ""}</form>`
    }</section></div>`;
}

/* ---- Wiring ---- */
const VIEWS: Record<string, () => string> = {
  journey: Journey,
  dex: Dex,
  boxes: Boxes,
  playthroughs: Runs,
  about: About,
  contact: Contact,
};
function shell() {
  return `<div class="top">
    <div class="logo"><svg class="mark" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><path d="M3 12h6M15 12h6"/></svg><span class="full">Just One More Catch</span></div>
    <span class="spacer"></span><span id="topright"></span>
  </div>
  <main id="view"></main>
  <div class="footer-brand"><button data-tab="about" data-sec="about" aria-label="About Just One More Catch">Just One More Catch</button></div>
  <p class="foot">Unofficial fan project, not affiliated with Nintendo, Creatures, GAME FREAK or The Pokémon Company. Free and non-commercial. Box art © Nintendo, Creatures and GAME FREAK. Encounter data sourced from <a href="https://pokeapi.co" target="_blank" rel="noopener">PokeAPI</a>. Thank you!</p>
  <nav class="footnav" aria-label="About this site"><button data-tab="about" data-sec="about">About</button><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a><button data-tab="contact">Contact</button></nav>
  <div class="dock"><div id="toast"></div><div id="tabs"></div></div>
  <dialog class="sheet" id="sheet" aria-labelledby="sheet-title"><div class="sheetbody" id="sheetbody"></div></dialog>
  <div class="sr" aria-live="polite" id="live"></div>`;
}
function tabFromUrl() {
  const t = new URLSearchParams(location.search).get("tab");
  return t && Object.hasOwn(VIEWS, t) ? t : "playthroughs";
}
function render() {
  const a = bridge.auth,
    signedIn = a.isAuthenticated;
  const k = (document.activeElement as HTMLElement)?.dataset?.k;
  const loading = a.isLoading || !bridge.runs || !!opening;
  root.classList.toggle("loading", loading);
  const url = new URL(location.href);
  if (ui.tab === "playthroughs") url.searchParams.delete("tab");
  else url.searchParams.set("tab", ui.tab);
  if (url.href !== location.href)
    history[ui.tab === tabFromUrl() ? "replaceState" : "pushState"](
      null,
      "",
      url,
    );
  $("#view").innerHTML = loading
    ? `<p class="muted" style="text-align:center;padding-top:40px">Loading…</p>`
    : ui.loadError
      ? `<p class="small" role="alert" style="text-align:center;padding-top:40px;color:var(--coral)">This game didn't load. Check your connection and reload the page.</p>`
      : (signedIn
        ? ui.saveError
          ? `<p class="small" role="alert" style="text-align:center;margin:4px 0 16px;color:var(--coral)">${ui.saveError}</p>`
          : ""
        : `<p class="muted small" style="text-align:center;margin:4px 0 16px">Currently saved only in this browser. <button class="linkish" data-signinsheet="1">Sign in</button> to save your playthroughs and view them on any device.</p>`) +
      VIEWS[ui.tab]();
  $("#topright").innerHTML =
    `<span style="display:flex;gap:8px"><button class="pill icon" data-settings="1" data-k="settings" aria-label="Settings"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z"/><circle cx="12" cy="12" r="3"/></svg></button>${run ? `<button class="pill" data-tab="playthroughs" aria-label="Current playthrough: ${ver().name}. Switch playthrough">${ver().name}</button>` : ""}${
      signedIn
        ? `<button class="avatar" data-tab="playthroughs" aria-label="Account: ${esc(a.displayName || "you")}">${esc(initial())}</button>`
        : a.isLoading
          ? ""
          : `<button class="pill" data-signinsheet="1" data-k="signin">Sign in</button>`
    }</span>`;
  $("#tabs").innerHTML = !a.isLoading
    ? `<nav class="tabbar" aria-label="Sections">${[
        ["journey", "Journey"],
        ["dex", "Dex"],
        ["boxes", "Boxes"],
        ["playthroughs", "Playthroughs"],
      ]
        .map(
          ([t, l]) =>
            `<button data-tab="${t}" ${ui.tab === t ? `aria-current="page"` : ""}>${l}</button>`,
        )
        .join("")}</nav>`
    : "";
  $("#toast").innerHTML = ui.undo
    ? `<div class="toast">${ui.undo.msg}<button data-undo="1">Undo</button></div>`
    : "";
  if (
    (typeof ui.sheet === "number" || ui.sheet?.kind === "settings") &&
    $("#sheet").open
  )
    fillSheet(ui.sheet);
  if (k)
    (
      root.querySelector(`[data-k="${k}"]`) ||
      (root.querySelector("[data-undo]") as any)
    )?.focus();
}

let saveTimer: any, undoTimer: any;
function showSaveError(msg: string) {
  ui.saveError = msg;
  render();
}
function scheduleSave(delay = 800) {
  if (!run) return;
  const id = run.id,
    state = dumpRun(run);
  if (state === ui.saved) return;
  clearTimeout(saveTimer);
  if (bridge.auth.isAuthenticated && runBytes(state) > MAX_RUN_BYTES)
    return showSaveError(
      "This playthrough is too big to save. Try shortening some notes.",
    );
  saveTimer = setTimeout(async () => {
    try {
      await bridge.saveRun(id, state);
      if (run?.id === id) ui.saved = state;
      if (ui.saveError) showSaveError("");
    } catch {
      showSaveError("Couldn't save. Trying again.");
      scheduleSave(5000);
    }
  }, delay);
}
function flushSave() {
  if (run && dumpRun(run) !== ui.saved) {
    clearTimeout(saveTimer);
    bridge.saveRun(run.id, dumpRun(run)).then(
      () => {
        ui.saved = dumpRun(R());
      },
      () => {},
    );
  }
}
function toggleCaught(n: number) {
  const p = byN[n],
    r = R(),
    had = r.caught.has(n);
  had ? r.caught.delete(n) : r.caught.add(n);
  ui.undo = { n, had, msg: `${p.name} ${had ? "unmarked" : "caught"}` };
  $("#live").textContent = ui.undo.msg;
  clearTimeout(undoTimer);
  undoTimer = setTimeout(() => {
    ui.undo = null;
    render();
  }, 5000);
}
function download() {
  const data = {
    exportedAt: new Date().toISOString(),
    account: bridge.auth.displayName,
    runs: (bridge.runs || []).map((r) => ({
      id: r.id,
      game: r.version,
      startedAt: r.createdAt,
      ...JSON.parse(r.id === run?.id ? dumpRun(R()) : r.state || "{}"),
    })),
  };
  const a = document.createElement("a");
  a.href = URL.createObjectURL(
    new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
  );
  a.download = "just-one-more-catch.json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
async function onClick(e: MouseEvent) {
  const t = (e.target as HTMLElement).closest(
    "button",
  ) as HTMLButtonElement | null;
  if (!t || t.disabled || (t.type === "submit" && t.form)) return;
  const d = t.dataset;
  if (d.look) {
    ui.look = d.look;
    store.set("jomc.look", ui.look);
    applyTheme();
    render();
    return;
  }
  if (d.mode) {
    ui.mode = d.mode;
    store.set("jomc.mode", ui.mode);
    applyTheme();
    render();
    return;
  }
  if (d.tab) {
    ui.tab = d.tab;
    ui.undo = null;
    render();
    d.sec ? root.querySelector("#" + d.sec)?.scrollIntoView() : scrollTo(0, 0);
    return;
  }
  if (d.close) {
    $("#sheet").close();
    return;
  }
  if (d.newsheet) {
    openSheet({ kind: "newrun" });
    return;
  }
  if (d.runfilter) {
    ui.runFilter = d.runfilter;
    render();
    return;
  }
  if (d.settings) {
    openSheet({ kind: "settings" });
    return;
  }
  if (d.signinsheet) {
    flushSave();
    openSheet({ kind: "signin" });
    return;
  }
  if (d.signout) {
    flushSave();
    run = null;
    bridge.signOut();
    return;
  }
  if (d.download) {
    download();
    return;
  }
  if (d.another) {
    ui.sent = false;
    render();
    return;
  }
  if (d.delaccount) {
    if (
      !confirm(
        "Delete your account and all your playthroughs? This can't be undone.",
      )
    )
      return;
    await bridge.deleteAccount();
    run = null;
    bridge.signOut();
    return;
  }
  if (d.newrun) {
    flushSave();
    t.disabled = true;
    if ($("#sheet").open) $("#sheet").close();
    pendingRun = await bridge.createRun(d.newrun);
    refresh();
    return;
  }
  if (d.switch) {
    flushSave();
    const row = bridge.runs?.find((r) => r.id === d.switch);
    if (row) {
      if (row.id !== run?.id) useRun(row);
      ui.tab = "journey";
      render();
    }
    return;
  }
  if (d.delrun) {
    const row = bridge.runs?.find((r) => r.id === d.delrun);
    if (
      !row ||
      !confirm(
        `Delete this ${verOf(row.version).name} playthrough? This can't be undone.`,
      )
    )
      return;
    if (run?.id === row.id) {
      clearTimeout(saveTimer);
      run = null;
    }
    await bridge.deleteRun(row.id);
    return;
  }
  if (!run) return;
  const r = R();
  if (d.open) {
    openSheet(+d.open);
    return;
  }
  if (d.editmon) {
    openSheet({ kind: "mon", id: +d.editmon });
    return;
  }
  if (d.addmon) {
    openSheet({ kind: "mon", n: +d.addmon });
    return;
  }
  if (d.renamebox) {
    openSheet({ kind: "box", b: +d.renamebox });
    return;
  }
  if (d.savemon) {
    saveMon();
    $("#sheet").close();
    scheduleSave();
    return;
  }
  if (d.savebox) {
    const b = ui.sheet.b;
    r.boxNames[b - 1] = $("#f-boxname").value.trim().slice(0, 8) || `Box ${b}`;
    $("#sheet").close();
    scheduleSave();
    return;
  }
  if (d.delmon) {
    r.mons = r.mons.filter((m) => m.id !== +(d.delmon as string));
    $("#live").textContent = "Removed from your boxes";
    $("#sheet").close();
    scheduleSave();
    return;
  }
  if (d.toggle || d.catch) {
    const n = +(d.toggle || (d.catch as string));
    toggleCaught(n);
    scheduleSave();
    if (!ui.bulk && r.caught.has(n)) {
      render();
      openSheet({ kind: "mon", n, isNew: true });
      return;
    }
  } else if (d.skip) r.skip.add(+d.skip);
  else if (d.unskip) r.skip.clear();
  else if (d.undo) {
    const u = ui.undo;
    u.had ? r.caught.add(u.n) : r.caught.delete(u.n);
    if (u.monId) r.mons = r.mons.filter((m) => m.id !== u.monId);
    ui.undo = null;
    $("#live").textContent = "Undone";
  } else if (d.time) {
    if (d.time === "auto") r.timeAuto = true;
    else {
      r.timeAuto = false;
      r.time = d.time;
    }
    r.skip.clear();
  } else if (d.badge) {
    r.badges.has(d.badge) ? r.badges.delete(d.badge) : r.badges.add(d.badge);
  } else if (d.safari) {
    r.safari.has(d.safari) ? r.safari.delete(d.safari) : r.safari.add(d.safari);
  } else if (d.kit) {
    r.kit.has(d.kit) ? r.kit.delete(d.kit) : r.kit.add(d.kit);
  } else if (d.filter) ui.filter = d.filter;
  else if (d.boxfilter) ui.boxFilter = d.boxfilter;
  else if (d.bulk) {
    ui.bulk = !ui.bulk;
    if (ui.bulk) ui.filter = "all";
  } else return;
  scheduleSave();
  render();
}

async function onSubmit(e: SubmitEvent) {
  const form = e.target as HTMLFormElement;
  if (!form.dataset.contact) return;
  e.preventDefault();
  const btn = form.querySelector("button") as HTMLButtonElement;
  btn.disabled = true;
  try {
    const res = await bridge.contact({
      message: $("#c-msg").value,
      email: $("#c-email").value,
      website: $("#c-website").value,
    });
    ui.sent = res.ok;
    ui.sendError = res.ok
      ? ""
      : "Please write a message, and check the email address.";
  } catch {
    ui.sendError = "That didn't send. Please try again.";
  }
  if (ui.sent) render();
  else {
    btn.disabled = false;
    form.querySelector(".small")?.remove();
    btn.insertAdjacentHTML(
      "afterend",
      `<p class="small" role="alert" style="color:var(--coral)">${ui.sendError}</p>`,
    );
  }
}

const darkMQ = matchMedia("(prefers-color-scheme: dark)");
function applyTheme() {
  const dark = ui.mode === "dark" || (ui.mode === "auto" && darkMQ.matches);
  document.documentElement.dataset.theme =
    PALETTE[ui.look][dark ? "dark" : "light"];
}

/* ---- Guest runs live in this browser until sign-in ---- */
type GuestRow = RunRow & { movedTo?: string };
const GUEST = "jomc.guest";
let raw: Bridge,
  guestMem = "[]";
const guestRows = (): GuestRow[] => {
  try {
    return JSON.parse(store.get(GUEST) ?? guestMem);
  } catch {
    return [];
  }
};
const setGuestRows = (rows: GuestRow[]) => {
  guestMem = JSON.stringify(rows);
  store.set(GUEST, guestMem);
};
const refresh = () => queueMicrotask(() => update(raw));
function withGuest(b: Bridge): Bridge {
  if (b.auth.isLoading || b.auth.isAuthenticated) return b;
  return {
    ...b,
    get runs() {
      return guestRows();
    },
    async createRun(version) {
      const id = "local-" + Date.now().toString(36);
      setGuestRows([
        ...guestRows(),
        { id, version, state: "{}", createdAt: new Date().toISOString() },
      ]);
      refresh();
      return id;
    },
    async saveRun(id, state) {
      const updatedAt = new Date().toISOString();
      setGuestRows(
        guestRows().map((r) => (r.id === id ? { ...r, state, updatedAt } : r)),
      );
    },
    async deleteRun(id) {
      setGuestRows(guestRows().filter((r) => r.id !== id));
      refresh();
    },
  };
}
// ponytail: runs one at a time; retries on the next update after a failure
let moving = false;
async function moveGuestRuns() {
  if (moving || !guestRows().length) return;
  moving = true;
  try {
    for (const g of guestRows()) {
      const id = g.movedTo || (await raw.createRun(g.version));
      setGuestRows(
        guestRows().map((r) => (r.id === g.id ? { ...r, movedTo: id } : r)),
      );
      await raw.saveRun(id, g.state);
      setGuestRows(guestRows().filter((r) => r.id !== g.id));
      if (store.get("jomc.run") === g.id) pendingRun = id;
    }
  } catch {
    $("#live").textContent =
      "Couldn't move your playthroughs to your account yet.";
  }
  moving = false;
}

let pendingRun: string | null = null;
function syncRuns() {
  const rows = bridge.runs;
  if (bridge.auth.isLoading || !rows) return;
  if (bridge.auth.isAuthenticated) void moveGuestRuns();
  if (run && !rows.some((r) => r.id === run!.id)) run = null;
  const want = pendingRun && rows.find((r) => r.id === pendingRun);
  if (want) {
    pendingRun = null;
    useRun(want);
    ui.tab = "journey";
    return;
  }
  if (!run && !opening && !ui.loadError && rows.length)
    useRun(
      rows.find((r) => r.id === store.get("jomc.run")) || rows[rows.length - 1],
    );
}

export function mount(el: HTMLElement, b: Bridge) {
  root = el;
  ui.tab = tabFromUrl();
  addEventListener("popstate", () => {
    if (tabFromUrl() === ui.tab) return;
    ui.tab = tabFromUrl();
    ui.undo = null;
    render();
  });
  document.title = "Just One More Catch";
  raw = b;
  bridge = withGuest(b);
  el.className = "app";
  const style = document.createElement("style");
  style.textContent = CSS;
  document.head.appendChild(style);
  el.innerHTML = shell();
  ui.look = PALETTE[store.get("jomc.look") || ""]
    ? store.get("jomc.look")
    : "blossom";
  ui.mode = ["auto", "light", "dark"].includes(store.get("jomc.mode") || "")
    ? store.get("jomc.mode")
    : "auto";
  applyTheme();
  darkMQ.addEventListener("change", applyTheme);
  el.addEventListener("click", onClick);
  el.addEventListener("submit", onSubmit as any);
  el.addEventListener(
    "toggle",
    (e) => {
      const c = (e.target as HTMLElement).dataset?.chap;
      if (c != null)
        (e.target as HTMLDetailsElement).open
          ? ui.open.add(+c)
          : ui.open.delete(+c);
    },
    true,
  );
  el.addEventListener("change", (e) => {
    if ((e.target as HTMLElement).id === "here" && run) {
      run.here = (e.target as HTMLSelectElement).value;
      scheduleSave();
      render();
    }
  });
  $("#sheet").addEventListener("click", (e: Event) => {
    if ((e.target as HTMLElement).id === "sheet") $("#sheet").close();
  });
  $("#sheet").addEventListener("close", () => {
    const s = ui.sheet;
    ui.sheet = null;
    if (s?.kind === "signin")
      bridge.unmountSignIn($("#clerk-signin") as HTMLDivElement);
    render();
    if (s)
      (
        root.querySelector(
          `[data-k="${typeof s === "number" ? "d" + s : s.id ? "m" + s.id : s.b ? "rb" + s.b : "x"}"]`,
        ) || (root.querySelector("[data-filter][aria-pressed=true]") as any)
      )?.focus();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushSave();
  });
  syncRuns();
  render();
}
export function update(b: Bridge) {
  raw = b;
  bridge = withGuest(b);
  syncRuns();
  if (b.auth.isAuthenticated && ui.sheet?.kind === "signin")
    $("#sheet").close();
  if (!$("#sheet").open) render();
}
