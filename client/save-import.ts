import { announce, esc } from "./dom";
import { imageUrl } from "./image-url.ts";
import { VERSIONS, type GameData } from "./packs";
import type { Bridge, RunRow } from "./types";
import type { VersionId } from "../shared/versions";
import { MAX_RUNS } from "../shared/limits";
import { caughtOf, newSaveSalt, saveFingerprint, validateImportStart, validLink, DIFFERENT_SAVE, RUN_MOVED, type SaveLink } from "../shared/save-import";
import type { InspectSuccess } from "@serabi/pokemon-save-reader";
declare const __SAVE_READER_VERSION__: string;

const MAX_FILE_BYTES = 64 * 1024 * 1024;
const PRIVACY = "Your save file stays in your browser. It isn't uploaded to our servers.";
const BALL = '<span class="si-ball" aria-hidden="true"><svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="21" fill="var(--surface)"/><path d="M3 24a21 21 0 0 1 42 0z" fill="var(--pink)"/><circle cx="24" cy="24" r="21" fill="none" stroke="currentColor" stroke-width="3"/><path d="M3 24h14M31 24h14" stroke="currentColor" stroke-width="3"/><circle cx="24" cy="24" r="7" fill="var(--surface)" stroke="currentColor" stroke-width="3"/></svg></span>';
const LOCK = '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="2.5" y="7" width="11" height="7.5" rx="2" fill="currentColor"/><path d="M5 7V5a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
const TICK = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5l3.2 3.2L13 4.8" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const WARN = '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="7" fill="currentColor"/><path d="M8 4v5" stroke="var(--bg)" stroke-width="2" stroke-linecap="round"/><circle cx="8" cy="11.6" r="1.1" fill="var(--bg)"/></svg>';
const WORKS = `<p class="eyebrow">Works with</p><div class="tags">${["Red", "Blue", "Yellow", "Gold", "Silver", "Crystal", "FireRed", "LeafGreen", "Ruby", "Sapphire", "Emerald", "HeartGold", "SoulSilver", "Ultra Sun", "Ultra Moon", "Black", "White", "X", "Y", "Diamond", "Pearl", "Black 2", "White 2", "Platinum", "Sun", "Moon", "Omega Ruby", "Alpha Sapphire"].map((g) => `<span class="tag plain">${g}</span>`).join("")}</div>`;
const CHOOSE_ANOTHER = '<button class="app-quiet si-wide" data-import-action="cancel">Choose another file</button>';
const NOT_NOW = '<button class="app-quiet si-wide" data-import-action="close">Not now</button>';
const VERSION_MAP: Record<string, VersionId[]> = {
  RD: ["red"], BU: ["blue"], YW: ["yellow"], GD: ["gold"], SI: ["silver"],
  C: ["crystal"], FR: ["firered", "firered-switch"], LG: ["leafgreen", "leafgreen-switch"], E: ["emerald"],
  R: ["ruby"], S: ["sapphire"], HG: ["heartgold"], SS: ["soulsilver"], B: ["black"], W: ["white"], US: ["ultrasun"], UM: ["ultramoon"], X: ["x"], Y: ["y"], D: ["diamond"], P: ["pearl"], B2: ["black-2"], W2: ["white-2"], Pt: ["platinum"], SN: ["sun"], MN: ["moon"], OR: ["omega-ruby"], AS: ["alpha-sapphire"],
};

type Snapshot = {
  status: "ok";
  schemaVersion: number;
  startDate?: string;
  trainer?: InspectSuccess["trainer"];
  playSeconds?: InspectSuccess["playSeconds"];
  game: { version: string; versions: string[]; name: string; formatId: string };
  pokedex: { status: string; coverage: string; speciesNamespace: string; caughtSpecies: number[]; warnings: string[] };
};
type Result = Snapshot | {
  status: "error"; code: string; message: string;
  candidateFormats?: { id: string; name: string }[];
  pkhexGame?: string;
};
type Reader = {
  inspect(bytes: Uint8Array, options: { fileName: string; formatId?: string }): Promise<Result>;
  dispose(): void;
};
type Options = {
  host: HTMLElement;
  bridge(): Bridge;
  flush(): Promise<void>;
  complete(id: string, current: boolean): void;
  refreshed(id: string, added: number[], previousStart: number | undefined, previousLink: SaveLink | undefined, current: boolean): void;
  dismiss(): void;
};
export const importTarget = (b: Bridge) => b.auth.isLoading ? "loading" :
  b.auth.isAuthenticated ? `account:${b.auth.userId ?? "unknown"}` : "guest";
