import { defineConfig } from 'vite';
import { qwikVite } from '@builder.io/qwik/optimizer';
import { qwikCity } from '@builder.io/qwik-city/vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(async ({ mode }) => {
  // In SSR dev mode, get Cloudflare platform proxy for D1 access
  let platform = {};
  if (mode === 'ssr') {
    try {
      const { getPlatformProxy } = await import('wrangler');
      const proxy = await getPlatformProxy();
      platform = {
        env: proxy.env,
        cf: proxy.cf,
        ctx: proxy.ctx,
      };
    } catch (e) {
      console.warn('Could not load Cloudflare platform proxy:', e);
    }
  }

  return {
    plugins: [
      qwikCity({
        platform,
      }),
      qwikVite(),
      tsconfigPaths(),
    ],
    preview: {
      headers: {
        'Cache-Control': 'public, max-age=600',
      },
    },
  };
});
