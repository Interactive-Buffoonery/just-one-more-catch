# Personal catch details and journal

Players can note how and where they got each Pokémon, and keep free-form notes for a playthrough. Journey's Journal button and the Dashboard playthrough menu open the same sheet. Pokémon rows use the existing editor and notes get a small two-field editor. When the sheet closes, we put Journey's scroll position and keyboard focus back where they were. Guests still see the sign-in prompt on Journey and Boxes.

## What we store

Everything here is typed by the player. We never fill it in from save files, game clocks, met-location IDs, caught flags or the start date, because a guess would look like a fact.

- **Catch details** live on each individual Pokémon as `mons[].acquisition?: { method?, day?, place? }`. Every field is optional. The methods are `caught`, `hatched`, `gift`, `trade` and `other`. Place is plain text of up to 120 characters. The pack's place suggestions only fill in when picked, and they mean in-game places. We don't ask for location permission or add analytics.
- **Notes** live in `journalEntries?: { id, day?, text }[]`. Each note is plain text of up to 500 characters, with up to 200 notes per playthrough. Notes stand on their own, so they stay when a Pokémon is removed.
- **Dates** are real `YYYY-MM-DD` calendar days, shown without any UTC shift. A blank date means unknown, and Today uses the player's local calendar. We sort known dates newest first and unknown ones last. The order within a day doesn't imply a catch time.

The journal's Pokémon rows come straight from the current individuals, with duplicates kept separate. Editing a row changes it in place, and clearing its details removes the row. Removing the Pokémon removes its row too, after the player confirms. We keep no event log, history or inferred data, so there's nothing to backfill.

Caught flags are separate from all of this. Toggling caught or importing a save never creates history or deletes these fields, and undo keeps a new Pokémon that already has details.

## Saving and privacy

These fields sit inside the owner-protected JSON state, so they need no database migration. The server checks them within the 512 KiB state limit and keeps 16 KiB free for ordinary tracking. If a save leaves out `journalEntries`, we keep the stored notes; an explicit `[]` clears them. Whole-state saves are last-write-wins, and concurrent edits are not merged.

Guest storage and the move to an account on sign-in keep these fields, even though guests can't write them. The account JSON export includes unsaved changes. The caught CSV stays species-only, and save import still brings in caught flags only. Deleting a playthrough or an account deletes its journal.

Refreshing from a save changes only caught flags and keeps `mons[].acquisition` and `journalEntries`. If you change refresh behaviour, test its helper.

Catch details and notes are private. Any public response must allowlist its fields and leave both out. Never return or spread the private state. The Dashboard summary being safe doesn't prove another serializer is.

## Checking changes

Start `pnpm dev --host 127.0.0.1 --port 5187`, then run `node scripts/check_journal_browser.mjs`. It uses isolated account fixtures and saves screenshots to `.cache/journal-screenshots`. Then run `pnpm check`, `pnpm test:convex`, `pnpm check:styles` and the Convex TypeScript check.

By hand, try both ways into the sheet, and run through:

- Notes: creating, editing and deleting them, including ones with no date.
- Catch details: correcting and clearing them, removing a Pokémon, and duplicates.
- Caught toggles and undo.
- Exports, switching accounts and moving guest data to an account.
- Keyboard: dismissing the sheet, focus and scroll coming back, and Dashboard focus after Escape or Done. If the journal loads late, it must not overwrite a start-date edit already in progress.
- Layout at 390px and desktop width, in both themes.

The browser fixtures use the real renderer with isolated Bridge data. Before a release, check that a signed-in change saves on a real deployment.
