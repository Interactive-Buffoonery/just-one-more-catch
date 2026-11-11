import { readFileSync, writeFileSync, mkdirSync, accessSync } from "node:fs";
import { VERSIONS } from "../client/packs.ts";

const esc = (s: unknown) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const games = [
  ["heartgold-soulsilver", "hgss", "Johto and Kanto"],
  ["crystal", "crystal", "Johto and Kanto"],
  ["firered-leafgreen", "frlg", "Kanto and Sevii Islands"],
  ["ultra-sun-ultra-moon", "usum", "Alola"],
];
const template = readFileSync("scripts/game-page.html", "utf8");
const shell = readFileSync("public/about/index.html", "utf8").replace(' aria-current="page"', '');
const summaryIcon = `<svg class="gchev" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6l6 -6"/></svg>`;
for (const [slug, id, region] of games) {
  const versions = Object.values(VERSIONS).filter(v => v.pack.art === id);
  const pack = versions[0].pack;
  const data = (await import(`../client/data/${id}.ts`)).default;
  const title = versions.map(v => v.name).join(" and ");
  const mons = data.dex.filter((m: any) => m.rows.length);
  const groups = data.chapters.map((_: any, i: number) => mons.filter((m: any) => Math.min(...m.rows.map((r: any) => r.chap)) === i));
  if (groups.flat().length !== mons.length) throw new Error(`Invalid chapters: ${id}`);
  const label = (need: string) => data.events.find((e: any) => e.id === need)?.label ?? (need === "Elite Four" ? "Beat the Elite Four" : pack.kit.find(k => k[0] === need)?.[1] ?? `${need} ${pack.badgeWord ?? "Badge"}`);
  const chapters = data.chapters.map((ch: any, i: number) => {
    const species = groups[i];
    const tags = [...ch.needs, ...(ch.kit ? [ch.kit] : [])];
    const sprites = species.map((m: any) => {
      const src = `/sprites/${pack.art}/${m.n}.png`;
      accessSync(`public${src}`);
      return `<img src="${src}" alt="${esc(m.name)}" title="${esc(m.name)}" width="48" height="48"${i ? ' loading="lazy"' : ''}>`;
    }).join("");
    return `<details class="gch"${i === 0 ? " open" : ""}><summary><span class="gnum">${i + 1}</span><span class="grow"><span class="gt">${esc(ch.title)}</span><span class="gneeds">${(tags.length ? tags.map(label) : ["Start"]).map(t => `<span class="tag plain">${esc(t)}</span>`).join("")}</span></span><span class="gcount"${species.length ? '' : ' aria-label="None new"'}>${species.length || '—'}</span>${summaryIcon}</summary>\n<div class="gbody"><p class="gplaces">${esc(ch.places.join(", "))}</p>${sprites ? `<div class="gmons">${sprites}</div>` : ''}</div></details>`;
  }).join("");
  let content = template.replace(/HeartGold and SoulSilver/g, esc(title)).replace('Gen 4 · Johto and Kanto', esc(`${versions[0].gen} · ${region}`));
  content = content.replace(/<div class="gcovers">.*?<\/div>/s, `<div class="gcovers">${versions.map(v => {const src = `/covers/${v.short.toLowerCase()}.jpg`; accessSync(`public${src}`); return `<img src="${src}" alt="" width="72" height="72">`;}).join('')}</div>`);
  const places = data.chapters.reduce((n: number, ch: any) => n + ch.places.length, 0);
  let stat = 0;
  content = content.replace(/<dd>\d+<\/dd>/g, () => `<dd>${[mons.length, data.chapters.length, places][stat++]}</dd>`).replace('Track your HeartGold or SoulSilver run', esc(`Track your ${versions.map(v => v.name).join(' or ')} run`));
  content = content.replace("{{chapters}}", chapters).replace(/Also: .*?<\/p>/s, `Also: ${games.filter(g => g[0] !== slug).map(g => `<a href="/${g[0]}/">${esc(Object.values(VERSIONS).filter(v => v.pack.art === g[1]).map(v => v.name).join(' and '))}</a>`).join(' · ')}</p>`);
  const description = `Track which Pokémon you can catch next in ${title}, based on your ${pack.badgesWord ?? 'badges'}.`;
  let html = shell.replace(/<main.*?<\/main>/s, content).replace(/About \| Just One More Catch/g, esc(`${title} | Just One More Catch`)).replaceAll('https://justonemorecatch.app/about/', `https://justonemorecatch.app/${slug}/`).replaceAll('What Just One More Catch is, where its Pokémon data comes from, and who we thank.', esc(description)).replace('<link rel="stylesheet" href="/legal.css" />', '<link rel="stylesheet" href="/legal.css" />\n<link rel="stylesheet" href="/game.css" />');
  mkdirSync(`dist/${slug}`, {recursive:true});
  writeFileSync(`dist/${slug}/index.html`, html);
  console.log(`${slug}: ${mons.length} Pokémon, ${data.chapters.length} chapters, ${places} places; ${region}`);
}
