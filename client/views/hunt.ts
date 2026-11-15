import { $, esc } from "../dom";
import { byN, cap, CHAPTERS, currentChap, DEX, METHOD, isHere, R, rowStatus, TYPE, ui, ver } from "../game";
import {
  baseOdds,
  chance,
  eggTarget,
  fiftyAt,
  masudaOdds,
  unitFor,
  type Hunt,
} from "../hunt";
import { activeHunt, mon, rowTags, sprite } from "../parts";
import { Species } from "../types";

const fmt = (n: number) => Math.round(n).toLocaleString("en-US");
const pct = (h: Hunt) => `${(chance(h.count, h.odds) * 100).toFixed(1)}%`;
const units = (h: Hunt) => (h.count === 1 ? ONE[h.unit] : h.unit);
const gen = () => Number(ver().gen.replace(/\D/g, ""));
const ONE = { encounters: "encounter", eggs: "egg", resets: "reset" };
const METHODS = {
  full: "Full odds",
  masuda: "Masuda",
  custom: "Custom",
} as const;
type Method = keyof typeof METHODS;
type Option = { place: string; unit: Hunt["unit"]; species: number };

export function huntOptions(n: number): Option[] {
  if (!baseOdds(gen()) || !byN[n]) return [];
  const out: Option[] = [];
  // ponytail: one option per place; the first catchable row there sets the unit
  for (const r of byN[n].rows) {
    const unit = unitFor(r.m);
    if (
      unit &&
      rowStatus(r).s === "now" &&
      !out.some((o) => o.place === r.place)
    )
      out.push({ place: r.place, unit, species: n });
  }
  out.sort((a, b) => +isHere(b.place) - +isHere(a.place));
  const egg = eggTarget(n, DEX, gen());
  if (egg && byN[egg]) out.push({ place: "Eggs", unit: "eggs", species: egg });
  return out;
}

export function huntButton(n: number) {
  if (!R().trackShinyHunts) return "";
  const h = R().hunt;
  if (h?.species === n)
    return `<button type="button" class="app-quiet gold huntopen" data-hunt="open" data-k="hunt${n}"><span class="sr">Shiny hunt </span>✦ <b class="hunt-cnt">${fmt(h.count)}</b></button>`;
  return huntOptions(n).length
    ? `<button type="button" class="app-quiet gold" data-hunt="start" data-species="${n}" data-k="hunt${n}">✦ Hunt</button>`
    : "";
}

export function huntBar() {
  const h = activeHunt(),
    p = h && byN[h.species];
  if (!h || (!p && !h.kind)) return "";
  return `<div class="huntbar" role="region" aria-label="Shiny hunt"><button type="button" class="hb-main" data-hunt="open" data-k="hunt-bar">${h.kind ? '<span class="mon star" aria-hidden="true"><b>✦</b></span>' : mon(p!, true)}<span class="grow"><span class="name">${h.kind ? esc(h.place + " · " + kindName(h.kind)) : p!.name + ' <span class="shiny">✦</span>'}</span><span class="hb-sub"><b class="hunt-cnt">${fmt(h.count)}</b> <span class="hunt-unit">${units(h)}</span> · <span class="hunt-pct">${pct(h)}</span></span></span></button><button type="button" class="hb-plus" data-hunt="plus" data-k="hunt-plus" aria-label="Add one ${ONE[h.unit]}">+1</button></div>`;
}

export function paintHunt() {
  const h = activeHunt();
  if (!h) return;
  document
    .querySelectorAll(".hunt-cnt")
    .forEach((e) => (e.textContent = fmt(h.count)));
  document
    .querySelectorAll(".hunt-pct")
    .forEach((e) => (e.textContent = pct(h)));
  document
    .querySelectorAll(".hunt-unit")
    .forEach((e) => (e.textContent = units(h)));
  document
    .querySelectorAll<HTMLElement>(".hunt-fill")
    .forEach((e) => (e.style.width = pct(h)));
  document.querySelectorAll<HTMLElement>("[data-shiny-rate]").forEach(e => e.textContent = (chance(h.count, h.odds * 100 / +e.dataset.shinyRate!) * 100).toFixed(1) + "%");
  $("#live").textContent = `${fmt(h.count)} ${units(h)}`;
}

