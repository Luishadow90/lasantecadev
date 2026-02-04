/* assets/js/news.demo.js */
(function () {
  const $ = (sel, root = document) => root.querySelector(sel);

  const elGrid = $("#news-grid");
  const elQ = $("#news-q");
  const elCategory = $("#news-category");
  const btnDemoPublish = $("#btnDemoPublish");

  // Read modal
  const postModal = $("#postModal");
  const postTitle = $("#postTitle");
  const postMeta = $("#postMeta");
  const postImg = $("#postImg");
  const postContent = $("#postContent");
  const postChips = $("#postChips");
  const postKicker = $("#postKicker");

  // Publish modal
  const publishModal = $("#publishModal");
  const publishForm = $("#publishForm");
  const publishOk = $("#publishOk");

  const seedNews = [
    {
      id: "post_1",
      title: "La Santé fortalece su presencia digital con una plataforma modular",
      excerpt:
        "Lanzamos una demo navegable con enfoque en UX/UI, performance y base sólida para SEO técnico.",
      content: `
        <p>Presentamos una base web modular que permite escalar secciones y funcionalidades por fases. La arquitectura facilita iterar rápido y conectar el Admin (CRUD) con API + SQL Server.</p>
        <h4>¿Qué incluye la demo?</h4>
        <ul>
          <li>Secciones principales con navegación clara</li>
          <li>Componentes reutilizables (cards, botones, grids)</li>
          <li>Buenas prácticas de accesibilidad</li>
        </ul>
        <p>En las siguientes fases se integrará autenticación, roles, catálogo y analítica.</p>
      `,
      author: "Equipo Digital",
      date: "2026-01-10",
      category: "Innovación",
      tags: ["plataforma", "ux", "seo"],
      image: "assets/img/hero-1.svg",
    },
    {
      id: "post_2",
      title: "Farmacovigilancia: canales y guía para reportar",
      excerpt:
        "Conoce cómo se estructura el módulo informativo y cómo redirige al canal oficial de reportes.",
      content: `
        <p>La sección de farmacovigilancia se diseñó para informar de forma clara y reducir fricción:</p>
        <ul>
          <li>Definición breve y comprensible</li>
          <li>Importancia y contexto</li>
          <li>Llamado a la acción directo para crear reporte</li>
        </ul>
        <p>Esto mejora la confianza, la transparencia y la experiencia del usuario.</p>
      `,
      author: "Calidad & Cumplimiento",
      date: "2026-01-12",
      category: "Seguridad del Paciente",
      tags: ["farmacovigilancia", "paciente", "información"],
      image: "assets/img/hero-2.svg",
    },
    {
      id: "post_3",
      title: "Portafolio: experiencia de exploración por categorías",
      excerpt:
        "La navegación por categorías está optimizada para encontrar productos rápido y con consistencia visual.",
      content: `
        <p>El portafolio por categorías utiliza cards y jerarquía visual para facilitar el escaneo.</p>
        <h4>Beneficios UX</h4>
        <ul>
          <li>Identificación rápida por iconografía</li>
          <li>CTA consistente (“Ver productos”)</li>
          <li>Diseño Mobile First</li>
        </ul>
        <p>En Fase 3, los productos se alimentarán desde SQL Server vía API.</p>
      `,
      author: "UX/UI",
      date: "2026-01-15",
      category: "Producto",
      tags: ["portafolio", "categorías", "ui"],
      image: "assets/img/hero-3.svg",
    },
    {
      id: "post_4",
      title: "Roadmap: de demo frontend a plataforma conectada (Admin + API)",
      excerpt:
        "La implementación está planificada por fases para validar rápido y escalar con control.",
      content: `
        <p>El roadmap se divide en fases para asegurar calidad, control y medición:</p>
        <ol>
          <li><strong>UI/UX + Frontend modular</strong> (actual)</li>
          <li><strong>Validación Layout + refinamiento</strong></li>
          <li><strong>API + SQL Server</strong> (catálogo, noticias, vacantes)</li>
          <li><strong>Seguridad, roles y permisos</strong> (Admin)</li>
          <li><strong>Analytics, SEO avanzado y performance</strong></li>
        </ol>
        <p>Finalmente: despliegue y redirección DNS a infraestructura objetivo.</p>
      `,
      author: "PMO Digital",
      date: "2026-01-18",
      category: "Roadmap",
      tags: ["fases", "api", "sql", "admin"],
      image: "assets/img/hero-4.svg",
    },
  ];

  function ensureSeed() {
    const existing = window.LaSanteStore.getNews();
    if (!existing || existing.length === 0) window.LaSanteStore.setNews(seedNews);
  }

  function uniq(list) {
    return [...new Set(list.filter(Boolean))].sort((a, b) => a.localeCompare(b, "es"));
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function fmtDate(iso) {
    try {
      const d = new Date(iso + "T00:00:00");
      return d.toLocaleDateString("es-MX", { year: "numeric", month: "short", day: "2-digit" });
    } catch {
      return iso;
    }
  }

  function chips(tags) {
    return (tags || []).map((t) => `<span class="chip">#${escapeHtml(t)}</span>`).join("");
  }

  function card(post) {
    const img = post.image || "assets/img/hero-1.svg";
    return `
      <article class="card post-card">
        <button class="post-card__btn" type="button" data-open-post="${escapeHtml(post.id)}" aria-label="Leer noticia: ${escapeHtml(post.title)}">
          <div class="post-card__media">
            <img src="${escapeHtml(img)}" alt="" loading="lazy" />
          </div>
          <div class="p">
            <div class="kicker">${escapeHtml(post.category || "Noticias")}</div>
            <h3 class="mt-1">${escapeHtml(post.title)}</h3>
            <p class="muted mt-1">${escapeHtml(post.excerpt || "")}</p>
            <div class="post-meta mt-2">
              <span>${escapeHtml(post.author || "La Santé")}</span>
              <span class="dot">•</span>
              <time datetime="${escapeHtml(post.date)}">${escapeHtml(fmtDate(post.date))}</time>
            </div>
            <div class="chips mt-2">${chips(post.tags)}</div>
          </div>
        </button>
      </article>
    `;
  }

  function renderCategoryOptions(items) {
    const categories = uniq(items.map((p) => p.category));
    elCategory.innerHTML =
      `<option value="">Todas las categorías</option>` +
      categories.map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");
  }

  function matches(post, q, category) {
    const hay = `${post.title} ${post.excerpt} ${post.author} ${post.category} ${(post.tags || []).join(" ")} ${post.content}`.toLowerCase();
    const okQ = !q || hay.includes(q);
    const okC = !category || post.category === category;
    return okQ && okC;
  }

  function render() {
    const items = window.LaSanteStore.getNews().slice().sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    const q = (elQ.value || "").trim().toLowerCase();
    const category = elCategory.value || "";
    const filtered = items.filter((p) => matches(p, q, category));

    elGrid.innerHTML = filtered.map(card).join("");

    elGrid.querySelectorAll("[data-open-post]").forEach((btn) => {
      btn.addEventListener("click", () => openPost(btn.getAttribute("data-open-post")));
    });
  }

  function openPost(postId) {
    const items = window.LaSanteStore.getNews();
    const post = items.find((p) => p.id === postId);
    if (!post) return;

    postKicker.textContent = post.category || "Noticias";
    postTitle.textContent = post.title || "";
    postMeta.textContent = `${post.author || "La Santé"} · ${fmtDate(post.date || "")}`;
    postImg.src = post.image || "assets/img/hero-1.svg";
    postImg.alt = post.title ? `Imagen de ${post.title}` : "";
    postChips.innerHTML = chips(post.tags);
    postContent.innerHTML = post.content || "";

    openModal(postModal);
  }

  function openModal(m) {
    m.setAttribute("aria-hidden", "false");
    m.classList.add("is-open");
    document.documentElement.classList.add("no-scroll");
  }

  function closeModal(m) {
    m.setAttribute("aria-hidden", "true");
    m.classList.remove("is-open");
    document.documentElement.classList.remove("no-scroll");
  }

  function bindModalClose() {
    document.addEventListener("click", (e) => {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.matches("[data-close-modal]")) {
        const m = target.closest(".modal");
        if (m) closeModal(m);
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      document.querySelectorAll(".modal.is-open").forEach((m) => closeModal(m));
    });
  }

  function bindFilters() {
    elQ.addEventListener("input", render);
    elCategory.addEventListener("change", render);
  }

  function bindPublish() {
    btnDemoPublish.addEventListener("click", () => {
      publishOk.hidden = true;
      publishForm.reset();
      // default date today
      $("#pDate").value = new Date().toISOString().slice(0, 10);
      openModal(publishModal);
    });

    publishForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const title = $("#pTitle").value.trim();
      const author = $("#pAuthor").value.trim();
      const date = $("#pDate").value.trim();
      const category = $("#pCategory").value.trim();
      const excerpt = $("#pExcerpt").value.trim();
      const image = ($("#pImage").value || "").trim() || "assets/img/hero-1.svg";
      const tags = ($("#pTags").value || "")
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);
      const content = $("#pContent").value.trim();

      const list = window.LaSanteStore.getNews();
      const post = {
        id: window.LaSanteStore.uid("post"),
        title,
        author,
        date,
        category,
        excerpt,
        image,
        tags,
        content,
      };

      list.unshift(post);
      window.LaSanteStore.setNews(list);

      publishOk.hidden = false;
      renderCategoryOptions(window.LaSanteStore.getNews());
      render();

      setTimeout(() => {
        closeModal(publishModal);
      }, 900);
    });
  }

  // init
  ensureSeed();
  renderCategoryOptions(window.LaSanteStore.getNews());
  bindFilters();
  bindModalClose();
  bindPublish();
  render();
})();
