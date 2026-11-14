# Playthrough CSV downloads

The Dashboard menu offers two downloads for each guest or account playthrough. Export only the selected run; use the existing export snapshot path so the open run includes current in-memory edits.

- **Download playthrough (CSV)** includes individual Pokémon and duplicates: current species, form, nickname, level, gender, shiny state, held item, note, party/box and manual acquisition details. Completion marks without individual records become “Species completion” rows with personal fields blank. JSON remains the full backup, including chapters and playthrough settings.
- **Download journal (CSV)** includes the journal's individual acquisition rows and standalone notes, newest dates first and unknown dates last. Caught toggles create no rows. Keep calendar dates literal and unknown values blank; never infer catch time or location.

Both include game, playthrough start date and ID. Preserve UTF-8 BOM, RFC 4180 quoting for commas, quotes and multiline notes, and a leading apostrophe for text that could become a spreadsheet formula. Files contain personal notes and locations; never share them automatically. Keep the all-playthrough caught CSV unchanged. CSV re-import is unsupported.
