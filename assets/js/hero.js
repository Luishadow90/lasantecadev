(function () {
  const root = document.querySelector(".hero--euro");
  if (!root) return;

  const slides = Array.from(root.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(root.querySelectorAll("[data-hero-dot]"));
  const prevBtn = root.querySelector(".hero-prev");
  const nextBtn = root.querySelector(".hero-next");
  const live = root.querySelector("#hero-live");

  if (!slides.length) return;

  let index = slides.findIndex(s => s.classList.contains("is-active"));
  if (index < 0) index = 0;

  const AUTOPLAY_MS = 6000;
  let timer = null;

  function setActive(nextIndex, opts = { focusDot: false }) {
    index = (nextIndex + slides.length) % slides.length;

    slides.forEach((s, i) => {
      const active = i === index;
      s.classList.toggle("is-active", active);
      s.setAttribute("aria-hidden", active ? "false" : "true");
    });

    dots.forEach((d, i) => {
      d.classList.toggle("is-active", i === index);
      d.setAttribute("aria-selected", i === index ? "true" : "false");
      d.setAttribute("role", "tab");
      d.tabIndex = i === index ? 0 : -1;
    });

    if (live) live.textContent = `Slide ${index + 1} de ${slides.length}`;

    if (opts.focusDot && dots[index]) dots[index].focus();
  }

  function next() { setActive(index + 1); }
  function prev() { setActive(index - 1); }

  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  function start() {
    stop();
    timer = setInterval(next, AUTOPLAY_MS);
  }

  // Buttons
  if (nextBtn) nextBtn.addEventListener("click", () => { next(); start(); });
  if (prevBtn) prevBtn.addEventListener("click", () => { prev(); start(); });

  // Dots
  dots.forEach((d) => {
    d.addEventListener("click", () => {
      const i = Number(d.getAttribute("data-hero-dot"));
      if (!Number.isNaN(i)) {
        setActive(i, { focusDot: false });
        start();
      }
    });
  });

  // Keyboard (when focus is inside hero)
  root.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); next(); start(); }
    if (e.key === "ArrowLeft") { e.preventDefault(); prev(); start(); }
  });

  // Pause on hover / focus for better UX
  root.addEventListener("mouseenter", stop);
  root.addEventListener("mouseleave", start);
  root.addEventListener("focusin", stop);
  root.addEventListener("focusout", start);

  // Init
  setActive(index);
  start();
})();
