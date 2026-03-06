/* assets/js/auth.js
   Helpers mínimos de autenticación para Admin
   - logout() limpia token y local demo
   - loginApi() ejemplo (retorna {ok, data})
*/

import { apiPost } from './api.js';

export function logoutLocal() {
  localStorage.removeItem('lasante_token');
  localStorage.removeItem('lasante_admin_auth');
  // limpiar demo store si existe
  if (window.LasanteStore && typeof window.LasanteStore.clear === 'function') {
    try {
      window.LasanteStore.clear(window.LasanteStore.KEYS.products);
      window.LasanteStore.clear(window.LasanteStore.KEYS.jobs);
      window.LasanteStore.clear(window.LasanteStore.KEYS.news);
      window.LasanteStore.clear(window.LasanteStore.KEYS.users);
    } catch {}
  }
}

export async function loginApi(email, password) {
  try {
    const res = await apiPost('/auth/login', { email, password });
    if (res.ok && res.data?.token) {
      localStorage.setItem('lasante_token', res.data.token);
      return { ok: true, data: res.data };
    }
    return { ok: false, error: res.data || 'Login failed' };
  } catch (err) {
    return { ok: false, error: err.message || err };
  }
}
