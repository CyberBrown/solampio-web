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
import { rejectUnauthorized } from '~/lib/api-auth';

interface ERPNextWebsiteItemGroup {
  item_group: string;
}

interface ERPNextWebsiteImage {
  image_url: string;
  cf_image_id?: string;
  sort_order?: number;
  alt_text?: string;
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
  // Multiple images from custom child table
  custom_website_images?: ERPNextWebsiteImage[];
  has_variants?: boolean | number;
  variant_of?: string;
  // Featured product fields (ERPNext sends custom_ prefixed fields)
  is_featured?: boolean | number;
  custom_is_featured?: boolean | number;  // ERPNext custom field name
  featured_in_category?: string;  // ERPNext Item Group name for category featuring
  custom_featured_in_category?: string;  // ERPNext custom field name
  featured_in_subcategory?: string;  // ERPNext Item Group name for subcategory featuring
  // Shipping carrier flags
  ships_usps?: boolean | number;
  ships_ups?: boolean | number;
  ships_ltl?: boolean | number;
  ships_pickup?: boolean | number;
  hazmat_flag?: boolean | number;
  hazmat_class?: string;
  oversized_flag?: boolean | number;
  inherit_shipping_from_parent?: boolean | number;
  // Website description fields (custom fields on Item)
  custom_description_summary?: string;
  custom_description_clean?: string;
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

/**
 * Sync product images to storefront_product_images table
 * Handles multiple images from ERPNext custom_website_images child table
 */
async function syncProductImages(
  db: D1Database,
  productId: string,
  images: ERPNextWebsiteImage[]
): Promise<{ synced: number; primary?: string }> {
  const now = new Date().toISOString();

  // Delete existing images for this product
  await db
    .prepare('DELETE FROM storefront_product_images WHERE product_id = ?')
    .bind(productId)
    .run();

  if (!images || images.length === 0) {
    return { synced: 0 };
  }

  // Sort by sort_order (0 = primary)
  const sortedImages = [...images].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  let synced = 0;
  let primaryImageUrl: string | undefined;

  for (const img of sortedImages) {
    if (!img.image_url) continue;

    const imageId = crypto.randomUUID().replace(/-/g, '');
    const sortOrder = img.sort_order ?? synced;
    const isPrimary = sortOrder === 0 ? 1 : 0;

    await db
      .prepare(`
        INSERT INTO storefront_product_images (
          id, product_id, image_url, cf_image_id, sort_order, is_primary
        ) VALUES (?, ?, ?, ?, ?, ?)
      `)
      .bind(
        imageId,
        productId,
        img.image_url,
        img.cf_image_id || null,
        sortOrder,
        isPrimary
      )
      .run();

    // Track primary image (first one / sort_order 0)
    if (synced === 0) {
      primaryImageUrl = img.image_url;
    }
    synced++;
  }

  return { synced, primary: primaryImageUrl };
}

export const onPost: RequestHandler = async (requestEvent) => {
  if (rejectUnauthorized(requestEvent, 'SYNC_API_KEY')) return;

  const { request, platform, json } = requestEvent;
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
    // Check both custom_ prefixed (ERPNext webhook) and unprefixed versions
    const isFeatured = (payload.custom_is_featured || payload.is_featured) ? 1 : 0;
    const categoriesJson = categoryIds.length > 0 ? JSON.stringify(categoryIds) : null;

    // Shipping carrier flags
    const shipsUsps = payload.ships_usps ? 1 : 0;
    const shipsUps = payload.ships_ups ? 1 : 0;
    const shipsLtl = payload.ships_ltl ? 1 : 0;
    const shipsPickup = payload.ships_pickup ? 1 : 0;
    const hazmatFlag = payload.hazmat_flag ? 1 : 0;
    const oversizedFlag = payload.oversized_flag ? 1 : 0;
    const inheritShippingFromParent = payload.inherit_shipping_from_parent ? 1 : 0;

    // Use ERPNext custom fields if provided, otherwise auto-generate from HTML description
    const descriptionClean = payload.custom_description_clean
      || (payload.description ? cleanDescription(payload.description) : null);
    const descriptionSummary = payload.custom_description_summary
      || (payload.description ? extractExcerpt(payload.description, 500) : null);

    // Look up featured category IDs if provided (check both custom_ prefixed and unprefixed)
    let featuredCategoryId: string | null = null;
    const featuredInCategory = payload.custom_featured_in_category || payload.featured_in_category;
    if (featuredInCategory) {
      featuredCategoryId = await getCategoryIdByErpnextName(db, featuredInCategory);
    }

    let featuredInSubcategoryId: string | null = null;
    if (payload.featured_in_subcategory) {
      featuredInSubcategoryId = await getCategoryIdByErpnextName(db, payload.featured_in_subcategory);
    }

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
            is_featured = ?,
            featured_category_id = COALESCE(?, featured_category_id),
            featured_in_subcategory_id = COALESCE(?, featured_in_subcategory_id),
            ships_usps = ?,
            ships_ups = ?,
            ships_ltl = ?,
            ships_pickup = ?,
            hazmat_flag = ?,
            hazmat_class = ?,
            oversized_flag = ?,
            inherit_shipping_from_parent = ?,
            image_url = COALESCE(?, image_url),
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
          isFeatured,
          featuredCategoryId,
          featuredInSubcategoryId,
          shipsUsps,
          shipsUps,
          shipsLtl,
          shipsPickup,
          hazmatFlag,
          payload.hazmat_class || null,
          oversizedFlag,
          inheritShippingFromParent,
          payload.website_image || null,
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
            is_featured, featured_category_id, featured_in_subcategory_id,
            ships_usps, ships_ups, ships_ltl, ships_pickup,
            hazmat_flag, hazmat_class, oversized_flag, inherit_shipping_from_parent,
            image_url, sync_source, last_synced_from_erpnext, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'erpnext', ?, ?, ?)
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
          isFeatured,
          featuredCategoryId,
          featuredInSubcategoryId,
          shipsUsps,
          shipsUps,
          shipsLtl,
          shipsPickup,
          hazmatFlag,
          payload.hazmat_class || null,
          oversizedFlag,
          inheritShippingFromParent,
          payload.website_image || null,
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

