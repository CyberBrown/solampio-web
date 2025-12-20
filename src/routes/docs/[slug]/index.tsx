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
      <section class="bg-[#56c270] py-8">
        <div class="container mx-auto px-4">
          <nav class="mb-4">
            <ol class="flex items-center gap-2 text-sm flex-wrap">
              <li><Link href="/" class="text-white/50 hover:text-white transition-colors">Home</Link></li>
              <li class="text-white/30">/</li>
              <li><Link href="/docs/" class="text-white/50 hover:text-white transition-colors">Documents</Link></li>
              <li class="text-white/30">/</li>
              <li class="text-white font-semibold">{title}</li>
            </ol>
          </nav>
          <div class="max-w-3xl">
            <div class="flex items-center gap-3 mb-3">
              <span class="text-xs font-bold px-2 py-1 rounded bg-white/20 text-white">PDF</span>
              <span class="text-sm text-white/60">2.4 MB</span>
            </div>
            <h1 class="font-heading font-extrabold text-2xl md:text-3xl text-white">
              {title}
            </h1>
          </div>
        </div>
      </section>

      {/* Document Viewer */}
      <section class="py-10">
        <div class="container mx-auto px-4">
          <div class="max-w-4xl mx-auto">
            {/* Download Actions */}
            <div class="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
              <div class="flex items-center gap-4">
                <div class="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p class="font-heading font-bold text-[#042e0d]">{title}</p>
                  <p class="text-sm text-gray-500">PDF Document | 2.4 MB | Updated December 2024</p>
                </div>
              </div>
              <button class="inline-flex items-center gap-2 bg-[#56c270] text-white font-heading font-bold px-6 py-3 rounded hover:bg-[#042e0d] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download PDF
              </button>
            </div>

            {/* PDF Preview Placeholder */}
            <div class="bg-[#f1f1f2] border border-gray-200 rounded-lg p-12 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-24 w-24 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="0.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <p class="text-gray-500 mb-2">PDF Preview</p>
              <p class="text-sm text-gray-400 mb-6">Document preview will be displayed here</p>
              <p class="text-xs text-gray-400 italic">
                Integration with Dropbox/Cloudflare R2 for document storage coming soon
              </p>
            </div>

            {/* Document Info */}
            <div class="mt-8 grid md:grid-cols-2 gap-6">
              <div class="bg-[#f1f1f2] rounded-lg p-5 border border-gray-200">
                <h3 class="font-heading font-bold text-[#042e0d] mb-3">Document Details</h3>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-500">Type</span>
                    <span class="font-medium text-[#042e0d]">Datasheet</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">Format</span>
                    <span class="font-medium text-[#042e0d]">PDF</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">Size</span>
                    <span class="font-medium text-[#042e0d]">2.4 MB</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">Updated</span>
                    <span class="font-medium text-[#042e0d]">December 2024</span>
                  </div>
                </div>
              </div>
              <div class="bg-[#f1f1f2] rounded-lg p-5 border border-gray-200">
                <h3 class="font-heading font-bold text-[#042e0d] mb-3">Related Product</h3>
                <Link href="/products/" class="flex items-center gap-3 group">
                  <div class="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="0.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p class="font-heading font-bold text-[#042e0d] group-hover:text-[#5974c3] transition-colors">View Product</p>
                    <p class="text-sm text-gray-500">See specs, pricing, availability</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Related Documents */}
            <div class="mt-8">
              <h3 class="font-heading font-bold text-lg text-[#042e0d] mb-4">Related Documents</h3>
              <div class="grid md:grid-cols-2 gap-4">
                <Link href="/docs/" class="flex items-center gap-3 bg-[#f1f1f2] rounded-lg p-4 border border-gray-200 hover:border-[#56c270] transition-colors group">
                  <div class="w-10 h-10 bg-red-100 rounded flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p class="font-medium text-[#042e0d] group-hover:text-[#56c270] transition-colors">Installation Manual</p>
                    <p class="text-xs text-gray-500">PDF | 5.1 MB</p>
                  </div>
                </Link>
                <Link href="/docs/" class="flex items-center gap-3 bg-[#f1f1f2] rounded-lg p-4 border border-gray-200 hover:border-[#56c270] transition-colors group">
                  <div class="w-10 h-10 bg-red-100 rounded flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p class="font-medium text-[#042e0d] group-hover:text-[#56c270] transition-colors">Wiring Diagram</p>
                    <p class="text-xs text-gray-500">PDF | 1.2 MB</p>
                  </div>
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
              <h3 class="font-heading font-extrabold text-2xl text-white">Need technical assistance?</h3>
              <p class="text-white/70 mt-1">Our engineering team can help with installation questions.</p>
            </div>
            <a href="tel:978-451-6890" class="inline-flex items-center gap-2 bg-[#c3a859] text-white font-heading font-bold px-6 py-3 rounded hover:bg-[#c3a859]/80 transition-colors">
              978-451-6890
            </a>
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
    title: `${title} | Document Library | Solamp Solar & Energy Storage`,
    meta: [
      {
        name: 'description',
        content: `Download ${title} - Technical documentation from Solamp Solar & Energy Storage.`,
      },
    ],
  };
};
