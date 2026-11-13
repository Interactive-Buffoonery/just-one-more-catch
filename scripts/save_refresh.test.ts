import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Bridge, RunRow } from "../client/types";

const reader = vi.hoisted(() => ({ create: vi.fn() }));
vi.mock("@serabi/pokemon-save-reader", () => ({
  createSaveReader: reader.create,
}));
vi.mock("../client/game", () => ({
  bridge: {},
  store: {
    get: (key: string) => localStorage.getItem(key),
    set: (key: string, value: string) => localStorage.setItem(key, value),
    del: (key: string) => localStorage.removeItem(key),
  },
}));
const { SaveImport, refreshCheck, matchingRun, newSaveLink, undoRefreshRun } =
  await import("../client/save-import");

type Snap = Parameters<typeof refreshCheck>[0];
const snap = (extra: Partial<Snap> = {}) =>
  ({
    status: "ok",
    schemaVersion: 1,
    game: {
      version: "HG",
      versions: ["HG"],
      name: "HeartGold",
      formatId: "pkhex",
    },
    pokedex: {
      status: "available",
      coverage: "complete",
      speciesNamespace: "national-dex",
      caughtSpecies: [25],
      warnings: [],
    },
    ...extra,
  }) as Snap;
const trainer = { id32: 123456, name: "Lyra" };

describe("refresh decision table", () => {
  it("skips linking and checks when the reader gives no trainer", async () => {
    expect(await refreshCheck(snap(), "heartgold")).toEqual({
      status: "unlinked",
    });
    expect(
      await refreshCheck(
        snap({ trainer: { id32: -1, name: "x" } }),
        "heartgold",
      ),
    ).toEqual({ status: "unlinked" });
  });
  it("links an unlinked run and compares play time on linked runs", async () => {
    const first = await refreshCheck(
      snap({ trainer, playSeconds: 100 }),
      "heartgold",
    );
    expect(first.status).toBe("link");
    expect(first.link).toMatchObject({ playSeconds: 100 });
    expect(JSON.stringify(first.link)).not.toContain("Lyra");
    const link = first.link!;
    expect(
      await refreshCheck(
        snap({ trainer, playSeconds: 200 }),
        "heartgold",
        link,
      ),
    ).toEqual({ status: "same", link: { ...link, playSeconds: 200 } });
    expect(
      (
        await refreshCheck(
          snap({ trainer, playSeconds: 100 }),
          "heartgold",
          link,
        )
      ).status,
    ).toBe("same");
    expect(
      (await refreshCheck(snap({ trainer }), "heartgold", link)).status,
    ).toBe("same");
    expect(
      (
        await refreshCheck(
          snap({ trainer, playSeconds: 50 }),
          "heartgold",
          link,
        )
      ).status,
    ).toBe("older");
    expect(
      await refreshCheck(
        snap({ trainer: { ...trainer, name: "Ethan" }, playSeconds: 300 }),
        "heartgold",
        link,
      ),
    ).toEqual({ status: "different" });
    expect(
      await refreshCheck(
        snap({ trainer: { ...trainer, id32: 1 } }),
        "heartgold",
        link,
      ),
    ).toEqual({ status: "different" });
  });
  it("finds the linked playthrough for an import", async () => {
    const link = (await newSaveLink(snap({ trainer }), "heartgold"))!;
    const other = (await newSaveLink(
      snap({ trainer: { ...trainer, name: "Ethan" } }),
      "heartgold",
    ))!;
    expect(
      await matchingRun(snap({ trainer }), "heartgold", [
        { id: "b", ...other },
        { id: "a", ...link },
      ]),
    ).toBe("a");
    expect(
      await matchingRun(
        snap({ trainer: { id32: 9, name: "Kris" } }),
        "heartgold",
        [{ id: "a", ...link }],
      ),
    ).toBeUndefined();
  });
});

