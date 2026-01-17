/**
 * Brand Sync API Endpoint
 *
 * Receives webhooks from ERPNext to create/update brands.
 * When a brand changes in ERPNext, it updates storefront_brands.
 *
 * POST /api/brands/sync/
 *
 * Expected payload from ERPNext Brand doctype:
 * {
 *   name: string,                    // ERPNext Brand name
 *   brand: string,                   // Brand display name (optional, falls back to name)
 *   description: string,             // Brand description (optional)
 *   image: string,                   // Logo URL (optional)
 *   is_visible_on_website: boolean,  // Whether to show on website (opt-in, default false)
 *   disabled: boolean,               // Legacy field (fallback if is_visible_on_website not set)
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

interface ERPNextBrandPayload {
  name: string;
  brand?: string;
  description?: string;
  image?: string;
  is_visible_on_website?: boolean | number;  // New field: true = visible
  disabled?: boolean | number;                // Legacy field: true = hidden
}

/**
 * Determine visibility based on payload fields
 * Priority: is_visible_on_website > !disabled > default (hidden)
 */
function getVisibility(payload: ERPNextBrandPayload): number {
  // If is_visible_on_website is explicitly set, use it
  if (payload.is_visible_on_website !== undefined) {
    return payload.is_visible_on_website ? 1 : 0;
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

    const title = payload.brand || payload.name;
    const slug = generateSlug(title);
    const now = new Date().toISOString();
    const isVisible = getVisibility(payload);

    // Check if brand exists
    const existing = await db
      .prepare('SELECT id FROM storefront_brands WHERE erpnext_name = ?')
      .bind(payload.name)
      .first() as { id: string } | null;

    if (existing) {
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
          payload.image || null,
          isVisible,
          now,
          now,
          payload.name
        )
        .run();

      json(200, {
        success: true,
        brand: {
          id: existing.id,
          erpnext_name: payload.name,
          title,
          slug,
          is_visible: isVisible,
          updated: true,
        },
      });
    } else {
      // Insert new brand
      const id = crypto.randomUUID().replace(/-/g, '');
      await db
        .prepare(`
          INSERT INTO storefront_brands (
            id, erpnext_name, title, slug, description, logo_url, sort_order, is_visible,
            sync_source, last_synced_from_erpnext, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, 0, ?, 'erpnext', ?, ?, ?)
        `)
        .bind(
          id,
          payload.name,
          title,
          slug,
          payload.description || null,
          payload.image || null,
          isVisible,
          now,
          now,
          now
        )
        .run();

      json(200, {
        success: true,
        brand: {
          id,
          erpnext_name: payload.name,
          title,
          slug,
          is_visible: isVisible,
          created: true,
        },
      });
    }
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

        const title = payload.brand || payload.name;
        const slug = generateSlug(title);
        const now = new Date().toISOString();
        const isVisible = getVisibility(payload);

        const existing = await db
          .prepare('SELECT id FROM storefront_brands WHERE erpnext_name = ?')
          .bind(payload.name)
          .first() as { id: string } | null;

        if (existing) {
          await db
            .prepare(`
              UPDATE storefront_brands SET
                title = ?, slug = ?, description = COALESCE(?, description),
                logo_url = COALESCE(?, logo_url), is_visible = ?,
                sync_source = 'erpnext', last_synced_from_erpnext = ?, updated_at = ?
              WHERE erpnext_name = ?
            `)
            .bind(title, slug, payload.description || null, payload.image || null, isVisible, now, now, payload.name)
            .run();
        } else {
          const id = crypto.randomUUID().replace(/-/g, '');
          await db
            .prepare(`
              INSERT INTO storefront_brands (
                id, erpnext_name, title, slug, description, logo_url, sort_order, is_visible,
                sync_source, last_synced_from_erpnext, created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, 0, ?, 'erpnext', ?, ?, ?)
            `)
            .bind(id, payload.name, title, slug, payload.description || null, payload.image || null, isVisible, now, now, now)
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
      description: 'Brand description',
      image: 'Logo image URL',
      is_visible_on_website: 'Set to true to show brand on website (default: false)',
      disabled: 'Legacy field - set to true to hide brand (use is_visible_on_website instead)',
    },
    visibilityLogic: 'Brands default to hidden (opt-in). Set is_visible_on_website=true to show.',
  });
};
