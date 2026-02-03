/**
 * Yotpo Review Ratings Import Script
 *
 * Fetches aggregate rating data from Yotpo and imports it into the D1 database.
 * Maps Yotpo product IDs to our SKUs by matching product names.
 *
 * Usage:
 *   npx tsx scripts/import-yotpo-ratings.ts           # Dry run (preview only)
 *   npx tsx scripts/import-yotpo-ratings.ts --apply   # Apply to local database
 *   npx tsx scripts/import-yotpo-ratings.ts --remote  # Apply to production database
 */

import { execSync } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const YOTPO_APP_KEY = 'M35aoZ9D23uxH1pf15D3t2IcadgWE5FxOeVHMPfN';
const DB_NAME = 'solampio-migration';

interface YotpoBottomLine {
  domain_key: string;
  product_score: number;
  total_reviews: number;
}

interface YotpoProductInfo {
  name: string;
  description: string | null;
  product_link: string;
}

interface ProductMapping {
  yotpo_id: string;
  yotpo_name: string;
  rating: number;
  review_count: number;
  our_sku: string | null;
  our_title: string | null;
}

function runD1Command(command: string, remote: boolean): string {
  const remoteFlag = remote ? '--remote' : '--local';
  const fullCommand = `npx wrangler d1 execute ${DB_NAME} ${remoteFlag} --command "${command.replace(/"/g, '\\"')}"`;

  try {
    const result = execSync(fullCommand, {
      encoding: 'utf-8',
      cwd: resolve(__dirname, '..'),
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return result;
  } catch (error: any) {
    console.error('D1 command failed:', error.message);
    throw error;
  }
}

function parseD1Output(output: string): any[] {
  try {
    const jsonMatch = output.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed[0]?.results || [];
    }
    return [];
  } catch {
    return [];
  }
}

async function fetchYotpoBottomLines(): Promise<YotpoBottomLine[]> {
  const allBottomLines: YotpoBottomLine[] = [];
  let page = 1;

  while (true) {
    const response = await fetch(
      `https://api.yotpo.com/v1/apps/${YOTPO_APP_KEY}/bottom_lines?page=${page}`
    );
    const data = await response.json() as any;
    const bottomlines = data.response?.bottomlines || [];

    if (bottomlines.length === 0) break;

    allBottomLines.push(...bottomlines);
    page++;
  }

  return allBottomLines;
}

async function fetchYotpoProductName(domainKey: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://api-cdn.yotpo.com/v1/widget/${YOTPO_APP_KEY}/products/${domainKey}/reviews.json`
    );
    const data = await response.json() as any;
    return data.response?.products?.[0]?.name || null;
  } catch {
    return null;
  }
}

async function findMatchingProduct(
  productName: string,
  remote: boolean
): Promise<{ sku: string; title: string } | null> {
  // Search by exact title match first
  const exactQuery = `SELECT sku, title FROM storefront_products WHERE title = '${productName.replace(/'/g, "''")}' AND is_visible = 1 LIMIT 1`;
  const exactResult = runD1Command(exactQuery, remote);
  const exactMatches = parseD1Output(exactResult);

  if (exactMatches.length > 0) {
    return { sku: exactMatches[0].sku, title: exactMatches[0].title };
  }

  // Search by LIKE match (for partial matches)
  const likeQuery = `SELECT sku, title FROM storefront_products WHERE title LIKE '%${productName.replace(/'/g, "''").substring(0, 30)}%' AND is_visible = 1 LIMIT 1`;
  const likeResult = runD1Command(likeQuery, remote);
  const likeMatches = parseD1Output(likeResult);

  if (likeMatches.length > 0) {
    return { sku: likeMatches[0].sku, title: likeMatches[0].title };
  }

  return null;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const apply = args.includes('--apply') || args.includes('--remote');
  const remote = args.includes('--remote');

  console.log('\n📊 Yotpo Review Ratings Import\n');
  console.log(`Mode: ${apply ? (remote ? 'PRODUCTION' : 'LOCAL') : 'DRY RUN (preview only)'}`);
  console.log('─'.repeat(60));

  // Fetch bottom line data from Yotpo
  console.log('\nFetching review data from Yotpo...');
  const bottomLines = await fetchYotpoBottomLines();
  console.log(`Found ${bottomLines.length} products with reviews\n`);

  // Build mapping
  const mappings: ProductMapping[] = [];

  for (const bl of bottomLines) {
    console.log(`Processing Yotpo ID: ${bl.domain_key}...`);

    // Get product name from Yotpo
    const yotpoName = await fetchYotpoProductName(bl.domain_key);
    if (!yotpoName) {
      console.log(`  ⚠️  Could not fetch product name`);
      continue;
    }

    // Find matching product in our database
    const match = await findMatchingProduct(yotpoName, remote);

    mappings.push({
      yotpo_id: bl.domain_key,
      yotpo_name: yotpoName,
      rating: bl.product_score,
      review_count: bl.total_reviews,
      our_sku: match?.sku || null,
      our_title: match?.title || null,
    });

    if (match) {
      console.log(`  ✓ Matched: ${match.sku} (${match.title})`);
    } else {
      console.log(`  ✗ No match found for: "${yotpoName}"`);
    }
  }

  // Summary
  console.log('\n' + '─'.repeat(60));
  console.log('\nMapping Summary:\n');

  const matched = mappings.filter(m => m.our_sku);
  const unmatched = mappings.filter(m => !m.our_sku);

  console.log(`✓ Matched: ${matched.length} products`);
  console.log(`✗ Unmatched: ${unmatched.length} products\n`);

  if (matched.length > 0) {
    console.log('Products to update:');
    console.log('─'.repeat(60));
    for (const m of matched) {
      console.log(`  ${m.our_sku}: ${m.rating}★ (${m.review_count} reviews)`);
    }
  }

  if (unmatched.length > 0) {
    console.log('\nUnmatched products (may be discontinued):');
    console.log('─'.repeat(60));
    for (const m of unmatched) {
      console.log(`  Yotpo "${m.yotpo_name}": ${m.rating}★ (${m.review_count} reviews)`);
    }
  }

  // Apply updates if not dry run
  if (apply && matched.length > 0) {
    console.log('\n' + '─'.repeat(60));
    console.log('\nApplying updates to database...\n');

    for (const m of matched) {
      const updateQuery = `UPDATE storefront_products SET rating_value = ${m.rating}, rating_count = ${m.review_count} WHERE sku = '${m.our_sku!.replace(/'/g, "''")}'`;

      try {
        runD1Command(updateQuery, remote);
        console.log(`  ✓ Updated ${m.our_sku}`);
      } catch (error) {
        console.error(`  ✗ Failed to update ${m.our_sku}:`, error);
      }
    }

    console.log('\n✓ Import complete!\n');
  } else if (!apply) {
    console.log('\n─'.repeat(60));
    console.log('\nThis was a DRY RUN. To apply changes:');
    console.log('  npx tsx scripts/import-yotpo-ratings.ts --apply   # Local database');
    console.log('  npx tsx scripts/import-yotpo-ratings.ts --remote  # Production database\n');
  }
}

main().catch(error => {
  console.error('Import error:', error);
  process.exit(1);
});
