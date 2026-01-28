/**
 * ERPNext Data Quality Sync API
 *
 * Syncs storefront data quality issues back to ERPNext Item records.
 * This allows admins to see and fix issues directly in ERPNext.
 *
 * GET /api/erpnext/sync-data-quality - Info about the endpoint
 * POST /api/erpnext/sync-data-quality - Sync issues to ERPNext
 * POST /api/erpnext/sync-data-quality?setup=true - Create custom fields first
 * POST /api/erpnext/sync-data-quality?dry_run=true - Preview without syncing
 *
 * Custom fields created in ERPNext Item doctype:
 * - custom_storefront_issues: Data quality issues (read-only)
 * - custom_has_storefront_issues: Check field for filtering
 */

import type { RequestHandler } from '@builder.io/qwik-city';
import type { D1Database } from '@cloudflare/workers-types';
import { rejectUnauthorized } from '~/lib/api-auth';

type IssueType = 'missing_image' | 'missing_description' | 'missing_price' | 'missing_seo';

// Custom fields to create for Item doctype
const ITEM_CUSTOM_FIELDS = [
  {
    doctype: 'Item',
    fieldname: 'custom_storefront_issues',
    fieldtype: 'Small Text',
    label: 'Storefront Data Issues',
    insert_after: 'description',
    description: 'Data quality issues detected in storefront sync (auto-populated)',
    read_only: 1,
  },
  {
    doctype: 'Item',
    fieldname: 'custom_has_storefront_issues',
    fieldtype: 'Check',
    label: 'Has Storefront Issues',
    insert_after: 'custom_storefront_issues',
    description: 'Check if there are storefront data quality issues (auto-populated)',
    read_only: 1,
  },
];

interface ERPNextResponse {
  data?: unknown;
  message?: unknown;
  exc?: string;
  exc_type?: string;
  _server_messages?: string;
}

interface SyncResult {
  erpnext_name: string;
  status: 'updated' | 'error' | 'skipped';
  issues?: string;
  message?: string;
}

export const onGet: RequestHandler = async ({ json }) => {
  json(200, {
    status: 'ok',
    endpoint: 'erpnext/sync-data-quality',
    description: 'Syncs storefront data quality issues to ERPNext Item records',
    methods: ['POST'],
    parameters: {
      setup: 'Set to true to create custom fields in ERPNext first',
      dry_run: 'Set to true to preview without making changes',
      limit: 'Max items to sync (default: 500)',
    },
    issues_detected: [
      'missing_image: Product has no image and cannot inherit from parent',
      'missing_description: Product has no description',
      'missing_price: Product has no price',
      'missing_seo: Product has not been SEO optimized',
    ],
    custom_fields_created: ITEM_CUSTOM_FIELDS.map(f => ({
      fieldname: f.fieldname,
      fieldtype: f.fieldtype,
      label: f.label,
    })),
    usage_example: [
      'POST /api/erpnext/sync-data-quality?setup=true - First time setup',
      'POST /api/erpnext/sync-data-quality - Regular sync',
      'Then in ERPNext: Filter Items by "Has Storefront Issues" = Yes',
    ],
  });
};

