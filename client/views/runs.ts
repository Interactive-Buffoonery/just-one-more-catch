import { imageUrl } from "../image-url.ts";
import { $, esc } from "../dom";
import { devicesRow, HANDHELD } from "./devices";
import {
  badgeName,
  badgesWord,
  bridge,
  byN,
  dumpRun,
  LOOKS,
  PALETTE,
  R,
  run,
  startDay,
  ui,
  verOf,
  ymd,
  isGuest,
} from "../game";
import { guestRows, moving, waitingNote } from "../guest";
import { CONSOLES, Pack, Soon, VERSIONS } from "../packs";
import { RunRow } from "../types";
import { AVATARS, isAvatar } from "../../shared/avatars";
import { MAX_RUNS } from "../../shared/limits";
import { summarize, Summary } from "../../shared/summary";
import { VersionId } from "../../shared/versions";

/* ---- Runs, account and sign-in ---- */
const badgeCount = (version: string, s: Summary) => {
  const p = verOf(version).pack;
  return [...p.badges, ...(p.postgame?.[1] || [])].filter((b) =>
    s.badges.includes(b[0]),
  ).length;
};
export const cover = (
  v: (typeof VERSIONS)[VersionId],
  cls = "",
  alt = `${v.name} box art`,
) =>
  `<img class="cover ${cls}" src="${imageUrl(`/covers/${v.cover ?? v.short.toLowerCase()}.jpg`)}" alt="${alt}" width="46" height="46">`;
const startChoices = `<a class="app-quiet start-import" href="/import/" data-tab="import"><svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="20" fill="var(--surface)"/><path d="M4 24a20 20 0 0 1 40 0z" fill="var(--pink)"/><circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" stroke-width="4"/><path d="M4 24h13M31 24h13" stroke="currentColor" stroke-width="4"/><circle cx="24" cy="24" r="7" fill="var(--surface)" stroke="currentColor" stroke-width="4"/></svg>Import a save</a><button class="app-quiet" data-close="1">No thank you, just browsing!</button>`;
export const confirmPair = (ids: string[]) => `<div class="pickbody vpick"><h2 class="lg" id="sheet-title">Which version?</h2><div class="vchoice">${ids.map((id) => {
  const v = verOf(id);
  return `<button class="vc" data-confirmrun="${esc(id)}" data-game="${esc(id)}">${cover(v, "", "")}<b class="lg">${esc(v.name)}${v.platform ? `<span class="sr"> (${esc(v.platform)})</span>` : ""}</b></button>`;
}).join("")}</div><div class="hv-actions start-choices">${startChoices}</div></div>`;
export const confirmGame = (id: string, customize = false) => {
  const v = verOf(id);
  const title = `${esc(v.name)}${v.platform ? ` (${esc(v.platform)})` : ""}`;
  const actions = customize ? `<div class="hv-actions"><button class="app-primary" data-custom="1">Customize</button><button class="app-quiet" data-close="1">Not now</button></div><p class="small muted">You can update your playthrough at any time using Customize on the ${isGuest() ? "Dex tab" : "Journey or Dex tab"}.</p>` : `<div class="hv-actions start-choices"><button class="app-primary" data-confirmrun="${esc(id)}">Start a new playthrough</button>${startChoices}</div>`;
  return `<div class="pickbody" data-game="${esc(id)}"><span class="gb"><span class="bx">${cover(v, "", "")}</span></span><h2 class="lg" id="sheet-title">${customize ? "Customize your " : "Start "}${title}${customize ? " playthrough?" : "?"}</h2>${actions}</div>`;
};
export const dash: { slot?: string; shelf: string } = { shelf: "Unplayed" };
const soonCover = (g: Soon) =>
  `<img class="cover" src="${imageUrl(`/covers/${g.short.toLowerCase()}.jpg`)}" alt="" width="160" height="160">`;
