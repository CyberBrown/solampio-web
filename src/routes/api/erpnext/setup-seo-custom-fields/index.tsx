/**
 * ERPNext SEO Custom Field Setup API
 *
 * POST /api/erpnext/setup-seo-custom-fields
 *
 * Creates SEO-related custom fields in ERPNext Item doctype.
 * This enables two-way sync of SEO data between D1 and ERPNext.
 *
 * Custom fields created on Item:
 * - custom_seo_title
 * - custom_seo_meta_description
 * - custom_seo_og_title
 * - custom_seo_og_description
 * - custom_website_keywords
 * - custom_seo_faqs (JSON)
 * - custom_seo_use_cases (JSON)
 * - custom_gmc_google_category
 * - custom_gmc_product_type
 * - custom_gmc_margin_tier
 * - custom_gmc_product_type_label
 * - custom_seo_last_optimized
 */

import type { RequestHandler } from '@builder.io/qwik-city';
import { rejectUnauthorized } from '~/lib/api-auth';

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
  length?: number;
}

// SEO custom fields for Item doctype
const SEO_CUSTOM_FIELDS: CustomFieldDefinition[] = [
  // Section break for SEO fields
  {
    doctype: 'Item',
    fieldname: 'custom_seo_section',
    fieldtype: 'Section Break',
    label: 'SEO & Google Merchant Center',
    insert_after: 'description',
    description: 'Search engine optimization and Google Shopping feed fields',
  },
  {
    doctype: 'Item',
    fieldname: 'custom_seo_title',
    fieldtype: 'Data',
    label: 'SEO Title',
    insert_after: 'custom_seo_section',
    description: 'Page title for search engines (50-60 characters recommended)',
    length: 70,
  },
  {
    doctype: 'Item',
    fieldname: 'custom_seo_meta_description',
    fieldtype: 'Small Text',
    label: 'Meta Description',
    insert_after: 'custom_seo_title',
    description: 'Description for search engine results (155-160 characters recommended)',
  },
  {
    doctype: 'Item',
    fieldname: 'custom_seo_column_break',
    fieldtype: 'Column Break',
    label: '',
    insert_after: 'custom_seo_meta_description',
  },
  {
    doctype: 'Item',
    fieldname: 'custom_seo_og_title',
    fieldtype: 'Data',
    label: 'Open Graph Title',
    insert_after: 'custom_seo_column_break',
    description: 'Title for social media sharing (falls back to SEO title)',
    length: 70,
  },
  {
    doctype: 'Item',
    fieldname: 'custom_seo_og_description',
    fieldtype: 'Small Text',
    label: 'Open Graph Description',
    insert_after: 'custom_seo_og_title',
    description: 'Description for social media sharing',
  },
  // GMC Section
  {
    doctype: 'Item',
    fieldname: 'custom_gmc_section',
    fieldtype: 'Section Break',
    label: 'Google Merchant Center',
    insert_after: 'custom_seo_og_description',
  },
  {
    doctype: 'Item',
    fieldname: 'custom_gmc_google_category',
    fieldtype: 'Data',
    label: 'Google Product Category',
    insert_after: 'custom_gmc_section',
    description: 'Google product taxonomy, e.g. "Hardware > Electrical Supplies"',
  },
  {
    doctype: 'Item',
    fieldname: 'custom_gmc_product_type',
    fieldtype: 'Data',
    label: 'Product Type',
    insert_after: 'custom_gmc_google_category',
    description: 'Custom product type for Google Shopping, e.g. "Solar Equipment > Panels"',
  },
  {
    doctype: 'Item',
    fieldname: 'custom_gmc_column_break',
    fieldtype: 'Column Break',
    label: '',
    insert_after: 'custom_gmc_product_type',
  },
  {
    doctype: 'Item',
    fieldname: 'custom_gmc_margin_tier',
    fieldtype: 'Data',
    label: 'Custom Label 0 (Margin Tier)',
    insert_after: 'custom_gmc_column_break',
    description: 'For Google Shopping campaigns: high_margin, medium_margin, low_margin',
  },
  {
    doctype: 'Item',
    fieldname: 'custom_gmc_product_type_label',
    fieldtype: 'Data',
    label: 'Custom Label 1 (Type)',
    insert_after: 'custom_gmc_margin_tier',
    description: 'Product type label for campaigns',
  },
  // Structured data section
  {
    doctype: 'Item',
    fieldname: 'custom_structured_data_section',
    fieldtype: 'Section Break',
    label: 'Structured Data (JSON)',
    insert_after: 'custom_gmc_product_type_label',
    description: 'Rich snippet data for search engines',
  },
  {
    doctype: 'Item',
    fieldname: 'custom_seo_faqs',
    fieldtype: 'Text',
    label: 'FAQs (JSON)',
    insert_after: 'custom_structured_data_section',
    description: 'JSON array of FAQ objects: [{"question": "...", "answer": "..."}]',
  },
  {
    doctype: 'Item',
    fieldname: 'custom_seo_use_cases',
    fieldtype: 'Small Text',
    label: 'Use Cases (JSON)',
    insert_after: 'custom_seo_faqs',
    description: 'JSON array of use cases: ["Residential solar", "Off-grid cabins"]',
  },
  {
    doctype: 'Item',
    fieldname: 'custom_seo_last_optimized',
    fieldtype: 'Datetime',
    label: 'Last SEO Optimized',
    insert_after: 'custom_seo_use_cases',
    description: 'Timestamp of last AI-powered SEO optimization',
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
    endpoint: 'erpnext/setup-seo-custom-fields',
    description: 'Creates SEO custom fields in ERPNext Item doctype for two-way sync',
    methods: ['POST'],
    fields_to_create: SEO_CUSTOM_FIELDS.filter(f => f.fieldtype !== 'Section Break' && f.fieldtype !== 'Column Break').map(f => ({
      doctype: f.doctype,
      fieldname: f.fieldname,
      fieldtype: f.fieldtype,
      label: f.label,
    })),
    notes: [
      'Run this once to set up ERPNext for SEO data sync',
      'After setup, run sync-seo-to-erpnext.ts to populate fields',
      'Future product webhooks will include SEO fields',
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

  const results: CreateFieldResult[] = [];

  for (const field of SEO_CUSTOM_FIELDS) {
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
        console.log(`[Setup] Field ${field.fieldname} already exists`);
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
        length: field.length || 0,
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
        console.log(`[Setup] Created field ${field.fieldname}`);
      } else {
        result.status = 'error';
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

    // Rate limit
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  const created = results.filter(r => r.status === 'created').length;
  const exists = results.filter(r => r.status === 'exists').length;
  const errors = results.filter(r => r.status === 'error').length;

  json(200, {
    success: errors === 0,
    dry_run: dryRun,
    summary: {
      total: SEO_CUSTOM_FIELDS.length,
      created,
      already_exists: exists,
      errors,
    },
    results,
    next_steps: created > 0 ? [
      'SEO custom fields have been created in ERPNext',
      'Run: npx tsx scripts/sync-seo-to-erpnext.ts to populate fields',
      'Product webhooks will now sync SEO fields both ways',
    ] : undefined,
  });
};
