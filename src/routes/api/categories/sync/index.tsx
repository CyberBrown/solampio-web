/**
 * Category Sync API Endpoint
 *
 * Receives webhooks from ERPNext to create/update categories (Item Groups).
 * When a category changes in ERPNext, it updates storefront_categories.
 *
 * POST /api/categories/sync/
 *
 * Expected payload from ERPNext Item Group doctype:
 * {
 *   name: string,                    // ERPNext Item Group name
 *   item_group_name: string,         // Display name
 *   parent_item_group: string,       // Parent category name (or "All Item Groups" for root)
 *   is_group: boolean,               // Whether this is a parent group
 *   image: string,                   // Image URL (optional)
 *   custom_show_in_website: boolean, // ERPNext custom field: controls website visibility
 *   disabled: boolean,               // Legacy field (fallback if custom_show_in_website not set)
 * }
 *
 * Visibility Logic:
 * - New categories default to is_visible = 0 (hidden) - opt-in model
 * - If custom_show_in_website is set, use that value
 * - If only disabled is set, use !disabled as is_visible (backward compatibility)
 * - If neither is set, default to hidden (0)
 */

import type { RequestHandler } from '@builder.io/qwik-city';
import type { D1Database } from '@cloudflare/workers-types';

interface ERPNextCategoryPayload {
  name: string;
  item_group_name?: string;
  parent_item_group?: string;
  is_group?: boolean | number;
  image?: string;
  custom_show_in_website?: boolean | number;  // ERPNext custom field: controls visibility
  disabled?: boolean | number;                // Legacy field: true = hidden
  custom_sort_order?: number;                 // Display order (lower = first)
  lft?: number;                               // Nested set left value (fallback)
  // Category image fields
  category_image?: string;  // Attach Image (legacy)
  cf_category_image_url?: string;  // Cloudflare Images URL (full URL)
  custom_cf_image_id?: string;  // Cloudflare Images ID (just the ID, not full URL)
}

/**
 * Determine visibility based on payload fields
 * Priority: custom_show_in_website > !disabled > default (hidden)
 */
