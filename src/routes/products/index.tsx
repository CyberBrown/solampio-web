import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { Link, routeLoader$ } from '@builder.io/qwik-city';
import { getDB } from '../../lib/db';
import { ProductCard } from '../../components/product/ProductCard';
import { getCategoryImageUrl } from '../../lib/images';

/**
 * Load top-level product categories from D1
 * (children of "All Item Groups" - the main nav categories)
 */
export const useCategories = routeLoader$(async (requestEvent) => {
  const db = getDB(requestEvent.platform);
  const categories = await db.getTopLevelCategories();
  return categories;
});

/**
 * Load featured products from D1
 */
export const useFeaturedProducts = routeLoader$(async (requestEvent) => {
  const db = getDB(requestEvent.platform);
  const products = await db.getFeaturedProducts(6);
  return products;
});

export default component$(() => {
  const categories = useCategories();
  const featuredProducts = useFeaturedProducts();
  return (
    <div>
      {/* Hero - SOLID Forest Green */}
      <section class="bg-[#042e0d] py-10">
        <div class="px-6">
          <div class="max-w-3xl">
            <div class="inline-flex items-center gap-2 bg-[#c3a859]/20 text-[#c3a859] px-3 py-1 rounded-full text-sm font-semibold mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Authorized Distributor
            </div>
            <h1 class="font-heading font-extrabold text-3xl md:text-4xl text-white mb-3">
              Solar &amp; Energy Storage Products
            </h1>
            <p class="text-white/80 text-lg max-w-2xl">
              Tier-1 equipment from manufacturers you trust. Every product backed by our technical support team.
            </p>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section class="py-8">
        <div class="px-6">
          <h2 class="font-heading font-extrabold text-xl text-[#042e0d] mb-5">Shop by Category</h2>
          <div class="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {categories.value.map((cat) => {
              const imageUrl = getCategoryImageUrl(cat, 'card');
              return (
                <Link key={cat.id} href={`/${cat.slug}/`} class="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-[#042e0d] hover:shadow-lg transition-all">
                  {imageUrl && (
                    <div class="aspect-[16/9] overflow-hidden bg-[#f1f1f2]">
                      <img
                        src={imageUrl}
                        alt={cat.title}
                        width={400}
                        height={225}
                        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div class="p-4">
                    <h3 class="font-heading font-bold text-lg text-[#042e0d] group-hover:text-[#5974c3] transition-colors">{cat.title}</h3>
                    {cat.description && (
                      <p class="text-sm text-gray-600 mt-2">{cat.description.substring(0, 100)}{cat.description.length > 100 ? '...' : ''}</p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section class="py-8 bg-[#f1f1f2]">
        <div class="px-6">
          <div class="flex justify-between items-end mb-5">
            <div>
              <h2 class="font-heading font-extrabold text-xl text-[#042e0d]">Featured Products</h2>
              <p class="text-gray-500 text-sm mt-1">Popular items from our catalog</p>
            </div>
          </div>
          <div class="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {featuredProducts.value.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA - SOLID Forest Green */}
      <section class="bg-[#042e0d] py-10">
        <div class="px-6">
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
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
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
  title: 'Products | Solamp Solar & Energy Storage',
  meta: [
    {
      name: 'description',
      content: 'Shop solar panels, batteries, inverters, charge controllers, and balance of system components from trusted manufacturers. Tier-1 equipment for professional installers.',
    },
  ],
};
