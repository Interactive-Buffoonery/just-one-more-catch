# Playthrough CSV downloads

This follow-up to the private journal adds two downloads to each playthrough’s Dashboard menu. Both are available for guest data and account data. The selected playthrough is the only one exported; the open run uses current in-memory edits through the existing export snapshot path.

- **Download playthrough (CSV)** exports individual Pokémon, including duplicates, with their current species, form, nickname, level, gender, shiny state, held item, note, party/box and manually entered acquisition details. Species completion marks without an individual record appear as separate “Species completion” rows with personal fields blank. This is a Pokémon tracking table, not a complete backup of chapters or every playthrough setting; JSON remains the full backup.
- **Download journal (CSV)** exports the same individual acquisition rows and standalone notes shown in the journal, newest date first and unknown dates last. It does not create rows from caught toggles. Dates remain literal calendar dates with blanks for unknown values; no catch time or location is inferred.

Both CSVs include game, playthrough start date and playthrough ID for context. UTF-8 BOM and RFC 4180 quoting preserve names, commas, quotes and multiline notes. Text that could become a spreadsheet formula receives a leading apostrophe. Downloaded files contain personal notes and locations and are not automatically shared. The existing all-playthrough caught CSV stays unchanged.

No backend, schema, import or sharing changes are included. CSV re-import is outside this change. No release wording is approved for this follow-up yet.
