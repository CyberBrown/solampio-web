/**
 * Sync Variant Data from ERPNext to D1
 *
 * Fetches variant relationships from ERPNext and populates has_variants and variant_of
 * columns in D1 storefront_products table.
 *
 * This is needed because:
 * 1. SEO optimization should only target template products (has_variants=1) and standalone products
 * 2. Variants should inherit SEO from their parent template
 * 3. The variant_of field links variants to their parent for SEO inheritance
 *
 * Usage:
 *   npx tsx scripts/sync-variants.ts
 *   Add --dry-run to preview without making changes
 *   Add --limit=N to process only N products
 *
 * Note: Uses solampio-migration worker for ERPNext API access per CLAUDE.md
 */

import { execSync } from 'child_process';
import * as fs from 'fs';

const MIGRATION_WORKER_URL = 'https://solampio-migration.solamp.workers.dev';
const DB_NAME = 'solampio-migration';
const DRY_RUN = process.argv.includes('--dry-run');
const LIMIT_ARG = process.argv.find(a => a.startsWith('--limit='));
const LIMIT = LIMIT_ARG ? parseInt(LIMIT_ARG.split('=')[1]) : undefined;
const LOG_FILE = './variant-sync.log';

interface ERPNextItem {
  name: string;
  item_code: string;
  has_variants: 0 | 1;
  variant_of: string | null;
}

interface D1Product {
  sku: string;
  erpnext_name: string;
  has_variants: number;
  variant_of: string | null;
}

