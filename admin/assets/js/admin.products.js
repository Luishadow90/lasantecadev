/* admin.products.js
   Admin: CRUD de productos (API-ready) + fallback demo localStorage
   - LocalStorage key: lasante_products_v1
   - Endpoints esperados: GET /api/products, POST /api/products, PUT /api/products/{id}, DELETE /api/products/{id}
*/

import {
  requireAuthOrRedirect,
  ensureSeedData,
  logout
} from "./admin.js";

requireAuthOrRedirect();
ensureSeedData();

const LS_KEY = "lasante_products_v1";
const API_BASE = document.querySelector('meta[name="api-base"]')?.content || "/api";

const els = {
  productsGrid: document.getElementById("productsGrid"),
  rows: document.getElementById("rows"),
  q: document.getElementById("q"),
  btnNew: document.getElementById("btnNew"),
  btnReset: document.getElementById("btnReset"),
  form: document.getElementById("form"),
  id: document.getElementById("id"),
  name: document.getElementById("name"),
  sku: document.getElementById("sku"),
  category: document.getElementById("category"),
  price: document.getElementById("price"),
  image: document.getElementById("image"),
  excerpt: document.getElementById("excerpt"),
  description: document.getElementById("description"),
  status: document.getElementById("status"),
  preview: document.getElementById("preview"),
  editorTitle: document.getElementById("editorTitle"),
  btnLogout: document.getElementById("btnLogout")
};

if (els.btnLogout) {
  els.btnLogout.addEventListener("click", () => {
    logout();
    window.location.href = "/admin/login.html";
  });
}

function safeParse(raw, fallback) {
  try { return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
}
function readLocal() { return safeParse(localStorage.getItem(LS_KEY), []); }
function writeLocal(list) { localStorage.setItem(LS_KEY, JSON.stringify(list)); }
function uid(prefix = "prod") { return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`; }

async function fetchProductsApi() {
  try {
    const res = await fetch(`${API_BASE}/products`);
    if (!res.ok) throw new Error("no-api");
    return await res.json();
  } catch { return null; }
}

async function createProductApi(payload) {
  try {
    const res = await fetch(`${API_BASE}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("api-fail");
    return await res.json();
  } catch { return null; }
}

