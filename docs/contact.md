# Contact form

`/contact/` calls `api.runs.contact` with an optional reply email and a message; attachments are never
accepted. Server checks run before storage or email scheduling:

- Discard a filled hidden website field; reject blank messages, invalid reply addresses and oversized fields.
- Do not store or notify twice for the latest identical message and reply address.
- Require anonymous callers to supply a fresh server-verified Turnstile proof with the expected action, hostname and browser visitor value.
- Allow each signed-in account or verified browser visitor two messages immediately, replenishing three per hour.

The Convex rate-limiter applies quotas transactionally in `convex/contactSpam.ts`. A limited request returns a
wait time without storage, a contact event or email. Keep the draft and show when to retry. Clean up inactive
caller quotas after two days.

These limits bound accepted submissions per caller, not requests reaching Convex. Visitor values can rotate;
there is no site-wide notification cap or IP blocking. Configure the Turnstile site key, backend secret and
hostname as described in [deployment.md](deployment.md#turnstile).

Run `pnpm test:convex` for spam checks and `pnpm check` for validation, repeat-click prevention, draft
retention and retry copy. Deploy the backend with its registered rate-limiter before serving the form,
manually through `pnpm run deploy`.
