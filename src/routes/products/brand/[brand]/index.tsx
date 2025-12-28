import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { useLocation, Link } from '@builder.io/qwik-city';
import { brands } from '../../../../components/products/ProductSidebar';

// Placeholder products
const generateProducts = (brandName: string, count: number) => {
  const productTypes = ['Inverter', 'Battery', 'Controller', 'Panel', 'Mount Kit', 'Combiner'];
  return Array.from({ length: count }, (_, i) => ({
    id: `${brandName.toLowerCase().replace(/\s+/g, '-')}-${i + 1}`,
    name: `${brandName} ${productTypes[i % productTypes.length]} ${i + 1}`,
    brand: brandName,
    price: 'Call for Pricing',
    stock: i % 3 === 0 ? 'Low Stock' : 'In Stock',
    specs: 'Professional Grade | Full Warranty',
    image: null,
  }));
};

export default component$(() => {
  const loc = useLocation();
  const brandSlug = loc.params.brand;

  // Find brand data
  const brand = brands.find((b) => b.slug === brandSlug);
  const brandName = brand?.name || brandSlug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const productCount = brand?.count || 0;

  // Generate placeholder products
  const products = generateProducts(brandName, Math.min(productCount, 12));

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
            {/* Brand Logo Placeholder */}
            <div class="w-24 h-24 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <span class="text-white font-heading font-bold text-xl text-center px-2">{brandName.split(' ')[0]}</span>
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
      <section class="border-b border-gray-200 py-4 bg-[#f1f1f2] overflow-x-auto">
        <div class="px-6">
          <div class="flex gap-2 min-w-max">
            {brands.slice(0, 8).map((b) => (
              <Link
                key={b.slug}
                href={`/products/brand/${b.slug}/`}
                class={[
                  'px-4 py-2 text-sm font-semibold rounded transition-colors whitespace-nowrap',
                  b.slug === brandSlug
                    ? 'bg-[#5974c3] text-white'
                    : 'bg-white hover:bg-[#5974c3] hover:text-white text-[#042e0d] border border-gray-200',
                ].join(' ')}
              >
                {b.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section class="py-8">
        <div class="px-6">
          <div class="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {products.map((product) => (
              <div key={product.id} class="bg-white rounded-lg border border-gray-200 overflow-hidden group hover:shadow-lg transition-shadow">
                <Link href={`/products/${product.id}/`} class="block">
                  <div class="aspect-[4/3] bg-gray-100 flex items-center justify-center relative p-4">
                    <div class="text-center text-gray-300">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="0.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span class="text-xs">Product Photo</span>
                    </div>
                    <span class={[
                      'absolute top-3 left-3 text-xs font-bold px-2 py-1 rounded',
                      product.stock === 'In Stock' ? 'bg-[#56c270] text-[#042e0d]' : 'bg-[#c3a859] text-white',
                    ].join(' ')}>{product.stock}</span>
                  </div>
                </Link>
                <div class="p-4">
                  <p class="text-xs font-mono text-[#5974c3] uppercase tracking-wide mb-1">{product.brand}</p>
                  <Link href={`/products/${product.id}/`} class="font-heading font-bold text-[#042e0d] group-hover:text-[#5974c3] transition-colors block">
                    {product.name}
                  </Link>
                  <p class="text-sm text-gray-500 font-mono mt-1">{product.specs}</p>
                  <div class="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span class="font-heading font-bold text-[#042e0d]">{product.price}</span>
                    <button class="bg-[#042e0d] text-white px-3 py-1.5 rounded text-sm font-bold hover:bg-[#042e0d]/80 transition-colors">
                      Add to Quote
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          {products.length < productCount && (
            <div class="text-center mt-8">
              <button class="bg-white border-2 border-[#042e0d] text-[#042e0d] font-heading font-bold px-8 py-3 rounded hover:bg-[#042e0d] hover:text-white transition-colors">
                Load More Products
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Brand Info */}
      <section class="py-10 bg-[#f1f1f2]">
        <div class="px-6">
          <div class="max-w-3xl">
            <h2 class="font-heading font-extrabold text-xl text-[#042e0d] mb-4">About {brandName}</h2>
            <p class="text-gray-600 mb-4">
              {brandName} is a trusted manufacturer of professional-grade solar and energy storage equipment.
              As an authorized distributor, Solamp provides full warranty support and technical assistance for all {brandName} products.
            </p>
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
  const brandSlug = params.brand;
  const brand = brands.find((b) => b.slug === brandSlug);
  const brandName = brand?.name || brandSlug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

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
