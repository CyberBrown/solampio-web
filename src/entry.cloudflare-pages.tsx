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
 * - /api/* requests to Hono API router
 * - All other requests to Qwik City SSR
 */
const fetch = async (
  request: Request,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> => {
  const url = new URL(request.url);

  // Route /api/* to Hono
  if (url.pathname.startsWith('/api/')) {
    return api.fetch(request, env, ctx);
  }

  // Everything else goes to Qwik City
  return qwikFetch(request, env, ctx);
};

export { fetch };
