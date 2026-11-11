import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// ponytail: a playthrough's whole state (badges, caught, boxes) is one JSON string; split out a mons table if it outgrows a document
export default defineSchema({
  runs: defineTable({
    owner: v.string(),
    version: v.string(),
    summary: v.object({
      badges: v.array(v.string()),
      caught: v.number(),
      party: v.array(v.object({ n: v.number(), shiny: v.boolean(), nick: v.string() })),
    }),
    updatedAt: v.optional(v.number()),
    startedAt: v.optional(v.number()),
  }).index("by_owner", ["owner"]),
  // Full playthrough state, kept apart so listing runs reads only the small run documents
  states: defineTable({
    run: v.id("runs"),
    state: v.string(),
  }).index("by_run", ["run"]),
  profiles: defineTable({
    owner: v.string(),
    avatar: v.number(),
  }).index("by_owner", ["owner"]),
  messages: defineTable({
    sender: v.string(),
    email: v.string(),
    message: v.string(),
  }).index("by_sender", ["sender"]),
});
