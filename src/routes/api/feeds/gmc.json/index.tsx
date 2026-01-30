/**
 * Google Merchant Center Product Feed (JSON format)
 *
 * Returns JSON with all products formatted for GMC.
 * Useful for debugging and validation.
 *
 * Features:
 * - Variant images inherit from parent product if not set
 * - Variant descriptions inherit from parent product if not set
 * - Brand defaults to "Solamp" when not assigned
 * - Validation mode shows per-product errors
 *
 * GET /api/feeds/gmc.json
 * GET /api/feeds/gmc.json?limit=10 - limit results
 * GET /api/feeds/gmc.json?validate=true - include validation errors
 *
 * Response: JSON array of GMC product items
 */

import type { RequestHandler } from '@builder.io/qwik-city';
import type { D1Database } from '@cloudflare/workers-types';
import { generateGMCFeedJSON, type GMCProduct, type GMCFeedItem } from '~/lib/seo-optimizer/gmc-feed';

const DEFAULT_BRAND = 'Solamp';

interface ValidationError {
  field: string;
  message: string;
}

interface ValidatedGMCFeedItem extends GMCFeedItem {
  _validation_errors?: ValidationError[];
  _is_variant?: boolean;
  _image_inherited?: boolean;
  _description_inherited?: boolean;
}

interface ProductRow extends GMCProduct {
  stock_qty: number;
  variant_of: string | null;
  seo_description_summary: string | null;
  description_clean: string | null;
}

function validateGMCItem(item: GMCFeedItem): ValidationError[] {
  const errors: ValidationError[] = [];

  // Required fields
  if (!item.id) errors.push({ field: 'id', message: 'Missing required field: id (SKU)' });
  if (!item.title) errors.push({ field: 'title', message: 'Missing required field: title' });
  if (!item.description) errors.push({ field: 'description', message: 'Missing required field: description' });
  if (!item.link) errors.push({ field: 'link', message: 'Missing required field: link' });
  if (!item.image_link) errors.push({ field: 'image_link', message: 'Missing required field: image_link' });
  if (!item.price) errors.push({ field: 'price', message: 'Missing required field: price' });
  if (!item.availability) errors.push({ field: 'availability', message: 'Missing required field: availability' });

  // Field length limits
  if (item.title && item.title.length > 150) {
    errors.push({ field: 'title', message: `Title exceeds 150 chars (${item.title.length})` });
  }
  if (item.description && item.description.length > 5000) {
    errors.push({ field: 'description', message: `Description exceeds 5000 chars (${item.description.length})` });
  }

  // Format validations
  if (item.price && !/^\d+\.\d{2}\s+[A-Z]{3}$/.test(item.price)) {
    errors.push({ field: 'price', message: `Invalid price format: ${item.price} (expected: 123.45 USD)` });
  }

  const validAvailability = ['in_stock', 'out_of_stock', 'preorder', 'backorder'];
  if (item.availability && !validAvailability.includes(item.availability)) {
    errors.push({ field: 'availability', message: `Invalid availability: ${item.availability}` });
  }

  const validConditions = ['new', 'refurbished', 'used'];
  if (item.condition && !validConditions.includes(item.condition)) {
    errors.push({ field: 'condition', message: `Invalid condition: ${item.condition}` });
  }

  // Check for HTML in description
  if (item.description && /<[^>]+>/.test(item.description)) {
    errors.push({ field: 'description', message: 'Description contains HTML tags' });
  }

  return errors;
}

