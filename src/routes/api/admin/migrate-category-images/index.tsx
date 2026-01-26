/**
 * Category Image Migration API Endpoint
 *
 * POST /api/admin/migrate-category-images/
 * Runs the category image migration to populate cf_image_id and cf_category_image_url
 * from the hardcoded mapping.
 *
 * GET /api/admin/migrate-category-images/
 * Returns a preview of what would be migrated without making changes.
 */

import type { RequestHandler } from '@builder.io/qwik-city';
import {
  CATEGORY_IMAGE_MAPPING,
  buildCfImageUrl,
  migrateCategoryImages,
  type MigrationResult,
} from '../../../../../scripts/migrate-category-images';
import { rejectUnauthorized } from '~/lib/api-auth';

export const onGet: RequestHandler = async (requestEvent) => {
  if (rejectUnauthorized(requestEvent, 'ADMIN_API_KEY')) return;

  const { platform, json } = requestEvent;
  try {
    const db = platform.env?.DB;
    if (!db) {
      json(500, { error: 'Database not configured' });
      return;
    }

    // Preview mode - show what would be migrated
    const categoriesResponse = await db
      .prepare('SELECT id, title, cf_image_id, cf_category_image_url FROM storefront_categories ORDER BY title')
      .all();

    const categoriesList = (categoriesResponse.results || []) as Array<{
      id: string;
      title: string;
      cf_image_id: string | null;
      cf_category_image_url: string | null;
    }>;

    const preview: Array<{
      title: string;
      currentCfImageId: string | null;
      currentUrl: string | null;
      newCfImageId: string | null;
      newUrl: string | null;
      action: 'update' | 'skip' | 'no-mapping';
    }> = [];

    const missing: string[] = [];

    for (const category of categoriesList) {
      const cfImageId = CATEGORY_IMAGE_MAPPING[category.title];

      if (!cfImageId) {
        preview.push({
          title: category.title,
          currentCfImageId: category.cf_image_id,
          currentUrl: category.cf_category_image_url,
          newCfImageId: null,
          newUrl: null,
          action: 'no-mapping',
        });
        missing.push(category.title);
        continue;
      }

      const expectedUrl = buildCfImageUrl(cfImageId, 'card');
      const needsUpdate = category.cf_image_id !== cfImageId || category.cf_category_image_url !== expectedUrl;

      preview.push({
        title: category.title,
        currentCfImageId: category.cf_image_id,
        currentUrl: category.cf_category_image_url,
        newCfImageId: cfImageId,
        newUrl: expectedUrl,
        action: needsUpdate ? 'update' : 'skip',
      });
    }

    json(200, {
      status: 'preview',
      message: 'This is a preview. Send POST request to execute migration.',
      totalCategories: categoriesList.length,
      mappingsAvailable: Object.keys(CATEGORY_IMAGE_MAPPING).length,
      willUpdate: preview.filter(p => p.action === 'update').length,
      willSkip: preview.filter(p => p.action === 'skip').length,
      missingMappings: missing.length,
      missingCategories: missing,
      preview,
    });
  } catch (error) {
    console.error('Migration preview error:', error);
    json(500, {
      error: 'Failed to preview migration',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const onPost: RequestHandler = async (requestEvent) => {
  if (rejectUnauthorized(requestEvent, 'ADMIN_API_KEY')) return;

  const { platform, json } = requestEvent;
  try {
    const db = platform.env?.DB;
    if (!db) {
      json(500, { error: 'Database not configured' });
      return;
    }

    // Run the migration
    const result: MigrationResult = await migrateCategoryImages(db);

    json(200, {
      status: 'completed',
      message: `Migration completed. Updated ${result.updated} categories.`,
      ...result,
    });
  } catch (error) {
    console.error('Migration error:', error);
    json(500, {
      error: 'Failed to run migration',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