const titleTile = (title: (VersionId | Soon)[], tag: string) => {
  const live = title.filter((g): g is VersionId => typeof g === "string");
  if (!live.length) {
    const soon = title as Soon[],
      names = soon.map((g) => g.name).join(" / ");
    return `<div class="pt soon" role="group" aria-label="${esc(names)}, Coming soon"><span class="duo">${soon.map(soonCover).join("")}</span><span class="pt-sub"><span class="con">${esc(tag)}</span>${esc(soon[0].region)}</span><b class="lg">${esc(names)}</b></div>`;
  }
  return `<button class="pt" ${live.length === 1 ? `data-newrun="${live[0]}" data-game="${live[0]}"` : `data-pair="${live.join(",")}"`} data-k="new-${live[0]}">${live.map((id) => `<i data-game="${id}"></i>`).join("")}<span class="duo">${live.map((id) => `<span data-game="${id}">${cover(VERSIONS[id], "", "")}</span>`).join("")}</span><span class="pt-sub"><span class="con">${esc(tag)}</span>${esc(VERSIONS[live[0]].pack.region)}</span><b class="nms lg">${live
    .map((id) => {
      const v = VERSIONS[id];
      return `<span>${esc(v.name)}${v.platform ? `<span class="sr"> (${esc(v.platform)})</span>` : ""}</span>`;
    })
    .join("<em>/</em>")}</b></button>`;
};
const shelves = () => {
  const has = new Set((bridge.runs || []).map((r) => r.version as string)),
    all = CONSOLES.flatMap((c) => c.titles.map((t) => ({ t, tag: c.tag }))),
    live = (x: (typeof all)[number]) => typeof x.t[0] === "string",
    played = (x: (typeof all)[number]) => x.t.some((g) => has.has(g as string));
  return {
    Unplayed: all.filter((x) => live(x) && !played(x)),
    Played: all.filter((x) => live(x) && played(x)),
    Soon: all.filter((x) => !live(x)),
  };
};
const picker = () => {
  const s = shelves(),
    names = (Object.keys(s) as (keyof typeof s)[]).filter((k) => s[k].length),
    on = names.find((k) => k === dash.shelf) ?? names[0];
  return `<div class="shelves" role="group" aria-label="Games">${names.map((k) => `<button data-shelf="${k}" data-k="shelf-${k}" aria-pressed="${k === on}">${k}<b>${s[k].length}</b></button>`).join("")}</div><div class="ptgrid">${s[on].map((x) => titleTile(x.t, x.tag)).join("")}</div>`;
};
const longDay = (day: string) => {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    dateStyle: "long",
  });
};
export function fillStartDate(id: string) {
  const row = bridge.runs?.find((x) => x.id === id);
  if (!row) return;
  void import("cally");
  const today = ymd(new Date()),
    start = startDay(row) > today ? today : startDay(row);
  $("#sheetbody").innerHTML = `<h2 id="sheet-title">Start date</h2>
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
  `<details class="ptmenu"><summary data-k="run-options-${row.id}" aria-label="More options for ${v.name}">···</summary><div class="menu">${!isGuest() ? `<button data-journal="${row.id}" data-k="journal-${row.id}">Journal</button>` : ""}<button data-startsheet="${row.id}">Change start date</button><button data-delrun="${row.id}">Delete playthrough</button></div></details>`;
const meter = (n: number, of: number) =>
  `<span class="meter" aria-hidden="true"><i style="width:${(n / of) * 100}%"></i></span>`;
const badgeGroups = (p: Pack): [string, string[][]][] => [
  [p.region, p.badges],
  ...(p.postgame
    ? [
        [p.postgame[0].replace(/ badges$/, ""), p.postgame[1]] as [
          string,
          string[][],
        ],
      ]
    : []),
];
const badgeImg = (b: string, size: number, alt = "") =>
  `<img src="${imageUrl(`/badges/${b.toLowerCase()}.png`)}" alt="${alt}" width="${size}" height="${size}">`;
const avatarN = (): number =>
  ui.avatar ?? (isAvatar(bridge.avatar) ? bridge.avatar : 25);
const avatarName = () => AVATARS.find(([n]) => n === avatarN())?.[1] ?? "";
const fit = () => {
  const [l, t, r, b] = AVATARS.find(([n]) => n === avatarN())?.[2] ?? [16, 15, 64, 65];
  return `--cx:${(l + r) / 2};--cy:${(t + b) / 2};--s:${Math.max(r - l, b - t)}`;
};
export const partner = (cls: string) =>
  `<img class="${cls}" src="${imageUrl(`/sprites/hgss/${avatarN()}.png`)}" alt="" width="80" height="80" style="${fit()}">`;
export const trainerName = () => bridge.auth.displayName || "Trainer";
const plat = (v: (typeof VERSIONS)[VersionId]) =>
  v.platform ? ` <span class="tag plain">${v.platform}</span>` : "";
const when = (at: string) => {
  const t = lastPlayed(at).replace(/^on /, "");
  return t[0].toUpperCase() + t.slice(1);
};
function resumeCard(row: RunRow, r: Summary, at: string) {
  const v = verOf(row.version),
    p = v.pack,
    has = new Set(r.badges),
    groups = badgeGroups(p),
    next = groups.flatMap(([, list]) => list).find((b) => !has.has(b[0]));
  return `<article class="pane save" data-game="${row.version}" aria-labelledby="pane-title">
    <div class="hd">${cover(v, "box", "")}<div class="tt"><h2 class="lg" id="pane-title">${v.name}${plat(v)}</h2><p class="sub"><span class="reg">${p.region}</span>${champion(r) ? `<span class="champ">Champion</span>` : ""}<span class="dates"><span>Started <b>${longDay(startDay(row))}</b></span><span>Last played <b>${lastPlayed(at).replace(/^on /, "")}</b></span></span></p></div><div class="act"><button class="go lg" data-switch="${row.id}" data-k="continue" aria-label="Continue ${v.name}">Continue</button>${ptMenu(row, v)}</div></div>
    ${r.party.length ? `<div class="pty">${r.party.map((m) => `<img src="${imageUrl(`/sprites/${p.art}/${m.shiny ? "shiny/" : ""}${m.n}.png`)}" alt="${esc(m.nick || byN[m.n]?.name || "")}" width="96" height="96">`).join("")}</div>` : ""}
    <div class="bl"><div><p class="num"><span><b>${badgeCount(row.version, r)}</b> / ${groups.flatMap(([, l]) => l).length} ${badgesWord(p)}</span></p>${groups
      .map(
        ([label, list]) =>
          `<div class="case" role="group" aria-label="${label}">${list
            .map((b) =>
              has.has(b[0])
                ? badgeImg(b[0], 38, badgeName(b[0], p))
                : `<i class="${b === next ? "next" : ""}" role="img" aria-label="${badgeName(b[0], p)}, not yet"></i>`,
            )
            .join("")}</div>`,
      )
      .join("")}</div>
    <div><p class="num"><span><b>${r.caught}</b> / ${p.national} caught</span><span>${Math.round((r.caught / p.national) * 100)}%</span></p>${meter(r.caught, p.national)}</div></div></article>`;
}
const slotButton = (row: RunRow, r: Summary, at: string, on: boolean) => {
  const v = verOf(row.version);
  return `<button class="pslot" data-slot="${row.id}" data-k="slot-${row.id}" data-game="${row.version}" aria-pressed="${on}"><span class="cv">${cover(v, "", "")}</span><span class="nm"><b class="lg">${v.name}${plat(v)}</b><span class="sub">${v.pack.region} · ${when(at)}</span>${meter(r.caught, v.pack.national)}</span></button>`;
};
const stats = (rows: { r: Summary }[]) => {
  const champs = rows.filter((x) => champion(x.r)).length;
  return `<p class="stats"><span class="stat"><b>${rows.length}</b> playthrough${rows.length === 1 ? "" : "s"}</span>${champs ? `<span class="stat"><b>${champs}</b> Champion</span>` : ""}<span class="stat"><b>${rows.reduce((n, x) => n + x.r.caught, 0)}</b> caught</span></p>`;
};
const signInNote = () =>
  bridge.auth.isAuthenticated
    ? guestRows().length && !moving
      ? `<p class="notice" role="status">${waitingNote(guestRows().length)}</p>`
      : ""
    : "";
const recentRuns = () =>
  [...(bridge.runs || [])]
    .map((row) => ({
      row,
      r: row.id === run?.id ? summarize(dumpRun(R())) : row.summary,
      at: row.updatedAt || row.createdAt,
    }))
    .sort((x, y) => y.at.localeCompare(x.at));
const CHEV = `<span class="gchev" aria-hidden="true"><svg viewBox="0 0 12 8"><path d="M1 1.5l5 5 5-5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`;
export function switcher(id?: string | null) {
  const cur = bridge.runs?.find((r) => r.id === id);
  if (!cur) return "";
  const now = verOf(cur.version);
  return `<details class="gsw"><summary data-k="gsw" aria-label="${now.name}${now.platform ? ` (${now.platform})` : ""}. Switch playthrough">${cover(now, "", "")}<span class="gname">${now.name}${now.platform ? ` <span class="tag plain">${now.platform}</span>` : ""}</span>${CHEV}</summary><div class="menu">${recentRuns()
    .map(({ row, r }) => {
      const v = verOf(row.version),
        b = badgeCount(row.version, r),
        on = row.id === id;
      return `<button data-switch="${row.id}" data-stay="1" data-k="gsw"${on ? ` aria-current="true"` : ""}>${cover(v, "", "")}<span class="grow">${v.name}${v.platform ? ` <span class="tag plain">${v.platform}</span>` : ""}<small>${r.caught} caught · ${b} ${badgesWord(v.pack, b)}</small></span>${on ? `<span class="gtick" aria-hidden="true">✓</span>` : ""}</button>`;
    })
    .join(
      "",
    )}<button class="all" data-tab="playthroughs">All playthroughs</button></div></details>`;
}
export function Runs() {
  const rows = recentRuns(),
    ids = rows.map((x) => x.row.id),
    slot =
      dash.slot === "new" || ids.includes(dash.slot!)
        ? dash.slot
        : ids.includes(run?.id!) ? run!.id : ids[0],
    top = rows.find((x) => x.row.id === slot),
    head = `<h1 class="lg">Dashboard</h1><a class="chip" href="/import/" data-tab="import" data-k="import-save">Import a save</a>`;
  if (!rows.length)
    return `<div class="dash fresh">${head}<section class="pane pick" aria-labelledby="new-game-heading"><h2 class="sr" id="new-game-heading">Pick a game</h2>${picker()}</section>${signInNote()}</div>`;
  return `<div class="dash">${head}${stats(rows)}<div class="slots"><div class="rail">${rows.map((x) => slotButton(x.row, x.r, x.at, x === top)).join("")}<button class="pslot new lg" data-slot="new" data-k="slot-new" aria-pressed="${!top}" aria-label="New playthrough">+ New</button></div>${
    top
      ? resumeCard(top.row, top.r, top.at)
      : `<section class="pane pick" aria-labelledby="new-game-heading"><h2 class="sr" id="new-game-heading">Pick a game</h2>${rows.length < MAX_RUNS ? picker() : `<p class="muted">You have ${MAX_RUNS} playthroughs. Delete one to start another.</p>`}</section>`
  }</div>${signInNote()}</div>`;
}
function emailLine(email = "") {
  const [local, domain = ""] = email.split("@");
  const long = Math.max(local.length, domain.length + 1) > 20;
  const text = esc(email || "Signed in").replace(/[.@]/g, (m) => (m === "@" ? "<wbr>@" : ".<wbr>"));
  return `<p${long ? " data-long" : ""}>${text}</p>`;
}
function Account() {
  const a = bridge.auth;
  return `<section class="s-id"><div class="tslab id"><h2 class="lg">${esc(trainerName())}</h2>${
    a.isAuthenticated
      ? emailLine(a.email)
      : `<p>Saved only in this browser</p>`
  }${partner("partner")}</div></section>`;
}
const AccountActions = () =>
  `<section class="s-acct"><h3>Account</h3>${
    bridge.auth.isAuthenticated
      ? `<div class="chips"><button class="chip" data-signout="1">Sign out</button></div><details${$("#view .s-acct details")?.open ? " open" : ""}><summary>More options</summary><button class="danger" data-delaccount="1">Delete account</button></details>`
      : `<div class="chips"><button class="chip" data-signinsheet="1">Sign in or create an account</button></div>`
  }</section>`;
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
export function fillSignIn() {
  $("#sheetbody").innerHTML =
    `<div class="grab" aria-hidden="true"></div><h2 id="sheet-title" class="lg">Sign in</h2><div id="clerk-signin"></div><button class="app-quiet notnow" data-close="1">Not now</button>`;
  $("#clerk-signin").insertAdjacentHTML(
    matchMedia(HANDHELD).matches ? "beforebegin" : "afterend",
    `<button class="app-primary other" data-pairstart="1" data-k="pairstart" autofocus>Use another device</button>`,
  );
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
      `<label title="${name}"><input type="radio" name="avatar" value="${n}" data-k="avatar-${n}" aria-label="${name}" ${n === avatarN() ? "checked" : ""}${bridge.auth.isLoading ? " disabled" : ""}><img src="${imageUrl(`/sprites/hgss/${n}.png`)}" alt="" width="80" height="80"></label>`,
  ).join("")}</div></section>`;
export const Settings = () =>
  `<h1 class="lg pgtitle" tabindex="-1" data-k="pgtitle">Settings</h1>
  <div class="sgrid"><div>${Account()}${devicesRow()}${Appearance()}</div>
  <div>${AvatarPicker()}<section class="s-data"><h3>Your data</h3><div class="chips">${exportChips()}</div>${exportError()}</section>${AccountActions()}</div></div>`;

export const exportLabel = () =>
  `Downloading ${ui.export.done} of ${ui.export.total}…`;
export const NoRun = () =>
  `<div class="dash"><section class="pane pick" aria-labelledby="new-game-heading"><h2 class="lg" id="new-game-heading">Pick a game</h2>${picker()}</section></div>`;
