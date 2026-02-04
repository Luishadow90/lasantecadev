/**
 * La Santé — Frontend behaviors
 * -----------------------------------------
 * ✅ Code-review notes:
 * - Keep JS small and focused: one init per feature.
 * - Make the Hero slider resilient: it should work even if you add/remove slides
 *   without touching the JS (dots auto-sync).
 * - Avoid hardcoding slide counts in HTML (optional): JS can generate dots.
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  highlightActiveNavLink();
  initHeroSlider();
});

/**
 * Mobile navigation toggle (hamburger).
 * Requirements:
 * - .nav-toggle button
 * - .nav-list menu container
 * - CSS should show/hide via .open class on .nav-list
 */
function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.nav-list');

  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
}

/**
 * Adds "active" class to the current page link.
 * Requirements:
 * - Navigation anchors must have class .nav-link
 * - Their href should match the filename (e.g., index.html, productos.html)
 */
function highlightActiveNavLink() {
  const path = location.pathname.split('/').pop() || 'index.html';

  document.querySelectorAll('.nav-link').forEach((a) => {
    if (a.getAttribute('href') === path) a.classList.add('active');
  });
}

/**
 * Hero slider
 * ----------------------------
 * Markup expected (already in HTML):
 * - .hero-slider
 * - .hero-slides > .hero-slide[data-hero-slide]
 * - .hero-prev / .hero-next buttons
 * - .hero-dots container (optional — can be empty; JS will build)
 * - #hero-live (aria-live text; optional)
 *
 * To add more banners:
 * - Add more <figure class="hero-slide" data-hero-slide="N">...</figure>
 * - Put the image in: assets/img/hero/
 * - You do NOT need to add more dots if you leave the .hero-dots container present.
 */
function initHeroSlider() {
  const slider = document.querySelector('.hero-slider');
  if (!slider) return; // Not on all pages

  const slides = Array.from(slider.querySelectorAll('.hero-slide'));
  if (!slides.length) return;

  const prev = slider.querySelector('.hero-prev');
  const next = slider.querySelector('.hero-next');
  const live = document.getElementById('hero-live');

  const dotsWrap = slider.querySelector('.hero-dots');
  const total = slides.length;

  // Ensure a single active slide
  let current = slides.findIndex((s) => s.classList.contains('is-active'));
  if (current < 0) current = 0;

  // Build or sync dots (recommended)
  const dots = syncHeroDots(dotsWrap, total);

  // Core state setter
  const set = (idx) => {
    current = (idx + total) % total;

    slides.forEach((s, j) => s.classList.toggle('is-active', j === current));
    dots.forEach((d, j) => d.classList.toggle('is-active', j === current));

    if (live) live.textContent = `Slide ${current + 1} de ${total}`;
  };

  // Wire events
  dots.forEach((d) => d.addEventListener('click', () => set(Number(d.dataset.heroDot || 0))));
  if (prev) prev.addEventListener('click', () => set(current - 1));
  if (next) next.addEventListener('click', () => set(current + 1));

  // Autoplay with pause on hover/focus (UX + accessibility)
  const autoplayMs = 6000;
  let timer = setInterval(() => set(current + 1), autoplayMs);

  const pause = () => clearInterval(timer);
  const resume = () => { timer = setInterval(() => set(current + 1), autoplayMs); };

  slider.addEventListener('mouseenter', pause);
  slider.addEventListener('mouseleave', resume);
  slider.addEventListener('focusin', pause);
  slider.addEventListener('focusout', resume);

  // Initial render (sync live region + ensure consistent UI)
  set(current);
}

/**
 * Creates or syncs the hero dots with the number of slides.
 * If .hero-dots is missing, the slider still works with prev/next/autoplay.
 */
function syncHeroDots(dotsWrap, total) {
  if (!dotsWrap) return [];

  const existing = Array.from(dotsWrap.querySelectorAll('.hero-dot'));

  // If dots already match, reuse them
  if (existing.length === total) {
    existing.forEach((d, i) => (d.dataset.heroDot = String(i)));
    return existing;
  }

  // Otherwise, rebuild
  dotsWrap.innerHTML = '';

  for (let i = 0; i < total; i++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `hero-dot${i === 0 ? ' is-active' : ''}`;
    btn.dataset.heroDot = String(i);
    btn.setAttribute('aria-label', `Ir al slide ${i + 1}`);
    dotsWrap.appendChild(btn);
  }

  return Array.from(dotsWrap.querySelectorAll('.hero-dot'));
}