const types = (p: Species) =>
  p.types
    .map((t) => `<span class="type" style="--tc:${TYPE[t]}">${cap(t)}</span>`)
    .join(" ");
const band = (p: Species, k: string, extra: string) =>
  `<div class="grab" aria-hidden="true"></div><section class="next" style="--t1:${TYPE[p.types[0]]};--t2:${TYPE[p.types[1] || p.types[0]]}"><div class="band">${sprite(p, "hv-sprite", true)}<div class="k">${k}</div><h2 class="lg" id="sheet-title">${p.name} <span class="shiny">✦</span></h2>${extra}</div>`;
const placeName = (o: Option) =>
  o.place === "Eggs" ? `Eggs · ${byN[o.species].name}` : esc(o.place);
const placeList = (opts: Option[], checked: number) =>
  `<h3>Place</h3><div class="card">${opts.map((o, i) => `<label class="spot pick"><span class="pn grow">${placeName(o)}${isHere(o.place) ? `<span class="here-tag">Selected</span>` : ""}</span><input type="radio" name="hunt-place" value="${i}"${i === checked ? " checked" : ""}></label>`).join("")}</div>`;
const methodPicker = (eggs: boolean, h?: Hunt) => {
  const m = h?.method || "full";
  return `<h3>Method</h3><div class="seg3 wide" role="group" aria-label="Method">${(Object.keys(METHODS) as Method[]).map((k) => `<button type="button" data-huntmethod="${k}" aria-pressed="${k === m}"${k === "masuda" && !(eggs && masudaOdds(gen())) ? " hidden" : ""}>${METHODS[k]}</button>`).join("")}</div><label class="field" id="hunt-custom"${m === "custom" ? "" : " hidden"}><span>1 in</span><input id="hunt-odds" type="number" inputmode="numeric" min="1" step="1" required value="${m === "custom" ? h!.odds : baseOdds(gen())}"></label>`;
};
const startActions = `<button type="button" class="app-primary grow" data-hunt="begin">Start hunt</button><button type="button" class="app-quiet" data-close="1">Cancel</button>`;
const footActions = (h: Hunt) =>
  `<button type="button" class="app-quiet" data-hunt="minus" aria-label="Remove one ${ONE[h.unit]}">−1</button><button type="button" class="app-quiet gold grow" data-hunt="caught">✦ Shiny ${h.unit === "eggs" ? "hatched" : "caught"}</button><details class="ptmenu up"><summary aria-label="More">···</summary><div class="menu"><button type="button" data-hunt="count">Set count</button><button type="button" data-hunt="method">Change method</button>${h.unit === "encounters" && !h.kind ? `<button type="button" data-hunt="place">Change place</button>` : ""}<button type="button" data-hunt="end" data-end>End hunt</button></div></details>`;
const editActions = (save: string) =>
  `<div class="hv-actions hfoot"><button type="button" class="app-primary grow" data-hunt="${save}">Save</button><button type="button" class="app-quiet" data-hunt="open">Cancel</button></div>`;
const placeOptions = (h: Hunt) => {
  const opts = huntOptions(h.species).filter((o) => o.unit === "encounters");
  return opts.some((o) => o.place === h.place)
    ? opts
    : [{ place: h.place, unit: h.unit, species: h.species }, ...opts];
};

