import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api, internal } from "./_generated/api";
import { setup } from "./setup.testing";
import { CODE_ALPHABET, PAIRING_MS } from "./pairing";
import { REVOKED_MS } from "./devices";

const player = {
  subject: "user_phone",
  tokenIdentifier: "issuer|user_phone",
  sid: "sess_phone",
};
const stranger = {
  subject: "user_stranger",
  tokenIdentifier: "issuer|user_stranger",
  sid: "sess_stranger",
};


type Call = { url: string; method: string; body?: unknown };
let calls: Call[];
function stubClerk(
  respond: (call: Call) => { status?: number; json?: unknown },
) {
  calls = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init: RequestInit) => {
      const call = {
        url,
        method: init.method ?? "GET",
        body: init.body ? JSON.parse(String(init.body)) : undefined,
      };
      calls.push(call);
      const { status = 200, json = {} } = respond(call);
      return new Response(JSON.stringify(json), { status });
    }),
  );
}

beforeEach(() => {
  vi.stubEnv("CLERK_SECRET_KEY", "sk_test_example");
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("pairing", () => {
  it("starts with a readable code and reports pending to the secret holder", async () => {
    const t = setup();
    const p = await t.withIdentity(player).action(api.pairing.start, {
      label: "Chrome on Android",
    });
    expect(p.code).toMatch(
      new RegExp(`^[${CODE_ALPHABET}]{4}-[${CODE_ALPHABET}]{4}$`),
    );
    expect(
      await t.query(api.pairing.status, { id: p.id, secret: p.secret }),
    ).toEqual({ status: "pending" });
    const looked = await t.withIdentity(player).mutation(api.pairing.lookup, {
      code: ` ${p.code.toLowerCase().replace("-", " ")} `,
    });
    expect(looked).toMatchObject({
      status: "ok",
      code: p.code,
      label: "Chrome on Android",
    });
    await t.run(async (ctx) => {
      const row = (await ctx.db.query("pairings").first())!;
      expect(row.secretHash).not.toContain(p.secret);
      expect(row.code).toBe(p.code.replace("-", ""));
    });
  });

  it("expires after ten minutes and deletes the row", async () => {
    vi.useFakeTimers();
    const t = setup();
    const p = await t.withIdentity(player).action(api.pairing.start, { label: "Device" });
    vi.advanceTimersByTime(PAIRING_MS - 1000);
    expect(
      await t.query(api.pairing.status, { id: p.id, secret: p.secret }),
    ).toEqual({ status: "pending" });
    vi.advanceTimersByTime(2000);
    expect(
      await t.run((ctx) => ctx.db.query("pairings").collect()),
    ).toHaveLength(1);
    expect(
      await t
        .withIdentity(player)
        .mutation(api.pairing.lookup, { code: p.code }),
    ).toEqual({ status: "missing" });
    await t.finishAllScheduledFunctions(vi.runAllTimers);
    expect(
      await t.query(api.pairing.status, { id: p.id, secret: p.secret }),
    ).toEqual({ status: "expired" });
    expect(await t.run((ctx) => ctx.db.query("pairings").collect())).toEqual(
      [],
    );
  });

  it("approves once for a signed-in player and shows the ticket only to the secret holder", async () => {
    const t = setup();
    stubClerk(() => ({
      json: { object: "sign_in_token", token: "ticket_123", status: "pending" },
    }));
    const p = await t.withIdentity(player).action(api.pairing.start, { label: "Device" });
    await expect(
      t.action(api.pairing.approve, { code: p.code }),
    ).rejects.toThrow("Sign in first");

    expect(
      await t
        .withIdentity(player)
        .action(api.pairing.approve, { code: p.code }),
    ).toEqual({ status: "ok" });
    expect(calls).toEqual([
      {
        url: "https://api.clerk.com/v1/sign_in_tokens",
        method: "POST",
        body: { user_id: "user_phone", expires_in_seconds: 120 },
      },
    ]);
    expect(
      await t.query(api.pairing.status, { id: p.id, secret: p.secret }),
    ).toEqual({ status: "approved", ticket: "ticket_123" });
    expect(
      await t.query(api.pairing.status, { id: p.id, secret: "wrong" }),
    ).toEqual({ status: "expired" });

    expect(
      await t
        .withIdentity(player)
        .action(api.pairing.approve, { code: p.code }),
    ).toEqual({ status: "missing" });
    expect(
      await t
        .withIdentity(stranger)
        .action(api.pairing.approve, { code: p.code }),
    ).toEqual({ status: "missing" });
    expect(calls).toHaveLength(1);

    await t.mutation(api.pairing.finish, { id: p.id, secret: "wrong" });
    expect(
      await t.run((ctx) => ctx.db.query("pairings").collect()),
    ).toHaveLength(1);
    await t.mutation(api.pairing.finish, { id: p.id, secret: p.secret });
    expect(await t.run((ctx) => ctx.db.query("pairings").collect())).toEqual(
      [],
    );
  });

  it("releases the pairing and hides Clerk details when Clerk fails", async () => {
    const t = setup();
    stubClerk(() => ({
      status: 500,
      json: { errors: [{ message: "internal detail" }] },
    }));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const p = await t.withIdentity(player).action(api.pairing.start, { label: "Device" });
    await expect(
      t.withIdentity(player).action(api.pairing.approve, { code: p.code }),
    ).rejects.toThrow(/^(?!.*internal detail).*Couldn't approve/);
    expect(
      await t.query(api.pairing.status, { id: p.id, secret: p.secret }),
    ).toEqual({ status: "pending" });
    stubClerk(() => ({ json: { token: "ticket_ok" } }));
    expect(
      await t
        .withIdentity(player)
        .action(api.pairing.approve, { code: p.code }),
    ).toEqual({ status: "ok" });
  });

  it("fails and releases the claim when the pairing expires during approval", async () => {
    vi.useFakeTimers();
    const t = setup();
    const p = await t.withIdentity(player).action(api.pairing.start, { label: "Device" });
    stubClerk(() => {
      vi.setSystemTime(Date.now() + PAIRING_MS);
      return { json: { token: "ticket_late" } };
    });
    expect(
      await t
        .withIdentity(player)
        .action(api.pairing.approve, { code: p.code }),
    ).toEqual({ status: "missing" });
    const row = await t.run(async (ctx) => (await ctx.db.query("pairings").first())!);
    expect(row).toMatchObject({ status: "pending" });
    expect(row.userId).toBeUndefined();
    expect(row.ticket).toBeUndefined();
    expect(
      await t.query(api.pairing.status, { id: p.id, secret: p.secret }),
    ).toEqual({ status: "pending" });
    await t.finishAllScheduledFunctions(vi.runAllTimers);
    expect(
      await t.query(api.pairing.status, { id: p.id, secret: p.secret }),
    ).toEqual({ status: "expired" });
  });

  it("lets only the current claim release a pairing", async () => {
    const t = setup();
    const p = await t.withIdentity(player).action(api.pairing.start, { label: "Device" });
    const claimed = await t
      .withIdentity(player)
      .mutation(internal.pairing.claim, { code: p.code });
    if (claimed.status !== "ok") throw new Error(claimed.status);
    await t.mutation(internal.pairing.release, { id: claimed.id, claim: "older" });
    expect(
      await t.run((ctx) => ctx.db.get(claimed.id)),
    ).toMatchObject({ userId: "user_phone", claim: claimed.claim });
    await t.mutation(internal.pairing.release, { id: claimed.id, claim: claimed.claim });
    expect(
      await t.withIdentity(player).mutation(api.pairing.lookup, { code: p.code }),
    ).toMatchObject({ status: "ok" });
  });

  it("stops calling Clerk once approve attempts run out", async () => {
    const t = setup();
    stubClerk(() => ({ json: { token: "ticket_123" } }));
    const p = await t.withIdentity(player).action(api.pairing.start, { label: "Device" });
    const guesser = t.withIdentity(stranger);
    for (let i = 0; i < 10; i++)
      expect(
        await guesser.action(api.pairing.approve, { code: "BCDF-GHJK" }),
      ).toEqual({ status: "missing" });
    expect(
      await guesser.action(api.pairing.approve, { code: p.code }),
    ).toMatchObject({ status: "limited" });
    expect(calls).toEqual([]);
    expect(
      await t.query(api.pairing.status, { id: p.id, secret: p.secret }),
    ).toEqual({ status: "pending" });
  });

  it("shows a denial to the device", async () => {
    const t = setup();
    const p = await t.withIdentity(player).action(api.pairing.start, { label: "Device" });
    expect(
      await t.withIdentity(player).mutation(api.pairing.deny, { code: p.code }),
    ).toEqual({ status: "ok" });
    expect(
      await t.query(api.pairing.status, { id: p.id, secret: p.secret }),
    ).toEqual({ status: "denied" });
  });

  it("limits code guesses and starts independently per player", async () => {
    const t = setup();
    const guesser = t.withIdentity(stranger);
    const results = [];
    for (let i = 0; i < 11; i++)
      results.push(
        await guesser.mutation(api.pairing.lookup, { code: "BCDF-GHJK" }),
      );
    expect(results.slice(0, 10).every((r) => r.status === "missing")).toBe(
      true,
    );
    expect(results[10]).toMatchObject({ status: "limited" });
    expect(
      await t
        .withIdentity(player)
        .mutation(api.pairing.lookup, { code: "BCDF-GHJK" }),
    ).toEqual({ status: "missing" });

    for (let i = 0; i < 20; i++)
      await t.withIdentity(player).action(api.pairing.start, { label: "Device" });
    await expect(
      t.withIdentity(player).action(api.pairing.start, { label: "Device" }),
    ).rejects.toThrow();
    await expect(t.withIdentity(stranger).action(api.pairing.start, { label: "Other device" })).resolves.toHaveProperty("code");
  });
});

describe("devices", () => {
  it("rejects a revoked session everywhere identityOf is used", async () => {
    const t = setup();
    const device = t.withIdentity({ ...player, sid: "sess_retroid" });
    await device.mutation(api.runs.create, { version: "crystal" });
    await device.mutation(api.devices.label, { label: "Chrome on Android" });
    expect(await t.withIdentity(player).query(api.devices.labels, {})).toEqual([
      { sid: "sess_retroid", label: "Chrome on Android" },
    ]);

    stubClerk(({ url }) => ({
      json: url.endsWith("/revoke")
        ? { id: "sess_retroid", status: "revoked" }
        : { id: "sess_retroid", user_id: "user_phone" },
    }));
    await t
      .withIdentity(player)
      .action(api.devices.revoke, { sessionId: "sess_retroid" });
    expect(calls.map((c) => `${c.method} ${c.url}`)).toEqual([
      "GET https://api.clerk.com/v1/sessions/sess_retroid",
      "POST https://api.clerk.com/v1/sessions/sess_retroid/revoke",
    ]);

    expect(await device.query(api.runs.list, {})).toEqual([]);
    expect(await device.query(api.devices.labels, {})).toEqual([]);
    await expect(
      device.mutation(api.runs.create, { version: "crystal" }),
    ).rejects.toThrow("Sign in first");
    expect(await t.withIdentity(player).query(api.runs.list, {})).toHaveLength(
      1,
    );
    expect(await t.withIdentity(player).query(api.devices.labels, {})).toEqual(
      [],
    );
  });

  it("treats an identity without a session ID as signed out", async () => {
    const t = setup();
    for (const sid of [undefined, ""]) {
      const device = t.withIdentity({ ...player, sid });
      expect(await device.query(api.runs.list, {})).toEqual([]);
      await expect(
        device.mutation(api.runs.create, { version: "crystal" }),
      ).rejects.toThrow("Sign in first");
    }
  });

  it("refuses another player's session and the caller's own", async () => {
    const t = setup();
    stubClerk(() => ({
      json: { id: "sess_stranger", user_id: "user_stranger" },
    }));
    await expect(
      t
        .withIdentity(player)
        .action(api.devices.revoke, { sessionId: "sess_stranger" }),
    ).rejects.toThrow("Device not found");
    expect(calls.map((c) => c.method)).toEqual(["GET"]);
    await expect(
      t
        .withIdentity(player)
        .action(api.devices.revoke, { sessionId: "sess_phone" }),
    ).rejects.toThrow("Sign out");
    await expect(
      t
        .withIdentity(player)
        .action(api.devices.revoke, { sessionId: "../users" }),
    ).rejects.toThrow("Device not found");
    await expect(
      t.action(api.devices.revoke, { sessionId: "sess_x" }),
    ).rejects.toThrow("Sign in first");
    expect(calls).toHaveLength(1);
    expect(
      await t.run((ctx) => ctx.db.query("revokedSessions").collect()),
    ).toEqual([]);
  });

  it("forgets a revoked session after ten minutes", async () => {
    vi.useFakeTimers();
    const t = setup();
    stubClerk(() => ({ json: { id: "sess_old", user_id: "user_phone" } }));
    await t
      .withIdentity(player)
      .action(api.devices.revoke, { sessionId: "sess_old" });
    expect(
      await t.run((ctx) => ctx.db.query("revokedSessions").collect()),
    ).toHaveLength(1);
    vi.advanceTimersByTime(REVOKED_MS + 1000);
    await t.finishAllScheduledFunctions(vi.runAllTimers);
    expect(
      await t.run((ctx) => ctx.db.query("revokedSessions").collect()),
    ).toEqual([]);
  });
});
