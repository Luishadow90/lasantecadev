/* assets/js/ui.js
   Pequeños helpers: toast simple y confirm modal programático
*/

export function toast(msg, opts = {}) {
  const rootId = 'lasante_toast_root';
  let root = document.getElementById(rootId);
  if (!root) {
    root = document.createElement('div');
    root.id = rootId;
    root.style.position = 'fixed';
    root.style.right = '18px';
    root.style.bottom = '18px';
    root.style.zIndex = 9999;
    document.body.appendChild(root);
  }
  const el = document.createElement('div');
  el.textContent = msg;
  el.style.background = 'rgba(16,31,61,0.95)';
  el.style.color = '#fff';
  el.style.padding = '10px 14px';
  el.style.borderRadius = '10px';
  el.style.marginTop = '8px';
  el.style.boxShadow = '0 8px 24px rgba(0,0,0,0.35)';
  root.appendChild(el);
  setTimeout(() => el.remove(), opts.duration || 3000);
}

export function confirmDialog(message) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.inset = 0;
    overlay.style.background = 'rgba(0,0,0,0.45)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = 10000;

    const panel = document.createElement('div');
    panel.style.background = 'var(--panel, #0f1a33)';
    panel.style.padding = '18px';
    panel.style.borderRadius = '12px';
    panel.style.maxWidth = '420px';
    panel.style.color = 'var(--text, #e9eefc)';
    panel.innerHTML = `<p style="margin:0 0 12px;">${message}</p>`;

    const btns = document.createElement('div');
    btns.style.display = 'flex';
    btns.style.gap = '8px';
    const ok = document.createElement('button');
    ok.className = 'btn primary';
    ok.textContent = 'Sí';
    const cancel = document.createElement('button');
    cancel.className = 'btn';
    cancel.textContent = 'No';
    btns.appendChild(ok);
    btns.appendChild(cancel);
    panel.appendChild(btns);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    ok.addEventListener('click', () => { overlay.remove(); resolve(true); });
    cancel.addEventListener('click', () => { overlay.remove(); resolve(false); });
  });
}
