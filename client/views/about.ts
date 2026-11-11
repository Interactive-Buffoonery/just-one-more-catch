import { ui } from "../game";

/* ---- About, Contact ---- */
const contactLink = (text: string) =>
  `<button class="linkish" data-tab="contact">${text}</button>`;
export function About() {
  return `<div class="narrow doc">
  <section id="about"><div class="about-intro"><p class="about-wordmark"><span>Just One</span><span>More Catch</span></p><h2>About</h2>
    <p>Just One More Catch is your Pokédex for retro games. It shows you what's available to catch at your point in the story, and where to find it.</p>
    <p>This is a free fan project, and not affiliated with Nintendo, Creatures, GAME FREAK or The Pokémon Company.</p>
    </div><h3>Thanks</h3>
    <ul><li>Encounter data, sprites and badges come from <a href="https://pokeapi.co" target="_blank" rel="noopener">PokeAPI</a>, a free and open Pokémon database built by volunteers.</li>
    <li>Colour themes are inspired by <a href="https://rosepinetheme.com" target="_blank" rel="noopener">Rosé Pine</a>, <a href="https://draculatheme.com" target="_blank" rel="noopener">Dracula</a> and Pokémon palettes from <a href="https://www.schemecolor.com" target="_blank" rel="noopener">SchemeColor</a>.</li>
    <li>Icons are from <a href="https://tabler.io/icons" target="_blank" rel="noopener">Tabler Icons</a>, free under the MIT licence.</li></ul>
    <p>Spotted a mistake? ${contactLink("Let us know")}.</p>
  </section>
  </div>`;
}
export function Contact() {
  return `<div class="narrow doc"><section><h2>Contact</h2>
    <p>Questions, ideas or a mistake in the data? Send us a note.</p>
    ${
      ui.sent
        ? `<p>Thanks, we got your message.</p><button class="chip" data-another="1">Send another</button>`
        : `<form class="form" data-contact="1">
      <label class="field"><span>Message</span><textarea id="c-msg" name="message" maxlength="4000" required></textarea></label>
      <label class="field"><span>Email, if you'd like a reply</span><input id="c-email" name="email" type="email" maxlength="200" autocomplete="email"></label>
      <div class="sr" aria-hidden="true"><label>Leave this empty<input id="c-website" name="website" tabindex="-1" autocomplete="off"></label></div>
      <button class="app-primary" style="margin-top:14px" type="submit">Send</button>${ui.sendError ? `<p class="small" role="alert" style="color:var(--coral)">${ui.sendError}</p>` : ""}</form>`
    }</section></div>`;
}