export const onPost: RequestHandler = async (requestEvent) => {
  if (rejectUnauthorized(requestEvent, 'ADMIN_API_KEY')) return;

  const { platform, json, url } = requestEvent;
  const db = platform.env?.DB as D1Database | undefined;
  const env = platform?.env as {
    ERPNEXT_URL?: string;
    ERPNEXT_API_KEY?: string;
    ERPNEXT_API_SECRET?: string;
  } | undefined;

  if (!db) {
    json(500, { error: 'Database not configured' });
    return;
  }

  if (!env?.ERPNEXT_URL || !env?.ERPNEXT_API_KEY || !env?.ERPNEXT_API_SECRET) {
    json(500, { error: 'ERPNext credentials not configured' });
    return;
  }

  const dryRun = url.searchParams.get('dry_run') === 'true';
  const setup = url.searchParams.get('setup') === 'true';
  const limit = parseInt(url.searchParams.get('limit') || '500', 10);

  const headers: HeadersInit = {
    Authorization: `token ${env.ERPNEXT_API_KEY}:${env.ERPNEXT_API_SECRET}`,
    'Content-Type': 'application/json',
  };

  // Setup custom fields if requested
  if (setup) {
    const setupResults: { fieldname: string; status: string; message?: string }[] = [];

    for (const field of ITEM_CUSTOM_FIELDS) {
      try {
        // Check if field exists
        const checkUrl = `${env.ERPNEXT_URL}/api/resource/Custom Field?filters=${encodeURIComponent(JSON.stringify([
          ['dt', '=', field.doctype],
          ['fieldname', '=', field.fieldname]
        ]))}&limit_page_length=1`;

        const checkResponse = await fetch(checkUrl, { headers });
        const checkData = await checkResponse.json() as ERPNextResponse;

        if (checkData.data && Array.isArray(checkData.data) && checkData.data.length > 0) {
          setupResults.push({ fieldname: field.fieldname, status: 'exists' });
          continue;
        }

        if (dryRun) {
          setupResults.push({ fieldname: field.fieldname, status: 'would_create' });
          continue;
        }

        // Create the field
        const createUrl = `${env.ERPNEXT_URL}/api/resource/Custom Field`;
        const createResponse = await fetch(createUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            dt: field.doctype,
            fieldname: field.fieldname,
            fieldtype: field.fieldtype,
            label: field.label,
            insert_after: field.insert_after || '',
            description: field.description || '',
            read_only: field.read_only || 0,
          }),
        });

        if (createResponse.ok) {
          setupResults.push({ fieldname: field.fieldname, status: 'created' });
        } else {
          const errorData = await createResponse.json() as ERPNextResponse;
          setupResults.push({
            fieldname: field.fieldname,
            status: 'error',
            message: errorData._server_messages || `HTTP ${createResponse.status}`,
          });
        }

        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        setupResults.push({
          fieldname: field.fieldname,
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    json(200, {
      setup_complete: true,
      dry_run: dryRun,
      results: setupResults,
      next_step: 'Now run POST /api/erpnext/sync-data-quality without ?setup=true to sync issues',
    });
    return;
  }

  // Get products with data quality issues
  const result = await db
    .prepare(`
      SELECT
        p.sku,
        p.erpnext_name,
        p.title,
        p.description,
        p.description_clean,
        p.seo_description_summary,
        p.cf_image_id,
        p.image_url,
        p.price,
        p.seo_last_optimized,
        p.variant_of
      FROM storefront_products p
      WHERE p.is_visible = 1
        AND p.has_variants = 0
      ORDER BY p.title ASC
      LIMIT ?
    `)
    .bind(limit)
    .all<{
      sku: string;
      erpnext_name: string;
      title: string;
      description: string | null;
      description_clean: string | null;
      seo_description_summary: string | null;
      cf_image_id: string | null;
      image_url: string | null;
      price: number | null;
      seo_last_optimized: string | null;
      variant_of: string | null;
    }>();

  const products = result.results || [];

  // Get parent images for variants
  const variantsWithoutImages = products.filter(
    p => p.variant_of && !p.cf_image_id && !p.image_url
  );

  const parentImageMap = new Map<string, boolean>();

  if (variantsWithoutImages.length > 0) {
    const parentSkus = [...new Set(variantsWithoutImages.map(p => p.variant_of!))];
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
      parentImageMap.set(parent.sku, !!(parent.cf_image_id || parent.image_url));
    }
  }

  // Analyze products and sync to ERPNext
  const syncResults: SyncResult[] = [];
  let issuesFound = 0;
  let issuesCleared = 0;

  for (const product of products) {
    const issues: IssueType[] = [];

    // Check for missing image (considering parent inheritance)
    const hasOwnImage = !!(product.cf_image_id || product.image_url);
    const canInheritImage = product.variant_of ? parentImageMap.get(product.variant_of) : false;
    if (!hasOwnImage && !canInheritImage) {
      issues.push('missing_image');
    }

    // Check for missing description
    if (!product.description && !product.description_clean && !product.seo_description_summary) {
      issues.push('missing_description');
    }

    // Check for missing price
    if (!product.price || product.price <= 0) {
      issues.push('missing_price');
    }

    // Check for missing SEO
    if (!product.seo_last_optimized) {
      issues.push('missing_seo');
    }

    const issueString = issues.length > 0 ? issues.join(', ') : '';
    const hasIssues = issues.length > 0 ? 1 : 0;

    if (issues.length > 0) {
      issuesFound++;
    } else {
      issuesCleared++;
    }

    if (dryRun) {
      syncResults.push({
        erpnext_name: product.erpnext_name,
        status: 'skipped',
        issues: issueString || 'none',
        message: 'Dry run - no changes made',
      });
      continue;
    }

    // Update ERPNext Item
    try {
      const updateUrl = `${env.ERPNEXT_URL}/api/resource/Item/${encodeURIComponent(product.erpnext_name)}`;
      const updateResponse = await fetch(updateUrl, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          custom_storefront_issues: issueString,
          custom_has_storefront_issues: hasIssues,
        }),
      });

      if (updateResponse.ok) {
        syncResults.push({
          erpnext_name: product.erpnext_name,
          status: 'updated',
          issues: issueString || 'none',
        });
      } else {
        const errorData = await updateResponse.json() as ERPNextResponse;
        syncResults.push({
          erpnext_name: product.erpnext_name,
          status: 'error',
          issues: issueString || 'none',
          message: errorData._server_messages || `HTTP ${updateResponse.status}`,
        });
      }

      // Rate limit
      await new Promise(resolve => setTimeout(resolve, 50));
    } catch (error) {
      syncResults.push({
        erpnext_name: product.erpnext_name,
        status: 'error',
        issues: issueString || 'none',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  const updated = syncResults.filter(r => r.status === 'updated').length;
  const errors = syncResults.filter(r => r.status === 'error').length;

  json(200, {
    success: errors === 0,
    dry_run: dryRun,
    summary: {
      total_products: products.length,
      products_with_issues: issuesFound,
      products_healthy: issuesCleared,
      updated,
      errors,
    },
    next_steps: [
      'In ERPNext, go to Item List',
      'Add filter: Has Storefront Issues = Yes',
      'Review and fix items by adding images, descriptions, prices',
      'Re-run sync after fixes to clear issues',
    ],
    results: dryRun ? syncResults : undefined, // Only show detailed results in dry run
    errors_detail: errors > 0 ? syncResults.filter(r => r.status === 'error') : undefined,
  });
};
