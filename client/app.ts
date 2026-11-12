// Ported from the approved mockup: string-rendered views on one root, event delegation, no framework.
// main.ts owns auth and server calls and hands them in through the bridge.
import "./styles.css";
import "./save-import.css";
import { SaveImport } from "./save-import";
import { $, announce, esc, root, setRoot } from "./dom";
import { caughtCsv, fetchStates, jsonParts, saveFile } from "./export";
import {
  bridge,
  byN,
  hasGenders,
  visibleForms,
  closeRun,
  dumpRun,
  eventDone,
  EVENTS,
  forced,
  loaded,
  nowTime,
  openRun,
  PALETTE,
  R,
  run,
  setBridge,
  store,
  ui,
  ver,
  verOf,
  ymd,
  isGuest,
} from "./game";
import { moveGuestAvatar, moveGuestRuns, withGuest } from "./guest";
import { SETTINGS_ICON, TAB_ICONS } from "./parts";
import { Bridge, PairingHandle, PairingLookup, RunRow } from "./types";
import { Devices, fillApprove, pairBody, pairErrorText, pairLetters, showCode, ttl } from "./views/devices";
import { Boxes, fillBoxSheet, fillMonSheet, saveMon, updateMonSprite } from "./views/boxes";
import { Dex, dexGrid, fillSpecies } from "./views/dex";
import { fillClock, fillCustom, Journey, untick } from "./views/journey";
import {
  confirmGame,
  exportLabel,
  fillSignIn,
  fillStartDate,
  partner,
  Runs,
  Settings,
  switcher,
  trainerName,
} from "./views/runs";
import { gameNow } from "../shared/clock";
import { MAX_RUN_BYTES, runBytes } from "../shared/limits";

let creating = false;
let pickOpenedAt = 0;
let opening: string | null = null;
let openSeq = 0;
let saveImport: SaveImport;
let importPage: HTMLElement;
let pendingImport = false;
const IMPORT_PATH = /^\/import\/?$/;
function useRun(row: RunRow, start = false, customize = false) {
  const v = verOf(row.version);
  closeRun();
  ui.q = "";
  opening = row.id;
  const me = ++openSeq;
  Promise.all([
    loaded.get(v.pack) || v.pack.load(),
    bridge.getState(row.id),
  ]).then(
    ([d, state]) => {
      loaded.set(v.pack, d);
      if (me !== openSeq) return;
      opening = null;
      const latest = bridge.runs?.find((r) => r.id === row.id);
      if (latest) openRun(latest, d, state);
      if (start && run) ui.tab = !isGuest() && run.view === "journey" ? "journey" : "dex";
      render();
      if (customize && run) {
        $("#sheetbody").innerHTML = confirmGame(run.version, true);
      }
    },
    () => {
      if (me !== openSeq) return;
      opening = null;
      ui.loadError = !!bridge.runs?.some((r) => r.id === row.id);
      render();
    },
  );
}

function fillSheet(s: any) {
  if (s.kind === "pick") {
    $("#sheetbody").innerHTML = confirmGame(s.id);
    return;
  }
  typeof s === "number"
    ? fillSpecies(s)
    : s.kind === "signin"
      ? fillSignIn()
      : s.kind === "started"
        ? fillStartDate(s.id)
        : s.kind === "custom"
          ? fillCustom()
          : s.kind === "clock"
            ? fillClock(s.mode)
            : s.kind === "approve"
              ? fillApprove(s.p)
              : s.kind === "pair"
                ? void showPair()
                : s.kind === "box"
                  ? fillBoxSheet(s.b)
                  : fillMonSheet(s);
}
// A closed dialog fires "close" a task later; finish that sheet before showing the next one.
function showSheet(s: any, fill?: () => void) {
  const open = $("#sheet").open;
  if (!open) finishSheet();
  if (s.hist) pushSheet(s.kind);
  ui.sheet = s;
  fill?.();
  if (!open) $("#sheet").showModal();
}
const openSheet = (s: any) => {
  if (isGuest() && ["mon", "box"].includes(s.kind)) return;
  showSheet(s, () => fillSheet(s));
};
function pushSheet(kind: string) {
  if (history.state?.sheet !== kind)
    history.pushState({ ...history.state, sheet: kind }, "", location.href);
}
function finishSheet() {
  const s = ui.sheet;
  if (!s) return;
  ui.sheet = null;
  if (s.kind === "signin")
    bridge.unmountSignIn($("#clerk-signin") as HTMLDivElement);
  if (s.kind === "pair") stopPair();
  if (s.hist && history.state?.sheet === s.kind) history.back();
  render();
  if (s.kind === "pick") {
    (root.querySelector(`[data-newrun="${s.id}"]`) as HTMLElement | null)?.focus();
    return;
  }
  (
    root.querySelector(
      `[data-k="${typeof s === "number" ? "d" + s : s.k ? s.k : s.id ? "m" + s.id : s.b ? "rb" + s.b : "x"}"]`,
    ) || (root.querySelector("[data-filter][aria-pressed=true]") as any)
  )?.focus();
}

