import { afterEach, describe, expect, it, vi } from "vitest";
import type { Bridge } from "../client/types";
import { MAX_RUNS } from "../shared/limits";

const importId = "d60f37e5-bef7-4e53-8726-1c964120c460";

vi.mock("../client/game", () => ({
  bridge: {},
  store: {
    get: (key: string) => localStorage.getItem(key),
    set: (key: string, value: string) => localStorage.setItem(key, value),
    del: (key: string) => localStorage.removeItem(key),
  },
}));

describe("guest caught-list imports", () => {
  afterEach(() => vi.unstubAllGlobals());

  const setup = async () => {
    vi.resetModules();
    const values = new Map<string, string>();
    const storage = {
      getItem: vi.fn((key: string) => values.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => { values.set(key, value); }),
      removeItem: vi.fn((key: string) => { values.delete(key); }),
    };
    vi.stubGlobal("localStorage", storage);
    const { withGuest, guestRows } = await import("../client/guest");
    const refresh = vi.fn();
    const track = vi.fn();
    const guest = withGuest({ auth: { isLoading: false, isAuthenticated: false }, track } as unknown as Bridge, refresh);
    return { values, storage, refresh, track, guest, guestRows };
  };

  it("stores caught flags and keeps the existing playthrough unchanged", async () => {
    const { values, guest, guestRows, refresh, track } = await setup();
    const existing = { id: "local-existing", version: "crystal", state: '{"caught":[1],"notes":"Keep me"}', createdAt: "2026-01-01T00:00:00.000Z" };
    values.set("jomc.guest", JSON.stringify([existing]));
    const id = await guest.importRun("heartgold", [25, 1], importId);
    expect(guestRows()).toEqual([existing, expect.objectContaining({ id, version: "heartgold", state: '{"caught":[1,25]}' })]);
    expect(id).toMatch(/^local-/);
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(track).toHaveBeenCalledWith("guest_run_created", "heartgold");
  });

  it.each(["red", "blue", "yellow", "gold", "silver", "omega-ruby", "alpha-sapphire"] as const)("keeps %s caught history and empty guest imports", async (version) => {
    const { values, guest, guestRows } = await setup();
    const existing = { id: "local-existing", version: "crystal", state: '{"caught":[1],"notes":"Keep me"}', createdAt: "2026-01-01T00:00:00.000Z" };
    values.set("jomc.guest", JSON.stringify([existing]));
    const id = await guest.importRun(version, [133, 25], importId);
    const empty = await guest.importRun(version, [], "e60f37e5-bef7-4e53-8726-1c964120c460");
    expect(guestRows()).toEqual([
      existing,
      expect.objectContaining({ id, version, state: '{"caught":[25,133]}' }),
      expect.objectContaining({ id: empty, version, state: '{"caught":[]}' }),
    ]);
  });

  it("persists the selected start date and rejects changing it during retry", async () => {
    const { guest, guestRows, storage } = await setup();
    const startedAt = new Date(2010, 2, 14).getTime();
    const id = await guest.importRun("heartgold", [25], importId, startedAt);
    expect(guestRows()[0].createdAt).toBe(new Date(startedAt).toISOString());
    expect(await guest.importRun("heartgold", [25], importId, startedAt)).toBe(id);
    await expect(guest.importRun("heartgold", [25], importId, startedAt + 864e5)).rejects.toThrow("Import ID already used");
    await expect(guest.importRun("heartgold", [25], importId)).rejects.toThrow("Import ID already used");
    expect(storage.setItem).toHaveBeenCalledTimes(1);
  });

  it.each([NaN, Infinity, -1, 1.5, Date.now() + 3 * 864e5])("rejects invalid start dates before writing storage: %s", async startedAt => {
    const { guest, storage } = await setup();
    await expect(guest.importRun("heartgold", [25], importId, startedAt)).rejects.toThrow("Pick a past date");
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it("rejects failed storage without creating a phantom in-memory run", async () => {
    const { storage, guest, guestRows, refresh, track } = await setup();
    storage.setItem.mockImplementation(() => { throw new Error("Quota exceeded"); });
    await expect(guest.importRun("heartgold", [25], importId)).rejects.toThrow("Quota exceeded");
    expect(guestRows()).toEqual([]);
    expect(refresh).not.toHaveBeenCalled();
    expect(track).not.toHaveBeenCalled();
  });

  it("returns the same guest run for a retry without writing again", async () => {
    const { guest, guestRows, storage, refresh, track } = await setup();
    const id = await guest.importRun("heartgold", [25, 1], importId);
    expect(await guest.importRun("heartgold", [1, 25], importId)).toBe(id);
    expect(guestRows()).toHaveLength(1);
    expect(storage.setItem).toHaveBeenCalledTimes(1);
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(track).toHaveBeenCalledTimes(1);
  });

  it("allows a matching guest retry at the limit and rejects a different payload", async () => {
    const { values, guest, guestRows, storage } = await setup();
    const id = await guest.importRun("heartgold", [25], importId);
    const rows = guestRows();
    values.set("jomc.guest", JSON.stringify([
      ...rows,
      ...Array.from({ length: MAX_RUNS - 1 }, (_, i) => ({ id: `local-${i}`, version: "crystal", state: "{}", createdAt: "2026-01-01T00:00:00.000Z" })),
    ]));
    expect(await guest.importRun("heartgold", [25], importId)).toBe(id);
    await expect(guest.importRun("heartgold", [26], importId)).rejects.toThrow("Import ID already used");
    await expect(guest.importRun("soulsilver", [25], importId)).rejects.toThrow("Import ID already used");
    expect(guestRows()).toHaveLength(MAX_RUNS);
    expect(storage.setItem).toHaveBeenCalledTimes(1);
  });

  it("rejects malformed guest import IDs before writing storage", async () => {
    const { guest, storage } = await setup();
    await expect(guest.importRun("crystal", [25], "not-an-id")).rejects.toThrow("Invalid import ID");
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it("rejects invalid species and the guest limit before writing storage", async () => {
    const { values, storage, guest, refresh } = await setup();
    await expect(guest.importRun("crystal", [252], importId)).rejects.toThrow("Invalid caught Pokémon");
    values.set("jomc.guest", JSON.stringify(Array.from({ length: MAX_RUNS }, (_, i) => ({ id: `local-${i}`, version: "crystal", state: "{}", createdAt: "2026-01-01T00:00:00.000Z" }))));
    await expect(guest.importRun("crystal", [25], importId)).rejects.toThrow("Too many playthroughs");
    expect(storage.setItem).not.toHaveBeenCalled();
    expect(refresh).not.toHaveBeenCalled();
  });
});
