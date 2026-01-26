/**
 * Article Sync API Endpoint
 *
 * Receives webhooks from ERPNext to create/update articles.
 * Used for ongoing content sync after initial migration.
 *
 * POST /api/articles/sync/
 *
 * Expected payload from ERPNext Web Page doctype:
 * {
 *   name: string,          // ERPNext docname (used as article ID)
 *   title: string,
 *   route: string,         // e.g., "/learn/archives/knowledge-base/solar-basics"
 *   main_section: string,  // HTML content
 *   description: string,   // Excerpt/meta description
 *   custom_section: string // Article section override
 * }
 */

import type { RequestHandler } from '@builder.io/qwik-city';
import { upsertArticle, type ArticleSection } from '~/lib/db';
import { rejectUnauthorized } from '~/lib/api-auth';

interface ERPNextWebPagePayload {
  name: string;
  title: string;
  route?: string;
  main_section?: string;
  description?: string;
  custom_section?: ArticleSection;
  published?: boolean | number;
}

/**
 * Generate URL-safe slug from title
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}

/**
 * Extract slug and section from ERPNext route
 * Route format: /learn/archives/{section}/{slug}/
 */
function parseRoute(route: string): { section: ArticleSection | null; slug: string | null } {
  const match = route.match(/\/learn\/archives\/([^/]+)\/([^/]+)/);
  if (match) {
    const [, section, slug] = match;
    const validSections: ArticleSection[] = ['knowledge-base', 'guides', 'faq', 'videos', 'payments'];
    if (validSections.includes(section as ArticleSection)) {
      return { section: section as ArticleSection, slug };
    }
  }
  return { section: null, slug: null };
}

export const onPost: RequestHandler = async (requestEvent) => {
  if (rejectUnauthorized(requestEvent, 'SYNC_API_KEY')) return;

  const { request, platform, json } = requestEvent;
  try {
    const db = platform.env?.DB;
    if (!db) {
      json(500, { error: 'Database not configured' });
      return;
    }

    const payload = await request.json() as ERPNextWebPagePayload;

    // Validate required fields
    if (!payload.name || !payload.title) {
      json(400, { error: 'Missing required fields: name, title' });
      return;
    }

    // Skip unpublished pages
    if (payload.published === false || payload.published === 0) {
      json(200, { skipped: true, reason: 'Page not published' });
      return;
    }

    // Determine section and slug from route or defaults
    let section: ArticleSection = payload.custom_section || 'knowledge-base';
    let slug = generateSlug(payload.title);

    if (payload.route) {
      const parsed = parseRoute(payload.route);
      if (parsed.section) section = parsed.section;
      if (parsed.slug) slug = parsed.slug;
    }

    // Build article for upsert
    const article = {
      id: `erpnext-${payload.name}`,
      slug,
      title: payload.title,
      content: payload.main_section || '',
      excerpt: payload.description || null,
      section,
      category: null,
      tags: null,
      related_articles: null,
      related_products: null,
      source_url: null,
      source_id: payload.name,
      author: null,
    };

    await upsertArticle(db, article);

    json(200, {
      success: true,
      article: {
        id: article.id,
        slug: article.slug,
        section: article.section,
        url: `/learn/archives/${section}/${slug}/`,
      },
    });
  } catch (error) {
    console.error('Article sync error:', error);
    json(500, {
      error: 'Failed to sync article',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Health check endpoint
export const onGet: RequestHandler = async ({ json }) => {
  json(200, {
    status: 'ok',
    endpoint: 'articles/sync',
    method: 'POST',
    description: 'Webhook endpoint for ERPNext article sync',
  });
};
