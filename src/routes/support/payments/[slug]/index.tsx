import { component$ } from '@builder.io/qwik';
import { routeLoader$, Link } from '~/lib/qwik-city';
import type { DocumentHead } from '~/lib/qwik-city';
import { getArticleBySlug } from '~/lib/db';

export const useArticle = routeLoader$(async ({ params, platform, status }) => {
  try {
    const db = platform.env?.DB;
    if (!db) {
      status(500);
      return null;
    }

    const article = await getArticleBySlug(db, params.slug);
    if (!article || article.section !== 'payments') {
      status(404);
      return null;
    }

    return article;
  } catch {
    status(500);
    return null;
  }
});

export default component$(() => {
  const article = useArticle();

  if (!article.value) {
    return (
      <div class="bg-white min-h-screen">
        <section class="py-16">
          <div class="container mx-auto px-4 text-center">
            <h1 class="font-heading font-bold text-2xl text-gray-800 mb-4">Page Not Found</h1>
            <p class="text-gray-500 mb-6">The page you're looking for doesn't exist or has been moved.</p>
            <Link href="/support/payments/" class="text-[#5974c3] font-semibold hover:underline">
              View Payment Information
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div class="bg-white min-h-screen">
      {/* Header */}
      <section class="bg-[#042e0d] py-8">
        <div class="container mx-auto px-4">
          <nav class="text-sm mb-4">
            <Link href="/" class="text-white/60 hover:text-white">Home</Link>
            <span class="text-white/40 mx-2">/</span>
            <Link href="/support/payments/" class="text-white/60 hover:text-white">Payments</Link>
          </nav>
          <h1 class="font-heading font-extrabold text-2xl md:text-3xl text-white">
            {article.value.title}
          </h1>
        </div>
      </section>

      {/* Content */}
      <article class="py-8">
        <div class="container mx-auto px-4">
          <div class="max-w-3xl">
            {article.value.excerpt && (
              <p class="text-lg text-gray-600 mb-6 pb-6 border-b border-gray-100">
                {article.value.excerpt}
              </p>
            )}
            <div
              class="prose prose-lg max-w-none prose-headings:font-heading prose-headings:text-[#042e0d] prose-a:text-[#5974c3]"
              dangerouslySetInnerHTML={article.value.content}
            />
          </div>
        </div>
      </article>

      {/* Navigation */}
      <section class="py-6 border-t border-gray-100">
        <div class="container mx-auto px-4">
          <Link href="/support/payments/" class="text-[#5974c3] text-sm font-semibold hover:underline inline-flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Payment Information
          </Link>
        </div>
      </section>
    </div>
  );
});

export const head: DocumentHead = ({ resolveValue }) => {
  const article = resolveValue(useArticle);

  return {
    title: article ? `${article.title} | Solamp` : 'Page Not Found | Solamp',
    meta: [
      {
        name: 'description',
        content: article?.excerpt || 'Payment policies and billing information for Solamp orders.',
      },
    ],
  };
};