const kindName = (m: string) => METHOD[m]?.[0] || cap(m);
const wildRows = () => DEX.flatMap(p => p.rows.filter(r => unitFor(r.m) === "encounters" && rowStatus(r).s === "now").map(r => ({ p, r })));
const placeRows = (h: Hunt) => {
  const rows = wildRows().filter(({r}) => r.place === h.place && r.m === h.kind);
  return [...new Set(rows.map(x => x.p.n))].map(n => {
    const matches = rows.filter(x => x.p.n === n), first = matches[0];
    return { p: first.p, r: {...first.r, c: matches.reduce((sum, x) => sum + x.r.c, 0)} };
  });
};
export function journeyHuntButton() {
  if (!R().trackShinyHunts || !baseOdds(gen())) return "";
  return `<button type="button" class="quietbtn gold" data-hunt="${R().hunt ? "open" : "pick"}">${R().hunt ? "✦ " + fmt(R().hunt!.count) : "✦ Start a shiny hunt"}</button>`;
}
function fillPicker(s: any) {
  const rows = wildRows(), places = [...new Set(rows.map(x => x.r.place))];
  const body = s.tab === "species"
    ? `<label class="field"><span>Pokémon</span><input id="hunt-search" type="search"></label><div class="card">${DEX.filter(p => p.rows.some(r => r.chap === currentChap() && unitFor(r.m) && rowStatus(r).s === "now")).map(p => `<label class="spot pick" data-huntname="${esc(p.name.toLowerCase())}">${mon(p)}<span class="pn grow">${p.name}</span><input type="radio" name="hunt-species" value="${p.n}"></label>`).join("")}</div>`
    : CHAPTERS.map((ch, i) => ({ch, i})).filter(x => x.i <= currentChap()).reverse().map(({ch,i}, index) => `<details class="fold"${index === 0 ? " open" : ""}><summary>${esc(ch.title)}</summary><div class="card">${places.filter(pl => rows.some(x => x.r.place === pl && x.r.chap === i)).map(pl => `<label class="spot pick"><span class="pn grow">${esc(pl)}${isHere(pl) ? '<span class="here-tag">You are here</span>' : ""}<span class="tags">${[...new Set(rows.filter(x => x.r.place === pl).map(x => x.r.m))].map(m => `<span class="tag">${kindName(m)}</span>`).join("")}</span></span><input type="radio" name="hunt-wild-place" value="${esc(pl)}"${isHere(pl) ? " checked" : ""}></label>`).join("")}</div></details>`).join("");
  $("#sheetbody").innerHTML = `<div class="dexsheet pickstep"><div class="grab"></div><h2 class="lg" id="sheet-title">Start a shiny hunt <span class="shiny">✦</span></h2><div class="seg3 wide" role="group" aria-label="Hunt by">${["Place","Species"].map(t => `<button data-hunt="pick" data-tab="${t.toLowerCase()}" aria-pressed="${(s.tab || "place") === t.toLowerCase()}">${t}</button>`).join("")}</div>${body}<div class="hv-actions hgo"><button class="app-primary grow" data-hunt="next">Next</button><button class="app-quiet" data-close="1">Cancel</button></div></div>`;
}
export function fillHunt(s: any) {
  const h = activeHunt();
  if (s.step === "pick") return fillPicker(s);
  if (s.step === "wildstart") {
    const kinds = [...new Set(wildRows().filter(x => x.r.place === s.place).map(x => x.r.m))];
    $("#sheetbody").innerHTML = `<div class="dexsheet pickstep"><h2 id="sheet-title">${esc(s.place)}</h2><div class="seg3 wide" role="group" aria-label="Encounter kind"${kinds.length === 1 ? " hidden" : ""}>${kinds.map((k,i) => `<label class="chip"><span class="grow">${kindName(k)}</span><input type="radio" name="hunt-kind" value="${k}"${i === 0 ? " checked" : ""}></label>`).join("")}</div>${methodPicker(false)}<div class="hv-actions hgo">${startActions}</div></div>`;
    return;
  }
  if (h?.kind && !["method", "count"].includes(s.step)) {
    const rows = placeRows(h);
    $("#sheetbody").innerHTML = `<div class="dexsheet"><h2 id="sheet-title">${esc(h.place)} · ${kindName(h.kind)}</h2><div class="hbody"><b class="hunt-cnt lg">${fmt(h.count)}</b><span class="hunt-pct">${pct(h)}</span><button class="plus" data-hunt="plus">+1</button><div class="card">${rows.map(({p,r}) => `<div class="spot">${mon(p)}<span class="grow">${p.name} · ${r.c}% · <span data-shiny-rate="${r.c}">${(chance(h.count, h.odds * 100 / r.c)*100).toFixed(1)}%</span></span>${s.step === "caught" ? `<button class="chip" data-hunt="record" data-species="${p.n}">✦ Shiny caught</button>` : ""}</div>`).join("")}</div></div><div class="hv-actions hfoot">${footActions(h)}</div></div>`;
    return;
  }
  if (s.step === "start") {
    const p = byN[s.n],
      opts = huntOptions(s.n);
    $("#sheetbody").innerHTML =
      `<div class="dexsheet pickstep">${band(p, "Shiny hunt", types(p))}</section>${placeList(opts, 0)}${methodPicker(opts[0]?.place === "Eggs")}<div class="hv-actions hgo">${startActions}</div></div>`;
    return;
  }
  if (!h) return;
  const p = byN[h.species] || placeRows(h)[0]?.p;
  if (s.step === "count" || s.step === "method" || s.step === "place") {
    const body =
      s.step === "count"
        ? `<label class="field"><span>Count</span><input id="hunt-count" type="number" inputmode="numeric" min="0" step="1" required value="${h.count}"></label>`
        : s.step === "method"
          ? methodPicker(h.place === "Eggs", h)
          : placeList(
              placeOptions(h),
              placeOptions(h).findIndex((o) => o.place === h.place),
            );
    $("#sheetbody").innerHTML =
      `<div class="dexsheet pickstep">${h.kind ? `<h2 id="sheet-title">${esc(h.place)} · ${kindName(h.kind)}</h2><section>` : band(p, esc(h.place), types(p))}</section>${body}${editActions("save" + s.step)}</div>`;
    return;
  }
  const rows = p.rows.filter((r) => r.place === h.place && unitFor(r.m) === h.unit),
    row = rows.find((r) => rowStatus(r).s === "now") || rows[0];
  $("#sheetbody").innerHTML =
    `<div class="dexsheet">${band(p, esc(h.place), row ? rowTags(row) : types(p))}
    <div class="hbody"><div class="hcount"><b class="hunt-cnt lg">${fmt(h.count)}</b><span class="where-k">${cap(h.unit)} · ${METHODS[h.method]}</span></div>
    <div class="hstats"><div><b>1 in ${fmt(h.odds)}</b><span>Odds</span></div><div><b class="hunt-pct">${pct(h)}</b><span>Chance so far</span></div><div><b>${fmt(fiftyAt(h.odds))}</b><span>50% at</span></div></div>
    <div class="bar"><i class="hunt-fill" style="width:${pct(h)}"></i></div>
    <button type="button" class="plus" data-hunt="plus" data-k="hunt-plus-sheet" aria-label="Add one ${ONE[h.unit]}">+1</button></div></section>
    <div class="hv-actions hfoot">${footActions(h)}</div></div>`;
}

