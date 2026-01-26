import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { Link, routeLoader$ } from '@builder.io/qwik-city';
import { getDB, cleanSlug } from '../../lib/db';
import { getBrandLogoVariant } from '../../lib/images';

// Loader to fetch all brands
export const useBrands = routeLoader$(async (requestEvent) => {
  const db = getDB(requestEvent.platform);
  const brands = await db.getBrands();
  return brands;
});

export default component$(() => {
  const brands = useBrands();

  // Group brands by first letter for alphabetical navigation
  const brandsByLetter = brands.value.reduce((acc, brand) => {
    const firstLetter = brand.title.charAt(0).toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(brand);
    return acc;
  }, {} as Record<string, typeof brands.value>);

  const letters = Object.keys(brandsByLetter).sort();

  return (
    <div>
      {/* Hero */}
      <section class="bg-[#5974c3] py-8">
        <div class="container mx-auto px-6">
          {/* Breadcrumbs */}
          <nav class="mb-4">
            <ol class="flex items-center gap-2 text-sm">
              <li><Link href="/" class="text-white/50 hover:text-white transition-colors">Home</Link></li>
              <li class="text-white/30">/</li>
              <li class="text-white font-semibold">Brands</li>
            </ol>
          </nav>
          <h1 class="font-heading font-extrabold text-3xl md:text-4xl text-white mb-2">
            Our Brand Partners
          </h1>
          <p class="text-white/80 text-lg max-w-2xl">
            As an authorized distributor, we carry professional-grade solar and energy storage equipment
            from leading manufacturers. Full warranty support and technical assistance included.
          </p>
        </div>
      </section>

      {/* Alphabet Navigation */}
      <section class="border-b border-gray-200 py-4 bg-[#f1f1f2] sticky top-0 z-10">
        <div class="container mx-auto px-6">
          <div class="flex flex-wrap gap-2 justify-center">
            {letters.map((letter) => (
              <a
                key={letter}
                href={`#letter-${letter}`}
                class="w-8 h-8 flex items-center justify-center text-sm font-bold rounded bg-white border border-gray-200 hover:bg-[#5974c3] hover:text-white hover:border-[#5974c3] transition-colors"
              >
                {letter}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Brands Grid by Letter */}
      <section class="py-8">
        <div class="container mx-auto px-6">
          {letters.map((letter) => (
            <div key={letter} id={`letter-${letter}`} class="mb-10 scroll-mt-20">
              <h2 class="font-heading font-extrabold text-2xl text-[#042e0d] mb-4 pb-2 border-b border-gray-200">
                {letter}
              </h2>
              <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {brandsByLetter[letter].map((brand) => {
                  const logoUrl = getBrandLogoVariant(brand, 'full');
                  return (
                    <Link
                      key={brand.id}
                      href={`/${cleanSlug(brand.slug)}/`}
                      class="group bg-white border border-gray-200 rounded-lg p-4 hover:border-[#5974c3] hover:shadow-lg transition-all"
                    >
                      <div class="aspect-[3/2] flex items-center justify-center mb-3 bg-gray-50 rounded">
                        {logoUrl ? (
                          <img
                            src={logoUrl}
                            alt={brand.title}
                            class="max-w-full max-h-full object-contain p-2 grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all"
                            width="150"
                            height="100"
                            loading="lazy"
                          />
                        ) : (
                          <span class="font-heading font-bold text-gray-400 group-hover:text-[#5974c3] transition-colors text-center px-2">
                            {brand.title}
                          </span>
                        )}
                      </div>
                      <p class="font-semibold text-sm text-[#042e0d] group-hover:text-[#5974c3] transition-colors text-center truncate">
                        {brand.title}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section class="py-12 bg-[#f1f1f2]">
        <div class="container mx-auto px-6">
          <div class="flex flex-wrap justify-center items-center gap-10 md:gap-16 text-center">
            <div>
              <p class="font-heading font-extrabold text-3xl text-[#042e0d]">{brands.value.length}</p>
              <p class="text-xs font-mono text-[#c3a859] uppercase tracking-widest mt-1">Brand Partners</p>
            </div>
            <div>
              <p class="font-heading font-extrabold text-3xl text-[#042e0d]">100%</p>
              <p class="text-xs font-mono text-[#c3a859] uppercase tracking-widest mt-1">Authorized</p>
            </div>
            <div>
              <p class="font-heading font-extrabold text-3xl text-[#042e0d]">Full</p>
              <p class="text-xs font-mono text-[#c3a859] uppercase tracking-widest mt-1">Warranty Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section class="bg-[#042e0d] py-10">
        <div class="container mx-auto px-6">
          <div class="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 class="font-heading font-extrabold text-2xl text-white">Looking for a specific brand?</h3>
              <p class="text-white/70 mt-1">Contact us if you don't see a brand you need. We may be able to source it.</p>
            </div>
            <div class="flex flex-wrap gap-3">
              <Link href="/contact-us/" class="inline-flex items-center gap-2 bg-[#56c270] text-[#042e0d] font-heading font-bold px-5 py-3 rounded hover:bg-white transition-colors">
                Request Quote
              </Link>
              <a href="tel:978-451-6890" class="inline-flex items-center gap-2 bg-[#c3a859] text-white font-heading font-bold px-5 py-3 rounded hover:bg-[#c3a859]/80 transition-colors">
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
  title: 'All Brands | Solamp Solar & Energy Storage',
  meta: [
    {
      name: 'description',
      content: 'Browse all brand partners at Solamp. Authorized distributor of professional-grade solar panels, batteries, inverters, and energy storage equipment.',
    },
  ],
};
