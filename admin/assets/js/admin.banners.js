/* admin.banners.js
   UI logic para /admin/banners.html
   - Integración SortableJS (drag & drop) + fallback botones ▲/▼
   - Usa admin.js (API-ready) para operaciones
   - Intenta API; si falla, usa demo localStorage
*/

import {
  requireAuthOrRedirect,
  ensureSeedData,
  getBanners,
  saveBanner,
  deleteBanner,
  reorderBanners,
  fetchBannersFromApi,
  createBannerToApi,
  logout
} from "./admin.js";

requireAuthOrRedirect();
ensureSeedData();

/* -------------------------
   Elementos DOM
   ------------------------- */
const els = {
  rows: document.getElementById("rows"),
  btnNew: document.getElementById("btnNew"),
  btnSaveOrder: document.getElementById("btnSaveOrder"),
  btnReset: document.getElementById("btnReset"),
  form: document.getElementById("form"),
  id: document.getElementById("id"),
  title: document.getElementById("title"),
  image: document.getElementById("image"),
  link: document.getElementById("link"),
  isActive: document.getElementById("isActive"),
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

/* -------------------------
   Estado local
   ------------------------- */
let workingOrderIds = [];
const API_REORDER_PATH = "/api/banners/reorder";
const tbody = els.rows;

/* -------------------------
   Utilidades
   ------------------------- */
function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function safeAsync(fn) {
  return (...args) => fn(...args).catch((e) => console.error(e));
}

/* -------------------------
   Drag & Drop (SortableJS) helpers
   ------------------------- */
function enableDragAndDrop(listEl, onOrderChange) {
  if (window.Sortable) {
    const sortable = new Sortable(listEl, {
      animation: 160,
      handle: ".drag-handle",
      ghostClass: "sortable-ghost",
      chosenClass: "sortable-chosen",
      onEnd: () => {
        const ids = Array.from(listEl.querySelectorAll("tr[data-id]")).map((tr) => tr.dataset.id);
        onOrderChange(ids);
      }
    });
    return () => sortable.destroy();
  }
  // fallback no-op
  return () => {};
}

async function persistOrder(newOrderIds) {
  // Try API first
  try {
    const res = await fetch(API_REORDER_PATH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: newOrderIds })
    });
    if (res.ok) {
      alert("Orden guardado (API).");
      await loadAndRender();
      return;
    }
  } catch (err) {
    // ignore and fallback to demo
  }

  // Fallback demo: reorder in localStorage
  try {
    reorderBanners(newOrderIds);
    alert("Orden guardado (demo).");
    await loadAndRender();
  } catch (err) {
    console.error("Error guardando orden (demo):", err);
    alert("Error guardando orden.");
  }
}

let destroyDnD = null;
function initDnD() {
  if (destroyDnD) destroyDnD();
  destroyDnD = enableDragAndDrop(tbody, (ids) => {
    // update working order immediately for UI consistency
    workingOrderIds = ids.slice();
    // persist automatically on drop
    persistOrder(ids);
  });
}

/* -------------------------
   Renderizado
   ------------------------- */
function renderRows(banners) {
  if (!banners || banners.length === 0) {
    els.rows.innerHTML = `<tr><td colspan="5" class="muted">No hay banners.</td></tr>`;
    initDnD();
    return;
  }

  els.rows.innerHTML = banners
    .map((b, idx) => {
      const badge = b.isActive ? `<span class="badge ok">Activo</span>` : `<span class="badge off">Off</span>`;
      const order = b.order ?? idx + 1;
      return `
        <tr data-id="${b.id}">
          <td class="drag-handle" aria-hidden="true">☰</td>
          <td>${order}</td>
          <td>${escapeHtml(b.title)}</td>
          <td>${badge}</td>
          <td style="display:flex; gap:8px; flex-wrap:wrap;">
            <button class="btn" data-action="up" data-id="${b.id}" type="button">▲</button>
            <button class="btn" data-action="down" data-id="${b.id}" type="button">▼</button>
            <button class="btn" data-action="edit" data-id="${b.id}" type="button">Editar</button>
            <button class="btn danger" data-action="del" data-id="${b.id}" type="button">Borrar</button>
          </td>
        </tr>
      `;
    })
    .join("");

  // After DOM updated, initialize DnD
  initDnD();
}

/* -------------------------
   Carga y sincronización
   ------------------------- */
