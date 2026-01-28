/**
 * Verify SEO data matches between D1 and ERPNext
 * This script compares SEO fields in D1 with ERPNext for sample products
 *
 * Usage:
 *   bun scripts/verify-seo-sync.ts                    # Check 5 sample products
 *   bun scripts/verify-seo-sync.ts --count 10        # Check 10 products
 *   bun scripts/verify-seo-sync.ts --sku ABC-123     # Check specific SKU
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { execSync } from 'child_process';
import { D1_TO_ERPNEXT_FIELD_MAP } from './seo-custom-fields';

function loadEnv(): Record<string, string> {
  const envFile = resolve(process.cwd(), '.dev.vars');
  try {
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
  } catch {
    return {};
  }
}

const env = loadEnv();
const ERPNEXT_URL = env.ERPNEXT_URL;
const ERPNEXT_API_KEY = env.ERPNEXT_API_KEY;
const ERPNEXT_API_SECRET = env.ERPNEXT_API_SECRET;

// Parse command line arguments
const args = process.argv.slice(2);
const countArg = args.find(a => a.startsWith('--count'));
const count = countArg ? parseInt(countArg.split('=')[1] || args[args.indexOf('--count') + 1]) : 5;
const skuArg = args.find(a => a.startsWith('--sku'));
const singleSku = skuArg ? (skuArg.split('=')[1] || args[args.indexOf('--sku') + 1]) : undefined;

interface D1Product {
  sku: string;
  erpnext_name: string;
  [key: string]: string | null;
}

interface VerificationResult {
  sku: string;
  erpnext_name: string;
  d1_has_data: boolean;
  erpnext_has_data: boolean;
  matches: boolean;
  differences: Array<{
    field: string;
    d1_value: unknown;
    erpnext_value: unknown;
  }>;
  error?: string;
}

async function fetchD1Products(): Promise<D1Product[]> {
  const d1Fields = Object.keys(D1_TO_ERPNEXT_FIELD_MAP).join(', ');
  let query = `SELECT sku, erpnext_name, ${d1Fields} FROM storefront_products WHERE seo_title IS NOT NULL`;

  if (singleSku) {
    query += ` AND sku = '${singleSku.replace(/'/g, "''")}'`;
  }

  query += ` LIMIT ${count}`;

  try {
    const result = execSync(
      `npx wrangler d1 execute solampio-migration --remote --json --command '${query}'`,
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

async function fetchERPNextItem(itemCode: string): Promise<Record<string, unknown> | null> {
  if (!ERPNEXT_URL || !ERPNEXT_API_KEY || !ERPNEXT_API_SECRET) {
    return null;
  }

  const erpFields = Object.values(D1_TO_ERPNEXT_FIELD_MAP);
  const fieldsParam = JSON.stringify(erpFields);
  const url = `${ERPNEXT_URL}/api/resource/Item/${encodeURIComponent(itemCode)}?fields=${encodeURIComponent(fieldsParam)}`;

  const headers: HeadersInit = {
    Authorization: `token ${ERPNEXT_API_KEY}:${ERPNEXT_API_SECRET}`,
    'Content-Type': 'application/json',
  };

  try {
    const response = await fetch(url, { headers });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      console.error(`ERPNext API error for ${itemCode}: ${response.status}`);
      return null;
    }

    const data = await response.json() as { data: Record<string, unknown> };
    return data.data;
  } catch (error) {
    console.error(`Error fetching from ERPNext: ${error}`);
    return null;
  }
}

function compareProducts(d1: D1Product, erp: Record<string, unknown> | null): VerificationResult {
  const result: VerificationResult = {
    sku: d1.sku,
    erpnext_name: d1.erpnext_name,
    d1_has_data: true,
    erpnext_has_data: erp !== null,
    matches: true,
    differences: [],
  };

  if (!erp) {
    result.matches = false;
    result.error = 'ERPNext item not found or API unavailable';
    return result;
  }

  // Compare each field
  for (const [d1Field, erpField] of Object.entries(D1_TO_ERPNEXT_FIELD_MAP)) {
    const d1Value = d1[d1Field];
    const erpValue = erp[erpField];

    // Normalize values for comparison
    const normalizedD1 = d1Value === null || d1Value === undefined ? '' : String(d1Value);
    const normalizedErp = erpValue === null || erpValue === undefined ? '' : String(erpValue);

    if (normalizedD1 !== normalizedErp) {
      result.matches = false;
      result.differences.push({
        field: erpField,
        d1_value: d1Value,
        erpnext_value: erpValue,
      });
    }
  }

  return result;
}

async function main() {
  console.log('=== SEO Sync Verification ===\n');

  const hasERPNextCreds = ERPNEXT_URL && ERPNEXT_API_KEY && ERPNEXT_API_SECRET;
  if (!hasERPNextCreds) {
    console.log('⚠ ERPNext credentials not found in .dev.vars');
    console.log('  Will only show D1 data without ERPNext comparison\n');
    console.log('  To enable comparison, create .dev.vars with:');
    console.log('    ERPNEXT_URL=https://your-instance.erpnext.com');
    console.log('    ERPNEXT_API_KEY=your_api_key');
    console.log('    ERPNEXT_API_SECRET=your_api_secret\n');
  } else {
    console.log(`ERPNext: ${ERPNEXT_URL}\n`);
  }

  // Fetch D1 products
  console.log('Fetching products from D1...');
  const d1Products = await fetchD1Products();
  console.log(`Found ${d1Products.length} products\n`);

  if (d1Products.length === 0) {
    console.log('No products found in D1 with SEO data.');
    return;
  }

  const results: VerificationResult[] = [];

  for (const d1Product of d1Products) {
    console.log(`\n=== ${d1Product.sku} ===`);
    console.log(`ERPNext Name: ${d1Product.erpnext_name || 'N/A'}`);

    // Show D1 data
    console.log('\nD1 SEO Fields:');
    for (const [d1Field, erpField] of Object.entries(D1_TO_ERPNEXT_FIELD_MAP)) {
      const value = d1Product[d1Field];
      if (value) {
        const displayValue = typeof value === 'string' && value.length > 50
          ? value.slice(0, 50) + '...'
          : value;
        console.log(`  ${erpField}: ${displayValue}`);
      }
    }

    if (hasERPNextCreds && d1Product.erpnext_name) {
      // Fetch and compare with ERPNext
      const erpItem = await fetchERPNextItem(d1Product.erpnext_name);
      const comparison = compareProducts(d1Product, erpItem);
      results.push(comparison);

      if (comparison.matches) {
        console.log('\n✓ Data matches ERPNext');
      } else if (comparison.error) {
        console.log(`\n⚠ ${comparison.error}`);
      } else {
        console.log('\n✗ Differences found:');
        for (const diff of comparison.differences) {
          console.log(`  ${diff.field}:`);
          console.log(`    D1:      ${diff.d1_value || '(empty)'}`);
          console.log(`    ERPNext: ${diff.erpnext_value || '(empty)'}`);
        }
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    } else {
      results.push({
        sku: d1Product.sku,
        erpnext_name: d1Product.erpnext_name,
        d1_has_data: true,
        erpnext_has_data: false,
        matches: false,
        differences: [],
        error: hasERPNextCreds ? 'No ERPNext name' : 'ERPNext credentials not available',
      });
    }
  }

  // Summary
  console.log('\n\n=== Summary ===');
  const matching = results.filter(r => r.matches);
  const different = results.filter(r => !r.matches && r.erpnext_has_data);
  const unavailable = results.filter(r => !r.erpnext_has_data);

  console.log(`Total checked: ${results.length}`);
  console.log(`Matching: ${matching.length}`);
  console.log(`Different: ${different.length}`);
  console.log(`ERPNext unavailable: ${unavailable.length}`);

  // Save results
  const outputFile = resolve(process.cwd(), 'seo-verification-results.json');
  const output = {
    timestamp: new Date().toISOString(),
    erpnext_available: hasERPNextCreds,
    total: results.length,
    matching: matching.length,
    different: different.length,
    unavailable: unavailable.length,
    results,
  };
  writeFileSync(outputFile, JSON.stringify(output, null, 2));
  console.log(`\nResults saved to: ${outputFile}`);
}

main().catch(console.error);
