#!/usr/bin/env npx tsx
/**
 * Scrape Product Descriptions from solampio.com (BigCommerce)
 *
 * Reads old product URLs from the url_redirects D1 table, fetches them
 * from solampio.com, extracts the description HTML, cleans it, and
 * updates both D1 and ERPNext.
 *
 * Usage:
 *   npx tsx scripts/scrape-descriptions.ts --test          # Test with 3 products
 *   npx tsx scripts/scrape-descriptions.ts --limit 10      # Process 10 products
 *   npx tsx scripts/scrape-descriptions.ts                 # Process all
 *   npx tsx scripts/scrape-descriptions.ts --erpnext-only  # Only update ERPNext (skip D1)
 *   npx tsx scripts/scrape-descriptions.ts --d1-only       # Only update D1 (skip ERPNext)
 */

const ERPNEXT_URL = 'https://solamp.erpnext.com';
const ERPNEXT_API_KEY = '3252264d158625b';
const ERPNEXT_API_SECRET = '2870c338f1a625e';
const ADMIN_API_KEY = 'c6152e7005ec5367e523d011d2895ef6daa0cd56b77f57a6d0b09f7c7f01464b';
const SITE_URL = 'https://solampio-web.pages.dev';
const BASE_URL = 'https://solampio.com';

// Parse args
const args = process.argv.slice(2);
const testMode = args.includes('--test');
const erpnextOnly = args.includes('--erpnext-only');
const d1Only = args.includes('--d1-only');
const limitIdx = args.indexOf('--limit');
const limit = testMode ? 3 : (limitIdx >= 0 ? parseInt(args[limitIdx + 1], 10) : 0);

interface RedirectRow {
  old_url: string;
  new_url: string;
  notes: string;
  source_id: string;
}

/**
 * Extract the product description HTML from a BigCommerce page
 */
function extractDescription(html: string): string | null {
  // BigCommerce uses a tab panel with id="tab-description"
  const tabStart = html.indexOf('id="tab-description"');
  if (tabStart === -1) return null;

  // Find the content div
  const contentStart = html.indexOf('productView-description-tabContent', tabStart);
  if (contentStart === -1) return null;

  // Find the opening > of this div
  const divOpen = html.indexOf('>', contentStart);
  if (divOpen === -1) return null;

  // Now we need to find the matching closing div
  // Walk forward tracking div depth
  let depth = 1;
  let pos = divOpen + 1;
  let searchFrom = pos;

  while (depth > 0 && searchFrom < html.length) {
    const nextOpen = html.indexOf('<div', searchFrom);
    const nextClose = html.indexOf('</div>', searchFrom);

    if (nextClose === -1) break;

    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth++;
      searchFrom = nextOpen + 4;
    } else {
      depth--;
      if (depth === 0) {
        return html.substring(pos, nextClose).trim();
      }
      searchFrom = nextClose + 6;
    }
  }

  // Fallback: grab up to 15000 chars after the content div start
  const fallback = html.substring(divOpen + 1, divOpen + 15000);
  const endMarker = fallback.indexOf('</article>');
  if (endMarker > 0) {
    return fallback.substring(0, endMarker).trim();
  }

  return null;
}

/**
 * Clean HTML description (mirrors description-cleaner.ts logic)
 */
