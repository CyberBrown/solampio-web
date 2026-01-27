/**
 * ERPNext Item Images Setup API
 *
 * POST /api/erpnext/setup-item-images
 *
 * Creates the custom "Item Website Image" child DocType and links it to Item.
 * This enables storing multiple product images in ERPNext.
 *
 * Creates:
 * - DocType: Item Website Image (child table with image_url, cf_image_id, sort_order, alt_text)
 * - Custom Field on Item: custom_website_images (Table linking to Item Website Image)
 */

import type { RequestHandler } from '@builder.io/qwik-city';
import { rejectUnauthorized } from '~/lib/api-auth';

interface ERPNextResponse {
  data?: unknown;
  message?: unknown;
  exc?: string;
  exc_type?: string;
  _server_messages?: string;
}

interface SetupResult {
  step: string;
  status: 'success' | 'exists' | 'error';
  message?: string;
}

// Child DocType definition for Item Website Image
const ITEM_IMAGE_DOCTYPE = {
  doctype: 'DocType',
  name: 'Item Website Image',
  module: 'Stock',
  custom: 1,
  istable: 1, // Makes it a child table
  editable_grid: 1,
  fields: [
    {
      fieldname: 'image_url',
      fieldtype: 'Data',
      label: 'Image URL',
      in_list_view: 1,
      reqd: 1,
      description: 'Full URL to the image (Cloudflare Images URL)',
    },
    {
      fieldname: 'cf_image_id',
      fieldtype: 'Data',
      label: 'Cloudflare Image ID',
      in_list_view: 1,
      description: 'Cloudflare Images ID for this image',
    },
    {
      fieldname: 'sort_order',
      fieldtype: 'Int',
      label: 'Sort Order',
      in_list_view: 1,
      default: '0',
      description: 'Display order (0 = primary image)',
    },
    {
      fieldname: 'alt_text',
      fieldtype: 'Data',
      label: 'Alt Text',
      description: 'Alternative text for accessibility',
    },
  ],
  permissions: [
    {
      role: 'System Manager',
      read: 1,
      write: 1,
      create: 1,
      delete: 1,
    },
    {
      role: 'Stock Manager',
      read: 1,
      write: 1,
      create: 1,
      delete: 1,
    },
    {
      role: 'Stock User',
      read: 1,
      write: 1,
      create: 1,
    },
  ],
};

// Custom field to add to Item doctype
const ITEM_IMAGES_FIELD = {
  dt: 'Item',
  fieldname: 'custom_website_images',
  fieldtype: 'Table',
  label: 'Website Images',
  options: 'Item Website Image',
  insert_after: 'website_image',
  description: 'Multiple images for the website storefront. First image (sort_order=0) is the primary image.',
};

export const onGet: RequestHandler = async ({ json }) => {
  json(200, {
    status: 'ok',
    endpoint: 'erpnext/setup-item-images',
    description: 'Creates custom DocType and field for multiple product images in ERPNext',
    methods: ['POST'],
    creates: {
      doctype: {
        name: 'Item Website Image',
        type: 'Child Table',
        fields: ['image_url', 'cf_image_id', 'sort_order', 'alt_text'],
      },
      custom_field: {
        doctype: 'Item',
        fieldname: 'custom_website_images',
        fieldtype: 'Table',
        description: 'Links Item to multiple Item Website Image records',
      },
    },
    notes: [
      'This should only be run once during initial setup',
      'Creates a child table DocType for storing multiple images per Item',
      'Adds a Table field to Item that references the child table',
      'Requires ERPNEXT_URL, ERPNEXT_API_KEY, and ERPNEXT_API_SECRET env vars',
    ],
  });
};