export const onGet: RequestHandler = async ({ url, platform, json }) => {
  try {
    const db = platform.env?.DB as D1Database | undefined;
    if (!db) {
      json(500, { error: 'Database not configured' });
      return;
    }

    const limit = url.searchParams.get('limit');
    const validate = url.searchParams.get('validate') === 'true';
    const limitClause = limit ? `LIMIT ${parseInt(limit, 10)}` : '';

    // Query all visible, non-template products with GMC-relevant fields
    // Include separate seo_description_summary and description_clean for inheritance logic
    const result = await db
      .prepare(`
        SELECT
          p.sku,
          COALESCE(p.seo_title, p.title) as name,
          p.seo_title,
          COALESCE(p.seo_description_summary, p.description_clean, p.description) as description,
          p.seo_description_summary,
          p.description_clean,
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
        ${limitClause}
      `)
      .all<ProductRow>();

    const rawProducts = result.results || [];

    // Find variants that need parent data (images or descriptions)
    const variantsNeedingImages = rawProducts.filter(
      p => p.variant_of && !p.cf_image_id && !p.image_url
    );
    const variantsNeedingDescriptions = rawProducts.filter(
      p => p.variant_of && !p.seo_description_summary && !p.description_clean
    );

    // Collect all parent SKUs that we need to fetch
    const allParentSkus = new Set<string>();
    variantsNeedingImages.forEach(p => allParentSkus.add(p.variant_of!));
    variantsNeedingDescriptions.forEach(p => allParentSkus.add(p.variant_of!));

    // Get parent product data for variants (images and descriptions)
    const parentDataMap = new Map<string, {
      cf_image_id: string | null;
      image_url: string | null;
      seo_description_summary: string | null;
      description_clean: string | null;
    }>();

    if (allParentSkus.size > 0) {
      const parentSkus = [...allParentSkus];
      const placeholders = parentSkus.map(() => '?').join(',');

      const parents = await db
        .prepare(`
          SELECT sku, cf_image_id, image_url, seo_description_summary, description_clean
          FROM storefront_products
          WHERE sku IN (${placeholders})
        `)
        .bind(...parentSkus)
        .all<{
          sku: string;
          cf_image_id: string | null;
          image_url: string | null;
          seo_description_summary: string | null;
          description_clean: string | null;
        }>();

      for (const parent of parents.results || []) {
        parentDataMap.set(parent.sku, {
          cf_image_id: parent.cf_image_id,
          image_url: parent.image_url,
          seo_description_summary: parent.seo_description_summary,
          description_clean: parent.description_clean,
        });
      }
    }

    // Track which products inherited data (for metadata)
    const inheritedImageSkus = new Set<string>();
    const inheritedDescriptionSkus = new Set<string>();
    const variantSkus = new Set<string>();

    // Transform products with image/description inheritance and brand defaults
    const products: GMCProduct[] = rawProducts.map((row) => {
      // Track variants
      if (row.variant_of) {
        variantSkus.add(row.sku);
      }

      // Inherit image from parent if variant has no image
      let cf_image_id = row.cf_image_id;
      let image_url = row.image_url;

      if (row.variant_of && !cf_image_id && !image_url) {
        const parentData = parentDataMap.get(row.variant_of);
        if (parentData && (parentData.cf_image_id || parentData.image_url)) {
          cf_image_id = parentData.cf_image_id;
          image_url = parentData.image_url;
          inheritedImageSkus.add(row.sku);
        }
      }

      // Inherit description from parent if variant has no SEO description
      let description = row.description;

      if (row.variant_of && !row.seo_description_summary && !row.description_clean) {
        const parentData = parentDataMap.get(row.variant_of);
        if (parentData) {
          const parentDesc = parentData.seo_description_summary || parentData.description_clean;
          if (parentDesc) {
            description = parentDesc;
            inheritedDescriptionSkus.add(row.sku);
          }
        }
      }

      return {
        sku: row.sku,
        name: row.name,
        seo_title: row.seo_title,
        description,
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

    const feedItems = generateGMCFeedJSON(products);

    // Add validation and metadata if requested
    let validatedItems: ValidatedGMCFeedItem[] = feedItems;
    let validationSummary: {
      total: number;
      valid: number;
      invalid: number;
      errors: Record<string, number>;
      variants_count: number;
      images_inherited: number;
      descriptions_inherited: number;
    } | undefined;

    if (validate) {
      const errorCounts: Record<string, number> = {};
      let invalidCount = 0;

      validatedItems = feedItems.map((item) => {
        const errors = validateGMCItem(item);
        const isVariant = variantSkus.has(item.id);
        const imageInherited = inheritedImageSkus.has(item.id);
        const descriptionInherited = inheritedDescriptionSkus.has(item.id);

        if (errors.length > 0) {
          invalidCount++;
          errors.forEach((e) => {
            errorCounts[e.field] = (errorCounts[e.field] || 0) + 1;
          });
        }

        return {
          ...item,
          _validation_errors: errors.length > 0 ? errors : undefined,
          _is_variant: isVariant || undefined,
          _image_inherited: imageInherited || undefined,
          _description_inherited: descriptionInherited || undefined,
        };
      });

      validationSummary = {
        total: feedItems.length,
        valid: feedItems.length - invalidCount,
        invalid: invalidCount,
        errors: errorCounts,
        variants_count: variantSkus.size,
        images_inherited: inheritedImageSkus.size,
        descriptions_inherited: inheritedDescriptionSkus.size,
      };
    }

    // Check for duplicate SKUs
    const skuCounts = new Map<string, number>();
    feedItems.forEach((item) => {
      skuCounts.set(item.id, (skuCounts.get(item.id) || 0) + 1);
    });
    const duplicates = Array.from(skuCounts.entries())
      .filter(([_, count]) => count > 1)
      .map(([sku, count]) => ({ sku, count }));

    json(200, {
      meta: {
        total: feedItems.length,
        generated_at: new Date().toISOString(),
        default_brand: DEFAULT_BRAND,
        duplicates: duplicates.length > 0 ? duplicates : undefined,
        validation: validationSummary,
      },
      items: validatedItems,
    });
  } catch (error) {
    console.error('GMC feed generation error:', error);
    json(500, {
      error: 'Feed generation failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
