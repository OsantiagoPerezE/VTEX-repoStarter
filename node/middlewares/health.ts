import type { ServiceContext } from '@vtex/api'

import type { Clients } from '../clients'

type Context = ServiceContext<Clients>

export async function health(ctx: Context, next: () => Promise<unknown>) {
  try {
    await ctx.clients.shippingMock.ping()
    ctx.status = 200
    ctx.body = { status: 'ok' }
  } catch (error) {
    ctx.status = 503
    ctx.body = {
      status: 'down',
      error: error instanceof Error ? error.message : 'unknown error',
    }
  }

  ctx.set('Content-Type', 'application/json')
  ctx.set('Cache-Control', 'no-store')

  await next()
}
