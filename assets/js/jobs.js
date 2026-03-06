/* assets/js/jobs.js
   Wrapper API para Jobs (frontend + admin)
   - Exporta funciones: fetchJobs, getJob, createJob, updateJob, deleteJob
   - Usa meta[name="api-base"] para base path
   - Manejo básico de errores y fallback (no escribe local)
*/
const API_BASE = document.querySelector('meta[name="api-base"]')?.content || '/api';

async function safeJson(res) {
  const text = await res.text();
  try { return text ? JSON.parse(text) : null; } catch { return null; }
}

export async function fetchJobs() {
  try {
    const res = await fetch(`${API_BASE}/jobs`);
    if (!res.ok) throw new Error('api-fail');
    return { ok: true, data: await safeJson(res) };
  } catch (err) {
    return { ok: false, error: err };
  }
}

export async function getJob(id) {
  try {
    const res = await fetch(`${API_BASE}/jobs/${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error('api-fail');
    return { ok: true, data: await safeJson(res) };
  } catch (err) {
    return { ok: false, error: err };
  }
}

export async function createJob(payload) {
  try {
    const res = await fetch(`${API_BASE}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('api-fail');
    return { ok: true, data: await safeJson(res) };
  } catch (err) {
    return { ok: false, error: err };
  }
}

export async function updateJob(id, payload) {
  try {
    const res = await fetch(`${API_BASE}/jobs/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('api-fail');
    return { ok: true, data: await safeJson(res) };
  } catch (err) {
    return { ok: false, error: err };
  }
}

export async function deleteJob(id) {
  try {
    const res = await fetch(`${API_BASE}/jobs/${encodeURIComponent(id)}`, { method: 'DELETE' });
    return { ok: res.ok };
  } catch (err) {
    return { ok: false, error: err };
  }
}
