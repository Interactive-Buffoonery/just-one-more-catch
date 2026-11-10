import { defineApp } from "convex/server";
import { v } from "convex/values";

export default defineApp({
  env: {
    RESEND_API_KEY: v.optional(v.string()),
    CONTACT_TO: v.optional(v.string()),
  },
});
