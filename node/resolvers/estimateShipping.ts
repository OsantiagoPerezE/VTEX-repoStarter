import type { ServiceContext } from "@vtex/api";

import type { Clients, ShippingQuote } from "../clients";

type Context = ServiceContext<Clients>;

interface Args {
  productId: string;
  postalCode: string;
}

interface ShippingEstimate {
  carrierName: string;
  estimatedDays: number;
  price: number;
}

// El timeout del service es de 2s (service.json): la llamada externa debe
// resolverse (o abortarse) antes, sin reintentos, para poder responder el
// fallback a tiempo.
const QUOTES_TIMEOUT_MS = 1500;
const QUOTES_RETRIES = 0;

// Cache en memoria por réplica. Clave: productId + postalCode.
// Solo se cachean respuestas exitosas y no vacías; los fallos/listas vacías
// no se guardan para reintentar en la siguiente petición.
const CACHE_TTL_MS = 5 * 60 * 1000;
const CACHE_MAX_ENTRIES = 500;

interface CacheEntry {
  expiresAt: number;
  value: ShippingEstimate[];
}

const cache = new Map<string, CacheEntry>();

// Peticiones en vuelo, para que renders concurrentes de la misma PDP
// compartan una sola llamada externa.
const inflight = new Map<string, Promise<ShippingEstimate[]>>();

const cacheKey = ({ productId, postalCode }: Args) =>
  `${productId}:${postalCode}`;

function getCached(key: string) {
  const entry = cache.get(key);

  if (!entry) return undefined;

  if (entry.expiresAt <= Date.now()) {
    cache.delete(key);

    return undefined;
  }

  return entry.value;
}

function setCached(key: string, value: ShippingEstimate[]) {
  if (cache.size >= CACHE_MAX_ENTRIES) {
    // Map conserva el orden de inserción: se descarta la entrada más antigua.
    const oldest = cache.keys().next().value;

    if (oldest !== undefined) cache.delete(oldest);
  }

  cache.set(key, { expiresAt: Date.now() + CACHE_TTL_MS, value });
}

const isValidQuote = (quote: ShippingQuote) =>
  !!quote &&
  typeof quote.carrier === "string" &&
  typeof quote.days === "number" &&
  typeof quote.cost === "number";

async function fetchEstimates(args: Args, ctx: Context) {
  const quotes = await ctx.clients.shippingMock.getQuotes(
    args.productId,
    args.postalCode,
    { timeout: QUOTES_TIMEOUT_MS, retries: QUOTES_RETRIES },
  );

  if (!Array.isArray(quotes)) return [];

  return quotes.filter(isValidQuote).map((quote) => ({
    carrierName: quote.carrier,
    estimatedDays: quote.days,
    price: quote.cost,
  }));
}

export const estimateShipping = async (
  _root: unknown,
  args: Args,
  ctx: Context,
): Promise<ShippingEstimate[]> => {
  const key = cacheKey(args);
  const cached = getCached(key);

  if (cached) return cached;

  let request = inflight.get(key);

  if (!request) {
    request = fetchEstimates(args, ctx).finally(() => inflight.delete(key));
    inflight.set(key, request);
  }

  try {
    const estimates = await request;

    if (estimates.length > 0) setCached(key, estimates);

    return estimates;
  } catch (error) {
    // Fallback: el front recibe una lista vacía en vez de un error y puede
    // ocultar el badge. El detalle queda en los logs.
    ctx.vtex.logger.warn({
      message: "estimateShipping: shipping service failed, returning fallback",
      productId: args.productId,
      postalCode: args.postalCode,
      error: error instanceof Error ? error.message : String(error),
    });

    return [];
  }
};