async function updateProductApi(id, payload) {
  try {
    const res = await fetch(`${API_BASE}/products/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("api-fail");
    return await res.json();
  } catch { return null; }
}

async function deleteProductApi(id) {
  try {
    const res = await fetch(`${API_BASE}/products/${encodeURIComponent(id)}`, { method: "DELETE" });
    return res.ok;
  } catch { return false; }
}

/* Seed demo */
function ensureProductsSeed() {
  const existing = readLocal();
  if (!existing || existing.length === 0) {
    const seed = [
      { id: uid(), name: "Producto A", sku: "PA-001", category: "Suplemento", price: 19.9, image: "assets/img/products/prod-a.jpg", excerpt: "Suplemento para bienestar.", description: "Descripción demo del producto A.", status: "published", createdAt: new Date().toISOString() },
      { id: uid(), name: "Producto B", sku: "PB-002", category: "Medicamento", price: 29.5, image: "assets/img/products/prod-b.jpg", excerpt: "Medicamento para uso tópico.", description: "Descripción demo del producto B.", status: "draft", createdAt: new Date().toISOString() }
    ];
    writeLocal(seed);
  }
}

/* Render helpers */
function escapeHtml(s) {
  return String(s ?? '')
    .replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
    .replaceAll('"','&quot;').replaceAll("'",'&#039;');
}

function productCardHtml(p) {
  const img = p.image ? `<img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" style="width:100%; height:140px; object-fit:cover; border-radius:8px;" />` : '';
  return `
    <article class="card product-card" data-id="${p.id}">
      ${img}
      <div class="p">
        <h4 class="m0">${escapeHtml(p.name)}</h4>
        <p class="muted mt-1">${escapeHtml(p.category)} · ${escapeHtml(p.sku || '')}</p>
        <p class="mt-1"><strong>${p.price ? '$' + Number(p.price).toFixed(2) : ''}</strong></p>
        <div style="margin-top:10px; display:flex; gap:8px;">
          <button class="btn" data-action="edit" data-id="${p.id}">Editar</button>
          <button class="btn danger" data-action="del" data-id="${p.id}">Borrar</button>
        </div>
      </div>
    </article>
  `;
}

function renderTableRows(list) {
  if (!list || list.length === 0) {
    els.rows.innerHTML = `<tr><td colspan="5" class="muted">No hay productos.</td></tr>`;
    els.productsGrid.innerHTML = '';
    return;
  }
  els.rows.innerHTML = list.map(p => `
    <tr data-id="${p.id}">
      <td>${escapeHtml(p.name)}</td>
      <td>${escapeHtml(p.sku || '')}</td>
      <td>${escapeHtml(p.category || '')}</td>
      <td>${escapeHtml(p.status || '')}</td>
      <td style="display:flex; gap:8px; flex-wrap:wrap;">
        <button class="btn" data-action="edit" data-id="${p.id}">Editar</button>
        <button class="btn danger" data-action="del" data-id="${p.id}">Borrar</button>
      </td>
    </tr>
  `).join('');
  els.productsGrid.innerHTML = list.slice(0,9).map(productCardHtml).join('');
}

/* Load and render (API first, fallback local) */
async function loadAndRender() {
  try {
    const api = await fetchProductsApi();
    if (Array.isArray(api)) {
      renderTableRows(api);
      return;
    }
  } catch {}
  const local = readLocal();
  renderTableRows(local);
}

/* Editor actions */
function resetForm() {
  els.form.reset();
  els.id.value = "";
  els.preview.removeAttribute("src");
  els.editorTitle.textContent = "Editor";
}

function fillForm(p) {
  els.id.value = p.id || "";
  els.name.value = p.name || "";
  els.sku.value = p.sku || "";
  els.category.value = p.category || "";
  els.price.value = p.price || "";
  els.image.value = p.image || "";
  els.excerpt.value = p.excerpt || "";
  els.description.value = p.description || "";
  els.status.value = p.status || "draft";
  updatePreview();
  els.editorTitle.textContent = p.id ? "Editar producto" : "Nuevo producto";
}

function updatePreview() {
  const path = els.image.value.trim();
  if (!path) { els.preview.removeAttribute("src"); return; }
  const src = path.match(/^https?:\/\//) ? path : `/${path.replace(/^\/+/, "")}`;
  els.preview.src = src;
}

/* Local CRUD */
function saveLocalProduct(payload) {
  const list = readLocal();
  if (payload.id) {
    const idx = list.findIndex(x => x.id === payload.id);
    if (idx >= 0) { list[idx] = { ...list[idx], ...payload, updatedAt: new Date().toISOString() }; writeLocal(list); return list[idx]; }
  }
  const newP = { id: uid(), createdAt: new Date().toISOString(), ...payload };
  list.unshift(newP);
  writeLocal(list);
  return newP;
}
function deleteLocalProduct(id) {
  const list = readLocal().filter(x => x.id !== id);
  writeLocal(list);
}

/* Events */
els.btnNew.addEventListener('click', () => { resetForm(); els.name.focus(); });
els.btnReset.addEventListener('click', resetForm);

els.rows.addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const id = btn.dataset.id;
  const action = btn.dataset.action;

  if (action === 'edit') {
    // try API detail
    try {
      const res = await fetch(`${API_BASE}/products/${encodeURIComponent(id)}`);
      if (res.ok) {
        const prod = await res.json();
        fillForm(prod);
        return;
      }
    } catch {}
    const prod = readLocal().find(x => x.id === id);
    if (prod) fillForm(prod);
    return;
  }

  if (action === 'del') {
    if (!confirm('¿Seguro que deseas borrar este producto? (demo)')) return;
    // try API delete
    try {
      const ok = await deleteProductApi(id);
      if (ok) { alert('Eliminado (API).'); await loadAndRender(); return; }
    } catch {}
    deleteLocalProduct(id);
    await loadAndRender();
  }
});

els.form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    id: els.id.value || undefined,
    name: els.name.value.trim(),
    sku: els.sku.value.trim(),
    category: els.category.value.trim(),
    price: els.price.value ? Number(els.price.value) : undefined,
    image: els.image.value.trim().replace(/^\/+/, ""),
    excerpt: els.excerpt.value.trim(),
    description: els.description.value.trim(),
    status: els.status.value
  };

  // Try API create/update
  try {
    if (!payload.id) {
      const created = await createProductApi(payload);
      if (created) { alert('Creado (API).'); resetForm(); await loadAndRender(); return; }
    } else {
      const updated = await updateProductApi(payload.id, payload);
      if (updated) { alert('Actualizado (API).'); resetForm(); await loadAndRender(); return; }
    }
  } catch {}

  // Fallback demo local
  try {
    saveLocalProduct(payload);
    alert('Guardado (demo).');
    resetForm();
    await loadAndRender();
  } catch (err) {
    console.error(err);
    alert('Error guardando producto.');
  }
});

/* Search */
els.q.addEventListener('input', () => {
  const term = els.q.value.trim().toLowerCase();
  const list = readLocal().filter(p => `${p.name} ${p.sku} ${p.category}`.toLowerCase().includes(term));
  renderTableRows(list);
});

/* Init */
ensureProductsSeed();
loadAndRender();
