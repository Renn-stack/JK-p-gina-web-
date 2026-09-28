import type { PaymentOrder, PaymentProvider, PaymentResult } from './types';
import { PaymentError } from './types';

/**
 * PROVEEDOR GENÉRICO VÍA BACKEND
 *
 * Envía la orden a tu propio endpoint (serverless / API). Ese backend,
 * con las llaves SECRETAS guardadas en variables de entorno, debe:
 *   - Stripe:        crear una Checkout Session y devolver { redirectUrl: session.url }
 *   - Mercado Pago:  crear una Preference y devolver { redirectUrl: preference.init_point }
 *
 * Las llaves secretas NUNCA deben estar en este repositorio del frontend.
 * La confirmación real del pago debe validarse con webhooks del proveedor.
 */
export function createCheckoutEndpointProvider(endpoint: string): PaymentProvider {
  return {
    id: 'checkout-endpoint',
    async createPayment(order: PaymentOrder): Promise<PaymentResult> {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });
      if (!res.ok) throw new PaymentError('No fue posible iniciar el pago. Intenta de nuevo.');
      const data = (await res.json()) as { redirectUrl?: string; status?: string; reference?: string };
      if (data.redirectUrl) return { kind: 'redirect', url: data.redirectUrl };
      if (data.status === 'completed' && data.reference) return { kind: 'completed', reference: data.reference };
      throw new PaymentError('Respuesta inesperada del servidor de pagos.');
    },
  };
}
