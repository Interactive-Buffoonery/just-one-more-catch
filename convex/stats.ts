import { internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { RETENTION_MS } from "./events";

const WEEK = 7 * 864e5;
function week(time: number) {
  const d = new Date(time);
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - (d.getUTCDay() + 6) % 7);
  return d.getTime();
}
export const overview = internalQuery({
  args: { now: v.number() },
  handler: async (ctx, { now }) => {
    // ponytail: whole-table reads are fine to a few thousand runs/events; switch to aggregates/@convex-dev/aggregate beyond that.
    const [runs, profiles, events] = await Promise.all([
      ctx.db.query("runs").collect(), ctx.db.query("profiles").collect(), ctx.db.query("events").withIndex("by_creation_time", q => q.gte("_creationTime", now - RETENTION_MS)).collect(),
    ]);
    const weeks = Array.from({ length: 12 }, (_, i) => {
      const start = week(now) - (11 - i) * WEEK;
      return { start: new Date(start).toISOString().slice(0, 10), time: start, newUsers: 0, runsStarted: 0, activeRuns: 0 };
    });
    const bucket = (time: number) => weeks.find((w) => time >= w.time && time < w.time + WEEK && time <= now);
    const owners = new Map<string, number>();
    for (const row of [...runs, ...profiles]) owners.set(row.owner, Math.min(owners.get(row.owner) ?? Infinity, row._creationTime));
    for (const time of owners.values()) { const w = bucket(time); if (w) w.newUsers++; }
    const versions: Record<string, number> = {}, badges: Record<string, number> = {};
    for (const r of runs) {
      const started = bucket(r._creationTime), active = r.updatedAt === undefined ? undefined : bucket(r.updatedAt);
      if (started) started.runsStarted++;
      if (active) active.activeRuns++;
      versions[r.version] = (versions[r.version] ?? 0) + 1;
      badges[r.summary.badges.length] = (badges[r.summary.badges.length] ?? 0) + 1;
    }
    const counts: Record<string, { signedIn: number; guest: number; weekly: { start: string; signedIn: number; guest: number }[] }> = {};
    for (const e of events) {
      const c = counts[e.name] ??= { signedIn: 0, guest: 0, weekly: weeks.map(({ start }) => ({ start, signedIn: 0, guest: 0 })) };
      const key = e.owner === undefined ? "guest" : "signedIn";
      c[key]++;
      const w = bucket(e._creationTime);
      if (w) c.weekly[weeks.indexOf(w)][key]++;
    }
    const activeUsers = (days: number) => new Set(runs.filter((r) => r.updatedAt !== undefined && r.updatedAt >= now - days * 864e5 && r.updatedAt <= now).map((r) => r.owner)).size;
    return {
      totals: { users: owners.size, runs: runs.length, caught: runs.reduce((n, r) => n + r.summary.caught, 0) },
      weekly: weeks.map(({ time, ...w }) => w),
      activeUsers: { days7: activeUsers(7), days30: activeUsers(30) },
      versions, badges, events: counts,
    };
  },
});
