/* assets/js/api.js
   Simple API wrapper fetch-based
   - Usa meta[name="api-base"] si existe
   - Manejo de JSON, errores y 401 (redirige a login)
   - Exporta funciones: get, post, put, del
*/

const API_BASE = document.querySelector('meta[name="api-base"]')?.content || '/api';

async function _fetch(path, opts = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
  const headers = { ...(opts.headers || {}) };

  // JSON body default header
  if (opts.body && !(opts.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // Attach token if present (optional)
  const token = localStorage.getItem('lasante_token');
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, { credentials: 'include', ...opts, headers });

  // Handle unauthorized centrally
  if (res.status === 401) {
    localStorage.removeItem('lasante_token');
    // If on admin area, redirect to login
    if (location.pathname.startsWith('/admin')) {
      window.location.replace('/admin/login.html');
    }
    return { ok: false, status: 401, error: 'Unauthorized' };
  }

  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }

  return { ok: res.ok, status: res.status, data };
}

export async function apiGet(path) { return _fetch(path, { method: 'GET' }); }
export async function apiPost(path, body) {
  const opts = body instanceof FormData ? { method: 'POST', body } : { method: 'POST', body: JSON.stringify(body) };
  return _fetch(path, opts);
}
export async function apiPut(path, body) {
  const opts = body instanceof FormData ? { method: 'PUT', body } : { method: 'PUT', body: JSON.stringify(body) };
  return _fetch(path, opts);
}
export async function apiDel(path) { return _fetch(path, { method: 'DELETE' }); }
