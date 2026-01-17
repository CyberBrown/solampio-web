/**
 * Brand Sync API Endpoint
 *
 * Receives webhooks from ERPNext to create/update brands.
 * Supports brand logo URL updates from Cloudflare Images.
 *
 * POST /api/brands/sync/
 *
 * Expected payload from ERPNext Brand doctype:
 * {
 *   name: string,                    // ERPNext Brand name (required)
 *   brand: string,                   // Display name
 *   description: string,             // Brand description
 *   is_featured: boolean,            // Show in brand scroll
 *   cf_logo_full_url: string,        // CF Images full logo URL
 *   cf_logo_thumb_url: string,       // CF Images thumbnail URL
 *   cf_logo_greyscale_url: string,   // CF Images greyscale URL
 *   logo_source_url: string,         // Original logo source URL
 *   disabled: boolean,               // Hide brand if true
 * }
 */

import type { RequestHandler } from '@builder.io/qwik-city';

interface ERPNextBrandPayload {
  name: string;
  brand?: string;
  description?: string;
  is_featured?: boolean | number;
  cf_logo_full_url?: string;
  cf_logo_thumb_url?: string;
  cf_logo_greyscale_url?: string;
  logo_source_url?: string;
  disabled?: boolean | number;
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
 * Extract CF Images ID from delivery URL
 * URL format: https://imagedelivery.net/{account_hash}/{image_id}/{variant}
 */
function extractCfImageId(url: string | undefined): string | null {
  if (!url) return null;
  const match = url.match(/imagedelivery\.net\/[^/]+\/([^/]+)/);
  return match ? match[1] : null;
}

export const onPost: RequestHandler = async ({ request, platform, json }) => {
  try {
    const db = platform.env?.DB;
    if (!db) {
      json(500, { error: 'Database not configured' });
      return;
    }

    const payload = (await request.json()) as ERPNextBrandPayload;

    // Validate required fields
    if (!payload.name) {
      json(400, { error: 'Missing required field: name' });
      return;
    }

    const title = payload.brand || payload.name;
    const slug = generateSlug(title);
    const now = new Date().toISOString();
    const isVisible = payload.disabled ? 0 : 1;
    const isFeatured = payload.is_featured ? 1 : 0;

    // Extract CF image IDs from URLs
    const logoCfImageId = extractCfImageId(payload.cf_logo_full_url);
    const logoThumbCfId = extractCfImageId(payload.cf_logo_thumb_url);
    const logoGreyscaleCfId = extractCfImageId(payload.cf_logo_greyscale_url);

    // Check if brand exists
    const existing = (await db
      .prepare('SELECT id FROM storefront_brands WHERE erpnext_name = ?')
      .bind(payload.name)
      .first()) as { id: string } | null;

    if (existing) {
      // Update existing brand
      await db
        .prepare(
          `
          UPDATE storefront_brands SET
            title = ?,
            slug = ?,
            description = ?,
            logo_cf_image_id = COALESCE(?, logo_cf_image_id),
            logo_thumb_cf_id = COALESCE(?, logo_thumb_cf_id),
            logo_greyscale_cf_id = COALESCE(?, logo_greyscale_cf_id),
            logo_source_url = COALESCE(?, logo_source_url),
            is_featured = ?,
            is_visible = ?,
            sync_source = 'erpnext',
            last_synced_from_erpnext = ?,
            updated_at = ?
          WHERE erpnext_name = ?
        `
        )
        .bind(
          title,
          slug,
          payload.description || null,
          logoCfImageId,
          logoThumbCfId,
          logoGreyscaleCfId,
          payload.logo_source_url || null,
          isFeatured,
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
          is_featured: isFeatured === 1,
          has_logo: !!logoCfImageId,
          updated: true,
        },
      });
    } else {
      // Insert new brand
      const id = crypto.randomUUID().replace(/-/g, '');
      await db
        .prepare(
          `
          INSERT INTO storefront_brands (
            id, erpnext_name, title, slug, description,
            logo_cf_image_id, logo_thumb_cf_id, logo_greyscale_cf_id, logo_source_url,
            is_featured, is_visible, sort_order,
            sync_source, last_synced_from_erpnext, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'erpnext', ?, ?, ?)
        `
        )
        .bind(
          id,
          payload.name,
          title,
          slug,
          payload.description || null,
          logoCfImageId,
          logoThumbCfId,
          logoGreyscaleCfId,
          payload.logo_source_url || null,
          isFeatured,
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
          is_featured: isFeatured === 1,
          has_logo: !!logoCfImageId,
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
    const db = platform.env?.DB;
    if (!db) {
      json(500, { error: 'Database not configured' });
      return;
    }

    const brands = (await request.json()) as ERPNextBrandPayload[];

    if (!Array.isArray(brands)) {
      json(400, { error: 'Expected array of brands' });
      return;
    }

    const results: Array<{ name: string; success: boolean; error?: string }> =
      [];

    for (const payload of brands) {
      try {
        if (!payload.name) {
          results.push({ name: 'unknown', success: false, error: 'Missing name' });
          continue;
        }

        const title = payload.brand || payload.name;
        const slug = generateSlug(title);
        const now = new Date().toISOString();
        const isVisible = payload.disabled ? 0 : 1;
        const isFeatured = payload.is_featured ? 1 : 0;

        const logoCfImageId = extractCfImageId(payload.cf_logo_full_url);
        const logoThumbCfId = extractCfImageId(payload.cf_logo_thumb_url);
        const logoGreyscaleCfId = extractCfImageId(payload.cf_logo_greyscale_url);

        const existing = (await db
          .prepare('SELECT id FROM storefront_brands WHERE erpnext_name = ?')
          .bind(payload.name)
          .first()) as { id: string } | null;

        if (existing) {
          await db
            .prepare(
              `
              UPDATE storefront_brands SET
                title = ?, slug = ?, description = ?,
                logo_cf_image_id = COALESCE(?, logo_cf_image_id),
                logo_thumb_cf_id = COALESCE(?, logo_thumb_cf_id),
                logo_greyscale_cf_id = COALESCE(?, logo_greyscale_cf_id),
                logo_source_url = COALESCE(?, logo_source_url),
                is_featured = ?, is_visible = ?,
                sync_source = 'erpnext', last_synced_from_erpnext = ?, updated_at = ?
              WHERE erpnext_name = ?
            `
            )
            .bind(
              title,
              slug,
              payload.description || null,
              logoCfImageId,
              logoThumbCfId,
              logoGreyscaleCfId,
              payload.logo_source_url || null,
              isFeatured,
              isVisible,
              now,
              now,
              payload.name
            )
            .run();
        } else {
          const id = crypto.randomUUID().replace(/-/g, '');
          await db
            .prepare(
              `
              INSERT INTO storefront_brands (
                id, erpnext_name, title, slug, description,
                logo_cf_image_id, logo_thumb_cf_id, logo_greyscale_cf_id, logo_source_url,
                is_featured, is_visible, sort_order,
                sync_source, last_synced_from_erpnext, created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'erpnext', ?, ?, ?)
            `
            )
            .bind(
              id,
              payload.name,
              title,
              slug,
              payload.description || null,
              logoCfImageId,
              logoThumbCfId,
              logoGreyscaleCfId,
              payload.logo_source_url || null,
              isFeatured,
              isVisible,
              now,
              now,
              now
            )
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
        succeeded: results.filter((r) => r.success).length,
        failed: results.filter((r) => !r.success).length,
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
    description: 'Webhook endpoint for ERPNext Brand sync with logo support',
    expectedPayload: {
      name: 'ERPNext Brand name (required)',
      brand: 'Display title',
      description: 'Brand description',
      is_featured: 'Show in brand scroll (boolean)',
      cf_logo_full_url: 'CF Images full logo URL (400x200)',
      cf_logo_thumb_url: 'CF Images thumbnail URL (100x50)',
      cf_logo_greyscale_url: 'CF Images greyscale URL',
      logo_source_url: 'Original logo source URL for attribution',
      disabled: 'Set to true to hide brand',
    },
    logoWorkflow: {
      step1: 'Upload logo to ERPNext Brand doctype',
      step2: 'Run brand-logos scripts to process and upload to CF Images',
      step3: 'Send webhook with CF Images URLs to this endpoint',
      step4: 'Brand scroll will display logos with greyscale-to-color effect',
    },
  });
};