/* ---- Wiring ---- */
const TABS = [
  ["playthroughs", "Dashboard"],
  ["journey", "Journey"],
  ["dex", "Dex"],
  ["boxes", "Boxes"],
];
const LOCKED: Record<string, [() => string, string]> = {
  journey: [Journey, "Sign in or create a free account to track your current area, badges and items on the Journey tab."],
  boxes: [Boxes, "Sign in or create a free account to track your party, boxes and held items on the Boxes tab."],
};
function lockedView(tab: string) {
  const [view, why] = LOCKED[tab], label = TABS.find(([t]) => t === tab)![1], id = tab === "journey" ? "jl-h" : "bl-h";
  return isGuest() ? `<div class="pv">${run ? `<div class="ghost" inert aria-hidden="true">${view()}</div>` : ""}<div class="over"><section class="card" aria-labelledby="${id}"><h2 class="lg" id="${id}">${label}</h2><p class="jl-why">${why}</p><button class="app-primary" data-signinsheet="1" data-k="signin-${tab}">Sign in</button></section></div></div>` : view();
}
const tabButtons = (icons: boolean) =>
  TABS.filter(([t]) => t !== "journey" || isGuest() || run?.view !== "dexonly").map(
    ([t, l]) =>
      `<button data-tab="${t}" ${isGuest() && LOCKED[t] ? `aria-label="${l}, sign in required"` : ""} ${ui.tab === t ? `aria-current="page"` : ""}>${icons ? isGuest() && LOCKED[t] ? `<span class="tlock">${TAB_ICONS[t]}<i><svg viewBox="0 0 12 12" aria-hidden="true"><rect x="2" y="5.5" width="8" height="5.5" rx="1.2" fill="currentColor"/><path d="M4 5.5V4a2 2 0 014 0v1.5" fill="none" stroke="currentColor" stroke-width="1.4"/></svg></i></span>` : TAB_ICONS[t] : ""}<span>${l}</span></button>`,
  ).join("");
const VIEWS: Record<string, () => string> = {
  journey: () => lockedView("journey"),
  dex: Dex,
  boxes: () => lockedView("boxes"),
  playthroughs: Runs,
  settings: Settings,
  devices: Devices,
};
const PATHS: Record<string, string> = {
  journey: "/journey/",
  dex: "/pokedex/",
  boxes: "/boxes/",
  settings: "/settings/",
  devices: "/settings/devices/",
};
const SETTINGS = ["settings", "devices"];
const APP_PATHS = ["/", ...Object.values(PATHS)];
function shell() {
  return `<header class="top">
    <button class="logo" data-tab="playthroughs" aria-label="Just One More Catch, your playthroughs"><span class="full">Just One More Catch</span></button>
    <nav class="toptabs" id="toptabs" aria-label="Sections"></nav>
    <span class="spacer"></span><span id="topright"></span>
  </header>
  <main id="view"></main>
  <footer class="ftr"><div id="footalert"></div>
  <div class="balls" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><path d="M2 12h7M15 12h7"/></svg><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><path d="M2 12h7M15 12h7"/></svg><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><path d="M2 12h7M15 12h7"/></svg></div>
  <div class="footer-brand"><a href="/about/" aria-label="About Just One More Catch">Just One More Catch</a></div>
  <p class="foot">Unofficial fan project, not affiliated with Nintendo, Creatures, GAME FREAK or The Pokémon Company. Free and non-commercial. Box art, sprites and badges © Nintendo, Creatures and GAME FREAK. Encounter data and sprites sourced from <a href="https://pokeapi.co" target="_blank" rel="noopener">PokeAPI</a>. Thank you!</p>
  <nav class="footnav" aria-label="About this site"><a href="/about/">About</a><a href="/resources/">Resources</a><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a><a href="/contact/">Contact</a></nav></footer>
  <div class="dock"><div id="toast"></div><div id="tabs"></div></div>
  <dialog class="sheet" id="sheet" aria-labelledby="sheet-title"><div class="sheetbody" id="sheetbody"></div></dialog>
  <div class="sr" aria-live="polite" id="live"></div>`;
}
function tabFromUrl() {
  if (IMPORT_PATH.test(location.pathname)) return "import";
  const path = Object.keys(PATHS).find((t) => PATHS[t] === location.pathname);
  const t = path || new URLSearchParams(location.search).get("tab");
  return t === "journey" && !isGuest() && run?.view === "dexonly" ? "dex" : t && Object.hasOwn(VIEWS, t) ? t : "playthroughs";
}
function render() {
  if (ui.tab === "journey" && !isGuest() && run?.view === "dexonly") ui.tab = "dex";
  const a = bridge.auth,
    signedIn = a.isAuthenticated;
  const k = (document.activeElement as HTMLElement)?.dataset?.k;
  const onImport = ui.tab === "import";
  const needsGame = !(isGuest() && LOCKED[ui.tab]) && !["playthroughs", "import", ...SETTINGS].includes(ui.tab);
  const loading = a.isLoading || !bridge.runs || (needsGame && !!opening);
  root.classList.toggle("loading", loading);
  const url = new URL(location.href);
  if (onImport) url.pathname = "/import/";
  else if (PATHS[ui.tab] || APP_PATHS.includes(url.pathname) || IMPORT_PATH.test(url.pathname))
    url.pathname = PATHS[ui.tab] || "/";
  if (onImport || PATHS[ui.tab] || ui.tab === "playthroughs") url.searchParams.delete("tab");
  else url.searchParams.set("tab", ui.tab);
  if (url.href !== location.href) {
    const from = tabFromUrl();
    if (ui.tab === from) history.replaceState(history.state, "", url);
    else history.pushState({ from }, "", url);
  }
  document.title = onImport ? "Import a save | Just One More Catch" : "Just One More Catch";
  if (!signedIn) ui.devices = ui.devicesError = undefined;
  else if (
    SETTINGS.includes(ui.tab) &&
    (!SETTINGS.includes(shownTab) ||
      (ui.devicesError && ui.tab !== shownTab) ||
      (ui.devices === undefined && !ui.devicesError))
  )
    void loadDevices();
  shownTab = ui.tab;
  const leftImport = !onImport && saveImport.isOpen && importPage.contains(document.activeElement);
  if (!onImport) closeImport();
  const importLive = onImport && saveImport.isOpen;
  if (onImport && !importLive && !loading) {
    $("#view").replaceChildren(importPage);
    saveImport.open();
  } else if (!importLive) $("#view").innerHTML = loading
    ? `<p class="muted" style="text-align:center;padding-top:40px">Loading…</p>`
    : needsGame && ui.loadError
      ? `<p class="small" role="alert" style="text-align:center;padding-top:40px;color:var(--coral)">This game didn't load. Check your connection and reload the page.</p>`
      : (ui.saveError
          ? `<p class="small" role="alert" style="text-align:center;margin:4px 0 16px;color:var(--coral)">${ui.saveError}</p>`
          : "") + VIEWS[ui.tab]();
  const here = SETTINGS.includes(ui.tab) ? ` aria-current="page"` : "";
  const avatar = `<button class="avatar" data-tab="settings" data-k="avatar" aria-label="Settings and avatar, ${esc(trainerName())}"${here}>${partner("")}</button>`;
  $("#topright").innerHTML =
    switcher(run?.id ?? opening) +
    (a.isLoading
      ? ""
      : signedIn
        ? avatar
        : `<span class="acct"><button class="signin" data-signinsheet="1" data-k="signin">Sign in</button>${avatar}</span>`);
  $("#footalert").innerHTML =
    a.isLoading || signedIn
      ? ""
      : `<div class="falert" role="note">Saved only in this browser<button data-signinsheet="1" data-k="signin-foot">Sign in</button></div>`;
  $("#toptabs").innerHTML = a.isLoading ? "" : tabButtons(false);
  $("#tabs").innerHTML = !a.isLoading
    ? `<nav class="tabbar${!isGuest() && run?.view === "dexonly" ? " four" : ""}" aria-label="Sections">${tabButtons(true)}<button class="tab-settings" data-tab="settings" data-k="tab-settings"${here}>${SETTINGS_ICON}<span>Settings</span></button></nav>`
    : "";
  $("#toast").innerHTML = ui.undo
    ? `<div class="toast">${ui.undo.msg}${ui.undo.n ? `<button data-undo="1">Undo</button>` : ""}</div>`
    : "";
  if (
    (typeof ui.sheet === "number" ||
      ui.sheet?.kind === "custom") &&
    $("#sheet").open
  )
    fillSheet(ui.sheet);
  if (leftImport) root.querySelector<HTMLElement>('[data-k="import-save"]')?.focus({ preventScroll: true });
  if (k)
    (
      root.querySelector(`[data-k="${k}"]`) ||
      (root.querySelector("[data-undo]") as any)
    )?.focus();
}

