/**
 * Brand Sync API Endpoint
 *
 * Receives webhooks from ERPNext to create/update brands and their category associations.
 * When a brand changes in ERPNext, it updates storefront_brands.
 *
 * POST /api/brands/sync/
 *
 * Expected payload from ERPNext Brand doctype:
 * {
 *   name: string,                    // ERPNext Brand name
 *   brand: string,                   // Brand display name (optional, falls back to name)
 *   brand_name?: string,             // Alternative display name field
 *   description: string,             // Brand description (optional)
 *   image: string,                   // Logo URL (optional)
 *   brand_logo?: string,             // Alternative logo URL field
 *   is_visible_on_website: boolean,  // Whether to show on website (opt-in, default false)
 *   disabled: boolean,               // Legacy field (fallback if is_visible_on_website not set)
 *   associated_categories?: [        // Categories this brand appears in
 *     { item_group: string }
 *   ],
 *   associated_subcategories?: [     // Subcategories this brand appears in
 *     { item_group: string }
 *   ],
 * }
 *
 * Visibility Logic:
 * - New brands default to is_visible = 0 (hidden) - opt-in model
 * - If is_visible_on_website is set, use that value
 * - If only disabled is set, use !disabled as is_visible (backward compatibility)
 * - If neither is set, default to hidden (0)
 */

import type { RequestHandler } from '@builder.io/qwik-city';
import type { D1Database } from '@cloudflare/workers-types';

interface ERPNextCategoryLink {
  item_group: string;
}

interface ERPNextBrandPayload {
  name: string;
  brand?: string;
  brand_name?: string;
  description?: string;
  image?: string;
  brand_logo?: string;
  is_visible_on_website?: boolean | number;
  disabled?: boolean | number;
  associated_categories?: ERPNextCategoryLink[];
  associated_subcategories?: ERPNextCategoryLink[];
}

/**
 * Determine visibility based on payload fields
 * Priority: is_visible_on_website > !disabled > default (hidden)
 */
function getVisibility(payload: ERPNextBrandPayload): number {
  if (payload.is_visible_on_website !== undefined) {
    return payload.is_visible_on_website ? 1 : 0;
  }
  if (payload.disabled !== undefined) {
    return payload.disabled ? 0 : 1;
  }
  return 0;
}

/**
 * Generate URL-safe slug from title
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}

/**
 * Look up category ID by ERPNext name
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
 * Update brand-category associations
 */
async function updateBrandCategoryAssociations(
  db: D1Database,
  brandId: string,
  associatedCategories: ERPNextCategoryLink[],
  associatedSubcategories: ERPNextCategoryLink[]
): Promise<{ categories: string[]; subcategories: string[] }> {
  // Delete existing associations
  await db
    .prepare('DELETE FROM brand_category_associations WHERE brand_id = ?')
    .bind(brandId)
    .run();

  const linkedCategories: string[] = [];
  const linkedSubcategories: string[] = [];

  // Insert category associations
  for (const link of associatedCategories) {
    const categoryId = await getCategoryIdByErpnextName(db, link.item_group);
    if (categoryId) {
      const id = crypto.randomUUID().replace(/-/g, '');
      await db
        .prepare(`
          INSERT INTO brand_category_associations (id, brand_id, category_id, association_type)
          VALUES (?, ?, ?, 'category')
        `)
        .bind(id, brandId, categoryId)
        .run();
      linkedCategories.push(link.item_group);
    }
  }

  // Insert subcategory associations
  for (const link of associatedSubcategories) {
    const categoryId = await getCategoryIdByErpnextName(db, link.item_group);
    if (categoryId) {
      const id = crypto.randomUUID().replace(/-/g, '');
      await db
        .prepare(`
          INSERT INTO brand_category_associations (id, brand_id, category_id, association_type)
          VALUES (?, ?, ?, 'subcategory')
        `)
        .bind(id, brandId, categoryId)
        .run();
      linkedSubcategories.push(link.item_group);
    }
  }

  return { categories: linkedCategories, subcategories: linkedSubcategories };
}