const pressed = () =>
  ($("#sheetbody [data-huntmethod][aria-pressed=true]") as HTMLElement).dataset
    .huntmethod as Method;
function readOdds(m: Method) {
  if (m === "full") return baseOdds(gen());
  if (m === "masuda") return masudaOdds(gen());
  const input = $("#hunt-odds") as HTMLInputElement;
  return input.reportValidity() ? +input.value : null;
}
const checkedPlace = () =>
  +($("#sheetbody [name=hunt-place]:checked") as HTMLInputElement).value;

export function huntPlaceChanged() {
  const s = ui.sheet,
    opts = s?.step === "start" ? huntOptions(s.n) : [];
  const masuda = $("#sheetbody [data-huntmethod=masuda]") as HTMLElement | null;
  if (!masuda) return;
  masuda.hidden = !(
    opts[checkedPlace()]?.place === "Eggs" && masudaOdds(gen())
  );
  if (masuda.hidden && masuda.getAttribute("aria-pressed") === "true")
    pickMethod("full");
}
function pickMethod(m: Method) {
  document
    .querySelectorAll<HTMLElement>("#sheetbody [data-huntmethod]")
    .forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.huntmethod === m)),
    );
  ($("#hunt-custom") as HTMLElement).hidden = m !== "custom";
}

