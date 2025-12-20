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
    <div>
      {/* Breadcrumb */}
      <section class="bg-[#f1f1f2] border-b border-gray-200">
        <div class="px-6 py-3">
          <nav class="text-sm">
            <ol class="flex items-center gap-2">
              <li><Link href="/" class="text-gray-500 hover:text-[#042e0d] transition-colors">Home</Link></li>
              <li class="text-gray-300">/</li>
              <li><Link href="/products/" class="text-gray-500 hover:text-[#042e0d] transition-colors">Products</Link></li>
              <li class="text-gray-300">/</li>
              <li class="text-[#042e0d] font-semibold">{title}</li>
            </ol>
          </nav>
        </div>
      </section>

      {/* Product Detail */}
      <section class="py-8">
        <div class="px-6">
          <div class="grid lg:grid-cols-2 gap-8 items-start">
            {/* Product Image */}
            <div class="bg-gray-100 rounded-lg aspect-square flex items-center justify-center sticky top-24">
              <div class="text-center text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-32 w-32 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="0.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span class="text-sm">Product Photo</span>
              </div>
            </div>

            {/* Product Info */}
            <div>
              <div class="inline-flex items-center gap-2 bg-[#56c270]/10 text-[#042e0d] px-3 py-1 rounded-full text-sm font-bold mb-4">
                In Stock
              </div>
              <h1 class="font-heading font-extrabold text-2xl md:text-3xl text-[#042e0d] mb-4">{title}</h1>
              <p class="text-gray-600 mb-6">
                High-quality solar equipment from a trusted manufacturer. Contact us for specifications, pricing, and availability.
              </p>

              {/* Specs */}
              <div class="bg-[#f1f1f2] rounded-lg p-5 mb-6">
                <p class="text-xs font-mono text-[#c3a859] uppercase tracking-wide mb-3">Specifications</p>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between py-1 border-b border-gray-200">
                    <span class="text-gray-500">Brand</span>
                    <span class="font-semibold text-[#042e0d]">Manufacturer</span>
                  </div>
                  <div class="flex justify-between py-1 border-b border-gray-200">
                    <span class="text-gray-500">Model</span>
                    <span class="font-semibold text-[#042e0d]">{title}</span>
                  </div>
                  <div class="flex justify-between py-1 border-b border-gray-200">
                    <span class="text-gray-500">Warranty</span>
                    <span class="font-semibold text-[#042e0d]">Manufacturer Warranty</span>
                  </div>
                </div>
              </div>

              {/* Price and CTA */}
              <div class="border border-gray-200 rounded-lg p-5 mb-6">
                <p class="font-heading font-extrabold text-2xl text-[#042e0d] mb-4">Call for Pricing</p>
                <div class="flex gap-3">
                  <button class="flex-1 bg-[#042e0d] text-white font-heading font-bold py-3 rounded hover:bg-[#042e0d]/80 transition-colors">
                    Add to Quote
                  </button>
                  <a href="tel:978-451-6890" class="flex items-center justify-center gap-2 bg-[#c3a859] text-white font-bold px-5 py-3 rounded hover:bg-[#c3a859]/80 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Call
                  </a>
                </div>
              </div>

              {/* Support */}
              <div class="flex items-start gap-3 text-sm text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#c3a859] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <p>Have questions? Our engineers can help you select the right equipment for your project. Call 978-451-6890.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Tabs */}
      <section class="py-8 bg-[#f1f1f2] border-t border-gray-200">
        <div class="px-6">
          <div class="flex gap-4 border-b border-gray-300 mb-6">
            <button class="px-4 py-2 font-bold text-[#042e0d] border-b-2 border-[#042e0d] -mb-px">Overview</button>
            <button class="px-4 py-2 text-gray-500 hover:text-[#042e0d] transition-colors">Specifications</button>
            <button class="px-4 py-2 text-gray-500 hover:text-[#042e0d] transition-colors">Documentation</button>
          </div>

          <div class="max-w-3xl">
            <h2 class="font-heading font-bold text-xl text-[#042e0d] mb-4">Product Overview</h2>
            <p class="text-gray-600 mb-4">
              This product is designed for professional solar installations. It features high-quality construction, reliable performance, and is backed by manufacturer warranty.
            </p>
            <ul class="space-y-2 text-gray-600">
              <li class="flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#56c270] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Professional-grade quality
              </li>
              <li class="flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#56c270] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Full manufacturer warranty
              </li>
              <li class="flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#56c270] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Technical support available
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section class="bg-[#042e0d] py-10">
        <div class="px-6">
          <div class="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 class="font-heading font-extrabold text-2xl text-white">Ready to order?</h3>
              <p class="text-white/70 mt-1">Contact us for pricing and availability.</p>
            </div>
            <div class="flex gap-4">
              <Link href="/contact/" class="inline-flex items-center gap-2 bg-[#56c270] text-[#042e0d] font-heading font-bold px-6 py-3 rounded hover:bg-white transition-colors">
                Request Quote
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
        content: `${title} - Professional solar equipment from Solamp. Contact us for pricing and specifications.`,
      },
    ],
  };
};
