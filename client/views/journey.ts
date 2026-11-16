import { journeyHuntButton } from "./hunt";
import { shareButton } from "../share-controls";
import { JOURNAL_ICON } from "./journal";
import { $, esc } from "../dom";
import {
  badgeName,
  badgesWord,
  byName,
  cap,
  CHAPTERS,
  chapterNeeds,
  currentChap,
  DAYS,
  DEX,
  e4,
  eventDone,
  EVENTS,
  forced,
  gameTime,
  gameClock,
  has,
  inJourney,
  isHere,
  isBadge,
  laterEvents,
  needLabel,
  NOT_HERE,
  nowTime,
  P,
  R,
  regionalCaught,
  run,
  unlocked,
  ver,
  visible,
  isGuest,
} from "../game";
import {
  badgeIcon,
  badgeRow,
  chapterGroups,
  chapterSpots,
  CHEV,
  CLOCK_ICON,
  fold,
  kitGroup,
  monRow,
  placeLabel,
  placeCard,
  SLIDERS_ICON,
  spots,
  strip,
  uniq,
} from "../parts";
import { NoRun } from "./runs";

/* ---- Journey (home) ---- */
export function fillClock(mode: string) {
  const c = R().clock,
    g = gameClock(c),
    two = (n: number) => String(n).padStart(2, "0"),
    zones: string[] = (Intl as any).supportedValuesOf?.("timeZone") ?? [];
  if (c.tz && !zones.includes(c.tz)) zones.unshift(c.tz);
  $("#sheetbody").innerHTML = `<h2 id="sheet-title">${ver().name}'s clock</h2>
    <div class="card" style="margin-top:12px;text-align:center;background:var(--bg)"><div class="small muted">Your game right now</div><div class="big-time">${g.hour % 12 || 12}:${two(g.minute)} ${g.hour < 12 ? "AM" : "PM"}</div><div style="font-weight:700">${cap(DAYS[g.day])} · <span class="tag time">${cap(gameTime())}</span> <span class="small muted">night at ${(P().nightFrom as number) - 12} PM</span></div></div>
    <div class="small muted" style="margin:16px 0 6px;font-weight:700">Show Pokémon for</div>
    <div class="seg3 wide" role="group" aria-label="Show Pokémon for this time of day"><button data-time="auto" aria-pressed="${R().timeAuto}">Auto (${cap(gameTime())})</button>${["morning", "day", "night"].map((x) => `<button data-time="${x}" aria-pressed="${!R().timeAuto && R().time === x}">${cap(x)}</button>`).join("")}</div>
    <div class="small muted" style="margin:16px 0 6px;font-weight:700">How your game keeps time</div>
    <div class="seg3 wide" role="group" aria-label="How your game keeps time"><button data-clockmode="device" aria-pressed="${mode === "device"}">Follow a time zone</button><button data-clockmode="manual" aria-pressed="${mode === "manual"}">Set it myself</button></div>
    ${
      mode === "manual"
        ? `<div class="row2"><label class="field"><span>Time</span><input id="c-time" type="time" value="${two(g.hour)}:${two(g.minute)}" required></label><label class="field"><span>Day</span><select id="c-day">${DAYS.map((d, i) => `<option value="${i}" ${i === g.day ? "selected" : ""}>${cap(d)}</option>`).join("")}</select></label></div><p class="small muted" style="margin:8px 0 0">Enter the time and day your game shows.</p>`
        : `<label class="field"><span>Time zone</span><select id="c-tz"><option value="">This device (${Intl.DateTimeFormat().resolvedOptions().timeZone})</option>${zones.map((z) => `<option ${z === c.tz ? "selected" : ""}>${z}</option>`).join("")}</select></label>`
    }
    <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:16px"><button class="chip" data-close="1">Cancel</button><button class="app-primary" data-saveclock="1">Save</button></div>`;
}
const SECTIONS = [
  ["next", "Next catch", "Disabling this removes the big suggestion card"],
  [
    "near",
    "Selected area",
    "Disabling this hides the selected area from Nearby areas",
  ],
  [
    "chapter",
    "Nearby areas",
    "Disabling this hides the other places in your current chapter",
  ],
  [
    "evolve",
    "Evolution options",
    "Disabling this hides Pokémon you can get by evolving ones you've caught",
  ],
  [
    "story",
    "Story check",
    "Disabling this hides the question about where you are in the story. It stays while Your journey is hidden, so you can still mark story steps",
  ],
  ["journey", "Your journey", "Disabling this hides the Your journey section"],
  ["dex", "Dex progress", "Disabling this hides the Dex progress section"],
];
const focusSwitch = () => `<div class="seg3 focus" role="group" aria-label="Journey focus">${["story", "catch"].map((v) => `<button type="button" data-journeyfocus="${v}" aria-pressed="${R().journeyFocus === v}">${v === "story" ? "Story" : "Catch here"}</button>`).join("")}</div>`;
const toggle = (on: boolean, title: string, note: string, attr: string) =>
  `<button class="sw" role="switch" aria-checked="${on}" ${attr}><span class="grow"><b>${title}</b>${note ? `<small>${note}</small>` : ""}</span><span class="tog${on ? " on" : ""}" aria-hidden="true"></span></button>`;
