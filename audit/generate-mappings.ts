#!/usr/bin/env bun
/**
 * URL Redirect Mapping Generator
 *
 * Analyzes unmapped BigCommerce URLs and generates SQL to fix them.
 *
 * Run: bun audit/generate-mappings.ts
 */

import categoriesData from './categories.json';
import brandsData from './brands.json';
import unmappedData from './unmapped.json';

interface Category {
  id: string;
  slug: string;
  title: string;
  parent_id: string | null;
}

interface Brand {
  id: string;
  slug: string;
  title: string;
}

interface UnmappedRedirect {
  id: string;
  old_url: string;
  new_url: string;
  source_type: string;
  notes: string;
  status: string;
}

const categories = categoriesData as Category[];
const brands = brandsData as Brand[];
const unmapped = unmappedData as UnmappedRedirect[];

// Build lookup maps
const catBySlug = new Map(categories.map(c => [c.slug.toLowerCase(), c]));
const catById = new Map(categories.map(c => [c.id, c]));
const brandBySlug = new Map(brands.map(b => [b.slug.toLowerCase(), b]));

// Build parent lookup for nested URLs
function getParentSlug(cat: Category): string | null {
  if (!cat.parent_id) return null;
  const parent = catById.get(cat.parent_id);
  return parent?.slug || null;
}

// Normalize URL path
function normalizePath(url: string): string {
  return url.toLowerCase().replace(/^\/+|\/+$/g, '');
}

// Known manual mappings for URLs that don't match by slug
const manualMappings: Record<string, string> = {
  'shop-all': '/products/',
  'lithium-battery': '/lithium-batteries/',
  'shop-by-brand': '/brands/',
  'all-categories': '/categories/',
  'brands': '/brands/',
  'bestsellers': '/products/',
  'featured-products': '/products/',
  'on-sale': '/products/',
  'new-products': '/products/',
  'clearance': '/products/',
};

interface MappingResult {
  id: string;
  old_url: string;
  new_url: string;
  matched_by: string;
  notes: string;
}

const results: MappingResult[] = [];
const unmatched: UnmappedRedirect[] = [];

for (const redirect of unmapped) {
  const path = normalizePath(redirect.old_url);
  const segments = path.split('/').filter(Boolean);

  let newUrl: string | null = null;
  let matchedBy = '';

  if (redirect.source_type === 'category') {
    // Check manual mappings first
    if (manualMappings[path]) {
      newUrl = manualMappings[path];
      matchedBy = 'manual mapping';
    }
    // Try nested URL: /parent/child/
    else if (segments.length === 2) {
      const [parentSlug, childSlug] = segments;
      const parentCat = catBySlug.get(parentSlug);
      const childCat = catBySlug.get(childSlug);

      if (parentCat && childCat && childCat.parent_id === parentCat.id) {
        newUrl = `/${parentSlug}/${childSlug}/`;
        matchedBy = 'nested match';
      } else if (childCat) {
        // Child exists but parent doesn't match - redirect to child
        const actualParent = getParentSlug(childCat);
        if (actualParent) {
          newUrl = `/${actualParent}/${childCat.slug}/`;
          matchedBy = 'child match (fixed parent)';
        } else {
          newUrl = `/${childCat.slug}/`;
          matchedBy = 'child match (top-level)';
        }
      } else if (parentCat) {
        // Parent exists but child doesn't - redirect to parent
        newUrl = `/${parentCat.slug}/`;
        matchedBy = 'parent only match';
      }
    }
    // Single segment: direct category match
    else if (segments.length === 1) {
      const slug = segments[0];
      const exactMatch = catBySlug.get(slug);
      if (exactMatch) {
        const parent = getParentSlug(exactMatch);
        if (parent) {
          newUrl = `/${parent}/${exactMatch.slug}/`;
          matchedBy = 'exact match (with parent)';
        } else {
          newUrl = `/${exactMatch.slug}/`;
          matchedBy = 'exact match';
        }
      } else {
        // Try fuzzy match (singular/plural, case)
        const fuzzyMatch = [...catBySlug.values()].find(c => {
          const n1 = c.slug.replace(/-/g, '');
          const n2 = slug.replace(/-/g, '');
          return n1 === n2 ||
            n1 === n2 + 's' || n1 + 's' === n2 ||
            n1 === n2 + 'es' || n1 + 'es' === n2 ||
            n1.replace('ies', 'y') === n2 || n1 === n2.replace('ies', 'y');
        });
        if (fuzzyMatch) {
          const parent = getParentSlug(fuzzyMatch);
          if (parent) {
            newUrl = `/${parent}/${fuzzyMatch.slug}/`;
            matchedBy = 'fuzzy match (with parent)';
          } else {
            newUrl = `/${fuzzyMatch.slug}/`;
            matchedBy = 'fuzzy match';
          }
        }
      }
    }
  } else if (redirect.source_type === 'brand') {
    const slug = segments[segments.length - 1];
    const brand = brandBySlug.get(slug);
    if (brand) {
      newUrl = `/${brand.slug}/`;
      matchedBy = 'exact brand match';
    }
  } else if (redirect.source_type === 'product') {
    // Product URLs need SKU lookup - keep in manual review for now
    matchedBy = 'product - needs SKU lookup';
  }

  if (newUrl) {
    results.push({
      id: redirect.id,
      old_url: redirect.old_url,
      new_url: newUrl,
      matched_by: matchedBy,
      notes: redirect.notes
    });
  } else {
    unmatched.push(redirect);
  }
}

// Generate SQL
console.log('-- URL Redirect Mapping Fix');
console.log('-- Generated:', new Date().toISOString());
console.log(`-- Matched: ${results.length}, Unmatched: ${unmatched.length}`);
console.log('');

for (const r of results) {
  const escapedNewUrl = r.new_url.replace(/'/g, "''");
  const escapedNotes = `Mapped: ${r.matched_by}`.replace(/'/g, "''");
  console.log(`UPDATE url_redirects SET new_url = '${escapedNewUrl}', status = 'mapped', notes = '${escapedNotes}' WHERE id = '${r.id}';`);
}

console.log('\n-- UNMATCHED REDIRECTS (need manual review):');
for (const u of unmatched) {
  console.log(`-- ${u.old_url} (${u.source_type}) - ${u.notes}`);
}

// Summary
console.error('\n=== SUMMARY ===');
console.error(`Total unmapped: ${unmapped.length}`);
console.error(`Successfully mapped: ${results.length}`);
console.error(`Still need review: ${unmatched.length}`);
console.error('\nMatched by method:');
const byMethod: Record<string, number> = {};
for (const r of results) {
  byMethod[r.matched_by] = (byMethod[r.matched_by] || 0) + 1;
}
for (const [method, count] of Object.entries(byMethod).sort((a, b) => b[1] - a[1])) {
  console.error(`  ${method}: ${count}`);
}

// Save results
Bun.write('audit/mapping-results.json', JSON.stringify(results, null, 2));
Bun.write('audit/still-unmatched.json', JSON.stringify(unmatched, null, 2));