function cleanDescription(html: string): string {
  let cleaned = html;

  // Remove script/style
  cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  cleaned = cleaned.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '');

  // Remove attributes
  cleaned = cleaned.replace(/\s*style\s*=\s*["'][^"']*["']/gi, '');
  cleaned = cleaned.replace(/\s*class\s*=\s*["'][^"']*["']/gi, '');
  cleaned = cleaned.replace(/\s*id\s*=\s*["'][^"']*["']/gi, '');
  cleaned = cleaned.replace(/\s*data-[a-z-]+\s*=\s*["'][^"']*["']/gi, '');
  cleaned = cleaned.replace(/\s*(align|valign|width|height|border|cellpadding|cellspacing|bgcolor|color)\s*=\s*["'][^"']*["']/gi, '');

  // Remove font/span/div wrappers
  cleaned = cleaned.replace(/<\/?font[^>]*>/gi, '');
  cleaned = cleaned.replace(/<\/?span[^>]*>/gi, '');
  cleaned = cleaned.replace(/<div[^>]*>/gi, '\n');
  cleaned = cleaned.replace(/<\/div>/gi, '\n');
  cleaned = cleaned.replace(/<br\s*\/?>/gi, '\n');

  // Strip all remaining HTML tags
  cleaned = cleaned.replace(/<[^>]*>/g, ' ');

  // Decode entities
  cleaned = cleaned.replace(/&nbsp;/gi, ' ');
  cleaned = cleaned.replace(/&amp;/g, '&');
  cleaned = cleaned.replace(/&lt;/g, '<');
  cleaned = cleaned.replace(/&gt;/g, '>');
  cleaned = cleaned.replace(/&quot;/g, '"');
  cleaned = cleaned.replace(/&#39;/g, "'");
  cleaned = cleaned.replace(/&rsquo;/g, "'");
  cleaned = cleaned.replace(/&lsquo;/g, "'");
  cleaned = cleaned.replace(/&rdquo;/g, '"');
  cleaned = cleaned.replace(/&ldquo;/g, '"');
  cleaned = cleaned.replace(/&mdash;/g, '—');
  cleaned = cleaned.replace(/&ndash;/g, '–');
  cleaned = cleaned.replace(/&bull;/g, '•');
  cleaned = cleaned.replace(/&copy;/g, '©');
  cleaned = cleaned.replace(/&reg;/g, '®');
  cleaned = cleaned.replace(/&trade;/g, '™');
  cleaned = cleaned.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)));

  // Normalize whitespace
  cleaned = cleaned.replace(/[ \t]+/g, ' ');
  cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n');
  cleaned = cleaned.replace(/^\s+|\s+$/gm, '');

  return cleaned.trim();
}

/**
 * Extract excerpt for summary
 */
function extractExcerpt(text: string, maxLength = 500): string {
  if (text.length <= maxLength) return text;

  let truncated = text.substring(0, maxLength);
  const sentenceEnd = truncated.lastIndexOf('. ');
  if (sentenceEnd > maxLength * 0.6) {
    return truncated.substring(0, sentenceEnd + 1);
  }
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > maxLength * 0.8) {
    truncated = truncated.substring(0, lastSpace);
  }
  return truncated + '...';
}

/**
 * Extract SKU from redirect notes field
 */
function extractSku(notes: string): string | null {
  const match = notes.match(/SKU:\s*([^,]+)/);
  return match ? match[1].trim() : null;
}

/**
 * Update D1 via the admin API
 */
