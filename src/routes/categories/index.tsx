import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { Link, routeLoader$ } from '@builder.io/qwik-city';
import { getDB, cleanSlug } from '../../lib/db';
import { getCategoryImageUrl } from '../../lib/images';

/**
 * Load all categories with their subcategories
 */
export const useCategories = routeLoader$(async (requestEvent) => {
  const db = getDB(requestEvent.platform);
  const allCategories = await db.getCategories();

  // Get top-level categories (those without parent_id or with parent being "All Item Groups")
  const topLevel = allCategories.filter(cat => !cat.parent_id || cat.parent_id === 'all-item-groups');

  // Add subcategories to each top-level category
  return topLevel.map(cat => ({
    ...cat,
    subcategories: allCategories.filter(sub => sub.parent_id === cat.id)
  }));
});

export default component$(() => {
  const categories = useCategories();

  return (
    <div>
      {/* Hero */}
      <section class="bg-[#042e0d] py-10">
        <div class="container mx-auto px-6">
          {/* Breadcrumbs */}
          <nav class="mb-4">
            <ol class="flex items-center gap-2 text-sm">
              <li><Link href="/" class="text-white/50 hover:text-white transition-colors">Home</Link></li>
              <li class="text-white/30">/</li>
              <li class="text-white font-semibold">Categories</li>
            </ol>
          </nav>
          <div class="max-w-3xl">
            <div class="inline-flex items-center gap-2 bg-[#c3a859]/20 text-[#c3a859] px-3 py-1 rounded-full text-sm font-semibold mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Authorized Distributor
            </div>
            <h1 class="font-heading font-extrabold text-3xl md:text-4xl text-white mb-3">
              Product Categories
            </h1>
            <p class="text-white/80 text-lg max-w-2xl">
              Browse our complete selection of solar and energy storage equipment by category.
            </p>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section class="py-10">
        <div class="container mx-auto px-6">
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.value.map((cat) => {
              const imageUrl = getCategoryImageUrl(cat, 'card');
              const slug = cleanSlug(cat.slug);
              return (
                <div key={cat.id} class="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all">
                  <Link href={`/${slug}/`} class="block">
                    {imageUrl && (
                      <div class="aspect-[16/9] overflow-hidden bg-[#f1f1f2]">
                        <img
                          src={imageUrl}
                          alt={cat.title}
                          width={400}
                          height={225}
                          class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div class="p-5">
                      <h2 class="font-heading font-bold text-xl text-[#042e0d] hover:text-[#5974c3] transition-colors">
                        {cat.title}
                      </h2>
                      {cat.count && cat.count > 0 && (
                        <p class="text-sm text-gray-500 mt-1">{cat.count} products</p>
                      )}
                    </div>
                  </Link>

                  {/* Subcategories */}
                  {cat.subcategories && cat.subcategories.length > 0 && (
                    <div class="px-5 pb-5">
                      <p class="text-xs font-mono text-[#c3a859] uppercase tracking-wide mb-2">Subcategories</p>
                      <div class="flex flex-wrap gap-2">
                        {cat.subcategories.slice(0, 4).map((sub) => (
                          <Link
                            key={sub.id}
                            href={`/${slug}/${cleanSlug(sub.slug)}/`}
                            class="text-sm text-[#042e0d] hover:text-[#5974c3] hover:underline"
                          >
                            {sub.title}
                          </Link>
                        ))}
                        {cat.subcategories.length > 4 && (
                          <Link
                            href={`/${slug}/`}
                            class="text-sm text-[#5974c3] hover:underline"
                          >
                            +{cat.subcategories.length - 4} more
                          </Link>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section class="bg-[#042e0d] py-10">
        <div class="container mx-auto px-6">
          <div class="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 class="font-heading font-extrabold text-2xl text-white">Can't find what you need?</h3>
              <p class="text-white/70 mt-1">Send us your BOM and we'll quote your complete project.</p>
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
  title: 'Product Categories | Solamp Solar & Energy Storage',
  meta: [
    {
      name: 'description',
      content: 'Browse all product categories at Solamp. Solar panels, batteries, inverters, charge controllers, mounting systems, and more from trusted manufacturers.',
    },
  ],
};
