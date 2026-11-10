// A playthrough's in-game clock: follows a time zone, or ticks on from a time the player set.
export type Clock = { mode: "device" | "manual"; tz?: string; min?: number; at?: number };
export type GameNow = { day: number; hour: number; minute: number }; // day 0 = Sunday

const WEEK = 7 * 24 * 60;
const WEEKDAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

function inZone(now: number, tz?: string): GameNow {
  const read = (timeZone?: string) =>
    Object.fromEntries(
      new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", minute: "numeric", hourCycle: "h23", weekday: "long" })
        .formatToParts(now)
        .map((x) => [x.type, x.value]),
    );
  let p;
  try {
    p = read(tz);
  } catch {
    p = read();
  }
  return { day: WEEKDAYS.indexOf(p.weekday.toLowerCase()), hour: +p.hour % 24, minute: +p.minute };
}

export function gameNow(c: Clock, now = Date.now()): GameNow {
  if (c.mode !== "manual" || c.min == null || c.at == null) return inZone(now, c.tz);
  const m = (((c.min + Math.floor((now - c.at) / 60000)) % WEEK) + WEEK) % WEEK;
  return { day: Math.floor(m / 1440), hour: Math.floor(m / 60) % 24, minute: m % 60 };
}
