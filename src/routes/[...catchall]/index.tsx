import { component$ } from '@builder.io/qwik';
import type { DocumentHead, RequestHandler } from '~/lib/qwik-city';
import { Link } from '~/lib/qwik-city';

// Set proper 404 status for SEO - Google must see 404, not 200
export const onRequest: RequestHandler = async ({ status }) => {
  status(404);
};

export default component$(() => {
  return (
    <div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div class="text-center max-w-md">
        <h1 class="text-6xl font-bold text-[#042e0d] mb-4">404</h1>
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">Page Not Found</h2>
        <p class="text-gray-600 mb-8">
          Sorry, the page you're looking for doesn't exist or has been moved.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            class="inline-block bg-[#042e0d] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#0a4a1a] transition-colors"
          >
            Go to Homepage
          </Link>
          <Link
            href="/products"
            class="inline-block bg-white text-[#042e0d] border-2 border-[#042e0d] px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Page Not Found | Solampio',
  meta: [
    {
      name: 'robots',
      content: 'noindex, nofollow',
    },
  ],
};
