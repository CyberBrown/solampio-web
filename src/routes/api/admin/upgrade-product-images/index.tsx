/**
 * Product Image Upgrade API Endpoint
 *
 * Downloads high-resolution images from BigCommerce and uploads them to Cloudflare Images,
 * replacing the low-res images that were originally migrated.
 *
 * GET /api/admin/upgrade-product-images/
 * Returns a preview of products that need image upgrades
 *
 * POST /api/admin/upgrade-product-images/
 * Processes products and upgrades their images
 * Query params:
 *   - limit: number of products to process (default: 10)
 *   - offset: skip first N products (default: 0)
 *   - sku: process a specific SKU only
 *   - dry_run: if "true", only preview without uploading
 *
 * Requires environment variables:
 *   - CF_ACCOUNT_ID: Cloudflare account ID
 *   - CF_IMAGES_TOKEN: Cloudflare Images API token
 */

import type { RequestHandler } from '@builder.io/qwik-city';
import type { D1Database } from '@cloudflare/workers-types';

const BIGCOMMERCE_BASE = 'https://solampio.com';
const CF_IMAGES_HASH = 'Fdrr4r8cVWsy-JJCR0JU_Q';

interface Product {
  id: string;
  sku: string;
  title: string;
  cf_image_id: string | null;
}

interface UpgradeResult {
  sku: string;
  title: string;
  status: 'success' | 'skipped' | 'error';
  oldImageId: string | null;
  newImageId: string | null;
  originalDimensions?: string;
  newDimensions?: string;
  error?: string;
}

/**
 * Generate BigCommerce slug from product title
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}

/**
 * Fetch BigCommerce product page and extract high-res image URLs
 */
async function fetchBigCommerceImages(productSlug: string): Promise<string[]> {
  const url = `${BIGCOMMERCE_BASE}/${productSlug}/`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SolampImageUpgrader/1.0)',
      },
    });

    if (!response.ok) {
      return [];
    }

    const html = await response.text();

    // Extract image URLs from the page
    const foundUrls = new Set<string>();

    // Pattern 1: Standard BigCommerce CDN URLs
    const cdnPattern = /https:\/\/cdn\d+\.bigcommerce\.com\/s-[^\/]+\/images\/stencil\/\d+x\d+\/products\/[^"'\s<>]+\.(?:jpg|jpeg|png|webp)/gi;
    const cdnMatches = html.matchAll(cdnPattern);
    for (const match of cdnMatches) {
      let imageUrl = match[0];
      // Convert to 1280x1280 for highest quality
      imageUrl = imageUrl.replace(/\/stencil\/\d+x\d+\//, '/stencil/1280x1280/');
      foundUrls.add(imageUrl);
    }

    // Pattern 2: data-hires or data-zoom attributes
    const dataPattern = /data-(?:hires|zoom|full|src-zoom)=["']([^"']+)/gi;
    const dataMatches = html.matchAll(dataPattern);
    for (const match of dataMatches) {
      if (match[1] && match[1].includes('bigcommerce.com')) {
        foundUrls.add(match[1]);
      }
    }

    return Array.from(foundUrls);
  } catch {
    return [];
  }
}

/**
 * Download image and return as ArrayBuffer
 */
async function downloadImage(url: string): Promise<ArrayBuffer | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SolampImageUpgrader/1.0)',
      },
    });

    if (!response.ok) {
      return null;
    }

    return await response.arrayBuffer();
  } catch {
    return null;
  }
}

/**
 * Upload image to Cloudflare Images
 */
async function uploadToCloudflare(
  imageBuffer: ArrayBuffer,
  imageId: string,
  cfAccountId: string,
  cfToken: string,
  metadata: Record<string, string>
): Promise<{ id: string; success: boolean; error?: string }> {
  try {
    const formData = new FormData();
    formData.append('file', new Blob([imageBuffer]), `${imageId}.jpg`);
    formData.append('id', imageId);
    formData.append('metadata', JSON.stringify(metadata));

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/images/v1`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cfToken}`,
        },
        body: formData,
      }
    );

    const result = await response.json() as {
      success: boolean;
      result?: { id: string };
      errors?: Array<{ message: string; code: number }>;
    };

    if (result.success) {
      return { id: result.result?.id || imageId, success: true };
    }

    // Check if image already exists (error code 5409)
    const alreadyExists = result.errors?.some(
      e => e.message?.includes('already exists') || e.code === 5409
    );
    if (alreadyExists) {
      return { id: imageId, success: true };
    }

    return {
      id: imageId,
      success: false,
      error: result.errors?.map(e => e.message).join(', ') || 'Upload failed',
    };
  } catch (error) {
    return {
      id: imageId,
      success: false,
      error: error instanceof Error ? error.message : 'Upload error',
    };
  }
}

