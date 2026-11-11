# Second-opinion brief

Read-only. Write only the output file named in your task.

A first reviewer (a different model) read cached Bulbapedia location pages and
flagged places where the app lists a Pokémon as catchable before the player can
physically reach it. Check each flag yourself. Don't trust the first
reviewer's reasoning.

Read `reviewer-brief.md` next to this file first. Its rules for what counts
as a gate apply here too, but its Output section doesn't: use the output format below.
Each input entry has the first reviewer's `verdict`, `needs`, `species`,
`quote`, `inferred`, `unmodeled` and `note`. It also has the context:
- `wiki`: the cached page
- `chapter`
- `area_needs`
- `row_needs`

For each entry, decide:
- `confirm`: the flag is real, the needs are right, and it isn't already
  covered by the chapter, area or row needs. Correct the needs or species if
  they're slightly off.
- `reject`: not a real blocker, or already covered. Say why.
- `unclear`: the page can't settle it. Say exactly what a tester should check
  in the game.

For entries the first reviewer marked unclear, try to settle them from the
page. A confirm needs a verbatim quote of at least 6 words.

Output: a JSON array, in the same order as the input:
`{"pack", "area", "call": "confirm|reject|unclear", "needs": [...], "species": null|[...], "quote", "note"}`.
Cover every entry, and finish with counts per call.
