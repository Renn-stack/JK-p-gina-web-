import { validators, setFieldError, statusHtml, digits } from './validation';

interface CatalogArea {
  slug: string;
  name: string;
  services: { slug: string; name: string }[];
}

export function initAdvisoryForm(form: HTMLFormElement) {
  const catalog: CatalogArea[] = JSON.parse(form.dataset.catalog || '[]');
  const endpoint = form.dataset.endpoint || '';
  const whatsapp = form.dataset.whatsapp || '';

  const $ = <T extends HTMLElement>(sel: string) => form.querySelector<T>(sel)!;
  const name = $<HTMLInputElement>('#f-name');
  const phone = $<HTMLInputElement>('#f-phone');
  const wa = $<HTMLInputElement>('#f-wa');
  const same = $<HTMLInputElement>('[data-same-phone]');
  const email = $<HTMLInputElement>('#f-email');
  const area = $<HTMLSelectElement>('#f-area');
  const service = $<HTMLSelectElement>('#f-service');
  const desc = $<HTMLTextAreaElement>('#f-desc');
  const privacy = $<HTMLInputElement>('input[name="privacidad"]');
  const status = $<HTMLElement>('[data-status]');
  const submit = $<HTMLButtonElement>('[data-submit]');
  const submitLabel = $<HTMLElement>('[data-submit-label]');
  const count = $<HTMLElement>('[data-count]');

  // --- Servicios dependientes del área ---
  const fillServices = (areaSlug: string, selected = '') => {
    const found = catalog.find((a) => a.slug === areaSlug);
    service.innerHTML = '';
    const first = document.createElement('option');
    first.value = '';
    first.textContent = found ? 'Selecciona un servicio' : 'Primero selecciona un área';
    service.append(first);
    if (found) {
      for (const s of found.services) {
        const o = document.createElement('option');
        o.value = s.slug;
        o.textContent = s.name;
        if (s.slug === selected) o.selected = true;
        service.append(o);
      }
      const other = document.createElement('option');
      other.value = 'otro';
      other.textContent = 'Otro / no estoy seguro';
      service.append(other);
    }
    service.disabled = !found;
  };
  area.addEventListener('change', () => fillServices(area.value));

  // --- Prellenado desde la URL ---
  const params = new URLSearchParams(location.search);
  const qArea = params.get('area');
  if (qArea && catalog.some((a) => a.slug === qArea)) {
    area.value = qArea;
    fillServices(qArea, params.get('servicio') ?? '');
  }

  // --- WhatsApp = teléfono ---
  const syncWa = () => {
    if (same.checked) wa.value = phone.value;
    wa.readOnly = same.checked;
  };
  same.addEventListener('change', syncWa);
  phone.addEventListener('input', () => same.checked && syncWa());

  desc.addEventListener('input', () => (count.textContent = String(desc.value.length)));

  // --- Validación ---
  const rules: [HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, (v: string) => string][] = [
    [name, validators.name],
    [phone, validators.phone],
    [wa, validators.optionalPhone],
    [email, validators.email],
    [area, (v) => (v ? '' : 'Selecciona un área, o “No estoy seguro”.')],
    [desc, (v) => (v.trim().length >= 10 ? '' : 'Describe brevemente tu caso (mínimo 10 caracteres).')],
  ];
  const errorFor = (el: HTMLElement) =>
    form.querySelector<HTMLElement>(`#${el.getAttribute('aria-describedby')?.split(' ').find((id) => id.startsWith('e-'))}`);

  const validateField = (el: (typeof rules)[number][0], rule: (v: string) => string) =>
    setFieldError(el, errorFor(el), rule(el.value));

  for (const [el, rule] of rules) {
    el.addEventListener('blur', () => el.value && validateField(el, rule));
    el.addEventListener('input', () => el.getAttribute('aria-invalid') && validateField(el, rule));
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.innerHTML = '';
    let firstInvalid: HTMLElement | null = null;
    for (const [el, rule] of rules) {
      if (!validateField(el, rule) && !firstInvalid) firstInvalid = el;
    }
    const privacyOk = setFieldError(privacy, form.querySelector('#e-privacy'), privacy.checked ? '' : 'Es necesario aceptar el aviso de privacidad.');
    if (!privacyOk && !firstInvalid) firstInvalid = privacy;
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    const areaName = catalog.find((a) => a.slug === area.value)?.name ?? 'No estoy seguro';
    const serviceName = service.selectedOptions[0]?.value ? service.selectedOptions[0].textContent ?? '' : '';
    const payload = {
      nombre: name.value.trim(),
      telefono: digits(phone.value),
      whatsapp: digits(wa.value),
      correo: email.value.trim(),
      area: areaName,
      servicio: serviceName,
      descripcion: desc.value.trim(),
      origen: location.href,
      fecha: new Date().toISOString(),
    };

    submit.disabled = true;
    submitLabel.textContent = 'Enviando…';

    try {
      if (endpoint) {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(String(res.status));
        form.reset();
        fillServices('');
        count.textContent = '0';
        status.innerHTML = statusHtml(
          'success',
          'Solicitud enviada',
          'Gracias por contactar a LJ Jurídico. Revisaremos tu información y nos comunicaremos contigo.',
        );
      } else {
        // MODO DE PRUEBA: no existe un canal de recepción configurado.
        console.info('[LJ Jurídico] Solicitud (modo de prueba, no enviada):', payload);
        const waLink = whatsapp
          ? ` También puedes <a class="text-link" target="_blank" rel="noopener" href="https://wa.me/${whatsapp}?text=${encodeURIComponent(
              `Hola, soy ${payload.nombre}. Solicito asesoría en: ${payload.area}${payload.servicio ? ' – ' + payload.servicio : ''}. ${payload.descripcion}`,
            )}">enviarla por WhatsApp</a>.`
          : '';
        status.innerHTML = statusHtml(
          'info',
          'Formulario en modo de prueba',
          `Tus datos son válidos, pero la solicitud <b>no se envió</b> porque el canal de recepción del despacho está [PENDIENTE] de configurar.${waLink}`,
        );
      }
      status.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    } catch {
      status.innerHTML = statusHtml(
        'error',
        'No pudimos enviar tu solicitud',
        'Ocurrió un problema de conexión. Por favor intenta de nuevo en unos momentos.',
      );
    } finally {
      submit.disabled = false;
      submitLabel.textContent = 'Enviar solicitud';
    }
  });
}
