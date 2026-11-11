import { $, esc } from "../dom";
import { byN, hasGenders, HELD_ITEMS, P, PARTY_SIZE, R, run, ui } from "../game";
import { mon } from "../parts";
import { Mon } from "../types";
import { NoRun } from "./runs";

/* ---- Boxes ---- */
const inBox = (b: Mon["box"]) => R().mons.filter((m) => m.box === b);
export const boxLabel = (b: Mon["box"]) =>
  b === "party" ? "Party" : R().boxNames[b - 1];
const boxCap = (b: Mon["box"]) => (b === "party" ? PARTY_SIZE : P().boxes[1]);
const allBoxes = (): Mon["box"][] => [
  "party",
  ...Array.from({ length: P().boxes[0] }, (_, i) => i + 1),
];
const GENDER: Record<string, string> = { m: "♂", f: "♀" };
export function monLine(m: Mon, showBox?: boolean) {
  const p = byN[m.n];
  return `<button class="row monrow" data-editmon="${m.id}" data-k="m${m.id}" aria-label="${esc(m.nick || p.name)}${m.nick ? `, ${p.name}` : ""}${m.shiny ? ", shiny" : ""}, ${esc(boxLabel(m.box))}. Edit">${mon(p, m.shiny, m.form || p.forms?.[0]?.id)}<span class="grow">
    <span class="name">${m.nick ? `${esc(m.nick)} <span class="muted small">${p.name}</span>` : p.name}${m.shiny ? ` <span class="shiny" title="Shiny">✦</span>` : ""}</span>
    <span class="tags">${showBox ? `<span class="tag">${esc(boxLabel(m.box))}</span>` : ""}${R().trackForms && p.forms && p.forms.length > 1 ? `<span class="tag plain">${esc((p.forms.find((f) => f.id === m.form) || p.forms[0]).name)}</span>` : ""}${m.lvl ? `<span class="tag plain">Lv ${m.lvl}</span>` : ""}${m.g ? `<span class="tag plain">${GENDER[m.g]}</span>` : ""}${m.item ? `<span class="tag time">${esc(m.item)}</span>` : ""}${m.note ? `<span class="small muted">${esc(m.note)}</span>` : ""}</span></span></button>`;
}
export function Boxes() {
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
export function fillMonSheet(s: any) {
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
    `<div style="display:flex;gap:12px;align-items:center">${mon(p, !!m?.shiny, m?.form || p.forms?.[0]?.id)}<div><h2 id="sheet-title">${title}</h2></div></div>
    <label class="field"><span>Box</span><select id="f-box">${allBoxes()
      .map(
        (b) =>
          `<option value="${b}" ${b === cur ? "selected" : ""} ${full(b) && b !== cur ? "disabled" : ""}>${esc(boxLabel(b))} (${inBox(b).length}/${boxCap(b)})</option>`,
      )
      .join("")}</select></label>
    ${R().trackForms && p.forms && p.forms.length > 1 ? `<label class="field"><span>Form</span><select id="f-form">${p.forms.map((f) => `<option value="${f.id}" ${f.id === (m?.form || p.forms![0].id) ? "selected" : ""}>${esc(f.name)}</option>`).join("")}</select></label>` : ""}
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
export function updateMonSprite() {
  const s = ui.sheet,
    m = s.id ? R().mons.find((m) => m.id === s.id) : null,
    p = byN[m ? m.n : s.n];
  $("#sheetbody .mon").outerHTML = mon(p, $("#f-shiny").checked, $("#f-form")?.value || p.forms?.[0]?.id);
}

export function fillBoxSheet(b: number) {
  $("#sheetbody").innerHTML =
    `<h2 id="sheet-title">Rename ${esc(boxLabel(b))}</h2>
    <label class="field"><span>Name</span><input id="f-boxname" maxlength="8" autocomplete="off" value="${esc(boxLabel(b))}"></label>
    <div class="hv-actions" style="margin-top:20px"><button class="app-primary grow" data-savebox="1">Save</button><button class="app-quiet" data-close="1">Cancel</button></div>`;
}
export function saveMon() {
  const s = ui.sheet,
    v = (id: string) => $("#" + id),
    raw = v("f-box").value,
    box = raw === "party" ? "party" : +raw,
    existing = s.id ? R().mons.find((m) => m.id === s.id) : null;
  const lvl = v("f-lvl").value
    ? Math.min(100, Math.max(1, Math.round(+v("f-lvl").value)))
    : "";
  const data = {
    box,
    form: v("f-form")?.value || existing?.form || byN[existing ? existing.n : s.n].forms?.[0]?.id,
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
  if (data.form) r.forms.add(data.form);
  const n = existing ? existing.n : s.n;
  if (hasGenders(byN[n]) && (data.g === "m" || data.g === "f")) {
    (r.genders[n] ||= new Set()).add(data.g);
  }
  r.lastBox = box;
  $("#live").textContent = `Saved to ${boxLabel(box)}`;
}
