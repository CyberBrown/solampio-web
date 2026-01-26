/**
 * Category Sync FROM ERPNext API
 *
 * POST /api/categories/sync-from-erpnext
 *
 * Fetches all Item Groups from ERPNext and syncs them to the D1 database.
 * This pulls the custom_sort_order field for category ordering.
 *
 * Unlike the webhook endpoint (/api/categories/sync), this endpoint
 * actively fetches from ERPNext rather than receiving pushed data.
 */

import type { RequestHandler } from '@builder.io/qwik-city';
import type { D1Database } from '@cloudflare/workers-types';
import { rejectUnauthorized } from '~/lib/api-auth';

interface ERPNextItemGroup {
  name: string;
  item_group_name: string;
  parent_item_group: string;
  is_group: number;
  image?: string;
  custom_sort_order?: number;
  lft?: number;  // Nested set left value (fallback for sort order)
  // Category image fields from ERPNext
  cf_category_image_url?: string;  // Full Cloudflare Images URL
  custom_cf_image_id?: string;     // Cloudflare Images ID
}

interface SyncResult {
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}

export const onGet: RequestHandler = async ({ json }) => {
  json(200, {
    status: 'ok',
    endpoint: 'categories/sync-from-erpnext',
    description: 'Fetches Item Groups from ERPNext and syncs to D1',
    methods: ['POST'],
    notes: [
      'Pulls all Item Groups from ERPNext',
      'Updates sort_order from custom_sort_order field (falls back to lft)',
      'Preserves visibility settings already in D1',
      'Run after setting up custom_sort_order field',
    ],
  });
};

