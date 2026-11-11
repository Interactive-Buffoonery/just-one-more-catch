// Ported from the approved mockup: string-rendered views on one root, event delegation, no framework.
// main.ts owns auth and server calls and hands them in through the bridge.
import "./styles.css";
import { $, announce, esc, root, setRoot } from "./dom";
import { caughtCsv, fetchStates, jsonParts, saveFile } from "./export";
import {
  bridge,
  byN,
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
import { About, Contact } from "./views/about";
import { Boxes, fillBoxSheet, fillMonSheet, saveMon } from "./views/boxes";
import { Dex, dexGrid, fillSpecies } from "./views/dex";
import { fillClock, fillCustom, Journey, untick } from "./views/journey";
import {
  cover,
  exportLabel,
  fillSignIn,
  fillStartDate,
  partner,
  Runs,
  Settings,
  trainerName,
} from "./views/runs";
import { gameNow } from "../shared/clock";
import { MAX_RUN_BYTES, runBytes } from "../shared/limits";

let opening: string | null = null;
function useRun(row: RunRow) {
  const v = verOf(row.version);
  closeRun();
  opening = row.id;
  Promise.all([
    loaded.get(v.pack) || v.pack.load(),
    bridge.getState(row.id),
  ]).then(
    ([d, state]) => {
      loaded.set(v.pack, d);
      if (opening !== row.id) return;
      opening = null;
      const latest = bridge.runs?.find((r) => r.id === row.id);
      if (latest) openRun(latest, d, state);
      if (!$("#sheet").open) render();
    },
    () => {
      if (opening !== row.id) return;
      opening = null;
      ui.loadError = !!bridge.runs?.some((r) => r.id === row.id);
      render();
    },
  );
}

function fillSheet(s: any) {
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
const VIEWS: Record<string, () => string> = {
  journey: Journey,
  dex: Dex,
  boxes: Boxes,
  playthroughs: Runs,
  about: About,
  contact: Contact,
};
function shell() {
  return `<div class="top">
    <button class="logo" data-tab="playthroughs" aria-label="Just One More Catch, your playthroughs"><span class="full">Just One More Catch</span></button>
    <span class="spacer"></span><span id="topright"></span>
  </div>
  <main id="view"></main>
  <div class="footer-brand"><button data-tab="about" data-sec="about" aria-label="About Just One More Catch">Just One More Catch</button></div>
  <p class="foot">Unofficial fan project, not affiliated with Nintendo, Creatures, GAME FREAK or The Pokémon Company. Free and non-commercial. Box art, sprites and badges © Nintendo, Creatures and GAME FREAK. Encounter data and sprites sourced from <a href="https://pokeapi.co" target="_blank" rel="noopener">PokeAPI</a>. Thank you!</p>
  <nav class="footnav" aria-label="About this site"><button data-tab="about" data-sec="about">About</button><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a><button data-tab="contact">Contact</button></nav>
  <div class="dock"><div id="toast"></div><div id="tabs"></div></div>
  <dialog class="sheet" id="sheet" aria-labelledby="sheet-title"><div class="sheetbody" id="sheetbody"></div></dialog>
  <div class="sr" aria-live="polite" id="live"></div>`;
}
function tabFromUrl() {
  const t = new URLSearchParams(location.search).get("tab");
  return t && Object.hasOwn(VIEWS, t) ? t : "playthroughs";
}
function render() {
  const a = bridge.auth,
    signedIn = a.isAuthenticated;
  const k = (document.activeElement as HTMLElement)?.dataset?.k;
  const needsGame = ui.tab !== "playthroughs";
  const loading = a.isLoading || !bridge.runs || (needsGame && !!opening);
  root.classList.toggle("loading", loading);
  const url = new URL(location.href);
  if (ui.tab === "playthroughs") url.searchParams.delete("tab");
  else url.searchParams.set("tab", ui.tab);
  if (url.href !== location.href)
    history[ui.tab === tabFromUrl() ? "replaceState" : "pushState"](
      null,
      "",
      url,
    );
  $("#view").innerHTML = loading
    ? `<p class="muted" style="text-align:center;padding-top:40px">Loading…</p>`
    : needsGame && ui.loadError
      ? `<p class="small" role="alert" style="text-align:center;padding-top:40px;color:var(--coral)">This game didn't load. Check your connection and reload the page.</p>`
      : (signedIn || ui.tab === "playthroughs"
          ? ui.saveError
            ? `<p class="small" role="alert" style="text-align:center;margin:4px 0 16px;color:var(--coral)">${ui.saveError}</p>`
            : ""
          : `<p class="muted small" style="text-align:center;margin:4px 0 16px">Currently saved only in this browser. <button class="linkish" data-signinsheet="1">Sign in</button> to save your playthroughs and view them on any device.</p>`) +
        VIEWS[ui.tab]();
  $("#topright").innerHTML =
    `<span style="display:flex;gap:8px">${run ? `<button class="gamepill" data-tab="playthroughs" aria-label="Current playthrough: ${ver().name}. Switch playthrough">${cover(ver())}</button>` : ""}${
      a.isLoading
        ? ""
        : `${signedIn ? "" : `<button class="hdr-signup" data-signinsheet="1" data-k="signin">Sign up / Sign in</button>`}<button class="avatar" data-settings="1" data-k="avatar" aria-label="Settings and avatar, ${esc(trainerName())}">${partner("")}</button>`
    }</span>`;
  $("#tabs").innerHTML = !a.isLoading
    ? `<nav class="tabbar" aria-label="Sections">${[
        ["playthroughs", "Dashboard"],
        ["journey", "Journey"],
        ["dex", "Dex"],
        ["boxes", "Boxes"],
      ]
        .map(
          ([t, l]) =>
            `<button data-tab="${t}" ${ui.tab === t ? `aria-current="page"` : ""}>${TAB_ICONS[t]}<span>${l}</span></button>`,
        )
        .join(
          "",
        )}<button class="tab-settings" data-settings="1" data-k="tab-settings">${SETTINGS_ICON}<span>Settings</span></button></nav>`
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
    "button",
  ) as HTMLButtonElement | null;
  if (!t || t.disabled || (t.type === "submit" && t.form)) return;
  const d = t.dataset;
  if (d.look) {
    ui.look = d.look;
    store.set("jomc.look", ui.look);
    applyTheme();
    render();
    return;
  }
  if (d.mode) {
    ui.mode = d.mode;
    store.set("jomc.mode", ui.mode);
    applyTheme();
    render();
    return;
  }
  if (d.tab) {
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
    openSheet({ kind: "signin" });
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
  if (d.another) {
    ui.sent = false;
    render();
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
    flushSave();
    t.disabled = true;
    if ($("#sheet").open) $("#sheet").close();
    pendingRun = await bridge.createRun(d.newrun);
    refresh();
    return;
  }
  if (d.switch) {
    flushSave();
    const row = bridge.runs?.find((r) => r.id === d.switch);
    if (row) {
      if (row.id !== run?.id) useRun(row);
      ui.tab = "journey";
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

async function onSubmit(e: SubmitEvent) {
  const form = e.target as HTMLFormElement;
  if (!form.dataset.contact) return;
  e.preventDefault();
  const btn = form.querySelector("button") as HTMLButtonElement;
  btn.disabled = true;
  try {
    const res = await bridge.contact({
      message: $("#c-msg").value,
      email: $("#c-email").value,
      website: $("#c-website").value,
    });
    ui.sent = res.ok;
    ui.sendError = res.ok
      ? ""
      : "Please write a message, and check the email address.";
  } catch {
    ui.sendError = "That didn't send. Please try again.";
  }
  if (ui.sent) render();
  else {
    btn.disabled = false;
    form.querySelector(".small")?.remove();
    btn.insertAdjacentHTML(
      "afterend",
      `<p class="small" role="alert" style="color:var(--coral)">${ui.sendError}</p>`,
    );
  }
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
    useRun(want);
    ui.tab = "journey";
    return;
  }
  if (!run && !opening && !ui.loadError && rows.length)
    useRun(
      rows.find((r) => r.id === store.get("jomc.run")) || rows[rows.length - 1],
    );
}

export function mount(el: HTMLElement, b: Bridge) {
  setRoot(el);
  ui.tab = tabFromUrl();
  addEventListener("popstate", () => {
    if (tabFromUrl() === ui.tab) return;
    ui.tab = tabFromUrl();
    ui.undo = null;
    render();
  });
  document.title = "Just One More Catch";
  raw = b;
  setBridge(withGuest(b, refresh));
  el.className = "app";
  el.innerHTML = shell();
  ui.look = PALETTE[store.get("jomc.look") || ""]
    ? store.get("jomc.look")
    : "blossom";
  ui.mode = ["auto", "light", "dark"].includes(store.get("jomc.mode") || "")
    ? store.get("jomc.mode")
    : "auto";
  applyTheme();
  darkMQ.addEventListener("change", applyTheme);
  el.addEventListener("click", onClick);
  el.addEventListener("submit", onSubmit as any);
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
  $("#sheet").addEventListener("click", (e: Event) => {
    if ((e.target as HTMLElement).id === "sheet") $("#sheet").close();
  });
  $("#sheet").addEventListener("close", () => {
    const s = ui.sheet;
    ui.sheet = null;
    if (s?.kind === "signin")
      bridge.unmountSignIn($("#clerk-signin") as HTMLDivElement);
    render();
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
  syncRuns();
  if (b.auth.isAuthenticated && ui.sheet?.kind === "signin")
    $("#sheet").close();
  if (!$("#sheet").open) render();
}
