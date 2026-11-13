import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Bridge, RunRow } from "../client/types";

const reader = vi.hoisted(() => ({ create: vi.fn() }));
vi.mock("@serabi/pokemon-save-reader", () => ({ createSaveReader: reader.create }));
vi.mock("../client/game", () => ({
  bridge: {},
  store: {
    get: (key: string) => localStorage.getItem(key),
    set: (key: string, value: string) => localStorage.setItem(key, value),
    del: (key: string) => localStorage.removeItem(key),
  },
}));
const { SaveImport, refreshCheck, matchingRun, newSaveLink } = await import("../client/save-import");

type Snap = Parameters<typeof refreshCheck>[0];
const snap = (extra: Partial<Snap> = {}) => ({
  status: "ok", schemaVersion: 1,
  game: { version: "HG", versions: ["HG"], name: "HeartGold", formatId: "pkhex" },
  pokedex: { status: "available", coverage: "complete", speciesNamespace: "national-dex", caughtSpecies: [25], warnings: [] },
  ...extra,
}) as Snap;
const trainer = { id32: 123456, name: "Lyra" };
const status = async (extra: Partial<Snap>, link?: Awaited<ReturnType<typeof newSaveLink>>) => (await refreshCheck(snap(extra), "heartgold", link)).status;

describe("refresh decision table", () => {
  it("skips linking and checks when the reader gives no trainer", async () => {
    expect(await refreshCheck(snap(), "heartgold")).toEqual({ status: "unlinked" });
    expect(await status({ trainer: { id32: -1, name: "x" } })).toBe("unlinked");
  });
  it("links an unlinked run and compares play time on linked runs", async () => {
    const first = await refreshCheck(snap({ trainer, playSeconds: 100 }), "heartgold");
    expect(first.status).toBe("link");
    expect(first.link).toMatchObject({ playSeconds: 100 });
    expect(JSON.stringify(first.link)).not.toContain("Lyra");
    const link = first.link!;
    expect(await refreshCheck(snap({ trainer, playSeconds: 200 }), "heartgold", link)).toEqual({ status: "same", link: { ...link, playSeconds: 200 } });
    expect(await status({ trainer, playSeconds: 100 }, link)).toBe("same");
    expect(await status({ trainer }, link)).toBe("same");
    expect(await status({ trainer, playSeconds: 50 }, link)).toBe("older");
    expect(await status({ trainer, playSeconds: 0 }, link)).toBe("older");
    expect(await status({ trainer: { ...trainer, name: "Ethan" }, playSeconds: 300 }, link)).toBe("different");
    expect(await status({ trainer: { ...trainer, id32: 1 } }, link)).toBe("different");
  });
  it("finds the linked playthrough for an import", async () => {
    const link = (await newSaveLink(snap({ trainer }), "heartgold"))!;
    const other = (await newSaveLink(snap({ trainer: { ...trainer, name: "Ethan" } }), "heartgold"))!;
    expect(await matchingRun(snap({ trainer }), "heartgold", [{ id: "b", ...other }, { id: "a", ...link }])).toBe("a");
    expect(await matchingRun(snap({ trainer: { id32: 9, name: "Kris" } }), "heartgold", [{ id: "a", ...link }])).toBeUndefined();
  });
});

