/**
 * Contrato común para cualquier proveedor de pagos.
 * Stripe, Mercado Pago u otro deben implementarse detrás de esta interfaz
 * para que la interfaz de usuario no cambie.
 */

export interface PaymentOrder {
  serviceId: string;
  concept: string;
  amount: number; // en unidades de la moneda (ej. 1500.00 MXN)
  currency: string;
  reference?: string; // expediente / folio de cotización
  methodId: 'card' | 'transfer' | 'cash';
  customer: {
    name: string;
    email: string;
    phone: string;
  };
}

export type PaymentResult =
  /** El proveedor requiere redirigir al cliente (Stripe Checkout, Mercado Pago Checkout Pro…). */
  | { kind: 'redirect'; url: string }
  /** Pago confirmado por el backend a partir de la respuesta del proveedor. */
  | { kind: 'completed'; reference: string }
  /** Simulación: NO se realizó ningún cargo. */
  | { kind: 'simulated'; reference: string };

export interface PaymentProvider {
  id: string;
  createPayment(order: PaymentOrder): Promise<PaymentResult>;
}

export class PaymentError extends Error {}