/**
 * Check if current CF image is low-resolution (needs upgrade)
 */
async function checkImageNeedsUpgrade(cfImageId: string): Promise<{ needsUpgrade: boolean; currentSize?: string }> {
  try {
    // Fetch the image with 'product' variant
    const url = `https://imagedelivery.net/${CF_IMAGES_HASH}/${cfImageId}/product`;
    const response = await fetch(url, { method: 'HEAD' });

    if (!response.ok) {
      return { needsUpgrade: true };
    }

    // Check content-length as a proxy for resolution
    // Low-res images typically have much smaller file sizes
    const contentLength = parseInt(response.headers.get('content-length') || '0', 10);

    // If image is less than 20KB, it's likely low-res (our sample was 9KB at 386x386)
    // High-res 1200x1200 images are typically 50KB+
    return {
      needsUpgrade: contentLength < 20000,
      currentSize: `${(contentLength / 1024).toFixed(1)}KB`,
    };
  } catch {
    return { needsUpgrade: true };
  }
}

/**
 * GET handler - Preview products needing upgrade
 */
export const onGet: RequestHandler = async ({ platform, json, url }) => {
  try {
    const db = platform.env?.DB as D1Database | undefined;
    if (!db) {
      json(500, { error: 'Database not configured' });
      return;
    }

    const limit = parseInt(url.searchParams.get('limit') || '20', 10);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);
    const targetSku = url.searchParams.get('sku');

    // Get products with CF images
    let query = `
      SELECT id, sku, title, cf_image_id
      FROM storefront_products
      WHERE cf_image_id IS NOT NULL AND is_visible = 1
    `;

    if (targetSku) {
      query += ` AND sku = ?`;
    }
    query += ` ORDER BY title ASC LIMIT ? OFFSET ?`;

    const params = targetSku ? [targetSku, limit, offset] : [limit, offset];
    const result = await db.prepare(query).bind(...params).all<Product>();
    const products = result.results || [];

    // Check which ones need upgrade
    const preview: Array<{
      sku: string;
      title: string;
      currentImageId: string | null;
      currentSize: string;
      needsUpgrade: boolean;
      bcSlug: string;
    }> = [];

    for (const product of products.slice(0, 10)) { // Only check first 10 for preview
      const check = product.cf_image_id
        ? await checkImageNeedsUpgrade(product.cf_image_id)
        : { needsUpgrade: true, currentSize: 'N/A' };

      preview.push({
        sku: product.sku,
        title: product.title,
        currentImageId: product.cf_image_id,
        currentSize: check.currentSize || 'N/A',
        needsUpgrade: check.needsUpgrade,
        bcSlug: generateSlug(product.title),
      });
    }

    // Count total
    const countResult = await db
      .prepare('SELECT COUNT(*) as count FROM storefront_products WHERE cf_image_id IS NOT NULL AND is_visible = 1')
      .first<{ count: number }>();

    json(200, {
      status: 'preview',
      message: 'Send POST request to upgrade images',
      totalProducts: countResult?.count || 0,
      showing: products.length,
      offset,
      preview,
      usage: {
        post: '/api/admin/upgrade-product-images/',
        params: {
          limit: 'Number of products to process (default: 10)',
          offset: 'Skip first N products (default: 0)',
          sku: 'Process specific SKU only',
          dry_run: 'Set to "true" for preview only',
        },
      },
    });
  } catch (error) {
    console.error('Preview error:', error);
    json(500, {
      error: 'Failed to generate preview',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * POST handler - Process and upgrade images
 */
export const onPost: RequestHandler = async ({ platform, json, url }) => {
  try {
    const db = platform.env?.DB as D1Database | undefined;
    const cfAccountId = platform.env?.CF_ACCOUNT_ID as string | undefined;
    const cfToken = platform.env?.CF_IMAGES_TOKEN as string | undefined;

    if (!db) {
      json(500, { error: 'Database not configured' });
      return;
    }

    const dryRun = url.searchParams.get('dry_run') === 'true';

    if (!dryRun && (!cfAccountId || !cfToken)) {
      json(500, {
        error: 'Cloudflare Images credentials not configured',
        message: 'Add CF_ACCOUNT_ID and CF_IMAGES_TOKEN to environment variables',
      });
      return;
    }

    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);
    const targetSku = url.searchParams.get('sku');

    // Get products
    let query = `
      SELECT id, sku, title, cf_image_id
      FROM storefront_products
      WHERE cf_image_id IS NOT NULL AND is_visible = 1
    `;

    if (targetSku) {
      query += ` AND sku = ?`;
    }
    query += ` ORDER BY title ASC LIMIT ? OFFSET ?`;

    const params = targetSku ? [targetSku, limit, offset] : [limit, offset];
    const result = await db.prepare(query).bind(...params).all<Product>();
    const products = result.results || [];

    const results: UpgradeResult[] = [];

    for (const product of products) {
      const upgradeResult: UpgradeResult = {
        sku: product.sku,
        title: product.title,
        status: 'skipped',
        oldImageId: product.cf_image_id,
        newImageId: null,
      };

      try {
        // Check if upgrade is needed
        const check = product.cf_image_id
          ? await checkImageNeedsUpgrade(product.cf_image_id)
          : { needsUpgrade: true };

        if (!check.needsUpgrade) {
          upgradeResult.status = 'skipped';
          upgradeResult.originalDimensions = check.currentSize;
          results.push(upgradeResult);
          continue;
        }

        // Find high-res image on BigCommerce
        const bcSlug = generateSlug(product.title);
        const bcImages = await fetchBigCommerceImages(bcSlug);

        if (bcImages.length === 0) {
          upgradeResult.status = 'error';
          upgradeResult.error = `No images found on BigCommerce (slug: ${bcSlug})`;
          results.push(upgradeResult);
          continue;
        }

        if (dryRun) {
          upgradeResult.status = 'skipped';
          upgradeResult.error = `[DRY RUN] Would download from: ${bcImages[0].substring(0, 80)}...`;
          results.push(upgradeResult);
          continue;
        }

        // Download the high-res image
        const imageBuffer = await downloadImage(bcImages[0]);
        if (!imageBuffer) {
          upgradeResult.status = 'error';
          upgradeResult.error = 'Failed to download image from BigCommerce';
          results.push(upgradeResult);
          continue;
        }

        // Generate new image ID
        const safeSku = product.sku.replace(/[^a-zA-Z0-9]/g, '-');
        const newImageId = `hires-${safeSku}-${Date.now().toString(36)}`;

        // Upload to Cloudflare
        const uploadResult = await uploadToCloudflare(
          imageBuffer,
          newImageId,
          cfAccountId!,
          cfToken!,
          {
            sku: product.sku,
            source: 'bigcommerce-upgrade',
            originalUrl: bcImages[0],
            upgraded: new Date().toISOString(),
          }
        );

        if (!uploadResult.success) {
          upgradeResult.status = 'error';
          upgradeResult.error = uploadResult.error;
          results.push(upgradeResult);
          continue;
        }

        // Update database
        await db
          .prepare(`
            UPDATE storefront_products
            SET cf_image_id = ?, updated_at = datetime('now')
            WHERE sku = ?
          `)
          .bind(uploadResult.id, product.sku)
          .run();

        // Also update the product_images table if it has this image
        await db
          .prepare(`
            UPDATE storefront_product_images
            SET cf_image_id = ?, image_url = ?, updated_at = datetime('now')
            WHERE product_id = ? AND sort_order = 0
          `)
          .bind(
            uploadResult.id,
            `https://imagedelivery.net/${CF_IMAGES_HASH}/${uploadResult.id}/product`,
            product.id
          )
          .run();

        upgradeResult.status = 'success';
        upgradeResult.newImageId = uploadResult.id;
        upgradeResult.newDimensions = `${(imageBuffer.byteLength / 1024).toFixed(0)}KB`;
        results.push(upgradeResult);

        // Rate limit: wait 300ms between uploads
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        upgradeResult.status = 'error';
        upgradeResult.error = error instanceof Error ? error.message : 'Unknown error';
        results.push(upgradeResult);
      }
    }

    // Summary
    const successful = results.filter(r => r.status === 'success').length;
    const skipped = results.filter(r => r.status === 'skipped').length;
    const failed = results.filter(r => r.status === 'error').length;

    json(200, {
      status: dryRun ? 'dry_run' : 'completed',
      summary: {
        processed: products.length,
        successful,
        skipped,
        failed,
      },
      results,
      nextOffset: offset + limit,
      continueWith: `POST /api/admin/upgrade-product-images/?limit=${limit}&offset=${offset + limit}`,
    });
  } catch (error) {
    console.error('Upgrade error:', error);
    json(500, {
      error: 'Failed to upgrade images',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
