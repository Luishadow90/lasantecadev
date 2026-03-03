document.addEventListener('DOMContentLoaded', () => {
  initHeroSlider();
});

function highlightActiveNavLink() {
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach((a) => {
    if (a.getAttribute('href') === path) a.classList.add('active');
  });
}

function initHeroSlider() {
  const slider = document.querySelector('.hero-slider');
  if (!slider) return;

  const slides = Array.from(slider.querySelectorAll('.hero-slide'));
  if (!slides.length) return;

  const prev = slider.querySelector('.hero-prev');
  const next = slider.querySelector('.hero-next');
  const live = document.getElementById('hero-live');
  const dotsWrap = slider.querySelector('.hero-dots');
  const total = slides.length;

  let current = slides.findIndex((s) => s.classList.contains('is-active'));
  if (current < 0) current = 0;

  const dots = syncHeroDots(dotsWrap, total);

  const set = (idx) => {
    current = (idx + total) % total;
    slides.forEach((s, j) => s.classList.toggle('is-active', j === current));
    dots.forEach((d, j) => d.classList.toggle('is-active', j === current));
    if (live) live.textContent = `Slide ${current + 1} de ${total}`;
  };

  dots.forEach((d) => d.addEventListener('click', () => set(Number(d.dataset.heroDot || 0))));
  if (prev) prev.addEventListener('click', () => set(current - 1));
  if (next) prev.addEventListener('click', () => set(current + 1));

  const autoplayMs = 6000;
  let timer = setInterval(() => set(current + 1), autoplayMs);

  const pause = () => clearInterval(timer);
  const resume = () => { timer = setInterval(() => set(current + 1), autoplayMs); };

  slider.addEventListener('mouseenter', pause);
  slider.addEventListener('mouseleave', resume);
  slider.addEventListener('focusin', pause);
  slider.addEventListener('focusout', resume);

  set(current);
}

function syncHeroDots(dotsWrap, total) {
  if (!dotsWrap) return [];
  const existing = Array.from(dotsWrap.querySelectorAll('.hero-dot'));
  if (existing.length === total) {
    existing.forEach((d, i) => (d.dataset.heroDot = String(i)));
    return existing;
  }
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
