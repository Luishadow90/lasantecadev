// assets/js/layout.js
// Inyecta header/footer y (muy importante) inicializa el menú mobile después de inyectar el header.

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

/**
 * Inicializa:
 * - Toggle hamburguesa (dropdown) para #primary-nav
 * - Cerrar con click fuera / click en link / tecla ESC
 */
function initHeaderInteractions(rootEl) {
  const header = rootEl.querySelector("header.header") || rootEl;
  const toggle = header.querySelector(".nav-toggle");
  const nav = header.querySelector("#primary-nav");

  if (!toggle || !nav) return;

  // Evita doble binding si vuelves a inyectar.
  if (toggle.dataset.bound === "1") return;
  toggle.dataset.bound = "1";

  const setOpen = (open) => {
    nav.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
  };

  const isOpen = () => nav.classList.contains("open");

  toggle.addEventListener("click", (e) => {
    e.preventDefault();
    setOpen(!isOpen());
  });

  // Cierra al tocar un link del menú (mobile UX)
  nav.addEventListener("click", (e) => {
    const a = e.target && e.target.closest ? e.target.closest("a") : null;
    if (a && isOpen()) setOpen(false);
  });

  // Click fuera
  document.addEventListener("click", (e) => {
    if (!isOpen()) return;
    const clickedInside = header.contains(e.target);
    if (!clickedInside) setOpen(false);
  });

  // ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen()) setOpen(false);
  });

  // Si pasas a desktop, cerramos el dropdown para evitar estados raros.
  window.addEventListener("resize", () => {
    if (window.matchMedia("(min-width: 981px)").matches && isOpen()) setOpen(false);
  });
}
