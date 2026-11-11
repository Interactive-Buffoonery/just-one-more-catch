// Ported from the approved mockup: string-rendered views on one root, event delegation, no framework.
// main.ts owns auth and server calls and hands them in through the bridge.
import { VERSIONS, type GameData, type Pack } from "./packs";
import type { VersionId } from "../shared/versions";
import CSS from "./styles";
import { MAX_RUN_BYTES, MAX_RUNS, runBytes } from "../shared/limits";
import { gameNow, type Clock } from "../shared/clock";
import { summarize, type Summary } from "../shared/summary";
import { csv } from "../shared/csv";
import { AVATARS, isAvatar } from "../shared/avatars";

type Row = {
  place: string;
  chap: number;
  m: string;
  need: string[] | null;
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
  summary: Summary;
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
  avatar: number | null | undefined;
  setAvatar(n: number): Promise<unknown>;
  getState(id: string): Promise<string>;
  mountSignIn(el: HTMLDivElement): boolean;
  unmountSignIn(el: HTMLDivElement): void;
  signOut(): void;
  createRun(version: string): Promise<string>;
  saveRun(id: string, state: string): Promise<unknown>;
  deleteRun(id: string): Promise<unknown>;
  setStart(id: string, startedAt: number): Promise<unknown>;
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
let EVENTS: Record<string, GameData["events"][number]> = {};
let LATER: Record<string, GameData["events"][number][]> = {};
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
  ["blissey", "Blissey"],
  ["venusaur", "Venusaur"],
  ["snorlax", "Snorlax"],
  ["blossom", "Blossom"],
  ["vampire", "Vampire"],
];
const PALETTE: Record<string, { light: string; dark: string }> = {
  blissey: { light: "blissey", dark: "blissey-dark" },
  venusaur: { light: "venusaur", dark: "venusaur-dark" },
  snorlax: { light: "snorlax", dark: "snorlax-dark" },
  blossom: { light: "sakura", dark: "rosepine" },
  vampire: { light: "alucard", dark: "dracula" },
};

