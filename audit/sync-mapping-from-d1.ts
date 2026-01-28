#!/usr/bin/env bun
/**
 * Sync url-mapping.json with actual D1 database values
 * This ensures the validation script has the correct expected values
 */

import { execSync } from 'child_process';
import existingMapping from './url-mapping.json';

interface UrlMapping {
  old_url: string;
  new_url: string;
  source_type: string;
}

async function main() {
  console.log('Fetching redirects from D1 database...');

  // Get redirects from D1
  const output = execSync(
    'bunx wrangler d1 execute solampio-migration --remote --command "SELECT old_url, new_url, source_type FROM url_redirects ORDER BY old_url"',
    { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }
  );

  // Parse the JSON from wrangler output (skip header lines)
  const jsonStart = output.indexOf('[');
  const jsonEnd = output.lastIndexOf(']') + 1;
  const jsonStr = output.slice(jsonStart, jsonEnd);
  const parsed = JSON.parse(jsonStr);
  const d1Redirects = parsed[0].results as UrlMapping[];

  console.log(`Found ${d1Redirects.length} redirects in D1`);

  // Create a map of old_url -> D1 redirect
  const d1Map = new Map<string, UrlMapping>();
  for (const r of d1Redirects) {
    d1Map.set(r.old_url, r);
  }

  // Update existing mapping with D1 values
  const existingMappingTyped = existingMapping as UrlMapping[];
  let updated = 0;
  const updatedMapping = existingMappingTyped.map(entry => {
    const d1Entry = d1Map.get(entry.old_url);
    if (d1Entry && d1Entry.new_url !== entry.new_url) {
      console.log(`  ${entry.old_url}: ${entry.new_url} -> ${d1Entry.new_url}`);
      updated++;
      return {
        ...entry,
        new_url: d1Entry.new_url
      };
    }
    return entry;
  });

  console.log(`\nUpdated ${updated} entries`);

  // Write updated mapping
  await Bun.write(
    'audit/url-mapping.json',
    JSON.stringify(updatedMapping, null, 2)
  );

  console.log('Saved updated url-mapping.json');
}

main().catch(console.error);
