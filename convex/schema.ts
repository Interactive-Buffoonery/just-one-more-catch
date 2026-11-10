import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// ponytail: a playthrough's whole state (badges, caught, boxes) is one JSON string; split out a mons table if it outgrows a document
export default defineSchema({
  runs: defineTable({
    owner: v.string(),
    version: v.string(),
    state: v.string(),
  }).index("by_owner", ["owner"]),
  messages: defineTable({
    sender: v.string(),
    email: v.string(),
    message: v.string(),
  }).index("by_sender", ["sender"]),
});
