import { JOURNAL_ICON } from "./journal";
import { $ } from "../dom";
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
  isBadge,
  isHere,
  laterEvents,
  needLabel,
  NOT_HERE,
  nowTime,
  num,
  ONE_TIME,
  P,
  pad,
  R,
  regionalCaught,
  rowStatus,
  run,
  TYPE,
  ui,
  unlocked,
  ver,
  visible,
  isGuest,
} from "../game";
import {
  badgeIcon,
  badgeRow,
  Catchable,
  catchableNow,
  chapterGroups,
  chapterSpots,
  CHEV,
  CLOCK_ICON,
  fold,
  kitGroup,
  monRow,
  placeLabel,
  RED_NOTE,
  redGyarados,
  rowTags,
  SLIDERS_ICON,
  spots,
  sprite,
  strip,
  uniq,
} from "../parts";
import { NoRun } from "./runs";

/* ---- Journey (home) ---- */
const why = (h: Catchable) =>
  redGyarados(h.p, h.r)
    ? RED_NOTE
    : isHere(h.r.place)
      ? ONE_TIME.has(h.r.m)
        ? ""
        : "Easiest one to catch here"
      : h.r.chap === currentChap()
        ? "Best odds in this chapter"
        : `Best odds in ${CHAPTERS[h.r.chap].title} chapter`;
function heroCard(h: Catchable) {
  const a = TYPE[h.p.types[0]],
    b = TYPE[h.p.types[1] || h.p.types[0]];
  return `<section class="next s-next" aria-labelledby="hero-name" style="--t1:${a};--t2:${b}">
      <div class="band">${sprite(h.p, "hv-sprite", redGyarados(h.p, h.r))}<div class="k">Next catch · #${pad(num(h.p))}</div>
        <h2 class="lg" id="hero-name">${h.p.name}</h2>${h.p.types.map((t) => `<span class="type" style="--tc:${TYPE[t]}">${cap(t)}</span>`).join(" ")}${why(h) && `<div class="why">${why(h)}</div>`}</div>
      ${rowTags(h.r, isHere(h.r.place) ? R().here : "", " chance")}
      <div class="hv-actions"><button class="app-primary grow" data-catch="${h.p.n}" data-k="hero-${h.p.n}" aria-label="${h.p.name} caught">Caught it</button><button class="app-quiet" data-skip="${h.p.n}" data-k="skip">Not now</button></div>
    </section>`;
}

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
const toggle = (on: boolean, title: string, note: string, attr: string) =>
  `<button class="sw" role="switch" aria-checked="${on}" ${attr}><span class="grow"><b>${title}</b>${note ? `<small>${note}</small>` : ""}</span><span class="tog${on ? " on" : ""}" aria-hidden="true"></span></button>`;
