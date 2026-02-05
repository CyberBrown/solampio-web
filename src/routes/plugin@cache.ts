import type { RequestHandler } from '@builder.io/qwik-city';

/**
 * Sets Cache-Control headers on SSR-rendered HTML pages.
 *
 * - Browser cache: 5 minutes
 * - CDN/edge cache (s-maxage): 5 minutes
 * - Stale-while-revalidate: 1 hour (serve stale while fetching fresh)
 *
 * Only applies to GET requests handled by Qwik City (not /api/* which use Hono).
 */
export const onGet: RequestHandler = async ({ cacheControl }) => {
  cacheControl({
    public: true,
    maxAge: 300,
    sMaxAge: 300,
    staleWhileRevalidate: 3600,
  });
};
