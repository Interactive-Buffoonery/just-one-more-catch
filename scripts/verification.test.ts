import { afterEach, beforeEach, expect, test, vi } from "vitest";

beforeEach(() => { vi.resetModules(); vi.stubEnv("VITE_TURNSTILE_SITE_KEY", "test-site-key"); });
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

function browser(outcome: "success" | "error" | "timeout" = "success") {
  const containers: { remove: ReturnType<typeof vi.fn> }[] = [];
  let options: { callback(token: string): void; "error-callback"(): void; cData: string; action: string };
  const api = {
    ready: vi.fn((callback: () => void) => callback()),
    render: vi.fn((_container, input) => { options = input; return "widget"; }),
    execute: vi.fn(() => {
      if (outcome === "success") queueMicrotask(() => options.callback("one-use-token"));
      if (outcome === "error") queueMicrotask(() => options["error-callback"]());
    }),
    remove: vi.fn(),
  };
  const scripts: { onload(): void }[] = [];
  const window: { turnstile?: typeof api } = {};
  vi.stubGlobal("window", window);
  vi.stubGlobal("localStorage", { getItem: () => "a".repeat(32) });
  vi.stubGlobal("document", {
    querySelector: vi.fn(() => null),
    createElement: () => {
      const element = { style: {}, setAttribute: vi.fn(), remove: vi.fn() };
      containers.push(element);
      return element;
    },
    head: { append(script: { onload(): void }) { scripts.push(script); window.turnstile = api; queueMicrotask(() => script.onload()); } },
    body: { append: vi.fn() },
  });
  return { api, scripts, containers, options: () => options };
}

test("loads lazily, reuses the API, binds visitor/action, and removes each widget", async () => {
  const b = browser();
  const { verificationToken } = await import("../client/verification");
  expect(b.scripts).toHaveLength(0);
  expect(await verificationToken("contact")).toBe("one-use-token");
  expect(b.options()).toMatchObject({ action: "contact", cData: "a".repeat(32) });
  expect(await verificationToken("pairing")).toBe("one-use-token");
  expect(b.scripts).toHaveLength(1);
  expect(b.options().action).toBe("pairing");
  expect(b.api.ready).not.toHaveBeenCalled();
  expect(b.api.remove).toHaveBeenCalledTimes(2);
  expect(b.containers.slice(1).every(c => c.remove.mock.calls.length === 1)).toBe(true);
});

test("uses the loaded async API without waiting for ready", async () => {
  vi.useFakeTimers();
  const b = browser();
  b.api.ready.mockImplementation(() => {});
  const { verificationToken } = await import("../client/verification");
  const result = verificationToken("pairing").then(token => ({ token }), error => ({ error }));
  await vi.advanceTimersByTimeAsync(10000);
  expect(await result).toEqual({ token: "one-use-token" });
  expect(b.api.ready).not.toHaveBeenCalled();
  expect(b.api.remove).toHaveBeenCalledWith("widget");
});

test("keeps an interactive challenge inside the active modal", async () => {
  const b = browser();
  const modal = { append: vi.fn() };
  vi.mocked(document.querySelector).mockReturnValue(modal as unknown as Element);
  const { verificationToken } = await import("../client/verification");
  expect(await verificationToken("pairing")).toBe("one-use-token");
  expect(document.querySelector).toHaveBeenCalledWith("dialog:modal");
  expect(modal.append).toHaveBeenCalledWith(b.containers.at(-1));
  expect(document.body.append).not.toHaveBeenCalled();
  expect(b.api.remove).toHaveBeenCalledWith("widget");
  expect(b.containers.at(-1)!.remove).toHaveBeenCalled();
});

test("failed challenges reject and clean up", async () => {
  const b = browser("error");
  const { verificationToken } = await import("../client/verification");
  await expect(verificationToken("contact")).rejects.toThrow("Verification failed");
  expect(b.api.remove).toHaveBeenCalledWith("widget");
  expect(b.containers.at(-1)!.remove).toHaveBeenCalled();
});

test("a stalled challenge times out and cleans up", async () => {
  vi.useFakeTimers();
  const b = browser("timeout");
  const { verificationToken } = await import("../client/verification");
  const failed = expect(verificationToken("pairing")).rejects.toThrow("Verification failed");
  await vi.advanceTimersByTimeAsync(120000);
  await failed;
  expect(b.api.remove).toHaveBeenCalledWith("widget");
});

test("missing site key fails before loading external code", async () => {
  const b = browser();
  vi.stubEnv("VITE_TURNSTILE_SITE_KEY", "");
  const { verificationToken } = await import("../client/verification");
  await expect(verificationToken("contact")).rejects.toThrow("Verification unavailable");
  expect(b.scripts).toHaveLength(0);
});