export function fillCustom() {
  const r = R();
  $("#sheetbody").innerHTML =
    `<h2 id="sheet-title">Customize this ${ver().name} playthrough</h2>
    ${isGuest() ? "" : toggle(r.view !== "dexonly", "Journey tab", "", `data-journeytab="1"`)}
    ${!isGuest() && r.view !== "dexonly" ? `<div class="sw"><b class="grow">Start on</b><div class="seg3" role="group" aria-label="Start on">${["journey", "dex"].map((v) => `<button data-startview="${v}" aria-pressed="${r.view === v}">${v === "journey" ? "Journey" : "Dex"}</button>`).join("")}</div></div><p class="eyebrow">Journey sections</p>
    ${SECTIONS.map(([k, t, n]) => toggle(!r.hidden.has(k), t, n, `data-hide="${k}" data-k="h-${k}"`)).join("")}
    ${toggle(r.showLater, "Show Pokémon I can't reach yet", `List them in each section, not under "Come back later"`, `data-showlater="1" data-k="h-later"`)}
    <div class="sw"><span class="grow"><b>${badgesWord()[0].toUpperCase()}${badgesWord().slice(1)} and items</b><small>Always shown: this is how the app knows what you can catch</small></span><span class="lock">Always on</span></div>
    ` : ""}
    <p class="eyebrow">Dex</p>
    ${toggle(r.trackForms, "Forms", "", `data-dexoption="trackForms" data-k="h-forms"`)}
    ${toggle(r.trackGenders, "Genders", "", `data-dexoption="trackGenders" data-k="h-genders"`)}
    ${r.trackForms ? toggle(r.trackTraded, "Traded forms", "", `data-dexoption="trackTraded" data-k="h-traded"`) : ""}
    <div style="display:flex;justify-content:flex-end;margin-top:12px"><button class="chip" data-close="1">Done</button></div>`;
}
/* ---- Story events: one question on top, the full list in Your journey ---- */
// What ticking the event would open right now, found by ticking it for a moment.
function opensText(id: string) {
  const reach = () => ({
    chaps: CHAPTERS.map((_, i) => unlocked(i)),
    mons: DEX.filter(
      (p) =>
        visible(p) &&
        !R().caught.has(p.n) &&
        p.rows.some((r) => rowStatus(r).s !== "later"),
    ).map((p) => p.n),
  });
  const was = reach();
  R().events.add(id);
  let now;
  try {
    now = reach();
  } finally {
    R().events.delete(id);
  }
  const places = CHAPTERS.filter((_, i) => now.chaps[i] && !was.chaps[i])
      .flatMap((c) => c.places)
      .filter((p) => !NOT_HERE.test(p)),
    n = now.mons.length - was.mons.length;
  return [
    places.length &&
      `Opens ${places.slice(0, 3).join(", ")}${places.length > 3 ? ` and ${places.length - 3} more` : ""}`,
    n && `${n} Pokémon`,
  ]
    .filter(Boolean)
    .join(" · ");
}
function storyCheck() {
  const open = Object.values(EVENTS)
    .filter(
      (e) =>
        !eventDone(e.id) &&
        inJourney(e.chap) &&
        unlocked(e.chap) &&
        (e.after || []).every(eventDone),
    )
    .sort((a, b) => a.chap - b.chap);
  const e = open.find((x) => !ui.snooze.has(x.id));
  if (!e)
    return open.length
      ? `<div class="row ask-snz s-ask"><span class="grow small"><b>${open[0].label}</b> · not yet</span><button class="got-btn" data-unsnooze="1" data-k="ask-now" aria-label="Ask now: ${open[0].label}">Ask now</button></div>`
      : "";
  const opens = opensText(e.id);
  return `<section class="card ask s-ask" aria-labelledby="ask-q"><div class="ask-k">Story check</div><h2 id="ask-q" tabindex="-1">${e.q}</h2>${opens && `<p class="small muted">${opens}</p>`}
    <div class="hv-actions"><button class="app-primary" data-yes="${e.id}" aria-describedby="ask-q">Yes, got it</button><button class="app-quiet" data-snooze="${e.id}" aria-describedby="ask-q">Not yet</button></div></section>`;
}
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
    now = catchableNow(),
    wide = matchMedia("(min-width:960px)").matches;
  const hero = now.find((x) => !r.skip.has(x.p.n));
  const hide = r.hidden,
    all = spots(),
    around = !hide.has("near") || !hide.has("chapter"),
    curS = chapterSpots(all, cur, (pl) =>
      isHere(pl) ? !hide.has("near") : !hide.has("chapter"),
    );
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
      ? `<optgroup label="Chapter ${i + 1}: ${c.title}">${list.map((p) => `<option ${p === r.here ? "selected" : ""} value="${p}">${p}${placeLabel(p, all[p]) && ` · ${placeLabel(p, all[p])}`}</option>`).join("")}</optgroup>`
      : "";
  }).join("");
  const badges = P().badges,
    badgesOn = badges.filter((b) => r.badges.has(b[0])).length,
    kitOn = P().kit.filter((k) => r.kit.has(k[0])).length;
  return `<div class="jny"><div class="colmain">
  <section class="s-where" aria-labelledby="where-h">
    <div class="where-k">Chapter ${cur + 1} · ${CHAPTERS[cur].title}</div>
    <div class="where-row">
      <h1 class="lg" id="where-h">${r.here}</h1>
      <span class="where-chev" aria-hidden="true"><svg viewBox="0 0 10 6"><path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.8"/></svg></span>
      <select id="here" data-k="here" aria-label="Selected area">${picker.includes(`value="${r.here}"`) ? "" : `<option selected disabled>${r.here}</option>`}${picker}</select>
    </div>
    <div class="where-tools">
      ${P().nightFrom ? `<button class="quietbtn" data-clock="1" data-k="clock" aria-label="Game clock: ${cap(nowTime())}, ${cap(DAYS[gameClock(r.clock).day])}. Change">${CLOCK_ICON}<b>${cap(nowTime())}</b> · ${cap(DAYS[gameClock(r.clock).day]).slice(0, 3)}</button>` : ""}
      <button class="quietbtn" data-journal="${r.id}" data-k="journal">${JOURNAL_ICON}Journal</button>
      <button class="quietbtn" data-custom="1" data-k="custom">${SLIDERS_ICON}Customize</button>
    </div>
  </section>
  ${hide.has("next") ? "" : hero ? heroCard(hero) : now.length ? `<section class="hero s-next"><h2>You've skipped every suggestion</h2><p>${now.length} Pokémon are still catchable right now.</p><button class="btn" data-unskip="1" data-k="unskip2">Show them again</button></section>` : `<section class="hero s-next"><h2>Nothing left to catch right now</h2><p>Try another time of day, or move ahead in the story.</p></section>`}
  ${!hide.has("next") && r.skip.size ? `<div class="skipped s-next"><button class="chip" data-unskip="1" data-k="unskip">Show ${r.skip.size} skipped</button></div>` : ""}
  ${hide.has("story") && !hide.has("journey") ? "" : storyCheck()}
  ${
    around && curS.html
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
    hide.has("journey")
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
          i === cur && around
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
  </aside></div>`;
}
