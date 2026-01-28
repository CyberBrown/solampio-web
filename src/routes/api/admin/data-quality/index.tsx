/**
 * Product Data Quality Audit API
 *
 * Returns products with data quality issues that need admin attention.
 * Can be used for:
 * - Admin dashboard reporting
 * - ERPNext integration (sync issues back to Item doctype)
 * - Automated alerting
 *
 * GET /api/admin/data-quality
 * GET /api/admin/data-quality?issue=missing_image
 * GET /api/admin/data-quality?format=erpnext (for ERPNext sync)
 *
 * Issues detected:
 * - missing_image: Product has no image and no parent to inherit from
 * - missing_description: Product has no description
 * - missing_price: Product has no price
 * - missing_seo: Product hasn't been SEO optimized
 */

import type { RequestHandler } from '@builder.io/qwik-city';
import type { D1Database } from '@cloudflare/workers-types';

type IssueType = 'missing_image' | 'missing_description' | 'missing_price' | 'missing_seo';

interface ProductIssue {
  sku: string;
  title: string;
  issues: IssueType[];
  is_variant: boolean;
  variant_of: string | null;
  brand: string | null;
  category: string | null;
  erpnext_name: string;
}

interface ERPNextIssue {
  name: string; // ERPNext item name
  storefront_data_issues: string; // Comma-separated issues
  has_storefront_issues: 1 | 0;
}

export const onGet: RequestHandler = async ({ url, platform, json }) => {
  try {
    const db = platform.env?.DB as D1Database | undefined;
    if (!db) {
      json(500, { error: 'Database not configured' });
      return;
    }

    const filterIssue = url.searchParams.get('issue') as IssueType | null;
    const format = url.searchParams.get('format'); // 'erpnext' for ERPNext sync format
    const limit = parseInt(url.searchParams.get('limit') || '500', 10);

    // Get all visible products with relevant fields
    const result = await db
      .prepare(`
        SELECT
          p.sku,
          p.erpnext_name,
          p.title,
          p.description,
          p.description_clean,
          p.seo_description_summary,
          p.cf_image_id,
          p.image_url,
          p.price,
          p.seo_last_optimized,
          p.variant_of,
          p.has_variants,
          b.title as brand_name,
          c.title as category_name
        FROM storefront_products p
        LEFT JOIN storefront_brands b ON p.brand_id = b.id
        LEFT JOIN storefront_categories c ON p.categories LIKE '%"' || c.id || '"%'
        WHERE p.is_visible = 1
          AND p.has_variants = 0
        GROUP BY p.id
        ORDER BY p.title ASC
        LIMIT ?
      `)
      .bind(limit)
      .all<{
        sku: string;
        erpnext_name: string;
        title: string;
        description: string | null;
        description_clean: string | null;
        seo_description_summary: string | null;
        cf_image_id: string | null;
        image_url: string | null;
        price: number | null;
        seo_last_optimized: string | null;
        variant_of: string | null;
        has_variants: number;
        brand_name: string | null;
        category_name: string | null;
      }>();

    const products = result.results || [];

    // Get parent images for variants (to check if they can inherit)
    const variantsWithoutImages = products.filter(
      p => p.variant_of && !p.cf_image_id && !p.image_url
    );

    const parentImageMap = new Map<string, boolean>();

    if (variantsWithoutImages.length > 0) {
      const parentSkus = [...new Set(variantsWithoutImages.map(p => p.variant_of!))];
      const placeholders = parentSkus.map(() => '?').join(',');

      const parents = await db
        .prepare(`
          SELECT sku, cf_image_id, image_url
          FROM storefront_products
          WHERE sku IN (${placeholders})
        `)
        .bind(...parentSkus)
        .all<{ sku: string; cf_image_id: string | null; image_url: string | null }>();

      for (const parent of parents.results || []) {
        const hasImage = !!(parent.cf_image_id || parent.image_url);
        parentImageMap.set(parent.sku, hasImage);
      }
    }

    // Analyze each product for issues
    const productsWithIssues: ProductIssue[] = [];

    for (const product of products) {
      const issues: IssueType[] = [];

      // Check for missing image
      const hasOwnImage = !!(product.cf_image_id || product.image_url);
      const canInheritImage = product.variant_of ? parentImageMap.get(product.variant_of) : false;

      if (!hasOwnImage && !canInheritImage) {
        issues.push('missing_image');
      }

      // Check for missing description
      const hasDescription = !!(
        product.description ||
        product.description_clean ||
        product.seo_description_summary
      );
      if (!hasDescription) {
        issues.push('missing_description');
      }

      // Check for missing price
      if (!product.price || product.price <= 0) {
        issues.push('missing_price');
      }

      // Check for missing SEO optimization
      if (!product.seo_last_optimized) {
        issues.push('missing_seo');
      }

      // Only include products with issues
      if (issues.length > 0) {
        // Filter by specific issue if requested
        if (filterIssue && !issues.includes(filterIssue)) {
          continue;
        }

        productsWithIssues.push({
          sku: product.sku,
          title: product.title,
          issues,
          is_variant: !!product.variant_of,
          variant_of: product.variant_of,
          brand: product.brand_name,
          category: product.category_name,
          erpnext_name: product.erpnext_name,
        });
      }
    }

    // Calculate summary statistics
    const issueCounts: Record<IssueType, number> = {
      missing_image: 0,
      missing_description: 0,
      missing_price: 0,
      missing_seo: 0,
    };

    for (const product of productsWithIssues) {
      for (const issue of product.issues) {
        issueCounts[issue]++;
      }
    }

    // Format for ERPNext if requested
    if (format === 'erpnext') {
      const erpnextIssues: ERPNextIssue[] = productsWithIssues.map(p => ({
        name: p.erpnext_name,
        storefront_data_issues: p.issues.join(', '),
        has_storefront_issues: 1,
      }));

      // Also include products with no issues (to clear their flags)
      const productsWithoutIssues = products.filter(
        p => !productsWithIssues.some(pi => pi.sku === p.sku)
      );

      for (const p of productsWithoutIssues) {
        erpnextIssues.push({
          name: p.erpnext_name,
          storefront_data_issues: '',
          has_storefront_issues: 0,
        });
      }

      json(200, {
        format: 'erpnext',
        total_items: erpnextIssues.length,
        items_with_issues: productsWithIssues.length,
        items: erpnextIssues,
      });
      return;
    }

    // Standard response
    json(200, {
      summary: {
        total_products: products.length,
        products_with_issues: productsWithIssues.length,
        products_healthy: products.length - productsWithIssues.length,
        issue_counts: issueCounts,
        generated_at: new Date().toISOString(),
      },
      // Group by issue type for easier review
      by_issue: {
        missing_image: productsWithIssues
          .filter(p => p.issues.includes('missing_image'))
          .map(p => ({ sku: p.sku, title: p.title, is_variant: p.is_variant, variant_of: p.variant_of })),
        missing_description: productsWithIssues
          .filter(p => p.issues.includes('missing_description'))
          .map(p => ({ sku: p.sku, title: p.title })),
        missing_price: productsWithIssues
          .filter(p => p.issues.includes('missing_price'))
          .map(p => ({ sku: p.sku, title: p.title })),
        missing_seo: productsWithIssues
          .filter(p => p.issues.includes('missing_seo'))
          .map(p => ({ sku: p.sku, title: p.title })),
      },
      products: filterIssue ? productsWithIssues : undefined, // Only include full list if filtering
    });
  } catch (error) {
    console.error('Data quality audit error:', error);
    json(500, {
      error: 'Audit failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
