/**
 * Article Import API Endpoint
 *
 * Triggers import of all articles from Intercom Help Center into D1.
 * Protected by API key to prevent unauthorized imports.
 *
 * POST /api/articles/import/
 * Headers:
 *   Authorization: Bearer <IMPORT_API_KEY>
 *
 * Query params:
 *   dry_run=true - Preview what would be imported without writing to D1
 */

import type { RequestHandler } from '@builder.io/qwik-city';
import { upsertArticle, type ArticleSection } from '~/lib/db';

// Intercom API Types
interface IntercomArticle {
  id: string;
  type: 'article';
  workspace_id: string;
  title: string;
  description: string;
  body: string;
  author_id: number;
  state: 'published' | 'draft';
  created_at: number;
  updated_at: number;
  url: string;
  parent_id: number | null;
  parent_ids: number[];
  parent_type: 'collection' | null;
  default_locale: string;
}

interface IntercomArticlesResponse {
  type: 'list';
  data: IntercomArticle[];
  total_count: number;
  pages: {
    type: 'pages';
    page: number;
    per_page: number;
    total_pages: number;
  };
}

interface IntercomCollection {
  id: string;
  name: string;
  description: string;
  created_at: number;
  updated_at: number;
  url: string;
  order: number;
}

interface IntercomCollectionsResponse {
  type: 'list';
  data: IntercomCollection[];
  total_count: number;
  pages: {
    type: 'pages';
    page: number;
    per_page: number;
    total_pages: number;
  };
}

// Collection ID to Section mapping
const COLLECTION_TO_SECTION: Record<string, ArticleSection> = {
  '11267405': 'knowledge-base', // Cleantech Archives
  '11719079': 'guides',         // Solamp's Scope of Work
  '11267354': 'faq',            // FAQs
  '11267353': 'payments',       // Payments
};

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}

function extractExcerpt(html: string, maxLength = 200): string {
  const text = html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
}

async function fetchAllArticles(token: string): Promise<IntercomArticle[]> {
  const allArticles: IntercomArticle[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(`https://api.intercom.io/articles?page=${page}&per_page=50`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Intercom-Version': '2.11',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Intercom API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json() as IntercomArticlesResponse;
    allArticles.push(...data.data);

    hasMore = page < data.pages.total_pages;
    page++;
  }

  return allArticles;
}

async function fetchCollections(token: string): Promise<IntercomCollection[]> {
  const response = await fetch('https://api.intercom.io/help_center/collections', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Intercom-Version': '2.11',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Intercom API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json() as IntercomCollectionsResponse;
  return data.data;
}

export const onPost: RequestHandler = async ({ request, platform, json, url }) => {
  const startTime = Date.now();

  try {
    // Check authorization
    const authHeader = request.headers.get('Authorization');
    const expectedKey = platform.env?.IMPORT_API_KEY;

    if (!expectedKey) {
      json(500, { error: 'IMPORT_API_KEY not configured' });
      return;
    }

    if (!authHeader || authHeader !== `Bearer ${expectedKey}`) {
      json(401, { error: 'Unauthorized' });
      return;
    }

    // Get Intercom token
    const intercomToken = platform.env?.INTERCOM_ACCESS_TOKEN;
    if (!intercomToken) {
      json(500, { error: 'INTERCOM_ACCESS_TOKEN not configured' });
      return;
    }

    const db = platform.env?.DB;
    if (!db) {
      json(500, { error: 'Database not configured' });
      return;
    }

    const dryRun = url.searchParams.get('dry_run') === 'true';

    // Fetch collections first for reference
    const collections = await fetchCollections(intercomToken);
    const collectionMap = new Map(collections.map(c => [c.id, c.name]));

    // Fetch all articles
    const intercomArticles = await fetchAllArticles(intercomToken);

    const results = {
      total_fetched: intercomArticles.length,
      imported: 0,
      skipped: 0,
      errors: [] as Array<{ id: string; title: string; error: string }>,
      by_section: {} as Record<string, number>,
      articles: [] as Array<{ id: string; slug: string; title: string; section: string }>,
      dry_run: dryRun,
      collections: collections.map(c => ({ id: c.id, name: c.name })),
    };

    for (const article of intercomArticles) {
      try {
        // Skip drafts
        if (article.state !== 'published') {
          results.skipped++;
          continue;
        }

        // Determine section from parent collection
        let section: ArticleSection = 'knowledge-base';
        if (article.parent_ids && article.parent_ids.length > 0) {
          for (const parentId of article.parent_ids) {
            const mappedSection = COLLECTION_TO_SECTION[String(parentId)];
            if (mappedSection) {
              section = mappedSection;
              break;
            }
          }
        }

        // Extract slug from URL or generate from title
        let slug = generateSlug(article.title);
        const urlMatch = article.url.match(/\/articles\/\d+-(.+)$/);
        if (urlMatch) {
          slug = urlMatch[1];
        }

        // Get collection name for category
        const categoryName = article.parent_ids?.length > 0
          ? collectionMap.get(String(article.parent_ids[0])) || null
          : null;

        const articleData = {
          id: `intercom-${article.id}`,
          slug,
          title: article.title,
          content: article.body || '',
          excerpt: article.description || extractExcerpt(article.body || ''),
          section,
          category: categoryName,
          tags: null,
          related_articles: null,
          related_products: null,
          source_url: article.url,
          source_id: article.id,
          author: null,
        };

        if (!dryRun) {
          await upsertArticle(db, articleData);
        }

        results.imported++;
        results.by_section[section] = (results.by_section[section] || 0) + 1;
        results.articles.push({
          id: articleData.id,
          slug: articleData.slug,
          title: articleData.title,
          section: articleData.section,
        });
      } catch (err) {
        results.errors.push({
          id: article.id,
          title: article.title,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    const duration = Date.now() - startTime;

    json(200, {
      success: true,
      duration_ms: duration,
      ...results,
    });
  } catch (error) {
    json(500, {
      error: 'Import failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      duration_ms: Date.now() - startTime,
    });
  }
};

// Status/info endpoint
export const onGet: RequestHandler = async ({ json }) => {
  json(200, {
    status: 'ok',
    endpoint: 'articles/import',
    method: 'POST',
    description: 'Import articles from Intercom Help Center',
    headers: {
      'Authorization': 'Bearer <IMPORT_API_KEY>',
    },
    query_params: {
      'dry_run': 'true to preview without writing to D1',
    },
    collection_mapping: COLLECTION_TO_SECTION,
  });
};
