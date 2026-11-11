import { $ } from "../dom";
import {
  badgeName,
  byName,
  cap,
  CHAPTERS,
  currentChap,
  DAYS,
  DEX,
  e4,
  eventDone,
  EVENTS,
  forced,
  gameTime,
  has,
  inJourney,
  isBadge,
  isHere,
  laterEvents,
  METHOD,
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
  TIME,
  TYPE,
  ui,
  unlocked,
  ver,
  visible,
} from "../game";
import {
  badgeRow,
  Catchable,
  catchableNow,
  chapterGroups,
  chapterSpots,
  CLOCK_ICON,
  kitGroup,
  lvl,
  monRow,
  placeLabel,
  RED_NOTE,
  redGyarados,
  rowTags,
  SLIDERS_ICON,
  spots,
  sprite,
  uniq,
} from "../parts";
import { NoRun } from "./runs";
import { gameNow } from "../../shared/clock";

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
        : `Best odds in ${CHAPTERS[h.r.chap].title}`;
function heroCard(h: Catchable) {
  const a = TYPE[h.p.types[0]],
    b = TYPE[h.p.types[1] || h.p.types[0]],
    st = rowStatus(h.r);
  return `<section class="hv-field" aria-labelledby="hero-name">
      <div class="hv-band" style="--t1:${a};--t2:${b}"><span class="hv-no" aria-hidden="true">#${pad(num(h.p))}</span>${sprite(h.p, "hv-sprite", redGyarados(h.p, h.r))}
        <h2 id="hero-name">${h.p.name}</h2><div>${h.p.types.map((t) => `<span class="hv-type" style="--tc:${TYPE[t]}">${cap(t)}</span>`).join("")}</div>${why(h) && `<div class="hv-why">${why(h)}</div>`}</div>
      <dl class="hv-facts"><div><dt>Where</dt><dd>${h.r.place}</dd></div><div><dt>How</dt><dd>${METHOD[h.r.m]?.[0] || h.r.m}</dd></div><div><dt>Level</dt><dd>${lvl(h.r) || "?"}</dd></div><div><dt>Chance</dt><dd>${h.r.c ? h.r.c + "%" : "?"}</dd></div></dl>
      ${h.r.cond.some((c) => TIME[c]) || st.s !== "now" ? rowTags(h.r) : ""}
      <div class="hv-actions"><button class="app-primary grow" data-catch="${h.p.n}" data-k="hero-${h.p.n}" aria-label="${h.p.name} caught">Caught it!</button><button class="app-quiet" data-skip="${h.p.n}" data-k="skip">Not now</button></div>
    </section>`;
}

export function fillClock(mode: string) {
  const c = R().clock,
    g = gameNow(c),
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
    "Also near you",
    "Disabling this hides the other Pokémon you can catch where you are",
  ],
  ["chapter", "This chapter", "Places and Pokémon in your current chapter"],
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
  `<button class="sw" role="switch" aria-checked="${on}" ${attr}><span class="grow"><b>${title}</b><small>${note}</small></span><span class="tog${on ? " on" : ""}" aria-hidden="true"></span></button>`;