/* ---- Run state ---- */
type Run = {
  id: string;
  version: string;
  badges: Set<string>;
  kit: Set<string>;
  events: Set<string>;
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
  clock: Clock;
  hidden: Set<string>;
  showLater: boolean;
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
function loadRun(row: RunRow, state: string): Run {
  const pack = verOf(row.version).pack;
  let s: any = {};
  try {
    s = JSON.parse(state) || {};
  } catch {}
  return {
    id: row.id,
    version: row.version,
    badges: new Set(s.badges || []),
    kit: new Set(s.kit || []),
    events: new Set(s.events || []),
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
    clock: s.clock || { mode: "device" },
    hidden: new Set(s.hidden || []),
    showLater: !!s.showLater,
  };
}
const dumpRun = (r: Run) =>
  JSON.stringify({
    badges: [...r.badges],
    kit: [...r.kit],
    events: [...r.events],
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
    clock: r.clock,
    hidden: [...r.hidden],
    showLater: r.showLater,
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
  snooze: new Set<string>(),
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
  del: (k: string) => {
    try {
      localStorage.removeItem(k);
    } catch {}
  },
};

const loaded = new Map<Pack, GameData>();
let opening: string | null = null;
function useRun(row: RunRow) {
  const v = verOf(row.version);
  run = null;
  opening = row.id;
  Promise.all([
    loaded.get(v.pack) || v.pack.load(),
    bridge.getState(row.id),
  ]).then(
    ([d, state]) => {
      loaded.set(v.pack, d);
      if (opening !== row.id) return;
      opening = null;
      const latest = bridge.runs?.find((r) => r.id === row.id);
      if (latest) openRun(latest, d, state);
      if (!$("#sheet").open) render();
    },
    () => {
      if (opening !== row.id) return;
      opening = null;
      ui.loadError = !!bridge.runs?.some((r) => r.id === row.id);
      render();
    },
  );
}
function openRun(row: RunRow, data: GameData, state: string) {
  const v = verOf(row.version);
  ui.loadError = false;
  run = loadRun(row, state);
  CHAPTERS = data.chapters;
  EVENTS = Object.fromEntries(data.events.map((e) => [e.id, e]));
  LATER = Object.fromEntries(
    data.events.map((e) => [e.id, data.events.filter((x) => x.after?.includes(e.id))]),
  );
  placeCache = {};
  DEX = data.dex.map((p) => ({
    ...p,
    all: p.rows,
    rows: p.rows.filter((r: Row) => r.v.includes(v.code)),
  }));
  byName = Object.fromEntries(DEX.map((p) => [p.name, p]));
  byN = Object.fromEntries(DEX.map((p) => [p.n, p]));
  ui.saved = dumpRun(run);
  ui.skip = new Set();
  ui.snooze = new Set();
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
  const h = gameNow(R().clock).hour,
    night = P().nightFrom ?? 24;
  return h >= 4 && h < 10 ? "morning" : h >= 10 && h < night ? "day" : "night";
};
const nowTime = () => (R().timeAuto ? gameTime() : R().time);
const isHere = (pl: string) => pl === R().here || pl.startsWith(R().here + " ");
const kitName = (k: string) => (P().kit.find((x) => x[0] === k) as string[])[1];
const isBadge = (k: string) => /^[A-Z]/.test(k);
const laterEvents = (id: string) => LATER[id] || [];
// Done because its `by` proves it, directly or through a later event: unticking can't undo it.
const forced = (id: string): boolean =>
  (!!EVENTS[id].by && has(EVENTS[id].by as string)) ||
  laterEvents(id).some((e) => forced(e.id));
// An event is done when ticked, proven, or implied by a later event that needs it.
const eventDone = (id: string): boolean =>
  R().events.has(id) || forced(id) || laterEvents(id).some((e) => eventDone(e.id));
// An HM only counts once the player also has the badge that lets them use it outside battle.
function has(k: string): boolean {
  if (EVENTS[k]) return eventDone(k);
  if (isBadge(k)) return R().badges.has(k);
  const b = P().hm[k];
  return R().kit.has(k) && (!b || R().badges.has(b));
}
const needText = (k: string) =>
  EVENTS[k]
    ? EVENTS[k].label
    : k === "Elite Four"
      ? "After the Elite Four"
      : isBadge(k)
        ? `Opens with ${k} Badge`
        : R().kit.has(k)
          ? `Needs ${P().hm[k]} Badge to use ${kitName(k)}`
          : `Needs ${kitName(k)}`;
const chapterNeeds = (i: number) => [
  ...CHAPTERS[i].needs,
  ...(CHAPTERS[i].kit ? [CHAPTERS[i].kit as string] : []),
];
const unlocked = (i: number) => chapterNeeds(i).every(has);
const chapterOf = (place: string) =>
  Math.max(
    0,
    CHAPTERS.findIndex((c) => c.places.includes(place)),
  );
const currentChap = () => {
  const h = chapterOf(R().here);
  return unlocked(h)
    ? h
    : CHAPTERS.reduce((c, ch, i) => (unlocked(i) && ch.places.length ? i : c), 0);
};
function rowStatus(r: Row): { s: string; why?: string; need?: string } {
  const run = R();
  const missing = [
    ...chapterNeeds(r.chap),
    METHOD[r.m]?.[1],
    ...(r.need || []),
  ].find((k) => k && !has(k));
  if (missing) return { s: "later", why: needText(missing), need: missing };
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
  if (days.length && !days.includes(DAYS[gameNow(R().clock).day]))
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
// Cleared first so the same message is read again when repeated.
const announce = (msg: string) => {
  $("#live").textContent = "";
  requestAnimationFrame(() => ($("#live").textContent = msg));
};
const esc = (v: unknown) =>
  String(v).replace(
    /[&<>"]/g,
    (c) =>
      (({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }) as any)[c],
  );
const ring = (types: string[]) => {
  const a = TYPE[types[0]],
    b = TYPE[types[1] || types[0]];
  return `--t1:${a};--t2:${b}`;
};
const sprite = (p: Species, cls = "", shiny = false) =>
  `<img class="sprite ${cls}" src="/sprites/${P().art}/${shiny ? "shiny/" : ""}${p.n}.png" alt="${shiny ? "Shiny " : ""}${p.name}" width="80" height="80" loading="lazy">`;
const mon = (p: Species, shiny = false) =>
  `<span class="mon ${R().caught.has(p.n) ? "got" : ""}" style="${ring(p.types)}" aria-hidden="true"><b>${sprite(p, "", shiny)}</b></span>`;
const lvl = (r: Row) =>
  r.m === "npc-trade"
    ? ""
    : r.lo === r.hi
      ? `Lv ${r.lo}`
      : `Lv ${r.lo} to ${r.hi}`;
function rowTags(r: Row, place = r.place) {
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
const gotBtn = (p: Species, evo = false) =>
  `<button class="got-btn" data-toggle="${p.n}" data-k="t${p.n}" aria-pressed="${R().caught.has(p.n)}" aria-label="${p.name} ${evo ? "caught or evolved" : "caught"}">${R().caught.has(p.n) ? (evo ? "✓ Obtained" : "✓ Caught") : evo ? "Caught/Evolved?" : "Caught?"}</button>`;
// ponytail: the only guaranteed shiny in the packs so far; move it into pack data when a second one appears
const redGyarados = (p: Species, r: Row | null) =>
  p.n === 130 && r?.m === "static" && r.place === "Lake of Rage";
const RED_NOTE = "The red Gyarados, always shiny";
const monRow = (p: Species, r: Row | null, place?: string, evo = false) =>
  `<div class="row">${mon(p, redGyarados(p, r))}<div class="grow"><div class="name">${p.name}${redGyarados(p, r) ? ` <span class="shiny small">✦ ${RED_NOTE}</span>` : ""}</div>${r ? rowTags(r, place) : `<div class="small muted">${howElse(p)}</div>`}</div>${gotBtn(p, evo)}</div>`;
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
// Each row folds into the picker place it belongs to (Safari Zone Plains -> Safari Zone).
let placeCache: Record<string, string> = {};
const placeOf = (pl: string) =>
  (placeCache[pl] ??= NOT_HERE.test(pl)
    ? pl
    : CHAPTERS.flatMap((c) => c.places)
        .filter((c) => pl === c || pl.startsWith(c + " "))
        .sort((a, b) => b.length - a.length)[0] || pl);
type Spot = {
  chap: number;
  got: number;
  now: Pick[];
  later: Pick[];
  once: Pick[];
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
function spots() {
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
  !!s && !NOT_HERE.test(pl) && !s.now.length && s.got > 0;
const placeLabel = (pl: string, s?: Spot) =>
  !s || NOT_HERE.test(pl)
    ? ""
    : complete(pl, s)
      ? `✓ Complete${s.later.length ? ` · ${s.later.length} later` : ""}`
      : s.now.length
        ? `${s.now.length} left`
        : s.later.length
          ? `${s.later.length} later`
          : "";
const laterBox = (key: string, title: string, list: Pick[], place: string) =>
  list.length
    ? `<details class="later" data-chap="${esc(key)}" ${ui.open.has(key) ? "open" : ""}><summary>${title}</summary>${list.map((x) => monRow(x.p, x.r, place)).join("")}</details>`
    : "";
function placeBlock(pl: string, s: Spot) {
  const later = R().showLater
      ? s.later.map((x) => monRow(x.p, x.r, pl)).join("")
      : laterBox(
          `l:${pl}`,
          complete(pl, s)
            ? `${s.later.length} more available later`
            : `Come back later · ${s.later.length}`,
          s.later,
          pl,
        ),
    once = laterBox(
      `o:${pl}`,
      `One-time and special · ${s.once.length}`,
      s.once,
      pl,
    );
  if (complete(pl, s))
    return `<div class="done-place"><span class="tick" aria-hidden="true">✓</span><span style="flex:1">${pl} complete</span><span class="count ok">${s.got} / ${s.got}</span></div>${isHere(pl) ? `<p class="small muted" style="margin:6px 2px 0">Everything you can catch here with your current badges and items.</p>` : ""}${later}${once}`;
  const count = NOT_HERE.test(pl)
    ? ""
    : s.now.length
      ? `${s.got} / ${s.got + s.now.length}`
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
function chapterSpots(all: Record<string, Spot>, i: number) {
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
const kitGroup = (title: string, keep: (id: string) => boolean) => {
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
const badgeRow = (list: string[][]) =>
  `<div style="display:flex;flex-wrap:wrap;margin:6px -6px">${list.map((b) => `<button class="badge" data-badge="${b[0]}" data-k="b-${b[0]}" aria-pressed="${R().badges.has(b[0])}" aria-label="${b[0]} Badge from ${b[1]}" title="${b[0]} Badge · ${b[1]}"><img src="/badges/${b[0].toLowerCase()}.png" alt="${b[0]} Badge" width="32" height="32"></button>`).join("")}</div>`;

/* ---- Journey (home) ---- */
const why = (h: Pick) =>
  redGyarados(h.p, h.r)
    ? RED_NOTE
    : isHere(h.r.place)
    ? ONE_TIME.has(h.r.m)
      ? ""
      : "Easiest one to catch here"
    : h.r.chap === currentChap()
      ? "Best odds in this chapter"
      : `Best odds in ${CHAPTERS[h.r.chap].title}`;
function heroCard(h: Pick) {
  const a = TYPE[h.p.types[0]],
    b = TYPE[h.p.types[1] || h.p.types[0]],
    st = rowStatus(h.r);
  return `<section class="hv-field" aria-labelledby="hero-name">
      <div class="hv-band" style="--t1:${a};--t2:${b}"><span class="hv-no" aria-hidden="true">#${pad(num(h.p))}</span>${sprite(h.p, "hv-sprite", redGyarados(h.p, h.r))}
        <h2 id="hero-name">${h.p.name}</h2><div>${h.p.types.map((t) => `<span class="hv-type" style="--tc:${TYPE[t]}">${cap(t)}</span>`).join("")}</div>${why(h) && `<div class="hv-why">${why(h)}</div>`}</div>
      <dl class="hv-facts"><div><dt>Where</dt><dd>${h.r.place}</dd></div><div><dt>How</dt><dd>${METHOD[h.r.m]?.[0] || h.r.m}</dd></div><div><dt>Level</dt><dd>${lvl(h.r) || "?"}</dd></div><div><dt>Chance</dt><dd>${h.r.c ? h.r.c + "%" : "?"}</dd></div></dl>
      ${h.r.cond.some((c) => TIME[c]) || st.s !== "now" ? rowTags(h.r) : ""}
      <div class="hv-actions"><button class="app-primary grow" data-catch="${h.p.n}" data-k="hero-${h.p.n}" aria-label="${h.p.name} caught">Caught it!</button><button class="app-quiet" data-skip="${h.p.n}" data-k="skip">Not now</button></div>
    </section>`;
}
const NOT_HERE =
  /Gym|Game Corner|North Gate|Roaming|House|Pokémon Center|Department Store|Prize Corner|Museum|Silph|Magnet Train|Dock|Embedded|Sinjoh|Celadon Mansion|Cinnabar Lab|Dojo/;
// ponytail: Tabler Icons outline paths (MIT), inlined like the settings gear
const tabIcon = (d: string) =>
  `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d
    .split("|")
    .map((p) => `<path d="${p}"/>`)
    .join("")}</svg>`;
const SETTINGS_ICON = tabIcon(
  "M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z|M9 12a3 3 0 1 0 6 0a3 3 0 1 0 -6 0",
);
const TAB_ICONS: Record<string, string> = {
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
const SLIDERS_ICON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/></svg>`;
const CLOCK_ICON = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>`;
function fillClock(mode: string) {
  const c = R().clock,
    g = gameNow(c),
    two = (n: number) => String(n).padStart(2, "0"),
    zones: string[] = (Intl as any).supportedValuesOf?.("timeZone") ?? [];
  if (c.tz && !zones.includes(c.tz)) zones.unshift(c.tz);
  $("#sheetbody").innerHTML = `<h2 id="sheet-title">${ver().name}'s clock</h2>
    <div class="card" style="margin-top:12px;text-align:center;background:var(--bg)"><div class="small muted">Your game right now</div><div class="big-time">${g.hour % 12 || 12}:${two(g.minute)} ${g.hour < 12 ? "AM" : "PM"}</div><div style="font-weight:700">${cap(DAYS[g.day])} · <span class="tag time">${cap(gameTime())}</span> <span class="small muted">night at ${(P().nightFrom as number) - 12} PM</span></div></div>
    <div class="small muted" style="margin:16px 0 6px;font-weight:700">Show Pokémon for</div>
    <div class="seg3 wide" role="group" aria-label="Show Pokémon for this time of day"><button data-time="auto" aria-pressed="${R().timeAuto}">Auto (${cap(gameTime())})</button>${["morning", "day", "night"].map((x) => `<button data-time="${x}" aria-pressed="${!R().timeAuto && R().time === x}">${cap(x)}</button>`).join("")}</div>
    <div class="small muted" style="margin:16px 0 6px;font-weight:700">How your game keeps time</div>
    <div class="seg3 wide" role="group" aria-label="How your game keeps time"><button data-clockmode="device" aria-pressed="${mode === "device"}">Follow a time zone</button><button data-clockmode="manual" aria-pressed="${mode === "manual"}">Set it myself</button></div>
    ${
      mode === "manual"
        ? `<div class="row2"><label class="field"><span>Time</span><input id="c-time" type="time" value="${two(g.hour)}:${two(g.minute)}" required></label><label class="field"><span>Day</span><select id="c-day">${DAYS.map((d, i) => `<option value="${i}" ${i === g.day ? "selected" : ""}>${cap(d)}</option>`).join("")}</select></label></div><p class="small muted" style="margin:8px 0 0">Enter the time and day your game shows.</p>`
        : `<label class="field"><span>Time zone</span><select id="c-tz"><option value="">This device (${Intl.DateTimeFormat().resolvedOptions().timeZone})</option>${zones.map((z) => `<option ${z === c.tz ? "selected" : ""}>${z}</option>`).join("")}</select></label>`
    }
    <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:16px"><button class="chip" data-close="1">Cancel</button><button class="app-primary" data-saveclock="1">Save</button></div>`;
}
const SECTIONS = [
  ["next", "Next catch", "Disabling this removes the big suggestion card"],
  [
    "near",
    "Also near you",
    "Disabling this hides the other Pokémon you can catch where you are",
  ],
  ["chapter", "This chapter", "Places and Pokémon in your current chapter"],
  [
    "evolve",
    "Evolution options",
    "Disabling this hides Pokémon you can get by evolving ones you've caught",
  ],
  [
    "story",
    "Story check",
    "Disabling this hides the question about where you are in the story. It stays while Your journey is hidden, so you can still mark story steps",
  ],
  ["journey", "Your journey", "Disabling this hides the Your journey section"],
  ["dex", "Dex progress", "Disabling this hides the Dex progress section"],
];
const toggle = (on: boolean, title: string, note: string, attr: string) =>
  `<button class="sw" role="switch" aria-checked="${on}" ${attr}><span class="grow"><b>${title}</b><small>${note}</small></span><span class="tog${on ? " on" : ""}" aria-hidden="true"></span></button>`;
function fillCustom() {
  const r = R();
  $("#sheetbody").innerHTML =
    `<h2 id="sheet-title">Customize ${ver().name}</h2><p class="small muted" style="margin:4px 0 10px">Only changes this playthrough.</p>
    ${SECTIONS.map(([k, t, n]) => toggle(!r.hidden.has(k), t, n, `data-hide="${k}" data-k="h-${k}"`)).join("")}
    ${toggle(r.showLater, "Show Pokémon I can't reach yet", `List them in each section, not under "Come back later"`, `data-showlater="1" data-k="h-later"`)}
    <div class="sw"><span class="grow"><b>Badges and items</b><small>Always shown: this is how the app knows what you can catch</small></span><span class="lock">Always on</span></div>
    <div style="display:flex;justify-content:flex-end;margin-top:12px"><button class="chip" data-close="1">Done</button></div>`;
}
/* ---- Story events: one question on top, the full list in Your journey ---- */
// What ticking the event would open right now, found by ticking it for a moment.
function opensText(id: string) {
  const reach = () => ({
    chaps: CHAPTERS.map((_, i) => unlocked(i)),
    mons: DEX.filter(
      (p) =>
        visible(p) &&
        !R().caught.has(p.n) &&
        p.rows.some((r) => rowStatus(r).s !== "later"),
    ).map((p) => p.n),
  });
  const was = reach();
  R().events.add(id);
  let now;
  try {
    now = reach();
  } finally {
    R().events.delete(id);
  }
  const places = CHAPTERS.filter((_, i) => now.chaps[i] && !was.chaps[i])
      .flatMap((c) => c.places)
      .filter((p) => !NOT_HERE.test(p)),
    n = now.mons.length - was.mons.length;
  return [
    places.length &&
      `Opens ${places.slice(0, 3).join(", ")}${places.length > 3 ? ` and ${places.length - 3} more` : ""}`,
    n && `${n} Pokémon`,
  ]
    .filter(Boolean)
    .join(" · ");
}
function storyCheck() {
  const open = Object.values(EVENTS)
    .filter(
      (e) =>
        !eventDone(e.id) &&
        inJourney(e.chap) &&
        unlocked(e.chap) &&
        (e.after || []).every(eventDone),
    )
    .sort((a, b) => a.chap - b.chap);
  const e = open.find((x) => !ui.snooze.has(x.id));
  if (!e)
    return open.length
      ? `<div class="row ask-snz"><span class="grow small"><b>${open[0].label}</b> · not yet</span><button class="got-btn" data-unsnooze="1" data-k="ask-now" aria-label="Ask now: ${open[0].label}">Ask now</button></div>`
      : "";
  const opens = opensText(e.id);
  return `<section class="card ask" aria-labelledby="ask-q"><div class="ask-k">Story check</div><h2 id="ask-q" tabindex="-1">${e.q}</h2>${opens && `<p class="small muted" style="margin:6px 0 0">${opens}</p>`}
    <div class="ask-actions"><button class="app-primary" data-yes="${e.id}" aria-describedby="ask-q">Yes, got it</button><button class="app-quiet" data-snooze="${e.id}" aria-describedby="ask-q">Not yet</button></div></section>`;
}
const inJourney = (i: number) =>
  e4() ||
  (!CHAPTERS[i].needs.includes("Elite Four") && i < CHAPTERS.length - 1);
function beat(id: string) {
  const e = EVENTS[id],
    done = eventDone(id),
    lock = forced(id),
    why = !lock
      ? ""
      : e.by === "Elite Four" && has(e.by)
        ? "You beat the Elite Four"
        : e.by && isBadge(e.by) && has(e.by)
          ? `You have the ${e.by} Badge`
          : e.by && EVENTS[e.by] && has(e.by)
            ? `Shown by: ${EVENTS[e.by].label}`
            : "A later step shows it's done";
  return `<button class="beat" id="ev-${id}" data-event="${id}" data-k="ev-${id}" aria-pressed="${done}" ${lock ? `aria-disabled="true"` : ""}><span class="bx" aria-hidden="true"></span><span class="bt">${e.label}${why ? `<small>${why}</small>` : ""}</span>${done && !R().events.has(id) ? `<span class="auto" aria-hidden="true">auto</span><span class="sr">, marked done for you</span>` : ""}</button>`;
}
const beats = (i: number) => {
  const list = Object.values(EVENTS).filter((e) => e.chap === i);
  return list.length
    ? `<div class="beats" role="group" aria-label="Story steps, ${CHAPTERS[i].title}">${list.map((e) => beat(e.id)).join("")}</div>`
    : "";
};
// Unticking an event also unticks the ticked events that depend on it.
function untick(id: string) {
  R().events.delete(id);
  laterEvents(id)
    .filter((e) => eventDone(e.id))
    .forEach((e) => untick(e.id));
}
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
  const hide = r.hidden,
    all = spots(),
    curS = chapterSpots(all, cur);
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
  <div class="chips toolbar">
    <label class="sr" for="here">Where you are in the game</label>
    <select class="pill" id="here" data-k="here">${herePlaces.includes(r.here) ? "" : `<option selected disabled>Near ${r.here}</option>`}${herePlaces.map((p) => `<option ${p === r.here ? "selected" : ""} value="${p}">Near ${p}${placeLabel(p, all[p]) && ` · ${placeLabel(p, all[p])}`}</option>`).join("")}</select>
    ${P().nightFrom ? `<button class="pill clockpill" data-clock="1" data-k="clock" aria-label="Game clock: ${cap(nowTime())}, ${cap(DAYS[gameNow(r.clock).day])}. Change">${CLOCK_ICON}<b>${cap(nowTime())}</b> · ${cap(DAYS[gameNow(r.clock).day]).slice(0, 3)}</button>` : ""}
    <button class="pill iconpill" data-custom="1" data-k="custom" aria-label="Customize this page">${SLIDERS_ICON}</button>
  </div>
  ${hide.has("story") && !hide.has("journey") ? "" : storyCheck()}
  ${hide.has("next") ? "" : hero ? heroCard(hero) : now.length ? `<section class="hero"><h2>You've skipped every suggestion</h2><p style="margin:6px 0 12px">${now.length} Pokémon are still catchable right now.</p><button class="btn" data-unskip="1" data-k="unskip2">Show them again</button></section>` : `<section class="hero"><h2>Nothing left to catch right now</h2><p style="margin:6px 0 0">Try another time of day, or move ahead in the story.</p></section>`}
  ${!hide.has("next") && r.skip.size ? `<div style="text-align:right;margin-top:8px"><button class="chip" data-unskip="1" data-k="unskip">Show ${r.skip.size} skipped</button></div>` : ""}
  ${!hide.has("near") && atHere.length ? `<div class="eyebrow">Also near ${r.here}</div>${atHere.map((x) => monRow(x.p, x.r)).join("")}` : ""}
  ${
    hide.has("chapter")
      ? ""
      : `${curS.left || curS.later ? "" : `<p class="muted">You've caught everything in this chapter.</p>`}
  ${curS.html}`
  }
  </div><aside class="colside">
  ${!hide.has("evolve") && evolve.length ? `<div class="eyebrow">Evolution options · ${evolve.length}</div>${evolve.map((p) => monRow(p, null, undefined, true)).join("")}` : ""}
  ${
    hide.has("journey")
      ? ""
      : `<div class="eyebrow">Your journey</div>
  <div class="card" style="padding:4px 16px">
    ${CHAPTERS.map((c, i) => {
      if (!inJourney(i)) return "";
      if (i === cur)
        return beats(i)
          ? `<div class="chap-now"><span class="node cur" aria-hidden="true">${i + 1}</span><span style="flex:1">${c.title}<span class="sr">, you are here</span></span><span class="muted small">Now</span></div>${beats(i)}`
          : "";
      const open = unlocked(i),
        g = open ? null : chapterGroups(i),
        cs = open ? chapterSpots(all, i) : null,
        n = g ? uniq(g) : cs!.left,
        done = open && !n;
      const label = !c.places.length
        ? ""
        : g
        ? n
          ? `${n} to catch`
          : "all caught"
        : n || cs!.later
          ? [n && `${n} still out there`, cs!.later && `${cs!.later} later`]
              .filter(Boolean)
              .join(" · ")
          : "all caught";
      return `<details class="chap" data-chap="${i}" ${ui.open.has(String(i)) ? "open" : ""}><summary><span class="node ${done ? "done" : open ? "wip" : ""}" aria-hidden="true">${done ? "✓" : i + 1}</span><span style="flex:1">${c.title}<span class="sr">${done ? ", everything caught" : open ? ", in progress" : ", not reached yet"}</span></span><span class="muted small">${label}</span></summary>
        ${beats(i)}${
          g
            ? Object.entries(g)
                .map(
                  ([place, list]) =>
                    `<div class="place"><div class="placehead"><span>${place}</span></div>${list.map((x) => monRow(x.p, x.r)).join("")}</div>`,
                )
                .join("")
            : cs!.html
        }<div style="height:10px"></div></details>`;
    }).join("")}
  </div>`
  }
  <div class="eyebrow">Badges and items</div>
  <details class="card fold" data-chap="kit" ${ui.open.has("kit") ? "open" : ""}><summary>${P().badges.filter((b) => r.badges.has(b[0])).length} of ${P().badges.length} badges · ${P().kit.filter((k) => r.kit.has(k[0])).length} of ${P().kit.length} items and moves</summary>
    <h3 style="margin-top:8px">${P().region} badges</h3>
    ${badgeRow(P().badges)}
    <button class="chip" style="margin-top:6px" data-badge="Elite Four" data-k="b-e4" aria-pressed="${e4()}">Beat the Elite Four</button>
    ${e4() && P().postgame ? `<h3 style="margin-top:12px">${P().postgame![0]}</h3>${badgeRow(P().postgame![1])}` : ""}
    ${kitGroup("Moves you can use", (k) => !k.endsWith("-rod"))}${kitGroup("Fishing rods", (k) => k.endsWith("-rod"))}
    ${
      P().safari &&
      unlocked(CHAPTERS.findIndex((c) => c.places.includes("Safari Zone")))
        ? `<h3 style="margin-top:12px">Safari Zone: areas you've placed</h3>
    <p class="small muted" style="margin:4px 0 0">The game lets you place 6 of its 12 areas at a time. Pick the ones you've chosen:</p>
    <div class="chips" style="margin-top:8px">${P()
      .safari!.map(
        (a) =>
          `<button class="chip" data-safari="${a}" data-k="s-${a}" aria-pressed="${r.safari.has(a)}" ${!r.safari.has(a) && r.safari.size >= 6 ? "disabled" : ""}>${a}</button>`,
      )
      .join("")}</div>`
        : ""
    }
  </details>
  ${
    hide.has("dex")
      ? ""
      : `<div class="eyebrow">Dex progress</div>
  <div class="card">
    <div style="display:flex;justify-content:space-between"><h3>${P().region} dex</h3><span><b>${regionalCaught()}</b> <span class="muted">/ ${P().regional}</span></span></div>
    <div class="bar" style="margin-top:6px"><i style="width:${(regionalCaught() / P().regional) * 100}%"></i></div>
    ${
      e4() && P().national > P().regional
        ? `<div style="display:flex;justify-content:space-between;margin-top:12px"><h3>National dex</h3><span><b>${r.caught.size}</b> <span class="muted">/ ${P().national}</span></span></div>
    <div class="bar" style="margin-top:6px"><i style="width:${(r.caught.size / P().national) * 100}%"></i></div>`
        : ""
    }
  </div>`
  }
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
      : s.kind === "started"
          ? fillStartDate(s.id)
          : s.kind === "custom"
            ? fillCustom()
            : s.kind === "clock"
              ? fillClock(s.mode)
              : s.kind === "settings"
                ? ($("#sheetbody").innerHTML = Settings())
                : s.kind === "box"
                  ? fillBoxSheet(s.b)
                  : fillMonSheet(s);
}
function openSheet(s: any) {
  ui.sheet = s;
  $("#sheet").classList.toggle("wide", s.kind === "settings");
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
  return `<button class="row monrow" data-editmon="${m.id}" data-k="m${m.id}" aria-label="${esc(m.nick || p.name)}${m.nick ? `, ${p.name}` : ""}${m.shiny ? ", shiny" : ""}, ${esc(boxLabel(m.box))}. Edit">${mon(p, m.shiny)}<span class="grow">
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
    : !R().mons.some((x) => x.n === p.n)
      ? `Where did you put ${p.name}?`
      : `Add another ${p.name}`;
  $("#sheetbody").innerHTML =
    `<div style="display:flex;gap:12px;align-items:center">${mon(p, !!m?.shiny)}<div><h2 id="sheet-title">${title}</h2></div></div>
    <label class="field"><span>Box</span><select id="f-box">${allBoxes()
      .map(
        (b) =>
          `<option value="${b}" ${b === cur ? "selected" : ""} ${full(b) && b !== cur ? "disabled" : ""}>${esc(boxLabel(b))} (${inBox(b).length}/${boxCap(b)})</option>`,
      )
      .join("")}</select></label>
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
    <div class="hv-actions" style="margin-top:20px"><button class="app-primary grow" data-savemon="1">Save</button>${m ? `<button class="app-quiet" data-delmon="${m.id}">Remove</button>` : `<button class="app-quiet" data-close="1">Cancel</button>`}</div>`;
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
const badgeCount = (version: string, s: Summary) => {
  const p = verOf(version).pack;
  return [...p.badges, ...(p.postgame?.[1] || [])].filter((b) =>
    s.badges.includes(b[0]),
  ).length;
};
const cover = (v: (typeof VERSIONS)[VersionId], cls = "") =>
  `<img class="cover ${cls}" src="/covers/${v.short.toLowerCase()}.jpg" alt="${v.name} box art" width="46" height="46">`;
const gameChoices = () =>
  `<div class="newgames">${Object.entries(VERSIONS)
    .map(
      ([id, v]) =>
        `<button class="ng" data-newrun="${id}">${cover(v, "sm")}<b>${v.name}</b><em>Start</em></button>`,
    )
    .join("")}</div>`;
const pickGame = () =>
  `<section class="empty"><h2>Pick a game</h2>${gameChoices()}<p class="muted small">No account needed.</p></section>`;
const ymd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const startDay = (row: RunRow) => ymd(new Date(row.createdAt));
const longDay = (day: string) => {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { dateStyle: "long" });
};
function fillStartDate(id: string) {
  const row = bridge.runs?.find((x) => x.id === id);
  if (!row) return;
  void import("cally");
  const today = ymd(new Date()),
    start = startDay(row) > today ? today : startDay(row);
  $("#sheetbody").innerHTML =
    `<h2 id="sheet-title">Start date</h2>
    <p class="start-date-label" id="start-date-label">This ${verOf(row.version).name} playthrough started on</p>
    <input id="started" type="hidden" value="${start}">
    <div role="group" aria-labelledby="start-date-label">
      <calendar-date class="start-calendar" value="${start}" max="${today}">
        <calendar-month></calendar-month>
      </calendar-date>
    </div>
    <p class="small muted start-date-selected" id="start-date-selected" aria-live="polite">${longDay(start)}</p>
    <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:16px"><button class="chip" data-close="1">Cancel</button><button class="app-primary" data-savestart="${row.id}">Save</button></div>`;
  const calendar = $(".start-calendar") as HTMLElement & { value: string };
  calendar.addEventListener("change", () => {
    ($("#started") as HTMLInputElement).value = calendar.value;
    $("#start-date-selected").textContent = longDay(calendar.value);
  });
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
const champion = (s: Summary) => s.badges.includes("Elite Four");
const ptMenu = (row: RunRow, v: (typeof VERSIONS)[VersionId]) =>
  `<details class="ptmenu"><summary aria-label="More options for ${v.name}">···</summary><div class="menu"><button data-startsheet="${row.id}">Change start date</button><button data-delrun="${row.id}">Delete playthrough</button></div></details>`;
const meter = (n: number, of: number) =>
  `<span class="meter" aria-hidden="true"><i style="width:${(n / of) * 100}%"></i></span>`;
const badgeGroups = (p: Pack): [string, string[][]][] => [
  [p.region, p.badges],
  ...(p.postgame
    ? [[p.postgame[0].replace(/ badges$/, ""), p.postgame[1]] as [string, string[][]]]
    : []),
];
const badgeImg = (b: string, size: number, alt = "") =>
  `<img src="/badges/${b.toLowerCase()}.png" alt="${alt}" width="${size}" height="${size}">`;
const champTag = (r: Summary) =>
  champion(r) ? ` · <span class="champ-tag">Champion</span>` : "";
const avatarN = (): number =>
  ui.avatar ?? (isAvatar(bridge.avatar) ? bridge.avatar : 25);
const avatarName = () => AVATARS.find(([n]) => n === avatarN())?.[1] ?? "";
const partner = (cls: string) =>
  `<img class="${cls}" src="/sprites/hgss/${avatarN()}.png" alt="" width="80" height="80">`;
const trainerName = () => bridge.auth.displayName || "Trainer";
function resumeCard(row: RunRow, r: Summary, at: string) {
  const v = verOf(row.version),
    p = v.pack,
    has = new Set(r.badges),
    groups = badgeGroups(p),
    next = groups.flatMap(([, list]) => list).find((b) => !has.has(b[0]));
  return `<article class="save" data-game="${row.version}">
    <div class="slab">${cover(v, "box")}<p class="last">Last played ${lastPlayed(at)}</p><button class="go lg" data-switch="${row.id}" aria-label="Continue ${v.name}">Continue</button></div>
    <div class="file">
      <div class="file-head"><div><h2 class="lg">${v.name}</h2><p class="soft">${p.region} · Started ${longDay(startDay(row))}${champTag(r)}</p></div>${ptMenu(row, v)}</div>
      <div><p class="lead"><b>${badgeCount(row.version, r)}</b> of ${groups.flatMap(([, l]) => l).length} badges</p>
        <div class="case">${groups
          .map(
            ([label, list]) =>
              `<div class="caserow">${list
                .map((b) =>
                  has.has(b[0])
                    ? `<span class="slot">${badgeImg(b[0], 34, `${b[0]} Badge`)}</span>`
                    : `<span class="slot${b === next ? " next" : ""}"><i role="img" aria-label="${b[0]} Badge, not yet"></i></span>`,
                )
                .join("")}<em>${label}</em></div>`,
          )
          .join("")}</div></div>
      <div><p class="lead"><b>${r.caught}</b> of ${p.national} caught</p>${meter(r.caught, p.national)}</div>
      ${r.party.length ? `<div class="party">${r.party.map((m) => `<img src="/sprites/${p.art}/${m.shiny ? "shiny/" : ""}${m.n}.png" alt="${esc(m.nick || byN[m.n]?.name || "")}" width="52" height="52">`).join("")}</div>` : ""}
    </div></article>`;
}
function miniCard(row: RunRow, r: Summary, at: string) {
  const v = verOf(row.version),
    p = v.pack,
    has = new Set(r.badges);
  return `<div class="run" data-game="${row.version}"><button class="run-go" data-switch="${row.id}"><span class="blk">${cover(v)}</span><span class="who"><b class="lg">${v.name}</b><span class="meta">${p.region} · ${lastPlayed(at).replace(/^on /, "")}${champTag(r)}</span></span><span class="mini" aria-hidden="true">${badgeGroups(p)
    .map(
      ([, list]) =>
        `<span>${list.map((b) => `<span>${has.has(b[0]) ? badgeImg(b[0], 16) : "<i></i>"}</span>`).join("")}</span>`,
    )
    .join("")}</span><span class="sr">${badgeCount(row.version, r)} badges,</span><span class="got"><b>${r.caught}</b> of ${p.national}<span class="sr"> caught</span>${meter(r.caught, p.national)}</span></button>${ptMenu(row, v)}</div>`;
}
const trainerCard = (rows: { row: RunRow; r: Summary }[]) =>
  `<aside class="trainer"><div class="tslab"><h2 class="lg">${esc(trainerName())}</h2>${partner("partner")}</div>
  <ul class="record">
    <li><b>${rows.length}</b> playthrough${rows.length === 1 ? "" : "s"}</li>
    <li class="champ"><b>${rows.filter((x) => champion(x.r)).length}</b> finished as Champion</li>
    <li><b>${rows.reduce((n, x) => n + badgeCount(x.row.version, x.r), 0)}</b> badges earned</li>
    <li><b>${rows.reduce((n, x) => n + x.r.caught, 0)}</b> Pokémon caught</li>
  </ul></aside>`;
const signInNote = () =>
  bridge.auth.isAuthenticated
    ? guestRows().length && !moving
      ? `<p class="notice" role="status">${waitingNote(guestRows().length)}</p>`
      : ""
    : `<p class="notice">Saved only in this browser. <button class="linkish" data-signinsheet="1">Make an account or sign in</button> to save your playthroughs and access them on any device!</p>`;
function Runs() {
  const rows = [...(bridge.runs || [])]
      .map((row) => ({
        row,
        r: row.id === run?.id ? summarize(dumpRun(R())) : row.summary,
        at: row.updatedAt || row.createdAt,
      }))
      .sort((x, y) => y.at.localeCompare(x.at)),
    [top, ...rest] = rows;
  if (!top)
    return `<div class="dash"><h1 class="lg">Dashboard</h1>
  <section class="card welcome"><h2>Start your first playthrough</h2><div class="games">${Object.entries(
    VERSIONS,
  )
    .map(
      ([id, v]) =>
        `<button class="game-tile" data-newrun="${id}">${cover(v)}<span><b>${v.name}</b><span class="small muted">${v.pack.region}</span></span></button>`,
    )
    .join("")}</div></section>${signInNote()}</div>`;
  return `<div class="dash"><h1 class="lg">Dashboard</h1>
  <div class="dash-grid">${resumeCard(top.row, top.r, top.at)}${trainerCard(rows)}
  ${rest.length ? `<section class="sec"><h2 class="lg">Other playthroughs</h2><div class="runs">${rest.map((x) => miniCard(x.row, x.r, x.at)).join("")}</div></section>` : ""}
  <section class="sec"><h2 class="lg">Start another playthrough</h2>${rows.length < MAX_RUNS ? gameChoices() : `<p class="muted">You have ${MAX_RUNS} playthroughs. Delete one to start another.</p>`}</section></div>
  ${signInNote()}</div>`;
}
function Account() {
  const a = bridge.auth;
  return `<section class="s-id"><div class="tslab id"><h2 class="lg">${esc(trainerName())}</h2>${
    a.isAuthenticated
      ? `<p>${esc(a.email || "Signed in")}</p><button class="out" data-signout="1">Sign out</button>`
      : `<p>Saved only in this browser</p><button class="out" data-signinsheet="1">Sign in or create an account</button>`
  }${partner("partner")}</div></section>`;
}
function exportChips() {
  const off = ui.export || !bridge.runs?.length ? "disabled" : "";
  const chip = (kind: string, label: string) =>
    `<button class="chip" data-download="${kind}" data-k="dl-${kind}" ${off}>${ui.export?.kind === kind ? exportLabel() : label}</button>`;
  return (
    chip("json", "Download my data") +
    chip("csv", "Download caught Pokémon (CSV)")
  );
}
const exportError = () =>
  ui.exportError
    ? `<p class="small" role="alert" style="margin:8px 0 0;color:var(--coral)">${ui.exportError}</p>`
    : "";
const MOVE_NOTE =
  "Anything already saved in this browser moves over when you sign in.";
function fillSignIn() {
  $("#sheetbody").innerHTML =
    `<h2 id="sheet-title">Sign in or create an account</h2><div id="clerk-signin" style="margin-top:16px"></div><p class="muted small" style="margin:12px 0 0">${MOVE_NOTE}</p>`;
  const el = $("#clerk-signin") as HTMLDivElement;
  if (!bridge.mountSignIn(el))
    el.innerHTML = `<p class="muted" style="margin:0">Sign-in isn't available right now. You can keep playing as a guest.</p>`;
}
const lookHalf = (theme: string) =>
  `<span data-theme="${theme}"><i class="c"><i class="t"></i><i class="m"><i></i></i><i class="b"></i></i></span>`;
const Appearance = () => `<section class="s-look"><h3>Look</h3>
    <div class="looks" role="group" aria-label="Look">${LOOKS.map(([k, l]) => `<button class="look" data-look="${k}" data-k="look-${k}" aria-pressed="${ui.look === k}"><span class="prev" aria-hidden="true">${lookHalf(PALETTE[k].light)}${lookHalf(PALETTE[k].dark)}</span><span>${l}</span></button>`).join("")}</div></section>
    <section class="s-mode"><h3>Mode</h3>
    <div class="seg" role="group" aria-label="Mode">${[
      ["auto", "Match device"],
      ["light", "Light"],
      ["dark", "Dark"],
    ]
      .map(
        ([k, l]) =>
          `<button data-mode="${k}" data-k="mode-${k}" aria-pressed="${ui.mode === k}">${l}</button>`,
      )
      .join("")}</div></section>`;
const AvatarPicker = () =>
  `<section class="s-pick"><div class="sechead"><h3 id="avatar-h">Avatar</h3><span><b>${avatarName()}</b> · No. ${avatarN()}</span></div>
  <div class="pcbox" role="radiogroup" aria-labelledby="avatar-h">${AVATARS.map(
    ([n, name]) =>
      `<label title="${name}"><input type="radio" name="avatar" value="${n}" data-k="avatar-${n}" aria-label="${name}" ${n === avatarN() ? "checked" : ""}${bridge.auth.isLoading ? " disabled" : ""}><img src="/sprites/hgss/${n}.png" alt="" width="80" height="80"></label>`,
  ).join("")}</div></section>`;
const Settings = () =>
  `<h2 id="sheet-title" class="lg">Settings</h2>
  <div class="sgrid"><div>${Account()}${Appearance()}</div>
  <div>${AvatarPicker()}<section class="s-data"><h3>Your data</h3><div class="chips">${exportChips()}</div>${exportError()}</section></div></div>
  <div class="sfoot">${bridge.auth.isAuthenticated ? `<button class="danger" data-delaccount="1">Delete account</button>` : "<span></span>"}<button class="app-primary" data-close="1">Done</button></div>`;

/* ---- About, Contact ---- */
const contactLink = (text: string) =>
  `<button class="linkish" data-tab="contact">${text}</button>`;
function About() {
  return `<div class="narrow doc">
  <section id="about"><div class="about-intro"><p class="about-wordmark"><span>Just One</span><span>More Catch</span></p><h2>About</h2>
    <p>Just One More Catch is your Pokédex for retro games. It shows you what's available to catch at your point in the story, and where to find it.</p>
    <p>This is a free fan project, and not affiliated with Nintendo, Creatures, GAME FREAK or The Pokémon Company.</p>
    </div><h3>Thanks</h3>
    <ul><li>Encounter data, sprites and badges come from <a href="https://pokeapi.co" target="_blank" rel="noopener">PokeAPI</a>, a free and open Pokémon database built by volunteers.</li>
    <li>Colour themes are inspired by <a href="https://rosepinetheme.com" target="_blank" rel="noopener">Rosé Pine</a>, <a href="https://draculatheme.com" target="_blank" rel="noopener">Dracula</a> and Pokémon palettes from <a href="https://www.schemecolor.com" target="_blank" rel="noopener">SchemeColor</a>.</li>
    <li>Icons are from <a href="https://tabler.io/icons" target="_blank" rel="noopener">Tabler Icons</a>, free under the MIT licence.</li></ul>
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
    <button class="logo" data-tab="playthroughs" aria-label="Just One More Catch, your playthroughs"><span class="full">Just One More Catch</span></button>
    <span class="spacer"></span><span id="topright"></span>
  </div>
  <main id="view"></main>
  <div class="footer-brand"><button data-tab="about" data-sec="about" aria-label="About Just One More Catch">Just One More Catch</button></div>
  <p class="foot">Unofficial fan project, not affiliated with Nintendo, Creatures, GAME FREAK or The Pokémon Company. Free and non-commercial. Box art, sprites and badges © Nintendo, Creatures and GAME FREAK. Encounter data and sprites sourced from <a href="https://pokeapi.co" target="_blank" rel="noopener">PokeAPI</a>. Thank you!</p>
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
  const needsGame = ui.tab !== "playthroughs";
  const loading = a.isLoading || !bridge.runs || (needsGame && !!opening);
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
    : needsGame && ui.loadError
      ? `<p class="small" role="alert" style="text-align:center;padding-top:40px;color:var(--coral)">This game didn't load. Check your connection and reload the page.</p>`
      : (signedIn || ui.tab === "playthroughs"
          ? ui.saveError
            ? `<p class="small" role="alert" style="text-align:center;margin:4px 0 16px;color:var(--coral)">${ui.saveError}</p>`
            : ""
          : `<p class="muted small" style="text-align:center;margin:4px 0 16px">Currently saved only in this browser. <button class="linkish" data-signinsheet="1">Sign in</button> to save your playthroughs and view them on any device.</p>`) +
        VIEWS[ui.tab]();
  $("#topright").innerHTML =
    `<span style="display:flex;gap:8px">${run ? `<button class="gamepill" data-tab="playthroughs" aria-label="Current playthrough: ${ver().name}. Switch playthrough">${cover(ver())}</button>` : ""}${
      a.isLoading
        ? ""
        : `${signedIn ? "" : `<button class="hdr-signup" data-signinsheet="1" data-k="signin">Sign up / Sign in</button>`}<button class="avatar" data-settings="1" data-k="avatar" aria-label="Settings and avatar, ${esc(trainerName())}">${partner("")}</button>`
    }</span>`;
  $("#tabs").innerHTML = !a.isLoading
    ? `<nav class="tabbar" aria-label="Sections">${[
        ["playthroughs", "Dashboard"],
        ["journey", "Journey"],
        ["dex", "Dex"],
        ["boxes", "Boxes"],
      ]
        .map(
          ([t, l]) =>
            `<button data-tab="${t}" ${ui.tab === t ? `aria-current="page"` : ""}>${TAB_ICONS[t]}<span>${l}</span></button>`,
        )
        .join(
          "",
        )}<button class="tab-settings" data-settings="1" data-k="tab-settings">${SETTINGS_ICON}<span>Settings</span></button></nav>`
    : "";
  $("#toast").innerHTML = ui.undo
    ? `<div class="toast">${ui.undo.msg}${ui.undo.n ? `<button data-undo="1">Undo</button>` : ""}</div>`
    : "";
  if (
    (typeof ui.sheet === "number" ||
      ["settings", "custom"].includes(ui.sheet?.kind)) &&
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
  clearTimeout(saveTimer);
  if (run && dumpRun(run) !== ui.saved) {
    const id = run.id,
      state = dumpRun(run);
    bridge.saveRun(id, state).then(
      () => {
        if (run?.id === id) ui.saved = state;
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
const tick = (ms: number) => new Promise((r) => setTimeout(r, ms));
const within = <T>(p: Promise<T>, ms: number) =>
  Promise.race([
    p,
    tick(ms).then(() => {
      throw new Error("Timed out");
    }),
  ]);
// ponytail: all-or-nothing, so a run deleted mid-export fails the whole export; just try again
async function fetchStates(rows: RunRow[], onStep: (done: number) => void) {
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
function saveFile(name: string, type: string, parts: BlobPart[]) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob(parts, { type }));
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
// ponytail: the open run's updatedAt is its last save, even though its state is the live one
const jsonParts = (rows: RunRow[], states: string[]) => [
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
async function caughtCsv(rows: RunRow[], states: string[]) {
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
const exportLabel = () =>
  `Downloading ${ui.export.done} of ${ui.export.total}…`;
async function download(kind: "json" | "csv") {
  const rows = bridge.runs || [];
  if (ui.export || !rows.length) return;
  ui.export = { kind, done: 0, total: rows.length };
  ui.exportError = "";
  render();
  try {
    const states = await fetchStates(rows, (done) => {
      ui.export.done = done;
      const b = document.querySelector(`[data-download="${kind}"]`);
      if (b) b.textContent = exportLabel();
    });
    if (kind === "json")
      saveFile(
        "just-one-more-catch.json",
        "application/json",
        jsonParts(rows, states),
      );
    else
      saveFile("just-one-more-catch-caught.csv", "text/csv", [
        await caughtCsv(rows, states),
      ]);
  } catch {
    ui.exportError =
      "Couldn't download your data. Check your connection and try again.";
  } finally {
    ui.export = null;
    render();
  }
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
  if (d.settings) {
    openSheet({ kind: "settings", k: d.k });
    return;
  }
  if (d.signinsheet) {
    flushSave();
    openSheet({ kind: "signin" });
    return;
  }
  if (d.signout) {
    $("#sheet").close();
    flushSave();
    run = null;
    bridge.signOut();
    return;
  }
  if (d.download) {
    await download(d.download === "csv" ? "csv" : "json");
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
    $("#sheet").close();
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
  if (d.startsheet) {
    openSheet({ kind: "started", id: d.startsheet });
    return;
  }
  if (d.savestart) {
    const day = ($("#started") as HTMLInputElement).value,
      row = bridge.runs?.find((x) => x.id === d.savestart);
    if (!row || !/^\d{4}-\d{2}-\d{2}$/.test(day) || day > ymd(new Date()))
      return;
    $("#sheet").close();
    const [y, m, dd] = day.split("-").map(Number);
    try {
      await bridge.setStart(row.id, new Date(y, m - 1, dd).getTime());
    } catch {
      showSaveError("Couldn't change the start date. Try again.");
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
  if (d.custom) {
    openSheet({ kind: "custom", k: "custom" });
    return;
  }
  if (d.clock) {
    openSheet({ kind: "clock", mode: r.clock.mode, k: "clock" });
    return;
  }
  if (d.clockmode) {
    ui.sheet.mode = d.clockmode;
    fillSheet(ui.sheet);
    $(`[data-clockmode="${d.clockmode}"]`)?.focus();
    return;
  }
  if (d.saveclock) {
    if (ui.sheet.mode === "manual") {
      const [h, m] = ($("#c-time").value || "").split(":").map(Number);
      if (isNaN(h) || isNaN(m)) return;
      r.clock = {
        mode: "manual",
        min: +$("#c-day").value * 1440 + h * 60 + m,
        at: Date.now(),
      };
    } else r.clock = { mode: "device", tz: $("#c-tz").value || undefined };
    r.skip.clear();
    $("#sheet").close();
    scheduleSave();
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
    if ($("#sheet").open && ui.sheet?.kind === "clock") fillSheet(ui.sheet);
  } else if (d.hide) {
    r.hidden.has(d.hide) ? r.hidden.delete(d.hide) : r.hidden.add(d.hide);
  } else if (d.showlater) r.showLater = !r.showLater;
  else if (d.event) {
    if (forced(d.event)) return;
    eventDone(d.event) ? untick(d.event) : r.events.add(d.event);
  } else if (d.yes || d.snooze || d.unsnooze) {
    // A double tap would otherwise answer the next question unread.
    if (performance.now() - (ui.askedAt || 0) < 600) return;
    ui.askedAt = performance.now();
    const e = EVENTS[d.yes || d.snooze || ""];
    if (d.yes) r.events.add(d.yes);
    else if (d.snooze) ui.snooze.add(d.snooze);
    else ui.snooze.clear();
    render();
    ((
      root.querySelector("#ask-q") ||
      root.querySelector('[data-k="ask-now"]') ||
      root.querySelector("#here")
    ) as HTMLElement | null)?.focus();
    announce(e ? (d.yes ? `${e.label}: done` : `${e.label}: asking later`) : "Asking again");
    if (d.yes) scheduleSave();
    return;
  } else if (d.goevent) {
    ui.open.add(String(EVENTS[d.goevent].chap));
    ui.tab = "journey";
    if ($("#sheet").open) $("#sheet").close();
    render();
    const b = root.querySelector("#ev-" + d.goevent) as HTMLElement | null;
    b?.scrollIntoView({ block: "center" });
    b?.focus({ preventScroll: true });
    announce(`Showing ${EVENTS[d.goevent].label} in Your journey`);
    return;
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
type GuestRow = Omit<RunRow, "summary"> & { state: string; movedTo?: string };
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
const AVATAR = "jomc.avatar";
const guestAvatar = () => {
  const n = Number(store.get(AVATAR));
  return isAvatar(n) ? n : null;
};
const refresh = () => queueMicrotask(() => update(raw));
function withGuest(b: Bridge): Bridge {
  if (b.auth.isLoading || b.auth.isAuthenticated) return b;
  return {
    ...b,
    get avatar() {
      return guestAvatar();
    },
    async setAvatar(n) {
      store.set(AVATAR, String(n));
    },
    get runs() {
      return guestRows().map((g) => ({ ...g, summary: summarize(g.state) }));
    },
    async getState(id) {
      return guestRows().find((g) => g.id === id)?.state ?? "{}";
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
    async setStart(id, startedAt) {
      const createdAt = new Date(startedAt).toISOString();
      setGuestRows(
        guestRows().map((r) =>
          r.id === id
            ? { ...r, createdAt, updatedAt: r.updatedAt || r.createdAt }
            : r,
        ),
      );
      refresh();
    },
    async deleteRun(id) {
      setGuestRows(guestRows().filter((r) => r.id !== id));
      refresh();
    },
  };
}
let movingAvatar = false;
function moveGuestAvatar() {
  const n = guestAvatar();
  if (movingAvatar || n === null || raw.avatar === undefined) return;
  if (raw.avatar !== null) return store.del(AVATAR);
  movingAvatar = true;
  raw
    .setAvatar(n)
    .then(() => store.del(AVATAR), () => {})
    .finally(() => (movingAvatar = false));
}
// ponytail: runs one at a time; retries on the next update after a failure
let moving = false,
  lastLeft = 0;
function flash(msg: string) {
  ui.undo = { msg };
  $("#live").textContent = msg;
  clearTimeout(undoTimer);
  undoTimer = setTimeout(() => {
    ui.undo = null;
    render();
  }, 8000);
  render();
}
const plural = (n: number) => `${n} playthrough${n === 1 ? "" : "s"}`;
async function moveGuestRuns() {
  if (moving || !guestRows().length) return;
  moving = true;
  let moved = 0,
    have = bridge.runs?.length || 0;
  try {
    for (const g of guestRows()) {
      if (!g.movedTo && have >= MAX_RUNS) break;
      const id = g.movedTo || (await raw.createRun(g.version));
      if (!g.movedTo) have++;
      setGuestRows(
        guestRows().map((r) => (r.id === g.id ? { ...r, movedTo: id } : r)),
      );
      await raw.saveRun(id, g.state);
      await raw.setStart(id, Date.parse(g.createdAt));
      setGuestRows(guestRows().filter((r) => r.id !== g.id));
      if (store.get("jomc.run") === g.id) pendingRun = id;
      moved++;
    }
  } catch {}
  moving = false;
  const left = guestRows().length;
  if (moved || left !== lastLeft)
    flash(
      left
        ? `${moved ? `Moved ${moved} of ${moved + left} playthroughs to your account. ` : ""}${waitingNote(left)}`
        : `Moved ${plural(moved)} to your account.`,
    );
  lastLeft = left;
}
const waitingNote = (left: number) =>
  (bridge.runs?.length || 0) >= MAX_RUNS
    ? `${plural(left)} from this browser didn't fit. Your account holds up to ${MAX_RUNS} playthroughs, so delete some on the Dashboard to make room and the rest will move over.`
    : `${plural(left)} from this browser couldn't move yet. We'll keep trying.`;

let pendingRun: string | null = null;
function syncRuns() {
  if (bridge.avatar === ui.avatar) ui.avatar = undefined;
  const rows = bridge.runs;
  if (bridge.auth.isLoading || !rows) return;
  if (bridge.auth.isAuthenticated) {
    void moveGuestRuns();
    moveGuestAvatar();
  }
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
          ? ui.open.add(c)
          : ui.open.delete(c);
    },
    true,
  );
  el.addEventListener("change", (e) => {
    const t = e.target as HTMLInputElement;
    if (t.name === "avatar") {
      const n = Number(t.value);
      ui.avatar = n;
      render();
      bridge.setAvatar(n).then(
        () => {
          if (bridge.avatar === n && ui.avatar === n) ui.avatar = undefined;
        },
        () => {
          if (ui.avatar === n) ui.avatar = undefined;
          flash("Couldn't save your avatar. Try again.");
        },
      );
      return;
    }
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
          `[data-k="${typeof s === "number" ? "d" + s : s.k ? s.k : s.id ? "m" + s.id : s.b ? "rb" + s.b : "x"}"]`,
        ) || (root.querySelector("[data-filter][aria-pressed=true]") as any)
      )?.focus();
  });
  const timeKey = () => (run ? `${nowTime()} ${gameNow(R().clock).day}` : "");
  let shownTime = timeKey();
  const refreshTime = () => {
    if (!run || ui.tab !== "journey" || $("#sheet").open || timeKey() === shownTime)
      return;
    shownTime = timeKey();
    render();
  };
  setInterval(refreshTime, 60000);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushSave();
    else refreshTime();
  });
  syncRuns();
  render();
}
export function update(b: Bridge) {
  if (
    !bridge.auth.isLoading &&
    !bridge.auth.isAuthenticated &&
    (b.auth.isLoading || b.auth.isAuthenticated)
  )
    flushSave();
  raw = b;
  bridge = withGuest(b);
  syncRuns();
  if (b.auth.isAuthenticated && ui.sheet?.kind === "signin")
    $("#sheet").close();
  if (!$("#sheet").open) render();
}
