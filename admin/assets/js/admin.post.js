/* admin.posts.js
   UI logic para /admin/posts.html
   - Usa admin.js (API-ready) para operaciones
   - Intenta API; si falla, usa demo localStorage
*/

import {
  requireAuthOrRedirect,
  ensureSeedData,
  getPosts,
  savePost,
  deletePost,
  fetchPostsFromApi,
  createPostToApi,
  getAuth,
  logout
} from "./admin.js";

requireAuthOrRedirect();
ensureSeedData();

const els = {
  rows: document.getElementById("rows"),
  q: document.getElementById("q"),
  btnNew: document.getElementById("btnNew"),
  btnReset: document.getElementById("btnReset"),
  form: document.getElementById("form"),
  id: document.getElementById("id"),
  title: document.getElementById("title"),
  slug: document.getElementById("slug"),
  category: document.getElementById("category"),
  status: document.getElementById("status"),
  coverImage: document.getElementById("coverImage"),
  excerpt: document.getElementById("excerpt"),
  content: document.getElementById("content"),
  editorTitle: document.getElementById("editorTitle"),
  btnLogout: document.getElementById("btnLogout")
};

// Logout handler (if present)
if (els.btnLogout) {
  els.btnLogout.addEventListener("click", () => {
    logout();
    window.location.href = "/admin/login.html";
  });
}

function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function loadPostsAndRender() {
  const q = els.q.value.trim().toLowerCase();

  // Try API first
  try {
    const api = await fetchPostsFromApi();
    if (api?.ok && Array.isArray(api.data)) {
      renderRows(api.data.filter(p => filterPost(p, q)));
      return;
    }
  } catch (e) {
    // ignore and fallback
  }

  // Fallback demo
  const posts = getPosts().filter(p => filterPost(p, q));
  renderRows(posts);
}

function filterPost(p, q) {
  if (!q) return true;
  const hay = `${p.title} ${p.slug}`.toLowerCase();
  return hay.includes(q);
}

function renderRows(posts) {
  if (!posts || posts.length === 0) {
    els.rows.innerHTML = `<tr><td colspan="4" class="muted">No hay artículos.</td></tr>`;
    return;
  }

  els.rows.innerHTML = posts.map(p => {
    const badge = (p.status === "published")
      ? `<span class="badge ok">Publicado</span>`
      : `<span class="badge off">Borrador</span>`;

    return `
      <tr>
        <td>${escapeHtml(p.title)}</td>
        <td>${escapeHtml(p.slug)}</td>
        <td>${badge}</td>
        <td style="display:flex; gap:8px; flex-wrap:wrap;">
          <button class="btn" data-action="edit" data-id="${p.id}" type="button">Editar</button>
          <button class="btn danger" data-action="del" data-id="${p.id}" type="button">Borrar</button>
        </td>
      </tr>
    `;
  }).join("");
}

// Fill editor
function fillForm(post) {
  els.id.value = post.id || "";
  els.title.value = post.title || "";
  els.slug.value = post.slug || "";
  els.category.value = post.category || "";
  els.status.value = post.status || "draft";
  els.coverImage.value = post.coverImage || "";
  els.excerpt.value = post.excerpt || "";
  els.content.value = post.content || "";
  els.editorTitle.textContent = post.id ? "Editar artículo" : "Nuevo artículo";
}

// Reset editor
function resetForm() {
  els.form.reset();
  els.id.value = "";
  els.content.value = "";
  els.editorTitle.textContent = "Editor";
}

// Row actions (edit/delete)
els.rows.addEventListener("click", async (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const id = btn.dataset.id;
  const action = btn.dataset.action;

  // Try to get post from API first, else from local
  let post = null;
  try {
    const api = await fetchPostsFromApi();
    if (api?.ok && Array.isArray(api.data)) {
      post = api.data.find(p => String(p.id) === String(id));
    }
  } catch {}

  if (!post) {
    post = getPosts().find(p => String(p.id) === String(id));
  }

  if (action === "edit" && post) {
    fillForm(post);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (action === "del") {
    const ok = confirm("¿Seguro que deseas borrar este artículo? (demo)");
    if (!ok) return;

    // Try API delete (if you implement it), else demo
    try {
      // If API has DELETE /news/{id}, implement here using fetch
      // Example:
      // const res = await fetch(`${API_BASE}/news/${id}`, { method: 'DELETE', headers: {...} });
      // if (res.ok) { await loadPostsAndRender(); resetForm(); return; }
    } catch {}

    deletePost(id);
    await loadPostsAndRender();
    resetForm();
  }
});

// New / Reset buttons
els.btnNew.addEventListener("click", () => { resetForm(); els.title.focus(); });
els.btnReset.addEventListener("click", resetForm);

// Search
els.q.addEventListener("input", () => { loadPostsAndRender(); });

// Submit (save)
els.form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    id: els.id.value || undefined,
    title: els.title.value.trim(),
    slug: els.slug.value.trim(),
    category: els.category.value.trim(),
    status: els.status.value,
    coverImage: els.coverImage.value.trim(),
    excerpt: els.excerpt.value.trim(),
    content: els.content.value.trim()
  };

  // Try API create/update first
  try {
    if (!payload.id) {
      const apiCreate = await createPostToApi(payload);
      if (apiCreate?.ok) {
        alert("Creado (API).");
        resetForm();
        await loadPostsAndRender();
        return;
      }
    } else {
      // If API supports update, call it here (PUT /news/{id})
      // Example:
      // const res = await fetch(`${API_BASE}/news/${payload.id}`, { method: 'PUT', body: JSON.stringify(payload), headers: {...} });
      // if (res.ok) { alert('Actualizado (API).'); ... }
    }
  } catch (err) {
    // ignore and fallback
  }

  // Fallback demo save
  try {
    savePost(payload);
    alert("Guardado (demo).");
    resetForm();
    await loadPostsAndRender();
  } catch (err) {
    console.error(err);
    alert("Error guardando artículo.");
  }
});

// Initial render
loadPostsAndRender();
