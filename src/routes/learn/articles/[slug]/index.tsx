import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { Link, routeLoader$ } from '@builder.io/qwik-city';
import { getArticleBySlug, getAllArticles, type Article } from '~/lib/db';

// Load article from D1 database
export const useArticle = routeLoader$<{ article: Article | null; relatedArticles: Article[] }>(
  async ({ platform, params }) => {
    const db = platform.env?.DB;
    if (!db) {
      console.error('D1 database not available');
      return { article: null, relatedArticles: [] };
    }

    try {
      const article = await getArticleBySlug(db, params.slug);

      // Get related articles from the same section (excluding current)
      let relatedArticles: Article[] = [];
      if (article) {
        const allArticles = await getAllArticles(db, 50);
        relatedArticles = allArticles
          .filter(a => a.section === article.section && a.slug !== article.slug)
          .slice(0, 3);
      }

      return { article, relatedArticles };
    } catch (error) {
      console.error('Failed to load article:', error);
      return { article: null, relatedArticles: [] };
    }
  }
);

// Map sections to display categories
function getSectionCategory(section: string): string {
  const sectionMap: Record<string, string> = {
    'knowledge-base': 'Knowledge Base',
    'guides': 'Guide',
    'faq': 'FAQ',
    'payments': 'Payments',
    'videos': 'Video',
  };
  return sectionMap[section] || 'Article';
}

// Estimate read time from content length
function estimateReadTime(content: string): string {
  const wordsPerMinute = 200;
  const text = content.replace(/<[^>]*>/g, ' ').trim();
  const wordCount = text.split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  return `${minutes} min read`;
}

