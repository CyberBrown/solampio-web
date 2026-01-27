/**
 * Sync Cloudflare Images URLs to ERPNext
 *
 * Reads products from D1 that have cf_image_id and syncs the image URL
 * to ERPNext's website_image field and custom_website_images child table.
 *
 * Usage:
 *   ERPNEXT_URL=... ERPNEXT_API_KEY=... ERPNEXT_API_SECRET=... npx tsx scripts/sync-images-to-erpnext.ts
 *   Add --dry-run to preview without making changes
 */

import { execSync } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ERPNEXT_URL = process.env.ERPNEXT_URL!;
const ERPNEXT_API_KEY = process.env.ERPNEXT_API_KEY!;
const ERPNEXT_API_SECRET = process.env.ERPNEXT_API_SECRET!;
const CF_IMAGES_HASH = 'Fdrr4r8cVWsy-JJCR0JU_Q';
const DB_NAME = 'solampio-migration';
const DRY_RUN = process.argv.includes('--dry-run');

if (!ERPNEXT_URL || !ERPNEXT_API_KEY || !ERPNEXT_API_SECRET) {
  console.error('Missing ERPNext credentials.');
  process.exit(1);
}

const headers = {
  'Authorization': `token ${ERPNEXT_API_KEY}:${ERPNEXT_API_SECRET}`,
  'Content-Type': 'application/json',
};

interface Product {
  sku: string;
  erpnext_name: string;
  cf_image_id: string;
  title: string;
}

function queryD1(sql: string): any[] {
  const command = `npx wrangler d1 execute ${DB_NAME} --remote --json --command "${sql.replace(/"/g, '\\"')}"`;
  try {
    const result = execSync(command, {
      encoding: 'utf-8',
      cwd: resolve(__dirname, '..'),
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    const parsed = JSON.parse(result);
    return parsed[0]?.results || [];
  } catch (error: any) {
    console.error('D1 query failed:', error.message);
    return [];
  }
}

async function updateERPNextItem(
  erpnextName: string,
  imageUrl: string,
  cfImageId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(
      `${ERPNEXT_URL}/api/resource/Item/${encodeURIComponent(erpnextName)}`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          website_image: imageUrl,
          custom_website_images: [
            {
              image_url: imageUrl,
              cf_image_id: cfImageId,
              sort_order: 0,
            },
          ],
        }),
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
  console.log(`\n🖼️  Sync Images to ERPNext${DRY_RUN ? ' (DRY RUN)' : ''}\n`);
  console.log(`Target: ${ERPNEXT_URL}\n`);

  // Query D1 for products with cf_image_id and erpnext_name
  console.log('Querying D1 for products with images...');
  const products = queryD1(
    `SELECT sku, erpnext_name, cf_image_id, title FROM storefront_products WHERE cf_image_id IS NOT NULL AND erpnext_name IS NOT NULL AND is_visible = 1 ORDER BY title`
  ) as Product[];

  console.log(`Found ${products.length} products with CF images and ERPNext names\n`);

  if (products.length === 0) {
    console.log('Nothing to sync.');
    return;
  }

  let success = 0;
  let failed = 0;
  let skipped = 0;

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const imageUrl = `https://imagedelivery.net/${CF_IMAGES_HASH}/${product.cf_image_id}/product`;

    process.stdout.write(`[${i + 1}/${products.length}] ${product.sku} - ${product.title.substring(0, 40)}... `);

    if (DRY_RUN) {
      console.log('SKIP (dry run)');
      skipped++;
      continue;
    }

    const result = await updateERPNextItem(product.erpnext_name, imageUrl, product.cf_image_id);

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

  console.log(`\n=== Summary ===`);
  console.log(`Total: ${products.length}`);
  console.log(`Success: ${success}`);
  console.log(`Failed: ${failed}`);
  if (DRY_RUN) console.log(`Skipped (dry run): ${skipped}`);
  console.log();
}

main().catch(console.error);
