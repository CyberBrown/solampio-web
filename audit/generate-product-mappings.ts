#!/usr/bin/env bun
/**
 * Product URL Mapping Generator
 *
 * Maps old BigCommerce product URLs to new site URLs using SKU/product lookup.
 * Also handles static pages and deprecated categories.
 */

import unmatchedData from './still-unmatched.json';

interface UnmappedRedirect {
  id: string;
  old_url: string;
  new_url: string;
  source_type: string;
  notes: string;
  status: string;
}

const unmatched = unmatchedData as UnmappedRedirect[];

// Manual mappings for known static pages
const staticPageMappings: Record<string, string> = {
  '/shipping/': '/shipping-policy/',
  '/terms-and-conditions/': '/terms-and-conditions/',
  '/frequently-asked-questions/': '/faq/',
  '/disclaimer/': '/terms-and-conditions/',
  '/refund-return-policy/': '/refund-return-policy/',
  '/payment-policy/': '/terms-and-conditions/',
  '/customer-reviews/': '/',
  '/wholesale/': '/contact-us/',
  '/solamp-product-library/': '/products/',
  '/ai-voice-chat-with-redacted-chris/': '/',
  '/ebay/': '/products/',
  '/sponsorships-affiliations-and-organizations/': '/about-us/',
  '/careers/': '/contact-us/',
  '/portfolio/': '/about-us/',
};

// Deprecated categories → redirect to relevant parent or products page
const deprecatedCategories: Record<string, string> = {
  '/ev-charging/': '/products/',
  '/yard-sale/': '/products/',
  '/b2b-ninja-custom-products/': '/products/',
  '/solar-carports-canopies-and-awnings/': '/solar-power-systems/',
  '/aa-batteries/': '/batteries/',
};

// Products that should redirect to products page (discontinued/internal)
const discontinuedProductPatterns = [
  'test', 'shipping', 'fee', 'tax', 'extra-charge', 'difference',
  'quoted-shipping', 'ma-taxes', 'bank-fee', 'processing-fee',
  'miscellaneous', 'spare-parts', 'bos', 'prewire', 'backplate',
  'storage', 'custom-cable', 's-e-n-d', 'item8'
];

const results: { id: string; new_url: string; notes: string }[] = [];
const stillNeedLookup: UnmappedRedirect[] = [];

for (const redirect of unmatched) {
  const path = redirect.old_url.toLowerCase().replace(/^\/+|\/+$/g, '');

  // Handle static pages
  if (redirect.source_type === 'page') {
    const mapping = staticPageMappings[redirect.old_url] || staticPageMappings['/' + path + '/'];
    if (mapping) {
      results.push({
        id: redirect.id,
        new_url: mapping,
        notes: `Static page mapped to ${mapping}`
      });
    } else {
      results.push({
        id: redirect.id,
        new_url: '/',
        notes: `Static page - redirected to homepage`
      });
    }
    continue;
  }

  // Handle deprecated categories
  if (redirect.source_type === 'category') {
    const mapping = deprecatedCategories[redirect.old_url] || deprecatedCategories['/' + path + '/'];
    if (mapping) {
      results.push({
        id: redirect.id,
        new_url: mapping,
        notes: `Deprecated category - redirected to ${mapping}`
      });
    } else {
      results.push({
        id: redirect.id,
        new_url: '/products/',
        notes: `Deprecated category - redirected to products`
      });
    }
    continue;
  }

  // Handle products
  if (redirect.source_type === 'product') {
    // Check if it's a discontinued/internal product
    const isDiscontinued = discontinuedProductPatterns.some(p =>
      path.includes(p) || path === p
    );

    if (isDiscontinued) {
      results.push({
        id: redirect.id,
        new_url: '/products/',
        notes: `Discontinued/internal product - redirected to products`
      });
      continue;
    }

    // These need database lookup - add to list
    stillNeedLookup.push(redirect);
  }
}

// Output SQL for static pages and deprecated categories
console.log('-- Static Pages & Deprecated Categories Mappings');
console.log('-- Generated:', new Date().toISOString());
console.log(`-- Mapped: ${results.length}, Need DB Lookup: ${stillNeedLookup.length}`);
console.log('');

for (const r of results) {
  const escapedNewUrl = r.new_url.replace(/'/g, "''");
  const escapedNotes = r.notes.replace(/'/g, "''");
  console.log(`UPDATE url_redirects SET new_url = '${escapedNewUrl}', status = 'mapped', notes = '${escapedNotes}' WHERE id = '${r.id}';`);
}

console.log('\n-- PRODUCTS NEEDING DATABASE LOOKUP:');
for (const p of stillNeedLookup) {
  console.log(`-- ${p.old_url} | ${p.notes}`);
}

// Save for next step
Bun.write('audit/need-product-lookup.json', JSON.stringify(stillNeedLookup, null, 2));

console.error('\n=== SUMMARY ===');
console.error(`Mapped static/deprecated: ${results.length}`);
console.error(`Need product DB lookup: ${stillNeedLookup.length}`);