export function fillCustom() {
  const r = R();
  $("#sheetbody").innerHTML =
    `<h2 id="sheet-title">Customize this ${ver().name} playthrough</h2>
    ${isGuest() ? "" : toggle(r.view !== "dexonly", "Journey tab", "", `data-journeytab="1"`)}
    ${!isGuest() && r.view !== "dexonly" ? `<div class="sw"><b class="grow">Start on</b><div class="seg3" role="group" aria-label="Start on">${["journey", "dex"].map((v) => `<button data-startview="${v}" aria-pressed="${r.view === v}">${v === "journey" ? "Journey" : "Dex"}</button>`).join("")}</div></div><div class="sw"><b class="grow">Journey focus</b>${focusSwitch()}</div><p class="eyebrow">Journey sections</p>
    ${SECTIONS.filter(([k]) => k === "evolve" || k === "dex").map(([k, t, n]) => toggle(!r.hidden.has(k), t, n, `data-hide="${k}" data-k="h-${k}"`)).join("")}
    ${toggle(r.showLater, "Show Pokémon I can't reach yet", `List them in each section, not under "Come back later"`, `data-showlater="1" data-k="h-later"`)}
    <div class="sw"><span class="grow"><b>${badgesWord()[0].toUpperCase()}${badgesWord().slice(1)} and items</b><small>Always shown: this is how the app knows what you can catch</small></span><span class="lock">Always on</span></div>
    ` : ""}
    <p class="eyebrow">Dex</p>
    ${toggle(r.trackForms, "Forms", "", `data-dexoption="trackForms" data-k="h-forms"`)}
    ${toggle(r.trackGenders, "Genders", "", `data-dexoption="trackGenders" data-k="h-genders"`)}
    ${r.trackForms ? toggle(r.trackTraded, "Traded forms", "", `data-dexoption="trackTraded" data-k="h-traded"`) : ""}
    ${ver().gen !== "Gen 1" ? toggle(r.trackShinyHunts, "Shiny hunts", "", `data-dexoption="trackShinyHunts" data-k="h-hunts"`) : ""}
    <div style="display:flex;justify-content:flex-end;margin-top:12px"><button class="chip" data-close="1">Done</button></div>`;
}
/* ---- Story events: one question on top, the full list in Your journey ---- */
function beat(id: string) {
  const e = EVENTS[id],
    done = eventDone(id),
    lock = forced(id),
    why = !lock
      ? ""
      : e.by === "Elite Four" && has(e.by)
        ? "You beat the Elite Four"
        : e.by && isBadge(e.by) && has(e.by)
          ? `You have the ${badgeName(e.by)}`
          : e.by && EVENTS[e.by] && has(e.by)
            ? `Shown by: ${EVENTS[e.by].label}`
            : "A later step shows it's done";
  return `<button class="beat" id="ev-${id}" data-event="${id}" data-k="ev-${id}" aria-pressed="${done}" ${lock ? `aria-disabled="true"` : ""}><span class="bx" aria-hidden="true"></span><span class="bt">${e.label}${why ? `<small>${why}</small>` : ""}</span>${done && !R().events.has(id) ? `<span class="auto" aria-hidden="true">auto</span><span class="sr">, marked done for you</span>` : ""}</button>`;
}
const beats = (i: number) => {
  const list = Object.values(EVENTS).filter((e) => e.chap === i);
  return list.length
    ? `<div class="beats" role="group" aria-label="Story steps, ${CHAPTERS[i].title} chapter">${list.map((e) => beat(e.id)).join("")}</div>`
    : "";
};
// Unticking an event also unticks the ticked events that depend on it.
export function untick(id: string) {
  R().events.delete(id);
  laterEvents(id)
    .filter((e) => eventDone(e.id))
    .forEach((e) => untick(e.id));
}
const LOCK = `<svg class="lockic" viewBox="0 0 12 12" width="11" height="11" aria-hidden="true"><rect x="2" y="5.5" width="8" height="5.5" rx="1.2" fill="currentColor"/><path d="M4 5.5V4a2 2 0 014 0v1.5" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>`;
const ITEMS = (k: string) =>
  k.endsWith("-rod") || k === "bicycle" || k === "island-scan";
