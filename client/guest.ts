import { bridge, store } from "./game";
import { Bridge, RunRow } from "./types";
import { isAvatar } from "../shared/avatars";
import { MAX_RUNS } from "../shared/limits";
import { summarize } from "../shared/summary";

/* ---- Guest runs live in this browser until sign-in ---- */
type GuestRow = Omit<RunRow, "summary"> & { state: string; movedTo?: string };
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
    async createRun(version) {
      const id = "local-" + Date.now().toString(36);
      setGuestRows([
        ...guestRows(),
        { id, version, state: "{}", createdAt: new Date().toISOString() },
      ]);
      refresh();
      return id;
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
      const id = g.movedTo || (await raw.createRun(g.version));
      if (!g.movedTo) have++;
      setGuestRows(
        guestRows().map((r) => (r.id === g.id ? { ...r, movedTo: id } : r)),
      );
      await raw.saveRun(id, g.state);
      await raw.setStart(id, Date.parse(g.createdAt));
      setGuestRows(guestRows().filter((r) => r.id !== g.id));
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
