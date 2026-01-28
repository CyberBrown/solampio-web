/**
 * URL Redirect Mapping Fixer
 *
 * This script analyzes unmapped BigCommerce URLs and creates proper redirect mappings
 * to the new Qwik site URL structure.
 *
 * Run with: npx wrangler d1 execute solampio-migration --remote --file audit/fix-url-mappings.sql
 */

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
  source_type: string;
  notes: string;
}

// Helper: normalize slug for comparison
function normalizeSlug(url: string): string {
  return url
    .toLowerCase()
    .replace(/^\/+|\/+$/g, '') // Remove leading/trailing slashes
    .split('/')
    .pop() || ''; // Get the last segment
}

// Helper: generate new URL for category
function getCategoryNewUrl(oldUrl: string, categories: Map<string, Category>): string | null {
  const segments = oldUrl.replace(/^\/+|\/+$/g, '').split('/');

  // For nested URLs like /solar-panels/off-grid-solar-panels/
  // The new site uses /parent/child/ structure
  if (segments.length === 2) {
    const [parent, child] = segments;
    const parentCat = [...categories.values()].find(c => c.slug === parent);
    const childCat = [...categories.values()].find(c => c.slug === child);

    if (parentCat && childCat && childCat.parent_id === parentCat.id) {
      return `/${parent}/${child}/`;
    }
    // If parent doesn't match, just redirect to child category
    if (childCat) {
      return `/${child}/`;
    }
  }

  // Single segment - direct category match
  const slug = segments[segments.length - 1];
  const category = [...categories.values()].find(c =>
    c.slug === slug ||
    c.slug === slug.replace(/-/g, '') ||
    slug === c.slug.replace(/-/g, '')
  );

  if (category) {
    return `/${category.slug}/`;
  }

  // Try fuzzy match
  const fuzzyMatch = [...categories.values()].find(c => {
    const normalized1 = c.slug.replace(/-/g, '').toLowerCase();
    const normalized2 = slug.replace(/-/g, '').toLowerCase();
    return normalized1 === normalized2 ||
           normalized1.includes(normalized2) ||
           normalized2.includes(normalized1);
  });

  return fuzzyMatch ? `/${fuzzyMatch.slug}/` : null;
}

// Main mapping logic
export function generateMappings(
  categories: Category[],
  brands: Brand[],
  unmapped: UnmappedRedirect[]
): { id: string; new_url: string; notes: string }[] {
  const catMap = new Map(categories.map(c => [c.id, c]));
  const catBySlug = new Map(categories.map(c => [c.slug, c]));
  const brandBySlug = new Map(brands.map(b => [b.slug, b]));

  const results: { id: string; new_url: string; notes: string }[] = [];

  for (const redirect of unmapped) {
    const oldUrl = redirect.old_url;
    const segments = oldUrl.replace(/^\/+|\/+$/g, '').toLowerCase().split('/');

    if (redirect.source_type === 'category') {
      // Category mapping
      if (segments.length >= 2) {
        // Nested: /parent/child/ → check if child exists
        const childSlug = segments[segments.length - 1];
        const parentSlug = segments[segments.length - 2];

        const childCat = catBySlug.get(childSlug);
        const parentCat = catBySlug.get(parentSlug);

        if (childCat && parentCat) {
          results.push({
            id: redirect.id,
            new_url: `/${parentSlug}/${childSlug}/`,
            notes: `Matched: ${parentCat.title} > ${childCat.title}`
          });
          continue;
        } else if (childCat) {
          results.push({
            id: redirect.id,
            new_url: `/${childSlug}/`,
            notes: `Matched child only: ${childCat.title}`
          });
          continue;
        }
      }

      // Single segment
      const slug = segments[segments.length - 1];
      const exactMatch = catBySlug.get(slug);
      if (exactMatch) {
        results.push({
          id: redirect.id,
          new_url: `/${exactMatch.slug}/`,
          notes: `Exact match: ${exactMatch.title}`
        });
        continue;
      }

      // Known mappings for BC → New site
      const manualMappings: Record<string, string> = {
        'shop-all': '/products/',
        'lithium-battery': '/lithium-batteries/',
        'agm': '/agm/',
      };

      if (manualMappings[slug]) {
        results.push({
          id: redirect.id,
          new_url: manualMappings[slug],
          notes: `Manual mapping`
        });
        continue;
      }

      // No match - mark for review
      results.push({
        id: redirect.id,
        new_url: '',
        notes: `No match found for: ${oldUrl}`
      });

    } else if (redirect.source_type === 'brand') {
      const slug = segments[segments.length - 1];
      const brand = brandBySlug.get(slug);
      if (brand) {
        results.push({
          id: redirect.id,
          new_url: `/${brand.slug}/`,
          notes: `Matched brand: ${brand.title}`
        });
      }
    }
  }

  return results;
}
