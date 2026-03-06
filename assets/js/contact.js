/* assets/js/contact.js */

(function () {
  const $ = (s) => document.querySelector(s);
  const apiBase = document.querySelector('meta[name="api-base"]')?.content || '/api';

  const form = $("#contactForm");
  const ok = $("#contactOk");
  const err = $("#contactErr");

  async function sendToApi(payload) {
    try {
      const res = await fetch(`${apiBase}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("api-fail");
      return true;
    } catch {
      return false;
    }
  }

  function saveLocal(payload) {
    const key = "ls_contact_messages_v1";
    const list = JSON.parse(localStorage.getItem(key) || "[]");
    list.push({ ...payload, savedAt: new Date().toISOString() });
    localStorage.setItem(key, JSON.stringify(list));
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    ok.hidden = true;
    err.hidden = true;

    const payload = {
      fullName: $("#fullName").value.trim(),
      email: $("#email").value.trim(),
      country: $("#country").value.trim(),
      city: $("#city").value.trim(),
      phone: $("#phone").value.trim(),
      subject: $("#subject").value.trim(),
      message: $("#message").value.trim(),
      sentAt: new Date().toISOString()
    };

    const sent = await sendToApi(payload);

    if (sent) {
      ok.hidden = false;
      form.reset();
    } else {
      saveLocal(payload);
      err.hidden = false;
    }
  });
})();
