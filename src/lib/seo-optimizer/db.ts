import type { D1Database } from '@cloudflare/workers-types';
import type { Product } from '../db';
import type { SEOFields, CompetitorIntel } from './types';

export async function getProductsForSEO(db: D1Database, options?: {
  sku?: string;
  category?: string;
  limit?: number;
  onlyUnoptimized?: boolean;
}): Promise<Product[]> {
  const conditions = ['is_visible = 1', 'has_variants = 0'];
  const params: (string | number)[] = [];

  if (options?.sku) {
    conditions.push('sku = ?');
    params.push(options.sku);
  }
  if (options?.category) {
    conditions.push("categories LIKE '%' || ? || '%'");
    params.push(options.category);
  }
  if (options?.onlyUnoptimized) {
    conditions.push('seo_last_optimized IS NULL');
  }

  let sql = `SELECT * FROM storefront_products WHERE ${conditions.join(' AND ')} ORDER BY title`;
  if (options?.limit) {
    sql += ` LIMIT ?`;
    params.push(options.limit);
  }

  const result = await db.prepare(sql).bind(...params).all<Product>();
  return result.results;
}

export async function updateProductSEO(db: D1Database, sku: string, seoData: SEOFields): Promise<void> {
  await db.prepare(`
    UPDATE storefront_products SET
      seo_title = ?,
      seo_meta_description = ?,
      seo_description_summary = ?,
      seo_og_title = ?,
      seo_og_description = ?,
      seo_keywords = ?,
      seo_robots = ?,
      seo_faqs = ?,
      seo_related_searches = ?,
      seo_use_cases = ?,
      description_original = ?,
      seo_last_optimized = ?,
      seo_competitor_data = ?,
      updated_at = datetime('now')
    WHERE sku = ?
  `).bind(
    seoData.seo_title,
    seoData.seo_meta_description,
    seoData.seo_description_summary,
    seoData.seo_og_title,
    seoData.seo_og_description,
    seoData.seo_keywords ? JSON.stringify(seoData.seo_keywords) : null,
    seoData.seo_robots,
    seoData.seo_faqs ? JSON.stringify(seoData.seo_faqs) : null,
    seoData.seo_related_searches ? JSON.stringify(seoData.seo_related_searches) : null,
    seoData.seo_use_cases ? JSON.stringify(seoData.seo_use_cases) : null,
    seoData.description_original,
    seoData.seo_last_optimized,
    seoData.seo_competitor_data ? JSON.stringify(seoData.seo_competitor_data) : null,
    sku
  ).run();
}

export async function saveCompetitorIntel(db: D1Database, sku: string, competitors: CompetitorIntel[]): Promise<void> {
  for (const comp of competitors) {
    await db.prepare(`
      INSERT INTO competitor_intel (sku, competitor_name, competitor_url, competitor_price, differentiators)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      sku,
      comp.name,
      comp.url,
      comp.price,
      JSON.stringify(comp.differentiators)
    ).run();
  }
}

export async function getCompetitorHistory(db: D1Database, sku: string): Promise<CompetitorIntel[]> {
  const result = await db.prepare(
    'SELECT * FROM competitor_intel WHERE sku = ? ORDER BY captured_at DESC'
  ).bind(sku).all<{
    competitor_name: string;
    competitor_url: string;
    competitor_price: string | null;
    differentiators: string;
  }>();

  return result.results.map(row => ({
    name: row.competitor_name,
    url: row.competitor_url,
    price: row.competitor_price,
    differentiators: JSON.parse(row.differentiators || '[]'),
  }));
}