type Ctx = {
  show: (s: any) => void;
  changed: () => void;
  counted: () => void;
  close: () => void;
  caught: (h: Hunt) => void;
};
export function huntClick(t: HTMLElement, ctx: Ctx) {
  if (!R().trackShinyHunts) return;
  if (t.dataset.huntmethod) return pickMethod(t.dataset.huntmethod as Method);
  const a = t.dataset.hunt!,
    s = ui.sheet,
    h = activeHunt();
  const step = (next: string) => {
    s.step = next;
    fillHunt(s);
    (
      $(
        "#sheetbody input:checked, #sheetbody input, #sheetbody [data-hunt=plus]",
      ) as HTMLElement | null
    )?.focus();
  };
  if (a === "pick") return ctx.show({kind: "hunt", step: "pick", tab: t.dataset.tab || "place"});
  if (a === "next") {
    if (s.tab === "species") {
      const input = document.querySelector<HTMLInputElement>("[name=hunt-species]:checked");
      if (input) return ctx.show({kind: "hunt", step: "start", n: +input.value});
    } else {
      const input = document.querySelector<HTMLInputElement>("[name=hunt-wild-place]:checked");
      if (input) return ctx.show({kind: "hunt", step: "wildstart", place: input.value});
    }
    return;
  }
  if (a === "begin" && s.step === "wildstart") {
    const kind = document.querySelector<HTMLInputElement>("[name=hunt-kind]:checked")?.value, m = pressed(), odds = readOdds(m);
    if (!kind || !odds || h) return;
    R().hunt = {species: 0, kind, place: s.place, unit: "encounters", method: m, odds, count: 0, startedAt: Date.now()};
    ctx.changed();
    return step("view");
  }
  if (a === "record" && h?.kind) return ctx.caught({...h, species: +t.dataset.species!});
  if (a === "caught" && h?.kind) return step("caught");
  if (a === "start")
    return ctx.show({
      kind: "hunt",
      step: "start",
      n: +t.dataset.species!,
      k: t.dataset.k,
    });
  if (a === "begin" || a === "replace") {
    const o = huntOptions(s.n)[checkedPlace()],
      m = pressed(),
      odds = readOdds(m);
    if (!o || !odds) return;
    if (h && a === "begin") {
      $("#sheetbody .hgo").innerHTML =
        `<button type="button" class="app-quiet" data-hunt="keep">Cancel</button><button type="button" class="app-danger grow" data-hunt="replace">Replace ${h.kind ? esc(h.place) : byN[h.species].name} hunt</button>`;
      return ($("#sheetbody [data-hunt=keep]") as HTMLElement).focus();
    }
    R().hunt = {
      species: o.species,
      place: o.place,
      unit: o.unit,
      method: m,
      odds,
      count: 0,
      startedAt: Date.now(),
    };
    ctx.changed();
    return step("view");
  }
  if (a === "keep") {
    $("#sheetbody .hgo").innerHTML = startActions;
    return ($("#sheetbody [data-hunt=begin]") as HTMLElement).focus();
  }
  if (!h) return;
  if (a === "open")
    return s?.kind === "hunt"
      ? step("view")
      : ctx.show({ kind: "hunt", step: "view", k: t.dataset.k });
  if (a === "plus" || a === "minus") {
    h.count = a === "plus" ? h.count + 1 : Math.max(0, h.count - 1);
    return ctx.counted();
  }
  if (a === "caught") return ctx.caught(h);
  if (a === "count" || a === "method" || a === "place") return step(a);
  if (a === "end") {
    $("#sheetbody .hfoot").innerHTML =
      `<button type="button" class="app-quiet" data-hunt="open">Cancel</button><button type="button" class="app-danger grow" data-hunt="endnow">End hunt</button>`;
    return ($("#sheetbody .hfoot button") as HTMLElement).focus();
  }
  if (a === "endnow") {
    R().hunt = undefined;
    ctx.changed();
    return ctx.close();
  }
  if (a === "savecount") {
    const input = $("#hunt-count") as HTMLInputElement;
    if (!input.reportValidity() || !Number.isSafeInteger(+input.value)) return;
    h.count = +input.value;
  } else if (a === "savemethod") {
    const m = pressed(),
      odds = readOdds(m);
    if (!odds) return;
    Object.assign(h, { method: m, odds });
  } else if (a === "saveplace") h.place = placeOptions(h)[checkedPlace()].place;
  else return;
  ctx.changed();
  step("view");
}