describe("refresh flow", () => {
  beforeEach(() => {
    vi.stubGlobal("document", { getElementById: () => null, activeElement: null });
    vi.stubGlobal("location", { origin: "https://example.test" });
    vi.stubGlobal("__SAVE_READER_VERSION__", "test");
    vi.stubGlobal("__IMAGE_VERSIONS__", new Proxy({}, { get: () => "v" }));
  });
  afterEach(() => { vi.unstubAllGlobals(); reader.create.mockReset(); });
  const setup = (version: string) => {
    const host = {
      innerHTML: "", addEventListener: vi.fn(), querySelectorAll: () => [],
      querySelector: () => ({ textContent: "", setAttribute: vi.fn(), focus: vi.fn() }),
    } as unknown as HTMLElement;
    const row: RunRow = { id: "run1", version, summary: { badges: [], caught: 1, party: [] }, createdAt: "2026-06-01T00:00:00.000Z" };
    const calls: string[] = [];
    let state = '{"caught":[1]}';
    const bridge = {
      auth: { isLoading: false, isAuthenticated: false },
      runs: [row],
      getState: vi.fn(async () => state),
      saveLinks: vi.fn(async () => []),
      refreshRun: vi.fn(async () => { calls.push("refresh"); state = '{"caught":[1,25]}'; return { added: [25] }; }),
    } as unknown as Bridge & { refreshRun: ReturnType<typeof vi.fn> };
    const refreshed = vi.fn();
    const importer = new SaveImport({ host, bridge: () => bridge, flush: async () => { calls.push("flush"); }, complete: vi.fn(), refreshed, dismiss: vi.fn() });
    const pending = importer as unknown as { snapshot: Snap; retry?: () => void; refresh?: { added: number[] }; inspect(f: File): Promise<void>; prepareRefresh(r: RunRow): Promise<void>; commitRefresh(): Promise<void> };
    return { host, bridge, importer, pending, refreshed, calls, row };
  };
  const preview = async (s: ReturnType<typeof setup>) => {
    s.importer.open("run1");
    s.pending.snapshot = snap();
    await s.pending.prepareRefresh(s.row);
    expect(s.pending.refresh?.added).toEqual([25]);
    expect(s.host.innerHTML).toContain("Add 1 caught Pokémon");
  };
  it("stops when the save is for a different game", async () => {
    const { host, bridge, importer, pending } = setup("red");
    reader.create.mockResolvedValue({ inspect: async () => snap(), dispose: vi.fn() });
    importer.open("run1");
    await pending.inspect(new File([new Uint8Array([1])], "HG.sav"));
    expect(host.innerHTML).toContain("This save is for a different game");
    expect(host.innerHTML).toContain("Import as a new playthrough");
    expect(host.innerHTML).toContain("Choose another file");
    expect(bridge.refreshRun).not.toHaveBeenCalled();
  });
  it("flushes before refreshing and reports the previous start and link for undo", async () => {
    const s = setup("heartgold");
    await preview(s);
    Object.assign(s.pending.refresh!, { recordedDay: "2026-05-03", useDate: true });
    await s.pending.commitRefresh();
    expect(s.calls).toEqual(["flush", "flush", "refresh"]);
    expect(s.refreshed).toHaveBeenCalledWith("run1", [25], Date.parse(s.row.createdAt), undefined, true);
  });
  it("re-reads the playthrough after a commit that landed but looked failed", async () => {
    const s = setup("heartgold");
    await preview(s);
    s.bridge.refreshRun.mockImplementationOnce(async () => { await s.bridge.refreshRun(); throw new Error("Response lost"); });
    await s.pending.commitRefresh();
    expect(s.host.innerHTML).toContain("Back to preview");
    s.pending.retry!();
    await vi.waitFor(() => expect(s.host.innerHTML).toContain("Already up to date"));
    expect(s.host.innerHTML).not.toContain("data-import-action=\"refresh\"");
    expect(s.refreshed).not.toHaveBeenCalled();
  });
  it("shows up to date when the server adds nothing", async () => {
    const s = setup("heartgold");
    await preview(s);
    s.bridge.refreshRun.mockImplementationOnce(async () => { await s.bridge.refreshRun(); return { added: [] }; });
    await s.pending.commitRefresh();
    await vi.waitFor(() => expect(s.host.innerHTML).toContain("Already up to date"));
    expect(s.refreshed).not.toHaveBeenCalled();
  });
  it("maps commit errors to the matching screen", async () => {
    const s = setup("heartgold");
    await preview(s);
    s.bridge.refreshRun.mockRejectedValueOnce(Object.assign(new Error("Server Error"), { data: "Different save" }));
    await s.pending.commitRefresh();
    expect(s.host.innerHTML).toContain("This is a different save");
    expect(s.host.innerHTML).toContain("Choose another file");
    await preview(s);
    s.bridge.refreshRun.mockRejectedValueOnce(new Error("Uncaught ConvexError: This playthrough moved"));
    await s.pending.commitRefresh();
    expect(s.host.innerHTML).toContain("This playthrough isn't here anymore. Nothing was added.");
  });
});

