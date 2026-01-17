/**
 * ERPNext Brand Sync Script
 *
 * Updates Brand records in ERPNext with Cloudflare Images URLs.
 *
 * Requires environment variables:
 * - ERPNEXT_URL: ERPNext site URL
 * - ERPNEXT_API_KEY: API key
 * - ERPNEXT_API_SECRET: API secret
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import 'dotenv/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ERPNext configuration
const ERPNEXT_URL = process.env.ERPNEXT_URL;
const ERPNEXT_API_KEY = process.env.ERPNEXT_API_KEY;
const ERPNEXT_API_SECRET = process.env.ERPNEXT_API_SECRET;

interface UploadResult {
  brand: string;
  fullId: string | null;
  fullUrl: string | null;
  thumbId: string | null;
  thumbUrl: string | null;
  greyId: string | null;
  greyUrl: string | null;
}

interface SourceResult {
  brand: string;
  slug: string;
  sourceUrl: string | null;
}

interface SyncResult {
  brand: string;
  erpnextName: string | null;
  updated: boolean;
  error?: string;
}

interface ERPNextBrand {
  name: string;
  brand: string;
}

interface ERPNextResponse<T> {
  data?: T;
  message?: T;
  exc?: string;
}

/**
 * Make authenticated request to ERPNext API
 */
async function erpnextRequest<T>(
  method: string,
  endpoint: string,
  body?: object
): Promise<T | null> {
  try {
    const url = `${ERPNEXT_URL}/api/${endpoint}`;
    const headers: HeadersInit = {
      Authorization: `token ${ERPNEXT_API_KEY}:${ERPNEXT_API_SECRET}`,
      'Content-Type': 'application/json',
    };

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = (await response.json()) as ERPNextResponse<T>;

    if (data.exc) {
      console.error(`ERPNext error: ${data.exc}`);
      return null;
    }

    return data.data || data.message || null;
  } catch (error) {
    console.error(`ERPNext request error:`, error);
    return null;
  }
}

/**
 * Get all brands from ERPNext
 */
async function getERPNextBrands(): Promise<ERPNextBrand[]> {
  const result = await erpnextRequest<ERPNextBrand[]>(
    'GET',
    'resource/Brand?fields=["name","brand"]&limit_page_length=0'
  );
  return result || [];
}

/**
 * Update brand record in ERPNext
 */
async function updateBrand(
  name: string,
  fields: {
    cf_logo_full_url?: string;
    cf_logo_thumb_url?: string;
    cf_logo_greyscale_url?: string;
    logo_source_url?: string;
  }
): Promise<boolean> {
  const result = await erpnextRequest<{ name: string }>(
    'PUT',
    `resource/Brand/${encodeURIComponent(name)}`,
    fields
  );
  return result !== null;
}

/**
 * Match upload result brand slug to ERPNext brand name
 */
function matchBrandName(slug: string, erpnextBrands: ERPNextBrand[]): string | null {
  // Normalize slug for comparison
  const normalized = slug.toLowerCase().replace(/-/g, ' ');

  for (const brand of erpnextBrands) {
    const brandNormalized = brand.brand.toLowerCase();
    if (brandNormalized === normalized) {
      return brand.name;
    }
    // Try with hyphens removed
    if (brandNormalized.replace(/\s+/g, '-') === slug.toLowerCase()) {
      return brand.name;
    }
    // Partial match for complex names
    if (brandNormalized.includes(normalized) || normalized.includes(brandNormalized)) {
      return brand.name;
    }
  }

  return null;
}

/**
 * Main execution
 */
async function main() {
  // Check credentials
  if (!ERPNEXT_URL || !ERPNEXT_API_KEY || !ERPNEXT_API_SECRET) {
    console.error(
      'Missing ERPNext credentials. Set ERPNEXT_URL, ERPNEXT_API_KEY, and ERPNEXT_API_SECRET.'
    );
    process.exit(1);
  }

  // Load upload results
  const uploadResultsPath = path.join(__dirname, 'upload-results.json');
  if (!fs.existsSync(uploadResultsPath)) {
    console.error('upload-results.json not found. Run upload-to-cf.ts first.');
    process.exit(1);
  }

  const uploadResults: UploadResult[] = JSON.parse(
    fs.readFileSync(uploadResultsPath, 'utf-8')
  );

  // Load source results for source URLs
  const sourceResultsPath = path.join(__dirname, 'source-results.json');
  let sourceResults: SourceResult[] = [];
  if (fs.existsSync(sourceResultsPath)) {
    sourceResults = JSON.parse(fs.readFileSync(sourceResultsPath, 'utf-8'));
  }

  console.log('Fetching brands from ERPNext...');
  const erpnextBrands = await getERPNextBrands();
  console.log(`Found ${erpnextBrands.length} brands in ERPNext\n`);

  if (erpnextBrands.length === 0) {
    console.error('No brands found in ERPNext. Check your credentials.');
    process.exit(1);
  }

  const results: SyncResult[] = [];

  for (const upload of uploadResults) {
    console.log(`Syncing: ${upload.brand}`);

    const result: SyncResult = {
      brand: upload.brand,
      erpnextName: null,
      updated: false,
    };

    // Find matching ERPNext brand
    const erpnextName = matchBrandName(upload.brand, erpnextBrands);

    if (!erpnextName) {
      result.error = 'No matching ERPNext brand found';
      console.log(`  No match in ERPNext`);
      results.push(result);
      continue;
    }

    result.erpnextName = erpnextName;

    // Get source URL
    const sourceInfo = sourceResults.find((s) => s.slug === upload.brand);

    // Prepare update fields
    const updateFields: {
      cf_logo_full_url?: string;
      cf_logo_thumb_url?: string;
      cf_logo_greyscale_url?: string;
      logo_source_url?: string;
    } = {};

    if (upload.fullUrl) updateFields.cf_logo_full_url = upload.fullUrl;
    if (upload.thumbUrl) updateFields.cf_logo_thumb_url = upload.thumbUrl;
    if (upload.greyUrl) updateFields.cf_logo_greyscale_url = upload.greyUrl;
    if (sourceInfo?.sourceUrl) updateFields.logo_source_url = sourceInfo.sourceUrl;

    if (Object.keys(updateFields).length === 0) {
      result.error = 'No URLs to update';
      console.log(`  No URLs to update`);
      results.push(result);
      continue;
    }

    // Update ERPNext record
    const updated = await updateBrand(erpnextName, updateFields);

    if (updated) {
      result.updated = true;
      console.log(`  Updated: ${erpnextName}`);
    } else {
      result.error = 'ERPNext update failed';
      console.log(`  Update failed`);
    }

    results.push(result);

    // Rate limit
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  // Save results
  fs.writeFileSync(
    path.join(__dirname, 'sync-results.json'),
    JSON.stringify(results, null, 2)
  );

  // Summary
  const updated = results.filter((r) => r.updated).length;
  const notMatched = results.filter((r) => !r.erpnextName).length;
  const failed = results.filter((r) => r.erpnextName && !r.updated).length;

  console.log('\n--- Summary ---');
  console.log(`Total processed: ${uploadResults.length}`);
  console.log(`Updated in ERPNext: ${updated}`);
  console.log(`No match found: ${notMatched}`);
  console.log(`Update failed: ${failed}`);
  console.log(`\nResults saved to: sync-results.json`);

  // Print unmatched brands for manual review
  if (notMatched > 0) {
    console.log('\nBrands not matched in ERPNext:');
    results
      .filter((r) => !r.erpnextName)
      .forEach((r) => console.log(`  - ${r.brand}`));
  }
}

main().catch(console.error);
