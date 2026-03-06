/* assets/js/store.js
   La Santé — Local Store (Demo) v1.2
   - LocalStorage wrapper, CRUD genérico, normalizadores, seed, migrate, import/export
   - Expone window.LasanteStore
*/

(function () {
  "use strict";

  const VERSION = "1.2.0";

  const KEYS = {
    products: "lasante_products_v1",
    jobs: "lasante_jobs_v1",
    news: "lasante_news_v1",
    users: "lasante_users_v1",
    meta: "lasante_meta_v1"
  };

  /* -------------------------
     Core helpers
     ------------------------- */
  function safeJSONParse(raw, fallback) {
    try { return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
  }
  function read(key, fallback) { return safeJSONParse(localStorage.getItem(key), fallback); }
  function write(key, value) { localStorage.setItem(key, JSON.stringify(value)); return value; }
  function clear(key) { localStorage.removeItem(key); }
  function nowISO() { return new Date().toISOString(); }
  function uid(prefix = "id") {
    return `${prefix}_${Math.random().toString(36).slice(2,8)}_${Date.now().toString(36)}`;
  }
  function normalizeArray(v) { return Array.isArray(v) ? v : []; }
  function normalizeString(v, fallback = "") { return typeof v === "string" ? v : fallback; }
  function normalizeBool(v, fallback = false) { return typeof v === "boolean" ? v : fallback; }
  function normalizeObj(v, fallback = {}) { return v && typeof v === "object" && !Array.isArray(v) ? v : fallback; }
  function trimOrEmpty(s) { return normalizeString(s).trim(); }
  function toLower(s) { return normalizeString(s).toLowerCase(); }
  function uniq(arr) { return Array.from(new Set(normalizeArray(arr).map(x => normalizeString(x).trim()).filter(Boolean))); }

  /* -------------------------
     Generic CRUD
     ------------------------- */
  function list(key) { return normalizeArray(read(key, [])); }
  function getById(key, id) { return list(key).find(x => x && x.id === id) || null; }
  function setAll(key, items) { return write(key, normalizeArray(items)); }

  function add(key, item, opts = {}) {
    const items = list(key);
    const created = {
      id: item?.id || uid(opts.prefix || "id"),
      createdAt: item?.createdAt || nowISO(),
      updatedAt: item?.updatedAt || nowISO(),
      ...item
    };
    items.unshift(created);
    setAll(key, items);
    return created;
  }

  function update(key, id, patch) {
    const items = list(key);
    const idx = items.findIndex(x => x && x.id === id);
    if (idx === -1) return null;
    const updated = { ...items[idx], ...patch, id, updatedAt: nowISO() };
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
    const next = items.filter(x => x && x.id !== id);
    setAll(key, next);
    return next.length !== items.length;
  }

  /* -------------------------
     Search / Filter helpers
     ------------------------- */
  function matchesQuery(text, q) {
    const t = toLower(text || "");
    const qq = toLower(q || "");
    if (!qq) return true;
    return t.includes(qq);
  }

  function sortByUpdatedDesc(a, b) {
    const da = Date.parse(a?.updatedAt || a?.createdAt || 0) || 0;
    const db = Date.parse(b?.updatedAt || b?.createdAt || 0) || 0;
    return db - da;
  }

  function queryList(key, opts = {}) {
    const items = list(key).slice().sort(sortByUpdatedDesc);
    const q = normalizeString(opts.q, "").trim();
    const isActive = typeof opts.isActive === "boolean" ? opts.isActive : undefined;
    const where = typeof opts.where === "function" ? opts.where : null;
    const mapText = typeof opts.mapText === "function" ? opts.mapText : (x) => JSON.stringify(x || {});
    const limit = Number.isFinite(opts.limit) ? Math.max(0, opts.limit) : Infinity;

    const filtered = items.filter(x => {
      if (!x) return false;
      if (typeof isActive === "boolean" && normalizeBool(x.isActive, true) !== isActive) return false;
      if (where && !where(x)) return false;
      if (q && !matchesQuery(mapText(x), q)) return false;
      return true;
    });

    return filtered.slice(0, limit);
  }

  /* -------------------------
     Domain normalizers
     ------------------------- */
  function normalizeProduct(p = {}) {
    const obj = normalizeObj(p, {});
    return {
      id: obj.id || undefined,
      name: trimOrEmpty(obj.name),
      sku: trimOrEmpty(obj.sku),
      category: trimOrEmpty(obj.category),
      categoryId: trimOrEmpty(obj.categoryId),
      categoryName: trimOrEmpty(obj.categoryName),
      description: trimOrEmpty(obj.description),
      excerpt: trimOrEmpty(obj.excerpt),
      badge: trimOrEmpty(obj.badge),
      image: trimOrEmpty(obj.image),
      tags: uniq(obj.tags),
      price: typeof obj.price === "number" ? obj.price : (obj.price ? Number(obj.price) : undefined),
      isActive: normalizeBool(obj.isActive, true),
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt
    };
  }

  function normalizeJob(j = {}) {
    const obj = normalizeObj(j, {});
    return {
      id: obj.id || undefined,
      title: trimOrEmpty(obj.title),
      location: trimOrEmpty(obj.location),
      modality: trimOrEmpty(obj.modality),
      area: trimOrEmpty(obj.area),
      level: trimOrEmpty(obj.level),
      shortDescription: trimOrEmpty(obj.shortDescription),
      description: trimOrEmpty(obj.description),
      requirements: normalizeArray(obj.requirements).map(x => trimOrEmpty(x)).filter(Boolean),
      responsibilities: normalizeArray(obj.responsibilities).map(x => trimOrEmpty(x)).filter(Boolean),
      offer: normalizeArray(obj.offer || obj.weOffer).map(x => trimOrEmpty(x)).filter(Boolean),
      applyUrl: trimOrEmpty(obj.applyUrl),
      applyEmail: trimOrEmpty(obj.applyEmail),
      isActive: normalizeBool(obj.isActive, true),
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt
    };
  }

  function normalizeNews(n = {}) {
    const obj = normalizeObj(n, {});
    const title = trimOrEmpty(obj.title);
    const slug = trimOrEmpty(obj.slug) || toLower(title).replace(/[^\p{L}\p{N}]+/gu, "-").replace(/(^-|-$)/g, "");
    return {
      id: obj.id || undefined,
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
      updatedAt: obj.updatedAt
    };
  }

  /* -------------------------
     Meta / Migration / Seed
     ------------------------- */
  function getMeta() { return normalizeObj(read(KEYS.meta, {}), {}); }
  function setMeta(patch) { const prev = getMeta(); const next = { ...prev, ...normalizeObj(patch, {}) }; write(KEYS.meta, next); return next; }

  function migrateIfNeeded() {
    const meta = getMeta();
    const current = normalizeString(meta.version, "");
    if (current === VERSION) return;
    // Normalize existing lists
    setAll(KEYS.products, list(KEYS.products).map(normalizeProduct));
    setAll(KEYS.jobs, list(KEYS.jobs).map(normalizeJob));
    setAll(KEYS.news, list(KEYS.news).map(normalizeNews));
    setAll(KEYS.users, list(KEYS.users));
    setMeta({ version: VERSION, migratedAt: nowISO() });
  }

  // Demo seed (minimal examples)
  const SEED = {
    products: [
      { id: "prod_1", name: "Producto A", sku: "PA-001", category: "Suplemento", price: 19.9, image: "assets/img/products/prod-a.jpg", excerpt: "Suplemento para bienestar.", description: "Descripción demo del producto A.", isActive: true }
    ],
    jobs: [
      { id: "job_1", title: "Coordinador de Calidad", location: "Guatemala", area: "Calidad", type: "full-time", description: "Coordinar procesos de calidad.", isActive: true }
    ],
    news: [
      { id: "news_1", title: "Nota demo", excerpt: "Resumen", content: "Contenido demo", image: "", isActive: true }
    ],
    users: [
      { id: "u_admin", email: "admin@lasante", role: "admin", password: "Admin123!" }
    ]
  };

  function seedIfEmpty() {
    if (!list(KEYS.products).length) setAll(KEYS.products, SEED.products.map(p => ({ ...normalizeProduct(p), createdAt: nowISO(), updatedAt: nowISO() })));
    if (!list(KEYS.jobs).length) setAll(KEYS.jobs, SEED.jobs.map(j => ({ ...normalizeJob(j), createdAt: nowISO(), updatedAt: nowISO() })));
    if (!list(KEYS.news).length) setAll(KEYS.news, SEED.news.map(n => ({ ...normalizeNews(n), createdAt: nowISO(), updatedAt: nowISO() })));
    if (!list(KEYS.users).length) setAll(KEYS.users, SEED.users.map(u => ({ ...u, createdAt: nowISO(), updatedAt: nowISO() })));
  }

  /* -------------------------
     Domain wrappers
     ------------------------- */
  function addProduct(p) { return add(KEYS.products, normalizeProduct(p), { prefix: "prod" }); }
  function updateProduct(id, patch) { return update(KEYS.products, id, normalizeProduct({ ...patch, id })); }
  function addJob(j) { return add(KEYS.jobs, normalizeJob(j), { prefix: "job" }); }
  function updateJob(id, patch) { return update(KEYS.jobs, id, normalizeJob({ ...patch, id })); }
  function addNews(n) { return add(KEYS.news, normalizeNews(n), { prefix: "news" }); }
  function updateNews(id, patch) { return update(KEYS.news, id, normalizeNews({ ...patch, id })); }

  /* -------------------------
     Import / Export
     ------------------------- */
  function exportAll() {
    return {
      version: VERSION,
      exportedAt: nowISO(),
      products: list(KEYS.products),
      jobs: list(KEYS.jobs),
      news: list(KEYS.news),
      users: list(KEYS.users)
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

    incomingProducts.forEach(p => upsert(KEYS.products, p, { prefix: "prod" }));
    incomingJobs.forEach(j => upsert(KEYS.jobs, j, { prefix: "job" }));
    incomingNews.forEach(n => upsert(KEYS.news, n, { prefix: "news" }));
    incomingUsers.forEach(u => upsert(KEYS.users, u, { prefix: "u" }));

    setMeta({ version: VERSION, importedAt: nowISO(), mode: "merge" });
    return { ok: true, mode: "merge" };
  }

  /* -------------------------
     Public API
     ------------------------- */
  window.LasanteStore = {
    VERSION,
    KEYS,
    // core
    read, write, clear, uid, nowISO,
    // generic CRUD
    list, getById, setAll, add, update, upsert, remove,
    // search
    queryList,
    // domain
    addProduct, updateProduct, addJob, updateJob, addNews, updateNews,
    // seed/migrate
    seedIfEmpty, migrateIfNeeded, getMeta, setMeta,
    // import/export
    exportAll, importAll,
    // normalizers (exposed for debugging)
    normalizeProduct, normalizeJob, normalizeNews
  };

  // bootstrap
  seedIfEmpty();
  migrateIfNeeded();
})();
