import type { RequestHandler } from '@builder.io/qwik-city';
import type { D1Database } from '@cloudflare/workers-types';

/**
 * 301 Redirects for URL structure migration
 *
 * Handles three types of redirects:
 * 1. Old development site paths (/products/category/, /products/brand/)
 * 2. Old BigCommerce product URLs (/sol-ark-hybrid-inverter/ → /SA-12K-2P/)
 *    looked up from the url_redirects D1 table
 * 3. Old BigCommerce category/brand URLs from the same table
 */
export const onRequest: RequestHandler = async ({ url, redirect, platform }) => {
  const path = url.pathname;

  // 1. Redirect old development site category URLs
  if (path.startsWith('/products/category/')) {
    const newPath = path.replace('/products/category/', '/categories/');
    throw redirect(301, newPath);
  }

  // 2. Redirect old development site brand URLs
  if (path.startsWith('/products/brand/')) {
    const newPath = path.replace('/products/brand/', '/brands/');
    throw redirect(301, newPath);
  }

  // 3. Look up old BigCommerce URLs in the url_redirects table
  // Only check paths that could be old BigCommerce slugs (lowercase, with hyphens)
  // Skip known new-site paths: /api/, /learn/, /brands/, /contact-us/, etc.
  const skipPrefixes = ['/api/', '/learn/', '/brands/', '/checkout/', '/cart/', '/q/', '/build/'];
  const isSkipped = skipPrefixes.some(p => path.startsWith(p));

  if (!isSkipped && path !== '/') {
    const db = platform.env?.DB as D1Database | undefined;
    if (db) {
      try {
        // Normalize path: ensure trailing slash for matching
        const normalizedPath = path.endsWith('/') ? path : path + '/';
        const pathWithout = path.endsWith('/') ? path.slice(0, -1) : path;

        const result = await db
          .prepare('SELECT new_url FROM url_redirects WHERE old_url = ? OR old_url = ? LIMIT 1')
          .bind(normalizedPath, pathWithout)
          .first<{ new_url: string }>();

        if (result?.new_url) {
          // The new_url in the table may have /products/ prefix — strip it
          // But keep /products/ intact if that's the actual target (listing page)
          let target = result.new_url;
          if (target.startsWith('/products/') && target !== '/products/') {
            target = '/' + target.slice('/products/'.length);
          }
          // Ensure trailing slash
          if (!target.endsWith('/')) {
            target = target + '/';
          }
          // Only redirect if target is different from current path
          if (target !== normalizedPath && target !== pathWithout) {
            throw redirect(301, target);
          }
        }
      } catch (e) {
        // Qwik redirect() throws a special object — always re-throw non-Error values
        if (!(e instanceof Error)) {
          throw e;
        }
        // Silently ignore DB errors — don't break the site
      }
    }
  }
};
