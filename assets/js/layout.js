// assets/js/layout.js
document.addEventListener("DOMContentLoaded", () => {
  loadFragment("assets/includes/header.html", "site-header", initHeaderInteractions);
  loadFragment("assets/includes/footer.html", "site-footer");
});

function loadFragment(url, targetId, afterInsert) {
  const target = document.getElementById(targetId);
  if (!target) return;

  fetch(url, { cache: "no-cache" })
    .then((res) => {
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      return res.text();
    })
    .then((html) => {
      target.innerHTML = html;
      if (typeof afterInsert === "function") afterInsert(target);
    })
    .catch((err) => console.error(`Error loading ${url}`, err));
}

function initHeaderInteractions(rootEl) {
  const header = rootEl.querySelector("header.header") || rootEl;
  const toggle = header.querySelector(".nav-toggle");
  const nav = header.querySelector("#primary-nav");
  const navList = header.querySelector(".nav-list");

  if (!toggle || !navList) return;

  if (toggle.dataset.bound === "1") return;
  toggle.dataset.bound = "1";

  const setOpen = (open) => {
    nav.classList.toggle("open", open);
    navList.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
  };

  const isOpen = () => navList.classList.contains("open");

  toggle.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    setOpen(!isOpen());
  }, { passive: false });

  navList.addEventListener("click", (e) => {
    if (e.target.closest("a") && isOpen()) setOpen(false);
  });

  document.addEventListener("pointerdown", (e) => {
    if (!isOpen()) return;
    if (!header.contains(e.target)) setOpen(false);
  }, { passive: true });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen()) setOpen(false);
  });

  window.addEventListener("resize", () => {
    if (window.matchMedia("(min-width: 981px)").matches && isOpen()) setOpen(false);
  });

  if (typeof highlightActiveNavLink === "function") {
    setTimeout(highlightActiveNavLink, 50);
  }
}
