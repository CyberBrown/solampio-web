/**
 * Intercom Content Fetcher
 *
 * Fetches articles from Intercom Help Center API and transforms them
 * for import into D1 articles table.
 *
 * Usage:
 *   - Import and call fetchAndTransformArticles() with the Intercom token
 *   - Returns array of articles ready for D1 upsert
 */

import type { ArticleSection } from './db';

// Intercom API Types
interface IntercomArticle {
  id: string;
  type: 'article';
  workspace_id: string;
  title: string;
  description: string;
  body: string; // HTML content
  author_id: number;
  state: 'published' | 'draft';
  created_at: number; // Unix timestamp
  updated_at: number;
  url: string;
  parent_id: number | null; // Collection ID
  parent_ids: number[];
  parent_type: 'collection' | null;
  default_locale: string;
  statistics?: {
    views: number;
    conversations: number;
    reactions: number;
    helpful_reactions: number;
    unhelpful_reactions: number;
  };
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
  icon: string;
  order: number;
  default_locale: string;
  parent_id: string | null;
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

// Collection ID to Section mapping (from spec)
const COLLECTION_TO_SECTION: Record<string, ArticleSection> = {
  '11267405': 'knowledge-base', // Cleantech Archives
  '11719079': 'guides',         // Solamp's Scope of Work
  '11267354': 'faq',            // FAQs
  '11267353': 'payments',       // Payments (goes to /support/)
};

// Article ready for D1 import
export interface ArticleForImport {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string | null;
  section: ArticleSection;
  category: string | null;
  tags: string | null;
  related_articles: string | null;
  related_products: string | null;
  source_url: string;
  source_id: string;
  author: string | null;
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
 * Extract plain text excerpt from HTML
 */
function extractExcerpt(html: string, maxLength = 200): string {
  // Strip HTML tags
  const text = html.replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();

  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
}

/**
 * Fetch all articles from Intercom API (handles pagination)
 */
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
      throw new Error(`Intercom API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as IntercomArticlesResponse;
    allArticles.push(...data.data);

    hasMore = page < data.pages.total_pages;
    page++;
  }

  return allArticles;
}

/**
 * Fetch all collections from Intercom API
 */
async function fetchCollections(token: string): Promise<IntercomCollection[]> {
  const response = await fetch('https://api.intercom.io/help_center/collections', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Intercom-Version': '2.11',
    },
  });

  if (!response.ok) {
    throw new Error(`Intercom API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json() as IntercomCollectionsResponse;
  return data.data;
}

/**
 * Main function: Fetch and transform all Intercom articles
 */
export async function fetchAndTransformArticles(token: string): Promise<{
  articles: ArticleForImport[];
  collections: IntercomCollection[];
  stats: {
    total: number;
    bySection: Record<string, number>;
    skipped: number;
  };
}> {
  // Fetch collections first for reference
  const collections = await fetchCollections(token);
  console.log(`Fetched ${collections.length} collections`);

  // Fetch all articles
  const intercomArticles = await fetchAllArticles(token);
  console.log(`Fetched ${intercomArticles.length} articles from Intercom`);

  const articles: ArticleForImport[] = [];
  const stats = {
    total: intercomArticles.length,
    bySection: {} as Record<string, number>,
    skipped: 0,
  };

  for (const article of intercomArticles) {
    // Only process published articles
    if (article.state !== 'published') {
      stats.skipped++;
      continue;
    }

    // Determine section from parent collection
    let section: ArticleSection = 'knowledge-base'; // default
    if (article.parent_ids && article.parent_ids.length > 0) {
      for (const parentId of article.parent_ids) {
        const mappedSection = COLLECTION_TO_SECTION[String(parentId)];
        if (mappedSection) {
          section = mappedSection;
          break;
        }
      }
    }

    // Extract slug from Intercom URL or generate from title
    // URL format: info.solampio.com/en/articles/{id}-{slug}
    let slug = generateSlug(article.title);
    const urlMatch = article.url.match(/\/articles\/\d+-(.+)$/);
    if (urlMatch) {
      slug = urlMatch[1];
    }

    const transformed: ArticleForImport = {
      id: `intercom-${article.id}`,
      slug,
      title: article.title,
      content: article.body,
      excerpt: article.description || extractExcerpt(article.body),
      section,
      category: null, // Could be derived from collection name
      tags: null,
      related_articles: null,
      related_products: null,
      source_url: article.url,
      source_id: article.id,
      author: null,
    };

    articles.push(transformed);
    stats.bySection[section] = (stats.bySection[section] || 0) + 1;
  }

  return { articles, collections, stats };
}

/**
 * Fetch a single article by ID (for debugging/verification)
 */
export async function fetchSingleArticle(token: string, articleId: string): Promise<IntercomArticle | null> {
  const response = await fetch(`https://api.intercom.io/articles/${articleId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Intercom-Version': '2.11',
    },
  });

  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`Intercom API error: ${response.status} ${response.statusText}`);
  }

  return await response.json() as IntercomArticle;
}
