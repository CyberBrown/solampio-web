/**
 * Dynamic Sitemap Generator
 *
 * Generates sitemap.xml dynamically from D1 database content.
 * Includes products, categories, brands, articles, and static pages.
 *
 * GET /sitemap.xml
 */

import type { RequestHandler } from '@builder.io/qwik-city';
import { getDB, cleanSlug, encodeSkuForUrl, getAllArticles } from '~/lib/db';
import { SITE_URL } from '~/lib/seo';

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

/**
 * Format date for sitemap (YYYY-MM-DD)
 */
function formatDate(date: string | Date | null | undefined): string {
  if (!date) return new Date().toISOString().split('T')[0];
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

/**
 * Generate XML for a single URL entry
 */
function urlToXml(url: SitemapUrl): string {
  let xml = `  <url>\n    <loc>${escapeXml(url.loc)}</loc>\n`;
  if (url.lastmod) {
    xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
  }
  if (url.changefreq) {
    xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
  }
  if (url.priority !== undefined) {
    xml += `    <priority>${url.priority.toFixed(1)}</priority>\n`;
  }
  xml += `  </url>\n`;
  return xml;
}

/**
 * Escape special XML characters
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Static pages to include in sitemap
 */
const STATIC_PAGES: SitemapUrl[] = [
  { loc: `${SITE_URL}/`, changefreq: 'daily', priority: 1.0 },
  { loc: `${SITE_URL}/products/`, changefreq: 'daily', priority: 0.9 },
  { loc: `${SITE_URL}/categories/`, changefreq: 'weekly', priority: 0.8 },
  { loc: `${SITE_URL}/brands/`, changefreq: 'weekly', priority: 0.8 },
  { loc: `${SITE_URL}/learn/`, changefreq: 'weekly', priority: 0.7 },
  { loc: `${SITE_URL}/learn/articles/`, changefreq: 'weekly', priority: 0.7 },
  { loc: `${SITE_URL}/about-us/`, changefreq: 'monthly', priority: 0.5 },
  { loc: `${SITE_URL}/contact-us/`, changefreq: 'monthly', priority: 0.6 },
  { loc: `${SITE_URL}/frequently-asked-questions/`, changefreq: 'monthly', priority: 0.5 },
  { loc: `${SITE_URL}/privacy-policy/`, changefreq: 'yearly', priority: 0.3 },
  { loc: `${SITE_URL}/terms-and-conditions/`, changefreq: 'yearly', priority: 0.3 },
  { loc: `${SITE_URL}/refund-return-policy/`, changefreq: 'yearly', priority: 0.3 },
];

export const onGet: RequestHandler = async ({ platform, send }) => {
  try {
    const db = getDB(platform);
    const urls: SitemapUrl[] = [...STATIC_PAGES];

    // Get all visible categories
    const categories = await db.getCategories();
    for (const category of categories) {
      if (category.is_visible) {
        const slug = cleanSlug(category.slug);
        urls.push({
          loc: `${SITE_URL}/${slug}/`,
          lastmod: formatDate(category.updated_at),
          changefreq: 'weekly',
          priority: 0.8,
        });

        // Get subcategories
        const subcategories = await db.getSubcategories(category.id);
        for (const sub of subcategories) {
          if (sub.is_visible) {
            const subSlug = cleanSlug(sub.slug);
            urls.push({
              loc: `${SITE_URL}/${slug}/${subSlug}/`,
              lastmod: formatDate(sub.updated_at),
              changefreq: 'weekly',
              priority: 0.7,
            });
          }
        }
      }
    }

    // Get all visible brands
    const brands = await db.getBrands();
    for (const brand of brands) {
      if (brand.is_visible) {
        const slug = cleanSlug(brand.slug);
        urls.push({
          loc: `${SITE_URL}/${slug}/`,
          lastmod: formatDate(brand.updated_at),
          changefreq: 'weekly',
          priority: 0.7,
        });
      }
    }

    // Get products (limit to reasonable number for sitemap)
    const productsResult = await db.getProducts({ limit: 5000 });
    for (const product of productsResult.products) {
      if (product.is_visible) {
        const productSlug = encodeSkuForUrl(product.sku || product.id);
        urls.push({
          loc: `${SITE_URL}/${productSlug}/`,
          lastmod: formatDate(product.updated_at),
          changefreq: 'weekly',
          priority: 0.6,
        });
      }
    }

    // Get articles
    const d1db = platform.env?.DB;
    if (d1db) {
      const articles = await getAllArticles(d1db, 1000);
      for (const article of articles) {
        urls.push({
          loc: `${SITE_URL}/learn/articles/${article.slug}/`,
          lastmod: formatDate(article.updated_at),
          changefreq: 'monthly',
          priority: 0.6,
        });
      }
    }

    // Generate XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    for (const url of urls) {
      xml += urlToXml(url);
    }
    xml += '</urlset>\n';

    // Send response with proper content type
    send(
      new Response(xml, {
        status: 200,
        headers: {
          'Content-Type': 'application/xml',
          'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        },
      })
    );
  } catch (error) {
    console.error('Sitemap generation error:', error);

    // Return minimal valid sitemap on error
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <priority>1.0</priority>
  </url>
</urlset>`;

    send(
      new Response(fallbackXml, {
        status: 200,
        headers: {
          'Content-Type': 'application/xml',
        },
      })
    );
  }
};