export const onPost: RequestHandler = async ({ request, platform, json }) => {
  try {
    const db = platform.env?.DB as D1Database | undefined;
    if (!db) {
      json(500, { error: 'Database not configured' });
      return;
    }

    const payload = await request.json() as ERPNextBrandPayload;

    // Validate required fields
    if (!payload.name) {
      json(400, { error: 'Missing required field: name' });
      return;
    }

    const title = payload.brand || payload.brand_name || payload.name;
    const slug = generateSlug(title);
    const now = new Date().toISOString();
    const isVisible = getVisibility(payload);
    const logoUrl = payload.image || payload.brand_logo || null;

    // Check if brand exists
    const existing = await db
      .prepare('SELECT id FROM storefront_brands WHERE erpnext_name = ?')
      .bind(payload.name)
      .first() as { id: string } | null;

    let brandId: string;

    if (existing) {
      brandId = existing.id;
      // Update existing brand
      await db
        .prepare(`
          UPDATE storefront_brands SET
            title = ?,
            slug = ?,
            description = COALESCE(?, description),
            logo_url = COALESCE(?, logo_url),
            is_visible = ?,
            sync_source = 'erpnext',
            last_synced_from_erpnext = ?,
            updated_at = ?
          WHERE erpnext_name = ?
        `)
        .bind(
          title,
          slug,
          payload.description || null,
          logoUrl,
          isVisible,
          now,
          now,
          payload.name
        )
        .run();
    } else {
      // Insert new brand
      brandId = crypto.randomUUID().replace(/-/g, '');
      await db
        .prepare(`
          INSERT INTO storefront_brands (
            id, erpnext_name, title, slug, description, logo_url, sort_order, is_visible,
            sync_source, last_synced_from_erpnext, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, 0, ?, 'erpnext', ?, ?, ?)
        `)
        .bind(
          brandId,
          payload.name,
          title,
          slug,
          payload.description || null,
          logoUrl,
          isVisible,
          now,
          now,
          now
        )
        .run();
    }

    // Update category associations if provided
    let associations = { categories: [] as string[], subcategories: [] as string[] };
    if (payload.associated_categories || payload.associated_subcategories) {
      associations = await updateBrandCategoryAssociations(
        db,
        brandId,
        payload.associated_categories || [],
        payload.associated_subcategories || []
      );
    }

    json(200, {
      success: true,
      brand: {
        id: brandId,
        erpnext_name: payload.name,
        title,
        slug,
        is_visible: isVisible,
        updated: !!existing,
        associated_categories: associations.categories,
        associated_subcategories: associations.subcategories,
      },
    });
  } catch (error) {
    console.error('Brand sync error:', error);
    json(500, {
      error: 'Failed to sync brand',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Batch sync endpoint for multiple brands
export const onPut: RequestHandler = async ({ request, platform, json }) => {
  try {
    const db = platform.env?.DB as D1Database | undefined;
    if (!db) {
      json(500, { error: 'Database not configured' });
      return;
    }

    const brands = await request.json() as ERPNextBrandPayload[];

    if (!Array.isArray(brands)) {
      json(400, { error: 'Expected array of brands' });
      return;
    }

    const results: Array<{ name: string; success: boolean; error?: string }> = [];

    for (const payload of brands) {
      try {
        if (!payload.name) {
          results.push({ name: 'unknown', success: false, error: 'Missing name' });
          continue;
        }

        const title = payload.brand || payload.brand_name || payload.name;
        const slug = generateSlug(title);
        const now = new Date().toISOString();
        const isVisible = getVisibility(payload);
        const logoUrl = payload.image || payload.brand_logo || null;

        const existing = await db
          .prepare('SELECT id FROM storefront_brands WHERE erpnext_name = ?')
          .bind(payload.name)
          .first() as { id: string } | null;

        let brandId: string;

        if (existing) {
          brandId = existing.id;
          await db
            .prepare(`
              UPDATE storefront_brands SET
                title = ?, slug = ?, description = COALESCE(?, description),
                logo_url = COALESCE(?, logo_url), is_visible = ?,
                sync_source = 'erpnext', last_synced_from_erpnext = ?, updated_at = ?
              WHERE erpnext_name = ?
            `)
            .bind(title, slug, payload.description || null, logoUrl, isVisible, now, now, payload.name)
            .run();
        } else {
          brandId = crypto.randomUUID().replace(/-/g, '');
          await db
            .prepare(`
              INSERT INTO storefront_brands (
                id, erpnext_name, title, slug, description, logo_url, sort_order, is_visible,
                sync_source, last_synced_from_erpnext, created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, 0, ?, 'erpnext', ?, ?, ?)
            `)
            .bind(brandId, payload.name, title, slug, payload.description || null, logoUrl, isVisible, now, now, now)
            .run();
        }

        // Update category associations if provided
        if (payload.associated_categories || payload.associated_subcategories) {
          await updateBrandCategoryAssociations(
            db,
            brandId,
            payload.associated_categories || [],
            payload.associated_subcategories || []
          );
        }

        results.push({ name: payload.name, success: true });
      } catch (err) {
        results.push({
          name: payload.name || 'unknown',
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    json(200, {
      success: true,
      results,
      summary: {
        total: brands.length,
        succeeded: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
      },
    });
  } catch (error) {
    console.error('Batch brand sync error:', error);
    json(500, {
      error: 'Failed to sync brands',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Health check endpoint
export const onGet: RequestHandler = async ({ json }) => {
  json(200, {
    status: 'ok',
    endpoint: 'brands/sync',
    methods: {
      POST: 'Sync single brand',
      PUT: 'Batch sync multiple brands (array)',
    },
    description: 'Webhook endpoint for ERPNext Brand sync',
    expectedPayload: {
      name: 'ERPNext Brand name (required)',
      brand: 'Display title (optional, defaults to name)',
      brand_name: 'Alternative display title field',
      description: 'Brand description',
      image: 'Logo image URL',
      brand_logo: 'Alternative logo URL field',
      is_visible_on_website: 'Set to true to show brand on website (default: false)',
      disabled: 'Legacy field - set to true to hide brand (use is_visible_on_website instead)',
      associated_categories: '[{ item_group: "Category Name" }] - Categories this brand appears in',
      associated_subcategories: '[{ item_group: "Subcategory Name" }] - Subcategories this brand appears in',
    },
    visibilityLogic: 'Brands default to hidden (opt-in). Set is_visible_on_website=true to show.',
  });
};
