import { afterEach, expect, test, vi } from "vitest";
import { SaveImport, importTarget } from "../client/save-import";
import { MAX_RUNS } from "../shared/limits";
import type { Bridge } from "../client/types";

afterEach(() => vi.unstubAllGlobals());

test("a lost response can retry the same import after filling the final slot", async () => {
  const heading = { setAttribute: vi.fn(), focus: vi.fn() };
  const host = {
    innerHTML: "",
    addEventListener: vi.fn(),
    querySelectorAll: () => [],
    querySelector: (selector: string) => selector === "#import-title" ? heading : { textContent: "" },
  } as unknown as HTMLElement;
  vi.stubGlobal("document", { getElementById: () => null });
  const complete = vi.fn();
  const importRun = vi.fn();
  const bridge = { auth: { isLoading: false, isAuthenticated: true, userId: "first" }, runs: Array(MAX_RUNS - 1), importRun } as unknown as Bridge;
  const importer = new SaveImport({ host, bridge: () => bridge, flush: async () => {}, complete, dismiss: vi.fn() });
  const pending = importer as unknown as {
    active: boolean;
    preview: { version: string; caught: number[]; skipped: number; partial: boolean };
    target: string;
    importId: string;
    create(): Promise<void>;
  };
  pending.active = true;
  pending.preview = { version: "heartgold", caught: [25], skipped: 0, partial: false };
  pending.target = importTarget(bridge);
  pending.importId = "d60f37e5-bef7-4e53-8726-1c964120c460";
  importRun.mockImplementationOnce(async () => {
    bridge.runs = Array(MAX_RUNS);
    throw new Error("Response lost after commit");
  }).mockResolvedValueOnce("existing-import");

  await pending.create();
  expect(complete).not.toHaveBeenCalled();
  expect(host.innerHTML).toContain("Back to preview");
  await pending.create();
  expect(importRun).toHaveBeenCalledTimes(2);
  expect(importRun.mock.calls[1]).toEqual(importRun.mock.calls[0]);
  expect(complete).toHaveBeenCalledWith("existing-import", true);
});
