import { badgeName as sharedBadgeName, needLabel as sharedNeedLabel } from "./need-labels.ts";
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
  fairy: "#de80c0",
};
export let CHAPTERS: GameData["chapters"] = [];
export let EVENTS: Record<string, GameData["events"][number]> = {};
let LATER: Record<string, GameData["events"][number][]> = {};
export const METHOD: Record<string, [string, string | null]> = {
  walk: ["Walking", null],
  "dark-grass": ["Dark grass", null],
  "grass-spots": ["Rustling grass", null],
  "cave-spots": ["Dust cloud", null],
  "bridge-spots": ["Flying shadow", null],
  "surf-spots": ["Rippling water (Surf)", "surf"],
  "super-rod-spots": ["Rippling water (fishing)", "super-rod"],
  horde: ["Horde encounter", null],
  "yellow-flowers": ["Yellow flowers", null],
  "purple-flowers": ["Purple flowers", null],
  "red-flowers": ["Red flowers", null],
  "rough-terrain": ["Rough terrain", null],
  "ground-ambush": ["Ground ambush", null],
  "ceiling-ambush": ["Ceiling ambush", null],
  "sky-ambush": ["Sky ambush", null],
  "rustling-bush-ambush": ["Rustling bush", null],
  "trash-can-ambush": ["Shaking trash can", null],

  "honey-tree": ["Honey tree (wait 6 hours)", "honey"],
  "pokemon-ranger": ["Pokémon Ranger gift", null],
  "hidden-grotto": ["Hidden Grotto", null],
  seaweed: ["Underwater", "dive"],
  "feebas-tile-fishing": ["Feebas fishing tiles", "old-rod"],
  "devon-scope": ["Devon Scope", null],
  "wailmer-pail": ["Wailmer Pail", "wailmer-pail"],
  "roaming-water": ["Roaming on water", "surf"],
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
  "dirt-cloud": ["Dirt cloud ambush", null],
  "sand-cloud": ["Sand cloud ambush", null],
  "rustling-grass": ["Rustling grass ambush", null],
  "rustling-tree": ["Rustling tree ambush", null],
  "rustling-bush": ["Rustling bush ambush", null],
  "flying-shadow": ["Flying shadow ambush", null],
  "water-splash": ["Water splash ambush", "surf"],
  "cave-shadow": ["Cave shadow ambush", null],
  sos: ["SOS call", null],
  "island-scan": ["Island Scan", "island-scan"],
  "berry-trees": ["Berry tree", null],
};
export const ONE_TIME = new Set([
  "pokemon-ranger",
  "devon-scope",
  "wailmer-pail",
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
  "season-spring": "Spring only",
  "season-summer": "Summer only",
  "season-autumn": "Autumn only",
  "season-winter": "Winter only",
  "special-encounter-couldnt-capture-before": "After the League, if not caught earlier",
  "story-progress-juniper-cave-of-being": "Meet the lake guardians in Cave of Being",
  "story-progress-quake-badge": "After the Quake Badge",
  "other-captured-reshiram-or-zekrom": "After catching N’s dragon",
  "item-lunar-wing": "Bring the Lunar Wing",
  "item-dark-stone": "Bring the Dark Stone",
  "item-light-stone": "Bring the Light Stone",
  "item-iron-key": "Activate the Iron Key",
  "item-ice-key": "Activate the Iceberg Key",
  "radar-off": "Without Poké Radar",
  "slot2-none": "No GBA cartridge inserted",
  "backlot-not-mentioned": "Regular Trophy Garden encounter",
  "great-marsh-daily-slot-none": "Regular Great Marsh encounter",
  "other-giratina-not-caught-in-distortion-world": "Only if Giratina was not caught in the Distortion World",
  "item-adamant-orb": "Carry the Adamant Orb",
  "item-lustrous-orb": "Carry the Lustrous Orb",
  "story-progress-beat-red": "After beating Red",
  "story-progress-awakened-beasts": "After the Burned Tower beasts wake",
  "story-progress-vermilion-copycat": "After returning Copycat's doll",
  "story-progress-receive-tm-from-claire": "After Clair's TM",
  "story-progress-returned-machine-part": "After returning the Machine Part",
  "friend-safari-slot-1": "Registered friend’s Safari: slot 1",
  "friend-safari-slot-2": "Registered friend’s Safari: slot 2",
  "friend-safari-slot-3": "Friend’s third Safari slot unlocked (Hall of Fame and shared PSS session)",
  "other-found-11-times-roaming": "After eleven roaming encounters",
  "trash-can-type-daily": "Daily shaking trash can",
  "other-received-kanto-starter": "After getting a Kanto starter",
  "other-event-arceus-in-party": "Event Arceus in your party",
  "other-snorlax-11-beat-league": "After the Elite Four",
  "other-correct-password": "Primo's password egg",
  "radio-hoenn": "Hoenn Sound on the radio",
  "radio-sinnoh": "Sinnoh Sound on the radio",
  "swarm-yes": "Swarm only",
  "daily-outbreak": "Daily outbreak only (check gate bulletin boards)",
  "season-not-winter": "Spring, summer or autumn only",
  "bug-catching-contest-yes": "Bug-Catching Contest",
  "trade-any-pokemon": "Trade any Pokémon",
  "headbutt-tree-secret": "Secret tree",
  "other-virtual-console": "Virtual Console event",
  "story-progress-beat-elite-four-round-two": "After the Elite Four rematch",
  "item-old-amber": "Bring the Old Amber",
  "first-party-pokemon-high-friendship": "Lead Pokémon has high friendship",
  "story-progress-beat-olivias-trial": "After Olivia's grand trial",
  "other-scan-qr-code": "Scan its QR code",
  "radar-on": "Poké Radar grass",
  "slot2-ruby": "Ruby in the DS Game Boy Advance slot",
  "slot2-sapphire": "Sapphire in the DS Game Boy Advance slot",
  "slot2-emerald": "Emerald in the DS Game Boy Advance slot",
  "slot2-firered": "FireRed in the DS Game Boy Advance slot",
  "slot2-leafgreen": "LeafGreen in the DS Game Boy Advance slot",
  "backlot-mentioned": "Today's or yesterday's Trophy Garden guest",
  "honey-tree-group-a": "Honey Tree group A (after 6 hours)",
  "honey-tree-group-b": "Honey Tree group B (after 6 hours)",
  "honey-tree-group-c": "Munchlax Honey Tree (after 6 hours)",
  "item-odd-keystone": "Place an Odd Keystone in the Hallowed Tower",
  "other-talked-to-32-people-underground": "Talk to players 32 times in the Underground",
  "other-regirock-regice-registeel-in-party": "Regirock, Regice and Registeel in your party",
};
export const cap = (s: string) => s[0].toUpperCase() + s.slice(1);
function specialLabel(c: string) {
  if (STORY[c]) return STORY[c];
  if (c.startsWith("season-")) return `${cap(c.slice(7))} only`;
  if (c === "special-encounter-couldnt-capture-before") return "If the earlier catch was deferred";
  let m = c.match(/^great-marsh-daily-slot-(\d+)-of-32$/);
  if (m) return "Great Marsh daily Pokémon";
  m = c.match(/^johto-safari-blocks-(\w+)-min-(\d+)$/);
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
  forms: Set<string>;
  trackForms: boolean;
  trackTraded: boolean;
  trackGenders: boolean;
  genders: Record<number, Set<string>>;
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
  view: "journey" | "dex" | "dexonly";
  startView: "journey" | "dex";
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
    forms: new Set((Array.isArray(s.forms) ? s.forms : []).filter((f: unknown) => typeof f === "string")),
    trackForms: s.trackForms !== false,
    trackTraded: s.trackTraded === true,
    trackGenders: s.trackGenders === true,
    genders: Object.fromEntries(
      Object.entries(s.genders || {}).filter(([n, gs]) => /^\d+$/.test(n) && Array.isArray(gs)).map(([n, gs]) =>
        [n, new Set((gs as unknown[]).filter((g) => g === "m" || g === "f"))],
      ),
    ),
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
    view: s.view === "dex" || s.view === "dexonly" ? s.view : "journey",
    startView: s.startView === "dex" || s.view === "dex" ? "dex" : "journey",
  };
}
export const dumpRun = (r: Run) =>
  JSON.stringify({
    badges: [...r.badges],
    kit: [...r.kit],
    events: [...r.events],
    safari: [...r.safari],
    caught: [...r.caught],
    forms: [...r.forms],
    trackForms: r.trackForms,
    trackTraded: r.trackTraded,
    trackGenders: r.trackGenders,
    genders: Object.fromEntries(Object.entries(r.genders).map(([n, gs]) => [n, [...gs]])),
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
    view: r.view,
    startView: r.startView,
  });

