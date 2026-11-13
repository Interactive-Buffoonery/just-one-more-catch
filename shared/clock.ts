// A playthrough's in-game clock: follows a time zone, or ticks on from a time the player set.
export type Clock = { mode: "device" | "manual"; tz?: string; min?: number; at?: number };
export type GameNow = { day: number; hour: number; minute: number }; // day 0 = Sunday

const WEEK = 7 * 24 * 60;
const WEEKDAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

const formatters = new Map<string | undefined, Intl.DateTimeFormat>();
function formatter(timeZone?: string) {
  let f = formatters.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", minute: "numeric", hourCycle: "h23", weekday: "long" });
    formatters.set(timeZone, f);
  }
  return f;
}

function inZone(now: number, tz?: string): GameNow {
  let f;
  try {
    f = formatter(tz);
  } catch {
    f = formatter();
  }
  const p = Object.fromEntries(f.formatToParts(now).map((x) => [x.type, x.value]));
  return { day: WEEKDAYS.indexOf(p.weekday.toLowerCase()), hour: +p.hour % 24, minute: +p.minute };
}

export function gameNow(c: Clock, now = Date.now(), hourOffset = 0): GameNow {
  if (c.mode !== "manual" || c.min == null || c.at == null) {
    const g = inZone(now, c.tz);
    return { ...g, hour: (g.hour + hourOffset) % 24 };
  }
  const m = (((c.min + Math.floor((now - c.at) / 60000)) % WEEK) + WEEK) % WEEK;
  return { day: Math.floor(m / 1440), hour: Math.floor(m / 60) % 24, minute: m % 60 };
}

export function encounterTime(hour: number, morning = 4, night = 24) {
  return hour >= morning && hour < 10 ? "morning" : hour >= 10 && hour < night ? "day" : "night";
}
