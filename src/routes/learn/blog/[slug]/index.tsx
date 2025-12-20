import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { useLocation, Link } from '@builder.io/qwik-city';

export default component$(() => {
  const loc = useLocation();
  const slug = loc.params.slug;

  // Format slug to title
  const title = slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <div class="bg-white min-h-screen">
      {/* Header */}
      <section class="bg-[#c3a859] py-8">
        <div class="container mx-auto px-4">
          <nav class="mb-4">
            <ol class="flex items-center gap-2 text-sm flex-wrap">
              <li><Link href="/" class="text-white/50 hover:text-white transition-colors">Home</Link></li>
              <li class="text-white/30">/</li>
              <li><Link href="/learn/" class="text-white/50 hover:text-white transition-colors">Learn</Link></li>
              <li class="text-white/30">/</li>
              <li><Link href="/learn/blog/" class="text-white/50 hover:text-white transition-colors">Blog</Link></li>
              <li class="text-white/30">/</li>
              <li class="text-white font-semibold">{title}</li>
            </ol>
          </nav>
          <div class="max-w-3xl">
            <div class="flex items-center gap-3 mb-3">
              <span class="text-xs font-bold px-2 py-1 rounded bg-white/20 text-white">Product News</span>
            </div>
            <h1 class="font-heading font-extrabold text-2xl md:text-3xl text-white mb-3">
              {title}
            </h1>
            <p class="text-white/60 text-sm">
              Published December 15, 2024
            </p>
          </div>
        </div>
      </section>

      {/* Featured Image */}
      <section class="bg-[#f1f1f2]">
        <div class="container mx-auto px-4">
          <div class="max-w-4xl mx-auto -mt-4 relative">
            <div class="aspect-video bg-[#042e0d] rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-20 w-20 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="0.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Content */}
      <section class="py-10">
        <div class="container mx-auto px-4">
          <div class="max-w-3xl mx-auto">
            {/* Content placeholder */}
            <div class="prose prose-lg max-w-none">
              <div class="bg-[#f1f1f2] border border-gray-200 rounded-lg p-8 text-center mb-8">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                <p class="text-gray-500 mb-2">Blog post content will be loaded from Strapi CMS</p>
                <p class="text-sm text-gray-400">Source: solampio.com blog</p>
              </div>

              {/* Sample structure */}
              <div class="space-y-6 text-gray-600">
                <p>
                  This is a placeholder for the blog post content. The actual content will be fetched from the Strapi CMS
                  or pulled from the solampio.com blog via API integration.
                </p>

                <p>
                  Blog posts will include rich content like images, embedded videos, product links, and call-to-action buttons.
                </p>

                <h2 class="font-heading font-bold text-xl text-[#042e0d] mt-8">Key Highlights</h2>
                <ul class="list-disc pl-6 space-y-2">
                  <li>Important announcement point one</li>
                  <li>Key feature or benefit highlighted</li>
                  <li>Action items for readers</li>
                </ul>

                <p>
                  Contact our team to learn more about this announcement and how it affects your projects.
                </p>
              </div>
            </div>

            {/* Share */}
            <div class="mt-10 pt-6 border-t border-gray-200">
              <div class="flex items-center justify-between">
                <p class="font-heading font-bold text-[#042e0d]">Share this post</p>
                <div class="flex gap-3">
                  <button class="w-10 h-10 bg-[#f1f1f2] rounded-full flex items-center justify-center hover:bg-[#5974c3] hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                    </svg>
                  </button>
                  <button class="w-10 h-10 bg-[#f1f1f2] rounded-full flex items-center justify-center hover:bg-[#5974c3] hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                  </button>
                  <button class="w-10 h-10 bg-[#f1f1f2] rounded-full flex items-center justify-center hover:bg-[#5974c3] hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Related Posts */}
            <div class="mt-10 pt-6 border-t border-gray-200">
              <h3 class="font-heading font-bold text-lg text-[#042e0d] mb-4">Related Posts</h3>
              <div class="grid md:grid-cols-2 gap-4">
                <Link href="/learn/blog/" class="bg-[#f1f1f2] rounded-lg p-4 hover:bg-gray-100 transition-colors group">
                  <p class="text-xs text-gray-400 mb-1">December 10, 2024</p>
                  <p class="font-heading font-bold text-[#042e0d] group-hover:text-[#5974c3] transition-colors">Winter Installation Tips</p>
                </Link>
                <Link href="/learn/blog/" class="bg-[#f1f1f2] rounded-lg p-4 hover:bg-gray-100 transition-colors group">
                  <p class="text-xs text-gray-400 mb-1">December 1, 2024</p>
                  <p class="font-heading font-bold text-[#042e0d] group-hover:text-[#5974c3] transition-colors">Q4 Availability Update</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section class="bg-[#042e0d] py-10">
        <div class="container mx-auto px-4">
          <div class="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 class="font-heading font-extrabold text-2xl text-white">Questions about this announcement?</h3>
              <p class="text-white/70 mt-1">Contact our team for more information.</p>
            </div>
            <div class="flex gap-4">
              <Link href="/contact/" class="inline-flex items-center gap-2 bg-[#56c270] text-[#042e0d] font-heading font-bold px-6 py-3 rounded hover:bg-white transition-colors">
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

export const head: DocumentHead = ({ params }) => {
  const title = params.slug
    .split('-')
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    title: `${title} | Solamp Solar & Energy Storage`,
    meta: [
      {
        name: 'description',
        content: `${title} - News and updates from Solamp Solar & Energy Storage.`,
      },
    ],
  };
};
