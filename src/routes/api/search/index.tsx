/**
 * Product Search API Endpoint
 *
 * Provides live search for products using FTS5 full-text search.
 * Supports prefix matching for autocomplete functionality.
 * Includes search_boost for ranking control:
 *   - Higher values (e.g., 2.0) rank higher in results
 *   - Default value is 1.0 (no boost)
 *   - Zero or negative values hide the product from search
 *
 * Ranking formula: bm25() * search_boost (sorted ascending)
 * Since bm25() returns negative scores, multiplying by a higher boost
 * makes the score more negative, which ranks higher when sorted ascending.
 *
 * GET /api/search?q=solar+panel&limit=8
 *
 * Response:
 * {
 *   query: "solar panel",
 *   total: 25,
 *   results: [
 *     {
 *       id: "abc123",
 *       sku: "SOLAR-PANEL-100W",
 *       title: "100W Solar Panel",
 *       slug: "SOLAR-PANEL-100W",
 *       item_group: "Solar Panels",
 *       price: 89.99,
 *       cf_image_id: "prod-123-abc",
 *       thumbnail_url: "https://imagedelivery.net/..."
 *     }
 *   ]
 * }
 */

import type { RequestHandler } from '@builder.io/qwik-city';
import type { D1Database } from '@cloudflare/workers-types';

// CF Images account hash for thumbnail URLs
const CF_IMAGES_HASH = 'Fdrr4r8cVWsy-JJCR0JU_Q';

interface SearchResult {
  id: string;
  sku: string | null;
  title: string;
  slug: string;
  item_group: string | null;
  price: number | null;
  sale_price: number | null;
  cf_image_id: string | null;
  thumbnail_url: string | null;
  brand_id: string | null;
  _variant_of?: string | null;
}

interface ProductRow {
  id: string;
  sku: string | null;
  title: string;
  item_group: string | null;
  price: number | null;
  sale_price: number | null;
  cf_image_id: string | null;
  thumbnail_url: string | null;
  brand_id: string | null;
  variant_of: string | null;
}

/**
 * Escape special FTS5 characters in search query
 */
