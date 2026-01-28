import { optimizeProductSEO } from '../src/lib/seo-optimizer/gemini';
import type { FullOptimizationResult } from '../src/lib/seo-optimizer/types';
import * as fs from 'fs';
import { execSync } from 'child_process';

// Configuration
const DELAY_MS = 6000; // 6 seconds = 10 RPM
const CHECKPOINT_FILE = './seo-batch-checkpoint.json';
const LOG_FILE = './seo-batch.log';
const DB_NAME = 'solampio-migration';

interface Checkpoint {
  lastProcessedSku: string | null;
  processedCount: number;
  errorCount: number;
  startedAt: string;
  errors: Array<{ sku: string; error: string; timestamp: string }>;
}

interface ProductRow {
  sku: string;
  title: string;
  brand_id: string | null;
  item_group: string | null;
  price: number | null;
  description: string | null;
  cf_image_id: string | null;
  weight_lbs: number | null;
}

function log(message: string) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${message}`;
  console.log(line);
  fs.appendFileSync(LOG_FILE, line + '\n');
}

function loadCheckpoint(): Checkpoint | null {
  try {
    if (fs.existsSync(CHECKPOINT_FILE)) {
      return JSON.parse(fs.readFileSync(CHECKPOINT_FILE, 'utf-8'));
    }
  } catch (e) {
    log(`Warning: Could not load checkpoint: ${e}`);
  }
  return null;
}

function saveCheckpoint(checkpoint: Checkpoint) {
  fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify(checkpoint, null, 2));
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function escSQL(s: string | null | undefined): string {
  if (s === null || s === undefined) return 'NULL';
  return `'${s.replace(/'/g, "''")}'`;
}

function jsonSQL(obj: any): string {
  if (!obj) return 'NULL';
  return escSQL(JSON.stringify(obj));
}

function d1exec(sql: string): string {
  // Escape for shell: write SQL to temp file to avoid shell escaping issues
  const tmpFile = '/tmp/seo-batch-sql.txt';
  fs.writeFileSync(tmpFile, sql);
  return execSync(
    `npx wrangler d1 execute ${DB_NAME} --remote --json --command "$(cat ${tmpFile})"`,
    { encoding: 'utf-8', maxBuffer: 50 * 1024 * 1024, timeout: 30000 }
  );
}

function writeResultToD1(sku: string, result: FullOptimizationResult & { competitors?: any[]; optimized_description?: string }) {
  const sql = `UPDATE storefront_products SET
    seo_title = ${escSQL(result.seo_title)},
    seo_meta_description = ${escSQL(result.seo_meta_description)},
    seo_description_summary = ${escSQL(result.seo_description_summary)},
    seo_og_title = ${escSQL(result.seo_og_title)},
    seo_og_description = ${escSQL(result.seo_og_description)},
    seo_keywords = ${jsonSQL(result.seo_keywords)},
    seo_robots = ${escSQL(result.seo_robots)},
    seo_faqs = ${jsonSQL(result.seo_faqs)},
    seo_related_searches = ${jsonSQL(result.seo_related_searches)},
    seo_use_cases = ${jsonSQL(result.seo_use_cases)},
    description_original = COALESCE(description_original, description),
    seo_last_optimized = '${new Date().toISOString()}',
    seo_competitor_data = ${jsonSQL(result.competitors)},
    gmc_google_category = ${escSQL(result.gmc_google_category)},
    gmc_product_type = ${escSQL(result.gmc_product_type)},
    gmc_condition = ${escSQL(result.gmc_condition)},
    gmc_shipping_label = ${escSQL(result.gmc_shipping_label)},
    gmc_custom_label_0 = ${escSQL(result.gmc_custom_labels?.margin_tier)},
    gmc_custom_label_1 = ${escSQL(result.gmc_custom_labels?.product_type)},
    gmc_custom_label_2 = ${escSQL(result.gmc_custom_labels?.brand_tier)},
    gmc_custom_label_3 = ${escSQL(result.gmc_custom_labels?.seasonality)},
    gmc_custom_label_4 = ${escSQL(result.gmc_custom_labels?.promo_eligible)}
  WHERE sku = ${escSQL(sku)}`;

  d1exec(sql);
}

