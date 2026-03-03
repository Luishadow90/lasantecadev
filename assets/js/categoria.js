/* categoria.js
   Renderiza detalle de categoría, filtros, paginación y modal.
*/

const API_BASE = "/api"; // ajustar en producción

const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

/* Util: obtener slug desde querystring */
function getQueryParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

/* Render product card (reutilizable) */
function productCard(p) {
  const el = document.createElement('article');
  el.className = 'product-card';
  el.innerHTML = `
    <img src="${p.imageUrl || 'assets/img/products/placeholder.png'}" alt="${p.name}">
    <div class="p">
      <strong>${p.name}</strong>
      <div class="muted">${p.presentation || ''} · ${p.molecule || ''}</div>
      <div class="mt-2">
        <button class="btn ghost view-product" data-id="${p.id}">Ver ficha</button>
      </div>
    </div>
  `;
  return el;
}

/* Modal helpers */
function openModal(html) {
  const modal = $('#product-modal');
  $('#modal-content').innerHTML = html;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden','false');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  const modal = $('#product-modal');
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden','true');
  document.body.style.overflow = '';
}

/* Fetch category meta and render hero */
async function loadCategoryMeta(slug) {
  try {
    const res = await fetch(`${API_BASE}/categories/slug/${encodeURIComponent(slug)}`);
    if(!res.ok) throw new Error('No category');
    const cat = await res.json();
    $('#cat-title').textContent = cat.name;
    $('#cat-desc').textContent = cat.description || '';
    $('#breadcrumb-current').textContent = cat.name;
    $('#cat-kicker').textContent = cat.kicker || 'Portafolio';
    $('#cta-catalog').href = cat.catalogUrl || '#';
  } catch (e) {
    console.warn('No se encontró metadata de categoría', e);
  }
}

/* State y carga de productos con filtros y paginación */
let state = {
  slug: getQueryParam('id') || 'analgesicos',
  q: '',
  presentation: '',
  sort: 'relevance',
  page: 1,
  perPage: 6,
  total: 0
};

function buildQuery() {
  const params = new URLSearchParams();
  params.set('category', state.slug);
  if(state.q) params.set('q', state.q);
  if(state.presentation) params.set('presentation', state.presentation);
  if(state.sort) params.set('sort', state.sort);
  params.set('page', state.page);
  params.set('perPage', state.perPage);
  return params.toString();
}

async function loadProducts() {
  const grid = $('#products-grid');
  const countEl = $('#results-count');
  grid.innerHTML = '<div class="muted">Cargando productos…</div>';
  try {
    const qs = buildQuery();
    const res = await fetch(`${API_BASE}/products?${qs}`);
    const data = await res.json();
    // API expected: { items: [], total: number }
    const items = data.items || [];
    state.total = data.total || items.length;
    grid.innerHTML = '';
    if(!items.length) {
      grid.innerHTML = '<div class="muted">No se encontraron productos.</div>';
    } else {
      items.forEach(p => grid.appendChild(productCard(p)));
    }
    const totalText = `${state.total} producto${state.total === 1 ? '' : 's'}`;
    countEl.textContent = totalText;
    renderPagination();
  } catch (e) {
    console.error('Error cargando productos', e);
    grid.innerHTML = '<div class="muted">Error cargando productos.</div>';
  }
}

/* Paginación */
function renderPagination() {
  const container = $('#pagination');
  container.innerHTML = '';
  const totalPages = Math.max(1, Math.ceil(state.total / state.perPage));
  const createBtn = (n, label) => {
    const b = document.createElement('button');
    b.textContent = label || n;
    if(n === state.page) b.setAttribute('aria-current','true');
    b.addEventListener('click', () => {
      state.page = n;
      loadProducts();
      window.scrollTo({ top: 200, behavior: 'smooth' });
    });
    return b;
  };

  // simple windowed pagination
  const start = Math.max(1, state.page - 2);
  const end = Math.min(totalPages, state.page + 2);

  if(state.page > 1) container.appendChild(createBtn(state.page - 1, '‹'));
  for(let i = start; i <= end; i++) container.appendChild(createBtn(i));
  if(state.page < totalPages) container.appendChild(createBtn(state.page + 1, '›'));
}

/* Event listeners: filtros, búsqueda, per-page */
function bindUI() {
  $('#search').addEventListener('input', (e) => {
    state.q = e.target.value.trim();
    state.page = 1;
    debounce(loadProducts, 350)();
  });

  $('#filter-presentation').addEventListener('change', (e) => {
    state.presentation = e.target.value;
    state.page = 1;
    loadProducts();
  });

  $('#sort').addEventListener('change', (e) => {
    state.sort = e.target.value;
    state.page = 1;
    loadProducts();
  });

  $('#per-page').addEventListener('change', (e) => {
    state.perPage = parseInt(e.target.value, 10);
    state.page = 1;
    loadProducts();
  });

  $('#reset-filters').addEventListener('click', () => {
    state.q = '';
    state.presentation = '';
    state.sort = 'relevance';
    state.page = 1;
    $('#search').value = '';
    $('#filter-presentation').value = '';
    $('#sort').value = 'relevance';
    loadProducts();
  });

  // Delegation: abrir modal
  document.addEventListener('click', async (ev) => {
    const view = ev.target.closest('.view-product');
    if(view) {
      const id = view.dataset.id;
      try {
        const res = await fetch(`${API_BASE}/products/${id}`);
        const p = await res.json();
        const html = `
          <div class="product-modal">
            <div class="product-media-large"><img src="${p.imageUrl || 'assets/img/products/placeholder.png'}" alt="${p.name}"></div>
            <h3>${p.name}</h3>
            <p class="muted">${p.categoryName || ''} · ${p.presentation || ''}</p>
            <p>${p.description || 'Sin descripción.'}</p>
            <div class="mt-2">
              <a class="btn primary" href="ficha.html?id=${p.id}">Ver ficha completa</a>
            </div>
          </div>
        `;
        openModal(html);
      } catch (e) {
        console.error('Error al cargar producto', e);
      }
    }

    if(ev.target.matches('[data-close]') || ev.target.closest('.modal-close')) {
      closeModal();
    }
  });

  // Admin: agregar producto (ejemplo rápido)
  $('#admin-add-product').addEventListener('click', async () => {
    const name = prompt('Nombre del producto (demo):');
    if(!name) return;
    const payload = { name, categorySlug: state.slug, featured: false, active: true };
    try {
      await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(payload)
      });
      alert('Producto creado (demo). Actualiza la lista.');
      loadProducts();
    } catch (e) {
      console.error('Error creando producto', e);
      alert('Error creando producto.');
    }
  });
}

/* Debounce helper */
function debounce(fn, wait) {
  let t;
  return function(...args) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

/* Init */
document.addEventListener('DOMContentLoaded', () => {
  const slug = state.slug;
  loadCategoryMeta(slug);
  bindUI();
  loadProducts();
});
