/**
 * ERPNext Custom Field Setup API
 *
 * POST /api/erpnext/setup-custom-fields
 *
 * Creates custom fields in ERPNext doctypes needed for the storefront.
 * This should only be run once during initial setup.
 *
 * Custom fields created:
 * - Item Group: custom_sort_order, custom_cf_image_id, cf_category_image_url, custom_show_in_website
 */

import type { RequestHandler } from '@builder.io/qwik-city';

interface CustomFieldDefinition {
  doctype: string;
  fieldname: string;
  fieldtype: string;
  label: string;
  insert_after?: string;
  description?: string;
  default?: string;
  options?: string;
  read_only?: number;
  hidden?: number;
}

// Custom fields to create for Item Group doctype
const ITEM_GROUP_CUSTOM_FIELDS: CustomFieldDefinition[] = [
  {
    doctype: 'Item Group',
    fieldname: 'custom_sort_order',
    fieldtype: 'Int',
    label: 'Sort Order',
    insert_after: 'is_group',
    description: 'Display order on website (lower numbers appear first). Default: 0',
    default: '0',
  },
  {
    doctype: 'Item Group',
    fieldname: 'custom_show_in_website',
    fieldtype: 'Check',
    label: 'Show in Website',
    insert_after: 'custom_sort_order',
    description: 'Check to display this category on the website storefront',
    default: '0',
  },
  {
    doctype: 'Item Group',
    fieldname: 'custom_cf_image_id',
    fieldtype: 'Data',
    label: 'Cloudflare Image ID',
    insert_after: 'image',
    description: 'Cloudflare Images ID for category image (e.g., "cat-batteries")',
  },
  {
    doctype: 'Item Group',
    fieldname: 'cf_category_image_url',
    fieldtype: 'Data',
    label: 'Category Image URL',
    insert_after: 'custom_cf_image_id',
    description: 'Full Cloudflare Images URL for category image',
    read_only: 1,
  },
];

interface ERPNextResponse {
  data?: unknown;
  message?: unknown;
  exc?: string;
  exc_type?: string;
  _server_messages?: string;
}

interface CreateFieldResult {
  fieldname: string;
  status: 'created' | 'exists' | 'error';
  message?: string;
}

export const onGet: RequestHandler = async ({ json }) => {
  json(200, {
    status: 'ok',
    endpoint: 'erpnext/setup-custom-fields',
    description: 'Creates custom fields in ERPNext doctypes for storefront integration',
    methods: ['POST'],
    fields_to_create: ITEM_GROUP_CUSTOM_FIELDS.map(f => ({
      doctype: f.doctype,
      fieldname: f.fieldname,
      fieldtype: f.fieldtype,
      label: f.label,
    })),
    notes: [
      'This should only be run once during initial setup',
      'Existing fields will be skipped (not updated)',
      'Requires ERPNEXT_URL, ERPNEXT_API_KEY, and ERPNEXT_API_SECRET env vars',
    ],
  });
};

export const onPost: RequestHandler = async ({ platform, json, url }) => {
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

  const results: CreateFieldResult[] = [];

  for (const field of ITEM_GROUP_CUSTOM_FIELDS) {
    const result: CreateFieldResult = {
      fieldname: field.fieldname,
      status: 'error',
    };

    try {
      // Check if field already exists
      const checkUrl = `${env.ERPNEXT_URL}/api/resource/Custom Field?filters=${encodeURIComponent(JSON.stringify([
        ['dt', '=', field.doctype],
        ['fieldname', '=', field.fieldname]
      ]))}&limit_page_length=1`;

      const checkResponse = await fetch(checkUrl, { headers });
      const checkData = await checkResponse.json() as ERPNextResponse;

      if (checkData.data && Array.isArray(checkData.data) && checkData.data.length > 0) {
        result.status = 'exists';
        result.message = 'Field already exists';
        results.push(result);
        console.log(`[Setup] Field ${field.fieldname} already exists in ${field.doctype}`);
        continue;
      }

      if (dryRun) {
        result.status = 'created';
        result.message = 'Would create (dry run)';
        results.push(result);
        continue;
      }

      // Create the custom field
      const createUrl = `${env.ERPNEXT_URL}/api/resource/Custom Field`;
      const createBody = {
        dt: field.doctype,
        fieldname: field.fieldname,
        fieldtype: field.fieldtype,
        label: field.label,
        insert_after: field.insert_after || '',
        description: field.description || '',
        default: field.default || '',
        options: field.options || '',
        read_only: field.read_only || 0,
        hidden: field.hidden || 0,
      };

      const createResponse = await fetch(createUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(createBody),
      });

      const createData = await createResponse.json() as ERPNextResponse;

      if (createResponse.ok && createData.data) {
        result.status = 'created';
        result.message = 'Field created successfully';
        console.log(`[Setup] Created field ${field.fieldname} in ${field.doctype}`);
      } else {
        result.status = 'error';
        // Parse server messages if available
        if (createData._server_messages) {
          try {
            const messages = JSON.parse(createData._server_messages);
            result.message = Array.isArray(messages) ? messages.join(', ') : messages;
          } catch {
            result.message = createData._server_messages;
          }
        } else if (createData.exc) {
          result.message = createData.exc;
        } else {
          result.message = `HTTP ${createResponse.status}`;
        }
        console.error(`[Setup] Failed to create ${field.fieldname}:`, result.message);
      }

    } catch (error) {
      result.status = 'error';
      result.message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[Setup] Error creating ${field.fieldname}:`, result.message);
    }

    results.push(result);

    // Rate limit to avoid overwhelming ERPNext
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  const created = results.filter(r => r.status === 'created').length;
  const exists = results.filter(r => r.status === 'exists').length;
  const errors = results.filter(r => r.status === 'error').length;

  json(200, {
    success: errors === 0,
    dry_run: dryRun,
    summary: {
      total: ITEM_GROUP_CUSTOM_FIELDS.length,
      created,
      already_exists: exists,
      errors,
    },
    results,
    next_steps: created > 0 ? [
      'Custom fields have been created in ERPNext',
      'You can now set values for these fields on Item Group records',
      'Run POST /api/categories/sync-from-erpnext to sync categories with the new fields',
    ] : undefined,
  });
};
