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
} from "./game";
import { moveGuestAvatar, moveGuestRuns, withGuest } from "./guest";
import { SETTINGS_ICON, TAB_ICONS } from "./parts";
import { Bridge, RunRow } from "./types";
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
      if (start && run) ui.tab = run.view === "journey" ? "journey" : "dex";
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
            : s.kind === "settings"
              ? ($("#sheetbody").innerHTML = Settings())
              : s.kind === "box"
                ? fillBoxSheet(s.b)
                : fillMonSheet(s);
}
function openSheet(s: any) {
  ui.sheet = s;
  $("#sheet").classList.toggle("wide", s.kind === "settings");
  fillSheet(s);
  if (!$("#sheet").open) $("#sheet").showModal();
}

/* ---- Wiring ---- */
const TABS = [
  ["playthroughs", "Dashboard"],
  ["journey", "Journey"],
  ["dex", "Dex"],
  ["boxes", "Boxes"],
];
const tabButtons = (icons: boolean) =>
  TABS.filter(([t]) => t !== "journey" || run?.view !== "dexonly").map(
    ([t, l]) =>
      `<button data-tab="${t}" ${ui.tab === t ? `aria-current="page"` : ""}>${icons ? TAB_ICONS[t] : ""}<span>${l}</span></button>`,
  ).join("");
const VIEWS: Record<string, () => string> = {
  journey: Journey,
  dex: Dex,
  boxes: Boxes,
  playthroughs: Runs,
};
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
  <nav class="footnav" aria-label="About this site"><a href="/about/">About</a><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a><a href="/contact/">Contact</a></nav></footer>
  <div class="dock"><div id="toast"></div><div id="tabs"></div></div>
  <dialog class="sheet" id="sheet" aria-labelledby="sheet-title"><div class="sheetbody" id="sheetbody"></div></dialog>
  <div class="sr" aria-live="polite" id="live"></div>`;
}
function tabFromUrl() {
  if (IMPORT_PATH.test(location.pathname)) return "import";
  const t = new URLSearchParams(location.search).get("tab");
  return t === "journey" && run?.view === "dexonly" ? "dex" : t && Object.hasOwn(VIEWS, t) ? t : "playthroughs";
}
function render() {
  if (ui.tab === "journey" && run?.view === "dexonly") ui.tab = "dex";
  const a = bridge.auth,
    signedIn = a.isAuthenticated;
  const k = (document.activeElement as HTMLElement)?.dataset?.k;
  const onImport = ui.tab === "import";
  const needsGame = ui.tab !== "playthroughs" && !onImport;
  const loading = a.isLoading || !bridge.runs || (needsGame && !!opening);
  root.classList.toggle("loading", loading);
  const url = new URL(location.href);
  url.pathname = onImport ? "/import/" : IMPORT_PATH.test(url.pathname) ? "/" : url.pathname;
  if (ui.tab === "playthroughs" || onImport) url.searchParams.delete("tab");
  else url.searchParams.set("tab", ui.tab);
  if (url.href !== location.href)
    history[ui.tab === tabFromUrl() ? "replaceState" : "pushState"](
      null,
      "",
      url,
    );
  document.title = onImport ? "Import a save | Just One More Catch" : "Just One More Catch";
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
  const avatar = `<button class="avatar" data-settings="1" data-k="avatar" aria-label="Settings and avatar, ${esc(trainerName())}">${partner("")}</button>`;
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
    ? `<nav class="tabbar${run?.view === "dexonly" ? " four" : ""}" aria-label="Sections">${tabButtons(true)}<button class="tab-settings" data-settings="1" data-k="tab-settings">${SETTINGS_ICON}<span>Settings</span></button></nav>`
    : "";
  $("#toast").innerHTML = ui.undo
    ? `<div class="toast">${ui.undo.msg}${ui.undo.n ? `<button data-undo="1">Undo</button>` : ""}</div>`
    : "";
  if (
    (typeof ui.sheet === "number" ||
      ["settings", "custom"].includes(ui.sheet?.kind)) &&
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
  const t = (e.target as HTMLElement).closest(
    "button, a[data-tab]",
  ) as HTMLButtonElement | null;
  if (!t || t.disabled || (t.type === "submit" && t.form)) return;
  if (t instanceof HTMLAnchorElement) {
    if (e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
  }
  const d = t.dataset;
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
  if (d.settings) {
    openSheet({ kind: "settings", k: d.k });
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
      else ui.tab = run?.view === "journey" ? "journey" : "dex";
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
      if (IMPORT_PATH.test(location.pathname)) history.replaceState(null, "", "/?tab=dex");
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
  const settings = new URLSearchParams(location.search).get("tab") === "settings";
  setRoot(el);
  ui.tab = tabFromUrl();
  addEventListener("popstate", () => {
    if (tabFromUrl() === ui.tab) return;
    ui.tab = tabFromUrl();
    ui.undo = null;
    render();
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
  ui.look = PALETTE[store.get("jomc.look") || ""]
    ? store.get("jomc.look")
    : "blossom";
  ui.mode = MODES.includes(store.get("jomc.mode") || "")
    ? store.get("jomc.mode")
    : "auto";
  applyTheme();
  darkMQ.addEventListener("change", applyTheme);
  if (settings) openSheet({ kind: "settings" });
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
    if (t.id !== "dexq") return;
    ui.q = t.value;
    $("#dexgrid").innerHTML = dexGrid();
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
    const s = ui.sheet;
    ui.sheet = null;
    if (s?.kind === "signin")
      bridge.unmountSignIn($("#clerk-signin") as HTMLDivElement);
    render();
    if (s?.kind === "pick") {
      (root.querySelector(`[data-newrun="${s.id}"]`) as HTMLElement | null)?.focus();
      return;
    }
    if (s)
      (
        root.querySelector(
          `[data-k="${typeof s === "number" ? "d" + s : s.k ? s.k : s.id ? "m" + s.id : s.b ? "rb" + s.b : "x"}"]`,
        ) || (root.querySelector("[data-filter][aria-pressed=true]") as any)
      )?.focus();
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
  if (b.auth.isAuthenticated && ui.sheet?.kind === "signin")
    $("#sheet").close();
  if (!$("#sheet").open) render();
}

document.addEventListener("focusin", (event) => {
  const box = (event.target as HTMLElement).closest(".gb");
  if (box?.matches(":focus-visible"))
    box.scrollIntoView({ block: "nearest", inline: "center", behavior: "instant" });
});
