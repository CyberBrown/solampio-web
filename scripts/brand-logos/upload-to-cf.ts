/**
 * Cloudflare Images Upload Script
 *
 * Uploads processed logos to Cloudflare Images and saves the returned URLs.
 *
 * Requires environment variables:
 * - CF_ACCOUNT_ID: Cloudflare account ID
 * - CF_IMAGES_TOKEN: Cloudflare Images API token
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import 'dotenv/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROCESSED_DIR = path.join(__dirname, 'processed');

// Cloudflare Images configuration
const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID;
const CF_IMAGES_TOKEN = process.env.CF_IMAGES_TOKEN;
const CF_IMAGES_HASH = 'Fdrr4r8cVWsy-JJCR0JU_Q'; // Public delivery hash

interface UploadResult {
  brand: string;
  fullId: string | null;
  fullUrl: string | null;
  thumbId: string | null;
  thumbUrl: string | null;
  greyId: string | null;
  greyUrl: string | null;
  error?: string;
}

interface CFUploadResponse {
  success: boolean;
  errors: { message: string }[];
  result?: {
    id: string;
    variants: string[];
  };
}

/**
 * Upload a single image to Cloudflare Images
 */
async function uploadToCF(
  filePath: string,
  customId: string
): Promise<{ id: string; url: string } | null> {
  try {
    const formData = new FormData();
    const fileBuffer = fs.readFileSync(filePath);
    const blob = new Blob([fileBuffer], { type: 'image/png' });
    formData.append('file', blob, path.basename(filePath));
    formData.append('id', customId);

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/images/v1`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${CF_IMAGES_TOKEN}`,
        },
        body: formData,
      }
    );

    const data = (await response.json()) as CFUploadResponse;

    if (data.success && data.result) {
      const id = data.result.id;
      const url = `https://imagedelivery.net/${CF_IMAGES_HASH}/${id}/public`;
      return { id, url };
    }

    // Handle duplicate ID error - image already exists
    if (
      data.errors?.some((e) =>
        e.message?.includes('already exists') || e.message?.includes('duplicate')
      )
    ) {
      console.log(`  Image ${customId} already exists, using existing ID`);
      return {
        id: customId,
        url: `https://imagedelivery.net/${CF_IMAGES_HASH}/${customId}/public`,
      };
    }

    console.error(`  CF upload error:`, data.errors);
    return null;
  } catch (error) {
    console.error(`  Upload error:`, error);
    return null;
  }
}

/**
 * Main execution
 */
async function main() {
  // Check credentials
  if (!CF_ACCOUNT_ID || !CF_IMAGES_TOKEN) {
    console.error(
      'Missing CF_ACCOUNT_ID or CF_IMAGES_TOKEN environment variables.'
    );
    console.error('Create a .env file with these values.');
    process.exit(1);
  }

  // Check processed directory
  const fullDir = path.join(PROCESSED_DIR, 'full');
  const thumbDir = path.join(PROCESSED_DIR, 'thumb');
  const greyDir = path.join(PROCESSED_DIR, 'grey');

  if (!fs.existsSync(fullDir)) {
    console.error('Processed directory not found. Run process-logos.ts first.');
    process.exit(1);
  }

  // Get all processed files
  const files = fs.readdirSync(fullDir).filter((f) => f.endsWith('.png'));

  if (files.length === 0) {
    console.error('No processed logos found.');
    process.exit(1);
  }

  console.log(`Uploading ${files.length} brand logos to Cloudflare Images...\n`);

  const results: UploadResult[] = [];

  for (const file of files) {
    const brand = path.basename(file, '.png');
    console.log(`Uploading: ${brand}`);

    const result: UploadResult = {
      brand,
      fullId: null,
      fullUrl: null,
      thumbId: null,
      thumbUrl: null,
      greyId: null,
      greyUrl: null,
    };

    try {
      // Upload full color version
      const fullPath = path.join(fullDir, file);
      if (fs.existsSync(fullPath)) {
        const fullResult = await uploadToCF(fullPath, `brand-${brand}-full`);
        if (fullResult) {
          result.fullId = fullResult.id;
          result.fullUrl = fullResult.url;
          console.log(`  Full: ${fullResult.id}`);
        }
      }

      // Upload thumbnail version
      const thumbPath = path.join(thumbDir, file);
      if (fs.existsSync(thumbPath)) {
        const thumbResult = await uploadToCF(thumbPath, `brand-${brand}-thumb`);
        if (thumbResult) {
          result.thumbId = thumbResult.id;
          result.thumbUrl = thumbResult.url;
          console.log(`  Thumb: ${thumbResult.id}`);
        }
      }

      // Upload greyscale version
      const greyPath = path.join(greyDir, file);
      if (fs.existsSync(greyPath)) {
        const greyResult = await uploadToCF(greyPath, `brand-${brand}-grey`);
        if (greyResult) {
          result.greyId = greyResult.id;
          result.greyUrl = greyResult.url;
          console.log(`  Grey: ${greyResult.id}`);
        }
      }
    } catch (error) {
      result.error = error instanceof Error ? error.message : String(error);
      console.error(`  Error: ${result.error}`);
    }

    results.push(result);

    // Rate limit
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  // Save results
  fs.writeFileSync(
    path.join(__dirname, 'upload-results.json'),
    JSON.stringify(results, null, 2)
  );

  // Summary
  const successful = results.filter(
    (r) => r.fullId && r.thumbId && r.greyId
  ).length;
  const partial = results.filter(
    (r) => (r.fullId || r.thumbId || r.greyId) && !(r.fullId && r.thumbId && r.greyId)
  ).length;
  const failed = results.filter(
    (r) => !r.fullId && !r.thumbId && !r.greyId
  ).length;

  console.log('\n--- Summary ---');
  console.log(`Total: ${files.length}`);
  console.log(`Fully uploaded: ${successful}`);
  console.log(`Partially uploaded: ${partial}`);
  console.log(`Failed: ${failed}`);
  console.log(`\nResults saved to: upload-results.json`);
}

main().catch(console.error);
