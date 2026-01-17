/**
 * Product Sync API Endpoint
 *
 * Receives webhooks from ERPNext to create/update products and their categories.
 * When a product's category changes in ERPNext, it updates both:
 * - storefront_products.categories (JSON array of category IDs)
 * - product_website_categories (mapping table for reference)
 *
 * POST /api/products/sync/
 *
 * Expected payload from ERPNext Item doctype:
 * {
 *   name: string,              // ERPNext item name (used as erpnext_name)
 *   item_code: string,         // SKU
 *   item_name: string,         // Display title
 *   description: string,       // Product description
 *   item_group: string,        // Primary ERPNext Item Group (category)
 *   website_item_groups: [     // Array of additional website categories
 *     { item_group: string }
 *   ],
 *   standard_rate: number,     // Price
 *   stock_qty: number,         // Stock quantity
 *   disabled: boolean,         // If true, set is_visible = 0
 *   brand: string,             // Brand name (optional)
 *   website_image: string,     // Image URL (optional)
 * }
 */

import type { RequestHandler } from '@builder.io/qwik-city';
import type { D1Database } from '@cloudflare/workers-types';
import { cleanDescription, extractExcerpt } from '../../../../lib/description-cleaner';

interface ERPNextWebsiteItemGroup {
  item_group: string;
}

interface ERPNextProductPayload {
  name: string;
  item_code: string;
  item_name?: string;
  description?: string;
  item_group?: string;
  website_item_groups?: ERPNextWebsiteItemGroup[];
  standard_rate?: number;
  stock_qty?: number;
  low_stock_threshold?: number;  // Quantity at which "Low Stock" displays
  show_stock_status?: boolean | number;  // Toggle to show stock status on storefront
  disabled?: boolean | number;
  brand?: string;
  website_image?: string;
  has_variants?: boolean | number;
  variant_of?: string;
}

/**
 * Look up category ID by ERPNext Item Group name
 */
async function getCategoryIdByErpnextName(
  db: D1Database,
  erpnextName: string
): Promise<string | null> {
  const result = await db
    .prepare('SELECT id FROM storefront_categories WHERE erpnext_name = ? OR title = ? LIMIT 1')
    .bind(erpnextName, erpnextName)
    .first<{ id: string }>();
  return result?.id || null;
}

/**
 * Look up brand ID by name
 */
async function getBrandIdByName(
  db: D1Database,
  brandName: string
): Promise<string | null> {
  const result = await db
    .prepare('SELECT id FROM storefront_brands WHERE erpnext_name = ? OR title = ? LIMIT 1')
    .bind(brandName, brandName)
    .first<{ id: string }>();
  return result?.id || null;
}

/**
 * Update product_website_categories mapping table
 */
async function updateProductCategoryMappings(
  db: D1Database,
  productSku: string,
  categoryNames: string[]
): Promise<void> {
  // Delete existing mappings for this product
  await db
    .prepare('DELETE FROM product_website_categories WHERE product_sku = ?')
    .bind(productSku)
    .run();

  // Insert new mappings
  for (const categoryName of categoryNames) {
    await db
      .prepare(`
        INSERT INTO product_website_categories (product_sku, category_name, created_at)
        VALUES (?, ?, ?)
      `)
      .bind(productSku, categoryName, new Date().toISOString())
      .run();
  }
}