export const onPost: RequestHandler = async (requestEvent) => {
  if (rejectUnauthorized(requestEvent, 'SYNC_API_KEY')) return;

  const { platform, json, url } = requestEvent;
  const env = platform?.env as {
    DB?: D1Database;
    ERPNEXT_URL?: string;
    ERPNEXT_API_KEY?: string;
    ERPNEXT_API_SECRET?: string;
  } | undefined;

  if (!env?.DB) {
    json(500, { success: false, error: 'Database not configured' });
    return;
  }

  if (!env?.ERPNEXT_URL || !env?.ERPNEXT_API_KEY || !env?.ERPNEXT_API_SECRET) {
    json(500, { success: false, error: 'ERPNext not configured' });
    return;
  }

  // Check for dry-run mode
  const dryRun = url.searchParams.get('dry_run') === 'true';

  const headers: HeadersInit = {
    Authorization: `token ${env.ERPNEXT_API_KEY}:${env.ERPNEXT_API_SECRET}`,
    'Content-Type': 'application/json',
  };

  const result: SyncResult = { created: 0, updated: 0, skipped: 0, errors: [] };
  const categoryDetails: Array<{ name: string; title: string; sort_order: number; action: string }> = [];

  try {
    // Fetch all Item Groups from ERPNext
    // Note: 'disabled' field is not permitted in queries, so we skip it
    const fields = ['name', 'item_group_name', 'parent_item_group', 'is_group', 'image', 'custom_sort_order', 'lft', 'cf_category_image_url', 'custom_cf_image_id'];
    const itemGroupUrl = `${env.ERPNEXT_URL}/api/resource/Item Group?fields=${JSON.stringify(fields)}&limit_page_length=0`;

    console.log('[Category Sync] Fetching Item Groups from ERPNext...');
    const response = await fetch(itemGroupUrl, { headers });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ERPNext API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json() as { data: ERPNextItemGroup[] };
    const itemGroups = data.data || [];

    console.log(`[Category Sync] Found ${itemGroups.length} Item Groups`);

    // Build a map of ERPNext names to IDs for parent lookups
    const existingCategories = await env.DB
      .prepare('SELECT id, erpnext_name FROM storefront_categories')
      .all<{ id: string; erpnext_name: string }>();

    const nameToId: Record<string, string> = {};
    for (const cat of existingCategories.results || []) {
      nameToId[cat.erpnext_name] = cat.id;
    }

    // First pass: ensure all categories exist (for parent lookups)
    for (const ig of itemGroups) {
      if (!nameToId[ig.name]) {
        const id = crypto.randomUUID().replace(/-/g, '');
        nameToId[ig.name] = id;
      }
    }

    // Process each Item Group
    for (const ig of itemGroups) {
      try {
        // Skip "All Item Groups" (ERPNext root)
        if (ig.name === 'All Item Groups') {
          result.skipped++;
          continue;
        }

        const title = ig.item_group_name || ig.name;
        const slug = generateSlug(title);

        // Determine sort order: prefer custom_sort_order, fall back to lft
        const sortOrder = ig.custom_sort_order ?? ig.lft ?? 0;

        // Get parent ID
        let parentId: string | null = null;
        if (ig.parent_item_group && ig.parent_item_group !== 'All Item Groups') {
          parentId = nameToId[ig.parent_item_group] || null;
        }

        const now = new Date().toISOString();

        // Check if category exists
        const existing = await env.DB
          .prepare('SELECT id, is_visible FROM storefront_categories WHERE erpnext_name = ?')
          .bind(ig.name)
          .first<{ id: string; is_visible: number }>();

        if (dryRun) {
          categoryDetails.push({
            name: ig.name,
            title,
            sort_order: sortOrder,
            action: existing ? 'would_update' : 'would_create',
          });
          continue;
        }

        // Get CF image ID - prefer custom_cf_image_id, extract from URL if full URL provided
        let cfImageId = ig.custom_cf_image_id || null;
        if (!cfImageId && ig.cf_category_image_url) {
          // Extract ID from URL format: https://imagedelivery.net/{hash}/{image_id}/{variant}
          const match = ig.cf_category_image_url.match(/imagedelivery\.net\/[^/]+\/([^/]+)/);
          if (match) cfImageId = match[1];
        }

        if (existing) {
          // Update existing category - preserve visibility
          await env.DB
            .prepare(`
              UPDATE storefront_categories SET
                title = ?,
                slug = ?,
                parent_id = ?,
                sort_order = ?,
                image_url = COALESCE(?, image_url),
                cf_image_id = COALESCE(?, cf_image_id),
                cf_category_image_url = COALESCE(?, cf_category_image_url),
                sync_source = 'erpnext',
                last_synced_from_erpnext = ?,
                updated_at = ?
              WHERE erpnext_name = ?
            `)
            .bind(
              title,
              slug,
              parentId,
              sortOrder,
              ig.image || null,
              cfImageId,
              ig.cf_category_image_url || null,
              now,
              now,
              ig.name
            )
            .run();

          result.updated++;
          categoryDetails.push({
            name: ig.name,
            title,
            sort_order: sortOrder,
            action: 'updated',
          });
        } else {
          // Create new category - default to hidden
          const id = nameToId[ig.name];
          await env.DB
            .prepare(`
              INSERT INTO storefront_categories (
                id, erpnext_name, title, slug, parent_id, sort_order, is_visible,
                count, image_url, cf_image_id, cf_category_image_url, sync_source, last_synced_from_erpnext, created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, 0, 0, ?, ?, ?, 'erpnext', ?, ?, ?)
            `)
            .bind(
              id,
              ig.name,
              title,
              slug,
              parentId,
              sortOrder,
              ig.image || null,
              cfImageId,
              ig.cf_category_image_url || null,
              now,
              now,
              now
            )
            .run();

          result.created++;
          categoryDetails.push({
            name: ig.name,
            title,
            sort_order: sortOrder,
            action: 'created',
          });
        }

      } catch (err) {
        const errorMsg = `Failed to sync ${ig.name}: ${err instanceof Error ? err.message : 'Unknown error'}`;
        result.errors.push(errorMsg);
        console.error('[Category Sync]', errorMsg);
      }
    }

    // Sort details by sort_order for readability
    categoryDetails.sort((a, b) => a.sort_order - b.sort_order);

    json(200, {
      success: true,
      message: dryRun ? 'Dry run complete (no changes made)' : 'Category sync complete',
      dry_run: dryRun,
      summary: {
        total_in_erpnext: itemGroups.length,
        created: result.created,
        updated: result.updated,
        skipped: result.skipped,
        errors: result.errors.length,
      },
      categories: categoryDetails.slice(0, 50),  // Limit response size
      errors: result.errors,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Category Sync] Error:', errorMessage);
    json(500, {
      success: false,
      error: errorMessage,
      ...result,
    });
  }
};