function saveCompetitorIntel(sku: string, competitors: Array<{ name: string; url: string; price: string | null; differentiators: string[] }>) {
  for (const comp of competitors) {
    const sql = `INSERT INTO competitor_intel (sku, competitor_name, competitor_url, competitor_price, differentiators)
      VALUES (${escSQL(sku)}, ${escSQL(comp.name)}, ${escSQL(comp.url)}, ${escSQL(comp.price)}, ${escSQL(JSON.stringify(comp.differentiators))})`;
    try {
      d1exec(sql);
    } catch (e) {
      log(`  Warning: Could not save competitor intel for ${sku}: ${e}`);
    }
  }
}

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('ERROR: GEMINI_API_KEY environment variable required');
    process.exit(1);
  }

  log('='.repeat(60));
  log('SEO Batch Optimizer - Starting');
  log('='.repeat(60));

  // Load or create checkpoint
  let checkpoint = loadCheckpoint();
  if (checkpoint) {
    log(`Resuming from checkpoint: ${checkpoint.processedCount} already processed`);
  } else {
    checkpoint = {
      lastProcessedSku: null,
      processedCount: 0,
      errorCount: 0,
      startedAt: new Date().toISOString(),
      errors: []
    };
  }

  // Fetch all parent products from D1
  log('Fetching products from D1...');
  const productsJson = execSync(
    `npx wrangler d1 execute ${DB_NAME} --remote --json --command "SELECT sku, title, brand_id, item_group, price, description, cf_image_id, weight_lbs FROM storefront_products WHERE variant_of IS NULL AND is_visible = 1 AND sku NOT LIKE 'test%' ORDER BY sku"`,
    { encoding: 'utf-8', maxBuffer: 50 * 1024 * 1024, timeout: 60000 }
  );

  const result = JSON.parse(productsJson);
  const products: ProductRow[] = result[0]?.results || [];

  log(`Found ${products.length} parent products`);

  // Find starting point if resuming
  let startIndex = 0;
  if (checkpoint.lastProcessedSku) {
    const idx = products.findIndex(p => p.sku === checkpoint.lastProcessedSku);
    if (idx >= 0) {
      startIndex = idx + 1;
      log(`Resuming after SKU: ${checkpoint.lastProcessedSku} (index ${startIndex})`);
    }
  }

  const toProcess = products.slice(startIndex);
  log(`Products to process: ${toProcess.length}`);

  if (toProcess.length === 0) {
    log('All products already processed!');
    return;
  }

  const estimatedMinutes = Math.ceil((toProcess.length * DELAY_MS) / 60000);
  log(`Estimated time: ~${estimatedMinutes} minutes`);
  log('');

  for (let i = 0; i < toProcess.length; i++) {
    const product = toProcess[i];
    const overallIndex = startIndex + i + 1;
    const progress = `[${overallIndex}/${products.length}]`;

    log(`${progress} Processing: ${product.sku} - ${product.title?.substring(0, 50)}...`);

    try {
      const startTime = Date.now();

      const optResult = await optimizeProductSEO(
        {
          sku: product.sku,
          name: product.title,
          brand: product.brand_id, // brand_id is the best we have
          category: product.item_group,
          price: product.price,
          description: product.description,
          cf_image_id: product.cf_image_id,
          weight_lbs: product.weight_lbs,
        },
        { apiKey }
      );

      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      log(`${progress} Done in ${duration}s - "${optResult.seo_title?.substring(0, 50)}..."`);

      // Write results to D1
      writeResultToD1(product.sku, optResult);

      // Save competitor intel
      if (optResult.competitors && optResult.competitors.length > 0) {
        saveCompetitorIntel(product.sku, optResult.competitors);
      }

      // Update checkpoint
      checkpoint.lastProcessedSku = product.sku;
      checkpoint.processedCount++;
      saveCheckpoint(checkpoint);

    } catch (error: any) {
      const errorMsg = error?.message || String(error);
      log(`${progress} ERROR: ${errorMsg}`);

      checkpoint.errorCount++;
      checkpoint.errors.push({
        sku: product.sku,
        error: errorMsg,
        timestamp: new Date().toISOString()
      });
      checkpoint.lastProcessedSku = product.sku;
      saveCheckpoint(checkpoint);
    }

    // Rate limit delay (skip on last item)
    if (i < toProcess.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  // Final summary
  log('');
  log('='.repeat(60));
  log('BATCH COMPLETE');
  log('='.repeat(60));
  log(`Total processed: ${checkpoint.processedCount}`);
  log(`Errors: ${checkpoint.errorCount}`);
  log(`Started: ${checkpoint.startedAt}`);
  log(`Finished: ${new Date().toISOString()}`);

  if (checkpoint.errors.length > 0) {
    log('');
    log('Failed SKUs:');
    checkpoint.errors.forEach(e => log(`  - ${e.sku}: ${e.error}`));
  }
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
