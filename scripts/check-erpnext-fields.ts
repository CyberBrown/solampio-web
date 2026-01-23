/**
 * Check ERPNext Item Group fields
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

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

async function main() {
  const headers: HeadersInit = {
    Authorization: `token ${ERPNEXT_API_KEY}:${ERPNEXT_API_SECRET}`,
    'Content-Type': 'application/json',
  };

  // Get a single item group to see all available fields
  const itemGroup = process.argv[2] || 'Inverters';
  const url = `${ERPNEXT_URL}/api/resource/Item Group/${encodeURIComponent(itemGroup)}`;

  console.log(`Fetching ${itemGroup} from ERPNext...`);
  const response = await fetch(url, { headers });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`ERPNext API error: ${response.status} - ${errorText}`);
    process.exit(1);
  }

  const data = await response.json() as { data: Record<string, unknown> };

  // Show all fields that contain 'sort' or 'order' or are custom
  console.log('\n=== All fields containing "sort", "order", or "custom" ===');
  for (const [key, value] of Object.entries(data.data)) {
    if (key.toLowerCase().includes('sort') ||
        key.toLowerCase().includes('order') ||
        key.toLowerCase().includes('custom') ||
        key === 'lft' || key === 'rgt') {
      console.log(`  ${key}: ${value}`);
    }
  }

  console.log('\n=== All non-null fields ===');
  for (const [key, value] of Object.entries(data.data)) {
    if (value !== null && value !== '' && value !== 0) {
      console.log(`  ${key}: ${JSON.stringify(value)}`);
    }
  }
}

main().catch(console.error);
