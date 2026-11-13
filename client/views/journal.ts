import { $, esc } from "../dom";
import { byN, CHAPTERS, dumpRun, R, ui, ver, ymd } from "../game";
import { mon } from "../parts";
import { ACQUISITION_METHODS, journalItems, MAX_JOURNAL_ENTRIES, MAX_JOURNAL_TEXT, validateJournal } from "../../shared/journal";
import { MAX_RUN_BYTES, runBytes } from "../../shared/limits";
import type { JournalEntry } from "../../shared/journal";
import type { Run } from "../game";

export const JOURNAL_ICON = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M5 3h14v18H5zM8 3v18M11 8h5M11 12h5"/></svg>`;
const PENCIL = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 20h4l10-10-4-4L4 16z"/></svg>`;
export const journalDay = (day: string) => {
  const [y, m, d] = day.split("-").map(Number);
  const date = new Date(0);
  date.setFullYear(y, m - 1, d);
  date.setHours(12, 0, 0, 0);
  return date.toLocaleDateString(undefined, { dateStyle: "long" });
};

export function checkPersonalSave(next: Run) {
  validateJournal(next);
  if (runBytes(dumpRun(next)) > MAX_RUN_BYTES - 16 * 1024)
    throw new Error("This playthrough is nearly full. Shorten or remove some notes before adding more details.");
}

export function sheetError(error: unknown) {
  $("#personal-error").textContent = error instanceof Error ? error.message : "Couldn't save. Try again.";
  $("#personal-error").focus();
}

export function fillJournal() {
  const r = R(), groups = new Map<string, string[]>();
  for (const item of journalItems(r.mons, r.journalEntries)) {
    let row: string;
    if (item.kind === "mon") {
      const m = r.mons.find(m => m.id === item.id)!, p = byN[m.n];
      if (!p) continue;
      const a = m.acquisition!, siblings = r.mons.filter(x => x.n === m.n);
      row = `<button class="journal-row" data-editmon="${m.id}" data-k="journal-mon-${m.id}">${mon(p, m.shiny, m.form || p.forms?.[0]?.id)}<span class="grow"><span class="journal-what">${esc(m.nick || p.name)}${m.nick ? ` <span class="muted small">${esc(p.name)}</span>` : ""}${siblings.length > 1 ? ` <span class="journal-duplicate">${siblings.indexOf(m) + 1} of ${siblings.length}</span>` : ""}</span><span class="journal-where">${esc([a.method && ACQUISITION_METHODS[a.method], a.place].filter(Boolean).join(" · "))}</span></span><span class="journal-meta">Edit</span></button>`;
    } else {
      row = `<button class="journal-row" data-journalnote="${esc(item.entry.id)}" data-k="journal-note-${esc(item.entry.id)}"><span class="journal-note-icon">${PENCIL}</span><span class="grow journal-note-text">${esc(item.entry.text)}</span><span class="journal-meta">Edit</span></button>`;
    }
    const day = item.day || "";
    if (!groups.has(day)) groups.set(day, []);
    groups.get(day)!.push(row);
  }
  $("#sheetbody").innerHTML = `<section class="journal-sheet"><div class="journal-head"><div><span class="journal-kicker">${esc(ver().name)}</span><h2 class="lg" id="sheet-title">Journal</h2></div><span class="journal-private">Only you</span></div>
    <button class="app-quiet" data-journalnote="new" data-k="journal-add" ${r.journalEntries.length >= MAX_JOURNAL_ENTRIES ? "disabled" : ""}>+ Add a note</button>
    ${groups.size ? [...groups].map(([day, rows]) => `<section aria-label="${esc(day ? journalDay(day) : "Date unknown")}"><h3 class="journal-day">${day ? `<time datetime="${day}">${esc(journalDay(day))}</time>` : "Date unknown"}</h3><div class="journal-list">${rows.join("")}</div></section>`).join("") : `<p class="journal-empty muted">Add details to a Pokémon or write a note to start your journal.</p>`}
    ${r.journalEntries.length >= MAX_JOURNAL_ENTRIES ? `<p class="small muted">Your journal holds up to ${MAX_JOURNAL_ENTRIES} notes. Edit or remove a note to make room.</p>` : ""}
    <button class="app-quiet journal-done" data-close="1">Done</button></section>`;
}

export function fillJournalNote(id?: string) {
  const entry = R().journalEntries.find(e => e.id === id);
  $("#sheetbody").innerHTML = `<h2 class="lg" id="sheet-title">${entry ? "Edit note" : "Add a note"}</h2>
    <label class="field"><span>Note</span><textarea id="j-text" maxlength="${MAX_JOURNAL_TEXT}">${esc(entry?.text || "")}</textarea></label>
    <label class="field"><span>Date <span class="muted small">optional</span></span><span class="journal-date"><input id="j-day" type="date" max="${ymd(new Date())}" value="${esc(entry?.day || "")}"><button type="button" class="quietbtn" data-today="j-day">Today</button></span></label>
    <p id="personal-error" class="personal-error" role="alert" tabindex="-1"></p>
    <div class="hv-actions"><button class="app-primary grow" data-savejournalnote="1">Save</button><button class="app-quiet" data-journalback="1">Cancel</button>${entry ? `<button class="app-quiet" data-deletejournalnote="${esc(entry.id)}">Delete</button>` : ""}</div>`;
}

export function saveJournalNote() {
  const day = $("#j-day") as HTMLInputElement;
  if (!day.reportValidity()) return false;
  const r = R(), id = ui.sheet.id || crypto.randomUUID(), text = ($("#j-text") as HTMLTextAreaElement).value.trim();
  const entry: JournalEntry = { id, ...(day.value ? { day: day.value } : {}), text };
  const entries = r.journalEntries.some(e => e.id === id) ? r.journalEntries.map(e => e.id === id ? entry : e) : [...r.journalEntries, entry];
  checkPersonalSave({ ...r, journalEntries: entries });
  r.journalEntries = entries;
  return true;
}

export const acquisitionPlaces = () => [...new Set(CHAPTERS.flatMap(c => c.places))];
