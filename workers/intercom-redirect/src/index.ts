/**
 * Intercom Redirect Worker
 *
 * Handles redirects from info.solampio.com (old Intercom Help Center)
 * to the new solampio.com/learn/archives/ URLs.
 *
 * URL patterns:
 *   info.solampio.com/en/articles/{id}-{slug} → solampio.com/learn/archives/{section}/{slug}/
 *   info.solampio.com/en/collections/{id}-{slug} → solampio.com/learn/archives/
 *   info.solampio.com/* → solampio.com/learn/archives/
 */

interface Env {
  DB: D1Database;
  TARGET_DOMAIN: string;
}

interface Article {
  slug: string;
  section: string;
}

// Static mapping for known collection redirects
const COLLECTION_REDIRECTS: Record<string, string> = {
  '11267405': '/learn/archives/knowledge-base/', // Cleantech Archives
  '11719079': '/learn/archives/guides/',         // Scope of Work
  '11267354': '/learn/archives/faq/',            // FAQs
  '11267353': '/support/payments/',              // Payments
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const targetDomain = env.TARGET_DOMAIN || 'solampio.com';

    // Handle article URLs: /en/articles/{id}-{slug}
    const articleMatch = path.match(/\/en\/articles\/(\d+)-?(.*)$/);
    if (articleMatch) {
      const [, articleId] = articleMatch;

      // Look up article in D1 by source_id
      try {
        const article = await env.DB
          .prepare('SELECT slug, section FROM articles WHERE source_id = ?')
          .bind(articleId)
          .first<Article>();

        if (article) {
          const newUrl = `https://${targetDomain}/learn/archives/${article.section}/${article.slug}/`;
          return Response.redirect(newUrl, 301);
        }
      } catch (error) {
        console.error('D1 lookup error:', error);
      }

      // Fallback: redirect to archives landing
      return Response.redirect(`https://${targetDomain}/learn/archives/`, 301);
    }

    // Handle collection URLs: /en/collections/{id}-{slug}
    const collectionMatch = path.match(/\/en\/collections\/(\d+)/);
    if (collectionMatch) {
      const [, collectionId] = collectionMatch;
      const redirectPath = COLLECTION_REDIRECTS[collectionId] || '/learn/archives/';
      return Response.redirect(`https://${targetDomain}${redirectPath}`, 301);
    }

    // Handle root and other paths
    if (path === '/' || path === '/en' || path === '/en/') {
      return Response.redirect(`https://${targetDomain}/learn/archives/`, 301);
    }

    // Default: redirect to archives
    return Response.redirect(`https://${targetDomain}/learn/archives/`, 301);
  },
};
