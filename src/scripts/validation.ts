/** Utilidades de validación compartidas por los formularios. */

export const digits = (v: string) => v.replace(/\D/g, '');

export const validators = {
  required: (v: string) => (v.trim() ? '' : 'Este campo es obligatorio.'),
  name: (v: string) => (v.trim().length >= 3 ? '' : 'Escribe tu nombre completo.'),
  email: (v: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Escribe un correo electrónico válido.',
  phone: (v: string) => {
    const d = digits(v);
    return d.length >= 10 && d.length <= 13 ? '' : 'Escribe un número de al menos 10 dígitos.';
  },
  optionalPhone: (v: string) => (v.trim() ? validators.phone(v) : ''),
};

/** Muestra u oculta el error de un campo y ajusta aria-invalid. Devuelve true si es válido. */
export function setFieldError(field: HTMLElement, errorEl: HTMLElement | null, message: string): boolean {
  if (message) field.setAttribute('aria-invalid', 'true');
  else field.removeAttribute('aria-invalid');
  if (errorEl) errorEl.textContent = message;
  return !message;
}

export function statusHtml(kind: 'info' | 'error' | 'success', title: string, body: string) {
  const cls = kind === 'info' ? '' : ` notice--${kind}`;
  const icon =
    kind === 'success'
      ? '<path d="m5 12.5 4.5 4.5L19 7.5"/>'
      : '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.6v.1"/>';
  return `<div class="notice${cls}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true">${icon}</svg><div><strong>${title}</strong><br>${body}</div></div>`;
}

export function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}
