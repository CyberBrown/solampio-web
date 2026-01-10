import { component$ } from '@builder.io/qwik';
import { routeLoader$, Link } from '@builder.io/qwik-city';
import type { DocumentHead } from '@builder.io/qwik-city';
import { getArticleBySlug, parseArticleTags, parseRelatedArticles, getRelatedArticlesBySlugs, type Article } from '~/lib/db';

export const useArticle = routeLoader$(async ({ params, platform, status }) => {
  try {
    const db = platform.env?.DB;
    if (!db) {
      status(500);
      return { article: null, related: [] };
    }

    const article = await getArticleBySlug(db, params.slug);
    if (!article || article.section !== 'knowledge-base') {
      status(404);
      return { article: null, related: [] };
    }

    // Fetch related articles if any
    const relatedSlugs = parseRelatedArticles(article.related_articles);
    const related = relatedSlugs.length > 0
      ? await getRelatedArticlesBySlugs(db, relatedSlugs)
      : [];

    return { article, related };
  } catch {
    status(500);
    return { article: null, related: [] };
  }
});

export default component$(() => {
  const data = useArticle();

  if (!data.value.article) {
    return (
      <div class="bg-white min-h-screen">
        <section class="py-16">
          <div class="container mx-auto px-4 text-center">
            <h1 class="font-heading font-bold text-2xl text-gray-800 mb-4">Article Not Found</h1>
            <p class="text-gray-500 mb-6">The article you're looking for doesn't exist or has been moved.</p>
            <Link href="/learn/archives/knowledge-base/" class="text-[#5974c3] font-semibold hover:underline">
              Browse all Knowledge Base articles
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const article = data.value.article;
  const related = data.value.related;
  const tags = parseArticleTags(article.tags);

  return (
    <div class="bg-white min-h-screen">
      {/* Header */}
      <section class="bg-[#042e0d] py-8">
        <div class="container mx-auto px-4">
          <nav class="text-sm mb-4">
            <Link href="/learn/" class="text-white/60 hover:text-white">Learn</Link>
            <span class="text-white/40 mx-2">/</span>
            <Link href="/learn/archives/" class="text-white/60 hover:text-white">Archives</Link>
            <span class="text-white/40 mx-2">/</span>
            <Link href="/learn/archives/knowledge-base/" class="text-white/60 hover:text-white">Knowledge Base</Link>
          </nav>
          <h1 class="font-heading font-extrabold text-2xl md:text-3xl text-white">
            {article.title}
          </h1>
          {tags.length > 0 && (
            <div class="flex flex-wrap gap-2 mt-3">
              {tags.map((tag: string) => (
                <span key={tag} class="text-xs bg-white/10 text-white/80 px-2 py-1 rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Content */}
      <article class="py-8">
        <div class="container mx-auto px-4">
          <div class="max-w-3xl">
            {article.excerpt && (
              <p class="text-lg text-gray-600 mb-6 pb-6 border-b border-gray-100">
                {article.excerpt}
              </p>
            )}
            <div
              class="prose prose-lg max-w-none prose-headings:font-heading prose-headings:text-[#042e0d] prose-a:text-[#5974c3]"
              dangerouslySetInnerHTML={article.content}
            />
          </div>
        </div>
      </article>

      {/* Related Articles */}
      {related.length > 0 && (
        <section class="py-8 bg-[#f1f1f2] border-t border-gray-200">
          <div class="container mx-auto px-4">
            <h2 class="font-heading font-bold text-lg text-[#042e0d] mb-4">Related Articles</h2>
            <div class="grid md:grid-cols-3 gap-4 max-w-4xl">
              {related.map((relatedArticle: Article) => (
                <Link
                  key={relatedArticle.id}
                  href={`/learn/archives/${relatedArticle.section}/${relatedArticle.slug}/`}
                  class="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md hover:border-[#042e0d] transition-all group"
                >
                  <h3 class="font-heading font-bold text-sm text-[#042e0d] group-hover:text-[#5974c3] transition-colors">
                    {relatedArticle.title}
                  </h3>
                  {relatedArticle.excerpt && (
                    <p class="text-xs text-gray-500 mt-1 line-clamp-2">{relatedArticle.excerpt}</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Navigation */}
      <section class="py-6 border-t border-gray-100">
        <div class="container mx-auto px-4">
          <Link href="/learn/archives/knowledge-base/" class="text-[#5974c3] text-sm font-semibold hover:underline inline-flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Knowledge Base
          </Link>
        </div>
      </section>
    </div>
  );
});

export const head: DocumentHead = ({ resolveValue }) => {
  const data = resolveValue(useArticle);
  const article = data?.article;

  return {
    title: article ? `${article.title} | Cleantech Archives | Solamp` : 'Article Not Found | Solamp',
    meta: [
      {
        name: 'description',
        content: article?.excerpt || 'Technical concepts and solar energy fundamentals from the Cleantech Archives.',
      },
    ],
  };
};