export default component$(() => {
  const data = useArticle();
  const { article, relatedArticles } = data.value;

  if (!article) {
    return (
      <div class="bg-white min-h-screen">
        <section class="bg-[#5974c3] py-8">
          <div class="container mx-auto px-4">
            <nav class="mb-4">
              <ol class="flex items-center gap-2 text-sm flex-wrap">
                <li><Link href="/" class="text-white/50 hover:text-white transition-colors">Home</Link></li>
                <li class="text-white/30">/</li>
                <li><Link href="/learn/" class="text-white/50 hover:text-white transition-colors">Learn</Link></li>
                <li class="text-white/30">/</li>
                <li><Link href="/learn/articles/" class="text-white/50 hover:text-white transition-colors">Articles</Link></li>
              </ol>
            </nav>
            <h1 class="font-heading font-extrabold text-2xl md:text-3xl text-white mb-3">
              Article Not Found
            </h1>
          </div>
        </section>
        <section class="py-10">
          <div class="container mx-auto px-4">
            <div class="max-w-3xl mx-auto text-center">
              <p class="text-gray-500 mb-6">The article you're looking for doesn't exist or has been moved.</p>
              <Link href="/learn/articles/" class="inline-flex items-center gap-2 bg-[#5974c3] text-white font-heading font-bold px-6 py-3 rounded hover:bg-[#042e0d] transition-colors">
                Browse All Articles
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const category = getSectionCategory(article.section);
  const readTime = estimateReadTime(article.content);

  return (
    <div class="bg-white min-h-screen">
      {/* Header */}
      <section class="bg-[#5974c3] py-8">
        <div class="container mx-auto px-4">
          <nav class="mb-4">
            <ol class="flex items-center gap-2 text-sm flex-wrap">
              <li><Link href="/" class="text-white/50 hover:text-white transition-colors">Home</Link></li>
              <li class="text-white/30">/</li>
              <li><Link href="/learn/" class="text-white/50 hover:text-white transition-colors">Learn</Link></li>
              <li class="text-white/30">/</li>
              <li><Link href="/learn/articles/" class="text-white/50 hover:text-white transition-colors">Articles</Link></li>
              <li class="text-white/30">/</li>
              <li class="text-white font-semibold truncate max-w-[200px]">{article.title}</li>
            </ol>
          </nav>
          <div class="max-w-3xl">
            <div class="flex items-center gap-3 mb-3">
              <span class="text-xs font-bold px-2 py-1 rounded bg-white/20 text-white">{category}</span>
              <span class="text-sm text-white/60">{readTime}</span>
            </div>
            <h1 class="font-heading font-extrabold text-2xl md:text-3xl text-white mb-3">
              {article.title}
            </h1>
            <p class="text-white/60 text-sm">
              Updated {new Date(article.updated_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section class="py-10">
        <div class="container mx-auto px-4">
          <div class="max-w-3xl mx-auto">
            {/* Excerpt/Summary */}
            {article.excerpt && (
              <div class="bg-[#f1f1f2] border-l-4 border-[#5974c3] p-4 mb-8 rounded-r">
                <p class="text-gray-700 italic">{article.excerpt}</p>
              </div>
            )}

            {/* Article body - render HTML content */}
            <div
              class="prose prose-lg max-w-none prose-headings:font-heading prose-headings:text-[#042e0d] prose-a:text-[#5974c3] prose-strong:text-[#042e0d]"
              dangerouslySetInnerHTML={article.content}
            />

            {/* Source attribution */}
            {article.source_url && (
              <div class="mt-8 pt-4 border-t border-gray-200">
                <p class="text-sm text-gray-400">
                  Originally published at{' '}
                  <a
                    href={article.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-[#5974c3] hover:underline"
                  >
                    info.solampio.com
                  </a>
                </p>
              </div>
            )}

            {/* Author/Source */}
            <div class="mt-10 pt-6 border-t border-gray-200">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-[#042e0d] rounded-full flex items-center justify-center">
                  <span class="text-white font-bold">S</span>
                </div>
                <div>
                  <p class="font-heading font-bold text-[#042e0d]">
                    {article.author || 'Solamp Team'}
                  </p>
                  <p class="text-sm text-gray-500">Technical content for solar professionals</p>
                </div>
              </div>
            </div>

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
              <div class="mt-10 pt-6 border-t border-gray-200">
                <h3 class="font-heading font-bold text-lg text-[#042e0d] mb-4">Related Articles</h3>
                <div class="grid md:grid-cols-2 gap-4">
                  {relatedArticles.map((related) => (
                    <Link
                      key={related.slug}
                      href={`/learn/articles/${related.slug}/`}
                      class="bg-[#f1f1f2] rounded-lg p-4 hover:bg-gray-100 transition-colors group"
                    >
                      <p class="font-heading font-bold text-[#042e0d] group-hover:text-[#5974c3] transition-colors">
                        {related.title}
                      </p>
                      <p class="text-sm text-gray-500 mt-1 line-clamp-2">
                        {related.excerpt || related.title}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section class="bg-[#042e0d] py-10">
        <div class="container mx-auto px-4">
          <div class="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 class="font-heading font-extrabold text-2xl text-white">Need help with your project?</h3>
              <p class="text-white/70 mt-1">Our team can help with system design and product selection.</p>
            </div>
            <div class="flex gap-4">
              <Link href="/contact-us/" class="inline-flex items-center gap-2 bg-[#56c270] text-[#042e0d] font-heading font-bold px-6 py-3 rounded hover:bg-white transition-colors">
                Contact Us
              </Link>
              <a href="tel:978-451-6890" class="inline-flex items-center gap-2 bg-[#c3a859] text-white font-heading font-bold px-6 py-3 rounded hover:bg-[#c3a859]/80 transition-colors">
                978-451-6890
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
});

export const head: DocumentHead = ({ resolveValue }) => {
  const data = resolveValue(useArticle);
  const article = data?.article;

  if (!article) {
    return {
      title: 'Article Not Found | Solamp Solar & Energy Storage',
      meta: [
        {
          name: 'description',
          content: 'The requested article could not be found.',
        },
      ],
    };
  }

  return {
    title: `${article.title} | Solamp Solar & Energy Storage`,
    meta: [
      {
        name: 'description',
        content: article.excerpt || `${article.title} - Technical article for professional solar installers from Solamp.`,
      },
    ],
  };
};
