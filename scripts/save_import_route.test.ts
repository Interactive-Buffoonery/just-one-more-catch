import { afterEach, beforeEach, expect, test, vi } from "vitest";
import type { Bridge } from "../client/types";

const reader = vi.hoisted(() => ({ create: vi.fn() }));
vi.mock("@serabi/pokemon-save-reader", () => ({ createSaveReader: reader.create }));
const { SaveImport, importTarget } = await import("../client/save-import");

type Pending = { preview: unknown; importId: string; create(): Promise<void>; inspect(file: File): Promise<void> };
const deferred = <T>() => {
  let resolve!: (value: T) => void, reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
};
const tick = () => new Promise((r) => setTimeout(r, 0));
const snapshot = { status: "ok", schemaVersion: 1, game: { version: "HG", versions: ["HG"], name: "HeartGold", formatId: "pkhex" }, pokedex: { status: "available", coverage: "complete", speciesNamespace: "national-dex", caughtSpecies: [25], warnings: [] } };

function setup(flush = async () => {}) {
  const heading = { setAttribute: vi.fn(), focus: vi.fn() };
  const host = {
    innerHTML: "",
    addEventListener: vi.fn(),
    querySelectorAll: () => [],
    querySelector: (selector: string) => selector === "#import-title" ? heading : { textContent: "" },
  } as unknown as HTMLElement;
  const bridge = { auth: { isLoading: false, isAuthenticated: false }, runs: [], importRun: vi.fn() } as unknown as Bridge;
  const complete = vi.fn();
  const importer = new SaveImport({ host, bridge: () => bridge, flush, complete, dismiss: vi.fn() });
  const pending = importer as unknown as Pending;
  const confirm = () => {
    importer.open();
    pending.preview = { version: "heartgold", caught: [25], skipped: 0, partial: false };
    pending.importId = "d60f37e5-bef7-4e53-8726-1c964120c460";
  };
  return { host, bridge, complete, importer, pending, confirm };
}

beforeEach(() => {
  vi.stubGlobal("document", { getElementById: () => null, activeElement: null });
  vi.stubGlobal("location", { origin: "https://example.test" });
  vi.stubGlobal("__SAVE_READER_VERSION__", "test");
});
afterEach(() => { vi.unstubAllGlobals(); reader.create.mockReset(); });

test("leaving while the importer prepares aborts the download", async () => {
  const { importer, pending, host } = setup();
  const started = deferred<AbortSignal>();
  reader.create.mockImplementation(({ signal }) => { started.resolve(signal); return new Promise(() => {}); });
  importer.open();
  void pending.inspect(new File([new Uint8Array([1])], "HG.sav"));
  const signal = await started.promise;
  importer.close();
  expect(signal.aborted).toBe(true);
  expect(importer.isOpen).toBe(false);
  expect(host.innerHTML).toContain("Preparing importer");
});

test("leaving while a save is read disposes the worker and drops its result", async () => {
  const { importer, pending, host } = setup();
  const result = deferred<unknown>();
  const worker = { inspect: vi.fn(() => result.promise), dispose: vi.fn() };
  reader.create.mockResolvedValue(worker);
  importer.open();
  const reading = pending.inspect(new File([new Uint8Array([1])], "HG.sav"));
  await vi.waitFor(() => expect(worker.inspect).toHaveBeenCalled());
  importer.close();
  expect(worker.dispose).toHaveBeenCalled();
  importer.open();
  const fresh = host.innerHTML;
  expect(fresh).toContain("Choose save file");
  result.resolve(snapshot);
  await reading;
  await tick();
  expect(host.innerHTML).toBe(fresh);
  expect(pending.preview).toBeUndefined();
});

test("leaving before the mutation starts never creates a playthrough", async () => {
  const flushed = deferred<void>();
  const { importer, pending, bridge, complete, confirm } = setup(() => flushed.promise);
  confirm();
  const creating = pending.create();
  importer.close();
  flushed.resolve();
  await creating;
  expect(bridge.importRun).not.toHaveBeenCalled();
  expect(complete).not.toHaveBeenCalled();
});

test("a commit that lands after leaving reports it without reopening the old preview", async () => {
  const { importer, pending, bridge, complete, host, confirm } = setup();
  const run = deferred<string>();
  vi.mocked(bridge.importRun).mockReturnValue(run.promise);
  confirm();
  const creating = pending.create();
  await vi.waitFor(() => expect(bridge.importRun).toHaveBeenCalledTimes(1));
  importer.close();
  importer.open();
  const fresh = host.innerHTML;
  expect(fresh).toContain("Choose save file");
  run.resolve("run-1");
  await creating;
  expect(complete).toHaveBeenCalledExactlyOnceWith("run-1", false);
  expect(host.innerHTML).toBe(fresh);
  expect(bridge.importRun).toHaveBeenCalledTimes(1);
});

test("a commit that fails after leaving stays quiet", async () => {
  const { importer, pending, bridge, complete, host, confirm } = setup();
  const run = deferred<string>();
  vi.mocked(bridge.importRun).mockReturnValue(run.promise);
  confirm();
  const creating = pending.create();
  await vi.waitFor(() => expect(bridge.importRun).toHaveBeenCalled());
  importer.close();
  const left = host.innerHTML;
  run.reject(new Error("offline"));
  await creating;
  expect(complete).not.toHaveBeenCalled();
  expect(host.innerHTML).toBe(left);
});

test("a confirmed commit stays bound to its session and double clicks import once", async () => {
  const { pending, bridge, complete, confirm } = setup();
  vi.mocked(bridge.importRun).mockResolvedValue("run-2");
  confirm();
  expect(importTarget(bridge)).toBe("guest");
  await Promise.all([pending.create(), pending.create()]);
  expect(bridge.importRun).toHaveBeenCalledTimes(1);
  expect(complete).toHaveBeenCalledExactlyOnceWith("run-2", true);
});
