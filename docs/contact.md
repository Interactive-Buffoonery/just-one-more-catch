# Contact form

The page at `/contact/` calls the `api.runs.contact` action. It accepts an optional reply
email and a message, and never accepts attachments.

Spam checks run on the server before a message is stored or an email is queued:

- A hidden website field discards submissions that fill the bot trap.
- Blank messages, invalid reply addresses and oversized fields are rejected.
- Repeating the latest identical message and reply address does not store or
  notify twice.
- Anonymous submissions require a server-verified Turnstile proof with the
  expected action, hostname and browser visitor value before accepting a message.
- Each signed-in account or verified browser visitor can send two messages
  immediately and replenishes three messages per hour.

The Convex rate-limiter component applies these limits transactionally. Requests
that hit a limit return a wait time without storing a message, recording a
contact event or scheduling email. The page keeps the draft and shows when to
try again. Limits live in `convex/contactSpam.ts`.

These controls bound accepted submissions and notifications per caller; they do
not stop requests from reaching Convex. Browser visitor values can rotate, but
each anonymous submission still needs a fresh successful Turnstile proof. There
is no site-wide notification cap or IP-based blocking. See [deployment.md](deployment.md#turnstile) for the
required Turnstile site key, backend secret and hostname configuration. Inactive
caller quota records are cleaned up after two days.

Run `pnpm test:convex` for the backend spam checks and `pnpm check` for form
validation, repeat-click prevention, draft retention and retry copy. Deployment
must include the registered rate-limiter component with the backend before the
new form is served. Deploy manually with `pnpm run deploy`.
