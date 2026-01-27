/**
 * Product Image Upgrade API Endpoint
 *
 * Downloads the HIGHEST RESOLUTION images available from BigCommerce and uploads
 * them to Cloudflare Images. Also syncs image URLs to ERPNext when requested.
 *
 * Resolution priority: original > 2048x2048 > 1280x1280 > 800x800 > 500x500
 *
 * GET /api/admin/upgrade-product-images/
 * Returns a preview of products that need image upgrades
 * Query params:
 *   - only_missing: if "true", only show products without CF images
 *
 * POST /api/admin/upgrade-product-images/
 * Processes products and upgrades their images
 * Query params:
 *   - limit: number of products to process (default: 10)
 *   - offset: skip first N products (default: 0)
 *   - sku: process a specific SKU only
 *   - only_missing: if "true", only process products WITHOUT CF images
 *   - sync_erpnext: if "true", also update website_image in ERPNext
 *   - dry_run: if "true", only preview without uploading
 *
 * Requires environment variables:
 *   - CF_ACCOUNT_ID: Cloudflare account ID
 *   - CF_IMAGES_TOKEN: Cloudflare Images API token
 * Optional (for ERPNext sync):
 *   - ERPNEXT_URL: ERPNext instance URL
 *   - ERPNEXT_API_KEY: ERPNext API key
 *   - ERPNEXT_API_SECRET: ERPNext API secret
 */

import type { RequestHandler } from '@builder.io/qwik-city';
import type { D1Database } from '@cloudflare/workers-types';
import { rejectUnauthorized } from '~/lib/api-auth';

const BIGCOMMERCE_BASE = 'https://solampio.com';
const CF_IMAGES_HASH = 'Fdrr4r8cVWsy-JJCR0JU_Q';

// Image resolution options in order of preference (highest first)
const BC_RESOLUTIONS = ['original', '2048x2048', '1280x1280', '800x800', '500x500'];

interface Product {
  id: string;
  sku: string;
  title: string;
  cf_image_id: string | null;
  erpnext_name: string | null;
}

interface UpgradeResult {
  sku: string;
  title: string;
  status: 'success' | 'skipped' | 'error';
  oldImageId: string | null;
  newImageId: string | null;
  originalDimensions?: string;
  newDimensions?: string;
  resolution?: string;
  erpnextSynced?: boolean;
  error?: string;
}

interface ERPNextEnv {
  ERPNEXT_URL?: string;
  ERPNEXT_API_KEY?: string;
  ERPNEXT_API_SECRET?: string;
}

/**
 * Sync image URL to ERPNext Item doctype
 */
