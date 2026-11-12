import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import { runInNewContext } from "node:vm";

const source = readFileSync(new URL("../client/contact.ts", import.meta.url), "utf8");
const elements = Object.fromEntries([
  "contact-form", "contact-send", "contact-status", "contact-success",
  "contact-thanks", "contact-another", "message", "email", "website",
].map(id => [id, {
  value: "", hidden: false, disabled: true, listeners: {}, validity: "",
  addEventListener(event, fn) { this.listeners[event] = fn; },
  focus() { focused = id; },
  setCustomValidity(value) { this.validity = value; },
  reportValidity() { return !this.validity; },
}]));
let focused;
const form = elements["contact-form"];
form.elements = { namedItem: name => elements[name] };
form.reset = () => { for (const name of ["message", "email", "website"]) elements[name].value = ""; };
const mount = runInNewContext(stripTypeScriptTypes(source).replace("export ", "") + "\nmountContact", {
  document: { getElementById: id => elements[id] },
});
const requests = [];
let finish;
let fail;
mount(input => {
  requests.push(input);
  return new Promise((resolve, reject) => { finish = resolve; fail = reject; });
});
const submit = () => form.listeners.submit({ preventDefault() {} });
const button = elements["contact-send"];
const status = elements["contact-status"];
assert.equal(button.disabled, false);
elements.message.value = "   ";
await submit();
assert.equal(requests.length, 0, "whitespace must not send");
elements.message.value = "My save file could not be read.";
elements.message.listeners.input();
elements.email.value = "";
const pending = submit();
await submit();
assert.equal(requests.length, 1, "repeat submissions must send once");
assert.equal(requests[0].email, "", "reply email stays optional");
assert.equal(button.disabled, true);
assert.equal(elements.message.readOnly, true, "sending must protect the submitted draft");
fail(new Error("offline"));
await pending;
assert.match(status.textContent, /try again/);
assert.equal(elements.message.value, "My save file could not be read.", "failure must preserve the draft");
assert.equal(button.disabled, false);
assert.equal(elements.message.readOnly, false, "retry must allow editing");
const invalid = submit();
finish({ ok: false });
await invalid;
assert.match(status.textContent, /check your message/);
assert.equal(elements.message.value, "My save file could not be read.");
const limited = submit();
finish({ ok: false, retryAfterSeconds: 1200 });
await limited;
assert.match(status.textContent, /try again in 20 minutes/);
assert.equal(form.hidden, false);
assert.equal(elements.message.value, "My save file could not be read.");
const retry = submit();
finish({ ok: true });
await retry;
assert.equal(form.hidden, true);
assert.equal(elements["contact-success"].hidden, false);
assert.equal(focused, "contact-thanks");
assert.equal(elements.message.value, "");
elements["contact-another"].listeners.click();
assert.equal(form.hidden, false);
assert.equal(elements["contact-success"].hidden, true);
assert.equal(focused, "message");
console.log("contact ok: validation, optional email, duplicate prevention, retry, draft retention and success focus");