export const visibleForms = (p: Species) => (p.forms || []).filter((f) => R().trackTraded || !f.trade);

export function collectedForms(p: Species) {
  const r = R();
  return new Set(visibleForms(p).filter((f) =>
    r.forms.has(f.id) || r.mons.some((m) => m.n === p.n && (m.form || p.forms?.[0]?.id) === f.id),
  ).map((f) => f.id));
}

export const hasGenders = (p: Species) => p.genderRate > 0 && p.genderRate < 8;
export const GENDERS = [["m", "♂", "Male"], ["f", "♀", "Female"]] as const;
export function collectedGenders(p: Species) {
  const r = R();
  return new Set(hasGenders(p) ? GENDERS.filter(([g]) =>
    r.genders[p.n]?.has(g) || r.mons.some((m) => m.n === p.n && m.g === g),
  ).map(([g]) => g) : []);
}

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
  boxLayout: "list",
  filter: "now",
  q: "",
  bulk: false,
  undo: null,
  sheet: null,
  open: new Set(),
  shut: new Set(),
  look: "blossom",
  mode: "auto",
  saved: "",
  saving: false,
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
  const under = (pl: string) => (r: Row) => r.place === pl || r.place.startsWith(pl + " ");
  // drop places only the other version can visit (Birth Island on GBA, Lake of the Sunne in Ultra Sun)
  CHAPTERS = data.chapters.map((c) => ({
    ...c,
    places: c.places.filter(
      (pl) => !DEX.some((p) => p.all.some(under(pl))) || DEX.some((p) => p.rows.some(under(pl))),
    ),
  }));
  byName = Object.fromEntries(DEX.map((p) => [p.name, p]));
  byN = Object.fromEntries(DEX.map((p) => [p.n, p]));
  for (const m of run.mons) {
    const p = byN[m.n],
      form = p?.forms?.find((f) => f.id === m.form) || p?.forms?.[0];
    if (form) {
      run.forms.add(form.id);
      run.caught.add(m.n);
    }
  }
  ui.saved = dumpRun(run);
  ui.skip = new Set();
  ui.snooze = new Set();
  store.set("jomc.run", row.id);
}
export const R = () => run as Run;
export const ver = () => verOf(R().version);
export const P = () => ver().pack;
export const e4 = () => R().badges.has("Elite Four");
export const visible = (p: Species) => p.j != null || e4();
export const dexList = () =>
  DEX.filter(visible).sort((a, b) =>
    e4() ? a.n - b.n : (a.j as number) - (b.j as number),
  );
