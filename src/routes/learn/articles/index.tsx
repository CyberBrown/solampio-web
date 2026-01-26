import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { Link, routeLoader$ } from '@builder.io/qwik-city';
import { getAllArticles, type Article } from '~/lib/db';

// Load articles from D1 database
export const useArticles = routeLoader$<Article[]>(async ({ platform }) => {
  const db = platform.env?.DB;
  if (!db) {
    console.error('D1 database not available');
    return [];
  }

  try {
    const articles = await getAllArticles(db, 100);
    return articles;
  } catch (error) {
    console.error('Failed to load articles:', error);
    return [];
  }
});

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
  const articlesSignal = useArticles();
  const articles = articlesSignal.value;

  // Get unique sections for filter buttons
  const sections = ['All', ...new Set(articles.map(a => getSectionCategory(a.section)))];

  return (
    <div class="bg-white min-h-screen">
      {/* Hero */}
      <section class="bg-[#5974c3] py-10">
        <div class="container mx-auto px-4">
          <nav class="mb-4">
            <ol class="flex items-center gap-2 text-sm">
              <li><Link href="/" class="text-white/50 hover:text-white transition-colors">Home</Link></li>
              <li class="text-white/30">/</li>
              <li><Link href="/learn/" class="text-white/50 hover:text-white transition-colors">Learn</Link></li>
              <li class="text-white/30">/</li>
              <li class="text-white font-semibold">Articles</li>
            </ol>
          </nav>
          <div class="max-w-3xl">
            <h1 class="font-heading font-extrabold text-3xl md:text-4xl text-white mb-3">
              Technical Articles
            </h1>
            <p class="text-white/80 text-lg">
              In-depth guides, comparisons, and technical resources for professional solar installers.
            </p>
            <p class="text-white/60 text-sm mt-2">
              {articles.length} articles available
            </p>
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <section class="border-b border-gray-200 py-4 bg-[#f1f1f2] sticky top-16 z-30">
        <div class="container mx-auto px-4">
          <div class="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div class="flex flex-wrap gap-2">
              {sections.map((cat) => (
                <button
                  key={cat}
                  class={`px-4 py-2 text-sm font-semibold rounded transition-colors ${
                    cat === 'All'
                      ? 'bg-[#5974c3] text-white'
                      : 'bg-white hover:bg-[#5974c3] hover:text-white text-[#042e0d] border border-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div class="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Search articles..."
                class="w-full border border-gray-300 bg-white px-4 py-2 pr-10 text-sm rounded focus:outline-none focus:border-[#5974c3]"
              />
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section class="py-10">
        <div class="container mx-auto px-4">
          {articles.length === 0 ? (
            <div class="text-center py-12">
              <p class="text-gray-500">No articles available yet.</p>
            </div>
          ) : (
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => {
                const category = getSectionCategory(article.section);
                const readTime = estimateReadTime(article.content);
                return (
                  <Link
                    key={article.slug}
                    href={`/learn/articles/${article.slug}/`}
                    class="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:border-[#5974c3] transition-all group"
                  >
                    <div class="flex items-center gap-3 mb-3">
                      <span class={`text-xs font-bold px-2 py-1 rounded ${
                        category === 'Guide' ? 'bg-[#c3a859]/10 text-[#c3a859]' :
                        category === 'Knowledge Base' ? 'bg-[#56c270]/10 text-[#042e0d]' :
                        category === 'FAQ' ? 'bg-[#5974c3]/10 text-[#5974c3]' :
                        category === 'Payments' ? 'bg-[#042e0d]/10 text-[#042e0d]' :
                        'bg-gray-100 text-gray-600'
                      }`}>{category}</span>
                      <span class="text-xs text-gray-400">{readTime}</span>
                    </div>
                    <h2 class="font-heading font-bold text-lg text-[#042e0d] group-hover:text-[#5974c3] transition-colors mb-2">
                      {article.title}
                    </h2>
                    <p class="text-sm text-gray-500 mb-4 line-clamp-3">
                      {article.excerpt || article.title}
                    </p>
                    <p class="text-xs text-gray-400">
                      {new Date(article.updated_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section class="bg-[#042e0d] py-10">
        <div class="container mx-auto px-4">
          <div class="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 class="font-heading font-extrabold text-2xl text-white">Have a topic suggestion?</h3>
              <p class="text-white/70 mt-1">Let us know what guides would help your work.</p>
            </div>
            <Link href="/contact-us/" class="inline-flex items-center gap-2 bg-[#56c270] text-[#042e0d] font-heading font-bold px-6 py-3 rounded hover:bg-white transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Technical Articles | Solamp Solar & Energy Storage',
  meta: [
    {
      name: 'description',
      content: 'In-depth guides, comparisons, and technical resources for professional solar installers. Learn about batteries, inverters, mounting, and more.',
    },
  ],
};
