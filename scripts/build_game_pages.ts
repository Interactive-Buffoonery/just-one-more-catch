import { imageVersions } from "./image-versions.ts";
import { versionImage } from "../shared/image-url.ts";
const versionsByFolder = imageVersions();
const imageUrl = (path: string) => versionImage(path, versionsByFolder);
import { needLabel } from "../client/need-labels.ts";
import { readFileSync, writeFileSync, mkdirSync, accessSync, readdirSync } from "node:fs";
const METHOD: Record<string, [string, string | null]> = {
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

  "honey-tree": ["Honey Tree", null],
  "pokemon-ranger": ["Pokémon Ranger gift", null],
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
  sos: ["SOS call", null],
  "island-scan": ["Island Scan", "island-scan"],
  "berry-trees": ["Berry tree", null],
};

import { VERSIONS } from "../client/packs.ts";

const esc = (s: unknown) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const games = [
  ["ruby-sapphire", "rs", "Hoenn"],
  ["black-white", "bw", "Unova"],
  ["x-y", "xy", "Kalos"],
  ["diamond-pearl", "dp", "Sinnoh"],
  ["emerald", "emerald", "Hoenn"],
  ["red-blue", "rb", "Kanto"],
  ["yellow", "yellow", "Kanto"],
  ["gold-silver", "gs", "Johto and Kanto"],
  ["crystal", "crystal", "Johto and Kanto"],
  ["firered-leafgreen", "frlg", "Kanto and Sevii Islands"],
  ["heartgold-soulsilver", "hgss", "Johto and Kanto"],
  ["ultra-sun-ultra-moon", "usum", "Alola"],
];
const replace = (text: string, pattern: string | RegExp, value: string | ((...args: any[]) => string)): string => {
  if (!text.match(typeof pattern === "string" ? new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) : pattern)) throw new Error(`Missing replacement: ${pattern}`);
  return text.replace(pattern, typeof value === "function" ? value : () => value);
};
const checked = (text: string) => ({
  replace(pattern: string | RegExp, value: string | ((...args: any[]) => string)) { return checked(replace(text, pattern, value)); },
  replaceAll(pattern: string, value: string) { return checked(replace(text, new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"), value)); },
  toString() { return text; },
});
const template = checked(readFileSync("scripts/game-page.html", "utf8"));
const shell = checked(readFileSync("public/about/index.html", "utf8")).replace(' aria-current="page"', '');
const summaryIcon = `<svg class="gchev" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6l6 -6"/></svg>`;
for (const [slug, id, region] of games) {
  const versions = Object.values(VERSIONS).filter(v => v.pack.art === id && !v.platform);
  const pack = versions[0].pack;
  const data = (await import(`../client/data/${id}.ts`)).default;
  const title = versions.map(v => v.name).join(" and ");
  const candidates = data.dex.filter((m: any) => m.rows.length);
  const before = candidates.filter((m: any) => Math.min(...m.rows.map((r: any) => r.chap)) === 0).length;
  const owned = new Set<string>();
  const gated = new Set<string>(data.chapters.flatMap((ch: any) => [...ch.needs, ...(ch.kit ? [ch.kit] : [])]));
  const listed = new Set<number>();
  const groups = data.chapters.map((ch: any, i: number) => {
    for (const k of [...ch.needs, ...(ch.kit ? [ch.kit] : [])]) owned.add(k);
    const has = (k: string, seen = new Set<string>()): boolean => {
      if (seen.has(k)) return false;
      const next = new Set(seen).add(k);
      const event = data.events.find((e: any) => e.id === k);
      // ponytail: an event, badge or kit item no chapter lists has no known unlock point, so it counts as available
      if (event) return owned.has(k) || !gated.has(k) || (!!event.by && has(event.by, next)) || data.events.some((e: any) => e.after?.includes(k) && has(e.id, next));
      const open = (x: string) => owned.has(x) || !gated.has(x);
      return open(k) && (!pack.hm[k] || open(pack.hm[k]));
    };
    return candidates.filter((m: any) => {
      if (listed.has(m.n) || (m.j == null && !has("Elite Four"))) return false;
      const catchable = m.rows.some((r: any) => r.chap <= i &&
        [...data.chapters[r.chap].needs, ...(data.chapters[r.chap].kit ? [data.chapters[r.chap].kit] : []), METHOD[r.m]?.[1], ...(r.need || [])].every(k => !k || has(k)) &&
        r.cond.every((c: string) => (c !== "story-progress-zephyr-badge" || has("Zephyr")) &&
          (!(["story-progress-national-dex", "story-progress-hall-of-fame", "other-snorlax-11-beat-league"].includes(c) || c.includes("elite-four")) || has("Elite Four"))));
      if (catchable) listed.add(m.n);
      return catchable;
    });
  });
  const mons = groups.flat();
  if (mons.length !== listed.size) throw new Error(`Invalid chapters: ${id}`);
  console.log(`${id}: chapter 1 ${before} -> ${groups[0].length}; total ${candidates.length} -> ${mons.length}`);
  const events = Object.fromEntries(data.events.map((e: any) => [e.id, e]));
  const label = (need: string) => needLabel(need, pack, events);
  const chapters = data.chapters.map((ch: any, i: number) => {
    const species = groups[i];
    const tags = [...ch.needs, ...(ch.kit ? [ch.kit] : [])];
    const sprites = species.map((m: any) => {
      const src = `/sprites/${pack.art}/${m.n}.png`;
      accessSync(`public${src}`);
      return `<li><img src="${imageUrl(src)}" alt="${esc(m.name)}" title="${esc(m.name)}" width="48" height="48" loading="lazy"></li>`;
    }).join("");
    return `<details class="gch"${i === 0 ? " open" : ""}><summary><span class="gnum">${i + 1}</span><span class="grow"><span class="gt">${esc(ch.title)}</span><span class="gneeds">${(tags.length ? tags.map(label) : ["Start"]).map(t => `<span class="tag plain">${esc(t)}</span>`).join("")}</span></span><span class="gcount">${species.length ? `${species.length}<span class="sr"> new Pokémon</span>` : '<span aria-hidden="true">—</span><span class="sr">No new Pokémon</span>'}</span>${summaryIcon}</summary>\n<div class="gbody">${ch.places.length ? `<p class="gplaces">${esc(ch.places.join(", "))}</p>` : ""}${sprites ? `<ul class="gmons" role="list" aria-label="New Pokémon">${sprites}</ul>` : ''}</div></details>`;
  }).join("");
  let content = template.replace(/HeartGold and SoulSilver/g, esc(title)).replace('Gen 4 · Johto and Kanto', esc(`${versions[0].gen} · ${region}`));
  content = content.replace(/<div class="gcovers">.*?<\/div>/s, `<div class="gcovers">${versions.map(v => {const src = `/covers/${v.short.toLowerCase()}.jpg`; accessSync(`public${src}`); return `<img src="${imageUrl(src)}" alt="" width="72" height="72">`;}).join('')}</div>`);
  const places = data.chapters.reduce((n: number, ch: any) => n + ch.places.length, 0);
  let stat = 0;
  content = content.replace(/<dd>\d+<\/dd>/g, () => `<dd>${[mons.length, data.chapters.length, places][stat++]}</dd>`).replace('Track your HeartGold or SoulSilver run', esc(`Track your ${versions.map(v => v.name).join(' or ')} run`));
  content = content.replace("{{chapters}}", chapters).replace(/Also: .*?<\/p>/s, `Also: ${games.filter(g => g[0] !== slug).map(g => `<a href="/${g[0]}/">${esc(Object.values(VERSIONS).filter(v => v.pack.art === g[1] && !v.platform).map(v => v.name).join(' and '))}</a>`).join(' · ')}</p>`);
  const description = `Track which Pokémon you can catch next in ${title}, based on your ${pack.badgesWord ?? 'badges'}.`;
  let html = shell.replace(/<main.*?<\/main>/s, content).replace(/About \| Just One More Catch/g, esc(`Pokémon ${title} | Just One More Catch`)).replaceAll('https://justonemorecatch.app/about/', `https://justonemorecatch.app/${slug}/`).replaceAll('What Just One More Catch is, where its Pokémon data comes from, and who we thank.', esc(description)).replace('<link rel="stylesheet" href="/legal.css" />', '<link rel="stylesheet" href="/legal.css" />\n<link rel="stylesheet" href="/game.css" />');
  html = html.replace("</head>", '<link rel="preload" as="font" type="font/woff2" crossorigin href="/fonts/luckiest-guy/LuckiestGuy-Regular.woff2"></head>');
  accessSync("public/fonts/luckiest-guy/LuckiestGuy-Regular.woff2");
  mkdirSync(`dist/${slug}`, {recursive:true});
  writeFileSync(`dist/${slug}/index.html`, String(html));
  const written = readFileSync(`dist/${slug}/index.html`, "utf8");
  for (const expected of [`https://justonemorecatch.app/${slug}/`, '/game.css', `Pokémon ${title} |`]) {
    if (!written.includes(expected)) throw new Error(`Missing output: ${expected}`);
  }
  console.log(`${slug}: ${mons.length} Pokémon, ${data.chapters.length} chapters, ${places} places; ${region}`);
}

// The app page also answers at its own routes; pair.html serves /pair without a redirect that would drop ?code=.
for (const file of ["journey/index.html", "pokedex/index.html", "boxes/index.html", "settings/index.html", "settings/devices/index.html", "pair.html"]) {
  mkdirSync(`dist/${file}`.replace(/\/[^/]+$/, ""), {recursive:true});
  writeFileSync(`dist/${file}`, readFileSync("dist/index.html"));
}

// Public policy and fallback pages are copied unchanged by Vite.
for (const file of readdirSync("dist", { recursive: true }).filter(file => file.endsWith(".html"))) {
  const path = `dist/${file}`;
  writeFileSync(path, readFileSync(path, "utf8").replace(/src="(\/(?:covers|sprites|badges|items)\/[^"?]+)"/g, (_, src) => `src="${imageUrl(src)}"`));
}
