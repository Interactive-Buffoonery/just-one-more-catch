import { esc } from "./dom";
import { imageUrl } from "./image-url.ts";
import { VERSIONS, type GameData } from "./packs";
import type { Bridge } from "./types";
import type { VersionId } from "../shared/versions";
import { MAX_RUNS } from "../shared/limits";
declare const __SAVE_READER_VERSION__: string;

const MAX_FILE_BYTES = 64 * 1024 * 1024;
const PRIVACY = "Your save file stays in your browser. It isn't uploaded to our servers.";
const BALL = '<span class="si-ball" aria-hidden="true"><svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3"><circle cx="32" cy="32" r="27"/><path d="M5 32h18m18 0h18"/><circle cx="32" cy="32" r="9"/></svg></span>';
const VERSION_MAP: Record<string, VersionId[]> = {
  C: ["crystal"], FR: ["firered", "firered-switch"], LG: ["leafgreen", "leafgreen-switch"],
  HG: ["heartgold"], SS: ["soulsilver"], US: ["ultrasun"], UM: ["ultramoon"],
};

type Snapshot = {
  status: "ok";
  schemaVersion: number;
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
  complete(id: string): void;
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

export class SaveImport {
  private seq = 0;
  private reader?: Reader;
  private abort?: AbortController;
  private file?: File;
  private snapshot?: Snapshot;
  private preview?: ReturnType<typeof caughtForPack> & { version: VersionId };
  private target = "";
  private importId = "";
  private active = false;
  private committing = false;
  private retry?: () => void;
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
      }
    });
    host.addEventListener("change", (event) => {
      const input = event.target as HTMLInputElement;
      if (this.active && input.matches("input[type=file]") && input.files?.[0])
        void this.inspect(input.files[0]);
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
  get busy() { return this.committing; }
  open() {
    this.active = true;
    this.target = importTarget(this.options.bridge());
    this.choose();
  }
  close() {
    this.active = false;
    this.stop();
    this.file = this.snapshot = this.preview = undefined;
  }
  accountChanged() {
    if (!this.active || importTarget(this.options.bridge()) === this.target) return;
    this.stop();
    this.file = this.snapshot = this.preview = undefined;
    if (!this.committing) this.problem("Your account changed", "Choose your save again to import into your current account or browser.", () => this.open(), "Start again");
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
    const heading = host.querySelector<HTMLElement>("#sheet-title");
    heading?.setAttribute("tabindex", "-1");
    heading?.focus();
    const live = document.getElementById("live");
    if (live) live.textContent = title;
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
    this.file = this.snapshot = this.preview = undefined;
    if ((this.options.bridge().runs?.length ?? 0) >= MAX_RUNS)
      return this.problem("Your Dashboard is full", "Delete a playthrough to make room, then try importing again.");
    this.show(`<h2 class="lg" id="sheet-title">Import a save</h2>
      <div class="si-drop">${BALL}<p>Drop your save file here</p><button class="app-primary" data-import-action="choose">Choose save file</button><input class="sr" type="file" aria-label="Choose save file" tabindex="-1"></div>
      <p class="si-privacy">${PRIVACY}</p>
      <div class="si-works"><b>Works with</b><p>Crystal · FireRed · LeafGreen · HeartGold · SoulSilver · Ultra Sun · Ultra Moon</p></div>
      <p class="small muted"><a href="/save-reader/${__SAVE_READER_VERSION__}/README.md" target="_blank" rel="noopener">Importer credits and source</a></p>
      <button class="app-quiet" data-import-action="close">Not now</button>`, "Import a save");
  }
  private loading(stage: number, progress?: { loaded: number; total: number }) {
    const keepCancel = this.options.host.querySelector("[data-import-action=cancel]") === document.activeElement;
    const title = stage === 0 ? "Preparing importer" : "Reading your save";
    const percent = progress && progress.total > 0 ? Math.min(100, Math.floor(progress.loaded / progress.total * 100)) : undefined;
    this.show(`${this.steps(stage)}<div class="si-loading">${BALL}</div><h2 class="lg" id="sheet-title">${title}</h2><p class="si-file">${esc(this.file?.name ?? "")}</p>
      <div class="si-progress"><div class="si-bar${percent === undefined ? " ind" : ""}" role="progressbar" aria-labelledby="sheet-title"${percent === undefined ? "" : ` aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percent}"`}><i style="width:${percent ?? 38}%"></i></div><span class="si-percent">${percent === undefined ? "" : `${percent}%`}</span></div>
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
          this.show(`${this.steps(1)}<h2 class="lg" id="sheet-title">Which game is this?</h2><div class="si-choices">${formats.map((f) => `<button class="chip" data-import-action="format" data-format="${esc(f.id)}">${esc(f.name)}</button>`).join("")}</div><button class="app-quiet" data-import-action="close">Not now</button>`, "Choose your game");
          return;
        }
        return this.problem("Couldn't read that file", result.code === "unsupported-pokedex" ? "Caught Pokémon aren't supported for this save format yet. Nothing was imported." : "Choose an in-game save file. Save states and ROM files won't work.", () => this.choose(), "Choose another file");
      }
      this.snapshot = result;
      const versions = importVersions(result);
      if (!versions.length)
        return this.problem(`${result.game.name} isn't here yet`, "This game doesn't have a supported playthrough yet. Nothing was imported.", () => this.choose(), "Choose another file");
      if (versions.length === 1) await this.selectVersion(versions[0]);
      else this.show(`${this.steps(2)}<h2 class="lg" id="sheet-title">Which game did you play?</h2><div class="si-choices">${versions.map((id) => `<button class="chip" data-import-action="version" data-version="${id}">${esc(VERSIONS[id].name)}${VERSIONS[id].platform ? ` (${esc(VERSIONS[id].platform)})` : ["firered", "leafgreen"].includes(id) ? " (Game Boy Advance)" : ""}</button>`).join("")}</div><button class="app-quiet" data-import-action="close">Not now</button>`, "Choose your game");
    } catch {
      if (!this.valid(seq)) return;
      this.problem(stage === "load" ? "Importer didn't load" : "Couldn't read that file", stage === "load" ? "Check your connection and try again." : "Choose an in-game save file. Save states and ROM files won't work.", stage === "load" ? () => void this.read(formatId) : () => this.choose(), stage === "load" ? "Try again" : "Choose another file");
    } finally {
      if (this.valid(seq)) { this.reader?.dispose(); this.reader = undefined; }
    }
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
      this.ready();
    } catch {
      if (this.valid(seq)) this.problem("Couldn't prepare the preview", "The game data may not have loaded. Nothing was imported.", () => void this.selectVersion(version));
    }
  }
  private ready() {
    const p = this.preview!;
    const v = VERSIONS[p.version];
    this.show(`${this.steps(2)}<span class="si-box" data-game="${p.version}"><img class="cover" src="${imageUrl(`/covers/${v.cover ?? v.short.toLowerCase()}.jpg`)}" alt="${esc(v.name)} box art" width="120" height="120"></span>
      <p class="si-eyebrow">Ready to import</p><h2 class="lg" id="sheet-title">${esc(v.name)}${v.platform ? ` <span class="tag plain">${esc(v.platform)}</span>` : ""}</h2>
      <div class="si-count"><p class="lead"><b>${p.caught.length}</b> of ${v.pack.national} caught</p><span class="meter" aria-hidden="true"><i style="width:${p.caught.length / v.pack.national * 100}%"></i></span></div>
      <div class="si-sprites" aria-hidden="true">${p.caught.slice(0, 6).map((n) => `<img src="${imageUrl(`/sprites/${v.pack.art}/${n}.png`)}" alt="" width="44" height="44">`).join("")}${p.caught.length > 6 ? `<span>+${p.caught.length - 6}</span>` : ""}</div>
      <ul class="si-facts"><li>${PRIVACY}</li><li>This tool imports your caught Pokémon only. Story progress and notes aren't imported.</li><li>We create a new playthrough with your caught Pokémon marked.</li></ul>
      ${p.skipped ? `<p class="small muted">${p.skipped} species not recognized, skipped.</p>` : ""}${p.partial ? '<p class="small muted">This save has partial Pokédex coverage. Some caught Pokémon may be missing.</p>' : ""}
      ${this.actions("Create new playthrough", "create")}`, "Ready to import");
  }
  private problem(title: string, body: string, retry?: () => void, label = "Try again") {
    this.retry = retry;
    this.show(`<span class="si-oops" aria-hidden="true">!</span><h2 class="lg" id="sheet-title">${esc(title)}</h2><p>${esc(body)}</p>
      <p class="si-help">Having trouble with a save file? <a href="/contact/">Contact us</a> with more information and we'll try to help.</p>
      ${retry ? this.actions(label, "retry") : '<button class="app-quiet" data-import-action="close">Not now</button>'}`, title);
  }
  private async create() {
    if (this.committing || !this.preview) return;
    if (importTarget(this.options.bridge()) !== this.target) { this.accountChanged(); return; }
    const preview = this.preview;
    const target = this.target;
    this.committing = true;
    this.options.host.querySelectorAll<HTMLButtonElement>("button").forEach((b) => b.disabled = true);
    this.options.host.querySelector("[data-import-action=create]")!.textContent = "Creating…";
    try {
      await this.options.flush();
      const bridge = this.options.bridge();
      if (importTarget(bridge) !== target) throw new Error("Account changed");
      const id = await bridge.importRun(preview.version, preview.caught, this.importId);
      if (importTarget(this.options.bridge()) !== target) {
        this.problem("Your account changed", "The playthrough was created in the account you confirmed. Switch back to see it.", () => this.open(), "Start again");
        return;
      }
      this.committing = false;
      this.options.complete(id);
    } catch {
      if (importTarget(this.options.bridge()) !== target)
        this.problem("Your account changed", "Choose your save again before importing into your current account or browser.", () => this.open(), "Start again");
      else this.problem("Couldn't create the playthrough", "Your preview is still here. Check your connection or browser storage and try again.", () => this.ready(), "Back to preview");
    } finally { this.committing = false; }
  }
}