export function importVersions(snapshot: Snapshot): VersionId[] {
  if (snapshot.game.formatId !== "pkhex") return [];
  return [...new Set(snapshot.game.versions.flatMap((v) => VERSION_MAP[v] ?? []))];
}
export function caughtForPack(snapshot: Snapshot, version: VersionId, data: GameData) {
  const dex = snapshot.pokedex;
  if (snapshot.schemaVersion !== 1 || dex.status !== "available" ||
      dex.speciesNamespace !== "national-dex" || !["complete", "partial"].includes(dex.coverage) ||
      !Array.isArray(dex.caughtSpecies) || dex.caughtSpecies.length > 2000 ||
      dex.caughtSpecies.some((n) => !Number.isInteger(n) || n < 1 || n > 2000) ||
      !importVersions(snapshot).includes(version)) throw new Error("Unsupported Pokédex");
  const known = new Set(data.dex.map((p) => p.n));
  const all = [...new Set(dex.caughtSpecies)];
  const caught = all.filter((n) => known.has(n) && n <= VERSIONS[version].pack.national).sort((a, b) => a - b);
  return { caught, skipped: all.length - caught.length, partial: dex.coverage === "partial" };
}

function trainerOf(snapshot: Snapshot) {
  const t = snapshot.trainer;
  if (!t || !Number.isInteger(t.id32) || t.id32 < 0 || t.id32 > 0xffffffff || typeof t.name !== "string" || t.name.length > 64) return;
  const playSeconds = Number.isSafeInteger(snapshot.playSeconds) && snapshot.playSeconds! >= 0 ? snapshot.playSeconds : undefined;
  return { ...t, playSeconds };
}
export async function newSaveLink(snapshot: Snapshot, version: VersionId, salt = newSaveSalt()): Promise<SaveLink | undefined> {
  const t = trainerOf(snapshot);
  if (!t) return;
  return { salt, fingerprint: await saveFingerprint(salt, version, t.id32, t.name), ...(t.playSeconds !== undefined ? { playSeconds: t.playSeconds } : {}) };
}
export type RefreshCheck = { status: "unlinked" | "link" | "same" | "older" | "different"; link?: SaveLink };
export async function refreshCheck(snapshot: Snapshot, version: VersionId, current?: SaveLink): Promise<RefreshCheck> {
  const link = await newSaveLink(snapshot, version, current?.salt);
  if (!link) return { status: "unlinked" };
  if (!current) return { status: "link", link };
  if (link.fingerprint !== current.fingerprint) return { status: "different" };
  const older = link.playSeconds !== undefined && current.playSeconds !== undefined && link.playSeconds < current.playSeconds;
  return { status: older ? "older" : "same", link };
}
export async function matchingRun(snapshot: Snapshot, version: VersionId, links: ({ id: string } & SaveLink)[]) {
  const prints = await Promise.all(links.map((l) => newSaveLink(snapshot, version, l.salt)));
  return links.find((l, i) => prints[i]?.fingerprint === l.fingerprint)?.id;
}
const dayOf = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
export function importDate(day: string): number | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return;
  const [y, m, d] = day.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  if (dayOf(date) !== day) return;
  try { validateImportStart(date.getTime()); } catch { return; }
  return date.getTime();
}
const recordedStart = (snapshot: Snapshot, today: string) =>
  typeof snapshot.startDate === "string" && importDate(snapshot.startDate) !== undefined && snapshot.startDate <= today ? snapshot.startDate : undefined;
const coverOf = (version: VersionId) => imageUrl(`/covers/${VERSIONS[version].cover ?? VERSIONS[version].short.toLowerCase()}.jpg`);
const longDate = (day: string) => new Date(importDate(day)!).toLocaleDateString(undefined, { dateStyle: "long" });
type DateSource = "recorded" | "today" | "picked";
const CALENDAR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 2v6M16 2v6"/></svg>';

