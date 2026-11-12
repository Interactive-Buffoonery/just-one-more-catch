import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {stripTypeScriptTypes} from "node:module";
import {runInNewContext} from "node:vm";

const game = readFileSync(new URL("../client/game.ts", import.meta.url), "utf8");
const load = runInNewContext(stripTypeScriptTypes(game.slice(game.indexOf("function loadRun("), game.indexOf("export const dumpRun"))) + "\nloadRun", {
  verOf: () => ({pack: {start: "Start", boxes: [1]}}), MON_DEFAULTS: {},
});
for (const [view, expected] of [[undefined, "journey"], ["unknown", "journey"], ["journey", "journey"], ["dex", "dex"], ["dexonly", "dexonly"]]) {
  assert.equal(load({id: "guest", version: "example"}, JSON.stringify({view})).view, expected);
}
const app = readFileSync(new URL("../client/app.ts", import.meta.url), "utf8");
const start = app.match(/if \(start && run\) (ui.tab = .*?);/)[1];
const IMPORT_PATH = runInNewContext(app.match(/const IMPORT_PATH = (.*);/)[1]);
const PATHS = Function(`return ${app.match(/const PATHS[^=]*= (\{[^}]*\});/)[1]}`)();
const tabAt = (pathname, search, view, VIEWS = {journey: true}) => runInNewContext(app.slice(app.indexOf("function tabFromUrl()"), app.indexOf("function render()")) + "\ntabFromUrl", {
  URLSearchParams, IMPORT_PATH, PATHS, location: {pathname, search}, run: {view}, VIEWS,
})();
for (const pathname of ["/import/", "/import"]) assert.equal(tabAt(pathname, "?tab=journey", "journey"), "import");
assert.equal(tabAt("/importer/", "", "journey"), "playthroughs");
for (const view of ["journey", "dex", "dexonly"]) {
  const ui = {};
  runInNewContext(start, {ui, run: {view}});
  assert.equal(ui.tab, view === "journey" ? "journey" : "dex");
  assert.equal(tabAt("/journey/", "", view), view === "dexonly" ? "dex" : "journey");
  assert.equal(tabAt("/", "?tab=journey", view), view === "dexonly" ? "dex" : "journey");
}
for (const [pathname, search, tab] of [["/settings/", "", "settings"], ["/settings/devices/", "?tab=dex", "devices"], ["/", "?tab=settings", "settings"], ["/", "", "playthroughs"]]) {
  assert.equal(tabAt(pathname, search, "journey", {settings: true, devices: true}), tab, pathname + search);
}
console.log("playthrough view ok");

for (const destination of ["stay", "dashboard", "fresh-import"]) {
  const old = {id: "old"}, imported = {id: "imported"}, opened = [];
  const ui = {tab: "import", avatar: undefined, undo: null};
  const bridge = {auth: {isLoading: false, isAuthenticated: true}, runs: [old]};
  const location = {href: "https://example.test/import/", pathname: "/import/", search: ""};
  const move = (_state, _title, url) => Object.assign(location, {
    href: new URL(url, location.href).href,
    pathname: new URL(url, location.href).pathname,
    search: new URL(url, location.href).search,
  });
  const element = {innerHTML: "", open: false, replaceChildren() {}};
  const importer = {isOpen: true, close() { this.isOpen = false; }, open() { this.isOpen = true; }};
  const lifecycle = stripTypeScriptTypes(
    app.slice(app.indexOf("function tabFromUrl()"), app.indexOf("let saveTimer:")) +
    app.slice(app.indexOf("let pendingRun:"), app.indexOf("export function mount(")),
  );
  const page = runInNewContext(lifecycle + `
    pendingImport = true;
    pendingRun = "imported";
    ({render, syncRuns, pending: () => ({pendingRun, pendingImport})});`, {
    URL, URLSearchParams, IMPORT_PATH, PATHS, SETTINGS: ["settings", "devices"], APP_PATHS: ["/", ...Object.values(PATHS)], shownTab: "import", loadDevices() {},
    location, ui, bridge, raw: bridge,
    run: old, opening: null, pendingImport: false, saveImport: importer,
    importPage: {contains: () => false}, document: {activeElement: null},
    history: {pushState: move, replaceState: move},
    root: {classList: {toggle() {}}, querySelector: () => null}, $: () => element,
    VIEWS: {playthroughs: () => "", dex: () => ""},
    partner: () => "", esc: value => value, trainerName: () => "Trainer",
    switcher: () => "", tabButtons: () => "", SETTINGS_ICON: "",
    fillSheet() {}, moveGuestRuns() {}, moveGuestAvatar() {}, flash() {},
    store: {get: () => "old"}, closeRun() {}, useRun: row => opened.push(row.id),
  });
  if (destination !== "stay") {
    ui.tab = "playthroughs";
    page.render();
    if (destination === "fresh-import") {
      ui.tab = "import";
      page.render();
    }
  }
  bridge.runs = [old, imported];
  page.syncRuns();
  assert.equal(ui.tab, destination === "stay" ? "dex" : destination === "dashboard" ? "playthroughs" : "import", `${destination}: a delayed account row must respect leaving the import visit`);
  assert.deepEqual(opened, destination === "stay" ? ["imported"] : []);
  assert.equal(ui.filter, destination === "stay" ? "caught" : undefined);
  assert.equal(page.pending().pendingRun, null);
  assert.equal(page.pending().pendingImport, false);
}
console.log("delayed import navigation ok");

const parts = readFileSync(new URL("../client/parts.ts", import.meta.url), "utf8");
const placeCard = runInNewContext(stripTypeScriptTypes(parts.slice(parts.indexOf("export function placeCard("), parts.indexOf("// Places in a chapter"))).replace("export ", "") + "\nplaceCard", {
  isHere: () => false, fold: () => "", R: () => ({}),
  monRow: () => "", subFold: () => "", strip: () => "", CHEV: "",
});
const card = placeCard("Route 29", {now: [], later: [{}, {}, {}], got: 4, caught: [], once: []});
assert(!card.includes("donepl") && !card.includes("quietpl"));
assert(card.includes("mini-meter") && card.includes("<b>4</b> / 7") && card.includes("3 later"));

for (const [tab, path] of [["journey", "/journey/"], ["dex", "/pokedex/"], ["boxes", "/boxes/"], ["settings", "/settings/"], ["playthroughs", "/"]]) {
  const location = {href: "https://example.test/?tab=" + tab, pathname: "/", search: "?tab=" + tab};
  const replaced = [];
  const routing = app.slice(app.indexOf("  const url = new URL(location.href);"), app.indexOf("  document.title = onImport"));
  runInNewContext(routing, {URL, location, ui: {tab}, onImport: false, PATHS, APP_PATHS: ["/", ...Object.values(PATHS)], IMPORT_PATH, tabFromUrl: () => tab, history: {state: null, replaceState: (_s, _t, url) => replaced.push(url.pathname + url.search), pushState: () => assert.fail("legacy links must replace history")}});
  assert.deepEqual(replaced, [path]);
}