function log(message: string) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${message}`;
  console.log(line);
  fs.appendFileSync(LOG_FILE, line + '\n');
}

function queryD1(sql: string): any[] {
  const tmpFile = '/tmp/variant-sync-query.txt';
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

function executeD1(sql: string): boolean {
  const tmpFile = '/tmp/variant-sync-execute.txt';
  fs.writeFileSync(tmpFile, sql);
  try {
    execSync(
      `npx wrangler d1 execute ${DB_NAME} --remote --command "$(cat ${tmpFile})"`,
      { encoding: 'utf-8', maxBuffer: 100 * 1024 * 1024, timeout: 120000 }
    );
    return true;
  } catch (error: any) {
    log(`D1 execute failed: ${error.message}`);
    return false;
  }
}

async function fetchERPNextItems(): Promise<ERPNextItem[]> {
  const allItems: ERPNextItem[] = [];
  let offset = 0;
  const pageSize = 500;

  log('Fetching items from ERPNext via migration worker...');

  while (true) {
    try {
      // Use migration worker's ERPNext proxy endpoint
      const response = await fetch(
        `${MIGRATION_WORKER_URL}/api/erpnext/items?` +
        `fields=["name","item_code","has_variants","variant_of"]` +
        `&limit_page_length=${pageSize}` +
        `&limit_start=${offset}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status}: ${text.substring(0, 200)}`);
      }

      const data = await response.json() as { data: ERPNextItem[] };
      const items = data.data || [];

      if (items.length === 0) break;

      allItems.push(...items);
      log(`  Fetched ${allItems.length} items so far...`);

      if (items.length < pageSize) break;
      offset += pageSize;

      // Rate limit
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      log(`Error fetching from ERPNext: ${error instanceof Error ? error.message : 'Unknown'}`);
      break;
    }
  }

  return allItems;
}

async function main() {
  log('='.repeat(60));
  log(`Variant Sync from ERPNext to D1${DRY_RUN ? ' (DRY RUN)' : ''}`);
  log('='.repeat(60));

  // Step 1: Fetch current D1 products
  log('Fetching current D1 products...');
  const limitClause = LIMIT ? `LIMIT ${LIMIT}` : '';
  const d1Products = queryD1(`
    SELECT sku, erpnext_name, has_variants, variant_of
    FROM storefront_products
    WHERE erpnext_name IS NOT NULL
    ${limitClause}
  `) as D1Product[];

  log(`Found ${d1Products.length} products in D1 with ERPNext names`);

  // Create lookup maps
  const d1BySku = new Map<string, D1Product>();
  const d1ByErpName = new Map<string, D1Product>();
  for (const p of d1Products) {
    if (p.sku) d1BySku.set(p.sku, p);
    if (p.erpnext_name) d1ByErpName.set(p.erpnext_name, p);
  }

  // Step 2: Fetch ERPNext items with variant info
  const erpItems = await fetchERPNextItems();
  log(`Fetched ${erpItems.length} items from ERPNext`);

  // Separate templates and variants
  const templates = erpItems.filter(i => i.has_variants === 1);
  const variants = erpItems.filter(i => i.variant_of);

  log(`  Templates (has_variants=1): ${templates.length}`);
  log(`  Variants (variant_of set): ${variants.length}`);

  // Step 3: Compare and update
  let updatedTemplates = 0;
  let updatedVariants = 0;
  let skipped = 0;
  let notFound = 0;

  // Update templates (has_variants = 1)
  log('\nUpdating template products...');
  for (const item of templates) {
    const d1Product = d1ByErpName.get(item.name) || d1BySku.get(item.item_code);

    if (!d1Product) {
      notFound++;
      continue;
    }

    // Check if already correct
    if (d1Product.has_variants === 1) {
      skipped++;
      continue;
    }

    const sku = d1Product.sku.replace(/'/g, "''"); // Escape quotes

    if (DRY_RUN) {
      log(`  Would update template: ${item.item_code}`);
      updatedTemplates++;
      continue;
    }

    const success = executeD1(`
      UPDATE storefront_products
      SET has_variants = 1, updated_at = datetime('now')
      WHERE sku = '${sku}'
    `);

    if (success) {
      updatedTemplates++;
      process.stdout.write('.');
    } else {
      log(`  Failed to update template: ${item.item_code}`);
    }
  }

  // Update variants (variant_of = parent SKU)
  log('\n\nUpdating variant products...');
  for (const item of variants) {
    const d1Product = d1ByErpName.get(item.name) || d1BySku.get(item.item_code);

    if (!d1Product) {
      notFound++;
      continue;
    }

    // variant_of in ERPNext is the parent's item_code (SKU)
    const parentSku = item.variant_of;

    // Check if already correct
    if (d1Product.variant_of === parentSku && d1Product.has_variants === 0) {
      skipped++;
      continue;
    }

    const sku = d1Product.sku.replace(/'/g, "''");
    const parentSkuEscaped = parentSku?.replace(/'/g, "''") || null;

    if (DRY_RUN) {
      log(`  Would update variant: ${item.item_code} -> parent: ${parentSku}`);
      updatedVariants++;
      continue;
    }

    const success = executeD1(`
      UPDATE storefront_products
      SET variant_of = ${parentSkuEscaped ? `'${parentSkuEscaped}'` : 'NULL'},
          has_variants = 0,
          updated_at = datetime('now')
      WHERE sku = '${sku}'
    `);

    if (success) {
      updatedVariants++;
      process.stdout.write('.');
    } else {
      log(`  Failed to update variant: ${item.item_code}`);
    }
  }

  // Step 4: Summary
  log('\n');
  log('='.repeat(60));
  log('SYNC COMPLETE');
  log('='.repeat(60));
  log(`ERPNext Items: ${erpItems.length}`);
  log(`  Templates: ${templates.length}`);
  log(`  Variants: ${variants.length}`);
  log('');
  log(`D1 Updates:`);
  log(`  Templates updated: ${updatedTemplates}`);
  log(`  Variants updated: ${updatedVariants}`);
  log(`  Already correct (skipped): ${skipped}`);
  log(`  Not found in D1: ${notFound}`);

  // Verify results
  if (!DRY_RUN) {
    log('\nVerifying results...');
    const stats = queryD1(`
      SELECT
        SUM(CASE WHEN has_variants = 1 THEN 1 ELSE 0 END) as template_count,
        SUM(CASE WHEN variant_of IS NOT NULL THEN 1 ELSE 0 END) as variant_count,
        SUM(CASE WHEN has_variants = 0 AND variant_of IS NULL THEN 1 ELSE 0 END) as standalone_count
      FROM storefront_products
      WHERE is_visible = 1
    `);

    if (stats.length > 0) {
      log(`  Templates in D1: ${stats[0].template_count}`);
      log(`  Variants in D1: ${stats[0].variant_count}`);
      log(`  Standalone products: ${stats[0].standalone_count}`);
    }

    // Check SEO optimization candidates
    const seoStats = queryD1(`
      SELECT
        SUM(CASE WHEN seo_last_optimized IS NOT NULL THEN 1 ELSE 0 END) as with_seo,
        SUM(CASE WHEN seo_last_optimized IS NULL THEN 1 ELSE 0 END) as without_seo
      FROM storefront_products
      WHERE is_visible = 1
        AND (has_variants = 1 OR (has_variants = 0 AND variant_of IS NULL))
    `);

    if (seoStats.length > 0) {
      log(`\nSEO Optimization Candidates (templates + standalone):`);
      log(`  With SEO: ${seoStats[0].with_seo}`);
      log(`  Without SEO: ${seoStats[0].without_seo}`);
    }
  }
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
