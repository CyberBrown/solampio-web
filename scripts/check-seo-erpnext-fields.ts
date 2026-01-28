/**
 * Check if SEO custom fields exist in ERPNext Item doctype
 * Run with: bun scripts/check-seo-erpnext-fields.ts
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { SEO_CUSTOM_FIELDS, type CustomFieldDef } from './seo-custom-fields';

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
    console.error('Error: .dev.vars file not found. Please create it with ERPNext credentials.');
    console.error('Required variables: ERPNEXT_URL, ERPNEXT_API_KEY, ERPNEXT_API_SECRET');
    process.exit(1);
  }
}

const env = loadEnv();
const ERPNEXT_URL = env.ERPNEXT_URL;
const ERPNEXT_API_KEY = env.ERPNEXT_API_KEY;
const ERPNEXT_API_SECRET = env.ERPNEXT_API_SECRET;

if (!ERPNEXT_URL || !ERPNEXT_API_KEY || !ERPNEXT_API_SECRET) {
  console.error('Error: Missing ERPNext credentials in .dev.vars');
  process.exit(1);
}

interface FieldCheckResult {
  fieldname: string;
  label: string;
  exists: boolean;
  currentType?: string;
  expectedType: string;
  error?: string;
}

async function checkField(field: CustomFieldDef): Promise<FieldCheckResult> {
  const customFieldName = `${field.dt}-${field.fieldname}`;
  const url = `${ERPNEXT_URL}/api/resource/Custom Field/${encodeURIComponent(customFieldName)}`;

  const headers: HeadersInit = {
    Authorization: `token ${ERPNEXT_API_KEY}:${ERPNEXT_API_SECRET}`,
    'Content-Type': 'application/json',
  };

  try {
    const response = await fetch(url, { headers });

    if (response.status === 404) {
      return {
        fieldname: field.fieldname,
        label: field.label,
        exists: false,
        expectedType: field.fieldtype,
      };
    }

    if (!response.ok) {
      const errorText = await response.text();
      return {
        fieldname: field.fieldname,
        label: field.label,
        exists: false,
        expectedType: field.fieldtype,
        error: `HTTP ${response.status}: ${errorText}`,
      };
    }

    const data = await response.json() as { data: { fieldtype: string } };
    return {
      fieldname: field.fieldname,
      label: field.label,
      exists: true,
      currentType: data.data.fieldtype,
      expectedType: field.fieldtype,
    };
  } catch (error) {
    return {
      fieldname: field.fieldname,
      label: field.label,
      exists: false,
      expectedType: field.fieldtype,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function createField(field: CustomFieldDef): Promise<{ success: boolean; error?: string }> {
  const url = `${ERPNEXT_URL}/api/resource/Custom Field`;

  const headers: HeadersInit = {
    Authorization: `token ${ERPNEXT_API_KEY}:${ERPNEXT_API_SECRET}`,
    'Content-Type': 'application/json',
  };

  // Map our field definition to ERPNext Custom Field format
  const payload = {
    doctype: 'Custom Field',
    dt: field.dt,
    fieldname: field.fieldname,
    fieldtype: field.fieldtype === 'Data' && field.fieldname === 'seo_section'
      ? 'Section Break'
      : field.fieldtype,
    label: field.label,
    insert_after: field.insert_after,
    description: field.description,
    read_only: field.read_only || 0,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: `HTTP ${response.status}: ${errorText}` };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function main() {
  console.log('Checking SEO custom fields in ERPNext...\n');
  console.log(`ERPNext URL: ${ERPNEXT_URL}\n`);

  const results: FieldCheckResult[] = [];

  for (const field of SEO_CUSTOM_FIELDS) {
    process.stdout.write(`Checking ${field.fieldname}... `);
    const result = await checkField(field);
    results.push(result);

    if (result.exists) {
      console.log(`✓ exists (${result.currentType})`);
    } else if (result.error) {
      console.log(`✗ error: ${result.error}`);
    } else {
      console.log(`✗ missing`);
    }
  }

  console.log('\n=== Summary ===');
  const existing = results.filter(r => r.exists);
  const missing = results.filter(r => !r.exists && !r.error);
  const errors = results.filter(r => r.error);

  console.log(`Existing: ${existing.length}/${results.length}`);
  console.log(`Missing: ${missing.length}/${results.length}`);
  console.log(`Errors: ${errors.length}/${results.length}`);

  if (missing.length > 0) {
    console.log('\n=== Missing Fields ===');
    for (const field of missing) {
      console.log(`  - ${field.fieldname} (${field.label})`);
    }

    const createFlag = process.argv.includes('--create');
    if (createFlag) {
      console.log('\n=== Creating Missing Fields ===');
      for (const result of missing) {
        const field = SEO_CUSTOM_FIELDS.find(f => f.fieldname === result.fieldname);
        if (!field) continue;

        process.stdout.write(`Creating ${field.fieldname}... `);
        const createResult = await createField(field);

        if (createResult.success) {
          console.log('✓ created');
        } else {
          console.log(`✗ failed: ${createResult.error}`);
        }
      }
    } else {
      console.log('\nRun with --create to create missing fields');
    }
  }

  // Output JSON summary
  const summary = {
    timestamp: new Date().toISOString(),
    erpnext_url: ERPNEXT_URL,
    total_fields: results.length,
    existing: existing.length,
    missing: missing.length,
    errors: errors.length,
    fields: results.map(r => ({
      fieldname: r.fieldname,
      exists: r.exists,
      type: r.exists ? r.currentType : r.expectedType,
      error: r.error,
    })),
  };

  const outputFile = resolve(process.cwd(), 'seo-fields-status.json');
  const { writeFileSync } = await import('fs');
  writeFileSync(outputFile, JSON.stringify(summary, null, 2));
  console.log(`\nStatus saved to: ${outputFile}`);
}

main().catch(console.error);