let saveTimer: any, undoTimer: any;
function showSaveError(msg: string) {
  ui.saveError = msg;
  render();
}
function scheduleSave(delay = 800) {
  if (!run) return;
  const id = run.id,
    state = dumpRun(run);
  if (state === ui.saved) return;
  clearTimeout(saveTimer);
  if (bridge.auth.isAuthenticated && runBytes(state) > MAX_RUN_BYTES)
    return showSaveError(
      "This playthrough is too big to save. Try shortening some notes.",
    );
  saveTimer = setTimeout(async () => {
    try {
      await bridge.saveRun(id, state);
      if (run?.id === id) ui.saved = state;
      if (ui.saveError) showSaveError("");
    } catch {
      showSaveError("Couldn't save. Trying again.");
      scheduleSave(5000);
    }
  }, delay);
}
function flushSave() {
  clearTimeout(saveTimer);
  if (run && dumpRun(run) !== ui.saved) {
    const id = run.id,
      state = dumpRun(run);
    bridge.saveRun(id, state).then(
      () => {
        if (run?.id === id) ui.saved = state;
      },
      () => {},
    );
  }
}
async function saveBeforeImport() {
  clearTimeout(saveTimer);
  if (!run) return;
  const id = run.id, state = dumpRun(run);
  if (state === ui.saved) return;
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      bridge.saveRun(id, state),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("Saving timed out")), 30000);
      }),
    ]);
  } finally { clearTimeout(timer); }
  if (run?.id === id) ui.saved = state;
}
function toggleCaught(n: number) {
  const p = byN[n],
    r = R(),
    had = r.caught.has(n);
  had ? r.caught.delete(n) : r.caught.add(n);
  ui.undo = { n, had, msg: `${p.name} ${had ? "unmarked" : "caught"}` };
  $("#live").textContent = ui.undo.msg;
  clearTimeout(undoTimer);
  undoTimer = setTimeout(() => {
    ui.undo = null;
    render();
  }, 5000);
}

