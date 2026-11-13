import { bridge, store } from "./game";
import { Bridge, RunRow } from "./types";
import { isAvatar } from "../shared/avatars";
import { MAX_RUNS } from "../shared/limits";
import { summarize } from "../shared/summary";
import { importCaughtState, validateImportId, validateImportStart, validateSaveLink, mergeSaveLink, mergeCaughtState, type SaveLink } from "../shared/save-import";

/* ---- Guest runs live in this browser until sign-in ---- */
type GuestRow = Omit<RunRow, "summary"> & { state: string; saveLink?: SaveLink; movedTo?: string; importStartedAt?: number };
const GUEST = "jomc.guest";
let guestMem = "[]";
export const guestRows = (): GuestRow[] => {
  try {
    return JSON.parse(store.get(GUEST) ?? guestMem);
  } catch {
    return [];
  }
};
const setGuestRows = (rows: GuestRow[]) => {
  guestMem = JSON.stringify(rows);
  store.set(GUEST, guestMem);
};
const AVATAR = "jomc.avatar";
const guestAvatar = () => {
  const n = Number(store.get(AVATAR));
  return isAvatar(n) ? n : null;
};

export function withGuest(b: Bridge, refresh: () => void): Bridge {
  if (b.auth.isLoading || b.auth.isAuthenticated) return b;
  return {
    ...b,
    get avatar() {
      return guestAvatar();
    },
    async setAvatar(n) {
      store.set(AVATAR, String(n));
    },
    get runs() {
      return guestRows().map((g) => ({ ...g, summary: summarize(g.state) }));
    },
    async getState(id) {
      return guestRows().find((g) => g.id === id)?.state ?? "{}";
    },
    async createRun(version, link) {
      if (link) validateSaveLink(link);
      const id = "local-" + Date.now().toString(36);
      setGuestRows([
        ...guestRows(),
        { id, version, saveLink: link, state: "{}", createdAt: new Date().toISOString() },
      ]);
      b.track("guest_run_created", version);
      refresh();
      return id;
    },
    async importRun(version, caught, importId, startedAt, link) {
      if (link) validateSaveLink(link);
      validateImportId(importId);
      validateImportStart(startedAt);
      const state = importCaughtState(version, caught);
      const rows = guestRows();
      const id = "local-import-" + importId;
      const existing = rows.find((row) => row.id === id);
      if (existing) {
        if (JSON.stringify(existing.saveLink) !== JSON.stringify(link) || existing.version !== version || existing.state !== state ||
            existing.importStartedAt !== startedAt)
          throw new Error("Import ID already used for another playthrough");
        return id;
      }
      if (rows.length >= MAX_RUNS) throw new Error("Too many playthroughs");
      const next = JSON.stringify([
        ...rows,
        { id, version, state, saveLink: link, importStartedAt: startedAt, createdAt: new Date(startedAt ?? Date.now()).toISOString() },
      ]);
      localStorage.setItem(GUEST, next);
      guestMem = next;
      b.track("guest_run_created", version);
      refresh();
      return id;
    },
    async saveLinks(version) {
      return guestRows().filter((r) => r.version === version && r.saveLink && !r.movedTo)
        .map((r) => ({ id: r.id, ...r.saveLink! }));
    },
    async refreshRun(id, caught, link, startedAt) {
      const rows = guestRows();
      const row = rows.find((r) => r.id === id);
      if (!row || row.movedTo) throw new Error("This playthrough moved");
      validateImportStart(startedAt);
      const saveLink = mergeSaveLink(row.saveLink, link);
      const result = mergeCaughtState(row.state, row.version, caught);
      const next = JSON.stringify(rows.map((r) => r.id === id ? {
        ...r, state: result.state, saveLink, updatedAt: new Date().toISOString(),
        ...(startedAt !== undefined ? { createdAt: new Date(startedAt).toISOString() } : {}),
      } : r));
      localStorage.setItem(GUEST, next);
      guestMem = next;
      refresh();
      return { added: result.added };
    },
    async saveRun(id, state) {
      const updatedAt = new Date().toISOString();
      setGuestRows(
        guestRows().map((r) => (r.id === id ? { ...r, state, updatedAt } : r)),
      );
    },
    async setStart(id, startedAt) {
      const createdAt = new Date(startedAt).toISOString();
      setGuestRows(
        guestRows().map((r) =>
          r.id === id
            ? { ...r, createdAt, updatedAt: r.updatedAt || r.createdAt }
            : r,
        ),
      );
      refresh();
    },
    async deleteRun(id) {
      setGuestRows(guestRows().filter((r) => r.id !== id));
      refresh();
    },
  };
}
let movingAvatar = false;
export function moveGuestAvatar(raw: Bridge) {
  const n = guestAvatar();
  if (movingAvatar || n === null || raw.avatar === undefined) return;
  if (raw.avatar !== null) return store.del(AVATAR);
  movingAvatar = true;
  raw
    .setAvatar(n)
    .then(
      () => store.del(AVATAR),
      () => {},
    )
    .finally(() => (movingAvatar = false));
}
// ponytail: runs one at a time; retries on the next update after a failure
export let moving = false;
let lastLeft = 0;
const plural = (n: number) => `${n} playthrough${n === 1 ? "" : "s"}`;
export async function moveGuestRuns(
  raw: Bridge,
  flash: (msg: string) => void,
  moved1: (guestId: string, id: string) => void,
) {
  if (moving || !guestRows().length) return;
  moving = true;
  let moved = 0,
    have = bridge.runs?.length || 0;
  try {
    for (const g of guestRows()) {
      if (!g.movedTo && have >= MAX_RUNS) break;
      const id = g.movedTo || (await raw.createRun(g.version, g.saveLink));
      if (!g.movedTo) have++;
      setGuestRows(
        guestRows().map((r) => (r.id === g.id ? { ...r, movedTo: id } : r)),
      );
      await raw.saveRun(id, g.state);
      await raw.setStart(id, Date.parse(g.createdAt));
      setGuestRows(guestRows().filter((r) => r.id !== g.id));
      raw.track("guest_run_moved", g.version);
      moved1(g.id, id);
      moved++;
    }
  } catch {}
  moving = false;
  const left = guestRows().length;
  if (moved || left !== lastLeft)
    flash(
      left
        ? `${moved ? `Moved ${moved} of ${moved + left} playthroughs to your account. ` : ""}${waitingNote(left)}`
        : `Moved ${plural(moved)} to your account.`,
    );
  lastLeft = left;
}
export const waitingNote = (left: number) =>
  (bridge.runs?.length || 0) >= MAX_RUNS
    ? `${plural(left)} from this browser didn't fit. Your account holds up to ${MAX_RUNS} playthroughs, so delete some on the Dashboard to make room and the rest will move over.`
    : `${plural(left)} from this browser couldn't move yet. We'll keep trying.`;
