/**
 * Brand Sync API Endpoint
 *
 * Receives webhooks from ERPNext to create/update brands and their category associations.
 *
 * POST /api/brands/sync/
 *
 * Expected payload from ERPNext Brand doctype:
 * {
 *   name: string,                    // ERPNext brand name (required)
 *   brand_name?: string,             // Display name
 *   description?: string,            // Brand description
 *   brand_logo?: string,             // Logo URL
 *   disabled?: boolean,              // Set to true to hide brand
 *   associated_categories?: [        // Categories this brand appears in
 *     { item_group: string }
 *   ],
 *   associated_subcategories?: [     // Subcategories this brand appears in
 *     { item_group: string }
 *   ],
 * }
 */

import type { RequestHandler } from '@builder.io/qwik-city';
import type { D1Database } from '@cloudflare/workers-types';

interface ERPNextCategoryLink {
  item_group: string;
}

interface ERPNextBrandPayload {
  name: string;
  brand_name?: string;
  description?: string;
  brand_logo?: string;
  disabled?: boolean | number;
  associated_categories?: ERPNextCategoryLink[];
  associated_subcategories?: ERPNextCategoryLink[];
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
    const db = platform.env?.DB;
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

    const title = payload.brand_name || payload.name;
    const slug = generateSlug(title);
    const now = new Date().toISOString();
    const isVisible = payload.disabled ? 0 : 1;

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
          payload.brand_logo || null,
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
            id, erpnext_name, title, slug, description, logo_url, is_visible,
            sort_order, sync_source, last_synced_from_erpnext, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 'erpnext', ?, ?, ?)
        `)
        .bind(
          brandId,
          payload.name,
          title,
          slug,
          payload.description || null,
          payload.brand_logo || null,
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

// Health check endpoint
export const onGet: RequestHandler = async ({ json }) => {
  json(200, {
    status: 'ok',
    endpoint: 'brands/sync',
    method: 'POST',
    description: 'Webhook endpoint for ERPNext Brand sync',
    expectedPayload: {
      name: 'ERPNext brand name (required)',
      brand_name: 'Display title',
      description: 'Brand description',
      brand_logo: 'Logo URL',
      disabled: 'Set to true to hide brand',
      associated_categories: '[{ item_group: "Category Name" }] - Categories this brand appears in',
      associated_subcategories: '[{ item_group: "Subcategory Name" }] - Subcategories this brand appears in',
    },
  });
};
