/**
 * Sync SEO data from D1 to ERPNext
 *
 * Pushes SEO fields from the storefront DB back to ERPNext custom fields
 * so ERPNext becomes the source of truth for future edits.
 *
 * Usage:
 *   ERPNEXT_URL=... ERPNEXT_API_KEY=... ERPNEXT_API_SECRET=... npx tsx scripts/sync-seo-to-erpnext.ts
 *   Add --dry-run to preview without making changes
 *   Add --limit=N to process only N products
 */

import { execSync } from 'child_process';
import * as fs from 'fs';

const ERPNEXT_URL = process.env.ERPNEXT_URL!;
const ERPNEXT_API_KEY = process.env.ERPNEXT_API_KEY!;
const ERPNEXT_API_SECRET = process.env.ERPNEXT_API_SECRET!;
const DB_NAME = 'solampio-migration';
const DRY_RUN = process.argv.includes('--dry-run');
const LIMIT_ARG = process.argv.find(a => a.startsWith('--limit='));
const LIMIT = LIMIT_ARG ? parseInt(LIMIT_ARG.split('=')[1]) : undefined;
const LOG_FILE = './seo-erpnext-sync.log';

if (!ERPNEXT_URL || !ERPNEXT_API_KEY || !ERPNEXT_API_SECRET) {
  console.error('Missing ERPNext credentials. Set ERPNEXT_URL, ERPNEXT_API_KEY, ERPNEXT_API_SECRET');
  process.exit(1);
}

const headers = {
  'Authorization': `token ${ERPNEXT_API_KEY}:${ERPNEXT_API_SECRET}`,
  'Content-Type': 'application/json',
};

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

function log(message: string) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${message}`;
  console.log(line);
  fs.appendFileSync(LOG_FILE, line + '\n');
}

function queryD1(sql: string): any[] {
  const tmpFile = '/tmp/seo-erpnext-query.txt';
  fs.writeFileSync(tmpFile, sql);
  try {
    const result = execSync(
      `npx wrangler d1 execute ${DB_NAME} --remote --json --command "$(cat ${tmpFile})"`,
      { encoding: 'utf-8', maxBuffer: 100 * 1024 * 1024, timeout: 120000 }
    );
    const parsed = JSON.parse(result);
    return parsed[0]?.results || [];
  } catch (error: any) {
    log(`D1 query failed: ${error.message}`);
    return [];
  }
}

async function updateERPNextItem(
  erpnextName: string,
  seoData: Partial<SEOProduct>
): Promise<{ success: boolean; error?: string }> {
  try {
    // Build the update payload with custom_ prefix for custom fields
    const payload: Record<string, any> = {};

    if (seoData.seo_title) payload.custom_seo_title = seoData.seo_title;
    if (seoData.seo_meta_description) payload.custom_seo_meta_description = seoData.seo_meta_description;
    if (seoData.seo_og_title) payload.custom_seo_og_title = seoData.seo_og_title;
    if (seoData.seo_og_description) payload.custom_seo_og_description = seoData.seo_og_description;
    if (seoData.seo_keywords) payload.custom_seo_keywords = seoData.seo_keywords;
    if (seoData.seo_faqs) payload.custom_seo_faqs = seoData.seo_faqs;
    if (seoData.seo_use_cases) payload.custom_seo_use_cases = seoData.seo_use_cases;
    if (seoData.gmc_google_category) payload.custom_gmc_google_category = seoData.gmc_google_category;
    if (seoData.gmc_product_type) payload.custom_gmc_product_type = seoData.gmc_product_type;
    if (seoData.gmc_custom_label_0) payload.custom_gmc_margin_tier = seoData.gmc_custom_label_0;
    if (seoData.gmc_custom_label_1) payload.custom_gmc_product_type_label = seoData.gmc_custom_label_1;
    if (seoData.seo_last_optimized) payload.custom_seo_last_optimized = seoData.seo_last_optimized;

    const response = await fetch(
      `${ERPNEXT_URL}/api/resource/Item/${encodeURIComponent(erpnextName)}`,
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

async function main() {
  log('='.repeat(60));
  log(`SEO Sync to ERPNext${DRY_RUN ? ' (DRY RUN)' : ''}`);
  log(`Target: ${ERPNEXT_URL}`);
  log('='.repeat(60));

  // Fetch SEO data from D1
  log('Fetching SEO data from D1...');
  const limitClause = LIMIT ? `LIMIT ${LIMIT}` : '';
  const products = queryD1(`
    SELECT
      sku,
      erpnext_name,
      title,
      seo_title,
      seo_meta_description,
      seo_og_title,
      seo_og_description,
      seo_keywords,
      seo_faqs,
      seo_use_cases,
      gmc_google_category,
      gmc_product_type,
      gmc_custom_label_0,
      gmc_custom_label_1,
      seo_last_optimized
    FROM storefront_products
    WHERE seo_title IS NOT NULL
      AND erpnext_name IS NOT NULL
    ORDER BY sku
    ${limitClause}
  `) as SEOProduct[];

  log(`Found ${products.length} products with SEO data and ERPNext names`);

  if (products.length === 0) {
    log('No products to sync.');
    return;
  }

  let success = 0;
  let failed = 0;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const progress = `[${i + 1}/${products.length}]`;

    process.stdout.write(`${progress} ${p.sku} - ${p.title?.substring(0, 40)}... `);

    if (DRY_RUN) {
      console.log('SKIP (dry run)');
      success++;
      continue;
    }

    const result = await updateERPNextItem(p.erpnext_name, p);

    if (result.success) {
      console.log('✓');
      success++;
    } else {
      console.log(`✗ ${result.error}`);
      failed++;
    }

    // Rate limit: 200ms between requests
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  log('');
  log('='.repeat(60));
  log('SYNC COMPLETE');
  log('='.repeat(60));
  log(`Total: ${products.length}`);
  log(`Success: ${success}`);
  log(`Failed: ${failed}`);

  if (failed > 0) {
    log('');
    log('NOTE: Failures may indicate missing custom fields in ERPNext.');
    log('Run the setup-seo-custom-fields API endpoint first:');
    log('  curl -X POST https://solampio.com/api/erpnext/setup-seo-custom-fields -H "Authorization: Bearer $ADMIN_API_KEY"');
  }
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