export class SaveImport {
  private seq = 0;
  private reader?: Reader;
  private abort?: AbortController;
  private file?: File;
  private snapshot?: Snapshot;
  private preview?: ReturnType<typeof caughtForPack> & { version: VersionId };
  private recordedDay?: string;
  private importDay = "";
  private selectedDay = "";
  private dateSource: DateSource = "today";
  private draftDay = "";
  private draftSource: DateSource = "today";
  private confirmedStart?: number;
  private target = "";
  private importId = "";
  private active = false;
  private session = 0;
  private committing = false;
  private retry?: () => void;
  private refreshId?: string;
  private updating = false;
  private refresh?: RefreshCheck & { row: RunRow; previous?: SaveLink; version: VersionId; caught: number[]; added: number[]; have: number; skipped: number; partial: boolean; recordedDay?: string; useDate: boolean };
  private match?: RunRow;
  private importLink?: SaveLink;
  constructor(private options: Options) {
    const host = options.host;
    host.addEventListener("click", (event) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-import-action]");
      if (!this.active || !button || button.disabled) return;
      switch (button.dataset.importAction) {
        case "choose": (host.querySelector("input[type=file]") as HTMLInputElement).click(); break;
        case "cancel": this.choose(); break;
        case "close": options.dismiss(); break;
        case "retry": this.retry?.(); break;
        case "version": void this.selectVersion(button.dataset.version as VersionId); break;
        case "format": void this.read(button.dataset.format); break;
        case "create": void this.create(); break;
        case "refresh": void this.commitRefresh(); break;
        case "update": if (this.match) void this.prepareRefresh(this.match); break;
        case "as-new":
          this.refreshId = undefined;
          this.updating = false;
          document.title = "Import a save | Just One More Catch";
          if ((options.bridge().runs?.length ?? 0) >= MAX_RUNS) this.full();
          else void this.route();
          break;
        case "date-change":
          if (this.confirmedStart !== undefined) break;
          this.draftDay = this.selectedDay; this.draftSource = this.dateSource;
          this.ready(true); break;
        case "date-cancel": this.ready(); this.focusDate(); break;
        case "date-recorded":
          if (this.recordedDay && this.confirmedStart === undefined) {
            this.selectedDay = this.recordedDay; this.dateSource = "recorded";
            this.ready(); this.focusDate();
          }
          break;
        case "date-option":
          this.draftSource = button.dataset.source === "recorded" ? "recorded" : "today";
          this.draftDay = this.draftSource === "recorded" ? this.recordedDay! : this.importDay;
          this.ready(true); break;
        case "date-use":
          if (this.confirmedStart !== undefined || importDate(this.draftDay) === undefined || this.draftDay > dayOf(new Date())) break;
          this.selectedDay = this.draftDay; this.dateSource = this.draftSource;
          this.ready(); this.focusDate(); break;
      }
    });
    host.addEventListener("change", (event) => {
      const input = event.target as HTMLInputElement;
      if (this.active && input.matches("input[type=file]") && input.files?.[0])
        void this.inspect(input.files[0]);
      if (this.active && this.refresh && input.matches("[data-import-date]")) this.refresh.useDate = input.checked;
    });
    host.addEventListener("dragover", (event) => {
      if (this.active && host.querySelector(".si-drop")) { event.preventDefault(); }
    });
    host.addEventListener("drop", (event) => {
      if (!this.active || !host.querySelector(".si-drop")) return;
      event.preventDefault();
      if (event.dataTransfer?.files.length === 1) void this.inspect(event.dataTransfer.files[0]);
      else this.problem("Choose one save file", "Please select a single save file.", () => this.choose(), "Choose another file");
    });
  }
  get isOpen() { return this.active; }
  get refreshing() { return this.refreshId; }
  open(refreshId?: string) {
    this.refreshId = refreshId;
    this.active = true;
    this.session++;
    this.committing = false;
    this.target = importTarget(this.options.bridge());
    this.choose();
  }
  close() {
    this.active = false;
    this.session++;
    this.committing = false;
    this.stop();
    this.file = this.snapshot = this.preview = this.refresh = this.match = this.refreshId = undefined;
  }
  accountChanged() {
    if (!this.active || importTarget(this.options.bridge()) === this.target) return;
    this.stop();
    this.file = this.snapshot = this.preview = undefined;
    if (!this.committing) this.problem("Your account changed", "Choose your save again to import into your current account or browser.", ...this.startAgain());
  }
  private startAgain(): [() => void, string] {
    return this.refreshId ? [() => this.options.dismiss(), "Back to Dashboard"] : [() => this.open(), "Start again"];
  }
  private stop() {
    this.seq++;
    this.abort?.abort();
    this.abort = undefined;
    this.reader?.dispose();
    this.reader = undefined;
  }
  private valid(seq: number) {
    return this.active && seq === this.seq && importTarget(this.options.bridge()) === this.target;
  }
  private show(body: string, title: string) {
    const host = this.options.host;
    host.innerHTML = `<div class="save-import">${body}</div>`;
    const heading = host.querySelector<HTMLElement>("#import-title");
    heading?.setAttribute("tabindex", "-1");
    heading?.focus();
    announce(title);
  }
  private steps(stage: number) {
    return `<ol class="si-steps" aria-label="Import steps">${["Prepare", "Read", "Preview"].map((name, i) => `<li class="${i < stage ? "done" : i === stage ? "on" : ""}"${i === stage ? ' aria-current="step"' : ""}><i aria-hidden="true">${i < stage ? "✓" : i + 1}</i>${name}</li>`).join("")}</ol>`;
  }
  private actions(primary: string, action: string, cancel = "Not now") {
    return `<div class="hv-actions"><button class="app-primary" data-import-action="${action}">${primary}</button><button class="app-quiet" data-import-action="close">${cancel}</button></div>`;
  }
  private choose() {
    if (this.committing) return;
    this.stop();
    this.file = this.snapshot = this.preview = this.refresh = this.match = undefined;
    this.updating = false;
    if (!this.refreshId && (this.options.bridge().runs?.length ?? 0) >= MAX_RUNS) return this.full();
    const title = this.refreshId ? "Refresh from a save" : "Import a save";
    this.show(`<h1 class="lg" id="import-title">${title}</h1>
      <div class="si-drop">${BALL}<button class="app-primary" data-import-action="choose">Choose save file</button><span class="small muted">or drop it here</span><input class="sr" type="file" aria-label="Choose save file" tabindex="-1"></div>
      <p class="si-privacy">${LOCK}${PRIVACY}</p>
      ${WORKS}
      ${NOT_NOW}
      <p class="small muted si-credits"><a href="/about/#save-importer" target="_blank" rel="noopener">Importer credits and source</a></p>`, title);
  }
  private full() {
    this.problem("Your Dashboard is full", "Delete a playthrough to make room, then try importing again.");
  }
  private loading(stage: number, progress?: { loaded: number; total: number }) {
    const keepCancel = this.options.host.querySelector("[data-import-action=cancel]") === document.activeElement;
    const title = stage === 0 ? "Preparing importer" : "Reading your save";
    const percent = progress && progress.total > 0 ? Math.min(100, Math.floor(progress.loaded / progress.total * 100)) : undefined;
    this.show(`${this.steps(stage)}<div class="si-loading">${BALL}</div><h1 class="lg" id="import-title">${title}</h1><p class="si-file">${esc(this.file?.name ?? "")}</p>
      <div class="si-progress"><div class="si-bar${percent === undefined ? " ind" : ""}" role="progressbar" aria-labelledby="import-title"${percent === undefined ? "" : ` aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percent}"`}><i style="width:${percent ?? 38}%"></i></div><span class="si-percent" aria-hidden="true">${percent === undefined ? "" : `${percent}%`}</span></div>
      <button class="app-quiet" data-import-action="cancel">Cancel</button>`, title);
    if (keepCancel) this.options.host.querySelector<HTMLButtonElement>("[data-import-action=cancel]")?.focus();
  }
  private progress(progress: { loaded?: number; total?: number }) {
    const host = this.options.host;
    if (!progress.total || progress.loaded === undefined) return;
    const percent = Math.min(100, Math.floor(progress.loaded / progress.total * 100));
    const bar = host.querySelector<HTMLElement>(".si-bar");
    if (!bar) return;
    bar.classList.remove("ind");
    bar.setAttribute("aria-valuemin", "0"); bar.setAttribute("aria-valuemax", "100");
    bar.setAttribute("aria-valuenow", String(percent));
    (bar.firstElementChild as HTMLElement).style.width = `${percent}%`;
    host.querySelector(".si-percent")!.textContent = `${percent}%`;
  }
  private async inspect(file: File) {
    if (this.committing) return;
    this.stop();
    if (!file.size || file.size > MAX_FILE_BYTES)
      return this.problem("Couldn't read that file", file.size ? "That file is too large. Choose a save file smaller than 64 MB." : "That file is empty.", () => this.choose(), "Choose another file");
    this.file = file;
    await this.read();
  }
  private async read(formatId?: string) {
    if (!this.file || this.committing) return;
    this.stop();
    const seq = this.seq, file = this.file;
    const abort = this.abort = new AbortController();
    this.loading(0);
    let stage = "load";
    try {
      const { createSaveReader } = await import("@serabi/pokemon-save-reader");
      if (!this.valid(seq)) return;
      const reader = await createSaveReader({
        baseUrl: new URL(`/save-reader/${__SAVE_READER_VERSION__}/`, location.origin).href,
        signal: abort.signal,
        onProgress: (progress: { loaded?: number; total?: number }) => { if (this.valid(seq)) this.progress(progress); },
      });
      if (!this.valid(seq)) { reader.dispose(); return; }
      this.reader = reader;
      stage = "read";
      this.loading(1);
      const bytes = new Uint8Array(await file.arrayBuffer());
      if (!this.valid(seq)) return;
      const result = await reader.inspect(bytes, { fileName: file.name, formatId }) as Result;
      reader.dispose(); this.reader = undefined;
      if (!this.valid(seq)) return;
      if (result.status === "error") {
        if (result.code === "format-choice-required" && result.candidateFormats?.length) {
          const formats = result.pkhexGame
            ? [{ id: "pkhex", name: `Original game (${result.pkhexGame})` }, ...result.candidateFormats]
            : result.candidateFormats;
          this.show(`${this.steps(1)}<h1 class="lg" id="import-title">Which game is this?</h1><div class="si-choices">${formats.map((f) => `<button class="chip" data-import-action="format" data-format="${esc(f.id)}">${esc(f.name)}</button>`).join("")}</div>${NOT_NOW}`, "Choose your game");
          return;
        }
        return this.problem("Couldn't read that file", result.code === "unsupported-pokedex" ? "Caught Pokémon aren't supported for this save format yet. Nothing was imported." : "Choose an in-game save file. Save states and ROM files won't work.", () => this.choose(), "Choose another file");
      }
      this.snapshot = result;
      await this.route();
    } catch {
      if (!this.valid(seq)) return;
      this.problem(stage === "load" ? "Importer didn't load" : "Couldn't read that file", stage === "load" ? "Check your connection and try again." : "Choose an in-game save file. Save states and ROM files won't work.", stage === "load" ? () => void this.read(formatId) : () => this.choose(), stage === "load" ? "Try again" : "Choose another file");
    } finally {
      if (this.valid(seq)) { this.reader?.dispose(); this.reader = undefined; }
    }
  }
  private async route() {
    const snapshot = this.snapshot!, versions = importVersions(snapshot);
    if (!versions.length)
      return this.problem(`${snapshot.game.name} isn't here yet`, "This game doesn't have a supported playthrough yet. Nothing was imported.", () => this.choose(), "Choose another file");
    if (this.refreshId) {
      const row = this.options.bridge().runs?.find((r) => r.id === this.refreshId);
      if (!row) return this.problem("Couldn't prepare the preview", "This playthrough isn't here anymore. Nothing was imported.");
      if (!versions.includes(row.version as VersionId)) return this.different("This save is for a different game");
      return this.prepareRefresh(row);
    }
    if (versions.length === 1) await this.selectVersion(versions[0]);
    else this.show(`${this.steps(2)}<h1 class="lg" id="import-title">Which game did you play?</h1><div class="si-choices">${versions.map((id) => `<button class="chip" data-import-action="version" data-version="${id}">${esc(VERSIONS[id].name)}${VERSIONS[id].platform ? ` (${esc(VERSIONS[id].platform)})` : ["firered", "leafgreen"].includes(id) ? " (Game Boy Advance)" : ""}</button>`).join("")}</div>${NOT_NOW}`, "Choose your game");
  }
  private async selectVersion(version: VersionId) {
    if (!this.snapshot || this.committing || !importVersions(this.snapshot).includes(version)) return;
    const seq = ++this.seq, snapshot = this.snapshot;
    try {
      const data = await VERSIONS[version].pack.load();
      if (!this.valid(seq)) return;
      try { this.preview = { version, ...caughtForPack(snapshot, version, data) }; }
      catch {
        this.problem("Couldn't read caught Pokémon", "This save's Pokédex isn't supported yet. Nothing was imported.", () => this.choose(), "Choose another file");
        return;
      }
      this.importId = crypto.randomUUID();
      this.confirmedStart = undefined;
      this.importDay = dayOf(new Date());
      this.recordedDay = recordedStart(snapshot, this.importDay);
      this.selectedDay = this.recordedDay ?? this.importDay;
      this.dateSource = this.recordedDay ? "recorded" : "today";
      this.importLink = await newSaveLink(snapshot, version);
      const links = this.importLink ? await this.options.bridge().saveLinks(version) : [];
      const matched = await matchingRun(snapshot, version, links);
      if (!this.valid(seq)) return;
      this.match = this.options.bridge().runs?.find((r) => r.id === matched);
      this.ready();
    } catch {
      if (this.valid(seq)) this.problem("Couldn't prepare the preview", "The game data may not have loaded. Nothing was imported.", () => void this.selectVersion(version));
    }
  }
  private focusDate() {
    this.options.host.querySelector<HTMLButtonElement>("[data-import-action=date-change]")?.focus();
  }
  private dateBlock(editing: boolean) {
    const locked = this.confirmedStart !== undefined ? " disabled" : "";
    const recorded = this.recordedDay;
    const date = this.selectedDay;
    const label = this.dateSource === "recorded" ? "Recorded in your save" : this.dateSource === "picked" ? "Picked by you" : recorded ? "Recorded date not used" : "This save doesn't record a start date";
    return `<section class="si-start" aria-labelledby="si-start-label"><h2 class="eyebrow" id="si-start-label">Start date</h2>${editing ? `
      <div class="si-start-edit"><div class="si-start-opts" role="group" aria-label="Start date options">
      ${recorded ? `<button class="chip" data-import-action="date-option" data-source="recorded" aria-pressed="${this.draftSource === "recorded"}">Recorded in save · ${longDate(recorded)}</button>` : ""}
      <button class="chip" data-import-action="date-option" data-source="today" aria-pressed="${this.draftSource === "today"}">Import day</button></div>
      <calendar-date class="start-calendar" aria-label="Playthrough start date" value="${this.draftDay}" min="1970-01-01" max="${dayOf(new Date())}"><calendar-month></calendar-month></calendar-date>
      <p class="small muted" id="si-date-selected" aria-live="polite">${longDate(this.draftDay)}</p>
      <div class="hv-actions"><button class="app-quiet" data-import-action="date-cancel">Cancel</button><button class="app-primary" data-import-action="date-use">Use this date</button></div></div>` : `
      <div class="si-start-row">${CALENDAR}<div class="val">${this.dateSource === "today" && date === dayOf(new Date()) ? "Today, " : ""}${longDate(date)}<small>${label}</small></div>
      ${recorded && this.dateSource !== "recorded" ? `<button data-import-action="date-recorded"${locked}>Use recorded</button>` : ""}<button data-import-action="date-change"${locked}>Change</button></div>`}</section>`;
  }
  private head(version: VersionId, eyebrow: string) {
    const v = VERSIONS[version];
    return `${this.steps(2)}<span class="si-box" data-game="${version}"><img class="cover" src="${coverOf(version)}" alt="${esc(v.name)} box art" width="120" height="120"></span>
      <p class="eyebrow">${eyebrow}</p><h1 class="lg" id="import-title">${esc(v.name)}${v.platform ? ` <span class="tag plain">${esc(v.platform)}</span>` : ""}</h1>`;
  }
  private count(version: VersionId, caught: number) {
    const total = VERSIONS[version].pack.national;
    return `<div class="si-count"><p class="lead"><b>${caught}</b> of ${total} caught</p><span class="meter" aria-hidden="true"><i style="width:${caught / total * 100}%"></i></span></div>`;
  }
  private party(version: VersionId, caught: number[]) {
    return `<div class="si-party" aria-hidden="true">${caught.slice(0, 6).map((n) => `<img src="${imageUrl(`/sprites/${VERSIONS[version].pack.art}/${n}.png`)}" alt="" width="44" height="44">`).join("")}${caught.length > 6 ? `<span>+${caught.length - 6}</span>` : ""}</div>`;
  }
  private warnings(p: { skipped: number; partial: boolean }) {
    return `${p.skipped ? `<li class="warn">${WARN}${p.skipped} species not recognized, skipped</li>` : ""}${p.partial ? `<li class="warn">${WARN}This save has partial Pokédex coverage. Some caught Pokémon may be missing.</li>` : ""}${this.snapshot!.pokedex.warnings.map(warning => `<li class="warn">${WARN}${esc(warning)}</li>`).join("")}`;
  }
  private ready(editing = false) {
    const p = this.preview!, m = this.match;
    const v = VERSIONS[p.version];
    this.show(`${this.head(p.version, "Ready to import")}
      ${this.count(p.version, p.caught.length)}
      ${this.party(p.version, p.caught)}
      ${m ? `<section class="si-start" aria-labelledby="si-match-label"><h2 class="eyebrow" id="si-match-label">Your playthrough</h2><div class="si-start-row"><img class="cover" src="${coverOf(p.version)}" alt="" width="32" height="32"><div class="val">This looks like your ${esc(v.name)} playthrough<small>Started ${longDate(dayOf(new Date(m.createdAt)))} · ${m.summary.caught} caught</small></div></div></section>` : ""}
      ${m ? "" : this.dateBlock(editing)}
      <ul class="si-facts"><li>${LOCK}${PRIVACY}</li><li>${TICK}This tool imports your caught Pokémon${this.dateSource === "recorded" && !m ? " and start date" : ""} only. Story progress and notes aren't imported.</li>${m ? "" : `<li>${TICK}We create a new playthrough with your caught Pokémon marked.</li>`}${this.warnings(p)}</ul>
      ${editing ? "" : m ? `<div class="hv-actions"><button class="app-primary" data-import-action="update">Update it</button><button class="app-quiet" data-import-action="create">Create new playthrough</button></div>` : this.actions("Create new playthrough", "create")}`, "Ready to import");
    if (editing) {
      void import("cally");
      const calendar = this.options.host.querySelector<HTMLElement & { value: string }>(".start-calendar")!;
      calendar.addEventListener("change", () => {
        if (!this.active || this.committing || !calendar.isConnected) return;
        if (importDate(calendar.value) === undefined || calendar.value > dayOf(new Date())) return;
        this.draftDay = calendar.value; this.draftSource = "picked";
        this.options.host.querySelector("#si-date-selected")!.textContent = longDate(calendar.value);
        this.options.host.querySelectorAll("[data-source]").forEach((b) => b.setAttribute("aria-pressed", "false"));
      });
      this.options.host.querySelector<HTMLButtonElement>("[data-import-action=date-option]")?.focus();
    }
  }
  private different(title: string) {
    this.retry = undefined;
    this.show(`<span class="si-oops" aria-hidden="true">!</span><h1 class="lg" id="import-title">${esc(title)}</h1>${this.actions("Import as a new playthrough", "as-new")}${CHOOSE_ANOTHER}`, title);
  }
  private async prepareRefresh(stale: RunRow) {
    if (!this.snapshot || this.committing) return;
    const row = this.options.bridge().runs?.find((r) => r.id === stale.id) ?? stale;
    this.updating = true;
    const seq = ++this.seq, snapshot = this.snapshot, version = row.version as VersionId;
    try {
      const data = await VERSIONS[version].pack.load();
      if (!this.valid(seq)) return;
      let fromSave: ReturnType<typeof caughtForPack>;
      try { fromSave = caughtForPack(snapshot, version, data); }
      catch {
        this.problem("Couldn't read caught Pokémon", "This save's Pokédex isn't supported yet. Nothing was imported.", () => this.choose(), "Choose another file");
        return;
      }
      try { await this.options.flush(); }
      catch {
        if (this.valid(seq)) this.problem("Couldn't save", "Check your connection or browser storage and try again.", () => void this.prepareRefresh(row));
        return;
      }
      const bridge = this.options.bridge();
      const [state, links] = await Promise.all([bridge.getState(row.id), bridge.saveLinks(version)]);
      const found = links.find((l) => l.id === row.id);
      const current = validLink(found && { salt: found.salt, fingerprint: found.fingerprint, ...(found.playSeconds !== undefined ? { playSeconds: found.playSeconds } : {}) });
      const check = await refreshCheck(snapshot, version, current);
      if (!this.valid(seq)) return;
      if (check.status === "different") return this.different("This is a different save");
      const have = new Set(caughtOf(JSON.parse(state)));
      const recorded = recordedStart(snapshot, dayOf(new Date()));
      const recordedDay = recorded !== dayOf(new Date(row.createdAt)) ? recorded : undefined;
      this.refresh = { ...check, ...fromSave, row, previous: current, version, added: fromSave.caught.filter((n) => !have.has(n)), have: have.size, recordedDay, useDate: this.refresh?.row.id === row.id && this.refresh.useDate };
      this.refreshReady();
    } catch {
      if (!this.valid(seq)) return;
      if (!this.options.bridge().runs?.some((r) => r.id === row.id)) this.problem("Couldn't prepare the preview", "This playthrough isn't here anymore. Nothing was imported.");
      else this.problem("Couldn't prepare the preview", "The game data may not have loaded. Nothing was imported.", () => void this.prepareRefresh(row));
    }
  }
  private refreshReady() {
    const p = this.refresh!, n = p.added.length;
    const facts = (extra = "") => `<ul class="si-facts"><li>${LOCK}${PRIVACY}</li><li>${TICK}Already marked<span class="n">${p.have}</span></li>${extra}</ul>`;
    if (!n) return this.show(`${this.head(p.version, "Already up to date")}
      ${this.count(p.version, p.have)}
      ${facts()}<div class="hv-actions"><button class="app-primary" data-import-action="close">Back to Dashboard</button></div>`, "Already up to date");
    this.show(`${this.head(p.version, "Refresh from a save")}
      <div class="si-count"><p class="lead"><b>${n}</b> new caught</p></div>${this.party(p.version, p.added)}
      ${p.recordedDay ? `<section class="si-start" aria-labelledby="si-start-label"><h2 class="eyebrow" id="si-start-label">Start date</h2><label class="si-start-row"><input type="checkbox" data-import-date${p.useDate ? " checked" : ""}><span class="val">Use the date in your save: ${longDate(p.recordedDay)}<small>Current: ${longDate(dayOf(new Date(p.row.createdAt)))}</small></span></label></section>` : ""}
      ${facts(`${p.status === "older" ? `<li class="warn">${WARN}This save has less play time than the one you used last time.</li>` : ""}${this.warnings(p)}`)}
      ${this.actions(`Add ${n} caught Pokémon`, "refresh")}`, "Refresh from a save");
  }
  private async commitRefresh() {
    if (this.committing || !this.refresh?.added.length) return;
    if (importTarget(this.options.bridge()) !== this.target) { this.accountChanged(); return; }
    const p = this.refresh, { target, session } = this;
    const current = () => this.active && session === this.session;
    const startedAt = p.useDate && p.recordedDay ? importDate(p.recordedDay) : undefined;
    this.committing = true;
    this.options.host.querySelectorAll<HTMLButtonElement | HTMLInputElement>("button, input").forEach((b) => b.disabled = true);
    this.options.host.querySelector("[data-import-action=refresh]")!.textContent = "Adding…";
    announce("Adding…");
    try {
      await this.options.flush();
      const bridge = this.options.bridge();
      if (importTarget(bridge) !== target) throw new Error("Account changed");
      if (!current()) return;
      const { added } = await bridge.refreshRun(p.row.id, p.caught, p.link, startedAt);
      this.committing = false;
      const here = current() && importTarget(this.options.bridge()) === target;
      if (!added.length && startedAt === undefined) { if (here) void this.prepareRefresh(p.row); return; }
      this.options.refreshed(p.row.id, added, startedAt === undefined ? undefined : Date.parse(p.row.createdAt), p.previous, here);
    } catch (error) {
      if (!current()) return;
      const reason = (error as { data?: unknown })?.data ?? (error as Error)?.message;
      if (importTarget(this.options.bridge()) !== target)
        this.problem("Your account changed", "Choose your save again before importing into your current account or browser.", ...this.startAgain());
      else if (reason === DIFFERENT_SAVE) this.different("This is a different save");
      else if (reason === RUN_MOVED) this.problem("Couldn't add your caught Pokémon", "This playthrough isn't here anymore. Nothing was imported.");
      else this.problem("Couldn't add your caught Pokémon", "Your preview is still here. Check your connection or browser storage and try again.", () => void this.prepareRefresh(p.row), "Back to preview");
    } finally { if (session === this.session) this.committing = false; }
  }
  private problem(title: string, body: string, retry?: () => void, label = "Try again", file = label === "Choose another file") {
    this.retry = retry;
    if (this.refreshId || this.updating) body = body.replace("Nothing was imported.", "Nothing was added.");
    this.show(`<span class="si-oops" aria-hidden="true">!</span><h1 class="lg" id="import-title">${esc(title)}</h1><p class="muted">${esc(body)}</p>${file ? WORKS : ""}
      ${retry ? this.actions(label, "retry") : NOT_NOW}
      ${file ? `<p class="small muted si-help">Having trouble with a save file? <a href="/contact/">Contact us</a> with more information and we'll try to help.</p>` : ""}`, title);
  }
  private async create() {
    if (this.committing || !this.preview) return;
    if (importTarget(this.options.bridge()) !== this.target) { this.accountChanged(); return; }
    const { preview, target, importId, session } = this;
    const current = () => this.active && session === this.session;
    this.confirmedStart ??= importDate(this.selectedDay || dayOf(new Date()));
    const startedAt = this.confirmedStart;
    this.committing = true;
    this.options.host.querySelectorAll<HTMLButtonElement>("button").forEach((b) => b.disabled = true);
    this.options.host.querySelector("[data-import-action=create]")!.textContent = "Creating…";
    try {
      await this.options.flush();
      const bridge = this.options.bridge();
      if (importTarget(bridge) !== target) throw new Error("Account changed");
      if (!current()) return;
      const id = await bridge.importRun(preview.version, preview.caught, importId, startedAt, this.importLink);
      if (!current()) { this.options.complete(id, false); return; }
      if (importTarget(this.options.bridge()) !== target) {
        this.problem("Your account changed", "The playthrough was created in the account you confirmed. Switch back to see it.", () => this.open(), "Start again");
        return;
      }
      this.committing = false;
      this.options.complete(id, true);
    } catch {
      if (!current()) return;
      if (importTarget(this.options.bridge()) !== target)
        this.problem("Your account changed", "Choose your save again before importing into your current account or browser.", () => this.open(), "Start again");
      else this.problem("Couldn't create the playthrough", "Your preview is still here. Check your connection or browser storage and try again.", () => this.ready(), "Back to preview");
    } finally { if (session === this.session) this.committing = false; }
  }
}