async function updateD1(sku: string, description: string, descriptionClean: string, descriptionSummary: string): Promise<boolean> {
  try {
    // Use wrangler CLI to update directly
    const { execSync } = await import('child_process');

    // Escape single quotes for SQL
    const escDesc = description.replace(/'/g, "''");
    const escClean = descriptionClean.replace(/'/g, "''");
    const escSummary = descriptionSummary.replace(/'/g, "''");
    const escSku = sku.replace(/'/g, "''");

    const sql = `UPDATE storefront_products SET description = '${escDesc}', description_clean = '${escClean}', description_summary = '${escSummary}' WHERE sku = '${escSku}'`;

    execSync(`npx wrangler d1 execute solampio-migration --remote --command "${sql.replace(/"/g, '\\"')}"`, {
      stdio: 'pipe',
      timeout: 30000,
    });
    return true;
  } catch (e) {
    console.error(`  D1 update failed for ${sku}:`, (e as Error).message?.substring(0, 100));
    return false;
  }
}

/**
 * Update ERPNext custom fields
 */
async function updateErpNext(sku: string, descriptionSummary: string, descriptionClean: string): Promise<boolean> {
  try {
    const res = await fetch(`${ERPNEXT_URL}/api/resource/Item/${encodeURIComponent(sku)}`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${ERPNEXT_API_KEY}:${ERPNEXT_API_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        custom_description_summary: descriptionSummary,
        custom_description_clean: descriptionClean,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`  ERPNext update failed for ${sku}: ${res.status} ${text.substring(0, 100)}`);
      return false;
    }
    return true;
  } catch (e) {
    console.error(`  ERPNext update failed for ${sku}:`, (e as Error).message);
    return false;
  }
}

/**
 * Fetch product redirects from D1
 */
async function getRedirects(): Promise<RedirectRow[]> {
  const { execSync } = await import('child_process');
  const sql = "SELECT old_url, new_url, notes, source_id FROM url_redirects WHERE entity_type = 'product' AND old_url IS NOT NULL ORDER BY old_url";
  const output = execSync(`npx wrangler d1 execute solampio-migration --remote --command "${sql}" --json`, {
    encoding: 'utf-8',
    timeout: 30000,
  });

  const parsed = JSON.parse(output);
  return parsed[0]?.results || [];
}

async function main() {
  console.log('=== Scraping Product Descriptions from solampio.com ===\n');

  // Get redirect mappings
  console.log('Fetching redirect mappings from D1...');
  const redirects = await getRedirects();
  console.log(`Found ${redirects.length} product redirects\n`);

  const toProcess = limit > 0 ? redirects.slice(0, limit) : redirects;
  console.log(`Processing ${toProcess.length} products...\n`);

  let scraped = 0;
  let d1Updated = 0;
  let erpnextUpdated = 0;
  let noDescription = 0;
  let fetchFailed = 0;
  let skipped = 0;

  for (let i = 0; i < toProcess.length; i++) {
    const redirect = toProcess[i];
    const sku = extractSku(redirect.notes);
    const url = `${BASE_URL}${redirect.old_url}`;

    console.log(`[${i + 1}/${toProcess.length}] ${redirect.old_url} → SKU: ${sku || 'unknown'}`);

    if (!sku) {
      console.log('  Skipped: no SKU in notes');
      skipped++;
      continue;
    }

    // Fetch the page
    let html: string;
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'SolampioMigration/1.0' },
        redirect: 'follow',
      });
      if (!res.ok) {
        console.log(`  Fetch failed: ${res.status}`);
        fetchFailed++;
        continue;
      }
      html = await res.text();
    } catch (e) {
      console.log(`  Fetch error: ${(e as Error).message}`);
      fetchFailed++;
      continue;
    }

    // Extract description
    const descHtml = extractDescription(html);
    if (!descHtml || descHtml.length < 50) {
      console.log(`  No description found (${descHtml?.length || 0} chars)`);
      noDescription++;
      continue;
    }

    // Clean it
    const descClean = cleanDescription(descHtml);
    const descSummary = extractExcerpt(descClean, 500);

    console.log(`  Description: ${descClean.length} chars, Summary: ${descSummary.length} chars`);
    scraped++;

    // Update D1
    if (!erpnextOnly) {
      const d1Ok = await updateD1(sku, descHtml, descClean, descSummary);
      if (d1Ok) d1Updated++;
    }

    // Update ERPNext
    if (!d1Only) {
      const erpOk = await updateErpNext(sku, descSummary, descClean);
      if (erpOk) erpnextUpdated++;
    }

    // Rate limit: 200ms between requests
    await new Promise(r => setTimeout(r, 200));
  }

  console.log('\n=== Summary ===');
  console.log(`Total processed: ${toProcess.length}`);
  console.log(`Scraped with descriptions: ${scraped}`);
  console.log(`D1 updated: ${d1Updated}`);
  console.log(`ERPNext updated: ${erpnextUpdated}`);
  console.log(`No description found: ${noDescription}`);
  console.log(`Fetch failed: ${fetchFailed}`);
  console.log(`Skipped (no SKU): ${skipped}`);
}

main().catch(console.error);
