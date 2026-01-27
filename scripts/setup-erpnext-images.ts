/**
 * ERPNext Item Images Setup Script
 *
 * Creates the custom "Item Website Image" child DocType in ERPNext
 * and adds a Table field to Item doctype.
 *
 * Usage:
 *   npx tsx scripts/setup-erpnext-images.ts
 *
 * Requires environment variables (or wrangler secrets):
 *   - ERPNEXT_URL
 *   - ERPNEXT_API_KEY
 *   - ERPNEXT_API_SECRET
 */

import { execSync } from 'child_process';

// Get secrets from wrangler
function getSecret(name: string): string {
  try {
    // Try environment variable first
    if (process.env[name]) {
      return process.env[name]!;
    }
    // Try to get from wrangler secrets (this won't work directly, just for reference)
    console.log(`Note: ${name} should be set as environment variable or wrangler secret`);
    return '';
  } catch {
    return '';
  }
}

const ERPNEXT_URL = process.env.ERPNEXT_URL || getSecret('ERPNEXT_URL');
const ERPNEXT_API_KEY = process.env.ERPNEXT_API_KEY || getSecret('ERPNEXT_API_KEY');
const ERPNEXT_API_SECRET = process.env.ERPNEXT_API_SECRET || getSecret('ERPNEXT_API_SECRET');

if (!ERPNEXT_URL || !ERPNEXT_API_KEY || !ERPNEXT_API_SECRET) {
  console.error('Missing ERPNext credentials. Set these environment variables:');
  console.error('  ERPNEXT_URL=https://your-site.erpnext.com');
  console.error('  ERPNEXT_API_KEY=your-api-key');
  console.error('  ERPNEXT_API_SECRET=your-api-secret');
  process.exit(1);
}

const headers = {
  'Authorization': `token ${ERPNEXT_API_KEY}:${ERPNEXT_API_SECRET}`,
  'Content-Type': 'application/json',
};

// Child DocType definition
const ITEM_IMAGE_DOCTYPE = {
  doctype: 'DocType',
  name: 'Item Website Image',
  module: 'Stock',
  custom: 1,
  istable: 1,
  editable_grid: 1,
  fields: [
    {
      fieldname: 'image_url',
      fieldtype: 'Data',
      label: 'Image URL',
      in_list_view: 1,
      reqd: 1,
    },
    {
      fieldname: 'cf_image_id',
      fieldtype: 'Data',
      label: 'Cloudflare Image ID',
      in_list_view: 1,
    },
    {
      fieldname: 'sort_order',
      fieldtype: 'Int',
      label: 'Sort Order',
      in_list_view: 1,
      default: '0',
    },
    {
      fieldname: 'alt_text',
      fieldtype: 'Data',
      label: 'Alt Text',
    },
  ],
  permissions: [
    { role: 'System Manager', read: 1, write: 1, create: 1, delete: 1 },
    { role: 'Stock Manager', read: 1, write: 1, create: 1, delete: 1 },
    { role: 'Stock User', read: 1, write: 1, create: 1 },
  ],
};

// Custom field to add to Item
const ITEM_IMAGES_FIELD = {
  dt: 'Item',
  fieldname: 'custom_website_images',
  fieldtype: 'Table',
  label: 'Website Images',
  options: 'Item Website Image',
  insert_after: 'website_image',
};

async function checkDocTypeExists(): Promise<boolean> {
  try {
    const response = await fetch(`${ERPNEXT_URL}/api/resource/DocType/Item Website Image`, { headers });
    return response.ok;
  } catch {
    return false;
  }
}

async function createDocType(): Promise<boolean> {
  console.log('Creating DocType: Item Website Image...');
  try {
    const response = await fetch(`${ERPNEXT_URL}/api/resource/DocType`, {
      method: 'POST',
      headers,
      body: JSON.stringify(ITEM_IMAGE_DOCTYPE),
    });

    if (response.ok) {
      console.log('✓ DocType created successfully');
      return true;
    }

    const error = await response.text();
    console.error('✗ Failed to create DocType:', error);
    return false;
  } catch (err) {
    console.error('✗ Error creating DocType:', err);
    return false;
  }
}

async function checkCustomFieldExists(): Promise<boolean> {
  try {
    const url = `${ERPNEXT_URL}/api/resource/Custom Field?filters=${encodeURIComponent(
      JSON.stringify([['dt', '=', 'Item'], ['fieldname', '=', 'custom_website_images']])
    )}&limit_page_length=1`;

    const response = await fetch(url, { headers });
    const data = await response.json() as { data?: any[] };
    return data.data && data.data.length > 0;
  } catch {
    return false;
  }
}

async function createCustomField(): Promise<boolean> {
  console.log('Creating Custom Field: custom_website_images on Item...');
  try {
    const response = await fetch(`${ERPNEXT_URL}/api/resource/Custom Field`, {
      method: 'POST',
      headers,
      body: JSON.stringify(ITEM_IMAGES_FIELD),
    });

    if (response.ok) {
      console.log('✓ Custom Field created successfully');
      return true;
    }

    const error = await response.text();
    console.error('✗ Failed to create Custom Field:', error);
    return false;
  } catch (err) {
    console.error('✗ Error creating Custom Field:', err);
    return false;
  }
}

async function main() {
  console.log('\n🗄️  ERPNext Item Images Setup\n');
  console.log(`Target: ${ERPNEXT_URL}\n`);

  // Step 1: Check/Create DocType
  const docTypeExists = await checkDocTypeExists();
  if (docTypeExists) {
    console.log('✓ DocType "Item Website Image" already exists');
  } else {
    const created = await createDocType();
    if (!created) {
      console.error('\nSetup failed. Fix the error and try again.');
      process.exit(1);
    }
  }

  // Step 2: Check/Create Custom Field
  const fieldExists = await checkCustomFieldExists();
  if (fieldExists) {
    console.log('✓ Custom Field "custom_website_images" already exists on Item');
  } else {
    const created = await createCustomField();
    if (!created) {
      console.error('\nSetup failed. Fix the error and try again.');
      process.exit(1);
    }
  }

  console.log('\n✓ Setup complete!\n');
  console.log('You can now add multiple images to Items via the "Website Images" table.');
  console.log('When you save an Item, the images will sync to the website via webhook.\n');
}

main().catch(console.error);
