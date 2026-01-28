/**
 * Google Merchant Center Product Feed
 *
 * Returns a TSV file with all products formatted for GMC import.
 * Includes SEO-optimized titles/descriptions and GMC-specific fields.
 *
 * Features:
 * - Variant images inherit from parent product if not set
 * - Brand defaults to "Solamp" when not assigned
 * - Availability based on stock_qty
 *
 * GET /api/feeds/gmc.tsv
 *
 * Response: Tab-separated values file with GMC product data
 */

import type { RequestHandler } from '@builder.io/qwik-city';
import type { D1Database } from '@cloudflare/workers-types';
import { generateGMCFeedTSV, type GMCProduct } from '~/lib/seo-optimizer/gmc-feed';

const DEFAULT_BRAND = 'Solamp';

interface ProductRow extends GMCProduct {
  stock_qty: number;
  variant_of: string | null;
}

export const onGet: RequestHandler = async ({ platform, send }) => {
  try {
    const db = platform.env?.DB as D1Database | undefined;
    if (!db) {
      send(500, 'Database not configured');
      return;
    }

    // Query all visible, non-template products with GMC-relevant fields
    // Note: has_variants=0 means this is NOT a parent template, so includes variants
    const result = await db
      .prepare(`
        SELECT
          p.sku,
          COALESCE(p.seo_title, p.title) as name,
          p.seo_title,
          COALESCE(p.seo_description_summary, p.description_clean, p.description) as description,
          p.sku as slug,
          c.slug as category_slug,
          p.cf_image_id,
          p.image_url,
          p.price,
          b.title as brand_name,
          p.weight_lbs,
          p.gtin,
          p.mpn,
          p.gmc_google_category,
          p.gmc_product_type,
          p.gmc_condition,
          p.gmc_availability,
          p.gmc_shipping_label,
          p.gmc_custom_label_0,
          p.gmc_custom_label_1,
          p.gmc_custom_label_2,
          p.gmc_custom_label_3,
          p.gmc_custom_label_4,
          p.gmc_additional_images,
          p.stock_qty,
          p.variant_of
        FROM storefront_products p
        LEFT JOIN storefront_brands b ON p.brand_id = b.id
        LEFT JOIN storefront_categories c ON p.categories LIKE '%"' || c.id || '"%'
        WHERE p.is_visible = 1
          AND p.has_variants = 0
          AND p.price IS NOT NULL
          AND p.price > 0
        GROUP BY p.id
        ORDER BY p.title ASC
      `)
      .all<ProductRow>();

    const rawProducts = result.results || [];

    // Find variants that need parent images
    const variantsNeedingImages = rawProducts.filter(
      p => p.variant_of && !p.cf_image_id && !p.image_url
    );

    // Get parent product images for variants
    const parentImageMap = new Map<string, { cf_image_id: string | null; image_url: string | null }>();

    if (variantsNeedingImages.length > 0) {
      const parentSkus = [...new Set(variantsNeedingImages.map(p => p.variant_of!))];
      const placeholders = parentSkus.map(() => '?').join(',');

      const parents = await db
        .prepare(`
          SELECT sku, cf_image_id, image_url
          FROM storefront_products
          WHERE sku IN (${placeholders})
        `)
        .bind(...parentSkus)
        .all<{ sku: string; cf_image_id: string | null; image_url: string | null }>();

      for (const parent of parents.results || []) {
        parentImageMap.set(parent.sku, {
          cf_image_id: parent.cf_image_id,
          image_url: parent.image_url,
        });
      }
    }

    // Transform products with image inheritance and brand defaults
    const products: GMCProduct[] = rawProducts.map((row) => {
      // Inherit image from parent if variant has no image
      let cf_image_id = row.cf_image_id;
      let image_url = row.image_url;

      if (row.variant_of && !cf_image_id && !image_url) {
        const parentImage = parentImageMap.get(row.variant_of);
        if (parentImage) {
          cf_image_id = parentImage.cf_image_id;
          image_url = parentImage.image_url;
        }
      }

      return {
        sku: row.sku,
        name: row.name,
        seo_title: row.seo_title,
        description: row.description,
        slug: row.slug,
        category_slug: row.category_slug,
        cf_image_id,
        image_url,
        price: row.price,
        // Default brand to "Solamp" if not set
        brand_name: row.brand_name || DEFAULT_BRAND,
        weight_lbs: row.weight_lbs,
        gtin: row.gtin,
        mpn: row.mpn,
        gmc_google_category: row.gmc_google_category,
        gmc_product_type: row.gmc_product_type,
        gmc_condition: row.gmc_condition,
        gmc_availability: row.gmc_availability || (row.stock_qty > 0 ? 'in_stock' : 'out_of_stock'),
        gmc_shipping_label: row.gmc_shipping_label,
        gmc_custom_label_0: row.gmc_custom_label_0,
        gmc_custom_label_1: row.gmc_custom_label_1,
        gmc_custom_label_2: row.gmc_custom_label_2,
        gmc_custom_label_3: row.gmc_custom_label_3,
        gmc_custom_label_4: row.gmc_custom_label_4,
        gmc_additional_images: row.gmc_additional_images,
      };
    });

    const tsvContent = generateGMCFeedTSV(products);

    // Return TSV with appropriate headers for file download
    const response = new Response(tsvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/tab-separated-values; charset=utf-8',
        'Content-Disposition': 'attachment; filename="gmc-feed.tsv"',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });

    send(response);
  } catch (error) {
    console.error('GMC feed generation error:', error);
    send(500, `Feed generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
