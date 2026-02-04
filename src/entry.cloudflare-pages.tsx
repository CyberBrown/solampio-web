import {
  createQwikCity,
  type PlatformCloudflarePages,
} from '@builder.io/qwik-city/middleware/cloudflare-pages';
import qwikCityPlan from '@qwik-city-plan';
import { manifest } from '@qwik-client-manifest';
import type { ExecutionContext } from '@cloudflare/workers-types';
import render from './entry.ssr';
import { api, type Env } from './api';

declare global {
  interface QwikCityPlatform extends PlatformCloudflarePages {}
}

// Qwik City handler for SSR pages
const qwikFetch = createQwikCity({ render, qwikCityPlan, manifest });

/**
 * Combined fetch handler that routes:
 * - /api/* requests to Hono API router (with Qwik City fallback)
 * - All other requests to Qwik City SSR
 */
const fetch = async (
  request: Request,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> => {
  const url = new URL(request.url);

  // Route /api/* to Hono, falling back to Qwik City for unmatched routes
  if (url.pathname.startsWith('/api/')) {
    const honoResponse = await api.fetch(request.clone(), env, ctx);

    // If Hono has no matching route (default 404), fall through to Qwik City
    // Explicit 404s from Hono handlers return JSON, so check content-type
    if (honoResponse.status === 404 && !honoResponse.headers.get('content-type')?.includes('application/json')) {
      return qwikFetch(request, env, ctx);
    }

    return honoResponse;
  }

  // Everything else goes to Qwik City
  return qwikFetch(request, env, ctx);
};

export { fetch };
