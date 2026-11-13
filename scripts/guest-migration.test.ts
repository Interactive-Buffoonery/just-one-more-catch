import { beforeEach, expect, it, vi } from "vitest";
import { setup } from "../convex/setup.testing";
import { api } from "../convex/_generated/api";

const game = vi.hoisted(() => ({
  bridge: { auth: { isAuthenticated: true, userId: "A" }, runs: [] as { id: string }[] },
  store: { get: vi.fn(), set: vi.fn(), del: vi.fn() },
}));
vi.mock("../client/game", () => game);
import { guestRows, moveGuestRuns } from "../client/guest";
import type { Bridge } from "../client/types";

beforeEach(() => {
  let data = JSON.stringify([1, 2].map(n => ({ id: `guest-${n}`, version: "crystal", state: "{}", createdAt: "2026-11-01" })));
  game.store.get.mockImplementation(() => data);
  game.store.set.mockImplementation((_key, value) => { data = value; });
  game.bridge.auth = { isAuthenticated: true, userId: "A" };
  game.bridge.runs = [];
});

it.each(["createRun", "saveRun", "setStart"])("stops after an account switch during %s and reserves remaining rows for A", async (step) => {
  const calls: string[] = [];
  const raw = {
    auth: { userId: "A" },
    createRun: vi.fn(async (_version, expected) => {
      expect(expected).toBe("A"); calls.push("createRun");
      if (step === "createRun") game.bridge.auth.userId = "B";
      return "run-a";
    }),
    saveRun: vi.fn(async (_id, _state, expected) => {
      expect(expected).toBe("A"); calls.push("saveRun");
      if (step === "saveRun") game.bridge.auth.userId = "B";
    }),
    setStart: vi.fn(async (_id, _date, expected) => {
      expect(expected).toBe("A"); calls.push("setStart");
      if (step === "setStart") game.bridge.auth.userId = "B";
    }),
    track: vi.fn(),
  } as unknown as Bridge;
  const moved = vi.fn();
  await moveGuestRuns(raw, vi.fn(), moved);
  expect(calls).toEqual(["createRun", "saveRun", "setStart"].slice(0, ["createRun", "saveRun", "setStart"].indexOf(step) + 1));
  expect(guestRows()).toHaveLength(2);
  expect(guestRows().every(g => g.moveOwner === "A")).toBe(true);
  expect(moved).not.toHaveBeenCalled();
  await moveGuestRuns({ ...raw, auth: { userId: "B" } } as Bridge, vi.fn(), moved);
  expect(raw.createRun).toHaveBeenCalledTimes(1);
  game.bridge.auth.userId = "A";
  await moveGuestRuns({ ...raw, createRun: vi.fn(async () => "run-a2"), saveRun: vi.fn(async () => {}), setStart: vi.fn(async () => {}) } as Bridge, vi.fn(), moved);
  expect(guestRows()).toHaveLength(0);
});

it("rejects migration writes after the shared client changes account", async () => {
  const t = setup();
  const a = t.withIdentity({ subject: "A", sid: "sess_A" });
  const b = t.withIdentity({ subject: "B", sid: "sess_B" });
  await expect(b.mutation(api.runs.create, { version: "crystal", expectedUserId: "A" })).rejects.toThrow("Account changed");
  const id = await a.mutation(api.runs.create, { version: "crystal", expectedUserId: "A" });
  await expect(b.mutation(api.runs.save, { id, state: "{}", expectedUserId: "A" })).rejects.toThrow();
  await expect(a.mutation(api.runs.setStart, { id, startedAt: 0, expectedUserId: "B" })).rejects.toThrow("Account changed");
  await a.mutation(api.runs.save, { id, state: "{}", expectedUserId: "A" });
});

it("skips legacy half-migrated rows belonging to another account and continues later rows", async () => {
  let data = JSON.stringify([
    { id: "legacy", version: "crystal", state: "{}", createdAt: "2026-11-01", movedTo: "run-other" },
    { id: "new", version: "crystal", state: "{}", createdAt: "2026-11-01" },
  ]);
  game.store.get.mockImplementation(() => data);
  game.store.set.mockImplementation((_key, value) => { data = value; });
  const raw = {
    auth: { userId: "A" },
    createRun: vi.fn(async () => "run-new"),
    saveRun: vi.fn(async () => {}),
    setStart: vi.fn(async () => {}),
    track: vi.fn(),
  } as unknown as Bridge;
  await moveGuestRuns(raw, vi.fn(), vi.fn());
  expect(raw.saveRun).toHaveBeenCalledExactlyOnceWith("run-new", "{}", "A");
  expect(guestRows()).toHaveLength(1);
  expect(guestRows()[0].moveOwner).toBeUndefined();
  game.bridge.runs = [{ id: "run-other" }];
  await moveGuestRuns(raw, vi.fn(), vi.fn());
  expect(raw.saveRun).toHaveBeenLastCalledWith("run-other", "{}", "A");
  expect(guestRows()).toHaveLength(0);
});
