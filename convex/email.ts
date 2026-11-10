import { env, internalAction } from "./_generated/server";
import { v } from "convex/values";

export const notify = internalAction({
  args: { email: v.string(), message: v.string() },
  handler: async (_ctx, { email, message }) => {
    if (!env.RESEND_API_KEY || !env.CONTACT_TO) {
      console.warn("Contact email skipped: RESEND_API_KEY or CONTACT_TO is not set");
      return null;
    }
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Just One More Catch <notify@mail.justonemorecatch.app>",
        to: env.CONTACT_TO,
        reply_to: email || undefined,
        subject: "New message from Just One More Catch",
        text: `${message}\n\nFrom: ${email || "no email given"}`,
      }),
    });
    if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
    return null;
  },
});
