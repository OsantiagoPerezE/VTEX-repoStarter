import { ExternalClient, IOClients } from '@vtex/api'
import type { InstanceOptions, IOContext } from '@vtex/api'

/**
 * Respuesta del servicio externo de cotización de envíos (simulado).
 * Ejemplo:
 *   GET /api/quotes?productId=123&postalCode=110111
 *   [{ "carrier": "Servientrega", "days": 3, "cost": 12000 }, ...]
 */
export interface ShippingQuote {
  carrier: string
  days: number
  cost: number
}

export class ShippingMockClient extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super('http://shipping-mock.example.com', context, {
      ...options,
      headers: {
        ...options?.headers,
        'X-Vtex-Use-Https': 'true',
      },
    })
  }

  public getQuotes(
    productId: string,
    postalCode: string,
    options?: { timeout?: number; retries?: number }
  ) {
    return this.http.get<ShippingQuote[]>('/api/quotes', {
      params: { productId, postalCode },
      timeout: options?.timeout,
      retries: options?.retries,
      metric: 'shipping-mock-get-quotes',
    })
  }

  public ping() {
    return this.http.get<{ ok: boolean }>('/health', {
      metric: 'shipping-mock-ping',
    })
  }
}

export class Clients extends IOClients {
  public get shippingMock() {
    return this.getOrSet('shippingMock', ShippingMockClient)
  }
}
