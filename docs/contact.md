# Contact form

The page at `/contact/` calls `api.runs.contact`. It accepts an optional reply
email and a message, and never accepts attachments.

Spam checks run on the server before a message is stored or an email is queued:

- A hidden website field discards submissions that fill the bot trap.
- Blank messages, invalid reply addresses and oversized fields are rejected.
- Repeating the latest identical message and reply address does not store or
  notify twice.
- Each signed-in account can send two messages immediately and replenishes
  three messages per hour.
- Guests share a bucket allowing five immediate messages and replenishing
  twenty per hour. Email addresses and browser IDs do not grant a new bucket.
- The whole site allows five immediate messages, replenishes five per minute,
  and accepts at most twenty messages per hour-long window.

The Convex rate-limiter component applies these limits transactionally. Requests
that hit a limit return a wait time without storing a message, recording a
contact event or scheduling email. The page keeps the draft and shows when to
try again. Limits live in `convex/contactSpam.ts`.

These controls bound accepted submissions and notifications; they do not stop
requests from reaching Convex. There is no CAPTCHA or IP-based blocking. If the
site needs that later, verify a challenge on the server before accepting a
submission, and keep these limits as a second layer.

Run `pnpm test:convex` for the backend spam checks and `pnpm check` for form
validation, repeat-click prevention, draft retention and retry copy. Deployment
must include the registered rate-limiter component with the backend before the
new form is served. Normal manual deployment remains `pnpm run deploy`.
