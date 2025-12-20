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
              <li class="text-white font-semibold">{title}</li>
            </ol>
          </nav>
          <div class="max-w-3xl">
            <div class="flex items-center gap-3 mb-3">
              <span class="text-xs font-bold px-2 py-1 rounded bg-white/20 text-white">Guide</span>
              <span class="text-sm text-white/60">10 min read</span>
            </div>
            <h1 class="font-heading font-extrabold text-2xl md:text-3xl text-white mb-3">
              {title}
            </h1>
            <p class="text-white/60 text-sm">
              Published December 1, 2024 | Updated December 15, 2024
            </p>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section class="py-10">
        <div class="container mx-auto px-4">
          <div class="max-w-3xl mx-auto">
            {/* Article body placeholder */}
            <div class="prose prose-lg max-w-none">
              <div class="bg-[#f1f1f2] border border-gray-200 rounded-lg p-8 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p class="text-gray-500 mb-2">Article content will be loaded from Strapi CMS</p>
                <p class="text-sm text-gray-400">Source: info.solampio.com</p>
              </div>

              {/* Sample structure */}
              <div class="mt-8 space-y-6 text-gray-600">
                <p>
                  This is a placeholder for the article content. The actual content will be fetched from the Strapi CMS
                  or pulled from info.solampio.com via API integration.
                </p>

                <h2 class="font-heading font-bold text-xl text-[#042e0d] mt-8">Overview</h2>
                <p>
                  Article sections will include headings, paragraphs, images, code blocks, tables, and other rich content
                  as needed for technical documentation.
                </p>

                <h2 class="font-heading font-bold text-xl text-[#042e0d] mt-8">Key Points</h2>
                <ul class="list-disc pl-6 space-y-2">
                  <li>Point one with important information</li>
                  <li>Point two with technical details</li>
                  <li>Point three with recommendations</li>
                </ul>

                <h2 class="font-heading font-bold text-xl text-[#042e0d] mt-8">Conclusion</h2>
                <p>
                  Summary and next steps for the reader.
                </p>
              </div>
            </div>

            {/* Author/Source */}
            <div class="mt-10 pt-6 border-t border-gray-200">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-[#042e0d] rounded-full flex items-center justify-center">
                  <span class="text-white font-bold">S</span>
                </div>
                <div>
                  <p class="font-heading font-bold text-[#042e0d]">Solamp Engineering Team</p>
                  <p class="text-sm text-gray-500">Technical content for solar professionals</p>
                </div>
              </div>
            </div>

            {/* Related Articles */}
            <div class="mt-10 pt-6 border-t border-gray-200">
              <h3 class="font-heading font-bold text-lg text-[#042e0d] mb-4">Related Articles</h3>
              <div class="grid md:grid-cols-2 gap-4">
                <Link href="/learn/articles/" class="bg-[#f1f1f2] rounded-lg p-4 hover:bg-gray-100 transition-colors group">
                  <p class="font-heading font-bold text-[#042e0d] group-hover:text-[#5974c3] transition-colors">Battery Sizing for Off-Grid</p>
                  <p class="text-sm text-gray-500 mt-1">Calculate battery bank size for off-grid systems</p>
                </Link>
                <Link href="/learn/articles/" class="bg-[#f1f1f2] rounded-lg p-4 hover:bg-gray-100 transition-colors group">
                  <p class="font-heading font-bold text-[#042e0d] group-hover:text-[#5974c3] transition-colors">Hybrid Inverter Comparison</p>
                  <p class="text-sm text-gray-500 mt-1">Compare Sol-Ark, Schneider, and OutBack</p>
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
              <h3 class="font-heading font-extrabold text-2xl text-white">Need help with your project?</h3>
              <p class="text-white/70 mt-1">Our engineers can help with system design and product selection.</p>
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
        content: `${title} - Technical article for professional solar installers from Solamp.`,
      },
    ],
  };
};
