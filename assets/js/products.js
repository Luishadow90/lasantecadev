/* ============================================================
   PORTAFOLIO — JS ADMINISTRABLE
   Categorías · Productos · Moléculas · Catálogo
   Compatible con .NET + SQL Server + IIS
   ============================================================ */

const API_BASE = "/api"; 
// En producción: "/api/v1" o la ruta que definas en IIS

/* ---------------------------
   Helpers DOM
---------------------------- */
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

/* ---------------------------
   Render: Categorías
---------------------------- */
function renderCategory(cat) {
  const el = document.createElement("a");
  el.className = "category-card";
  el.href = `categoria.html?id=${encodeURIComponent(cat.slug)}`;

  el.innerHTML = `
    <div class="cat-media">
      <img src="${cat.imageUrl || 'assets/img/categorias/placeholder.jpg'}" alt="${cat.name}">
    </div>
    <h4>${cat.name}</h4>
    <p class="cat-meta">${cat.description || ""}</p>
    <span class="link">Ver productos →</span>
  `;

  return el;
}

async function loadCategories() {
  const grid = $(".categories-grid");
  if (!grid) return;

  try {
    const res = await fetch(`${API_BASE}/categories`);
    const data = await res.json();

    grid.innerHTML = "";
    data.forEach((cat) => grid.appendChild(renderCategory(cat)));

  } catch (err) {
    console.error("Error cargando categorías:", err);
  }
}

/* ---------------------------
   Render: Productos destacados
---------------------------- */
function renderProductCard(p) {
  const el = document.createElement("article");
  el.className = "product-card";

  el.innerHTML = `
    <img src="${p.imageUrl || 'assets/img/products/placeholder.png'}" alt="${p.name}">
    <div class="p">
      <strong>${p.name}</strong>
      <p class="muted">${p.categoryName || ""}</p>
      <button class="btn ghost mt-1 view-product" data-id="${p.id}">
        Ver ficha
      </button>
    </div>
  `;

  return el;
}

async function loadFeaturedProducts() {
  const grid = $(".product-grid");
  if (!grid) return;

  try {
    const res = await fetch(`${API_BASE}/products?featured=true`);
    const data = await res.json();

    grid.innerHTML = "";
    data.forEach((p) => grid.appendChild(renderProductCard(p)));

  } catch (err) {
    console.error("Error cargando productos destacados:", err);
  }
}

/* ---------------------------
   Render: Moléculas
---------------------------- */
async function loadMolecules() {
  const tbody = $("#moleculas table tbody") || $("#molecule-table tbody");
  if (!tbody) return;

  try {
    const res = await fetch(`${API_BASE}/molecules`);
    const data = await res.json();

    tbody.innerHTML = "";

    data.forEach((m) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${m.name}</td>
        <td>${m.presentation || ""}</td>
        <td>${m.categoryName || ""}</td>
        <td><a href="producto.html?id=${m.productId}">Ver</a></td>
      `;
      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error("Error cargando moléculas:", err);
  }
}

/* ---------------------------
   Modal de producto
---------------------------- */
function openModal(html) {
  const modal = $("#product-modal");
  const content = $("#modal-content");

  if (!modal || !content) return;

  content.innerHTML = html;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  const modal = $("#product-modal");
  if (!modal) return;

  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

document.addEventListener("click", async (ev) => {
  // Abrir modal
  const btn = ev.target.closest(".view-product");
  if (btn) {
    const id = btn.dataset.id;

    try {
      const res = await fetch(`${API_BASE}/products/${id}`);
      const p = await res.json();

      const html = `
        <div class="product-modal">
          <div class="product-media-large">
            <img src="${p.imageUrl || 'assets/img/products/placeholder.png'}" alt="${p.name}">
          </div>
          <h3>${p.name}</h3>
          <p class="muted">${p.categoryName || ""} · ${p.presentation || ""}</p>
          <p>${p.description || "Sin descripción disponible."}</p>
          <div class="mt-2">
            <a class="btn primary" href="ficha.html?id=${p.id}">Ver ficha completa</a>
          </div>
        </div>
      `;

      openModal(html);

    } catch (err) {
      console.error("Error cargando producto:", err);
    }
  }

  // Cerrar modal
  if (ev.target.matches("[data-close]") || ev.target.closest(".modal-close")) {
    closeModal();
  }
});

/* ---------------------------
   ADMIN HOOKS (CRUD)
   Para conectar con tu Admin
---------------------------- */
async function adminCreateCategory(payload) {
  return fetch(`${API_BASE}/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then((r) => r.json());
}

async function adminUpdateCategory(id, payload) {
  return fetch(`${API_BASE}/categories/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then((r) => r.json());
}

async function adminDeleteCategory(id) {
  return fetch(`${API_BASE}/categories/${id}`, {
    method: "DELETE",
  }).then((r) => r.ok);
}

async function adminCreateProduct(payload) {
  return fetch(`${API_BASE}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then((r) => r.json());
}

async function adminUpdateProduct(id, payload) {
  return fetch(`${API_BASE}/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then((r) => r.json());
}

async function adminDeleteProduct(id) {
  return fetch(`${API_BASE}/products/${id}`, {
    method: "DELETE",
  }).then((r) => r.ok);
}

/* ---------------------------
   INIT
---------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  loadCategories();
  loadFeaturedProducts();
  loadMolecules();
});
