/**
 * Category Sync Script
 *
 * Syncs categories from ERPNext to the D1 database.
 * Run with: npx wrangler d1 execute solampio-migration --remote --file=- < sync-sql.sql
 * Or use tsx: npx tsx scripts/sync-categories.ts
 */

import { readFileSync } from 'fs';
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
const ERPNEXT_URL = env.ERPNEXT_URL;
const ERPNEXT_API_KEY = env.ERPNEXT_API_KEY;
const ERPNEXT_API_SECRET = env.ERPNEXT_API_SECRET;

interface ERPNextItemGroup {
  name: string;
  item_group_name: string;
  parent_item_group: string;
  is_group: number;
  image?: string;
  custom_sort_order?: number;
  lft?: number;
  cf_category_image_url?: string;
  custom_cf_image_id?: string;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}

async function main() {
  if (!ERPNEXT_URL || !ERPNEXT_API_KEY || !ERPNEXT_API_SECRET) {
    console.error('Missing ERPNext credentials. Set ERPNEXT_URL, ERPNEXT_API_KEY, and ERPNEXT_API_SECRET in .dev.vars');
    process.exit(1);
  }

  const headers: HeadersInit = {
    Authorization: `token ${ERPNEXT_API_KEY}:${ERPNEXT_API_SECRET}`,
    'Content-Type': 'application/json',
  };

  console.log('Fetching Item Groups from ERPNext...');

  // Fetch all Item Groups from ERPNext
  const fields = ['name', 'item_group_name', 'parent_item_group', 'is_group', 'image', 'custom_sort_order', 'lft', 'cf_category_image_url', 'custom_cf_image_id'];
  const url = `${ERPNEXT_URL}/api/resource/Item Group?fields=${JSON.stringify(fields)}&limit_page_length=0`;

  const response = await fetch(url, { headers });
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`ERPNext API error: ${response.status} - ${errorText}`);
    process.exit(1);
  }

  const data = await response.json() as { data: ERPNextItemGroup[] };
  const itemGroups = data.data || [];

  console.log(`Found ${itemGroups.length} Item Groups\n`);

  // Generate SQL statements
  const now = new Date().toISOString();
  const sqlStatements: string[] = [];

  for (const ig of itemGroups) {
    if (ig.name === 'All Item Groups') continue;

    const title = ig.item_group_name || ig.name;
    const slug = generateSlug(title);
    const sortOrder = ig.custom_sort_order ?? ig.lft ?? 0;

    // Extract CF image ID from URL if needed
    let cfImageId = ig.custom_cf_image_id || null;
    if (!cfImageId && ig.cf_category_image_url) {
      const match = ig.cf_category_image_url.match(/imagedelivery\.net\/[^/]+\/([^/]+)/);
      if (match) cfImageId = match[1];
    }

    // Escape single quotes for SQL
    const escapedTitle = title.replace(/'/g, "''");
    const escapedName = ig.name.replace(/'/g, "''");
    const escapedSlug = slug.replace(/'/g, "''");
    const escapedParent = (ig.parent_item_group || '').replace(/'/g, "''");
    const escapedImageUrl = (ig.cf_category_image_url || '').replace(/'/g, "''");
    const escapedImageId = (cfImageId || '').replace(/'/g, "''");

    sqlStatements.push(`
UPDATE storefront_categories SET
  title = '${escapedTitle}',
  slug = '${escapedSlug}',
  sort_order = ${sortOrder},
  cf_image_id = CASE WHEN '${escapedImageId}' != '' THEN '${escapedImageId}' ELSE cf_image_id END,
  cf_category_image_url = CASE WHEN '${escapedImageUrl}' != '' THEN '${escapedImageUrl}' ELSE cf_category_image_url END,
  sync_source = 'erpnext',
  last_synced_from_erpnext = '${now}',
  updated_at = '${now}'
WHERE erpnext_name = '${escapedName}';`);

    console.log(`${ig.name}: sort_order=${sortOrder}, cf_image_id=${cfImageId || '(none)'}`);
  }

  // Output SQL file
  const sqlContent = sqlStatements.join('\n');
  const sqlPath = '/tmp/category-sync.sql';
  const { writeFileSync } = await import('fs');
  writeFileSync(sqlPath, sqlContent);

  console.log(`\n--- SQL written to ${sqlPath} ---`);
  console.log(`\nTo execute against production D1:`);
  console.log(`npx wrangler d1 execute solampio-migration --remote --file=${sqlPath}`);
}

main().catch(console.error);
