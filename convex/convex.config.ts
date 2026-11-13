import { defineApp } from "convex/server";
import { v } from "convex/values";
import rateLimiter from "@convex-dev/rate-limiter/convex.config.js";

const app = defineApp({
  env: {
    TURNSTILE_SECRET_KEY: v.optional(v.string()),
    TURNSTILE_HOSTNAMES: v.optional(v.string()),
    RESEND_API_KEY: v.optional(v.string()),
    CONTACT_TO: v.optional(v.string()),
    CLERK_SECRET_KEY: v.optional(v.string()),
  },
});
app.use(rateLimiter);
export default app;