export const num = (p: Species) => (e4() || p.j == null ? p.n : p.j);
export const pad = (n: number) => String(n).padStart(3, "0");
export const regionalCaught = () =>
  [...R().caught].filter((n) => byN[n]?.j != null).length;

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
export const badgesWord = (p = P(), n = 2) =>
  (p.badgesWord ?? "badges").slice(0, n === 1 ? -1 : undefined);
export const badgeName = (b: string, p = P()) =>
  sharedBadgeName(b, p);
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
// Short name for what a chapter waits on.
export const needLabel = (k: string) => sharedNeedLabel(k, P(), EVENTS, R().kit);
export const chapterNeeds = (i: number) => [
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
export function rowStatus(r: Row): { s: string; why?: string; need?: string; kind?: "starter" | "trade" } {
  const run = R();
  const methodNeed = r.m === "feebas-tile-fishing" &&
    ["old-rod", "good-rod", "super-rod"].some(has) ? null : METHOD[r.m]?.[1];
  const missing = [
    ...chapterNeeds(r.chap),
    methodNeed,
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
  ) {
    const caught = DEX.some((p) => p.rows.includes(r) && run.caught.has(p.n));
    return {
      s: "special",
      kind: caught ? "starter" : "trade",
      why: caught
        ? "Your starter"
        : "Trade only",
    };
  }
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
  const pair = v.other && Object.values(VERSIONS).find((x) => x.pack === v.pack && x.code !== v.code && x.platform === v.platform);
  const elsewhere = (s: Species) => !!pair && s.all.some((r) => r.v.includes(pair.code));
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

export const isGuest = () => !!bridge && !bridge.auth.isAuthenticated && !bridge.auth.isLoading;
export const viewOf = (r: Run) => isGuest() ? "dexonly" : r.view;
