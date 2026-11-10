import {
  capsule,
  mutation,
  query,
  string,
  table,
} from "@spacefast/zero/server";

// ponytail: a run's whole state (badges, caught, boxes) is one JSON string; split out a mons table if runs outgrow a row
const MAX_STATE = 200_000;
const VERSIONS = ["heartgold", "soulsilver"];

export default capsule({
  name: "Just One More Catch",
  schema: {
    runs: table({
      owner: string(),
      version: string(),
      state: string(),
    }).index("by_owner", ["owner"]),
    messages: table({
      sender: string(),
      email: string(),
      message: string(),
    }).index("by_sender", ["sender"]),
  },
  queries: {
    myRuns: query(async (ctx) => {
      if (!ctx.auth.isAuthenticated) return [];
      return ctx.db.runs
        .withIndex("by_owner", (r) => r.eq("owner", ctx.auth.userId))
        .collect();
    }),
  },
  mutations: {
    createRun: mutation(async (ctx, version: string) => {
      const { userId } = ctx.auth.requireSignedIn();
      if (!VERSIONS.includes(version)) throw new Error("Unknown game");
      const mine = await ctx.db.runs
        .withIndex("by_owner", (r) => r.eq("owner", userId))
        .collect();
      if (mine.length >= 20) throw new Error("Too many runs");
      ctx.invalidate("myRuns");
      return ctx.db.runs.insert({ owner: userId, version, state: "{}" });
    }),
    saveRun: mutation(async (ctx, id: string, state: string) => {
      const { userId } = ctx.auth.requireSignedIn();
      if (typeof state !== "string" || state.length > MAX_STATE)
        throw new Error("Run is too large");
      JSON.parse(state);
      const run = await ctx.db.runs.get(id);
      if (!run || run.owner !== userId) throw new Error("Not your run");
      ctx.invalidate("myRuns");
      await ctx.db.runs.update(id, { state });
    }),
    deleteRun: mutation(async (ctx, id: string) => {
      const { userId } = ctx.auth.requireSignedIn();
      const run = await ctx.db.runs.get(id);
      if (!run || run.owner !== userId) throw new Error("Not your run");
      ctx.invalidate("myRuns");
      await ctx.db.runs.delete(id);
    }),
    deleteAccount: mutation(async (ctx) => {
      const { userId } = ctx.auth.requireSignedIn();
      const runs = await ctx.db.runs
        .withIndex("by_owner", (r) => r.eq("owner", userId))
        .collect();
      const messages = await ctx.db.messages
        .withIndex("by_sender", (r) => r.eq("sender", userId))
        .collect();
      for (const row of runs) await ctx.db.runs.delete(row.id);
      for (const row of messages) await ctx.db.messages.delete(row.id);
      ctx.invalidate("myRuns");
    }),
    contact: mutation(
      async (ctx, input: { email: string; message: string }) => {
        const email = String(input?.email ?? "")
          .trim()
          .slice(0, 200);
        const message = String(input?.message ?? "")
          .trim()
          .slice(0, 4000);
        if (!message || (email && !email.includes("@"))) return { ok: false };
        const sender = ctx.auth.userId ?? "anonymous";
        const latest = await ctx.db.messages
          .withIndex("by_sender", (r) => r.eq("sender", sender))
          .order("desc")
          .first();
        if (latest && latest.message === message) return { ok: true };
        await ctx.db.messages.insert({ sender, email, message });
        return { ok: true };
      },
    ),
  },
});
