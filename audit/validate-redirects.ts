#!/usr/bin/env bun
/**
 * URL Redirect Validation Script
 *
 * Tests all 680 BigCommerce URLs against the preview/production site
 * to verify redirects are working correctly before DNS cutover.
 *
 * Usage:
 *   bun audit/validate-redirects.ts                    # Test against preview
 *   bun audit/validate-redirects.ts https://solampio.com  # Test against production
 */

import urlMappingData from './url-mapping.json';

interface UrlMapping {
  old_url: string;
  new_url: string;
  source_type: string;
}

const urlMappings = urlMappingData as UrlMapping[];

// Configuration
const BASE_URL = process.argv[2] || 'https://solampio-web.pages.dev';
const CONCURRENCY = 10; // Number of parallel requests
const TIMEOUT_MS = 10000;

interface TestResult {
  old_url: string;
  expected_url: string;
  actual_status: number;
  actual_location: string | null;
  passed: boolean;
  error?: string;
}

// Apply the same transformation the plugin does
function transformTarget(newUrl: string): string {
  let target = newUrl;
  // Strip /products/ prefix unless it's exactly /products/
  if (target.startsWith('/products/') && target !== '/products/') {
    target = '/' + target.slice('/products/'.length);
  }
  // Ensure trailing slash
  if (!target.endsWith('/')) {
    target = target + '/';
  }
  return target;
}

async function testUrl(mapping: UrlMapping): Promise<TestResult> {
  const fullUrl = `${BASE_URL}${mapping.old_url}`;
  const expectedTarget = transformTarget(mapping.new_url);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch(fullUrl, {
      method: 'HEAD',
      redirect: 'manual', // Don't follow redirects
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const location = response.headers.get('location');
    const status = response.status;

    // Determine if test passed
    let passed = false;

    if (mapping.old_url === mapping.new_url) {
      // URLs are the same - should return 200
      passed = status === 200;
    } else {
      // URLs differ - should return 301 with correct location
      if (status === 301 || status === 302 || status === 308) {
        // Normalize both for comparison
        const normalizedLocation = location?.replace(/\/$/, '') || '';
        const normalizedExpected = expectedTarget.replace(/\/$/, '');
        passed = normalizedLocation === normalizedExpected ||
                 normalizedLocation === `${BASE_URL}${normalizedExpected}`;
      }
    }

    return {
      old_url: mapping.old_url,
      expected_url: expectedTarget,
      actual_status: status,
      actual_location: location,
      passed,
    };
  } catch (error) {
    return {
      old_url: mapping.old_url,
      expected_url: expectedTarget,
      actual_status: 0,
      actual_location: null,
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function runBatch(mappings: UrlMapping[]): Promise<TestResult[]> {
  return Promise.all(mappings.map(testUrl));
}

async function main() {
  console.log(`\n🔍 URL Redirect Validation Script`);
  console.log(`${'='.repeat(50)}`);
  console.log(`Target: ${BASE_URL}`);
  console.log(`Total URLs: ${urlMappings.length}`);
  console.log(`Concurrency: ${CONCURRENCY}`);
  console.log(`${'='.repeat(50)}\n`);

  const results: TestResult[] = [];
  const batches: UrlMapping[][] = [];

  // Split into batches
  for (let i = 0; i < urlMappings.length; i += CONCURRENCY) {
    batches.push(urlMappings.slice(i, i + CONCURRENCY));
  }

  let processed = 0;

  for (const batch of batches) {
    const batchResults = await runBatch(batch);
    results.push(...batchResults);
    processed += batch.length;

    // Progress indicator
    const pct = Math.round((processed / urlMappings.length) * 100);
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    process.stdout.write(`\r  Progress: ${processed}/${urlMappings.length} (${pct}%) | ✅ ${passed} | ❌ ${failed}`);
  }

  console.log('\n');

  // Analyze results
  const passed = results.filter(r => r.passed);
  const failed = results.filter(r => !r.passed);

  console.log(`\n📊 Results Summary`);
  console.log(`${'='.repeat(50)}`);
  console.log(`✅ Passed: ${passed.length} (${Math.round(passed.length / results.length * 100)}%)`);
  console.log(`❌ Failed: ${failed.length} (${Math.round(failed.length / results.length * 100)}%)`);

  if (failed.length > 0) {
    console.log(`\n❌ Failed URLs:`);
    console.log(`${'─'.repeat(50)}`);

    // Group failures by type
    const byStatus: Record<string, TestResult[]> = {};
    for (const f of failed) {
      const key = f.error || `Status ${f.actual_status}`;
      if (!byStatus[key]) byStatus[key] = [];
      byStatus[key].push(f);
    }

    for (const [reason, items] of Object.entries(byStatus)) {
      console.log(`\n  ${reason}: (${items.length} URLs)`);
      // Show first 10 of each type
      for (const item of items.slice(0, 10)) {
        console.log(`    ${item.old_url}`);
        console.log(`      Expected: ${item.expected_url}`);
        if (item.actual_location) {
          console.log(`      Got: ${item.actual_location}`);
        }
      }
      if (items.length > 10) {
        console.log(`    ... and ${items.length - 10} more`);
      }
    }
  }

  // Save detailed results
  const outputFile = 'audit/validation-results.json';
  await Bun.write(outputFile, JSON.stringify({
    timestamp: new Date().toISOString(),
    target: BASE_URL,
    summary: {
      total: results.length,
      passed: passed.length,
      failed: failed.length,
      passRate: `${Math.round(passed.length / results.length * 100)}%`,
    },
    failures: failed,
  }, null, 2));

  console.log(`\n📁 Detailed results saved to: ${outputFile}`);

  // Exit with error code if failures
  if (failed.length > 0) {
    console.log(`\n⚠️  ${failed.length} URLs failed validation. Review before launch.`);
    process.exit(1);
  } else {
    console.log(`\n✅ All URLs validated successfully! Ready for launch.`);
    process.exit(0);
  }
}

main();
