import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { useLocation, Link, routeLoader$ } from '@builder.io/qwik-city';
import { getDB, cleanSlug } from '../../../../lib/db';
import { ProductCard } from '../../../../components/product/ProductCard';

// Loader to fetch brand data and its products
export const useBrandData = routeLoader$(async (requestEvent) => {
  const db = getDB(requestEvent.platform);
  const brandSlug = requestEvent.params.brand;

  // Fetch the brand by slug
  const brand = await db.getBrand(brandSlug);
  if (!brand) {
    return { brand: null, products: [], pagination: null, allBrands: [] };
  }

  // Fetch all brands for the quick nav
  const allBrands = await db.getBrands();

  // Fetch products for this brand
  const result = await db.getProducts({
    brand: brandSlug,
    limit: 50,
    sort: 'title',
    order: 'asc'
  });

  return {
    brand,
    products: result.products,
    pagination: result.pagination,
    allBrands
  };
});

export default component$(() => {
  const loc = useLocation();
  const brandSlug = loc.params.brand;
  const data = useBrandData();

  const brand = data.value.brand;
  const brandName = brand?.title || brandSlug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const products = data.value.products;
  const allBrands = data.value.allBrands;
  const productCount = products.length;

  return (
    <div>
      {/* Hero */}
      <section class="bg-[#5974c3] py-8">
        <div class="px-6">
          {/* Breadcrumbs */}
          <nav class="mb-4">
            <ol class="flex items-center gap-2 text-sm">
              <li><Link href="/" class="text-white/50 hover:text-white transition-colors">Home</Link></li>
              <li class="text-white/30">/</li>
              <li><Link href="/products/" class="text-white/50 hover:text-white transition-colors">Products</Link></li>
              <li class="text-white/30">/</li>
              <li class="text-white font-semibold">{brandName}</li>
            </ol>
          </nav>
          <div class="flex items-center gap-6">
            {/* Brand Logo */}
            <div class="w-24 h-24 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              {brand?.logo_url ? (
                <img src={brand.logo_url} alt={brandName} class="w-full h-full object-contain p-2" />
              ) : (
                <span class="text-white font-heading font-bold text-xl text-center px-2">{brandName.split(' ')[0]}</span>
              )}
            </div>
            <div>
              <p class="text-white/60 text-sm font-semibold mb-1">Authorized Distributor</p>
              <h1 class="font-heading font-extrabold text-2xl md:text-3xl text-white mb-2">
                {brandName}
              </h1>
              <p class="text-white/80">
                Browse our selection of {brandName} products.
                {productCount > 0 && ` ${productCount} products available.`}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Other Brands Quick Nav */}
      {allBrands.length > 0 && (
        <section class="border-b border-gray-200 py-4 bg-[#f1f1f2] overflow-x-auto">
          <div class="px-6">
            <div class="flex gap-2 min-w-max">
              {allBrands.slice(0, 8).map((b) => {
                const bSlug = cleanSlug(b.slug);
                return (
                  <Link
                    key={b.id}
                    href={`/products/brand/${bSlug}/`}
                    class={[
                      'px-4 py-2 text-sm font-semibold rounded transition-colors whitespace-nowrap',
                      bSlug === brandSlug
                        ? 'bg-[#5974c3] text-white'
                        : 'bg-white hover:bg-[#5974c3] hover:text-white text-[#042e0d] border border-gray-200',
                    ].join(' ')}
                  >
                    {b.title}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Products Grid */}
      <section class="py-8">
        <div class="px-6">
          {products.length === 0 ? (
            <div class="text-center py-12">
              <p class="text-gray-500 text-lg">No products found for this brand.</p>
              <p class="text-gray-400 text-sm mt-2">Check back soon or contact us for availability.</p>
            </div>
          ) : (
            <div class="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Brand Info */}
      <section class="py-10 bg-[#f1f1f2]">
        <div class="px-6">
          <div class="max-w-3xl">
            <h2 class="font-heading font-extrabold text-xl text-[#042e0d] mb-4">About {brandName}</h2>
            {brand?.description ? (
              <p class="text-gray-600 mb-4">{brand.description}</p>
            ) : (
              <p class="text-gray-600 mb-4">
                {brandName} is a trusted manufacturer of professional-grade solar and energy storage equipment.
                As an authorized distributor, Solamp provides full warranty support and technical assistance for all {brandName} products.
              </p>
            )}
            <div class="flex flex-wrap gap-4">
              <div class="bg-white rounded-lg p-4 border border-gray-200">
                <p class="text-xs font-mono text-[#c3a859] uppercase mb-1">Products</p>
                <p class="font-heading font-bold text-xl text-[#042e0d]">{productCount}+</p>
              </div>
              <div class="bg-white rounded-lg p-4 border border-gray-200">
                <p class="text-xs font-mono text-[#c3a859] uppercase mb-1">Warranty</p>
                <p class="font-heading font-bold text-xl text-[#042e0d]">Full</p>
              </div>
              <div class="bg-white rounded-lg p-4 border border-gray-200">
                <p class="text-xs font-mono text-[#c3a859] uppercase mb-1">Support</p>
                <p class="font-heading font-bold text-xl text-[#042e0d]">Technical</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section class="bg-[#042e0d] py-10">
        <div class="px-6">
          <div class="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 class="font-heading font-extrabold text-2xl text-white">Questions about {brandName}?</h3>
              <p class="text-white/70 mt-1">Our engineers can help you select the right products for your project.</p>
            </div>
            <div class="flex flex-wrap gap-3">
              <Link href="/contact/" class="inline-flex items-center gap-2 bg-[#56c270] text-[#042e0d] font-heading font-bold px-5 py-3 rounded hover:bg-white transition-colors">
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

export const head: DocumentHead = ({ params, resolveValue }) => {
  const data = resolveValue(useBrandData);
  const brandSlug = params.brand;
  const brandName = data?.brand?.title || brandSlug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return {
    title: `${brandName} Products | Solamp Solar & Energy Storage`,
    meta: [
      {
        name: 'description',
        content: `Shop ${brandName} products. Authorized distributor with full warranty support and technical assistance. Professional-grade solar equipment.`,
      },
    ],
  };
};
