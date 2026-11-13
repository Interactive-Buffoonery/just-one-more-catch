import { $, esc } from "../dom";
import { byN, R, run, rowStatus, ver, DEX } from "../game";
import { baseOdds, chance, fiftyAt, unitFor, eggTarget, masudaOdds } from "../hunt";
import { sprite } from "../parts";
const fmt = (n: number) => n.toLocaleString("en-US");
export function huntBar() {
  const h = run?.trackShinyHunts && run.hunt;
  document.body.classList.toggle("hunting", !!h);
  return h ? `<div class="huntbar"><button data-hunt="open" aria-label="Open shiny hunt">${esc(byN[h.species].name)} ✦<br>${fmt(h.count)} ${h.count === 1 ? h.unit.slice(0, -1) : h.unit} · ${(chance(h.count, h.odds) * 100).toFixed(1)}%</button><button data-hunt="plus" aria-label="Add one">+1</button></div>` : "";
}
export function huntClick(action: string, save: () => void, show: (fill: () => void) => void, add: (n: number, note: string) => void) {
  if (!run?.trackShinyHunts) return;
  const gen = Number(ver().gen.split(" ")[1]);
  const places = (n: number) => byN[n].rows.filter(r => rowStatus(r).s === "now" && unitFor(r.m));
  const draw = () => {
    const h = R().hunt;
    if (!h) return;
    $("#sheetbody").innerHTML = `<div class="dexsheet"><div class="grab"></div>${sprite(byN[h.species], "hv-sprite")}<h2 id="sheet-title">${esc(byN[h.species].name)} ✦</h2><p>${esc(h.place)}</p><h1>${fmt(h.count)}</h1><p>${h.unit} · ${h.method === "full" ? "Full odds" : h.method === "masuda" ? "Masuda" : "Custom"}</p><div class="hstats"><div>1 in ${fmt(h.odds)}<br>Odds</div><div>${(chance(h.count,h.odds)*100).toFixed(1)}%<br>Chance so far</div><div>${fmt(fiftyAt(h.odds))}<br>50% at</div></div><button class="app-primary done" data-hunt="plus" aria-label="Add one">+1</button><div class="hv-actions"><button data-hunt="minus" aria-label="Remove one">−1</button><button class="app-quiet grow" data-hunt="caught">✦ Shiny ${h.unit === "eggs" ? "hatched" : "caught"}</button><details class="ptmenu"><summary aria-label="More">···</summary><div class="menu"><button data-hunt="count">Set count</button><button data-hunt="method">Change method</button>${h.unit === "encounters" ? '<button data-hunt="place">Change place</button>' : ''}<button data-hunt="end">End hunt</button></div></details></div></div>`;
  };
  const method = (done: (method: "full" | "masuda" | "custom", odds: number) => void, eggs: boolean) => {
    $("#sheetbody").innerHTML = `<h2 id="sheet-title">Method</h2><button id="hunt-full">Full odds</button>${eggs && masudaOdds(gen) ? '<button id="hunt-masuda">Masuda</button>' : ''}<label class="field">Custom<input id="hunt-odds" type="number" min="1" value="${baseOdds(gen) || 4096}"></label><button id="hunt-custom">Custom</button>`;
    $("#hunt-full").onclick = () => done("full", baseOdds(gen) || 4096);
    if ($("#hunt-masuda")) $("#hunt-masuda").onclick = () => done("masuda", masudaOdds(gen)!);
    $("#hunt-custom").onclick = () => { const n = Number($("#hunt-odds").value); if (Number.isFinite(n) && n >= 1) done("custom", n); };
  };
  if (/^\d+$/.test(action) || action === "place") {
    const n = action === "place" ? R().hunt!.species : Number(action), egg = eggTarget(n, { dex: DEX });
    if (action !== "place" && R().hunt && !confirm("Replace hunt?")) return;
    show(() => {
      const rows = places(n).filter(r => action !== "place" || unitFor(r.m) === "encounters");
      $("#sheetbody").innerHTML = `<h2 id="sheet-title">Place</h2>${rows.map((r,i) => `<button class="app-quiet done" data-place-index="${i}">${esc(r.place)}</button>`).join("")}${action !== "place" && egg ? `<button id="hunt-eggs" class="app-quiet done">Eggs · ${esc(byN[egg].name)}</button>` : ''}`;
      const pick = (place: string, unit: "eggs" | "encounters" | "resets", species: number) => {
        if (action === "place") { R().hunt!.place = place; save(); draw(); return; }
        method((m, odds) => { R().hunt = { species, place, unit, method:m, odds, count:0, startedAt:Date.now() }; save(); draw(); }, unit === "eggs");
      };
      document.querySelectorAll<HTMLElement>("[data-place-index]").forEach(b => b.onclick = () => { const r = rows[Number(b.dataset.placeIndex)]; pick(r.place, unitFor(r.m)!, n); });
      if ($("#hunt-eggs")) $("#hunt-eggs").onclick = () => pick("Eggs", "eggs", egg!);
    }); return;
  }
  const h = R().hunt; if (!h) return;
  if (action === "open") { show(draw); return; }
  if (action === "method") { method((m,o) => { h.method=m; h.odds=o; save(); draw(); }, h.unit === "eggs"); return; }
  if (action === "end") { if (!confirm("End hunt?")) return; R().hunt=undefined; $("#sheet").close(); }
  if (action === "caught") { R().hunt=undefined; add(h.species, `${fmt(h.count)} ${h.unit}`); }
  if (action === "plus") h.count++;
  if (action === "minus") h.count=Math.max(0,h.count-1);
  if (action === "count") { const value=prompt("Set count", String(h.count)); if(value === null) return; const n=Number(value); if(!Number.isSafeInteger(n)||n<0)return; h.count=n; }
  save();
  if (!["caught","end"].includes(action) && $("#sheet").open) draw();
}
