/* assets/js/news.demo.js
   Reemplaza el demo anterior. 
   Funciona como demo local (window.LaSanteStore o localStorage) y como cliente ligero para API (fallback).
*/

(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from((root || document).querySelectorAll(sel));

  // Selectores del DOM (coinciden con tu HTML)
  const elGrid = $("#news-grid");
  const elQ = $("#news-q");
  const elCategory = $("#news-category");
  const btnDemoPublish = $("#btnDemoPublish");

  // Modal lectura
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

  // API base (meta tag en HTML)
  const apiBase = document.querySelector('meta[name="api-base"]')?.content || '/api';

  // LocalStorage fallback key (si no existe window.LaSanteStore)
  const LS_KEY = 'ls_news_posts_v1';

  /* =========================
     Seed (contenido demo)
     ========================= */
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

  /* =========================
     Storage helpers (LaSanteStore or localStorage)
     ========================= */
  function hasStore() {
    return typeof window.LaSanteStore === 'object' && typeof window.LaSanteStore.getNews === 'function';
  }

  function storeGet() {
    if (hasStore()) return window.LaSanteStore.getNews() || [];
    try {
      return JSON.parse(localStorage.getItem(LS_KEY) || '[]');
    } catch {
      return [];
    }
  }

  function storeSet(list) {
    if (hasStore()) return window.LaSanteStore.setNews(list);
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(list));
    } catch {}
  }

  function storeUid(prefix = 'id') {
    if (hasStore() && typeof window.LaSanteStore.uid === 'function') return window.LaSanteStore.uid(prefix);
    return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  }

  function ensureSeed() {
    const existing = storeGet();
    if (!existing || existing.length === 0) {
      // Normalize seed to expected shape
      const normalized = seedNews.map(s => ({
        id: s.id,
        title: s.title,
        excerpt: s.excerpt,
        content: s.content,
        author: s.author,
        date: s.date,
        category: s.category,
        tags: s.tags || [],
        image: s.image
      }));
      storeSet(normalized);
    }
  }

  /* =========================
     Utilities
     ========================= */
  function escapeHtml(s) {
    if (s === undefined || s === null) return '';
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function fmtDate(iso) {
    if (!iso) return '';
    try {
      // Accept ISO or YYYY-MM-DD
      const d = new Date(iso.length === 10 ? iso + 'T00:00:00' : iso);
      if (isNaN(d)) return iso;
      return d.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: '2-digit' });
    } catch {
      return iso;
    }
  }

  function chips(tags) {
    if (!tags || !tags.length) return '';
    return tags.map(t => `<span class="chip">#${escapeHtml(t)}</span>`).join('');
  }

  function uniq(list) {
    return [...new Set(list.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es'));
  }

  /* =========================
     Card template (keeps your markup)
     ========================= */
  function card(post) {
    const img = post.image || post.imageUrl || 'assets/img/hero-1.svg';
    const id = post.id || post.postId || '';
    const category = post.category || post.categoryName || 'Noticias';
    return `
      <article class="card post-card">
        <button class="post-card__btn" type="button" data-open-post="${escapeHtml(id)}" aria-label="Leer noticia: ${escapeHtml(post.title)}">
          <div class="post-card__media">
            <img src="${escapeHtml(img)}" alt="" loading="lazy" />
          </div>
          <div class="p">
            <div class="kicker">${escapeHtml(category)}</div>
            <h3 class="mt-1">${escapeHtml(post.title)}</h3>
            <p class="muted mt-1">${escapeHtml(post.excerpt || '')}</p>
            <div class="post-meta mt-2">
              <span>${escapeHtml(post.author || 'La Santé')}</span>
              <span class="dot">•</span>
              <time datetime="${escapeHtml(post.date || post.publishedAt || '')}">${escapeHtml(fmtDate(post.date || post.publishedAt || ''))}</time>
            </div>
            <div class="chips mt-2">${chips(post.tags || [])}</div>
          </div>
        </button>
      </article>
    `;
  }

  /* =========================
     Render helpers
     ========================= */
  function renderCategoryOptions(items) {
    const categories = uniq(items.map(p => p.category || p.categoryName));
    elCategory.innerHTML =
      `<option value="">Todas las categorías</option>` +
      categories.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
  }

  function matches(post, q, category) {
    const hay = `${post.title || ''} ${post.excerpt || ''} ${post.author || ''} ${post.category || post.categoryName || ''} ${(post.tags || []).join(' ')} ${post.content || ''}`.toLowerCase();
    const okQ = !q || hay.includes(q);
    const okC = !category || (post.category || post.categoryName || '').toLowerCase() === category.toLowerCase();
    return okQ && okC;
  }

  function renderPostsList(posts, q = '', cat = '') {
    const items = (posts || []).slice().sort((a, b) => {
      const da = new Date(a.publishedAt || a.date || 0).getTime();
      const db = new Date(b.publishedAt || b.date || 0).getTime();
      return db - da;
    });
    const filtered = items.filter(p => matches(p, q, cat));
    if (!filtered.length) {
      elGrid.innerHTML = `<div class="muted">No se encontraron noticias.</div>`;
      return;
    }
    elGrid.innerHTML = filtered.map(card).join('');
    // bind open buttons
    elGrid.querySelectorAll('[data-open-post]').forEach(btn => {
      btn.addEventListener('click', () => openPost(btn.getAttribute('data-open-post')));
    });
  }

  /* =========================
     Data loading (API first, fallback to store)
     ========================= */
  async function fetchCategoriesFromApi() {
    try {
      const res = await fetch(`${apiBase}/news/categories`);
      if (!res.ok) throw new Error('no-cats');
      const cats = await res.json();
      return cats;
    } catch {
      return null;
    }
  }

  async function fetchPostsFromApi() {
    try {
      const res = await fetch(`${apiBase}/news`);
      if (!res.ok) throw new Error('no-news');
      const posts = await res.json();
      return posts;
    } catch {
      return null;
    }
  }

  async function loadCategories() {
    // Try API
    const apiCats = await fetchCategoriesFromApi();
    if (apiCats && Array.isArray(apiCats) && apiCats.length) {
      // map to select options
      elCategory.innerHTML = `<option value="">Todas las categorías</option>` +
        apiCats.map(c => `<option value="${escapeHtml(c.slug || c.name)}">${escapeHtml(c.name)}</option>`).join('');
      return;
    }
    // fallback: derive from local store
    const posts = storeGet();
    renderCategoryOptions(posts);
  }

  async function loadPosts() {
    elGrid.innerHTML = `<div class="muted">Cargando noticias…</div>`;
    const q = (elQ.value || '').trim().toLowerCase();
    const cat = (elCategory.value || '').trim();
    const apiPosts = await fetchPostsFromApi();
    if (apiPosts && Array.isArray(apiPosts)) {
      renderPostsList(apiPosts, q, cat);
      return;
    }
    // fallback to local store
    const posts = storeGet();
    renderPostsList(posts, q, cat);
  }

  /* =========================
     Open post (API then store)
     ========================= */
  async function openPost(id) {
    // Try API detail
    try {
      const res = await fetch(`${apiBase}/news/${encodeURIComponent(id)}`);
      if (res.ok) {
        const post = await res.json();
        showModal(post);
        return;
      }
    } catch {}
    // fallback to store
    const posts = storeGet();
    const post = posts.find(p => String(p.id || p.postId) === String(id));
    if (post) showModal(post);
  }

  function showModal(post) {
    postKicker.textContent = post.category || post.categoryName || 'Noticias';
    postTitle.textContent = post.title || '';
    postMeta.textContent = `${post.author || ''} · ${fmtDate(post.publishedAt || post.date || '')}`;
    postImg.src = post.image || post.imageUrl || 'assets/img/hero-1.svg';
    postImg.alt = post.title ? `Imagen de ${post.title}` : '';
    postChips.innerHTML = '';
    if (post.tags && post.tags.length) {
      (post.tags || []).forEach(t => {
        const s = document.createElement('span');
        s.className = 'chip';
        s.textContent = t;
        postChips.appendChild(s);
      });
    }
    postContent.innerHTML = post.content || post.excerpt || '';
    openModal(postModal);
  }

  /* =========================
     Modal helpers (compatible con tu HTML)
     ========================= */
  function openModal(m) {
    if (!m) return;
    m.setAttribute('aria-hidden', 'false');
    m.classList.add('is-open');
    m.classList.add('open'); // support both naming conventions
    document.documentElement.classList.add('no-scroll');
  }

  function closeModal(m) {
    if (!m) return;
    m.setAttribute('aria-hidden', 'true');
    m.classList.remove('is-open');
    m.classList.remove('open');
    document.documentElement.classList.remove('no-scroll');
  }

  function bindModalClose() {
    document.addEventListener('click', (e) => {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.matches('[data-close-modal]') || target.closest('[data-close-modal]')) {
        const m = target.closest('.modal');
        if (m) closeModal(m);
      }
      // close when clicking backdrop
      if (target.classList.contains('modal__backdrop')) {
        const m = target.closest('.modal');
        if (m) closeModal(m);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      document.querySelectorAll('.modal.is-open, .modal.open').forEach(m => closeModal(m));
    });
  }

  /* =========================
     Publish (tries API POST, fallback to store)
     ========================= */
  async function publishToApi(payload) {
    try {
      const res = await fetch(`${apiBase}/news`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('api-fail');
      return await res.json();
    } catch {
      return null;
    }
  }

  function publishToStore(payload) {
    const list = storeGet();
    const id = storeUid('post');
    const post = {
      id,
      title: payload.title,
      excerpt: payload.excerpt,
      content: payload.content,
      author: payload.author,
      date: payload.date,
      category: payload.category,
      tags: (payload.tags || '').split(',').map(t => t.trim()).filter(Boolean),
      image: payload.imageUrl || payload.image || 'assets/img/hero-1.svg',
      publishedAt: payload.date || new Date().toISOString()
    };
    list.unshift(post);
    storeSet(list);
    return post;
  }

  /* =========================
     UI bindings
     ========================= */
  function bindFilters() {
    let t;
    elQ.addEventListener('input', () => {
      clearTimeout(t);
      t = setTimeout(() => loadPosts(), 300);
    });
    elCategory.addEventListener('change', () => loadPosts());
  }

  function bindPublish() {
    btnDemoPublish.addEventListener('click', () => {
      publishOk.hidden = true;
      publishForm.reset();
      // default date today
      $("#pDate").value = new Date().toISOString().slice(0, 10);
      openModal(publishModal);
    });

    publishForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const payload = {
        title: $("#pTitle").value.trim(),
        author: $("#pAuthor").value.trim(),
        date: $("#pDate").value ? new Date($("#pDate").value).toISOString() : new Date().toISOString(),
        category: $("#pCategory").value.trim(),
        tags: $("#pTags").value.trim(),
        excerpt: $("#pExcerpt").value.trim(),
        imageUrl: $("#pImage").value.trim(),
        content: $("#pContent").value.trim()
      };

      (async () => {
        const apiResult = await publishToApi(payload);
        if (apiResult) {
          // If API returns created post, reload from API
          publishOk.hidden = false;
          setTimeout(() => {
            publishOk.hidden = true;
            closeModal(publishModal);
            loadPosts();
          }, 900);
          return;
        }
        // fallback to local store
        publishToStore(payload);
        publishOk.hidden = false;
        renderCategoryOptions(storeGet());
        setTimeout(() => {
          publishOk.hidden = true;
          closeModal(publishModal);
          loadPosts();
        }, 900);
      })();
    });
  }

  function bindGlobalClicks() {
    document.addEventListener('click', (ev) => {
      // open publish modal (already handled)
      // close modals via header close button
      if (ev.target.closest('.modal__header button') && ev.target.closest('.modal')) {
        const m = ev.target.closest('.modal');
        if (m) closeModal(m);
      }
    });
  }

  /* =========================
     Init
     ========================= */
  (async function init() {
    ensureSeed();
    await loadCategories();
    await loadPosts();
    bindFilters();
    bindModalClose();
    bindPublish();
    bindGlobalClicks();
  })();

})();