async function download(kind: "json" | "csv") {
  const rows = bridge.runs || [];
  if (ui.export || !rows.length) return;
  ui.export = { kind, done: 0, total: rows.length };
  ui.exportError = "";
  render();
  try {
    const states = await fetchStates(rows, (done) => {
      ui.export.done = done;
      const b = document.querySelector(`[data-download="${kind}"]`);
      if (b) b.textContent = exportLabel();
    });
    if (kind === "json")
      saveFile(
        "just-one-more-catch.json",
        "application/json",
        jsonParts(rows, states),
      );
    else
      saveFile("just-one-more-catch-caught.csv", "text/csv", [
        await caughtCsv(rows, states),
      ]);
  } catch {
    ui.exportError =
      "Couldn't download your data. Check your connection and try again.";
  } finally {
    ui.export = null;
    render();
  }
}
async function onClick(e: MouseEvent) {
  const link = (e.target as HTMLElement).closest("a[data-nav]") as HTMLAnchorElement | null;
  if (link && !(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)) {
    e.preventDefault();
    if (link.dataset.nav === "settings" && history.state?.from === "settings") history.back();
    else {
      ui.tab = link.dataset.nav;
      ui.undo = null;
      render();
      scrollTo(0, 0);
      focusTitle();
    }
    return;
  }
  const t = (e.target as HTMLElement).closest(
    "button, a[data-tab]",
  ) as HTMLButtonElement | null;
  if (!t || t.disabled || (t.type === "submit" && t.form)) return;
  if (t instanceof HTMLAnchorElement) {
    if (e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
  }
  const d = t.dataset;
  if (d.boxlayout === "list" || d.boxlayout === "grid") {
    ui.boxLayout = d.boxlayout;
    store.set("jomc.boxLayout", ui.boxLayout);
    render();
    return;
  }
  if (d.look || d.mode) {
    setLocalTheme(d.look || ui.look, d.mode || ui.mode);
    if (raw.auth.isAuthenticated)
      raw
        .setTheme(ui.look, ui.mode)
        .catch(() => flash("Couldn't save your theme. Try again."));
    render();
    return;
  }
  if (d.tab) {
    if (d.tab === "import") {
      ui.sheet = null;
      $("#sheet").close();
    }
    ui.tab = d.tab;
    ui.undo = null;
    render();
    d.sec ? root.querySelector("#" + d.sec)?.scrollIntoView() : scrollTo(0, 0);
    return;
  }
  if (d.close) {
    $("#sheet").close();
    return;
  }
  if (d.pairstart) {
    void startPair();
    return;
  }
  if (d.revokeask || d.revokecancel) {
    ui.revoking = d.revokeask || null;
    render();
    (root.querySelector(
      d.revokeask ? `[data-revokecancel="${d.revokeask}"]` : `[data-revokeask="${d.revokecancel}"]`,
    ) as HTMLElement | null)?.focus();
    return;
  }
  if (d.devretry) {
    await loadDevices();
    if (!ui.devicesError) $("#devs-title")?.focus();
    return;
  }
  if (d.revoke) {
    await revoke(d.revoke);
    return;
  }
  if (d.approve || d.deny) {
    await answerPair(!!d.approve);
    return;
  }
  if (d.signinsheet) {
    flushSave();
    openSheet({ kind: "signin", k: d.k });
    return;
  }
  if (d.signout) {
    $("#sheet").close();
    flushSave();
    closeRun();
    bridge.signOut();
    return;
  }
  if (d.download) {
    await download(d.download === "csv" ? "csv" : "json");
    return;
  }
  if (d.delaccount) {
    if (
      !confirm(
        "Delete your account and all your playthroughs? This can't be undone.",
      )
    )
      return;
    $("#sheet").close();
    await bridge.deleteAccount();
    closeRun();
    bridge.signOut();
    return;
  }
  if (d.newrun) {
    if (creating) return;
    pickOpenedAt = performance.now();
    openSheet({ kind: "pick", id: d.newrun });
    $("[data-confirmrun]").focus();
    return;
  }
  if (d.confirmrun) {
    if (creating || performance.now() - pickOpenedAt < 350) return;
    flushSave();
    t.disabled = true;
    creating = true;
    try {
      pendingRun = await bridge.createRun(d.confirmrun);
      refresh();
    } catch {
      t.disabled = false;
      flash(`${verOf(d.confirmrun).name} playthrough didn't start. Try again.`);
    } finally {
      creating = false;
    }
    return;
  }
  if (d.switch) {
    flushSave();
    const row = bridge.runs?.find((r) => r.id === d.switch);
    if (row) {
      if (row.id !== run?.id) useRun(row, !d.stay);
      if (d.stay) ui.undo = null;
      else ui.tab = !isGuest() && run?.view === "journey" ? "journey" : "dex";
      render();
    }
    return;
  }
  if (d.startsheet) {
    openSheet({ kind: "started", id: d.startsheet });
    return;
  }
  if (d.savestart) {
    const day = ($("#started") as HTMLInputElement).value,
      row = bridge.runs?.find((x) => x.id === d.savestart);
    if (!row || !/^\d{4}-\d{2}-\d{2}$/.test(day) || day > ymd(new Date()))
      return;
    $("#sheet").close();
    const [y, m, dd] = day.split("-").map(Number);
    try {
      await bridge.setStart(row.id, new Date(y, m - 1, dd).getTime());
    } catch {
      showSaveError("Couldn't change the start date. Try again.");
    }
    return;
  }
  if (d.delrun) {
    const row = bridge.runs?.find((r) => r.id === d.delrun);
    if (
      !row ||
      !confirm(
        `Delete this ${verOf(row.version).name} playthrough? This can't be undone.`,
      )
    )
      return;
    if (run?.id === row.id) {
      clearTimeout(saveTimer);
      closeRun();
    }
    await bridge.deleteRun(row.id);
    return;
  }
  if (!run) return;
  const r = R();
  if (d.open) {
    openSheet(+d.open);
    return;
  }
  if (d.custom) {
    openSheet({ kind: "custom", k: "custom" });
    return;
  }
  if (d.clock) {
    openSheet({ kind: "clock", mode: r.clock.mode, k: "clock" });
    return;
  }
  if (d.clockmode) {
    ui.sheet.mode = d.clockmode;
    fillSheet(ui.sheet);
    $(`[data-clockmode="${d.clockmode}"]`)?.focus();
    return;
  }
  if (d.saveclock) {
    if (ui.sheet.mode === "manual") {
      const [h, m] = ($("#c-time").value || "").split(":").map(Number);
      if (isNaN(h) || isNaN(m)) return;
      r.clock = {
        mode: "manual",
        min: +$("#c-day").value * 1440 + h * 60 + m,
        at: Date.now(),
      };
    } else r.clock = { mode: "device", tz: $("#c-tz").value || undefined };
    r.skip.clear();
    $("#sheet").close();
    scheduleSave();
    return;
  }
  if (isGuest() && (d.editmon || d.addmon || d.renamebox || d.savemon || d.savebox || d.delmon)) return;
  if (d.editmon) {
    openSheet({ kind: "mon", id: +d.editmon });
    return;
  }
  if (d.addmon) {
    openSheet({ kind: "mon", n: +d.addmon });
    return;
  }
  if (d.renamebox) {
    openSheet({ kind: "box", b: +d.renamebox });
    return;
  }
  if (d.gender && d.species) {
    const p = byN[+d.species],
      g = d.gender;
    if (!r.trackGenders || !p || !hasGenders(p) || (g !== "m" && g !== "f")) return;
    if (r.mons.some((m) => m.n === p.n && m.g === g)) return;
    const genders = r.genders[p.n] ||= new Set();
    genders.has(g) ? genders.delete(g) : genders.add(g);
    r.caught.add(p.n);
    scheduleSave();
    render();
    fillSpecies(p.n);
    return;
  }
  if (d.form && d.species) {
    const p = byN[+d.species];
    if (!r.trackForms || (!p || !visibleForms(p).some((f) => f.id === d.form))) return;
    r.forms.has(d.form) ? r.forms.delete(d.form) : r.forms.add(d.form);
    r.caught.add(p.n);
    scheduleSave();
    render();
    fillSpecies(p.n);
    return;
  }
  if (d.savemon) {
    saveMon();
    $("#sheet").close();
    scheduleSave();
    return;
  }
  if (d.savebox) {
    const b = ui.sheet.b;
    r.boxNames[b - 1] = $("#f-boxname").value.trim().slice(0, 8) || `Box ${b}`;
    $("#sheet").close();
    scheduleSave();
    return;
  }
  if (d.delmon) {
    r.mons = r.mons.filter((m) => m.id !== +(d.delmon as string));
    $("#live").textContent = "Removed from your boxes";
    $("#sheet").close();
    scheduleSave();
    return;
  }
  if (d.toggle || d.catch) {
    const n = +(d.toggle || (d.catch as string));
    toggleCaught(n);
    scheduleSave();
  } else if (d.skip) r.skip.add(+d.skip);
  else if (d.unskip) r.skip.clear();
  else if (d.undo) {
    const u = ui.undo;
    u.had ? r.caught.add(u.n) : r.caught.delete(u.n);
    if (u.monId) r.mons = r.mons.filter((m) => m.id !== u.monId);
    ui.undo = null;
    $("#live").textContent = "Undone";
  } else if (d.time) {
    if (d.time === "auto") r.timeAuto = true;
    else {
      r.timeAuto = false;
      r.time = d.time;
    }
    r.skip.clear();
    if ($("#sheet").open && ui.sheet?.kind === "clock") fillSheet(ui.sheet);
  } else if (d.hide) {
    r.hidden.has(d.hide) ? r.hidden.delete(d.hide) : r.hidden.add(d.hide);
  } else if (d.journeytab) {
    r.view = r.view === "dexonly" ? r.startView : "dexonly";
  } else if (d.startview) {
    r.view = r.startView = d.startview === "dex" ? "dex" : "journey";
  } else if (d.dexoption === "trackForms" || d.dexoption === "trackGenders" || d.dexoption === "trackTraded") {
    r[d.dexoption] = !r[d.dexoption];
  } else if (d.showlater) r.showLater = !r.showLater;
  else if (d.event) {
    if (forced(d.event)) return;
    eventDone(d.event) ? untick(d.event) : r.events.add(d.event);
  } else if (d.yes || d.snooze || d.unsnooze) {
    // A double tap would otherwise answer the next question unread.
    if (performance.now() - (ui.askedAt || 0) < 600) return;
    ui.askedAt = performance.now();
    const e = EVENTS[d.yes || d.snooze || ""];
    if (d.yes) r.events.add(d.yes);
    else if (d.snooze) ui.snooze.add(d.snooze);
    else ui.snooze.clear();
    render();
    (
      (root.querySelector("#ask-q") ||
        root.querySelector('[data-k="ask-now"]') ||
        root.querySelector("#here")) as HTMLElement | null
    )?.focus();
    announce(
      e
        ? d.yes
          ? `${e.label}: done`
          : `${e.label}: asking later`
        : "Asking again",
    );
    if (d.yes) scheduleSave();
    return;
  } else if (d.goevent) {
    if (isGuest()) {
      ui.tab = "journey";
      if ($("#sheet").open) $("#sheet").close();
      render();
      (root.querySelector('[data-k="signin-journey"]') as HTMLElement | null)?.focus();
      return;
    }
    ui.open.add(String(EVENTS[d.goevent].chap));
    ui.shut.delete(String(EVENTS[d.goevent].chap));
    ui.tab = "journey";
    if ($("#sheet").open) $("#sheet").close();
    render();
    const b = root.querySelector("#ev-" + d.goevent) as HTMLElement | null;
    b?.scrollIntoView({ block: "center" });
    b?.focus({ preventScroll: true });
    announce(`Showing ${EVENTS[d.goevent].label} in Your journey`);
    return;
  } else if (d.badge) {
    r.badges.has(d.badge) ? r.badges.delete(d.badge) : r.badges.add(d.badge);
  } else if (d.safari) {
    r.safari.has(d.safari) ? r.safari.delete(d.safari) : r.safari.add(d.safari);
  } else if (d.kit) {
    r.kit.has(d.kit) ? r.kit.delete(d.kit) : r.kit.add(d.kit);
  } else if (d.filter) ui.filter = d.filter;
  else if (d.boxfilter) ui.boxFilter = d.boxfilter;
  else if (d.bulk) {
    ui.bulk = !ui.bulk;
    if (ui.bulk) ui.filter = "all";
  } else return;
  scheduleSave();
  render();
}

const MODES = ["auto", "light", "dark"];
function setLocalTheme(look: string, mode: string) {
  if (PALETTE[look]) store.set("jomc.look", (ui.look = look));
  if (MODES.includes(mode)) store.set("jomc.mode", (ui.mode = mode));
  applyTheme();
}
// Adopt the account's theme only when it changes, so a pending save never snaps back
let seenTheme: string | undefined;
function syncTheme() {
  const t = raw.theme;
  if (!raw.auth.isAuthenticated) seenTheme = undefined;
  if (!raw.auth.isAuthenticated || t === undefined) return;
  const key = t ? t.look + "/" + t.mode : "";
  if (key === seenTheme) return;
  seenTheme = key;
  if (t) setLocalTheme(t.look, t.mode);
  else void raw.setTheme(ui.look, ui.mode).catch(() => {});
}

const darkMQ = matchMedia("(prefers-color-scheme: dark)");
function applyTheme() {
  const dark = ui.mode === "dark" || (ui.mode === "auto" && darkMQ.matches);
  document.documentElement.dataset.theme =
    PALETTE[ui.look][dark ? "dark" : "light"];
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute(
      "content",
      getComputedStyle(document.documentElement)
        .getPropertyValue("--bg")
        .trim(),
    );
}

let raw: Bridge;
const refresh = () => queueMicrotask(() => update(raw));

function flash(msg: string) {
  ui.undo = { msg };
  $("#live").textContent = msg;
  clearTimeout(undoTimer);
  undoTimer = setTimeout(() => {
    ui.undo = null;
    render();
  }, 8000);
  render();
}
let pendingRun: string | null = null;
function closeImport() {
  saveImport.close();
  if (pendingImport) {
    pendingImport = false;
    pendingRun = null;
  }
}
function syncRuns() {
  if (bridge.avatar === ui.avatar) ui.avatar = undefined;
  const rows = bridge.runs;
  if (bridge.auth.isLoading || !rows) return;
  if (bridge.auth.isAuthenticated) {
    void moveGuestRuns(raw, flash, (guestId, id) => {
      if (store.get("jomc.run") === guestId) pendingRun = id;
    });
    moveGuestAvatar(raw);
  }
  if (run && !rows.some((r) => r.id === run!.id)) closeRun();
  const want = pendingRun && rows.find((r) => r.id === pendingRun);
  if (want) {
    pendingRun = null;
    if (pendingImport) {
      pendingImport = false;
      if (IMPORT_PATH.test(location.pathname)) history.replaceState(null, "", "/pokedex/");
      ui.tab = "dex";
      ui.filter = "caught";
      useRun(want);
    } else useRun(want, true, true);
    return;
  }
  if (!run && !opening && !ui.loadError && rows.length)
    useRun(
      rows.find((r) => r.id === store.get("jomc.run")) || rows[rows.length - 1],
    );
}

export function mount(el: HTMLElement, b: Bridge) {
  if (new URLSearchParams(location.search).get("tab") === "about") {
    location.replace("/about/");
    return;
  }
  setRoot(el);
  ui.tab = tabFromUrl();
  addEventListener("popstate", () => {
    if (ui.sheet?.hist && history.state?.sheet !== ui.sheet.kind)
      $("#sheet").close();
    if (tabFromUrl() === ui.tab) return;
    ui.tab = tabFromUrl();
    ui.undo = null;
    render();
    if (SETTINGS.includes(ui.tab)) focusTitle();
  });
  raw = b;
  setBridge(withGuest(b, refresh));
  el.className = "app";
  el.innerHTML = shell();
  importPage = document.createElement("div");
  importPage.className = "import-page";
  importPage.innerHTML = `<a class="import-back" href="/" data-tab="playthroughs" data-k="import-back"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M5 12l6 6M5 12l6-6"/></svg>Back to Dashboard</a><section class="import-card" aria-labelledby="import-title"></section>`;
  saveImport = new SaveImport({
    host: importPage.querySelector<HTMLElement>(".import-card")!,
    bridge: () => bridge,
    flush: saveBeforeImport,
    complete: (id, current) => {
      if (current) {
        pendingImport = true;
        pendingRun = id;
        refresh();
      }
      flash(!current ? "Caught Pokémon imported." : bridge.auth.isAuthenticated ? "Caught Pokémon imported. Saved to your account." : "Caught Pokémon imported. Saved only in this browser.");
    },
    dismiss: () => {
      ui.tab = "playthroughs";
      ui.undo = null;
      render();
      scrollTo(0, 0);
    },
  });
  // A page restored from the back/forward cache starts a fresh import; file bytes never persist.
  addEventListener("pagehide", closeImport);
  addEventListener("pageshow", (e) => { if (e.persisted) render(); });
  ui.boxLayout = store.get("jomc.boxLayout") === "grid" ? "grid" : "list";
  ui.look = PALETTE[store.get("jomc.look") || ""]
    ? store.get("jomc.look")
    : "blossom";
  ui.mode = MODES.includes(store.get("jomc.mode") || "")
    ? store.get("jomc.mode")
    : "auto";
  applyTheme();
  darkMQ.addEventListener("change", applyTheme);
  el.addEventListener("click", onClick);
  el.addEventListener(
    "toggle",
    (e) => {
      const d = e.target as HTMLDetailsElement,
        c = d.dataset?.chap,
        def = d.dataset?.def != null;
      if (c == null) return;
      if (d.open) {
        ui.shut.delete(c);
        if (!def) ui.open.add(c);
      } else {
        ui.open.delete(c);
        if (def) ui.shut.add(c);
      }
    },
    true,
  );
  el.addEventListener("input", (e) => {
    const t = e.target as HTMLInputElement;
    if (t.id === "paircode") {
      const letters = pairLetters(t.value);
      ui.pairInput = letters;
      t.value = showCode(letters);
      ($("#pairgo") as HTMLButtonElement).disabled = letters.length < 8;
      t.form?.parentElement?.querySelector("[role=alert]")?.remove();
      ui.pairError = undefined;
      return;
    }
    if (t.id !== "dexq") return;
    ui.q = t.value;
    $("#dexgrid").innerHTML = dexGrid();
  });
  el.addEventListener("submit", (e) => {
    if ((e.target as HTMLElement).id !== "pairform") return;
    e.preventDefault();
    if (pairLetters(ui.pairInput || "").length === 8) void lookupPair(ui.pairInput);
  });
  el.addEventListener("change", (e) => {
    const t = e.target as HTMLInputElement;
    if (t.id === "f-form" || t.id === "f-shiny") {
      updateMonSprite();
      return;
    }
    if (t.name === "avatar") {
      const n = Number(t.value);
      ui.avatar = n;
      render();
      bridge.setAvatar(n).then(
        () => {
          if (bridge.avatar === n && ui.avatar === n) ui.avatar = undefined;
        },
        () => {
          if (ui.avatar === n) ui.avatar = undefined;
          flash("Couldn't save your avatar. Try again.");
        },
      );
      return;
    }
    if ((e.target as HTMLElement).id === "here" && run) {
      run.here = (e.target as HTMLSelectElement).value;
      scheduleSave();
      render();
    }
  });
  const menus = () =>
    root.querySelectorAll<HTMLDetailsElement>(
      "details.gsw[open],details.ptmenu[open]",
    );
  document.addEventListener("click", (e) =>
    menus().forEach((m) => {
      if (!m.contains(e.target as Node)) m.open = false;
    }),
  );
  el.addEventListener("keydown", (e) => {
    if (
      e.repeat &&
      (e.key === "Enter" || e.key === " ") &&
      (e.target as HTMLElement).closest("[data-confirmrun]")
    ) e.preventDefault();
    if (e.key !== "Escape") return;
    menus().forEach((m) => {
      m.open = false;
      m.querySelector("summary")?.focus();
    });
  });
  $("#sheet").addEventListener("click", (e: Event) => {
    if ((e.target as HTMLElement).id === "sheet") {
      if (ui.sheet?.kind === "pick" && performance.now() - pickOpenedAt < 350) return;
      $("#sheet").close();
    }
  });
  $("#sheet").addEventListener("close", () => {
    if (!$("#sheet").open) finishSheet();
  });
  const timeKey = () => (run ? `${nowTime()} ${gameNow(R().clock).day}` : "");
  let shownTime = timeKey();
  const refreshTime = () => {
    if (
      !run ||
      ui.tab !== "journey" ||
      $("#sheet").open ||
      timeKey() === shownTime
    )
      return;
    shownTime = timeKey();
    render();
  };
  setInterval(refreshTime, 60000);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushSave();
    else refreshTime();
  });
  syncRuns();
  render();
  queueMicrotask(checkPairCode);
}
export function update(b: Bridge) {
  if (
    !bridge.auth.isLoading &&
    !bridge.auth.isAuthenticated &&
    (b.auth.isLoading || b.auth.isAuthenticated)
  )
    flushSave();
  raw = b;
  setBridge(withGuest(b, refresh));
  saveImport.accountChanged();
  syncRuns();
  syncTheme();
  if (b.auth.isAuthenticated && ["signin", "pair"].includes(ui.sheet?.kind))
    $("#sheet").close();
  if (!$("#sheet").open) render();
  checkPairCode();
}