const count = (got: number, of: number) =>
  `<span><b>${got}</b> <span class="muted">/ ${of}</span></span>`;
export function Journey() {
  if (!run) return NoRun();
  const r = R(),
    cur = currentChap(),
    wide = matchMedia("(min-width:960px)").matches;
  const hide = r.hidden,
    all = spots(),
    curS = chapterSpots(all, cur, () => true);
  const evolve = DEX.filter(
    (p) =>
      visible(p) &&
      !r.caught.has(p.n) &&
      p.from &&
      r.caught.has(byName[p.from]?.n) &&
      p.evo &&
      !/Trade|Level up at/.test(p.evo),
  );
  const picker = CHAPTERS.map((c, i) => {
    const list = unlocked(i) ? c.places.filter((p) => !NOT_HERE.test(p)) : [];
    return list.length
      ? `<optgroup label="Chapter ${i + 1}: ${c.title}">${list.map((p) => `<option ${p === r.here ? "selected" : ""} value="${esc(p)}">${esc(p)}${placeLabel(p, all[p]) && ` · ${placeLabel(p, all[p])}`}</option>`).join("")}</optgroup>`
      : "";
  }).join("");
  const badges = P().badges,
    badgesOn = badges.filter((b) => r.badges.has(b[0])).length,
    kitOn = P().kit.filter((k) => r.kit.has(k[0])).length;
  return focusLayout(`<div class="jny"><div class="colmain">
  <section class="s-where" aria-labelledby="where-h">
    <div class="where-k">Chapter ${cur + 1} · ${CHAPTERS[cur].title}</div>
    <div class="where-row">
      <h1 class="lg" id="where-h">${esc(r.here)}</h1>
      <span class="where-chev" aria-hidden="true"><svg viewBox="0 0 10 6"><path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.8"/></svg></span>
      <select id="here" data-k="here" aria-label="Selected area">${picker.includes(`value="${esc(r.here)}"`) ? "" : `<option selected disabled>${esc(r.here)}</option>`}${picker}</select>
    </div>
    <div class="where-tools">
      ${journeyHuntButton()}
      ${P().nightFrom ? `<button class="quietbtn" data-clock="1" data-k="clock" aria-label="Game clock: ${cap(nowTime())}, ${cap(DAYS[gameClock(r.clock).day])}. Change">${CLOCK_ICON}<b>${cap(nowTime())}</b> · ${cap(DAYS[gameClock(r.clock).day]).slice(0, 3)}</button>` : ""}
      <button class="quietbtn" data-journal="${r.id}" data-k="journal">${JOURNAL_ICON}Journal</button>
      <button class="quietbtn" data-custom="1" data-k="custom">${SLIDERS_ICON}Customize</button>${shareButton(r.id, ver().name)}
    </div>
  </section>
  ${
    curS.html
      ? `<section class="s-around" aria-labelledby="around-h">
    <div class="sec-h"><h2 class="lg" id="around-h">Nearby areas</h2></div>
    ${curS.left || curS.later ? "" : `<p class="muted">You've caught everything in this chapter.</p>`}
    <div class="places">${curS.html}</div>
  </section>`
      : ""
  }
  </div><aside class="colside">
  <details class="card kit s-kit" ${fold("kit", wide)}>
    <summary class="sumrow">
      <span class="kitbadges" aria-hidden="true">${badges.map((b) => `<img class="${r.badges.has(b[0]) ? "on" : ""}" src="${badgeIcon(b[0])}" alt="" width="19" height="19">`).join("")}</span>
      <span class="grow small"><span class="sr">${badgesWord()[0].toUpperCase()}${badgesWord().slice(1)} and items: </span><b>${badgesOn} of ${badges.length}</b><br>${badgesWord()}<span class="sr">, ${kitOn} of ${P().kit.length} moves and items</span></span>
      ${CHEV}
    </summary>
    <h3>${P().region} ${badgesWord()}</h3>
    ${badgeRow(badges)}
    <div class="chips"><button class="chip" data-badge="Elite Four" data-k="b-e4" aria-pressed="${e4()}">${needLabel("Elite Four")}</button></div>
    ${e4() && P().postgame ? `<h3>${P().postgame![0]}</h3>${badgeRow(P().postgame![1])}` : ""}
    ${kitGroup("Moves you can use", (k) => !ITEMS(k))}${kitGroup("Items", ITEMS)}
    ${
      P().safari &&
      unlocked(CHAPTERS.findIndex((c) => c.places.includes("Safari Zone")))
        ? `<h3>Safari Zone: areas you've placed</h3>
    <p class="small muted">The game lets you place 6 of its 12 areas at a time. Catchable the ones you've chosen:</p>
    <div class="chips">${P()
      .safari!.map(
        (a) =>
          `<button class="chip" data-safari="${a}" data-k="s-${a}" aria-pressed="${r.safari.has(a)}" ${!r.safari.has(a) && r.safari.size >= 6 ? "disabled" : ""}>${a}</button>`,
      )
      .join("")}</div>`
        : ""
    }
  </details>
  ${
    !hide.has("evolve") && evolve.length
      ? `<details class="card evo s-evo" ${fold("evo")}>
    <summary class="sumrow"><span class="grow"><span class="title">Evolution options</span> <span class="muted small">· ${evolve.length}</span><span class="strip">${strip(evolve)}</span></span>${CHEV}</summary>
    <div class="evorows">${evolve.map((p) => monRow(p, null, undefined, true)).join("")}</div>
  </details>`
      : ""
  }
  ${
    R().journeyFocus === "catch"
      ? ""
      : `<section class="s-journey" aria-labelledby="journey-h">
    <div class="sec-h"><h2 class="lg" id="journey-h">Your journey</h2></div>
    <div class="card chaps">
    ${CHAPTERS.map((c, i) => {
      if (!inJourney(i)) return "";
      const open = unlocked(i),
        cs = chapterSpots(all, i),
        n = open ? cs.left : uniq(chapterGroups(i)),
        done = open && !n && !cs.later && !cs.once;
      const label = open
        ? [
            c.places.length &&
              (n || cs.later || cs.once
                ? [n && `${n} to catch`, cs.later && `${cs.later} later`, cs.once && `${cs.once} one-time`]
                    .filter(Boolean)
                    .join(" · ")
                : "All caught"),
          ]
            .filter(Boolean)
            .join(" · ")
        : `${LOCK}${chapterNeeds(i)
            .filter((k) => !has(k))
            .map(needLabel)
            .join(", ")}${n ? ` · ${n} to catch` : ""}`;
      return `<details class="chap" ${fold(String(i), wide && i === cur)}><summary><span class="node ${done ? "done" : open ? "wip" : ""}" aria-hidden="true">${done ? "✓" : i + 1}</span><span class="grow"><span class="t">${c.title}<span class="sr">${done ? ", everything caught" : open ? ", in progress" : ", not reached yet"}</span></span><span class="c">${label}</span></span>${CHEV}</summary>
        ${beats(i)}${
          i === cur
            ? c.places.length
              ? `<p class="pls">${c.places.join(", ")}</p>`
              : ""
            : cs.html && `<div class="places">${cs.html}</div>`
        }</details>`;
    }).join("")}
    </div>
  </section>`
  }
  ${
    hide.has("dex")
      ? ""
      : `<section class="card s-dex" aria-label="Dex progress">
    <div class="dexrow"><h3>${P().region} dex</h3>${count(regionalCaught(), P().regional)}</div>
    <div class="bar"><i style="width:${(regionalCaught() / P().regional) * 100}%"></i></div>
    ${
      e4() && P().national > P().regional
        ? `<div class="dexrow"><h3>National dex</h3>${count(r.caught.size, P().national)}</div>
    <div class="bar"><i style="width:${(r.caught.size / P().national) * 100}%"></i></div>`
        : ""
    }
  </section>`
  }
  </aside></div>`);
}