describe("guest refresh undo and move", () => {
  afterEach(() => vi.unstubAllGlobals());
  const setup = async () => {
    vi.resetModules();
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: vi.fn((key: string, value: string) => { values.set(key, value); }),
      removeItem: (key: string) => { values.delete(key); },
    };
    vi.stubGlobal("localStorage", storage);
    const mod = await import("../client/guest");
    const guest = mod.withGuest({ auth: { isLoading: false, isAuthenticated: false }, track: vi.fn() } as unknown as Bridge, vi.fn());
    return { ...mod, guest, storage };
  };
  const link = { salt: "a".repeat(32), fingerprint: "b".repeat(64), playSeconds: 100 };
  it("restores caught, start date and link in one write", async () => {
    const { guest, guestRows, storage } = await setup();
    const id = await guest.importRun("red", [1, 4], "d60f37e5-bef7-4e53-8726-1c964120c460", Date.parse("2026-06-01T00:00:00.000Z"));
    await guest.saveRun(id, '{"caught":[1,4],"notes":"keep"}');
    const before = guestRows()[0];
    const { added } = await guest.refreshRun(id, [1, 7, 25], link, Date.parse("2026-05-03T00:00:00.000Z"));
    expect(added).toEqual([7, 25]);
    expect(guestRows()[0].saveLink).toEqual(link);
    const writes = storage.setItem.mock.calls.length;
    await guest.undoRefresh(id, added, Date.parse(before.createdAt), undefined);
    expect(storage.setItem.mock.calls.length).toBe(writes + 1);
    const after = guestRows()[0];
    expect(JSON.parse(after.state)).toEqual({ caught: [1, 4], notes: "keep" });
    expect(after.createdAt).toBe(before.createdAt);
    expect(after.saveLink).toBeUndefined();
    await guest.refreshRun(id, [9], { ...link, playSeconds: 200 });
    await guest.undoRefresh(id, [9], undefined, link);
    expect(guestRows()[0].saveLink).toEqual(link);
    const kept = JSON.stringify(guestRows());
    storage.setItem.mockImplementationOnce(() => { throw new Error("QuotaExceededError"); });
    await expect(guest.undoRefresh(id, [1], undefined, undefined)).rejects.toThrow();
    expect(JSON.stringify(guestRows())).toBe(kept);
    await expect(guest.undoRefresh("local-missing", [1])).rejects.toThrow("This playthrough moved");
  });
  it("moves a guest playthrough without its link when the link is invalid", async () => {
    const { guest, guestRows, moveGuestRuns, storage } = await setup();
    const id = await guest.createRun("red");
    const rows = guestRows().map((r) => (r.id === id ? { ...r, saveLink: { salt: "", fingerprint: "x" } } : r));
    storage.setItem("jomc.guest", JSON.stringify(rows));
    Object.assign((await import("../client/game")).bridge, { auth: { isAuthenticated: true, userId: "A" }, runs: [] });
    const raw = { auth: { userId: "A" }, createRun: vi.fn(async () => "acct1"), saveRun: vi.fn(), setStart: vi.fn(), track: vi.fn() } as unknown as Bridge & { createRun: ReturnType<typeof vi.fn> };
    await moveGuestRuns(raw, vi.fn(), vi.fn());
    expect(raw.createRun).toHaveBeenCalledWith("red", "A", undefined);
    expect(guestRows()).toEqual([]);
  });
});
