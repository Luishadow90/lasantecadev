document.addEventListener('DOMContentLoaded', function(){
  // Mobile nav
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.nav-list');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Active nav link
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(a => {
    if (a.getAttribute('href') === path) a.classList.add('active');
  });

  // Hero slideshow (home only)
  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('.hero-dot'));
  const prev = document.querySelector('.hero-prev');
  const next = document.querySelector('.hero-next');
  const live = document.getElementById('hero-live');

  if (slides.length) {
    let i = 0;
    const total = slides.length;

    const set = (idx) => {
      i = (idx + total) % total;
      slides.forEach((s, j) => s.classList.toggle('is-active', j === i));
      dots.forEach((d, j) => d.classList.toggle('is-active', j === i));
      if (live) live.textContent = `Slide ${i+1} de ${total}`;
    };

    dots.forEach(d => d.addEventListener('click', () => set(parseInt(d.dataset.heroDot, 10) || 0)));
    if (prev) prev.addEventListener('click', () => set(i - 1));
    if (next) next.addEventListener('click', () => set(i + 1));

    // Autoplay
    let timer = setInterval(() => set(i + 1), 6000);
    const slider = document.querySelector('.hero-slider');
    if (slider) {
      slider.addEventListener('mouseenter', () => { clearInterval(timer); });
      slider.addEventListener('mouseleave', () => { timer = setInterval(() => set(i + 1), 6000); });
      slider.addEventListener('focusin', () => { clearInterval(timer); });
      slider.addEventListener('focusout', () => { timer = setInterval(() => set(i + 1), 6000); });
    }
  }
});