const focusTitle = () => (root.querySelector("#view .pgtitle") as HTMLElement | null)?.focus();

/* ---- Devices ---- */
let shownTab = "";
let devicesLoading = false;
async function loadDevices() {
  if (devicesLoading) return;
  devicesLoading = true;
  try {
    ui.devices = await bridge.listDevices();
    ui.devicesError = undefined;
  } catch {
    ui.devicesError = "Load failed";
  } finally {
    devicesLoading = false;
    render();
  }
}
const revokeButtons = () =>
  [...root.querySelectorAll<HTMLElement>("[data-revokeask],[data-revoke]")];
async function revoke(id: string) {
  const at = revokeButtons().findIndex((b) => b.dataset.revoke === id);
  let done = false;
  try {
    await bridge.revokeDevice(id);
    ui.revoking = null;
    done = true;
    flash("Device signed out");
  } catch {
    flash("Sign-out failed");
  }
  await loadDevices();
  if (!done) return;
  const left = revokeButtons();
  (left[Math.min(at, left.length - 1)] || $("#devs-title"))?.focus();
}

let pairLooking = false;
async function lookupPair(letters: string) {
  if (pairLooking) return;
  pairLooking = true;
  ui.pairError = undefined;
  try {
    const r = await bridge.lookupPairing(showCode(pairLetters(letters)));
    if (r.status === "ok") {
      ui.pairInput = "";
      render();
      openApprove(r);
    } else ui.pairError = pairErrorText(r);
  } catch {
    ui.pairError = "Code check failed";
  } finally {
    pairLooking = false;
  }
  if (ui.pairError) render();
}
function openApprove(p: Extract<PairingLookup, { status: "ok" }>) {
  openSheet({ kind: "approve", p, k: "paircode", hist: true });
  ($("#sheet [data-deny]") as HTMLElement).focus();
}
async function answerPair(approve: boolean) {
  const s = ui.sheet;
  if (s?.kind !== "approve" || s.busy) return;
  s.busy = true;
  const status = $("#approve-status");
  status.textContent = approve ? "Approving…" : "Denying…";
  try {
    const r = await (approve ? bridge.approvePairing : bridge.denyPairing)(s.p.code);
    const shown = ui.sheet === s;
    if (r.status === "limited") {
      if (shown) status.textContent = pairErrorText(r);
      return;
    }
    if (shown) $("#sheet").close();
    flash(r.status === "missing" ? "Code expired" : approve ? "Device approved" : "Sign-in denied");
    void loadDevices();
  } catch {
    if (ui.sheet === s) status.textContent = "Connection failed";
  } finally {
    s.busy = false;
  }
}
let pairPrompted = false,
  pairLooked = false;
