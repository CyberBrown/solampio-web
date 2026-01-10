import { component$ } from '@builder.io/qwik';
import { routeLoader$, Link } from '@builder.io/qwik-city';
import type { DocumentHead } from '@builder.io/qwik-city';
import { getArticlesBySection, parseArticleTags, type Article } from '~/lib/db';

export const useArticles = routeLoader$(async ({ platform }) => {
  try {
    const db = platform.env?.DB;
    if (!db) return [];
    return await getArticlesBySection(db, 'guides');
  } catch {
    return [];
  }
});

export default component$(() => {
  const articles = useArticles();

  return (
    <div class="bg-white min-h-screen">
      {/* Hero */}
      <section class="bg-[#5974c3] py-10">
        <div class="container mx-auto px-4">
          <nav class="text-sm mb-4">
            <Link href="/learn/" class="text-white/60 hover:text-white">Learn</Link>
            <span class="text-white/40 mx-2">/</span>
            <Link href="/learn/archives/" class="text-white/60 hover:text-white">Archives</Link>
            <span class="text-white/40 mx-2">/</span>
            <span class="text-white">Guides</span>
          </nav>
          <h1 class="font-heading font-extrabold text-2xl md:text-3xl text-white mb-2">
            Buying Guides & How-Tos
          </h1>
          <p class="text-white/80 max-w-2xl">
            Step-by-step guides to help you select the right equipment and understand our scope of work.
          </p>
        </div>
      </section>

      {/* Articles List */}
      <section class="py-8">
        <div class="container mx-auto px-4">
          {articles.value.length === 0 ? (
            <div class="text-center py-12 bg-gray-50 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h2 class="font-heading font-bold text-gray-600 mb-2">No guides yet</h2>
              <p class="text-gray-500 text-sm">
                Guides are being migrated. Check back soon.
              </p>
            </div>
          ) : (
            <div class="grid gap-4 max-w-4xl">
              {articles.value.map((article: Article) => (
                <Link
                  key={article.id}
                  href={`/learn/archives/guides/${article.slug}/`}
                  class="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md hover:border-[#5974c3] transition-all group"
                >
                  <div class="flex items-start gap-4">
                    <div class="w-10 h-10 bg-[#5974c3] rounded flex items-center justify-center flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div class="flex-1 min-w-0">
                      <h2 class="font-heading font-bold text-[#042e0d] group-hover:text-[#5974c3] transition-colors mb-1">
                        {article.title}
                      </h2>
                      {article.excerpt && (
                        <p class="text-sm text-gray-500 line-clamp-2">{article.excerpt}</p>
                      )}
                      {article.tags && (
                        <div class="flex flex-wrap gap-1 mt-2">
                          {parseArticleTags(article.tags).slice(0, 3).map((tag: string) => (
                            <span key={tag} class="text-xs bg-[#5974c3]/10 text-[#5974c3] px-2 py-0.5 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-300 group-hover:text-[#5974c3] transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Back Link */}
      <section class="py-6 border-t border-gray-100">
        <div class="container mx-auto px-4">
          <Link href="/learn/archives/" class="text-[#5974c3] text-sm font-semibold hover:underline inline-flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Archives
          </Link>
        </div>
      </section>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Guides | Cleantech Archives | Solamp',
  meta: [
    {
      name: 'description',
      content: 'Step-by-step buying guides and how-to resources for professional solar installers.',
    },
  ],
};
