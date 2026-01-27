/**
 * Inherit Variant Images from Parent Products
 *
 * Updates variants that have no image to use their parent product's image.
 * POST /api/admin/inherit-variant-images/
 */

import type { RequestHandler } from '@builder.io/qwik-city';
import { rejectUnauthorized } from '~/lib/api-auth';

export const onPost: RequestHandler = async (requestEvent) => {
  if (rejectUnauthorized(requestEvent, 'ADMIN_API_KEY')) return;

  const { platform, json } = requestEvent;
  const db = platform.env?.DB;
  if (!db) {
    json(500, { error: 'Database not configured' });
    return;
  }

  try {
    // Find variants missing images that have a parent with an image
    const variants = await db
      .prepare(`
        SELECT v.id, v.sku, v.variant_of, p.cf_image_id, p.image_url
        FROM storefront_products v
        INNER JOIN storefront_products p ON v.variant_of = p.erpnext_name
        WHERE v.variant_of IS NOT NULL
          AND (v.cf_image_id IS NULL OR v.cf_image_id = '')
          AND p.cf_image_id IS NOT NULL
      `)
      .all();

    const rows = variants.results as { id: string; sku: string; variant_of: string; cf_image_id: string; image_url: string }[];

    // Use D1 batch API for efficiency
    const batchSize = 50;
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      const statements = batch.map(row =>
        db.prepare('UPDATE storefront_products SET cf_image_id = ?, image_url = ? WHERE id = ?')
          .bind(row.cf_image_id, row.image_url || null, row.id)
      );
      try {
        await db.batch(statements);
        success += batch.length;
      } catch (e) {
        failed += batch.length;
        if (errors.length < 3) {
          errors.push(e instanceof Error ? e.message : String(e));
        }
      }
    }

    json(200, {
      success: true,
      total: rows.length,
      updated: success,
      failed,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    json(500, {
      error: 'Failed to inherit variant images',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const onGet: RequestHandler = async ({ json }) => {
  json(200, {
    endpoint: 'inherit-variant-images',
    method: 'POST',
    description: 'Copies parent product images to variants that have no image set.',
  });
};
