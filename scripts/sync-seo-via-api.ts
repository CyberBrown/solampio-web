/**
 * Sync SEO fields from D1 to ERPNext via solampio-migration worker API
 * This script uses the deployed worker API instead of direct ERPNext access
 *
 * Usage:
 *   bun scripts/sync-seo-via-api.ts                    # Dry run
 *   bun scripts/sync-seo-via-api.ts --execute         # Actually sync
 *   bun scripts/sync-seo-via-api.ts --execute --limit 10  # Sync first 10
 *   bun scripts/sync-seo-via-api.ts --sku ABC-123     # Sync single SKU
 */

import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { execSync } from 'child_process';

const MIGRATION_API = 'https://solampio-migration.solamp.workers.dev';

// SEO field mapping: D1 column → ERPNext fieldname
const SEO_FIELDS_TO_SYNC = [
  'seo_title',
  'seo_meta_description',
  'seo_description_summary',
  'seo_og_title',
  'seo_og_description',
  'seo_keywords',
  'seo_robots',
  'seo_last_optimized',
  'gmc_google_category',
  'gmc_product_type',
  'gmc_shipping_label',
  'gmc_custom_label_0', // margin_tier
  'gmc_custom_label_2', // brand_tier
  'seo_faqs',
];

// Parse command line arguments
const args = process.argv.slice(2);
const executeMode = args.includes('--execute');
const limitArg = args.find(a => a.startsWith('--limit'));
const limit = limitArg ? parseInt(limitArg.split('=')[1] || args[args.indexOf('--limit') + 1]) : undefined;
const skuArg = args.find(a => a.startsWith('--sku'));
const singleSku = skuArg ? (skuArg.split('=')[1] || args[args.indexOf('--sku') + 1]) : undefined;

interface D1Product {
  sku: string;
  erpnext_name: string;
  [key: string]: string | null;
}

interface SyncResult {
  sku: string;
  erpnext_name: string;
  success: boolean;
  error?: string;
  fields_updated?: number;
}

async function fetchProductsFromD1(): Promise<D1Product[]> {
  const fieldList = ['sku', 'erpnext_name', ...SEO_FIELDS_TO_SYNC].join(', ');
  let query = `SELECT ${fieldList} FROM storefront_products WHERE seo_title IS NOT NULL`;

  if (singleSku) {
    query += ` AND sku = '${singleSku.replace(/'/g, "''")}'`;
  }

  if (limit && !singleSku) {
    query += ` LIMIT ${limit}`;
  }

  try {
    const result = execSync(
      `npx wrangler d1 execute solampio-migration --remote --json --command "${query}"`,
      { encoding: 'utf-8', cwd: process.cwd() }
    );

    const parsed = JSON.parse(result);
    if (parsed[0]?.results) {
      return parsed[0].results as D1Product[];
    }
    return [];
  } catch (error) {
    console.error('Error fetching from D1:', error);
    return [];
  }
}

async function updateERPNextItem(
  itemCode: string,
  seoFields: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
  const url = `${MIGRATION_API}/api/erpnext/items/${encodeURIComponent(itemCode)}`;

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(seoFields),
    });

    const data = await response.json() as { success: boolean; error?: string };

    if (!response.ok || !data.success) {
      return { success: false, error: data.error || `HTTP ${response.status}` };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

function mapD1ToERPNext(product: D1Product): Record<string, unknown> {
  const mapped: Record<string, unknown> = {};

  for (const field of SEO_FIELDS_TO_SYNC) {
    const value = product[field];
    if (value !== null && value !== undefined && value !== '') {
      // Map custom label fields to their ERPNext names
      if (field === 'gmc_custom_label_0') {
        mapped['gmc_margin_tier'] = value;
      } else if (field === 'gmc_custom_label_2') {
        mapped['gmc_brand_tier'] = value;
      } else if (field === 'seo_faqs') {
        mapped['faq_json'] = value;
      } else {
        mapped[field] = value;
      }
    }
  }

  return mapped;
}

async function main() {
  console.log('=== D1 → ERPNext SEO Sync (via API) ===\n');
  console.log(`Mode: ${executeMode ? 'EXECUTE' : 'DRY RUN'}`);
  console.log(`API: ${MIGRATION_API}`);
  if (singleSku) console.log(`Single SKU: ${singleSku}`);
  if (limit) console.log(`Limit: ${limit}`);
  console.log('');

  // Fetch products from D1
  console.log('Fetching products from D1...');
  const products = await fetchProductsFromD1();
  console.log(`Found ${products.length} products with SEO data\n`);

  if (products.length === 0) {
    console.log('No products to sync.');
    return;
  }

  const results: SyncResult[] = [];
  let successCount = 0;
  let errorCount = 0;

  for (const product of products) {
    const { sku, erpnext_name } = product;

    if (!erpnext_name) {
      console.log(`⚠ ${sku}: No ERPNext name, skipping`);
      results.push({ sku, erpnext_name: '', success: false, error: 'No ERPNext name' });
      errorCount++;
      continue;
    }

    const seoFields = mapD1ToERPNext(product);
    const fieldCount = Object.keys(seoFields).length;

    if (fieldCount === 0) {
      console.log(`⚠ ${sku}: No SEO fields to sync`);
      results.push({ sku, erpnext_name, success: false, error: 'No fields to sync' });
      continue;
    }

    if (executeMode) {
      process.stdout.write(`Syncing ${sku} → ${erpnext_name} (${fieldCount} fields)... `);
      const result = await updateERPNextItem(erpnext_name, seoFields);

      if (result.success) {
        console.log('✓');
        successCount++;
        results.push({ sku, erpnext_name, success: true, fields_updated: fieldCount });
      } else {
        console.log(`✗ ${result.error}`);
        errorCount++;
        results.push({ sku, erpnext_name, success: false, error: result.error });
      }

      // Rate limiting: 2 requests per second
      await new Promise(resolve => setTimeout(resolve, 500));
    } else {
      console.log(`[DRY RUN] Would sync ${sku} → ${erpnext_name}:`);
      for (const [field, value] of Object.entries(seoFields)) {
        const displayValue = typeof value === 'string' && value.length > 60
          ? value.slice(0, 60) + '...'
          : value;
        console.log(`  ${field}: ${displayValue}`);
      }
      console.log('');
      results.push({ sku, erpnext_name, success: true, fields_updated: fieldCount });
      successCount++;
    }
  }

  // Summary
  console.log('\n=== Summary ===');
  console.log(`Total products: ${products.length}`);
  console.log(`Success: ${successCount}`);
  console.log(`Errors: ${errorCount}`);

  // Save results
  const outputFile = resolve(process.cwd(), 'seo-sync-results.json');
  const output = {
    timestamp: new Date().toISOString(),
    mode: executeMode ? 'execute' : 'dry_run',
    api_url: MIGRATION_API,
    total: products.length,
    success: successCount,
    errors: errorCount,
    results,
  };
  writeFileSync(outputFile, JSON.stringify(output, null, 2));
  console.log(`\nResults saved to: ${outputFile}`);

  if (!executeMode) {
    console.log('\nThis was a dry run. Use --execute to actually sync data.');
  }
}

main().catch(console.error);
