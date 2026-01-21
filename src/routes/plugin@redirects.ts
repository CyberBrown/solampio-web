import type { RequestHandler } from '@builder.io/qwik-city';

/**
 * 301 Redirects for URL structure migration
 * Old Solamp URLs → New BigCommerce-compatible URLs
 */
export const onRequest: RequestHandler = async ({ url, redirect }) => {
  const path = url.pathname;

  // Redirect old category URLs to new structure
  // /products/category/solar-panels/ → /categories/solar-panels/
  // /products/category/solar-panels/mono/ → /categories/solar-panels/mono/
  if (path.startsWith('/products/category/')) {
    const newPath = path.replace('/products/category/', '/categories/');
    throw redirect(301, newPath);
  }

  // Redirect old brand URLs to new structure
  // /products/brand/victron-energy/ → /brands/victron-energy/
  if (path.startsWith('/products/brand/')) {
    const newPath = path.replace('/products/brand/', '/brands/');
    throw redirect(301, newPath);
  }
};
