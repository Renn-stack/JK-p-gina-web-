import type { PaymentProvider } from './types';

/**
 * PROVEEDOR DE PRUEBA (MOCK)
 * No se comunica con ningún banco ni pasarela y NO realiza cargos.
 * Genera una referencia claramente marcada como "SIMULACION".
 */
export const mockProvider: PaymentProvider = {
  id: 'mock',
  async createPayment() {
    await new Promise((r) => setTimeout(r, 900));
    const stamp = Date.now().toString(36).toUpperCase();
    return { kind: 'simulated', reference: `SIMULACION-${stamp}` };
  },
};