export const onPost: RequestHandler = async ({ request, platform, json }) => {
  try {
    const db = platform.env?.DB;
    if (!db) {
      json(500, { error: 'Database not configured' });
      return;
    }

    const payload = await request.json() as ERPNextProductPayload;

    // Validate required fields
    if (!payload.name || !payload.item_code) {
      json(400, { error: 'Missing required fields: name, item_code' });
      return;
    }

    // Collect all category names from item_group and website_item_groups
    const categoryNames: string[] = [];
    if (payload.item_group) {
      categoryNames.push(payload.item_group);
    }
    if (payload.website_item_groups && Array.isArray(payload.website_item_groups)) {
      for (const wg of payload.website_item_groups) {
        if (wg.item_group && !categoryNames.includes(wg.item_group)) {
          categoryNames.push(wg.item_group);
        }
      }
    }

    // Look up category IDs
    const categoryIds: string[] = [];
    for (const name of categoryNames) {
      const id = await getCategoryIdByErpnextName(db, name);
      if (id) {
        categoryIds.push(id);
      }
    }

    // Look up brand ID if provided
    let brandId: string | null = null;
    if (payload.brand) {
      brandId = await getBrandIdByName(db, payload.brand);
    }

    const now = new Date().toISOString();
    const isVisible = payload.disabled ? 0 : 1;
    const hasVariants = payload.has_variants ? 1 : 0;
    const showStockStatus = payload.show_stock_status ? 1 : 0;
    const categoriesJson = categoryIds.length > 0 ? JSON.stringify(categoryIds) : null;

    // Clean description if provided
    const descriptionClean = payload.description ? cleanDescription(payload.description) : null;
    // Generate initial excerpt as summary (AI summary can be generated separately)
    const descriptionSummary = payload.description ? extractExcerpt(payload.description, 500) : null;

    // Check if product exists
    const existing = await db
      .prepare('SELECT id FROM storefront_products WHERE sku = ?')
      .bind(payload.item_code)
      .first() as { id: string } | null;

    if (existing) {
      // Update existing product
      await db
        .prepare(`
          UPDATE storefront_products SET
            erpnext_name = ?,
            title = COALESCE(?, title),
            description = COALESCE(?, description),
            description_clean = COALESCE(?, description_clean),
            description_summary = COALESCE(?, description_summary),
            item_group = ?,
            categories = ?,
            price = COALESCE(?, price),
            stock_qty = COALESCE(?, stock_qty),
            low_stock_threshold = COALESCE(?, low_stock_threshold),
            show_stock_status = ?,
            is_visible = ?,
            brand_id = COALESCE(?, brand_id),
            has_variants = ?,
            variant_of = COALESCE(?, variant_of),
            sync_source = 'erpnext',
            last_synced_from_erpnext = ?,
            updated_at = ?
          WHERE sku = ?
        `)
        .bind(
          payload.name,
          payload.item_name || null,
          payload.description || null,
          descriptionClean,
          descriptionSummary,
          payload.item_group || null,
          categoriesJson,
          payload.standard_rate || null,
          payload.stock_qty ?? null,
          payload.low_stock_threshold ?? null,
          showStockStatus,
          isVisible,
          brandId,
          hasVariants,
          payload.variant_of || null,
          now,
          now,
          payload.item_code
        )
        .run();
    } else {
      // Insert new product
      const id = crypto.randomUUID().replace(/-/g, '');
      await db
        .prepare(`
          INSERT INTO storefront_products (
            id, erpnext_name, sku, title, description, description_clean, description_summary,
            item_group, categories, price, stock_qty, low_stock_threshold, show_stock_status,
            is_visible, brand_id, has_variants, variant_of,
            sync_source, last_synced_from_erpnext, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'erpnext', ?, ?, ?)
        `)
        .bind(
          id,
          payload.name,
          payload.item_code,
          payload.item_name || payload.name,
          payload.description || null,
          descriptionClean,
          descriptionSummary,
          payload.item_group || null,
          categoriesJson,
          payload.standard_rate || null,
          payload.stock_qty ?? 0,
          payload.low_stock_threshold ?? null,
          showStockStatus,
          isVisible,
          brandId,
          hasVariants,
          payload.variant_of || null,
          now,
          now,
          now
        )
        .run();
    }

    // Update the product_website_categories mapping table
    if (categoryNames.length > 0) {
      await updateProductCategoryMappings(db, payload.item_code, categoryNames);
    }

    json(200, {
      success: true,
      product: {
        sku: payload.item_code,
        title: payload.item_name || payload.name,
        categories: categoryNames,
        categoryIds,
        updated: !!existing,
      },
    });
  } catch (error) {
    console.error('Product sync error:', error);
    json(500, {
      error: 'Failed to sync product',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Health check endpoint
export const onGet: RequestHandler = async ({ json }) => {
  json(200, {
    status: 'ok',
    endpoint: 'products/sync',
    method: 'POST',
    description: 'Webhook endpoint for ERPNext product sync. Automatically cleans HTML descriptions and generates excerpts.',
    expectedPayload: {
      name: 'ERPNext item name (required)',
      item_code: 'SKU (required)',
      item_name: 'Display title',
      description: 'Product description (HTML supported, will be auto-cleaned)',
      item_group: 'Primary category',
      website_item_groups: '[{ item_group: "Category Name" }]',
      standard_rate: 'Price',
      stock_qty: 'Stock quantity',
      low_stock_threshold: 'Quantity at which "Low Stock" displays (optional)',
      show_stock_status: 'Set to true to show stock status on storefront (default: false)',
      disabled: 'Set to true to hide product',
      brand: 'Brand name',
    },
    notes: [
      'Descriptions are automatically cleaned (HTML tags, inline styles, BigCommerce artifacts removed)',
      'Cleaned description stored in description_clean field',
      'Summary/excerpt stored in description_summary field (500 chars max)',
      'Use /api/products/generate-summaries for AI-powered summary generation',
    ],
  });
};
