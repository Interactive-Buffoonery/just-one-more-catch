import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// ponytail: a playthrough's whole state (badges, caught, boxes) is one JSON string; split out a mons table if it outgrows a document
export const eventName = v.union(v.literal("guest_run_created"), v.literal("guest_run_moved"), v.literal("export_used"), v.literal("contact_sent"));

export default defineSchema({
  quotaKeys: defineTable({ key: v.string(), expiresAt: v.number() })
    .index("by_key", ["key"]).index("by_expiresAt", ["expiresAt"]),
  events: defineTable({ name: eventName, owner: v.optional(v.string()), version: v.optional(v.string()) })
    .index("by_owner", ["owner"]).index("by_name", ["name"]),
  runs: defineTable({
    owner: v.string(),
    version: v.string(),
    importId: v.optional(v.string()),
    summary: v.object({
      badges: v.array(v.string()),
      caught: v.number(),
      party: v.array(v.object({ n: v.number(), shiny: v.boolean(), nick: v.string() })),
    }),
    updatedAt: v.optional(v.number()),
    startedAt: v.optional(v.number()),
  }).index("by_owner", ["owner"])
    .index("by_owner_importId", ["owner", "importId"]),
  // Full playthrough state, kept apart so listing runs reads only the small run documents
  states: defineTable({
    run: v.id("runs"),
    state: v.string(),
  }).index("by_run", ["run"]),
  profiles: defineTable({
    owner: v.string(),
    avatar: v.optional(v.number()),
    look: v.optional(v.string()),
    mode: v.optional(v.string()),
  }).index("by_owner", ["owner"]),
  messages: defineTable({
    sender: v.string(),
    email: v.string(),
    message: v.string(),
  }).index("by_sender", ["sender"]),
  pairings: defineTable({
    code: v.string(),
    secretHash: v.string(),
    label: v.string(),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("denied")),
    expiresAt: v.number(),
    userId: v.optional(v.string()),
    claim: v.optional(v.string()),
    ticket: v.optional(v.string()),
  }).index("by_code", ["code"]),
  deviceLabels: defineTable({
    sid: v.string(),
    owner: v.string(),
    label: v.string(),
  }).index("by_sid", ["sid"])
    .index("by_owner", ["owner"]),
  revokedSessions: defineTable({
    sid: v.string(),
    expiresAt: v.number(),
  }).index("by_sid", ["sid"]),
});
