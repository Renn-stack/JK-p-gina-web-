/**
 * ============================================================
 *  CONFIGURACIÓN DE PAGOS
 * ============================================================
 *
 *  Aquí se definen: proveedor de pagos, precios y métodos.
 *
 *  ESTADO ACTUAL: MODO DE PRUEBA (provider: 'mock').
 *  - No existe todavía una pasarela conectada.
 *  - Ningún pago se procesa realmente; la confirmación lo indica.
 *  - NO se capturan datos de tarjeta en este sitio. Cuando se conecte
 *    Stripe o Mercado Pago, los datos de tarjeta los recibirá
 *    directamente el proveedor (Checkout / Elements / Bricks).
 *
 *  Para conectar una pasarela real, ver README.md → "Pagos".
 * ============================================================
 */

import { practiceAreas } from '../data/practice-areas';

export type PaymentProviderId = 'mock' | 'checkout-endpoint';

/**
 * - fixed:   precio fijo definido por el despacho (en MXN).
 * - quote:   el monto depende de la cotización entregada al cliente;
 *            el cliente captura el monto y la referencia indicados.
 * - pending: precio aún no definido. Se comporta como `quote` y
 *            muestra "[PENDIENTE]" como precio de lista.
 */
export type Pricing =
  | { type: 'fixed'; amount: number }
  | { type: 'quote' }
  | { type: 'pending' };

export interface PayableService {
  id: string; // `${areaSlug}/${serviceSlug}`
  areaSlug: string;
  areaName: string;
  serviceSlug: string;
  name: string;
  concept: string;
  pricing: Pricing;
}

export interface PaymentMethod {
  id: 'card' | 'transfer' | 'cash';
  label: string;
  description: string;
  enabled: boolean;
}

export const paymentsConfig = {
  /**
   * 'mock'              → simulación (actual). No cobra nada.
   * 'checkout-endpoint' → envía la orden a `checkoutEndpoint` (tu backend),
   *                       que crea la sesión en Stripe / Mercado Pago y
   *                       responde { redirectUrl } o { status, reference }.
   */
  provider: 'mock' as PaymentProviderId,

  /** Endpoint de tu backend para crear el cobro. [PENDIENTE] */
  checkoutEndpoint: null as string | null,

  currency: 'MXN',

  /** Monto mínimo aceptado cuando el cliente captura el importe de su cotización. */
  minAmount: 1,

  /**
   * Métodos de pago que se mostrarán. [PENDIENTE confirmar con el proveedor]
   * Son categorías genéricas, no representan convenios reales todavía.
   */
  methods: [
    {
      id: 'card',
      label: 'Tarjeta de crédito o débito',
      description: 'Pago en línea a través de la pasarela segura del proveedor.',
      enabled: true,
    },
    {
      id: 'transfer',
      label: 'Transferencia bancaria',
      description: 'Recibirás los datos para transferir. Datos bancarios: [PENDIENTE].',
      enabled: true,
    },
    {
      id: 'cash',
      label: 'Pago en efectivo',
      description: 'Referencia para pagar en establecimiento. Disponibilidad: [PENDIENTE].',
      enabled: true,
    },
  ] as PaymentMethod[],

  /**
   * Precios por servicio. Clave: `${areaSlug}/${serviceSlug}`.
   * Todo servicio no listado aquí queda como { type: 'pending' }.
   * Ejemplo (NO ACTIVO):  'civil/usucapion': { type: 'fixed', amount: 0 },
   */
  prices: {} as Record<string, Pricing>,
};

export const isMockMode = paymentsConfig.provider === 'mock';

/** Catálogo de servicios que se pueden pagar, derivado de las áreas de práctica. */
export const payableServices: PayableService[] = practiceAreas.flatMap((area) =>
  area.services.map((service) => {
    const id = `${area.slug}/${service.slug}`;
    return {
      id,
      areaSlug: area.slug,
      areaName: area.name,
      serviceSlug: service.slug,
      name: service.name,
      concept: `Honorarios profesionales — ${service.name}`,
      pricing: paymentsConfig.prices[id] ?? { type: 'pending' },
    };
  }),
);

export function formatMoney(amount: number, currency = paymentsConfig.currency) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency }).format(amount);
}