    // Sync multiple images if provided from ERPNext custom_website_images
    let imagesSynced = 0;
    let productId: string | undefined = existing?.id;
    if (!productId) {
      const newProduct = await db
        .prepare('SELECT id FROM storefront_products WHERE sku = ?')
        .bind(payload.item_code)
        .first() as { id: string } | null;
      productId = newProduct?.id;
    }

    if (productId && payload.custom_website_images && payload.custom_website_images.length > 0) {
      const imageResult = await syncProductImages(db, productId, payload.custom_website_images);
      imagesSynced = imageResult.synced;

      // Update primary image on the product if we synced images
      if (imageResult.primary) {
        await db
          .prepare(`
            UPDATE storefront_products
            SET image_url = ?, updated_at = datetime('now')
            WHERE id = ?
          `)
          .bind(imageResult.primary, productId)
          .run();
      }
    }

    json(200, {
      success: true,
      product: {
        sku: payload.item_code,
        title: payload.item_name || payload.name,
        categories: categoryNames,
        categoryIds,
        imagesSynced,
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
      is_featured: 'Set to true to feature in mega menu (optional)',
      featured_in_category: 'ERPNext Item Group name for category featuring (optional)',
      featured_in_subcategory: 'ERPNext Item Group name for subcategory featuring (optional)',
      ships_usps: 'Set to true if item can ship via USPS',
      ships_ups: 'Set to true if item can ship via UPS',
      ships_ltl: 'Set to true if item can ship via LTL freight',
      ships_pickup: 'Set to true if item is available for pickup',
      hazmat_flag: 'Set to true if item is hazardous material',
      hazmat_class: 'Hazmat classification code (if hazmat_flag is true)',
      oversized_flag: 'Set to true if item is oversized',
      inherit_shipping_from_parent: 'Set to true for variants to inherit shipping from parent',
      website_image: 'Primary image URL (legacy single image)',
      custom_website_images: '[{ image_url, cf_image_id, sort_order, alt_text }] - Multiple images from ERPNext',
    },
    notes: [
      'Descriptions are automatically cleaned (HTML tags, inline styles, BigCommerce artifacts removed)',
      'Cleaned description stored in description_clean field',
      'Summary/excerpt stored in description_summary field (500 chars max)',
      'Use /api/products/generate-summaries for AI-powered summary generation',
      'Multiple images: Use custom_website_images array with sort_order=0 for primary image',
    ],
  });
};
