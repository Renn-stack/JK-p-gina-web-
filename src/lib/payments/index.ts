import { paymentsConfig } from '../../config/payments';
import { mockProvider } from './mock-provider';
import { createCheckoutEndpointProvider } from './checkout-endpoint-provider';
import type { PaymentProvider } from './types';

export * from './types';

/** Devuelve el proveedor configurado en src/config/payments.ts */
export function getPaymentProvider(): PaymentProvider {
  if (paymentsConfig.provider === 'checkout-endpoint') {
    if (!paymentsConfig.checkoutEndpoint) {
      throw new Error('paymentsConfig.checkoutEndpoint no está configurado.');
    }
    return createCheckoutEndpointProvider(paymentsConfig.checkoutEndpoint);
  }
  return mockProvider;
}

/** Clave de sessionStorage para mostrar el resumen en la página de confirmación. */
export const RECEIPT_STORAGE_KEY = 'lj:last-payment';

export interface StoredReceipt {
  reference: string;
  simulated: boolean;
  concept: string;
  amount: number;
  currency: string;
  methodLabel: string;
  customerName: string;
  customerEmail: string;
  clientReference?: string;
  date: string;
}
