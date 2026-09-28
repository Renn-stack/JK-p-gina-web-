import { validators, setFieldError, statusHtml, escapeHtml } from './validation';
import { getPaymentProvider, RECEIPT_STORAGE_KEY, PaymentError } from '../lib/payments';
import type { StoredReceipt, PaymentOrder } from '../lib/payments';
import type { PayableService, PaymentMethod } from '../config/payments';

interface FlowConfig {
  services: PayableService[];
  methods: PaymentMethod[];
  currency: string;
  minAmount: number;
  mock: boolean;
}

const TOTAL_STEPS = 5;

export function initPaymentFlow(root: HTMLElement) {
  const cfg: FlowConfig = JSON.parse(root.dataset.config || '{}');
  const form = root.querySelector<HTMLFormElement>('[data-pay-form]')!;
  const q = <T extends HTMLElement>(sel: string) => root.querySelector<T>(sel)!;

  const serviceSel = q<HTMLSelectElement>('#pay-service');
  const refInput = q<HTMLInputElement>('#pay-ref');
  const amountInput = q<HTMLInputElement>('#pay-amount');
  const amountField = q<HTMLElement>('[data-amount-field]');
  const fixedAmount = q<HTMLElement>('[data-fixed-amount]');
  const nameInput = q<HTMLInputElement>('#pay-name');
  const emailInput = q<HTMLInputElement>('#pay-email');
  const phoneInput = q<HTMLInputElement>('#pay-phone');
  const confirmBox = q<HTMLInputElement>('#pay-confirm');
  const providerSlot = q<HTMLElement>('[data-provider-slot]');
  const status = q<HTMLElement>('[data-pay-status]');
  const backBtn = q<HTMLButtonElement>('[data-back]');
  const nextBtn = q<HTMLButtonElement>('[data-next]');
  const nextLabel = q<HTMLElement>('[data-next-label]');
  const stepMobile = q<HTMLElement>('[data-step-mobile]');
  const panels = [...root.querySelectorAll<HTMLElement>('[data-panel]')];
  const indicators = [...root.querySelectorAll<HTMLElement>('[data-step-indicator]')];

  const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: cfg.currency });
  const fmt = (n: number) => `${money.format(n)} ${cfg.currency}`;

  let step = 0;
  let busy = false;

  // ---------- Estado derivado ----------
  const currentService = () => cfg.services.find((s) => s.id === serviceSel.value);
  const currentMethod = () => {
    const id = form.querySelector<HTMLInputElement>('input[name="method"]:checked')?.value;
    return cfg.methods.find((m) => m.id === id);
  };
  const parseAmount = (v: string) => {
    const n = Number(v.replace(/[^\d.]/g, ''));
    return Number.isFinite(n) ? Math.round(n * 100) / 100 : NaN;
  };
  const currentAmount = (): number | null => {
    const s = currentService();
    if (!s) return null;
    if (s.pricing.type === 'fixed') return s.pricing.amount;
    const n = parseAmount(amountInput.value);
    return n > 0 ? n : null;
  };

  // ---------- Pintar resumen ----------
  const out = (key: string, value: string, html = false) =>
    root.querySelectorAll<HTMLElement>(`[data-out="${key}"]`).forEach((el) => {
      if (html) el.innerHTML = value;
      else el.textContent = value;
    });

  const render = () => {
    const s = currentService();
    const m = currentMethod();
    const amount = currentAmount();
    out('area', s?.areaName ?? '—');
    out('service', s?.name ?? '—');
    out('concept', s?.concept ?? '—');
    out('reference', refInput.value.trim() || 'Sin referencia');
    out('method', m?.label ?? '—');
    out('customer', nameInput.value.trim() ? `${nameInput.value.trim()} · ${emailInput.value.trim()}` : '—');
    out('amount', amount ? fmt(amount) : '—');

    if (s?.pricing.type === 'fixed') {
      out('list-price', fmt(s.pricing.amount));
      amountField.hidden = true;
      fixedAmount.hidden = false;
      fixedAmount.textContent = fmt(s.pricing.amount);
    } else {
      out(
        'list-price',
        s?.pricing.type === 'quote'
          ? 'Según cotización'
          : 'Según cotización <span class="pending">[PENDIENTE]</span>',
        true,
      );
      amountField.hidden = false;
      fixedAmount.hidden = true;
    }
    providerSlot.hidden = m?.id !== 'card';
    nextLabel.textContent = step === TOTAL_STEPS - 1 ? (amount ? `Pagar ${money.format(amount)}` : 'Pagar') : 'Continuar';
  };

  // ---------- Navegación entre pasos ----------
  const labels = indicators.map((li) => li.querySelector('.label')?.textContent ?? '');
  const go = (next: number, focus = true) => {
    step = Math.max(0, Math.min(TOTAL_STEPS - 1, next));
    panels.forEach((p, i) => (p.hidden = i !== step));
    indicators.forEach((li, i) => {
      li.classList.toggle('done', i < step);
      if (i === step) li.setAttribute('aria-current', 'step');
      else li.removeAttribute('aria-current');
    });
    stepMobile.textContent = `Paso ${step + 1} de ${TOTAL_STEPS} · ${labels[step]}`;
    backBtn.hidden = step === 0;
    status.innerHTML = '';
    render();
    if (focus) {
      panels[step].querySelector<HTMLElement>('h2')?.focus({ preventScroll: true });
      const top = root.getBoundingClientRect().top + window.scrollY - 110;
      if (window.scrollY > top) window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  // ---------- Validación por paso ----------
  const err = (id: string) => root.querySelector<HTMLElement>(`#${id}`);
  const validateStep = (i: number): HTMLElement | null => {
    let firstInvalid: HTMLElement | null = null;
    const check = (el: HTMLElement, errId: string, message: string) => {
      if (!setFieldError(el, err(errId), message) && !firstInvalid) firstInvalid = el;
    };
    if (i === 0) {
      check(serviceSel, 'e-pay-service', serviceSel.value ? '' : 'Selecciona el servicio que deseas pagar.');
    }
    if (i === 1 && currentService()?.pricing.type !== 'fixed') {
      const n = parseAmount(amountInput.value);
      check(
        amountInput,
        'e-pay-amount',
        !amountInput.value.trim()
          ? 'Captura el monto a pagar.'
          : !(n >= cfg.minAmount)
            ? `El monto debe ser de al menos ${fmt(cfg.minAmount)}.`
            : '',
      );
    }
    if (i === 2) {
      check(nameInput, 'e-pay-name', validators.name(nameInput.value));
      check(emailInput, 'e-pay-email', validators.email(emailInput.value));
      check(phoneInput, 'e-pay-phone', validators.phone(phoneInput.value));
    }
    if (i === 3) {
      const first = form.querySelector<HTMLInputElement>('input[name="method"]')!;
      const e = err('e-pay-method');
      if (!currentMethod()) {
        if (e) e.textContent = 'Selecciona un método de pago.';
        firstInvalid = first;
      } else if (e) e.textContent = '';
    }
    if (i === 4) {
      check(confirmBox, 'e-pay-confirm', confirmBox.checked ? '' : 'Confirma que los datos son correctos.');
    }
    return firstInvalid;
  };

  // ---------- Pago ----------
  const pay = async () => {
    const s = currentService()!;
    const m = currentMethod()!;
    const amount = currentAmount()!;
    const order: PaymentOrder = {
      serviceId: s.id,
      concept: s.concept,
      amount,
      currency: cfg.currency,
      reference: refInput.value.trim() || undefined,
      methodId: m.id,
      customer: { name: nameInput.value.trim(), email: emailInput.value.trim(), phone: phoneInput.value.trim() },
    };

    busy = true;
    nextBtn.disabled = backBtn.disabled = true;
    nextLabel.textContent = 'Procesando…';

    try {
      const result = await getPaymentProvider().createPayment(order);
      if (result.kind === 'redirect') {
        window.location.assign(result.url);
        return;
      }
      const receipt: StoredReceipt = {
        reference: result.reference,
        simulated: result.kind === 'simulated',
        concept: s.concept,
        amount,
        currency: cfg.currency,
        methodLabel: m.label,
        customerName: order.customer.name,
        customerEmail: order.customer.email,
        clientReference: order.reference,
        date: new Date().toISOString(),
      };
      try {
        sessionStorage.setItem(RECEIPT_STORAGE_KEY, JSON.stringify(receipt));
      } catch {
        /* almacenamiento no disponible: la confirmación mostrará datos mínimos */
      }
      const params = new URLSearchParams({ ref: result.reference });
      if (receipt.simulated) params.set('modo', 'prueba');
      window.location.assign(`/pago/confirmacion/?${params}`);
    } catch (e) {
      const msg = e instanceof PaymentError ? e.message : 'No fue posible iniciar el pago. Intenta de nuevo.';
      status.innerHTML = statusHtml('error', 'Pago no realizado', escapeHtml(msg));
      busy = false;
      nextBtn.disabled = backBtn.disabled = false;
      render();
    }
  };

  // ---------- Eventos ----------
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (busy) return;
    const invalid = validateStep(step);
    if (invalid) {
      invalid.focus();
      return;
    }
    if (step < TOTAL_STEPS - 1) go(step + 1);
    else void pay();
  });
  backBtn.addEventListener('click', () => go(step - 1));

  form.addEventListener('input', (e) => {
    const t = e.target as HTMLElement;
    if (t.getAttribute('aria-invalid') === 'true') validateStep(step);
    render();
  });
  form.addEventListener('change', (e) => {
    if ((e.target as HTMLInputElement).name === 'method') {
      const el = err('e-pay-method');
      if (el) el.textContent = '';
    }
    render();
  });
  amountInput.addEventListener('blur', () => {
    const n = parseAmount(amountInput.value);
    if (n > 0) amountInput.value = n.toFixed(2);
  });

  // Preselección: /pago?servicio=<area>/<servicio>
  const pre = new URLSearchParams(location.search).get('servicio');
  if (pre && cfg.services.some((s) => s.id === pre)) serviceSel.value = pre;

  go(0, false);
}
