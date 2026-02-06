/**
 * Sync SEO data from D1 to ERPNext
 *
 * POST /api/erpnext/sync-seo-to-erpnext
 *
 * Pushes SEO fields from the storefront DB to ERPNext custom fields.
 * This makes ERPNext the source of truth for future edits.
 *
 * Query params:
 * - dry_run=true: Preview without making changes
 * - limit=N: Process only N products
 * - sku=XXX: Process only a specific SKU
 */

import type { RequestHandler } from '@builder.io/qwik-city';
import type { D1Database } from '@cloudflare/workers-types';
import { rejectUnauthorized } from '~/lib/api-auth';

interface SEOProduct {
  sku: string;
  erpnext_name: string;
  title: string;
  seo_title: string | null;
  seo_meta_description: string | null;
  seo_og_title: string | null;
  seo_og_description: string | null;
  seo_keywords: string | null;
  seo_faqs: string | null;
  seo_use_cases: string | null;
  gmc_google_category: string | null;
  gmc_product_type: string | null;
  gmc_custom_label_0: string | null;
  gmc_custom_label_1: string | null;
  seo_last_optimized: string | null;
}

interface SyncResult {
  sku: string;
  erpnext_name: string;
  status: 'success' | 'error' | 'skipped';
  message?: string;
}

async function updateERPNextItem(
  erpnextUrl: string,
  headers: HeadersInit,
  erpnextName: string,
  seoData: Partial<SEOProduct>
): Promise<{ success: boolean; error?: string }> {
  try {
    const payload: Record<string, any> = {};

    if (seoData.seo_title) payload.custom_seo_title = seoData.seo_title;
    if (seoData.seo_meta_description) payload.custom_seo_meta_description = seoData.seo_meta_description;
    if (seoData.seo_og_title) payload.custom_seo_og_title = seoData.seo_og_title;
    if (seoData.seo_og_description) payload.custom_seo_og_description = seoData.seo_og_description;
    if (seoData.seo_keywords) payload.custom_website_keywords = seoData.seo_keywords;
    if (seoData.seo_faqs) payload.custom_seo_faqs = seoData.seo_faqs;
    if (seoData.seo_use_cases) payload.custom_seo_use_cases = seoData.seo_use_cases;
    if (seoData.gmc_google_category) payload.custom_gmc_google_category = seoData.gmc_google_category;
    if (seoData.gmc_product_type) payload.custom_gmc_product_type = seoData.gmc_product_type;
    if (seoData.gmc_custom_label_0) payload.custom_gmc_margin_tier = seoData.gmc_custom_label_0;
    if (seoData.gmc_custom_label_1) payload.custom_gmc_product_type_label = seoData.gmc_custom_label_1;
    if (seoData.seo_last_optimized) payload.custom_seo_last_optimized = seoData.seo_last_optimized;

    const response = await fetch(
      `${erpnextUrl}/api/resource/Item/${encodeURIComponent(erpnextName)}`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      return { success: false, error: `HTTP ${response.status}: ${text.substring(0, 200)}` };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export const onGet: RequestHandler = async ({ json }) => {
  json(200, {
    status: 'ok',
    endpoint: 'erpnext/sync-seo-to-erpnext',
    description: 'Syncs SEO data from D1 to ERPNext custom fields',
    methods: ['POST'],
    query_params: {
      dry_run: 'true to preview without changes',
      limit: 'Max products to process (default: all)',
      sku: 'Process only a specific SKU',
    },
    notes: [
      'Requires ADMIN_API_KEY authorization',
      'Run setup-seo-custom-fields first to create ERPNext fields',
      'Uses worker ERPNext credentials',
    ],
  });
};

export const onPost: RequestHandler = async (requestEvent) => {
  if (rejectUnauthorized(requestEvent, 'ADMIN_API_KEY')) return;

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
    json(500, { success: false, error: 'ERPNext credentials not configured' });
    return;
  }

  const dryRun = url.searchParams.get('dry_run') === 'true';
  const limit = url.searchParams.get('limit');
  const specificSku = url.searchParams.get('sku');

  const headers: HeadersInit = {
    Authorization: `token ${env.ERPNEXT_API_KEY}:${env.ERPNEXT_API_SECRET}`,
    'Content-Type': 'application/json',
  };

  // Build query
  let query = `
    SELECT
      sku, erpnext_name, title,
      seo_title, seo_meta_description, seo_og_title, seo_og_description,
      seo_keywords, seo_faqs, seo_use_cases,
      gmc_google_category, gmc_product_type, gmc_custom_label_0, gmc_custom_label_1,
      seo_last_optimized
    FROM storefront_products
    WHERE seo_title IS NOT NULL
      AND erpnext_name IS NOT NULL
  `;

  if (specificSku) {
    query += ` AND sku = '${specificSku.replace(/'/g, "''")}'`;
  }

  query += ' ORDER BY sku';

  if (limit) {
    query += ` LIMIT ${parseInt(limit)}`;
  }

  const products = await env.DB.prepare(query).all<SEOProduct>();

  if (!products.results || products.results.length === 0) {
    json(200, {
      success: true,
      message: 'No products to sync',
      dry_run: dryRun,
      count: 0,
    });
    return;
  }

  const results: SyncResult[] = [];
  let successCount = 0;
  let errorCount = 0;

  for (const product of products.results) {
    if (dryRun) {
      results.push({
        sku: product.sku,
        erpnext_name: product.erpnext_name,
        status: 'skipped',
        message: 'Dry run - would update',
      });
      successCount++;
      continue;
    }

    const result = await updateERPNextItem(env.ERPNEXT_URL, headers, product.erpnext_name, product);

    if (result.success) {
      results.push({
        sku: product.sku,
        erpnext_name: product.erpnext_name,
        status: 'success',
      });
      successCount++;
    } else {
      results.push({
        sku: product.sku,
        erpnext_name: product.erpnext_name,
        status: 'error',
        message: result.error,
      });
      errorCount++;
    }

    // Rate limit: 200ms between requests
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  json(200, {
    success: errorCount === 0,
    dry_run: dryRun,
    summary: {
      total: products.results.length,
      success: successCount,
      errors: errorCount,
    },
    results: results.length <= 50 ? results : results.slice(0, 50).concat([{
      sku: '...',
      erpnext_name: '...',
      status: 'skipped' as const,
      message: `${results.length - 50} more results truncated`,
    }]),
    next_steps: errorCount > 0 ? [
      'Some updates failed - check that custom fields exist in ERPNext',
      'Run GET /api/erpnext/setup-seo-custom-fields to see required fields',
      'Run POST /api/erpnext/setup-seo-custom-fields to create missing fields',
    ] : undefined,
  });
};