function checkPairCode() {
  const code = bridge.pairCode;
  if (!code || bridge.auth.isLoading || $("#sheet").open) return;
  const signedIn = bridge.auth.isAuthenticated;
  if (signedIn ? pairLooked : pairPrompted) return;
  if (signedIn) pairLooked = true;
  else pairPrompted = true;
  if (ui.tab !== "devices") {
    ui.tab = "devices";
    render();
  }
  if (signedIn) void lookupPair(code);
  else openSheet({ kind: "signin", k: "signin-devices" });
}

/* ---- Device side: show a code, wait for approval ---- */
let pairing: PairingHandle | null = null,
  pairTick: any;
function stopPair() {
  pairing?.cancel();
  pairing = null;
  clearInterval(pairTick);
}
async function startPair() {
  const prev = ui.sheet;
  if (prev?.kind === "signin")
    bridge.unmountSignIn($("#clerk-signin") as HTMLDivElement);
  stopPair();
  const s = { kind: "pair", k: prev?.k, hist: true, v: { state: "starting" } as any };
  showSheet(s);
  void showPair();
  try {
    const h = await bridge.startPairing((state) => {
      if (state === "pending" || ui.sheet !== s) return;
      s.v = { ...s.v, state };
      void showPair();
    });
    if (ui.sheet !== s) return h.cancel();
    pairing = h;
    if (s.v.state === "starting") {
      s.v = { state: "pending", code: h.code, url: h.url, expiresAt: h.expiresAt };
      void showPair();
    }
    pairTick = setInterval(() => {
      const el = $("#pairttl");
      if (el) el.textContent = ttl(h.expiresAt);
    }, 1000);
  } catch {
    if (ui.sheet !== s) return;
    s.v = { state: "failed" };
    void showPair();
  }
}
async function showPair() {
  const s = ui.sheet;
  if (s?.kind !== "pair") return;
  const v = s.v;
  const html = await pairBody(v);
  if (ui.sheet !== s || s.v !== v) return;
  if (!$("#pairbody"))
    $("#sheetbody").innerHTML =
      `<div class="grab" aria-hidden="true"></div><div class="dev"><h2 id="sheet-title" class="lg" tabindex="-1">Sign in</h2><div id="pairbody"></div></div><p class="sr" aria-live="polite" id="pairlive"></p>`;
  $("#pairbody").innerHTML = html;
  $("#pairlive").textContent = $("#pairbody .big")?.textContent || $("#pairbody .pcode")?.getAttribute("aria-label") || "";
  ($("#pairbody [data-autofocus]") || $("#sheet-title"))?.focus();
}

document.addEventListener("focusin", (event) => {
  const box = (event.target as HTMLElement).closest(".gb");
  if (box?.matches(":focus-visible"))
    box.scrollIntoView({ block: "nearest", inline: "center", behavior: "instant" });
});