async function syncImageToERPNext(
  erpnextName: string,
  imageUrl: string,
  env: ERPNextEnv
): Promise<{ success: boolean; error?: string }> {
  if (!env.ERPNEXT_URL || !env.ERPNEXT_API_KEY || !env.ERPNEXT_API_SECRET) {
    return { success: false, error: 'ERPNext credentials not configured' };
  }

  try {
    const response = await fetch(
      `${env.ERPNEXT_URL}/api/resource/Item/${encodeURIComponent(erpnextName)}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${env.ERPNEXT_API_KEY}:${env.ERPNEXT_API_SECRET}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          website_image: imageUrl,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: `HTTP ${response.status}: ${errorText.substring(0, 200)}` };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'ERPNext sync error',
    };
  }
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
 * Try to fetch an image at a specific resolution and verify it exists
 */
async function tryImageUrl(url: string): Promise<{ url: string; size: number } | null> {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SolampImageUpgrader/1.0)',
      },
    });
    if (response.ok) {
      const contentLength = parseInt(response.headers.get('content-length') || '0', 10);
      return { url, size: contentLength };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Fetch BigCommerce product page and extract the highest resolution image URL
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

    // Extract base image URLs from the page (we'll modify resolution)
    const baseUrls = new Set<string>();

    // Pattern 1: Standard BigCommerce CDN URLs - extract the base pattern
    const cdnPattern = /https:\/\/cdn\d+\.bigcommerce\.com\/s-[^\/]+\/images\/stencil\/\d+x\d+\/products\/[^"'\s<>]+\.(?:jpg|jpeg|png|webp)/gi;
    const cdnMatches = html.matchAll(cdnPattern);
    for (const match of cdnMatches) {
      // Store the base URL pattern (we'll replace resolution later)
      baseUrls.add(match[0]);
    }

    // Pattern 2: data-hires or data-zoom attributes (these are usually already high-res)
    const dataPattern = /data-(?:hires|zoom|full|src-zoom)=["']([^"']+)/gi;
    const dataMatches = html.matchAll(dataPattern);
    for (const match of dataMatches) {
      if (match[1] && match[1].includes('bigcommerce.com')) {
        baseUrls.add(match[1]);
      }
    }

    if (baseUrls.size === 0) {
      return [];
    }

    // For each found URL, try to get the highest resolution version
    const highResUrls: string[] = [];

    for (const baseUrl of baseUrls) {
      // Try each resolution in order of preference (highest first)
      for (const resolution of BC_RESOLUTIONS) {
        const testUrl = baseUrl.replace(/\/stencil\/\d+x\d+\//, `/stencil/${resolution}/`);
        const result = await tryImageUrl(testUrl);
        if (result && result.size > 5000) { // Must be at least 5KB to be a real image
          highResUrls.push(result.url);
          break; // Got the highest available resolution
        }
      }
      // Only process first image for main product image
      if (highResUrls.length > 0) break;
    }

    return highResUrls;
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
export const onGet: RequestHandler = async (requestEvent) => {
  if (rejectUnauthorized(requestEvent, 'ADMIN_API_KEY')) return;

  const { platform, json, url } = requestEvent;
  try {
    const db = platform.env?.DB as D1Database | undefined;
    if (!db) {
      json(500, { error: 'Database not configured' });
      return;
    }

    const limit = parseInt(url.searchParams.get('limit') || '20', 10);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);
    const targetSku = url.searchParams.get('sku');
    const onlyMissing = url.searchParams.get('only_missing') === 'true';

    // Get products - include products with OR without CF images
    let query = `
      SELECT id, sku, title, cf_image_id, erpnext_name
      FROM storefront_products
      WHERE is_visible = 1
    `;

    if (onlyMissing) {
      query += ` AND cf_image_id IS NULL`;
    }

    if (targetSku) {
      query += ` AND sku = ?`;
    }
    query += ` ORDER BY cf_image_id IS NULL DESC, title ASC LIMIT ? OFFSET ?`;

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

    // Count totals
    const countTotal = await db
      .prepare('SELECT COUNT(*) as count FROM storefront_products WHERE is_visible = 1')
      .first<{ count: number }>();
    const countMissing = await db
      .prepare('SELECT COUNT(*) as count FROM storefront_products WHERE is_visible = 1 AND cf_image_id IS NULL')
      .first<{ count: number }>();
    const countHasImage = await db
      .prepare('SELECT COUNT(*) as count FROM storefront_products WHERE is_visible = 1 AND cf_image_id IS NOT NULL')
      .first<{ count: number }>();

    json(200, {
      status: 'preview',
      message: 'Send POST request to upgrade images',
      counts: {
        total: countTotal?.count || 0,
        withImages: countHasImage?.count || 0,
        missingImages: countMissing?.count || 0,
      },
      showing: products.length,
      offset,
      preview,
      usage: {
        post: '/api/admin/upgrade-product-images/',
        params: {
          limit: 'Number of products to process (default: 10)',
          offset: 'Skip first N products (default: 0)',
          sku: 'Process specific SKU only',
          only_missing: 'Set to "true" to only process products WITHOUT images',
          sync_erpnext: 'Set to "true" to also update image URL in ERPNext',
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
export const onPost: RequestHandler = async (requestEvent) => {
  if (rejectUnauthorized(requestEvent, 'ADMIN_API_KEY')) return;

  const { platform, json, url } = requestEvent;
  try {
    const db = platform.env?.DB as D1Database | undefined;
    const cfAccountId = platform.env?.CF_ACCOUNT_ID as string | undefined;
    const cfToken = platform.env?.CF_IMAGES_TOKEN as string | undefined;
    const erpnextEnv: ERPNextEnv = {
      ERPNEXT_URL: platform.env?.ERPNEXT_URL as string | undefined,
      ERPNEXT_API_KEY: platform.env?.ERPNEXT_API_KEY as string | undefined,
      ERPNEXT_API_SECRET: platform.env?.ERPNEXT_API_SECRET as string | undefined,
    };

    if (!db) {
      json(500, { error: 'Database not configured' });
      return;
    }

    const dryRun = url.searchParams.get('dry_run') === 'true';
    const syncErpnext = url.searchParams.get('sync_erpnext') === 'true';
    const onlyMissing = url.searchParams.get('only_missing') === 'true';

    if (!dryRun && (!cfAccountId || !cfToken)) {
      json(500, {
        error: 'Cloudflare Images credentials not configured',
        message: 'Add CF_ACCOUNT_ID and CF_IMAGES_TOKEN to environment variables',
      });
      return;
    }

    if (syncErpnext && !erpnextEnv.ERPNEXT_URL) {
      json(500, {
        error: 'ERPNext credentials not configured',
        message: 'Add ERPNEXT_URL, ERPNEXT_API_KEY, and ERPNEXT_API_SECRET to environment variables',
      });
      return;
    }

    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);
    const targetSku = url.searchParams.get('sku');

    // Get products - include those without cf_image_id
    let query = `
      SELECT id, sku, title, cf_image_id, erpnext_name
      FROM storefront_products
      WHERE is_visible = 1
    `;

    if (onlyMissing) {
      query += ` AND cf_image_id IS NULL`;
    }

    if (targetSku) {
      query += ` AND sku = ?`;
    }
    // Process products without images first
    query += ` ORDER BY cf_image_id IS NULL DESC, title ASC LIMIT ? OFFSET ?`;

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
        // Check if upgrade is needed (products without cf_image_id always need upgrade)
        const check = product.cf_image_id
          ? await checkImageNeedsUpgrade(product.cf_image_id)
          : { needsUpgrade: true, currentSize: 'N/A' };

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

        // Extract resolution from URL for logging
        const resolutionMatch = bcImages[0].match(/\/stencil\/(\w+)\//);
        upgradeResult.resolution = resolutionMatch ? resolutionMatch[1] : 'unknown';

        if (dryRun) {
          upgradeResult.status = 'skipped';
          upgradeResult.error = `[DRY RUN] Would download ${upgradeResult.resolution} from: ${bcImages[0].substring(0, 80)}...`;
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
            resolution: upgradeResult.resolution || 'unknown',
            upgraded: new Date().toISOString(),
          }
        );

        if (!uploadResult.success) {
          upgradeResult.status = 'error';
          upgradeResult.error = uploadResult.error;
          results.push(upgradeResult);
          continue;
        }

        // Generate the CF Images URL for this image
        const cfImageUrl = `https://imagedelivery.net/${CF_IMAGES_HASH}/${uploadResult.id}/product`;

        // Update database
        await db
          .prepare(`
            UPDATE storefront_products
            SET cf_image_id = ?, image_url = ?, updated_at = datetime('now')
            WHERE sku = ?
          `)
          .bind(uploadResult.id, cfImageUrl, product.sku)
          .run();

        // Also update the product_images table if it has this image
        await db
          .prepare(`
            UPDATE storefront_product_images
            SET cf_image_id = ?, image_url = ?, updated_at = datetime('now')
            WHERE product_id = ? AND sort_order = 0
          `)
          .bind(uploadResult.id, cfImageUrl, product.id)
          .run();

        // Sync to ERPNext if requested and product has erpnext_name
        if (syncErpnext && product.erpnext_name) {
          const erpnextResult = await syncImageToERPNext(
            product.erpnext_name,
            cfImageUrl,
            erpnextEnv
          );
          upgradeResult.erpnextSynced = erpnextResult.success;
          if (!erpnextResult.success) {
            // Log but don't fail the whole operation
            console.warn(`ERPNext sync failed for ${product.sku}: ${erpnextResult.error}`);
          }
        }

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
    const erpnextSynced = results.filter(r => r.erpnextSynced === true).length;

    json(200, {
      status: dryRun ? 'dry_run' : 'completed',
      summary: {
        processed: products.length,
        successful,
        skipped,
        failed,
        erpnextSynced: syncErpnext ? erpnextSynced : undefined,
      },
      results,
      nextOffset: offset + limit,
      continueWith: `POST /api/admin/upgrade-product-images/?limit=${limit}&offset=${offset + limit}${onlyMissing ? '&only_missing=true' : ''}${syncErpnext ? '&sync_erpnext=true' : ''}`,
    });
  } catch (error) {
    console.error('Upgrade error:', error);
    json(500, {
      error: 'Failed to upgrade images',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