function getVisibility(payload: ERPNextCategoryPayload): number {
  // If custom_show_in_website is explicitly set, use it
  if (payload.custom_show_in_website !== undefined) {
    return payload.custom_show_in_website ? 1 : 0;
  }
  // Fallback to disabled field (inverted logic)
  if (payload.disabled !== undefined) {
    return payload.disabled ? 0 : 1;
  }
  // Default: hidden (opt-in model)
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
 * Look up parent category ID by ERPNext name
 */
async function getParentCategoryId(
  db: D1Database,
  parentName: string
): Promise<string | null> {
  // Skip if parent is "All Item Groups" (ERPNext root)
  if (parentName === 'All Item Groups') {
    return null;
  }

  const result = await db
    .prepare('SELECT id FROM storefront_categories WHERE erpnext_name = ? OR title = ? LIMIT 1')
    .bind(parentName, parentName)
    .first<{ id: string }>();
  return result?.id || null;
}

export const onPost: RequestHandler = async ({ request, platform, json }) => {
  try {
    const db = platform.env?.DB;
    if (!db) {
      json(500, { error: 'Database not configured' });
      return;
    }

    const payload = await request.json() as ERPNextCategoryPayload;

    // Validate required fields
    if (!payload.name) {
      json(400, { error: 'Missing required field: name' });
      return;
    }

    const title = payload.item_group_name || payload.name;
    const slug = generateSlug(title);
    const now = new Date().toISOString();
    const isVisible = getVisibility(payload);

    // Look up parent category ID
    let parentId: string | null = null;
    if (payload.parent_item_group) {
      parentId = await getParentCategoryId(db, payload.parent_item_group);
    }

    // Check if category exists
    const existing = await db
      .prepare('SELECT id FROM storefront_categories WHERE erpnext_name = ?')
      .bind(payload.name)
      .first() as { id: string } | null;

    // Handle image URL - prefer cf_category_image_url, fallback to image
    const imageUrl = payload.cf_category_image_url || payload.category_image || payload.image || null;

    // Get CF image ID - prefer custom_cf_image_id (direct ID), extract from URL if full URL provided
    let cfImageId = payload.custom_cf_image_id || null;
    if (!cfImageId && payload.cf_category_image_url) {
      // Extract ID from URL format: https://imagedelivery.net/{hash}/{image_id}/{variant}
      const match = payload.cf_category_image_url.match(/imagedelivery\.net\/[^/]+\/([^/]+)/);
      if (match) cfImageId = match[1];
    }

    // Determine sort order: prefer custom_sort_order, fall back to lft, default 0
    const sortOrder = payload.custom_sort_order ?? payload.lft ?? 0;

    if (existing) {
      // Update existing category
      await db
        .prepare(`
          UPDATE storefront_categories SET
            title = ?,
            slug = ?,
            parent_id = ?,
            is_visible = ?,
            sort_order = ?,
            cf_image_id = COALESCE(?, cf_image_id),
            image_url = COALESCE(?, image_url),
            sync_source = 'erpnext',
            last_synced_from_erpnext = ?,
            updated_at = ?
          WHERE erpnext_name = ?
        `)
        .bind(
          title,
          slug,
          parentId,
          isVisible,
          sortOrder,
          cfImageId,
          imageUrl,
          now,
          now,
          payload.name
        )
        .run();

      json(200, {
        success: true,
        category: {
          id: existing.id,
          erpnext_name: payload.name,
          title,
          slug,
          parent_id: parentId,
          cf_image_id: cfImageId,
          updated: true,
        },
      });
    } else {
      // Insert new category
      const id = crypto.randomUUID().replace(/-/g, '');
      await db
        .prepare(`
          INSERT INTO storefront_categories (
            id, erpnext_name, title, slug, parent_id, sort_order, is_visible,
            count, image_url, cf_image_id, sync_source, last_synced_from_erpnext, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, 'erpnext', ?, ?, ?)
        `)
        .bind(
          id,
          payload.name,
          title,
          slug,
          parentId,
          sortOrder,
          isVisible,
          imageUrl,
          cfImageId,
          now,
          now,
          now
        )
        .run();

      json(200, {
        success: true,
        category: {
          id,
          erpnext_name: payload.name,
          title,
          slug,
          parent_id: parentId,
          cf_image_id: cfImageId,
          created: true,
        },
      });
    }
  } catch (error) {
    console.error('Category sync error:', error);
    json(500, {
      error: 'Failed to sync category',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Batch sync endpoint for multiple categories
export const onPut: RequestHandler = async ({ request, platform, json }) => {
  try {
    const db = platform.env?.DB;
    if (!db) {
      json(500, { error: 'Database not configured' });
      return;
    }

    const categories = await request.json() as ERPNextCategoryPayload[];

    if (!Array.isArray(categories)) {
      json(400, { error: 'Expected array of categories' });
      return;
    }

    const results: Array<{ name: string; success: boolean; error?: string }> = [];

    for (const payload of categories) {
      try {
        if (!payload.name) {
          results.push({ name: 'unknown', success: false, error: 'Missing name' });
          continue;
        }

        const title = payload.item_group_name || payload.name;
        const slug = generateSlug(title);
        const now = new Date().toISOString();
        const isVisible = getVisibility(payload);

        let parentId: string | null = null;
        if (payload.parent_item_group) {
          parentId = await getParentCategoryId(db, payload.parent_item_group);
        }

        const existing = await db
          .prepare('SELECT id FROM storefront_categories WHERE erpnext_name = ?')
          .bind(payload.name)
          .first() as { id: string } | null;

        const imageUrl = payload.cf_category_image_url || payload.category_image || payload.image || null;
        const sortOrder = payload.custom_sort_order ?? payload.lft ?? 0;

        // Get CF image ID
        let cfImageId = payload.custom_cf_image_id || null;
        if (!cfImageId && payload.cf_category_image_url) {
          const match = payload.cf_category_image_url.match(/imagedelivery\.net\/[^/]+\/([^/]+)/);
          if (match) cfImageId = match[1];
        }

        if (existing) {
          await db
            .prepare(`
              UPDATE storefront_categories SET
                title = ?, slug = ?, parent_id = ?, is_visible = ?, sort_order = ?,
                cf_image_id = COALESCE(?, cf_image_id),
                image_url = COALESCE(?, image_url),
                sync_source = 'erpnext', last_synced_from_erpnext = ?, updated_at = ?
              WHERE erpnext_name = ?
            `)
            .bind(title, slug, parentId, isVisible, sortOrder, cfImageId, imageUrl, now, now, payload.name)
            .run();
        } else {
          const id = crypto.randomUUID().replace(/-/g, '');
          await db
            .prepare(`
              INSERT INTO storefront_categories (
                id, erpnext_name, title, slug, parent_id, sort_order, is_visible,
                count, image_url, cf_image_id, sync_source, last_synced_from_erpnext, created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, 'erpnext', ?, ?, ?)
            `)
            .bind(id, payload.name, title, slug, parentId, sortOrder, isVisible, imageUrl, cfImageId, now, now, now)
            .run();
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
        total: categories.length,
        succeeded: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
      },
    });
  } catch (error) {
    console.error('Batch category sync error:', error);
    json(500, {
      error: 'Failed to sync categories',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Health check endpoint
export const onGet: RequestHandler = async ({ json }) => {
  json(200, {
    status: 'ok',
    endpoint: 'categories/sync',
    methods: {
      POST: 'Sync single category',
      PUT: 'Batch sync multiple categories (array)',
    },
    description: 'Webhook endpoint for ERPNext Item Group sync',
    expectedPayload: {
      name: 'ERPNext Item Group name (required)',
      item_group_name: 'Display title',
      parent_item_group: 'Parent category name',
      is_group: 'Whether this has subcategories',
      custom_show_in_website: 'Set to 1 to show category on website (default: hidden)',
      disabled: 'Legacy field - set to true to hide category',
      custom_sort_order: 'Display order (lower numbers appear first)',
      lft: 'Nested set left value (fallback for sort order if custom_sort_order not set)',
      category_image: 'Attach Image URL (optional, legacy)',
      custom_cf_image_id: 'Cloudflare Images ID (e.g., "cat-batteries")',
      cf_category_image_url: 'Full Cloudflare Images URL (ID will be extracted)',
    },
    visibilityLogic: 'Categories default to hidden (opt-in). Set custom_show_in_website=1 to show.',
  });
};