describe("refresh flow", () => {
  beforeEach(() => {
    vi.stubGlobal("document", {
      getElementById: () => null,
      activeElement: null,
    });
    vi.stubGlobal("location", { origin: "https://example.test" });
    vi.stubGlobal("__SAVE_READER_VERSION__", "test");
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    reader.create.mockReset();
  });
  const setup = (version: string) => {
    const host = {
      innerHTML: "",
      addEventListener: vi.fn(),
      querySelectorAll: () => [],
      querySelector: () => ({
        textContent: "",
        setAttribute: vi.fn(),
        focus: vi.fn(),
      }),
    } as unknown as HTMLElement;
    const row: RunRow = {
      id: "run1",
      version,
      summary: { badges: [], caught: 1, party: [] },
      createdAt: "2026-06-01T00:00:00.000Z",
    };
    const calls: string[] = [];
    const bridge = {
      auth: { isLoading: false, isAuthenticated: false },
      runs: [row],
      refreshRun: vi.fn(async () => {
        calls.push("refresh");
        return { added: [25] };
      }),
    } as unknown as Bridge;
    const refreshed = vi.fn();
    const importer = new SaveImport({
      host,
      bridge: () => bridge,
      flush: async () => {
        calls.push("flush");
      },
      complete: vi.fn(),
      refreshed,
      dismiss: vi.fn(),
    });
    return { host, bridge, importer, refreshed, calls, row };
  };
  it("stops when the save is for a different game", async () => {
    const { host, bridge, importer } = setup("red");
    reader.create.mockResolvedValue({
      inspect: async () => snap(),
      dispose: vi.fn(),
    });
    importer.open("run1");
    await (importer as any).inspect(new File([new Uint8Array([1])], "HG.sav"));
    expect(host.innerHTML).toContain("This save is for a different game");
    expect(host.innerHTML).toContain("Import as a new playthrough");
    expect(bridge.refreshRun).not.toHaveBeenCalled();
  });
  it("flushes before refreshing and reports the previous start for undo", async () => {
    const { importer, refreshed, calls, row } = setup("heartgold");
    importer.open("run1");
    (importer as any).refresh = {
      status: "unlinked",
      row,
      version: "heartgold",
      caught: [1, 25],
      added: [25],
      have: 1,
      skipped: 0,
      partial: false,
      recordedDay: "2026-05-03",
      useDate: true,
    };
    await (importer as any).commitRefresh();
    expect(calls).toEqual(["flush", "refresh"]);
    expect(refreshed).toHaveBeenCalledWith(
      "run1",
      [25],
      Date.parse(row.createdAt),
      true,
    );
  });
});

describe("refresh undo", () => {
  it("restores the caught list and start date of a guest playthrough", async () => {
    vi.resetModules();
    const values = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => {
        values.set(key, value);
      },
      removeItem: (key: string) => {
        values.delete(key);
      },
    });
    const { withGuest, guestRows } = await import("../client/guest");
    const guest = withGuest(
      {
        auth: { isLoading: false, isAuthenticated: false },
        track: vi.fn(),
      } as unknown as Bridge,
      vi.fn(),
    );
    const id = await guest.importRun(
      "red",
      [1, 4],
      "d60f37e5-bef7-4e53-8726-1c964120c460",
      Date.parse("2026-06-01T00:00:00.000Z"),
    );
    await guest.saveRun(id, '{"caught":[1,4],"notes":"keep"}');
    const before = guestRows()[0];
    const { added } = await guest.refreshRun(
      id,
      [1, 7, 25],
      undefined,
      Date.parse("2026-05-03T00:00:00.000Z"),
    );
    expect(added).toEqual([7, 25]);
    await undoRefreshRun(guest, id, added, Date.parse(before.createdAt));
    const after = guestRows()[0];
    expect(JSON.parse(after.state)).toEqual({ caught: [1, 4], notes: "keep" });
    expect(after.createdAt).toBe(before.createdAt);
    vi.unstubAllGlobals();
  });
});