export const onPost: RequestHandler = async (requestEvent) => {
  if (rejectUnauthorized(requestEvent, 'ADMIN_API_KEY')) return;

  const { platform, json, url } = requestEvent;
  const env = platform?.env as {
    ERPNEXT_URL?: string;
    ERPNEXT_API_KEY?: string;
    ERPNEXT_API_SECRET?: string;
  } | undefined;

  if (!env?.ERPNEXT_URL || !env?.ERPNEXT_API_KEY || !env?.ERPNEXT_API_SECRET) {
    json(500, { success: false, error: 'ERPNext credentials not configured' });
    return;
  }

  const dryRun = url.searchParams.get('dry_run') === 'true';

  const headers: HeadersInit = {
    Authorization: `token ${env.ERPNEXT_API_KEY}:${env.ERPNEXT_API_SECRET}`,
    'Content-Type': 'application/json',
  };

  const results: SetupResult[] = [];

  // Step 1: Check if DocType already exists
  try {
    const checkUrl = `${env.ERPNEXT_URL}/api/resource/DocType/Item Website Image`;
    const checkResponse = await fetch(checkUrl, { headers });

    if (checkResponse.ok) {
      results.push({
        step: 'Create DocType: Item Website Image',
        status: 'exists',
        message: 'DocType already exists',
      });
    } else if (checkResponse.status === 404) {
      // DocType doesn't exist, create it
      if (dryRun) {
        results.push({
          step: 'Create DocType: Item Website Image',
          status: 'success',
          message: '[DRY RUN] Would create DocType',
        });
      } else {
        const createUrl = `${env.ERPNEXT_URL}/api/resource/DocType`;
        const createResponse = await fetch(createUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(ITEM_IMAGE_DOCTYPE),
        });

        const createData = await createResponse.json() as ERPNextResponse;

        if (createResponse.ok && createData.data) {
          results.push({
            step: 'Create DocType: Item Website Image',
            status: 'success',
            message: 'DocType created successfully',
          });
        } else {
          let errorMsg = `HTTP ${createResponse.status}`;
          if (createData._server_messages) {
            try {
              const msgs = JSON.parse(createData._server_messages);
              errorMsg = Array.isArray(msgs) ? msgs.join(', ') : String(msgs);
            } catch {
              errorMsg = createData._server_messages;
            }
          }
          results.push({
            step: 'Create DocType: Item Website Image',
            status: 'error',
            message: errorMsg,
          });
        }
      }
    } else {
      results.push({
        step: 'Create DocType: Item Website Image',
        status: 'error',
        message: `Check failed: HTTP ${checkResponse.status}`,
      });
    }
  } catch (error) {
    results.push({
      step: 'Create DocType: Item Website Image',
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  // Step 2: Check if Custom Field already exists on Item
  try {
    const checkFieldUrl = `${env.ERPNEXT_URL}/api/resource/Custom Field?filters=${encodeURIComponent(
      JSON.stringify([
        ['dt', '=', 'Item'],
        ['fieldname', '=', 'custom_website_images'],
      ])
    )}&limit_page_length=1`;

    const checkFieldResponse = await fetch(checkFieldUrl, { headers });
    const checkFieldData = await checkFieldResponse.json() as ERPNextResponse;

    if (checkFieldData.data && Array.isArray(checkFieldData.data) && checkFieldData.data.length > 0) {
      results.push({
        step: 'Create Custom Field: custom_website_images on Item',
        status: 'exists',
        message: 'Custom field already exists',
      });
    } else {
      // Create the custom field
      if (dryRun) {
        results.push({
          step: 'Create Custom Field: custom_website_images on Item',
          status: 'success',
          message: '[DRY RUN] Would create custom field',
        });
      } else {
        const createFieldUrl = `${env.ERPNEXT_URL}/api/resource/Custom Field`;
        const createFieldResponse = await fetch(createFieldUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(ITEM_IMAGES_FIELD),
        });

        const createFieldData = await createFieldResponse.json() as ERPNextResponse;

        if (createFieldResponse.ok && createFieldData.data) {
          results.push({
            step: 'Create Custom Field: custom_website_images on Item',
            status: 'success',
            message: 'Custom field created successfully',
          });
        } else {
          let errorMsg = `HTTP ${createFieldResponse.status}`;
          if (createFieldData._server_messages) {
            try {
              const msgs = JSON.parse(createFieldData._server_messages);
              errorMsg = Array.isArray(msgs) ? msgs.join(', ') : String(msgs);
            } catch {
              errorMsg = createFieldData._server_messages;
            }
          }
          results.push({
            step: 'Create Custom Field: custom_website_images on Item',
            status: 'error',
            message: errorMsg,
          });
        }
      }
    }
  } catch (error) {
    results.push({
      step: 'Create Custom Field: custom_website_images on Item',
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  const success = results.filter(r => r.status === 'success').length;
  const exists = results.filter(r => r.status === 'exists').length;
  const errors = results.filter(r => r.status === 'error').length;

  json(200, {
    success: errors === 0,
    dry_run: dryRun,
    summary: {
      total: results.length,
      success,
      already_exists: exists,
      errors,
    },
    results,
    next_steps: success > 0 || exists > 0 ? [
      'The Item Website Image child table is now available in ERPNext',
      'You can add multiple images to any Item via the "Website Images" table',
      'Images will sync to the storefront when the product webhook is triggered',
      'Sort order 0 = primary image, higher numbers = additional images',
    ] : undefined,
  });
};
