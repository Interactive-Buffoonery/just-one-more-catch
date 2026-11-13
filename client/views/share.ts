import { esc } from "../dom";
import { VERSIONS } from "../packs";
import { imageUrl } from "../image-url.ts";
import { SPECIES_NAMES } from "../../shared/species-names";
import { validateProjection, type ShareProjection } from "../../shared/share-projection";

export function renderSnapshot(p: ShareProjection): string {
  if (!validateProjection(p)) throw new Error("Invalid shared progress");
  const v = VERSIONS[p.game], pack = v.pack;
  const groups: [string, string[][]][] = [[pack.region, pack.badges]];
  if (pack.postgame && pack.postgame[1].some(([name]) => p.badges.includes(name)))
    groups.push([pack.postgame[0].replace(/ badges$/, ""), pack.postgame[1]]);
  return `<div class="shd"><img src="${imageUrl(`/covers/${v.cover ?? v.short.toLowerCase()}.jpg`)}" alt=""><div><h3 class="lg">${esc(v.name)}</h3><span class="reg">${esc(pack.region)}</span></div></div><div class="sbl">${groups.map(([region, list]) => {
    const count = list.filter(([name]) => p.badges.includes(name)).length;
    return `<div><div class="row"><b>${count}</b><span>of ${list.length} ${esc(region)} ${esc(pack.badgesWord ?? "badges")}</span></div><div class="bcase">${list.map(([name]) => {
      const on = p.badges.includes(name);
      return `<span class="${on ? "" : "off"}"><img src="${imageUrl(`/badges/${name.toLowerCase()}.png`)}" alt="${esc(name)} ${esc(pack.badgeWord ?? "Badge")}${on ? "" : ", not yet"}">${esc(name)}</span>`;
    }).join("")}</div></div>`;
  }).join("")}<div><div class="row"><b>${p.caught.length}</b><span>caught</span><small>${esc(pack.region)} Dex</small></div>${p.caught.length ? `<ul class="dex">${p.caught.map(n => `<li><img src="${imageUrl(`/sprites/${pack.art}/${n}.png`)}" alt="">${esc(SPECIES_NAMES[n])}<small>#${esc(String(n).padStart(3, "0"))}</small></li>`).join("")}</ul>` : `<p class="empty">No catches recorded yet.</p>`}</div></div>`;
}
