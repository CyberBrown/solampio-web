/**
 * Upgrade Product Images Script
 *
 * Downloads high-resolution images from BigCommerce and uploads them to Cloudflare Images.
 *
 * Prerequisites:
 * 1. Add to .dev.vars:
 *    CF_ACCOUNT_ID=your_account_id
 *    CF_IMAGES_API_TOKEN=your_api_token
 *
 * Usage:
 *   npx tsx scripts/upgrade-product-images.ts [--dry-run] [--limit=10] [--sku=SKU]
 *
 * The script will:
 * 1. Fetch product list from the live BigCommerce site
 * 2. Extract high-res image URLs (1280x1280)
 * 3. Download and upload to Cloudflare Images
 * 4. Output SQL to update the D1 database
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';

// Load environment from .dev.vars file
function loadEnv(): Record<string, string> {
  const envFile = resolve(process.cwd(), '.dev.vars');
  const content = readFileSync(envFile, 'utf-8');
  const env: Record<string, string> = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx > 0) {
        const key = trimmed.substring(0, eqIdx);
        const value = trimmed.substring(eqIdx + 1);
        env[key] = value;
      }
    }
  }
  return env;
}

const env = loadEnv();
const CF_ACCOUNT_ID = env.CF_ACCOUNT_ID;
const CF_IMAGES_API_TOKEN = env.CF_IMAGES_API_TOKEN;

const BIGCOMMERCE_BASE = 'https://solampio.com';
const CF_IMAGES_HASH = 'Fdrr4r8cVWsy-JJCR0JU_Q';

interface ProductImageInfo {
  sku: string;
  title: string;
  bcUrl: string;
  highResImages: string[];
}

interface UploadResult {
  sku: string;
  oldCfImageId: string | null;
  newCfImageId: string;
  originalUrl: string;
}

// Parse command line arguments
function parseArgs(): { dryRun: boolean; limit: number; sku: string | null } {
  const args = process.argv.slice(2);
  let dryRun = false;
  let limit = 0; // 0 means no limit
  let sku: string | null = null;

  for (const arg of args) {
    if (arg === '--dry-run') {
      dryRun = true;
    } else if (arg.startsWith('--limit=')) {
      limit = parseInt(arg.split('=')[1], 10);
    } else if (arg.startsWith('--sku=')) {
      sku = arg.split('=')[1];
    }
  }

  return { dryRun, limit, sku };
}

// Fetch a BigCommerce product page and extract high-res image URLs
async function fetchBigCommerceImages(productSlug: string): Promise<string[]> {
  const url = `${BIGCOMMERCE_BASE}/${productSlug}/`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ImageUpgrader/1.0)',
      },
    });

    if (!response.ok) {
      console.error(`  Failed to fetch ${url}: ${response.status}`);
      return [];
    }

    const html = await response.text();

    // Extract image URLs from the page
    // BigCommerce uses various patterns for product images
    const imagePatterns = [
      // Standard BigCommerce CDN pattern - capture the full URL with any size
      /https:\/\/cdn\d+\.bigcommerce\.com\/s-[^\/]+\/images\/stencil\/\d+x\d+\/products\/[^"'\s]+/g,
      // Product gallery data
      /"original":"(https:\/\/cdn\d+\.bigcommerce\.com[^"]+)"/g,
      // data-src patterns
      /data-src="(https:\/\/cdn\d+\.bigcommerce\.com\/[^"]+)"/g,
    ];

    const foundUrls = new Set<string>();

    for (const pattern of imagePatterns) {
      const matches = html.matchAll(pattern);
      for (const match of matches) {
        // Get the URL (might be in capture group 1 or the full match)
        let imageUrl = match[1] || match[0];

        // Convert to highest resolution (1280x1280 or original)
        // Replace any size specification with 1280x1280
        imageUrl = imageUrl.replace(/\/stencil\/\d+x\d+\//, '/stencil/1280x1280/');

        // Skip thumbnails and very small images
        if (!imageUrl.includes('/stencil/50x') &&
            !imageUrl.includes('/stencil/100x') &&
            !imageUrl.includes('/stencil/150x')) {
          foundUrls.add(imageUrl);
        }
      }
    }

    return Array.from(foundUrls);
  } catch (error) {
    console.error(`  Error fetching ${url}:`, error);
    return [];
  }
}

// Generate BigCommerce slug from product title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}

// Download an image and return as buffer
async function downloadImage(url: string): Promise<Buffer | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ImageUpgrader/1.0)',
      },
    });

    if (!response.ok) {
      console.error(`  Failed to download ${url}: ${response.status}`);
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error(`  Error downloading ${url}:`, error);
    return null;
  }
}

// Upload image to Cloudflare Images
async function uploadToCloudflare(
  imageBuffer: Buffer,
  imageId: string,
  metadata: Record<string, string>
): Promise<string | null> {
  if (!CF_ACCOUNT_ID || !CF_IMAGES_API_TOKEN) {
    console.error('  Missing CF_ACCOUNT_ID or CF_IMAGES_API_TOKEN');
    return null;
  }

  const formData = new FormData();
  formData.append('file', new Blob([imageBuffer]), `${imageId}.jpg`);
  formData.append('id', imageId);
  formData.append('metadata', JSON.stringify(metadata));

  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/images/v1`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CF_IMAGES_API_TOKEN}`,
        },
        body: formData,
      }
    );

    const result = await response.json() as {
      success: boolean;
      result?: { id: string };
      errors?: Array<{ message: string }>;
    };

    if (!result.success) {
      // Check if image already exists
      if (result.errors?.some(e => e.message.includes('already exists'))) {
        console.log(`  Image ${imageId} already exists, skipping upload`);
        return imageId;
      }
      console.error(`  CF upload failed:`, result.errors);
      return null;
    }

    return result.result?.id || null;
  } catch (error) {
    console.error(`  Error uploading to CF:`, error);
    return null;
  }
}

// Main function
async function main() {
  const { dryRun, limit, sku: targetSku } = parseArgs();

  console.log('=== Product Image Upgrade Script ===');
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`);
  if (limit) console.log(`Limit: ${limit} products`);
  if (targetSku) console.log(`Target SKU: ${targetSku}`);
  console.log('');

  if (!dryRun && (!CF_ACCOUNT_ID || !CF_IMAGES_API_TOKEN)) {
    console.error('ERROR: Missing Cloudflare credentials.');
    console.error('Add to .dev.vars:');
    console.error('  CF_ACCOUNT_ID=your_account_id');
    console.error('  CF_IMAGES_API_TOKEN=your_api_token');
    console.error('');
    console.error('Or run with --dry-run to test without uploading.');
    process.exit(1);
  }

  // Create output directory
  const outputDir = resolve(process.cwd(), 'tmp/image-upgrade');
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  // For now, we'll work with a product list
  // In production, you'd fetch this from D1 or a product export
  const testProducts = [
    { sku: 'CWT410WP', title: '410w Bifacial Perc Monocrystalline Solar Panel from CW Energy' },
    { sku: 'CWT545WP', title: '545w 550w Bifacial Perc Monocrystalline Solar Panel from CW Energy' },
    { sku: 'CWT550WP', title: '545w 550w Bifacial Perc Monocrystalline Solar Panel from CW Energy' },
  ];

  // If targeting a specific SKU, filter the list
  let products = targetSku
    ? testProducts.filter(p => p.sku === targetSku)
    : testProducts;

  if (limit && limit > 0) {
    products = products.slice(0, limit);
  }

  console.log(`Processing ${products.length} products...\n`);

  const results: UploadResult[] = [];
  const sqlStatements: string[] = [];

  for (const product of products) {
    console.log(`\n[${product.sku}] ${product.title}`);

    // Generate the BigCommerce slug
    const bcSlug = generateSlug(product.title);
    console.log(`  BigCommerce slug: ${bcSlug}`);

    // Fetch high-res images from BigCommerce
    const highResImages = await fetchBigCommerceImages(bcSlug);
    console.log(`  Found ${highResImages.length} high-res images`);

    if (highResImages.length === 0) {
      console.log(`  Skipping - no images found`);
      continue;
    }

    // Take the first image as the primary
    const primaryImageUrl = highResImages[0];
    console.log(`  Primary image: ${primaryImageUrl.substring(0, 80)}...`);

    if (dryRun) {
      console.log(`  [DRY RUN] Would download and upload this image`);
      continue;
    }

    // Download the image
    console.log(`  Downloading...`);
    const imageBuffer = await downloadImage(primaryImageUrl);
    if (!imageBuffer) {
      console.log(`  Failed to download, skipping`);
      continue;
    }
    console.log(`  Downloaded ${imageBuffer.length} bytes`);

    // Generate new CF image ID
    const newImageId = `hires-${product.sku.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now().toString(36)}`;

    // Upload to Cloudflare
    console.log(`  Uploading to Cloudflare as ${newImageId}...`);
    const uploadedId = await uploadToCloudflare(imageBuffer, newImageId, {
      sku: product.sku,
      source: 'bigcommerce-upgrade',
      originalUrl: primaryImageUrl,
    });

    if (uploadedId) {
      console.log(`  Uploaded successfully: ${uploadedId}`);
      results.push({
        sku: product.sku,
        oldCfImageId: null,
        newCfImageId: uploadedId,
        originalUrl: primaryImageUrl,
      });

      // Generate SQL update
      sqlStatements.push(`
UPDATE storefront_products
SET cf_image_id = '${uploadedId}', updated_at = datetime('now')
WHERE sku = '${product.sku}';`);
    }

    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 500));
  }

  // Write results
  if (results.length > 0) {
    console.log(`\n\n=== Results ===`);
    console.log(`Successfully processed ${results.length} images`);

    // Write SQL file
    const sqlPath = resolve(outputDir, 'update-images.sql');
    writeFileSync(sqlPath, sqlStatements.join('\n'));
    console.log(`\nSQL written to: ${sqlPath}`);
    console.log(`Run: npx wrangler d1 execute solampio-migration --remote --file=${sqlPath}`);

    // Write JSON results
    const jsonPath = resolve(outputDir, 'results.json');
    writeFileSync(jsonPath, JSON.stringify(results, null, 2));
    console.log(`Results JSON: ${jsonPath}`);
  }

  console.log('\nDone!');
}

main().catch(console.error);
