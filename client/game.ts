import { GameData, Pack, VERSIONS } from "./packs";
import { Bridge, Mon, Row, RunRow, Species } from "./types";
import { Clock, gameNow } from "../shared/clock";
import { VersionId } from "../shared/versions";

export const TYPE: Record<string, string> = {
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
export let CHAPTERS: GameData["chapters"] = [];
export let EVENTS: Record<string, GameData["events"][number]> = {};
let LATER: Record<string, GameData["events"][number][]> = {};
export const METHOD: Record<string, [string, string | null]> = {
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
  fishing: ["Fishing", "fishing-rod"],
  "bubbling-spots": ["Bubbling fishing spot", "fishing-rod"],
  "sos-from-bubbling-spot": ["SOS at a bubbling spot", "fishing-rod"],
  sos: ["SOS call", null],
  "island-scan": ["Island Scan", "island-scan"],
  "berry-trees": ["Berry tree", null],
};
export const ONE_TIME = new Set([
  "gift",
  "gift-egg",
  "static",
  "squirt-bottle",
  "pokeflute",
  "npc-trade",
]);
export const TIME: Record<string, string> = {
  "time-morning": "Morning",
  "time-day": "Day",
  "time-night": "Night",
};
export const DAYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];
export const OK_COND: Record<string, string> = {
  "headbutt-tree-common": "Common tree",
  "headbutt-tree-rare": "Rare tree",
  "story-progress-zephyr-badge": "After Zephyr Badge",
  "story-progress-national-dex": "After the Elite Four",
  "story-progress-hall-of-fame": "After the Elite Four",
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
  "story-progress-beat-olivias-trial": "After Olivia's grand trial",
  "other-scan-qr-code": "Scan its QR code",
};
export const cap = (s: string) => s[0].toUpperCase() + s.slice(1);
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
  m = c.match(/^other-(\w+)-(\w+)-in-party$/);
  if (m) return `${cap(m[1])} and ${cap(m[2])} in your party`;
  return cap(c.replace(/-/g, " "));
}
export const coinLabel = (c: string) => {
  const m = c.match(/^coins-(\d+)$/);
  return m ? `${m[1]} coins` : null;
};
export const verOf = (id: string) => VERSIONS[id as VersionId];
export const PARTY_SIZE = 6;
export const HELD_ITEMS = [
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
export const LOOKS = [
  ["blissey", "Blissey"],
  ["venusaur", "Venusaur"],
  ["snorlax", "Snorlax"],
  ["blossom", "Blossom"],
  ["vampire", "Vampire"],
];
export const PALETTE: Record<string, { light: string; dark: string }> = {
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
export const dumpRun = (r: Run) =>
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

export let bridge: Bridge;
export const setBridge = (b: Bridge) => {
  bridge = b;
};
export let run: Run | null = null;
export const closeRun = () => {
  run = null;
};
export let DEX: Species[] = [];
export let byName: Record<string, Species> = {},
  byN: Record<number, Species> = {};
export const ui: any = {
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
export const store = {
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

export const loaded = new Map<Pack, GameData>();

export function openRun(row: RunRow, data: GameData, state: string) {
  const v = verOf(row.version);
  ui.loadError = false;
  run = loadRun(row, state);
  CHAPTERS = data.chapters;
  EVENTS = Object.fromEntries(data.events.map((e) => [e.id, e]));
  LATER = Object.fromEntries(
    data.events.map((e) => [
      e.id,
      data.events.filter((x) => x.after?.includes(e.id)),
    ]),
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
export const R = () => run as Run;
export const ver = () => verOf(R().version);
export const P = () => ver().pack;
export const e4 = () => R().badges.has("Elite Four");
export const visible = (p: Species) => !!p.j || e4();
export const dexList = () =>
  DEX.filter(visible).sort((a, b) =>
    e4() ? a.n - b.n : (a.j as number) - (b.j as number),
  );
export const num = (p: Species) => (e4() || !p.j ? p.n : p.j);
export const pad = (n: number) => String(n).padStart(3, "0");
export const regionalCaught = () =>
  [...R().caught].filter((n) => byN[n]?.j).length;

export const gameTime = () => {
  const h = gameNow(R().clock).hour,
    night = P().nightFrom ?? 24;
  return h >= 4 && h < 10 ? "morning" : h >= 10 && h < night ? "day" : "night";
};
export const nowTime = () => (R().timeAuto ? gameTime() : R().time);
export const isHere = (pl: string) =>
  pl === R().here || pl.startsWith(R().here + " ");
const kitName = (k: string) => (P().kit.find((x) => x[0] === k) as string[])[1];
export const isBadge = (k: string) => /^[A-Z]/.test(k);
export const laterEvents = (id: string) => LATER[id] || [];
// Done because its `by` proves it, directly or through a later event: unticking can't undo it.
export const forced = (id: string): boolean =>
  (!!EVENTS[id].by && has(EVENTS[id].by as string)) ||
  laterEvents(id).some((e) => forced(e.id));
// An event is done when ticked, proven, or implied by a later event that needs it.
export const eventDone = (id: string): boolean =>
  R().events.has(id) ||
  forced(id) ||
  laterEvents(id).some((e) => eventDone(e.id));
// An HM only counts once the player also has the badge that lets them use it outside battle.
export function has(k: string): boolean {
  if (EVENTS[k]) return eventDone(k);
  if (isBadge(k)) return R().badges.has(k);
  const b = P().hm[k];
  return R().kit.has(k) && (!b || R().badges.has(b));
}
export const badgeName = (b: string, p = P()) =>
  `${b} ${p.badgeWord ?? "Badge"}`;
const needText = (k: string) =>
  EVENTS[k]
    ? EVENTS[k].label
    : k === "Elite Four"
      ? "After the Elite Four"
      : isBadge(k)
        ? `Opens with ${badgeName(k)}`
        : R().kit.has(k)
          ? `Needs ${badgeName(P().hm[k])} to use ${kitName(k)}`
          : `Needs ${kitName(k)}`;
const chapterNeeds = (i: number) => [
  ...CHAPTERS[i].needs,
  ...(CHAPTERS[i].kit ? [CHAPTERS[i].kit as string] : []),
];
export const unlocked = (i: number) => chapterNeeds(i).every(has);
const chapterOf = (place: string) =>
  Math.max(
    0,
    CHAPTERS.findIndex((c) => c.places.includes(place)),
  );
export const currentChap = () => {
  const h = chapterOf(R().here);
  return unlocked(h)
    ? h
    : CHAPTERS.reduce(
        (c, ch, i) => (unlocked(i) && ch.places.length ? i : c),
        0,
      );
};
export function rowStatus(r: Row): { s: string; why?: string; need?: string } {
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
      r.cond.includes("story-progress-hall-of-fame") ||
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
export function howElse(p: Species) {
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
export const ORDER: Record<string, number> = {
  now: 0,
  wrongtime: 1,
  special: 2,
  later: 3,
};
export const speciesStatus = (p: Species) => {
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

// Each row folds into the picker place it belongs to (Safari Zone Plains -> Safari Zone).
let placeCache: Record<string, string> = {};
export const placeOf = (pl: string) =>
  (placeCache[pl] ??= NOT_HERE.test(pl)
    ? pl
    : CHAPTERS.flatMap((c) => c.places)
        .filter((c) => pl === c || pl.startsWith(c + " "))
        .sort((a, b) => b.length - a.length)[0] || pl);

export const NOT_HERE =
  /Gym|Game Corner|North Gate|Roaming|House|Pokémon Center|Department Store|Prize Corner|Museum|Silph|Magnet Train|Dock|Embedded|Sinjoh|Celadon Mansion|Cinnabar Lab|Dojo/;
export const inJourney = (i: number) =>
  e4() ||
  (!CHAPTERS[i].needs.includes("Elite Four") && i < CHAPTERS.length - 1);
export const ymd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const startDay = (row: RunRow) => ymd(new Date(row.createdAt));
