import { component$, useSignal } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { Link } from '@builder.io/qwik-city';

const docCategories = [
  {
    title: 'Inverters',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    docs: [
      { title: 'Sol-Ark 15K Installation', description: 'Setup and commissioning guide' },
      { title: 'OutBack Radian Series', description: 'Technical specifications' },
      { title: 'MidNite Rosie Overview', description: 'Product documentation' },
    ],
  },
  {
    title: 'Batteries',
    icon: 'M20 7h-4V3H8v4H4a1 1 0 00-1 1v12a1 1 0 001 1h16a1 1 0 001-1V8a1 1 0 00-1-1zM9 5h6v2H9V5zm10 14H5V9h14v10zm-7-8a3 3 0 100 6 3 3 0 000-6z',
    docs: [
      { title: 'Fortress Power eFlex', description: 'Installation and configuration' },
      { title: 'SimpliPhi PHI Batteries', description: 'Specifications and wiring' },
      { title: 'EG4 LifePower4', description: 'User manual and setup' },
    ],
  },
  {
    title: 'Charge Controllers',
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    docs: [
      { title: 'MidNite Classic Series', description: 'Programming and monitoring' },
      { title: 'Morningstar TriStar', description: 'Technical reference' },
      { title: 'Victron SmartSolar', description: 'VE.Direct integration' },
    ],
  },
  {
    title: 'Mounting Systems',
    icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    docs: [
      { title: 'Tamarack Pathfinder', description: 'Installation manual' },
      { title: 'IronRidge XR Rails', description: 'Design and layout' },
      { title: 'S-5! Clamps Guide', description: 'Metal roof attachment' },
    ],
  },
];

export default component$(() => {
  const searchQuery = useSignal('');

  return (
    <div class="bg-white min-h-screen">
      {/* Hero */}
      <section class="bg-[#042e0d] py-12">
        <div class="container mx-auto px-4">
          <div class="max-w-3xl">
            <div class="inline-flex items-center gap-2 bg-[#c3a859]/20 text-[#c3a859] px-3 py-1 rounded-full text-sm font-semibold mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Product Documentation
            </div>
            <h1 class="font-heading font-extrabold text-3xl md:text-4xl text-white mb-4">
              Product Library
            </h1>
            <p class="text-white/80 text-lg max-w-2xl mb-6">
              Manuals, spec sheets, installation guides, and technical documentation for the products we carry.
            </p>

            {/* Search */}
            <div class="max-w-xl">
              <div class="relative">
                <input
                  type="text"
                  placeholder="Search documentation..."
                  class="w-full border-2 border-white/20 bg-white/10 text-white placeholder-white/50 px-4 py-3 pr-12 rounded focus:outline-none focus:border-white/40 focus:bg-white/20 transition-colors"
                  bind:value={searchQuery}
                />
                <button class="absolute right-0 top-0 h-full px-4 text-white/70 hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section class="border-b border-gray-200 py-4 bg-[#f1f1f2]">
        <div class="container mx-auto px-4">
          <div class="flex flex-wrap gap-3 justify-center">
            <button class="px-4 py-2 bg-[#042e0d] text-white rounded text-sm font-bold">
              All Products
            </button>
            <button class="px-4 py-2 bg-white border border-gray-200 rounded text-sm font-bold text-[#042e0d] hover:border-primary transition-colors">
              Inverters
            </button>
            <button class="px-4 py-2 bg-white border border-gray-200 rounded text-sm font-bold text-[#042e0d] hover:border-primary transition-colors">
              Batteries
            </button>
            <button class="px-4 py-2 bg-white border border-gray-200 rounded text-sm font-bold text-[#042e0d] hover:border-primary transition-colors">
              Controllers
            </button>
            <button class="px-4 py-2 bg-white border border-gray-200 rounded text-sm font-bold text-[#042e0d] hover:border-primary transition-colors">
              Mounting
            </button>
          </div>
        </div>
      </section>

      {/* Documentation Categories */}
      <section class="py-12">
        <div class="container mx-auto px-4">
          <div class="grid md:grid-cols-2 gap-8">
            {docCategories.map((category) => (
              <div key={category.title} class="bg-[#f1f1f2] rounded-lg border border-gray-200 overflow-hidden">
                <div class="p-5 border-b border-gray-200 flex items-center gap-3">
                  <div class="w-10 h-10 bg-[#c3a859]/10 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#c3a859]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d={category.icon} />
                    </svg>
                  </div>
                  <h2 class="font-heading font-bold text-xl text-[#042e0d]">{category.title}</h2>
                </div>
                <ul class="divide-y divide-base-200">
                  {category.docs.map((doc) => (
                    <li key={doc.title}>
                      <Link href="/docs/" class="flex items-start gap-3 p-4 hover:bg-white transition-colors group">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#5974c3] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div>
                          <h3 class="font-bold text-[#042e0d] group-hover:text-[#5974c3] transition-colors">{doc.title}</h3>
                          <p class="text-sm text-gray/60">{doc.description}</p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brands */}
      <section class="py-10 bg-[#f1f1f2] border-t border-gray-200">
        <div class="container mx-auto px-4">
          <h2 class="font-heading font-extrabold text-xl text-[#042e0d] text-center mb-6">Documentation by Brand</h2>
          <div class="flex flex-wrap justify-center gap-4">
            {['MidNite Solar', 'Sol-Ark', 'OutBack Power', 'Fortress Power', 'Morningstar', 'Victron', 'Tamarack', 'IronRidge'].map((brand) => (
              <Link key={brand} href="/docs/" class="px-4 py-2 bg-white border border-gray-200 rounded text-sm font-semibold text-gray/70 hover:text-[#042e0d] hover:border-primary transition-colors">
                {brand}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section class="bg-[#042e0d] py-10">
        <div class="container mx-auto px-4">
          <div class="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 class="font-heading font-extrabold text-2xl text-white">Can't find what you're looking for?</h3>
              <p class="text-white/70 mt-1">Contact us and we'll help you find the documentation you need.</p>
            </div>
            <div class="flex gap-4">
              <Link href="/contact-us/" class="inline-flex items-center gap-2 bg-[#56c270] text-[#042e0d] font-heading font-bold px-6 py-3 rounded hover:bg-white transition-colors">
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

export const head: DocumentHead = {
  title: 'Product Library | Solamp Solar & Energy Storage',
  meta: [
    {
      name: 'description',
      content: 'Product manuals, spec sheets, and installation guides for solar inverters, batteries, charge controllers, and mounting systems.',
    },
  ],
};
