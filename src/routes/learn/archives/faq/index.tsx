import { component$, useSignal } from '@builder.io/qwik';
import { routeLoader$, Link } from '@builder.io/qwik-city';
import type { DocumentHead } from '@builder.io/qwik-city';
import { getArticlesBySection, type Article } from '~/lib/db';

export const useFAQs = routeLoader$(async ({ platform }) => {
  try {
    const db = platform.env?.DB;
    if (!db) return [];
    return await getArticlesBySection(db, 'faq');
  } catch {
    return [];
  }
});

export default component$(() => {
  const faqs = useFAQs();
  const openIndex = useSignal<number | null>(null);

  return (
    <div class="bg-white min-h-screen">
      {/* Hero */}
      <section class="bg-[#c3a859] py-10">
        <div class="container mx-auto px-4">
          <nav class="text-sm mb-4">
            <Link href="/learn/" class="text-white/60 hover:text-white">Learn</Link>
            <span class="text-white/40 mx-2">/</span>
            <Link href="/learn/archives/" class="text-white/60 hover:text-white">Archives</Link>
            <span class="text-white/40 mx-2">/</span>
            <span class="text-white">FAQ</span>
          </nav>
          <h1 class="font-heading font-extrabold text-2xl md:text-3xl text-white mb-2">
            Frequently Asked Questions
          </h1>
          <p class="text-white/80 max-w-2xl">
            Common questions about solar products, installation, and working with Solamp.
          </p>
        </div>
      </section>

      {/* FAQ List */}
      <section class="py-8">
        <div class="container mx-auto px-4">
          {faqs.value.length === 0 ? (
            <div class="text-center py-12 bg-gray-50 rounded-lg max-w-2xl mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 class="font-heading font-bold text-gray-600 mb-2">No FAQs yet</h2>
              <p class="text-gray-500 text-sm">
                FAQs are being migrated. Check back soon.
              </p>
            </div>
          ) : (
            <div class="max-w-3xl mx-auto">
              <div class="divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
                {faqs.value.map((faq: Article, index: number) => (
                  <div key={faq.id} class="bg-white">
                    <button
                      type="button"
                      class="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                      onClick$={() => {
                        openIndex.value = openIndex.value === index ? null : index;
                      }}
                    >
                      <h3 class="font-heading font-bold text-[#042e0d] pr-4">
                        {faq.title}
                      </h3>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class={`h-5 w-5 text-[#c3a859] flex-shrink-0 transition-transform ${openIndex.value === index ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {openIndex.value === index && (
                      <div class="px-6 pb-4">
                        {faq.excerpt && (
                          <p class="text-gray-600 mb-3">{faq.excerpt}</p>
                        )}
                        <div
                          class="prose prose-sm max-w-none prose-headings:font-heading prose-headings:text-[#042e0d] prose-a:text-[#5974c3]"
                          dangerouslySetInnerHTML={faq.content}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Contact CTA */}
      <section class="py-8 bg-[#f1f1f2] border-t border-gray-200">
        <div class="container mx-auto px-4 text-center max-w-2xl">
          <h2 class="font-heading font-bold text-lg text-[#042e0d] mb-2">Still have questions?</h2>
          <p class="text-gray-600 mb-4">
            Our team is here to help with any technical questions about solar products or installation.
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
  title: 'FAQ | Cleantech Archives | Solamp',
  meta: [
    {
      name: 'description',
      content: 'Frequently asked questions about solar products, installation, and working with Solamp.',
    },
  ],
};
