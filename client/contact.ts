import type { Bridge } from "./types";

export function mountContact(send: Bridge["contact"]) {
  const form = document.getElementById("contact-form") as HTMLFormElement;
  const button = document.getElementById("contact-send") as HTMLButtonElement;
  const status = document.getElementById("contact-status")!;
  const success = document.getElementById("contact-success")!;
  const message = form.elements.namedItem("message") as HTMLTextAreaElement;
  const email = form.elements.namedItem("email") as HTMLInputElement;
  const website = form.elements.namedItem("website") as HTMLInputElement;
  let sending = false;

  status.textContent = "";
  button.disabled = false;
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (sending || !form.reportValidity()) return;
    if (!message.value.trim()) {
      message.setCustomValidity("Please write a message.");
      message.reportValidity();
      return;
    }
    sending = true;
    message.readOnly = email.readOnly = true;
    button.disabled = true;
    button.textContent = "Sending…";
    status.textContent = "Sending your message…";
    try {
      const result = await send({
        message: message.value,
        email: email.value,
        website: website.value,
      });
      if (!result.ok) {
        status.textContent = "Please check your message and email, then try again.";
        return;
      }
      form.hidden = true;
      success.hidden = false;
      status.textContent = "";
      document.getElementById("contact-thanks")!.focus();
      form.reset();
    } catch {
      status.textContent = "That didn't send. Please try again. Your message is still here.";
    } finally {
      sending = false;
      message.readOnly = email.readOnly = false;
      button.disabled = false;
      button.innerHTML = 'Send message <span aria-hidden="true">↗</span>';
    }
  });
  message.addEventListener("input", () => message.setCustomValidity(""));
  document.getElementById("contact-another")!.addEventListener("click", () => {
    success.hidden = true;
    form.hidden = false;
    message.focus();
  });
}
