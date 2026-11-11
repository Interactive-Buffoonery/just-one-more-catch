import { ui } from "../game";

export function Contact() {
  return `<div class="contact-card lb"><div class="lcard"><div class="lslab"><h1 class="lg">Contact</h1><img class="partner" src="/sprites/hgss/441.png" alt="" width="144" height="144"></div><div class="lbody">
    <p>Questions, ideas or a mistake in the data? Send us a note.</p>
    ${
      ui.sent
        ? `<p>Thanks, we got your message.</p><button class="chip" data-another="1">Send another</button>`
        : `<form class="form contact-form" data-contact="1">
      <label class="field"><span>Message</span><textarea id="c-msg" name="message" maxlength="4000" required></textarea></label>
      <label class="field"><span>Email, if you'd like a reply</span><input id="c-email" name="email" type="email" maxlength="200" autocomplete="email"></label>
      <div class="sr" aria-hidden="true"><label>Leave this empty<input id="c-website" name="website" tabindex="-1" autocomplete="off"></label></div>
      <button class="app-primary contact-send" type="submit">Send</button>${ui.sendError ? `<p class="small" role="alert" style="color:var(--coral)">${ui.sendError}</p>` : ""}</form>`
    }</div></div></div>`;
}
