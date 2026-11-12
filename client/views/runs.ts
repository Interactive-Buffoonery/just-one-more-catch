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
} from "../game";
import { guestRows, moving, waitingNote } from "../guest";
import { CONSOLES, Pack, VERSIONS } from "../packs";
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
export const confirmGame = (id: string, customize = false) => {
  const v = verOf(id);
  if (customize) return `<div class="pickbody" data-game="${esc(id)}"><span class="gb"><span class="bx">${cover(v, "", "")}</span></span><h2 class="lg" id="sheet-title">Customize your ${esc(v.name)}${v.platform ? ` (${esc(v.platform)})` : ""} playthrough?</h2><div class="hv-actions"><button class="app-primary" data-custom="1">Customize</button><button class="app-quiet" data-close="1">Not now</button></div><p class="small muted">You can update your playthrough at any time using Customize on the Journey or Dex tab.</p></div>`;
  return `<div class="pickbody" data-game="${esc(id)}"><span class="gb"><span class="bx">${cover(v, "", "")}</span></span><h2 class="lg" id="sheet-title">Start ${esc(v.name)}${v.platform ? ` (${esc(v.platform)})` : ""}?</h2><div class="hv-actions start-choices"><button class="app-primary" data-confirmrun="${esc(id)}">Start a new playthrough</button><a class="app-quiet start-import" href="/import/" data-tab="import"><svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="20" fill="var(--surface)"/><path d="M4 24a20 20 0 0 1 40 0z" fill="var(--pink)"/><circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" stroke-width="4"/><path d="M4 24h13M31 24h13" stroke="currentColor" stroke-width="4"/><circle cx="24" cy="24" r="7" fill="var(--surface)" stroke="currentColor" stroke-width="4"/></svg>Import a save</a><button class="app-quiet" data-close="1">No thank you, just browsing!</button></div></div>`;
};
const gameChoices = (heading = "new-game-heading", regions = false) =>
  CONSOLES.map((console, index) =>
    `<h3 class="console" id="${heading}-${index}">${esc(console.name)}</h3><div class="slide s2"><div class="reel" role="group" aria-labelledby="${heading}-${index}">${console.games.map((game) => {
      if (typeof game !== "string") return `<div class="gb soon" role="group" style="--c:${game.color}" aria-label="${esc(game.name)}, Coming soon"><span class="bx"><img class="cover" src="${imageUrl(`/covers/${game.short.toLowerCase()}.jpg`)}" alt="" width="160" height="160"></span><b>${esc(game.name)}</b><span class="small muted">Coming soon</span></div>`;
      const v = VERSIONS[game];
      return `<button class="gb" data-newrun="${game}" data-game="${game}"><span class="bx">${cover(v, "", "")}</span><b>${esc(v.name)}${v.platform ? `<span class="sr"> (${esc(v.platform)})</span>` : ""}</b>${regions ? `<span class="small muted">${esc(v.pack.region)}</span>` : "<em>Start</em>"}</button>`;
    }).join("")}</div></div>`
  ).join("");

const pickGame = () =>
  `<section class="empty"><h2 id="new-game-heading">Pick a game</h2>${gameChoices()}</section>`;
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
  `<details class="ptmenu"><summary aria-label="More options for ${v.name}">···</summary><div class="menu"><button data-startsheet="${row.id}">Change start date</button><button data-delrun="${row.id}">Delete playthrough</button></div></details>`;
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
const champTag = (r: Summary) =>
  champion(r) ? ` · <span class="champ-tag">Champion</span>` : "";
const avatarN = (): number =>
  ui.avatar ?? (isAvatar(bridge.avatar) ? bridge.avatar : 25);
const avatarName = () => AVATARS.find(([n]) => n === avatarN())?.[1] ?? "";
export const partner = (cls: string) =>
  `<img class="${cls}" src="${imageUrl(`/sprites/hgss/${avatarN()}.png`)}" alt="" width="80" height="80">`;