function escapeFtsQuery(query: string): string {
  // Remove characters that have special meaning in FTS5
  return query
    .replace(/['"]/g, '') // Remove quotes
    .replace(/[*^${}[\]()]/g, '') // Remove special chars
    .trim();
}

/**
 * Build FTS5 MATCH expression for prefix search
 * Supports multi-word queries with prefix matching on last word
 */
function buildFtsMatch(query: string): string {
  const cleaned = escapeFtsQuery(query);
  if (!cleaned) return '';

  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length === 0) return '';

  // For multi-word queries, use phrase search with prefix on last word
  // e.g., "solar pan" becomes "solar pan*"
  if (words.length === 1) {
    return `"${words[0]}"*`;
  }

  // Multiple words: use prefix match on whole phrase
  return `"${words.join(' ')}"*`;
}

/**
 * Generate thumbnail URL from CF image ID or fallback
 */
function getThumbnailUrl(cfImageId: string | null, fallbackUrl: string | null): string | null {
  if (cfImageId) {
    return `https://imagedelivery.net/${CF_IMAGES_HASH}/${cfImageId}/card`;
  }
  return fallbackUrl;
}

export const onGet: RequestHandler = async ({ url, platform, json }) => {
  try {
    const db = platform.env?.DB as D1Database | undefined;
    if (!db) {
      json(500, { error: 'Database not configured' });
      return;
    }

    const query = url.searchParams.get('q')?.trim() || '';
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '8', 10), 20);

    // Minimum 2 characters required
    if (query.length < 2) {
      json(200, {
        query,
        total: 0,
        results: [],
        message: 'Query must be at least 2 characters',
      });
      return;
    }

    // Build FTS5 match expression
    const ftsMatch = buildFtsMatch(query);

    let results: SearchResult[] = [];
    let total = 0;

    if (ftsMatch) {
      // Try FTS5 search first
      try {
        // Search using FTS5 with ranking and search_boost
        // - bm25() returns negative scores (more negative = better match)
        // - Multiply by search_boost to adjust ranking (higher boost = more negative = better rank)
        // - Filter out products with search_boost <= 0 (hidden from search)
        // NOTE: We multiply (not divide) because bm25() is negative.
        //       With multiplication: search_boost=2.0 makes score 2x more negative = ranks higher
        const ftsResults = await db
          .prepare(`
            SELECT
              p.id,
              p.sku,
              p.title,
              p.item_group,
              p.price,
              p.sale_price,
              p.cf_image_id,
              p.thumbnail_url,
              p.brand_id,
              p.variant_of,
              bm25(products_fts) as fts_rank,
              p.search_boost,
              (bm25(products_fts) * COALESCE(p.search_boost, 1.0)) as boosted_rank
            FROM products_fts fts
            JOIN storefront_products p ON fts.rowid = p.rowid
            WHERE products_fts MATCH ?
              AND p.is_visible = 1
              AND p.has_variants = 0
              AND COALESCE(p.search_boost, 1.0) > 0
            ORDER BY boosted_rank
            LIMIT ?
          `)
          .bind(ftsMatch, limit)
          .all<ProductRow & { fts_rank: number; search_boost: number; boosted_rank: number }>();

        results = (ftsResults.results || []).map((row) => ({
          id: row.id,
          sku: row.sku,
          title: row.title,
          slug: row.sku || row.id,
          item_group: row.item_group,
          price: row.price,
          sale_price: row.sale_price,
          cf_image_id: row.cf_image_id,
          thumbnail_url: getThumbnailUrl(row.cf_image_id, row.thumbnail_url),
          brand_id: row.brand_id,
          _variant_of: row.variant_of,
        }));

        // Get total count (excluding hidden products with search_boost <= 0)
        const countResult = await db
          .prepare(`
            SELECT COUNT(*) as total
            FROM products_fts fts
            JOIN storefront_products p ON fts.rowid = p.rowid
            WHERE products_fts MATCH ?
              AND p.is_visible = 1
              AND p.has_variants = 0
              AND COALESCE(p.search_boost, 1.0) > 0
          `)
          .bind(ftsMatch)
          .first<{ total: number }>();

        total = countResult?.total || results.length;
      } catch (ftsError) {
        // FTS5 table might not exist yet - fall back to LIKE search
        console.warn('FTS5 search failed, falling back to LIKE:', ftsError);
      }
    }

    // Fallback to LIKE search if FTS didn't return results
    if (results.length === 0) {
      const likePattern = `%${query}%`;
      // Include search_boost in LIKE fallback:
      // - Filter out products with search_boost <= 0
      // - Sort by search_boost DESC to prioritize boosted products
      const likeResults = await db
        .prepare(`
          SELECT
            id,
            sku,
            title,
            item_group,
            price,
            sale_price,
            cf_image_id,
            thumbnail_url,
            brand_id,
            variant_of,
            search_boost
          FROM storefront_products
          WHERE is_visible = 1
            AND has_variants = 0
            AND COALESCE(search_boost, 1.0) > 0
            AND (title LIKE ? OR sku LIKE ? OR item_group LIKE ?)
          ORDER BY
            COALESCE(search_boost, 1.0) DESC,
            CASE
              WHEN title LIKE ? THEN 1
              WHEN sku LIKE ? THEN 2
              ELSE 3
            END,
            title ASC
          LIMIT ?
        `)
        .bind(likePattern, likePattern, likePattern, `${query}%`, `${query}%`, limit)
        .all<ProductRow & { search_boost: number }>();

      results = (likeResults.results || []).map((row) => ({
        id: row.id,
        sku: row.sku,
        title: row.title,
        slug: row.sku || row.id,
        item_group: row.item_group,
        price: row.price,
        sale_price: row.sale_price,
        cf_image_id: row.cf_image_id,
        thumbnail_url: getThumbnailUrl(row.cf_image_id, row.thumbnail_url),
        brand_id: row.brand_id,
      }));

      // Get total count for LIKE search (excluding hidden products)
      const countResult = await db
        .prepare(`
          SELECT COUNT(*) as total
          FROM storefront_products
          WHERE is_visible = 1
            AND has_variants = 0
            AND COALESCE(search_boost, 1.0) > 0
            AND (title LIKE ? OR sku LIKE ? OR item_group LIKE ?)
        `)
        .bind(likePattern, likePattern, likePattern)
        .first<{ total: number }>();

      total = countResult?.total || results.length;
    }

    // Fill in missing images for variants from parent products
    const variantsNeedingImages = results.filter(
      (r: any) => r._variant_of && !r.cf_image_id && !r.thumbnail_url
    );
    if (variantsNeedingImages.length > 0) {
      const parentNames = [...new Set(variantsNeedingImages.map((r: any) => r._variant_of as string))];
      const placeholders = parentNames.map(() => '?').join(',');
      const parents = await db
        .prepare(`SELECT erpnext_name, cf_image_id, thumbnail_url FROM storefront_products WHERE erpnext_name IN (${placeholders})`)
        .bind(...parentNames)
        .all<{ erpnext_name: string; cf_image_id: string | null; thumbnail_url: string | null }>();
      const parentMap = new Map((parents.results || []).map(p => [p.erpnext_name, p]));

      for (const r of results) {
        const vr = r as any;
        if (vr._variant_of && !r.cf_image_id && !r.thumbnail_url) {
          const parent = parentMap.get(vr._variant_of);
          if (parent) {
            r.cf_image_id = parent.cf_image_id;
            r.thumbnail_url = getThumbnailUrl(parent.cf_image_id, parent.thumbnail_url);
          }
        }
      }
    }
    // Strip internal field
    const cleanResults = results.map(({ _variant_of, ...rest }: any) => rest);

    json(200, {
      query,
      total,
      results: cleanResults,
    });
  } catch (error) {
    console.error('Search error:', error);
    json(500, {
      error: 'Search failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