function focusLayout(html: string) {
  const template = document.createElement("template");
  template.innerHTML = html;
  const root = template.content;
  const get = (selector: string) => root.querySelector<HTMLElement>(selector);
  const story = R().journeyFocus === "story";
  get(".jny")!.classList.add(story ? "story" : "catch");
  get(".where-row")!.insertAdjacentHTML("afterend", focusSwitch());
  const tools = get(".where-tools")!;
  const menu = document.createElement("details");
  menu.className = "ptmenu";
  menu.innerHTML = '<summary aria-label="More">···</summary><div class="menu"></div>';
  const items = menu.querySelector(".menu")!;
  const secondary = tools.querySelector(story ? "[data-clock]" : "[data-journal]");
  if (secondary) items.append(secondary);
  tools.querySelectorAll('[data-custom], [data-act="share"]').forEach((el) => items.append(el));
  const primary = tools.querySelector(story ? "[data-journal]" : "[data-clock]");
  if (primary) tools.prepend(primary);
  const share = items.querySelector('[data-act="share"]');
  if (share) share.insertAdjacentText("beforeend", "Share");
  tools.append(menu);
  const around = get(".s-around");
  if (story) {
    const next = CHAPTERS.findIndex((_, i) => inJourney(i) && !unlocked(i));
    if (next >= 0) {
      const need = chapterNeeds(next).find((k) => !has(k));
      if (need) {
        const badge = P().badges.some(([id]) => id === need);
        get(".colside")!.insertAdjacentHTML("afterbegin", `<section class="card ask gate" aria-labelledby="gate-h"><div class="ask-k">Opens chapter ${next + 1}</div><h2 id="gate-h">${badge ? `<img src="${badgeIcon(need)}" alt="">` : ""}${needLabel(need)}</h2><p class="small muted">${CHAPTERS[next].title} · ${uniq(chapterGroups(next))} to catch</p><button class="app-primary" ${badge ? `data-badge="${need}"` : EVENTS[need] ? `data-event="${need}"` : `data-custom="1"`}>Got it</button></section>`);
      }
    }
    const chapters = root.querySelectorAll<HTMLDetailsElement>(".chap");
    chapters.forEach((chapter) => {
      const i = Number(chapter.dataset.chap);
      chapter.open = i === currentChap();
      if (i === currentChap() && around) {
        chapter.querySelector(".pls")?.remove();
        chapter.append(around.querySelector(".places")!);
        chapter.querySelectorAll<HTMLDetailsElement>(".pl").forEach((p) => p.open = p.classList.contains("here"));
      }
    });
    around?.remove();
    const journey = get(".s-journey");
    if (journey) get(".colmain")!.append(journey);
  } else {
    get(".s-journey")?.remove();
    get(".s-dex")?.remove();
    const here = R().here,
      all = spots();
    if (around && !around.querySelector(".pl.here") && all[here])
      around.querySelector(".places")!.insertAdjacentHTML("afterbegin", placeCard(here, all[here]));
    if (around) {
      around.querySelector(".sec-h")?.remove();
      around.removeAttribute("aria-labelledby");
      around.setAttribute("aria-label", "You are here");
      const near = document.createElement("section");
      near.className = "s-near";
      near.innerHTML = '<div class="sec-h"><h2 class="lg" id="near-h">Nearby areas</h2></div><div class="places"></div><div class="places added"></div>';
      near.setAttribute("aria-labelledby", "near-h");
      around.querySelectorAll(".pl:not(.here)").forEach((p) => near.querySelector(".places")!.append(p));
      const shown = new Set(Array.from(around.querySelectorAll(".pl .title"), el => el.childNodes[0]?.textContent));
      near.querySelectorAll(".pl .title").forEach(el => shown.add(el.childNodes[0]?.textContent));
      near.querySelector(".added")!.innerHTML = R().addedPlaces.filter(p => all[p] && !shown.has(p) && !isHere(p)).map(p => placeCard(p, all[p])).join("");
      near.querySelectorAll<HTMLDetailsElement>(".added .pl").forEach(el => {
        el.open = true;
        const name = el.querySelector(".title")?.childNodes[0]?.textContent || "";
        el.querySelector(".body")?.insertAdjacentHTML("afterbegin", `<div class="sumrow"><button class="app-quiet" data-remove-place="${esc(name)}">Remove</button><span class="grow"></span><button class="chip" data-here-place="${esc(name)}">I'm here</button></div>`);
      });
      near.insertAdjacentHTML("beforeend", '<button type="button" class="quietbtn other" data-other-places="1">Other places</button>');
      get(".colside")!.prepend(near);
    }
  }
  root.querySelectorAll(".here-tag").forEach((el) => el.textContent = "You are here");
  root.querySelectorAll(".pl > .body").forEach((body) => {
    if (body.children.length !== 1) return;
    const fold = body.firstElementChild;
    if (fold?.matches("details.fold") && fold.querySelector("summary")?.textContent?.startsWith("Come back later")) {
      fold.querySelector("summary")!.remove();
      fold.replaceWith(...fold.childNodes);
    }
  });
  return template.innerHTML;
}

export function fillOtherPlaces() {
  const next = CHAPTERS.findIndex((_, i) => !unlocked(i)),
    all = spots();
  $("#sheetbody").innerHTML = `<div class="dexsheet pickstep"><h2 id="sheet-title">Other places</h2><label class="field"><span>Place</span><input type="search" id="other-place-search"></label>${CHAPTERS.map((c, i) => `<details class="fold" ${i === next ? "open data-next" : ""}><summary>${i + 1}. ${esc(c.title)} <span class="n">· ${unlocked(i) ? c.places.length : chapterNeeds(i).filter(k => !has(k)).map(needLabel).join(", ")}</span>${CHEV}</summary><div class="card">${c.places.map(p => `<button type="button" class="spot pick" data-add-place="${esc(p)}"><span class="pn grow">${esc(p)}</span><span class="small muted">${placeLabel(p, all[p])}</span></button>`).join("")}</div></details>`).join("")}<div class="hv-actions hgo"><button type="button" class="app-quiet" data-close="1">Cancel</button></div></div>`;
}