export const trainerName = () => bridge.auth.displayName || "Trainer";
function resumeCard(row: RunRow, r: Summary, at: string) {
  const v = verOf(row.version),
    p = v.pack,
    has = new Set(r.badges),
    groups = badgeGroups(p),
    next = groups.flatMap(([, list]) => list).find((b) => !has.has(b[0]));
  return `<article class="save" data-game="${row.version}">
    <div class="slab">${cover(v, "box")}<p class="last">Last played ${lastPlayed(at)}</p><button class="go lg" data-switch="${row.id}" aria-label="Continue ${v.name}">Continue</button></div>
    <div class="file">
      <div class="file-head"><div><h2 class="lg">${v.name}${v.platform ? ` <span class="tag plain">${v.platform}</span>` : ""}</h2><p class="soft">${p.region} · Started ${longDay(startDay(row))}${champTag(r)}</p></div>${ptMenu(row, v)}</div>
      <div><p class="lead"><b>${badgeCount(row.version, r)}</b> of ${groups.flatMap(([, l]) => l).length} ${badgesWord(p)}</p>
        <div class="case">${groups
          .map(
            ([label, list]) =>
              `<div class="caserow">${list
                .map((b) =>
                  has.has(b[0])
                    ? `<span class="slot">${badgeImg(b[0], 34, badgeName(b[0], p))}</span>`
                    : `<span class="slot${b === next ? " next" : ""}"><i role="img" aria-label="${badgeName(b[0], p)}, not yet"></i></span>`,
                )
                .join("")}<em>${label}</em></div>`,
          )
          .join("")}</div></div>
      <div><p class="lead"><b>${r.caught}</b> of ${p.national} caught</p>${meter(r.caught, p.national)}</div>
      ${r.party.length ? `<div class="party">${r.party.map((m) => `<img src="${imageUrl(`/sprites/${p.art}/${m.shiny ? "shiny/" : ""}${m.n}.png`)}" alt="${esc(m.nick || byN[m.n]?.name || "")}" width="52" height="52">`).join("")}</div>` : ""}
    </div></article>`;
}
function miniCard(row: RunRow, r: Summary, at: string) {
  const v = verOf(row.version),
    p = v.pack,
    has = new Set(r.badges);
  return `<div class="run" data-game="${row.version}"><button class="run-go" data-switch="${row.id}"><span class="blk">${cover(v)}</span><span class="run-body"><span class="who"><b class="lg">${v.name}${v.platform ? ` <span class="tag plain">${v.platform}</span>` : ""}</b><span class="meta">${p.region} · ${lastPlayed(at).replace(/^on /, "")}${champTag(r)}</span></span><span class="mini" aria-hidden="true">${badgeGroups(
    p,
  )
    .map(
      ([, list]) =>
        `<span>${list.map((b) => `<span>${has.has(b[0]) ? badgeImg(b[0], 20) : "<i></i>"}</span>`).join("")}</span>`,
    )
    .join(
      "",
    )}</span><span class="sr">${badgeCount(row.version, r)} ${badgesWord(p)},</span><span class="got"><b>${r.caught}</b> of ${p.national}<span class="sr"> caught</span>${meter(r.caught, p.national)}</span></span></button>${ptMenu(row, v)}</div>`;
}
const trainerCard = (rows: { row: RunRow; r: Summary }[]) =>
  `<aside class="trainer"><div class="tslab"><h2 class="lg">${esc(trainerName())}</h2>${partner("partner")}</div>
  <ul class="record">
    <li><b>${rows.length}</b> playthrough${rows.length === 1 ? "" : "s"}</li>
    <li class="champ"><b>${rows.filter((x) => champion(x.r)).length}</b> finished as Champion</li>
    ${["badges", "trials"].map((label) => {
      const count = rows.reduce((n, x) => n + (badgesWord(verOf(x.row.version).pack) === label ? badgeCount(x.row.version, x.r) : 0), 0);
      return count ? `<li><b>${count}</b> ${badgesWord({ badgesWord: label } as Pack, count)}</li>` : "";
    }).join("")}
    <li><b>${rows.reduce((n, x) => n + x.r.caught, 0)}</b> Pokémon caught</li>
  </ul></aside>`;
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
    open = rows.findIndex((x) => x.row.id === run?.id),
    [top, ...rest] = open > 0 ? [rows[open], ...rows.filter((_, i) => i !== open)] : rows;
  if (!top)
    return `<div class="dash"><div class="dash-heading"><h1 class="lg">Dashboard</h1><a class="chip" href="/import/" data-tab="import" data-k="import-save">Import a save</a></div>
  <section class="trainer hello"><div class="tslab"><h2 class="lg">Welcome, Trainer</h2>${partner("partner")}</div></section>
  <section class="card welcome"><h2 id="new-game-heading">Pick your game</h2>${gameChoices("new-game-heading", true)}</section>${signInNote()}</div>`;
  return `<div class="dash"><div class="dash-heading"><h1 class="lg">Dashboard</h1><a class="chip" href="/import/" data-tab="import" data-k="import-save">Import a save</a></div>
  <div class="dash-grid">${resumeCard(top.row, top.r, top.at)}${trainerCard(rows)}
  ${rest.length ? `<section class="sec wide"><h2 class="lg">Other playthroughs</h2><div class="runs">${rest.map((x) => miniCard(x.row, x.r, x.at)).join("")}</div></section>` : ""}
  <section class="sec wide"><h2 class="lg" id="new-game-heading">Start another playthrough</h2>${rows.length < MAX_RUNS ? gameChoices() : `<p class="muted">You have ${MAX_RUNS} playthroughs. Delete one to start another.</p>`}</section></div>
  ${signInNote()}</div>`;
}
function Account() {
  const a = bridge.auth;
  return `<section class="s-id"><div class="tslab id"><h2 class="lg">${esc(trainerName())}</h2>${
    a.isAuthenticated
      ? `<p>${esc(a.email || "Signed in")}</p>`
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
  `<h1 class="lg pgtitle">Settings</h1>
  <div class="sgrid"><div>${Account()}${devicesRow()}${Appearance()}</div>
  <div>${AvatarPicker()}<section class="s-data"><h3>Your data</h3><div class="chips">${exportChips()}</div>${exportError()}</section>${AccountActions()}</div></div>`;

export const exportLabel = () =>
  `Downloading ${ui.export.done} of ${ui.export.total}…`;
export const NoRun = () => `<div class="narrow">${pickGame()}</div>`;
