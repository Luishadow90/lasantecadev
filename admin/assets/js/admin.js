/* ==========================================================================
   Admin (demo) logic - La Santé
   - Autenticación DEMO con localStorage
   - CRUD DEMO para Posts y Banners con localStorage
   - Pensado para migrar a API (.NET + SQL) después sin rehacer UI
   ========================================================================== */

const LS_KEYS = {
  auth: "lasante_admin_auth",
  posts: "lasante_posts",
  banners: "lasante_banners"
};

/** --------------------------------------------------------------------------
 * Auth (demo)
 * - Usuario: admin@lasante
 * - Password: Admin123!
 * ------------------------------------------------------------------------- */
export function loginDemo(email, password) {
  const ok = (email === "admin@lasante" && password === "Admin123!");
  if (!ok) return { ok: false, message: "Credenciales inválidas (demo)." };

  localStorage.setItem(LS_KEYS.auth, JSON.stringify({
    isAuthed: true,
    email,
    ts: Date.now()
  }));

  return { ok: true };
}

export function logout() {
  localStorage.removeItem(LS_KEYS.auth);
}

export function requireAuthOrRedirect() {
  const raw = localStorage.getItem(LS_KEYS.auth);
  const auth = raw ? JSON.parse(raw) : null;

  if (!auth || !auth.isAuthed) {
    window.location.href = "/admin/login.html";
  }
}

/** --------------------------------------------------------------------------
 * Storage helpers
 * ------------------------------------------------------------------------- */
function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

/** --------------------------------------------------------------------------
 * Seed (crea datos de ejemplo si no existen)
 * ------------------------------------------------------------------------- */
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
        content: "Contenido demo. Aquí irá el artículo completo.",
        coverImage: "assets/img/blog/demo-1.jpg",
        createdAt: new Date().toISOString()
      }
    ]);
  }

  if (!banners) {
    // Nota: paths relativos al root del sitio (IIS)
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

/** --------------------------------------------------------------------------
 * Posts (CRUD demo)
 * ------------------------------------------------------------------------- */
export function getPosts() {
  return readJson(LS_KEYS.posts, []);
}

export function savePost(input) {
  const posts = getPosts();
  const nowIso = new Date().toISOString();

  if (input.id) {
    const idx = posts.findIndex(p => p.id === input.id);
    if (idx >= 0) posts[idx] = { ...posts[idx], ...input };
    writeJson(LS_KEYS.posts, posts);
    return;
  }

  posts.unshift({
    id: uid("post"),
    createdAt: nowIso,
    ...input
  });

  writeJson(LS_KEYS.posts, posts);
}

export function deletePost(id) {
  const posts = getPosts().filter(p => p.id !== id);
  writeJson(LS_KEYS.posts, posts);
}

/** --------------------------------------------------------------------------
 * Banners (CRUD demo)
 * ------------------------------------------------------------------------- */
export function getBanners() {
  const banners = readJson(LS_KEYS.banners, []);
  // Orden estable por "order"
  return banners.slice().sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
}

export function saveBanner(input) {
  const banners = getBanners();

  if (input.id) {
    const idx = banners.findIndex(b => b.id === input.id);
    if (idx >= 0) banners[idx] = { ...banners[idx], ...input };
    writeJson(LS_KEYS.banners, banners);
    return;
  }

  const nextOrder = (banners.reduce((m, b) => Math.max(m, b.order ?? 0), 0) + 1);

  banners.push({
    id: uid("banner"),
    order: nextOrder,
    isActive: true,
    ...input
  });

  writeJson(LS_KEYS.banners, banners);
}

export function deleteBanner(id) {
  const banners = getBanners().filter(b => b.id !== id);
  writeJson(LS_KEYS.banners, banners);
}

export function reorderBanners(newOrderIds) {
  const banners = getBanners();
  const map = new Map(banners.map(b => [b.id, b]));

  const updated = newOrderIds
    .map((id, idx) => ({ ...map.get(id), order: idx + 1 }))
    .filter(Boolean);

  writeJson(LS_KEYS.banners, updated);
}
