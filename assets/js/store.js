(function () {
  "use strict";

  /**
   * La Santé – Local Store (Demo)
   * ---------------------------------------
   * - Persistencia en localStorage (Fase 1/2 demo).
   * - CRUD genérico + helpers de filtrado/búsqueda.
   * - Seed inicial (Products/Jobs/News/Users) si está vacío.
   * - Migración ligera para compatibilidad hacia atrás.
   *
   * NOTA: Esto es DEMO. En Fase 3 se reemplaza por API + SQL Server.
   */

  const VERSION = "1.2.0";

  const KEYS = {
    products: "lasante_products",
    jobs: "lasante_jobs",
    news: "lasante_news",
    users: "lasante_users", // opcional (login admin demo)
    meta: "lasante_meta", // versionado/migración
  };

  // -------------------------
  // Core helpers
  // -------------------------
  function safeJSONParse(raw, fallback) {
    try {
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function read(key, fallback) {
    const raw = localStorage.getItem(key);
    return safeJSONParse(raw, fallback);
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
    return value;
  }

  function nowISO() {
    return new Date().toISOString();
  }

  function uid(prefix = "id") {
    const a = Math.random().toString(36).slice(2, 8);
    const b = Math.random().toString(16).slice(2, 10);
    return `${prefix}_${a}_${b}`;
  }

  function normalizeArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function normalizeString(value, fallback = "") {
    return typeof value === "string" ? value : fallback;
  }

  function normalizeBool(value, fallback = false) {
    return typeof value === "boolean" ? value : fallback;
  }

  function normalizeObj(value, fallback = {}) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : fallback;
  }

  function trimOrEmpty(s) {
    return normalizeString(s).trim();
  }

  function toLower(s) {
    return normalizeString(s).toLowerCase();
  }

  function uniq(arr) {
    const set = new Set(normalizeArray(arr).map((x) => normalizeString(x).trim()).filter(Boolean));
    return Array.from(set);
  }

  // -------------------------
  // Generic list CRUD
  // -------------------------
  function list(key) {
    return normalizeArray(read(key, []));
  }

  function getById(key, id) {
    const items = list(key);
    return items.find((x) => x && x.id === id) || null;
  }

  function setAll(key, items) {
    return write(key, normalizeArray(items));
  }

  function add(key, item, opts = {}) {
    const items = list(key);

    const created = {
      id: item?.id || uid(opts.prefix || "item"),
      createdAt: item?.createdAt || nowISO(),
      updatedAt: item?.updatedAt || nowISO(),
      ...item,
    };

    items.unshift(created);
    setAll(key, items);
    return created;
  }

  function update(key, id, patch) {
    const items = list(key);
    const idx = items.findIndex((x) => x && x.id === id);
    if (idx === -1) return null;

    const updated = {
      ...items[idx],
      ...patch,
      id,
      updatedAt: nowISO(),
    };

    items[idx] = updated;
    setAll(key, items);
    return updated;
  }

  function upsert(key, item, opts = {}) {
    if (!item) return null;
    if (!item.id) return add(key, item, opts);
    const exists = getById(key, item.id);
    return exists ? update(key, item.id, item) : add(key, item, opts);
  }

  function remove(key, id) {
    const items = list(key);
    const next = items.filter((x) => x && x.id !== id);
    setAll(key, next);
    return next.length !== items.length;
  }

  function clear(key) {
    localStorage.removeItem(key);
  }

  // -------------------------
  // Search / Filter helpers
  // -------------------------
  function matchesQuery(text, q) {
    const t = toLower(text);
    const qq = toLower(q);
    if (!qq) return true;
    return t.includes(qq);
  }

  function sortByUpdatedDesc(a, b) {
    const da = Date.parse(a?.updatedAt || a?.createdAt || 0) || 0;
    const db = Date.parse(b?.updatedAt || b?.createdAt || 0) || 0;
    return db - da;
  }

  /**
   * queryList(key, opts)
   * opts = {
   *   q: string,
   *   isActive: boolean | undefined,
   *   where: (item) => boolean,
   *   mapText: (item) => string,
   *   limit: number
   * }
   */
  function queryList(key, opts = {}) {
    const items = list(key).slice().sort(sortByUpdatedDesc);
    const q = normalizeString(opts.q, "").trim();
    const isActive = typeof opts.isActive === "boolean" ? opts.isActive : undefined;
    const where = typeof opts.where === "function" ? opts.where : null;
    const mapText = typeof opts.mapText === "function" ? opts.mapText : (x) => JSON.stringify(x || {});
    const limit = Number.isFinite(opts.limit) ? Math.max(0, opts.limit) : Infinity;

    const filtered = items.filter((x) => {
      if (!x) return false;
      if (typeof isActive === "boolean" && normalizeBool(x.isActive, true) !== isActive) return false;
      if (where && !where(x)) return false;
      if (q && !matchesQuery(mapText(x), q)) return false;
      return true;
    });

    return filtered.slice(0, limit);
  }

  // -------------------------
  // Domain-specific normalization (light validation)
  // -------------------------
  function normalizeProduct(p = {}) {
    const obj = normalizeObj(p, {});
    return {
      id: obj.id,
      name: trimOrEmpty(obj.name),
      categoryId: trimOrEmpty(obj.categoryId),
      categoryName: trimOrEmpty(obj.categoryName),
      description: trimOrEmpty(obj.description),
      badge: trimOrEmpty(obj.badge),
      image: trimOrEmpty(obj.image),
      molecule: trimOrEmpty(obj.molecule),
      tags: uniq(obj.tags),
      isActive: normalizeBool(obj.isActive, true),
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt,
    };
  }

  function normalizeJob(j = {}) {
    const obj = normalizeObj(j, {});
    return {
      id: obj.id,
      title: trimOrEmpty(obj.title),
      location: trimOrEmpty(obj.location),
      modality: trimOrEmpty(obj.modality), // Presencial/Remoto/Híbrido
      area: trimOrEmpty(obj.area), // Calidad, Farmacovigilancia, etc.
      level: trimOrEmpty(obj.level), // Jr/Mid/Sr
      shortDescription: trimOrEmpty(obj.shortDescription),
      description: trimOrEmpty(obj.description),
      requirements: normalizeArray(obj.requirements).map((x) => trimOrEmpty(x)).filter(Boolean),
      responsibilities: normalizeArray(obj.responsibilities).map((x) => trimOrEmpty(x)).filter(Boolean),
      weOffer: normalizeArray(obj.weOffer).map((x) => trimOrEmpty(x)).filter(Boolean),
      applyUrl: trimOrEmpty(obj.applyUrl),
      applyEmail: trimOrEmpty(obj.applyEmail),
      isActive: normalizeBool(obj.isActive, true),
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt,
    };
  }

  function normalizeNews(n = {}) {
    const obj = normalizeObj(n, {});
    const title = trimOrEmpty(obj.title);
    const slug =
      trimOrEmpty(obj.slug) ||
      toLower(title)
        .replace(/[^\p{L}\p{N}]+/gu, "-")
        .replace(/(^-|-$)/g, "");
    return {
      id: obj.id,
      title,
      slug,
      excerpt: trimOrEmpty(obj.excerpt),
      content: trimOrEmpty(obj.content),
      image: trimOrEmpty(obj.image),
      author: trimOrEmpty(obj.author) || "Equipo La Santé",
      category: trimOrEmpty(obj.category) || "Actualidad",
      tags: uniq(obj.tags),
      publishedAt: trimOrEmpty(obj.publishedAt) || nowISO(),
      isActive: normalizeBool(obj.isActive, true),
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt,
    };
  }

  // -------------------------
  // Migration (light)
  // -------------------------
  function getMeta() {
    return normalizeObj(read(KEYS.meta, {}), {});
  }

  function setMeta(patch) {
    const prev = getMeta();
    const next = { ...prev, ...normalizeObj(patch, {}) };
    write(KEYS.meta, next);
    return next;
  }

  function migrateIfNeeded() {
    const meta = getMeta();
    const current = normalizeString(meta.version, "");
    if (current === VERSION) return;

    setAll(KEYS.products, list(KEYS.products).map(normalizeProduct));
    setAll(KEYS.jobs, list(KEYS.jobs).map(normalizeJob));
    setAll(KEYS.news, list(KEYS.news).map(normalizeNews));
    setAll(KEYS.users, list(KEYS.users));

    setMeta({ version: VERSION, migratedAt: nowISO() });
  }

  // -------------------------
  // Demo seed
  // -------------------------
  const SEED = {
    products: [
      {
        id: "prod_analgesico_01",
        name: "Acetaminofén",
        categoryId: "analgesicos",
        categoryName: "Analgésicos",
        description: "Analgésico",
        badge: "Destacado",
        image: "assets/img/products/acetaminofen.png",
        tags: ["dolor", "analgésico"],
        isActive: true,
      },
      {
        id: "prod_antiinflamatorio_01",
        name: "Ibuprofeno",
        categoryId: "analgesicos",
        categoryName: "Analgésicos",
        description: "Antiinflamatorio",
        badge: "Destacado",
        image: "assets/img/products/ibuprofeno.png",
        tags: ["dolor", "antiinflamatorio"],
        isActive: true,
      },
    ],
    jobs: [
      {
        id: "job_qfb_gt",
        title: "Químico Farmacéutico (QFB)",
        location: "Guatemala",
        modality: "Presencial",
        area: "Calidad / Farmacovigilancia",
        level: "Mid",
        shortDescription: "Posición para apoyar gestión de calidad y reporte de eventos adversos.",
        description:
          "Buscamos un profesional para fortalecer procesos de calidad, documentación y actividades de farmacovigilancia en planta/operación local.",
        requirements: [
          "Licenciatura en QFB, Química, o afín",
          "Experiencia 2+ años en calidad o farmacovigilancia",
          "Manejo de documentación y reportes",
          "Comunicación efectiva y enfoque a cumplimiento",
        ],
        responsibilities: [
          "Apoyar documentación y control de cambios",
          "Dar seguimiento a desviaciones / CAPAs",
          "Colaborar en reportes de eventos adversos",
          "Coordinación con áreas internas",
        ],
        weOffer: ["Prestaciones competitivas", "Crecimiento profesional", "Ambiente colaborativo"],
        applyEmail: "rh@lasante.local",
        isActive: true,
      },
      {
        id: "job_marketing_content",
        title: "Content & Community Specialist",
        location: "Ciudad de Guatemala",
        modality: "Híbrido",
        area: "Marketing",
        level: "Jr/Mid",
        shortDescription: "Apoyo en generación de contenidos y comunicación digital.",
        description:
          "Rol enfocado en redactar artículos, coordinar publicaciones y apoyar calendarios editoriales para secciones informativas del sitio.",
        requirements: ["Redacción y edición", "Organización", "Conocimientos básicos de SEO (deseable)"],
        responsibilities: ["Publicación de noticias", "Gestión de assets", "Revisión editorial"],
        weOffer: ["Capacitación", "Modalidad híbrida", "Equipo multidisciplinario"],
        applyEmail: "talento@lasante.local",
        isActive: true,
      },
    ],
    news: [
      {
        id: "news_farmacovigilancia_01",
        title: "Farmacovigilancia: ¿por qué reportar eventos adversos?",
        excerpt:
          "La farmacovigilancia permite detectar y prevenir riesgos asociados al uso de medicamentos en condiciones reales.",
        content:
          "En esta nota explicamos qué es un evento adverso, cómo identificarlo y por qué el reporte oportuno mejora la seguridad del paciente.",
        image: "assets/img/news/farmacovigilancia.jpg",
        author: "Equipo La Santé",
        category: "Seguridad del paciente",
        tags: ["farmacovigilancia", "seguridad", "paciente"],
        publishedAt: nowISO(),
        isActive: true,
      },
      {
        id: "news_bioequivalentes_01",
        title: "Medicamentos bioequivalentes: conceptos clave",
        excerpt:
          "Los bioequivalentes cumplen criterios de eficacia y seguridad comparables al medicamento de referencia.",
        content:
          "Revisamos definiciones, evaluaciones típicas y por qué son una alternativa confiable cuando están debidamente regulados.",
        image: "assets/img/news/bioequivalentes.jpg",
        author: "Comité Editorial",
        category: "Medicamentos",
        tags: ["bioequivalencia", "genéricos", "salud"],
        publishedAt: nowISO(),
        isActive: true,
      },
      {
        id: "news_prevencion_01",
        title: "Prevención y autocuidado: hábitos que suman",
        excerpt: "Pequeños cambios diarios pueden impactar tu bienestar físico y mental.",
        content:
          "Recomendaciones prácticas para mejorar sueño, hidratación y actividad física, con énfasis en constancia y metas realistas.",
        image: "assets/img/news/autocuidado.jpg",
        author: "Equipo La Santé",
        category: "Bienestar",
        tags: ["bienestar", "prevención", "autocuidado"],
        publishedAt: nowISO(),
        isActive: true,
      },
      {
        id: "news_plansalud_01",
        title: "Plan Más Salud: beneficios y acceso",
        excerpt: "Conoce el programa y cómo acceder al subdominio de beneficios.",
        content:
          "Te compartimos una guía rápida de acceso y los beneficios generales del programa para pacientes y familias.",
        image: "assets/img/news/plan-salud.jpg",
        author: "Equipo La Santé",
        category: "Programa",
        tags: ["beneficios", "programa", "paciente"],
        publishedAt: nowISO(),
        isActive: true,
      },
    ],
    users: [
      { id: "u_admin", email: "admin@lasante.local", role: "admin", password: "Admin123!" },
      { id: "u_news", email: "news@lasante.local", role: "news", password: "News123!" },
      { id: "u_jobs", email: "jobs@lasante.local", role: "jobs", password: "Jobs123!" },
      { id: "u_products", email: "products@lasante.local", role: "products", password: "Products123!" },
    ],
  };

  function seedIfEmpty() {
    const products = list(KEYS.products);
    const jobs = list(KEYS.jobs);
    const news = list(KEYS.news);
    const users = list(KEYS.users);

    if (products.length === 0) {
      setAll(
        KEYS.products,
        SEED.products.map((p) => ({ ...normalizeProduct(p), createdAt: nowISO(), updatedAt: nowISO() }))
      );
    }

    if (jobs.length === 0) {
      setAll(
        KEYS.jobs,
        SEED.jobs.map((j) => ({ ...normalizeJob(j), createdAt: nowISO(), updatedAt: nowISO() }))
      );
    }

    if (news.length === 0) {
      setAll(
        KEYS.news,
        SEED.news.map((n) => ({ ...normalizeNews(n), createdAt: nowISO(), updatedAt: nowISO() }))
      );
    }

    if (users.length === 0) {
      setAll(KEYS.users, SEED.users.map((u) => ({ ...u, createdAt: nowISO(), updatedAt: nowISO() })));
    }
  }

  seedIfEmpty();
  migrateIfNeeded();

  // -------------------------
  // Domain wrappers
  // -------------------------
  function addProduct(p) {
    return add(KEYS.products, normalizeProduct(p), { prefix: "prod" });
  }
  function updateProduct(id, patch) {
    return update(KEYS.products, id, normalizeProduct({ ...patch, id }));
  }

  function addJob(j) {
    return add(KEYS.jobs, normalizeJob(j), { prefix: "job" });
  }
  function updateJob(id, patch) {
    return update(KEYS.jobs, id, normalizeJob({ ...patch, id }));
  }

  function addNews(n) {
    return add(KEYS.news, normalizeNews(n), { prefix: "news" });
  }
  function updateNews(id, patch) {
    return update(KEYS.news, id, normalizeNews({ ...patch, id }));
  }

  // -------------------------
  // Export / Import
  // -------------------------
  function exportAll() {
    return {
      version: VERSION,
      exportedAt: nowISO(),
      products: list(KEYS.products),
      jobs: list(KEYS.jobs),
      news: list(KEYS.news),
      users: list(KEYS.users),
    };
  }

  function importAll(data, opts = {}) {
    const merge = normalizeBool(opts.merge, false);
    const payload = normalizeObj(data, null);
    if (!payload) return { ok: false, error: "Invalid payload" };

    const incomingProducts = normalizeArray(payload.products).map(normalizeProduct);
    const incomingJobs = normalizeArray(payload.jobs).map(normalizeJob);
    const incomingNews = normalizeArray(payload.news).map(normalizeNews);
    const incomingUsers = normalizeArray(payload.users);

    if (!merge) {
      setAll(KEYS.products, incomingProducts);
      setAll(KEYS.jobs, incomingJobs);
      setAll(KEYS.news, incomingNews);
      setAll(KEYS.users, incomingUsers);
      setMeta({ version: VERSION, importedAt: nowISO() });
      return { ok: true, mode: "replace" };
    }

    incomingProducts.forEach((p) => upsert(KEYS.products, p, { prefix: "prod" }));
    incomingJobs.forEach((j) => upsert(KEYS.jobs, j, { prefix: "job" }));
    incomingNews.forEach((n) => upsert(KEYS.news, n, { prefix: "news" }));
    incomingUsers.forEach((u) => upsert(KEYS.users, u, { prefix: "u" }));

    setMeta({ version: VERSION, importedAt: nowISO(), mode: "merge" });
    return { ok: true, mode: "merge" };
  }

  // -------------------------
  // Public API
  // -------------------------
  window.LasanteStore = {
    VERSION,
    KEYS,

    // core
    read,
    write,
    uid,
    nowISO,
    clear,

    // generic CRUD
    list,
    getById,
    setAll,
    add,
    update,
    upsert,
    remove,

    // search/filter
    queryList,

    // domain CRUD
    addProduct,
    updateProduct,
    addJob,
    updateJob,
    addNews,
    updateNews,

    // seed / migration
    seedIfEmpty,
    migrateIfNeeded,
    getMeta,
    exportAll,
    importAll,
  };
})();