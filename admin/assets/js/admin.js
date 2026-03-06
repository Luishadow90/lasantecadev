/* ==========================================================================
   Admin (demo) logic - La Santé
   - Versión optimizada: modular, segura, preparada para migrar a API (.NET + SQL)
   - Exporta las mismas funciones públicas que usas hoy (loginDemo, logout, etc.)
   - Mejora: manejo de errores, validaciones, orden, comentarios y helpers API
   ========================================================================== */

const LS_KEYS = {
  auth: "lasante_admin_auth_v1",
  posts: "lasante_posts_v1",
  banners: "lasante_banners_v1"
};

const API_BASE = document.querySelector('meta[name="api-base"]')?.content || "/api";

/* ============================
   Utilidades internas
   ============================ */
function safeParse(raw, fallback) {
  try { return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
}
function writeJson(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function readJson(key, fallback) { return safeParse(localStorage.getItem(key), fallback); }
function uid(prefix = "id") { return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`; }

/* ============================
   Auth helpers (demo + hooks para API)
   ============================ */
export function isAuthed() {
  const raw = readJson(LS_KEYS.auth, null);
  return !!(raw && raw.isAuthed);
}

export function getAuth() {
  return readJson(LS_KEYS.auth, null);
}

export function setAuth(payload) {
  writeJson(LS_KEYS.auth, payload);
}

export function clearAuth() {
  localStorage.removeItem(LS_KEYS.auth);
}

/**
 * loginDemo(email, password)
 * - Modo local: credenciales fijas para demo
 * - Guarda estado en localStorage
 */
export function loginDemo(email, password) {
  if (!email || !password) return { ok: false, message: "Email y password son requeridos." };

  const valid = (email === "admin@lasante" && password === "Admin123!");
  if (!valid) return { ok: false, message: "Credenciales inválidas (demo)." };

  setAuth({ isAuthed: true, email, ts: Date.now(), mode: "demo" });
  return { ok: true };
}

/**
 * loginApi(email, password)
 * - Intenta login real contra API; devuelve objeto { ok, data?, message? }
 * - No exportado por defecto; se puede usar desde UI para migración
 */
export async function loginApi(email, password) {
  if (!email || !password) return { ok: false, message: "Email y password son requeridos." };

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      return { ok: false, message: err?.message || "Error de autenticación (API)." };
    }

    const data = await res.json();
    // Guardar token y meta en localStorage (ajustar a cookie HttpOnly en producción)
    setAuth({ isAuthed: true, email, ts: Date.now(), mode: "api", token: data.token });
    return { ok: true, data };
  } catch (e) {
    return { ok: false, message: "No se pudo conectar con el servidor." };
  }
}

export function logout() {
  clearAuth();
  // Si hay endpoint de logout en API, se puede llamar aquí
}

/**
 * requireAuthOrRedirect()
 * - Uso en páginas admin para proteger rutas
 */
export function requireAuthOrRedirect() {
  const auth = getAuth();
  if (!auth || !auth.isAuthed) {
    window.location.href = "/admin/login.html";
  }
}

/* ============================
   API wrapper (futuro)
   - fetchApi: añade token si existe y normaliza errores
   ============================ */
async function fetchApi(path, opts = {}) {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const headers = { "Content-Type": "application/json", ...(opts.headers || {}) };
  const auth = getAuth();
  if (auth?.token) headers["Authorization"] = `Bearer ${auth.token}`;

  try {
    const res = await fetch(url, { ...opts, headers });
    const text = await res.text();
    const json = text ? JSON.parse(text) : null;
    if (!res.ok) throw { status: res.status, body: json || text };
    return { ok: true, data: json };
  } catch (err) {
    return { ok: false, error: err };
  }
}

/* ============================
   Seed (crea datos demo si no existen)
   ============================ */
export function ensureSeedData() {
  const posts = readJson(LS_KEYS.posts, null);
  const banners = readJson(LS_KEYS.banners, null);

  if (!posts) {
    writeJson(LS_KEYS.posts, [
      {
        id: uid("post"),
        title: "Dolor de espalda",
        slug: "dolor-de-espalda",
        category: "Prevención",
        status: "published",
        excerpt: "Causas comunes y recomendaciones para aliviar molestias.",
        content: "<p>Contenido demo. Aquí irá el artículo completo.</p>",
        coverImage: "assets/img/blog/demo-1.jpg",
        createdAt: new Date().toISOString()
      }
    ]);
  }

  if (!banners) {
    writeJson(LS_KEYS.banners, [
      {
        id: uid("banner"),
        title: "Salud",
        image: "assets/img/hero/Salud.jpg",
        link: "portafolio.html",
        isActive: true,
        order: 1
      },
      {
        id: uid("banner"),
        title: "Ahorro",
        image: "assets/img/hero/Ahorro.jpg",
        link: "plan-mas-salud.html",
        isActive: true,
        order: 2
      }
    ]);
  }
}

/* ============================
   Posts CRUD (demo) - API-ready
   - getPosts/savePost/deletePost funcionan con localStorage
   - si quieres migrar, reemplazar internals por fetchApi
   ============================ */
export function getPosts() {
  return readJson(LS_KEYS.posts, []);
}

export function savePost(input) {
  if (!input || typeof input !== "object") throw new Error("Input inválido para savePost.");

  const posts = getPosts();
  const nowIso = new Date().toISOString();

  if (input.id) {
    const idx = posts.findIndex(p => p.id === input.id);
    if (idx >= 0) {
      posts[idx] = { ...posts[idx], ...input, updatedAt: nowIso };
      writeJson(LS_KEYS.posts, posts);
      return posts[idx];
    }
    // si no existe, crear nuevo con ese id
  }

  const newPost = {
    id: input.id || uid("post"),
    createdAt: nowIso,
    ...input
  };
  posts.unshift(newPost);
  writeJson(LS_KEYS.posts, posts);
  return newPost;
}

export function deletePost(id) {
  if (!id) return;
  const posts = getPosts().filter(p => p.id !== id);
  writeJson(LS_KEYS.posts, posts);
}

/* ============================
   Banners CRUD (demo) - API-ready
   ============================ */
export function getBanners() {
  const banners = readJson(LS_KEYS.banners, []);
  return banners.slice().sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
}

export function saveBanner(input) {
  if (!input || typeof input !== "object") throw new Error("Input inválido para saveBanner.");

  const banners = getBanners();

  if (input.id) {
    const idx = banners.findIndex(b => b.id === input.id);
    if (idx >= 0) {
      banners[idx] = { ...banners[idx], ...input };
      writeJson(LS_KEYS.banners, banners);
      return banners[idx];
    }
  }

  const nextOrder = (banners.reduce((m, b) => Math.max(m, b.order ?? 0), 0) + 1);
  const newBanner = {
    id: input.id || uid("banner"),
    order: input.order ?? nextOrder,
    isActive: input.isActive ?? true,
    ...input
  };
  banners.push(newBanner);
  writeJson(LS_KEYS.banners, banners);
  return newBanner;
}

export function deleteBanner(id) {
  if (!id) return;
  const banners = getBanners().filter(b => b.id !== id);
  writeJson(LS_KEYS.banners, banners);
}

export function reorderBanners(newOrderIds = []) {
  if (!Array.isArray(newOrderIds)) return;
  const banners = getBanners();
  const map = new Map(banners.map(b => [b.id, b]));
  const updated = newOrderIds
    .map((id, idx) => {
      const item = map.get(id);
      if (!item) return null;
      return { ...item, order: idx + 1 };
    })
    .filter(Boolean);
  writeJson(LS_KEYS.banners, updated);
}

/* ============================
   Utilities para migración a API
   - exportar wrappers que usan fetchApi
   ============================ */
export async function fetchPostsFromApi() {
  return await fetchApi("/news");
}
export async function createPostToApi(payload) {
  return await fetchApi("/news", { method: "POST", body: JSON.stringify(payload) });
}
export async function fetchBannersFromApi() {
  return await fetchApi("/banners");
}
export async function createBannerToApi(payload) {
  return await fetchApi("/banners", { method: "POST", body: JSON.stringify(payload) });
}

/* ============================
   Fin del módulo
   ============================ */