async function loadAndRender() {
  // Try API first
  try {
    const api = await fetchBannersFromApi();
    if (api?.ok && Array.isArray(api.data)) {
      const banners = api.data.slice().sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
      workingOrderIds = banners.map((b) => b.id);
      renderRows(banners);
      return;
    }
  } catch (e) {
    // fallback to demo
  }

  const banners = getBanners();
  workingOrderIds = banners.map((b) => b.id);
  renderRows(banners);
}

/* -------------------------
   Editor helpers
   ------------------------- */
function resetForm() {
  els.form.reset();
  els.id.value = "";
  els.preview.removeAttribute("src");
  els.editorTitle.textContent = "Editor";
}

function fillForm(b) {
  els.id.value = b.id || "";
  els.title.value = b.title || "";
  els.image.value = b.image || "";
  els.link.value = b.link || "";
  els.isActive.value = String(!!b.isActive);
  updatePreview();
  els.editorTitle.textContent = b.id ? "Editar banner" : "Nuevo banner";
}

function updatePreview() {
  const path = els.image.value.trim();
  if (!path) {
    els.preview.removeAttribute("src");
    return;
  }
  const src = path.match(/^https?:\/\//) ? path : `/${path.replace(/^\/+/, "")}`;
  els.preview.src = src;
}

/* -------------------------
   Reordenamiento por botones (accesibilidad / fallback)
   ------------------------- */
function moveId(id, direction) {
  const idx = workingOrderIds.indexOf(id);
  if (idx < 0) return;
  const swapWith = direction === "up" ? idx - 1 : idx + 1;
  if (swapWith < 0 || swapWith >= workingOrderIds.length) return;
  const copy = workingOrderIds.slice();
  [copy[idx], copy[swapWith]] = [copy[swapWith], copy[idx]];
  workingOrderIds = copy;

  // Re-render visual order using current storage
  const bannersById = new Map(getBanners().map((b) => [b.id, b]));
  const ordered = workingOrderIds.map((x) => bannersById.get(x)).filter(Boolean);
  renderRows(ordered.map((b, i) => ({ ...b, order: i + 1 })));
}

/* -------------------------
   Eventos UI
   ------------------------- */
els.btnNew.addEventListener("click", () => {
  resetForm();
  els.title.focus();
});
els.btnReset.addEventListener("click", resetForm);
els.image.addEventListener("input", updatePreview);

els.rows.addEventListener(
  "click",
  safeAsync(async (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const id = btn.dataset.id;
    const action = btn.dataset.action;

    if (action === "up" || action === "down") {
      moveId(id, action);
      return;
    }

    if (action === "edit") {
      // Try API first
      try {
        const api = await fetchBannersFromApi();
        if (api?.ok && Array.isArray(api.data)) {
          const b = api.data.find((x) => String(x.id) === String(id));
          if (b) {
            fillForm(b);
            return;
          }
        }
      } catch {}
      const b = getBanners().find((x) => x.id === id);
      if (b) fillForm(b);
      return;
    }

    if (action === "del") {
      const ok = confirm("¿Seguro que deseas borrar este banner? (demo)");
      if (!ok) return;

      // Try API delete if implemented (omitted here), else demo
      deleteBanner(id);
      await loadAndRender();
      resetForm();
    }
  })
);

els.btnSaveOrder.addEventListener(
  "click",
  safeAsync(async () => {
    // Persist order: try API (if you implement), else demo reorder
    try {
      await persistOrder(workingOrderIds);
    } catch (err) {
      console.error(err);
      alert("Error guardando orden.");
    }
  })
);

els.form.addEventListener(
  "submit",
  safeAsync(async (e) => {
    e.preventDefault();

    const payload = {
      id: els.id.value || undefined,
      title: els.title.value.trim(),
      image: els.image.value.trim().replace(/^\/+/, ""),
      link: els.link.value.trim(),
      isActive: els.isActive.value === "true"
    };

    // Try API create first
    try {
      if (!payload.id) {
        const api = await createBannerToApi(payload);
        if (api?.ok) {
          alert("Creado (API).");
          resetForm();
          await loadAndRender();
          return;
        }
      } else {
        // If API supports update, call it here (PUT /banners/{id})
      }
    } catch (err) {
      // fallback
    }

    // Demo save
    try {
      saveBanner(payload);
      alert("Banner guardado (demo).");
      resetForm();
      await loadAndRender();
    } catch (err) {
      console.error(err);
      alert("Error guardando banner.");
    }
  })
);

/* -------------------------
   Inicialización
   ------------------------- */
loadAndRender();