export function fillCustom() {
  const r = R();
  $("#sheetbody").innerHTML =
    `<h2 id="sheet-title">Customize ${ver().name}</h2><p class="small muted" style="margin:4px 0 10px">Only changes this playthrough.</p>
    ${SECTIONS.map(([k, t, n]) => toggle(!r.hidden.has(k), t, n, `data-hide="${k}" data-k="h-${k}"`)).join("")}
    ${toggle(r.showLater, "Show Pokémon I can't reach yet", `List them in each section, not under "Come back later"`, `data-showlater="1" data-k="h-later"`)}
    <div class="sw"><span class="grow"><b>Badges and items</b><small>Always shown: this is how the app knows what you can catch</small></span><span class="lock">Always on</span></div>
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
      ? `<div class="row ask-snz"><span class="grow small"><b>${open[0].label}</b> · not yet</span><button class="got-btn" data-unsnooze="1" data-k="ask-now" aria-label="Ask now: ${open[0].label}">Ask now</button></div>`
      : "";
  const opens = opensText(e.id);
  return `<section class="card ask" aria-labelledby="ask-q"><div class="ask-k">Story check</div><h2 id="ask-q" tabindex="-1">${e.q}</h2>${opens && `<p class="small muted" style="margin:6px 0 0">${opens}</p>`}
    <div class="ask-actions"><button class="app-primary" data-yes="${e.id}" aria-describedby="ask-q">Yes, got it</button><button class="app-quiet" data-snooze="${e.id}" aria-describedby="ask-q">Not yet</button></div></section>`;
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
    ? `<div class="beats" role="group" aria-label="Story steps, ${CHAPTERS[i].title}">${list.map((e) => beat(e.id)).join("")}</div>`
    : "";
};
// Unticking an event also unticks the ticked events that depend on it.
export function untick(id: string) {
  R().events.delete(id);
  laterEvents(id)
    .filter((e) => eventDone(e.id))
    .forEach((e) => untick(e.id));
}
export function Journey() {
  if (!run) return NoRun();
  const r = R(),
    cur = currentChap(),
    now = catchableNow();
  const hero = now.find((x) => !r.skip.has(x.p.n));
  const herePlaces = CHAPTERS.filter((_, i) => unlocked(i))
    .flatMap((c) => c.places)
    .filter((p) => !NOT_HERE.test(p));
  const atHere = now.filter((x) => isHere(x.r.place) && x.p.n !== hero?.p.n);
  const hide = r.hidden,
    all = spots(),
    curS = chapterSpots(all, cur);
  const evolve = DEX.filter(
    (p) =>
      visible(p) &&
      !r.caught.has(p.n) &&
      p.from &&
      r.caught.has(byName[p.from]?.n) &&
      p.evo &&
      !/Trade|Level up at/.test(p.evo),
  );
  return `<div class="cols"><div class="colmain">
  <div class="chips toolbar">
    <label class="sr" for="here">Where you are in the game</label>
    <select class="pill" id="here" data-k="here">${herePlaces.includes(r.here) ? "" : `<option selected disabled>Near ${r.here}</option>`}${herePlaces.map((p) => `<option ${p === r.here ? "selected" : ""} value="${p}">Near ${p}${placeLabel(p, all[p]) && ` · ${placeLabel(p, all[p])}`}</option>`).join("")}</select>
    ${P().nightFrom ? `<button class="pill clockpill" data-clock="1" data-k="clock" aria-label="Game clock: ${cap(nowTime())}, ${cap(DAYS[gameNow(r.clock).day])}. Change">${CLOCK_ICON}<b>${cap(nowTime())}</b> · ${cap(DAYS[gameNow(r.clock).day]).slice(0, 3)}</button>` : ""}
    <button class="pill iconpill" data-custom="1" data-k="custom" aria-label="Customize this page">${SLIDERS_ICON}</button>
  </div>
  ${hide.has("story") && !hide.has("journey") ? "" : storyCheck()}
  ${hide.has("next") ? "" : hero ? heroCard(hero) : now.length ? `<section class="hero"><h2>You've skipped every suggestion</h2><p style="margin:6px 0 12px">${now.length} Pokémon are still catchable right now.</p><button class="btn" data-unskip="1" data-k="unskip2">Show them again</button></section>` : `<section class="hero"><h2>Nothing left to catch right now</h2><p style="margin:6px 0 0">Try another time of day, or move ahead in the story.</p></section>`}
  ${!hide.has("next") && r.skip.size ? `<div style="text-align:right;margin-top:8px"><button class="chip" data-unskip="1" data-k="unskip">Show ${r.skip.size} skipped</button></div>` : ""}
  ${!hide.has("near") && atHere.length ? `<div class="eyebrow">Also near ${r.here}</div>${atHere.map((x) => monRow(x.p, x.r)).join("")}` : ""}
  ${
    hide.has("chapter")
      ? ""
      : `${curS.left || curS.later ? "" : `<p class="muted">You've caught everything in this chapter.</p>`}
  ${curS.html}`
  }
  </div><aside class="colside">
  ${!hide.has("evolve") && evolve.length ? `<div class="eyebrow">Evolution options · ${evolve.length}</div>${evolve.map((p) => monRow(p, null, undefined, true)).join("")}` : ""}
  ${
    hide.has("journey")
      ? ""
      : `<div class="eyebrow">Your journey</div>
  <div class="card" style="padding:4px 16px">
    ${CHAPTERS.map((c, i) => {
      if (!inJourney(i)) return "";
      const open = unlocked(i),
        g = open ? null : chapterGroups(i),
        cs = open ? chapterSpots(all, i) : null,
        n = g ? uniq(g) : cs!.left,
        done = open && !n && !cs!.later;
      const label = [
        i === cur && "Now",
        !c.places.length
          ? ""
          : g
            ? n
              ? `${n} to catch`
              : "all caught"
            : n || cs!.later
              ? [n && `${n} still out there`, cs!.later && `${cs!.later} later`]
                  .filter(Boolean)
                  .join(" · ")
              : "all caught",
      ]
        .filter(Boolean)
        .join(" · ");
      return `<details class="chap" data-chap="${i}" ${ui.open.has(String(i)) ? "open" : ""}><summary><span class="node ${done ? "done" : open ? "wip" : ""}" aria-hidden="true">${done ? "✓" : i + 1}</span><span style="flex:1">${c.title}<span class="sr">${i === cur ? ", you are here" : ""}${done ? ", everything caught" : open ? ", in progress" : ", not reached yet"}</span></span><span class="muted small">${label}</span></summary>
        ${beats(i)}${
          g
            ? Object.entries(g)
                .map(
                  ([place, list]) =>
                    `<div class="place"><div class="placehead"><span>${place}</span></div>${list.map((x) => monRow(x.p, x.r)).join("")}</div>`,
                )
                .join("")
            : cs!.html
        }<div style="height:10px"></div></details>`;
    }).join("")}
  </div>`
  }
  <div class="eyebrow">Badges and items</div>
  <details class="card fold" data-chap="kit" ${ui.open.has("kit") ? "open" : ""}><summary>${P().badges.filter((b) => r.badges.has(b[0])).length} of ${P().badges.length} badges · ${P().kit.filter((k) => r.kit.has(k[0])).length} of ${P().kit.length} items and moves</summary>
    <h3 style="margin-top:8px">${P().region} badges</h3>
    ${badgeRow(P().badges)}
    <button class="chip" style="margin-top:6px" data-badge="Elite Four" data-k="b-e4" aria-pressed="${e4()}">Beat the Elite Four</button>
    ${e4() && P().postgame ? `<h3 style="margin-top:12px">${P().postgame![0]}</h3>${badgeRow(P().postgame![1])}` : ""}
    ${kitGroup("Moves you can use", (k) => !k.endsWith("-rod") && k !== "bicycle")}${kitGroup("Items", (k) => k.endsWith("-rod") || k === "bicycle")}
    ${
      P().safari &&
      unlocked(CHAPTERS.findIndex((c) => c.places.includes("Safari Zone")))
        ? `<h3 style="margin-top:12px">Safari Zone: areas you've placed</h3>
    <p class="small muted" style="margin:4px 0 0">The game lets you place 6 of its 12 areas at a time. Catchable the ones you've chosen:</p>
    <div class="chips" style="margin-top:8px">${P()
      .safari!.map(
        (a) =>
          `<button class="chip" data-safari="${a}" data-k="s-${a}" aria-pressed="${r.safari.has(a)}" ${!r.safari.has(a) && r.safari.size >= 6 ? "disabled" : ""}>${a}</button>`,
      )
      .join("")}</div>`
        : ""
    }
  </details>
  ${
    hide.has("dex")
      ? ""
      : `<div class="eyebrow">Dex progress</div>
  <div class="card">
    <div style="display:flex;justify-content:space-between"><h3>${P().region} dex</h3><span><b>${regionalCaught()}</b> <span class="muted">/ ${P().regional}</span></span></div>
    <div class="bar" style="margin-top:6px"><i style="width:${(regionalCaught() / P().regional) * 100}%"></i></div>
    ${
      e4() && P().national > P().regional
        ? `<div style="display:flex;justify-content:space-between;margin-top:12px"><h3>National dex</h3><span><b>${r.caught.size}</b> <span class="muted">/ ${P().national}</span></span></div>
    <div class="bar" style="margin-top:6px"><i style="width:${(r.caught.size / P().national) * 100}%"></i></div>`
        : ""
    }
  </div>`
  }
  </aside></div>`;
}
