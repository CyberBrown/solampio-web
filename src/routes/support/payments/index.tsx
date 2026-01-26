import { component$ } from '@builder.io/qwik';
import { routeLoader$, Link } from '@builder.io/qwik-city';
import type { DocumentHead } from '@builder.io/qwik-city';
import { getArticlesBySection, type Article } from '~/lib/db';

export const useArticles = routeLoader$(async ({ platform }) => {
  try {
    const db = platform.env?.DB;
    if (!db) return [];
    return await getArticlesBySection(db, 'payments');
  } catch {
    return [];
  }
});

export default component$(() => {
  const articles = useArticles();

  return (
    <div class="bg-white min-h-screen">
      {/* Hero */}
      <section class="bg-[#042e0d] py-10">
        <div class="container mx-auto px-4">
          <nav class="text-sm mb-4">
            <Link href="/" class="text-white/60 hover:text-white">Home</Link>
            <span class="text-white/40 mx-2">/</span>
            <span class="text-white">Payments</span>
          </nav>
          <h1 class="font-heading font-extrabold text-2xl md:text-3xl text-white mb-2">
            Payment Information
          </h1>
          <p class="text-white/70 max-w-2xl">
            Payment policies, refund information, and billing details for Solamp orders.
          </p>
        </div>
      </section>

      {/* Articles List */}
      <section class="py-8">
        <div class="container mx-auto px-4">
          {articles.value.length === 0 ? (
            <div class="text-center py-12 bg-gray-50 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <h2 class="font-heading font-bold text-gray-600 mb-2">No payment articles yet</h2>
              <p class="text-gray-500 text-sm">
                Payment information is being added. Check back soon.
              </p>
            </div>
          ) : (
            <div class="grid gap-4 max-w-2xl">
              {articles.value.map((article: Article) => (
                <Link
                  key={article.id}
                  href={`/support/payments/${article.slug}/`}
                  class="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md hover:border-[#042e0d] transition-all group"
                >
                  <div class="flex items-start gap-4">
                    <div class="w-10 h-10 bg-[#c3a859] rounded flex items-center justify-center flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <div class="flex-1 min-w-0">
                      <h2 class="font-heading font-bold text-[#042e0d] group-hover:text-[#5974c3] transition-colors mb-1">
                        {article.title}
                      </h2>
                      {article.excerpt && (
                        <p class="text-sm text-gray-500 line-clamp-2">{article.excerpt}</p>
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

      {/* Contact CTA */}
      <section class="py-8 bg-[#f1f1f2] border-t border-gray-200">
        <div class="container mx-auto px-4 text-center max-w-2xl">
          <h2 class="font-heading font-bold text-lg text-[#042e0d] mb-2">Questions about billing?</h2>
          <p class="text-gray-600 mb-4">
            Our team is here to help with any payment or billing questions.
          </p>
          <div class="flex flex-wrap justify-center gap-4">
            <a
              href="tel:978-451-6890"
              class="inline-flex items-center gap-2 bg-[#c3a859] text-white font-heading font-bold px-5 py-2.5 rounded hover:bg-[#c3a859]/90 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call Us
            </a>
            <Link
              href="/contact-us/"
              class="inline-flex items-center gap-2 bg-white border border-gray-300 text-[#042e0d] font-heading font-bold px-5 py-2.5 rounded hover:border-[#042e0d] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact Form
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Payment Information | Solamp Solar & Energy Storage',
  meta: [
    {
      name: 'description',
      content: 'Payment policies, refund information, and billing details for Solamp orders.',
    },
  ],
};
