# Personal catch details and journal

The Journal button in Journey's existing tools row and the selected Dashboard
playthrough's menu open the same sheet. Pokémon rows use the existing editor;
notes have their own two-field editor. Closing the journal restores Journey's
scroll and keyboard focus. Guest Journey and Boxes retain their sign-in gates.

## Storage contract

- `mons[].acquisition?: { method?, day?, place? }` belongs to an individual ID.
  Methods are `caught`, `hatched`, `gift`, `trade`, `other`. All fields are manual
  and optional. Place is plain text (120 characters); suggestions come from the
  current pack and fill only when selected. This means an in-game place, not a
  device location. No geolocation permission or new analytics is used.
- `journalEntries?: { id, day?, text }[]` holds independent personal notes.
  IDs are stable, text is plain text (500 characters), maximum 200 notes per run.
  Notes are not automatically linked to Pokémon and survive Pokémon removal.
- `day` is an actual calendar date in `YYYY-MM-DD`, never a timestamp. It is
  displayed without UTC conversion. Blank means unknown; Today is an explicit
  local-calendar action. Known dates sort newest first, unknown last. Stable ID
  order within one day does not imply a catch time.
- There is no event table, automatic catch/evolution/trade log, inferred data,
  historical species snapshot, or backfill. The journal derives Pokémon rows
  from the current individual records. Duplicate records stay separate. A
  correction changes the row in place. Clearing all acquisition fields removes
  that row; removing the individual removes its row after confirmation.
- Species caught flags remain independent completion flags. Checking, unchecking,
  and importing them never creates personal history or deletes personal fields.
  Undo retains a newly added individual if it now has acquisition details.

Existing JSON states need no database schema migration: fields are optional
inside the owner-protected state string. The server validates them and keeps the
512 KiB total limit. Personal edits reserve 16 KiB for ordinary quick tracking.
Older clients that omit `journalEntries` preserve the stored array; explicit `[]`
clears it. Existing clients spread individual record fields on load/save, so the
nested acquisition object survives. Whole-state saves retain the application's
existing last-write-wins behavior; simultaneous edits are not a merge log.

Guest storage and sign-in migration retain the same JSON fields, although guests
cannot author them through gated views. Account JSON export includes them,
including active unsaved changes. The caught CSV remains species-only. Export is
not a general JSON restore facility: save-file imports still import caught flags.
Deleting a playthrough/account deletes its state and journal with it.

## Adjacent work boundaries

Save refresh (separate PR #151) must change only caught completion in the original
parsed state and preserve `mons[].acquisition` and `journalEntries`. It must not
create acquisition fields from file times, game clocks, met-location IDs, species
flags, or a playthrough's start date. Test that helper when integrating its PR.

Sharing is separate. Any public response must use an explicit allowlist and omit
both fields; never return or spread the private state. The existing dashboard
summary excludes both, but is not proof for a future sharing serializer. No
sharing UI, share API, save reader, or save-refresh implementation changes here.

## Verification and release

Start `pnpm dev --host 127.0.0.1 --port 5187`, then run
`node scripts/check_journal_browser.mjs` (isolated account fixtures, screenshots
in `.cache/journal-screenshots`). Run `pnpm check`, `pnpm test:convex`, `pnpm check:styles`, and the Convex TypeScript
check. Drive Journey and Dashboard entry, create/edit/delete/undated notes,
acquisition correction/clearing/removal, duplicate records, caught toggles/undo,
export, account switching and guest migration. Verify keyboard dismissal, focus,
scroll restoration, Dashboard focus after Escape/Done, a deferred Journal load
that must preserve a newer start-date editor, and overflow at 390px and desktop in both themes. Browser
fixtures test the actual renderer with isolated Bridge data; cloud persistence
needs a signed-in deployment check before release.

Match the approved A mockup; keep the existing quick catch action unchanged.
No new route, tab, mandatory form, photos, tags, GPS, or public journal in v1.
What's New wording requires Sarah's approval before deployment.

Approved release wording: “Added the ability to keep a private journal for each playthrough”
