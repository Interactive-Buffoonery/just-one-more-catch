# Game Boy and Game Boy Color access review

This review covers the new Red/Blue (`rb`), Yellow (`yellow`) and Gold/Silver
(`gs`) packs. Crystal was already supported. Tracking support does not enable
save-file import; follow [the import checklist](save-import.md) separately.

## Evidence and coverage

Ten first-pass batches covered every generated display area exactly once:
73 Red/Blue areas, 73 Yellow areas and 93 Gold/Silver areas. The input retained
all rows, methods, versions and chapter metadata. Gold/Silver's merged display
areas were checked against raw source floors where a finding depended on them.

The first pass used Claude Sonnet. Codex independently checked non-ok findings
against the original scripts, map data and the app's actual chapter, event,
HM-badge, kit and encounter-method rules. A separate coordinator check found a
Yellow fishing issue that the first pass had marked ok. Detailed source links
are in [Red/Blue](../sources/rb.md), [Yellow](../sources/yellow.md) and [Gold/Silver](../sources/gs.md); unsettled paths and concrete tester checks
are in [Red/Blue open questions](../sources/rb.md#open-questions), [Yellow open questions](../sources/yellow.md#open-questions) and [Gold/Silver open questions](../sources/gs.md#open-questions).

Original sources were pinned to:

- `pret/pokered`: `130ac3fa5493fb29a8005e8439fd31b4826e46af`
- `pret/pokeyellow`: `b452f2ab07185075140061c5084ab866d5e4a794`
- `pret/pokegold`: `f2cde36f49b994c143bfd18582182302fdc76492`

Bulbapedia and several other walkthrough sources were unavailable. The review
used available original sources and saved walkthrough text without bypassing
blocks. Inputs and source evidence were kept in `.cache/game-audits/`.
This adapted source-based review did not run the older wiki-cache pipeline or
claim that `scripts/access_audit.py check` passed. Coverage/order and quoted
source excerpts were checked directly instead.

All 49 first-pass non-ok findings received a second check, along with the
additional Yellow Cerulean fishing discrepancy. Across those 50 decisions,
four candidate corrections were supported, 32 were rejected and 14 remained
unclear. Three supported corrections were applied; Yellow Cerulean fishing
remains on the disagreement checklist. A rejected proposal means its evidence
did not justify changing the gate, not that every possible route was proven.

## Confirmed changes

- Red/Blue Cerulean City: Surf is required to reach fishing land. Six rod rows
  gained Surf; the Jynx trade is unchanged (`e94acdf`).
- Gold/Silver Route 13: Cut is required to enter its enclosed grass. Ten walk
  rows across seven species gained `cut-hm`; fishing and Surf are unchanged
  (`6e7a233`).
- Yellow Route 12: the Poké Flute is required for grass south of Snorlax. Seven
  walking rows gained `flute`; fishing and Surf are unchanged (`5d40ec9`).

## Rejected proposals and unresolved paths

Several terrain searches omitted prerequisites outside the destination map.
The second review rejected removing Bill before Route 5, Strength before upper
Victory Road and Dragon's Den, and Waterfall before eastern Route 27/26 and
Victory Road. It also rejected early Kanto through Victory Road Gate's guarded
east exit and the construction-blocked Fuchsia sea route.

Other corrected models included initially hidden fallen Ice Path boulders,
Burned Tower's real Rock Smash objects, and compulsory cave entrance warps.
Tin Tower's version-specific wing flags and Lapras's existing rival event
already cover the proposed extra or reduced requirements.

Some proposals remain unresolved rather than accepted: Yellow Safari interior
paths and Seafoam currents; Gold/Silver Dark Cave and Mt. Mortar paths,
alternate Blackthorn/Route 45 access, Route 8 grass, and northbound Route 2
alternatives to Pewter/Route 3, Yellow dock Super Rod timing, and an alternate
Dark Cave approach to Route 44. Yellow Cerulean fishing has two supporting Codex
source checks but conflicts with the original first-pass ok verdict. Its data
is unchanged under the audit skill's disagreement rule. See the tester checks
in sources/<pack>.md#open-questions before treating those rows as fully verified.

## Verification limits

This is source review and generated-data validation, not gameplay proof.
Several ok verdicts came from lighter script inspection or approximate map
models. The review did not exhaustively re-derive every encounter rate, time
condition, version split or tile. Money, party capacity, temporary ship access
and some other game conditions remain outside the product's model.

Progression interactions, live account sync and the route-specific gameplay
checks remain separate checkpoints. Subsequent GB/GBC save import work verified
local guest creation and persistence, simulated-account ownership, real-worker
parsing and a genuine pre-starter Red save; see
[save import validation](game-boy-save-validation.md). That evidence does not
settle the access questions above. Builds and local commits are not production
deployment receipts.
