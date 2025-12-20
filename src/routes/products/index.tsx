import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { Link } from '@builder.io/qwik-city';

const categories = [
  {
    name: 'Solar Panels',
    slug: 'solar-panels',
    description: 'Mono PERC, bifacial, and polycrystalline panels from leading manufacturers.',
    productCount: 45,
    brands: ['ZNShine', 'Jinko', 'Canadian Solar', 'Q-CELLS'],
  },
  {
    name: 'Batteries & Storage',
    slug: 'batteries',
    description: 'LiFePO4, lithium-ion, and lead-acid batteries for residential and commercial.',
    productCount: 32,
    brands: ['Fortress Power', 'SimpliPhi', 'Discover', 'EG4'],
  },
  {
    name: 'Inverters',
    slug: 'inverters',
    description: 'Hybrid, off-grid, and grid-tie inverters for every application.',
    productCount: 28,
    brands: ['Sol-Ark', 'OutBack', 'SMA', 'Victron'],
  },
  {
    name: 'Charge Controllers',
    slug: 'charge-controllers',
    description: 'MPPT and PWM controllers from trusted brands.',
    productCount: 18,
    brands: ['MidNite Solar', 'Morningstar', 'Victron', 'OutBack'],
  },
  {
    name: 'Mounting & Racking',
    slug: 'mounting',
    description: 'Ground mount, rooftop, and pole mount systems.',
    productCount: 56,
    brands: ['Tamarack', 'IronRidge', 'Unirac', 'S-5!'],
  },
  {
    name: 'Balance of System',
    slug: 'bos',
    description: 'Combiners, disconnects, wire, and protection devices.',
    productCount: 124,
    brands: ['MidNite Solar', 'OutBack', 'Various'],
  },
];

const featuredProducts = [
  {
    name: 'Sol-Ark 15K-2P Hybrid Inverter',
    category: 'Inverters',
    price: 'Call for Pricing',
    stock: 'In Stock',
    specs: '15kW | 48V | All-in-One',
  },
  {
    name: 'Fortress Power eFlex 5.4',
    category: 'Batteries',
    price: 'Call for Pricing',
    stock: 'In Stock',
    specs: '5.4kWh | LiFePO4 | Stackable',
  },
  {
    name: 'ZNShine 550W Bifacial',
    category: 'Solar Panels',
    price: 'Call for Pricing',
    stock: 'In Stock',
    specs: 'Mono PERC | 21.3% Efficiency',
  },
  {
    name: 'MidNite Classic 150',
    category: 'Charge Controllers',
    price: 'Call for Pricing',
    stock: 'In Stock',
    specs: '150V | MPPT | 96A',
  },
];

export default component$(() => {
  return (
    <div class="bg-white min-h-screen">
      {/* Hero - SOLID Forest Green */}
      <section class="bg-[#042e0d] py-12">
        <div class="container mx-auto px-4">
          <div class="max-w-3xl">
            <div class="inline-flex items-center gap-2 bg-[#c3a859]/20 text-[#c3a859] px-3 py-1 rounded-full text-sm font-semibold mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Authorized Distributor
            </div>
            <h1 class="font-heading font-extrabold text-3xl md:text-4xl text-white mb-4">
              Solar &amp; Energy Storage Products
            </h1>
            <p class="text-white/80 text-lg max-w-2xl">
              Tier-1 equipment from manufacturers you trust. Every product backed by our technical support team.
            </p>
          </div>
        </div>
      </section>

      {/* Search and filter bar */}
      <section class="border-b border-gray-300 py-4 bg-[#f1f1f2]">
        <div class="container mx-auto px-4">
          <div class="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div class="relative w-full md:w-96">
              <input
                type="text"
                placeholder="Search products, brands, part numbers..."
                class="w-full border border-gray-300 bg-white px-4 py-2 pr-10 text-sm rounded focus:outline-none focus:border-[#042e0d]"
              />
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div class="flex gap-2">
              <select class="border border-gray-300 bg-white px-3 py-2 text-sm rounded">
                <option disabled selected>Filter by Brand</option>
                <option>MidNite Solar</option>
                <option>Sol-Ark</option>
                <option>Fortress Power</option>
                <option>OutBack Power</option>
              </select>
              <select class="border border-gray-300 bg-white px-3 py-2 text-sm rounded">
                <option disabled selected>Sort by</option>
                <option>Name A-Z</option>
                <option>Price Low-High</option>
                <option>In Stock First</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section class="py-10">
        <div class="container mx-auto px-4">
          <h2 class="font-heading font-extrabold text-2xl text-[#042e0d] mb-6">Shop by Category</h2>
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((cat) => (
              <Link key={cat.slug} href={`/products/${cat.slug}`} class="group bg-[#f1f1f2] border border-gray-200 rounded-lg p-5 hover:border-[#042e0d] hover:shadow-lg transition-all">
                <div class="flex justify-between items-start mb-3">
                  <h3 class="font-heading font-bold text-lg text-[#042e0d] group-hover:text-[#5974c3] transition-colors">{cat.name}</h3>
                  <span class="text-xs font-mono text-[#c3a859] bg-[#c3a859]/10 px-2 py-1 rounded">{cat.productCount} items</span>
                </div>
                <p class="text-sm text-gray-600 mb-3">{cat.description}</p>
                <div class="flex flex-wrap gap-1.5">
                  {cat.brands.map((brand) => (
                    <span key={brand} class="text-xs text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200">{brand}</span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section class="py-10 bg-[#f1f1f2]">
        <div class="container mx-auto px-4">
          <div class="flex justify-between items-end mb-6">
            <div>
              <h2 class="font-heading font-extrabold text-2xl text-[#042e0d]">Featured Products</h2>
              <p class="text-gray-500 mt-1">Popular items from our catalog</p>
            </div>
          </div>
          <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredProducts.map((product) => (
              <div key={product.name} class="bg-white rounded-lg border border-gray-200 overflow-hidden group hover:shadow-lg transition-shadow">
                <div class="aspect-square bg-gray-100 flex items-center justify-center relative">
                  <div class="text-center text-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-20 w-20 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="0.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span class="text-xs">Product Photo</span>
                  </div>
                  <span class="absolute top-3 left-3 bg-[#56c270] text-[#042e0d] text-xs font-bold px-2 py-1 rounded">{product.stock}</span>
                </div>
                <div class="p-4">
                  <p class="text-xs font-mono text-[#c3a859] uppercase tracking-wide mb-1">{product.category}</p>
                  <Link href="/products/product" class="font-heading font-bold text-[#042e0d] group-hover:text-[#5974c3] transition-colors block">{product.name}</Link>
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
        </div>
      </section>

      {/* CTA - SOLID Forest Green */}
      <section class="bg-[#042e0d] py-10">
        <div class="container mx-auto px-4">
          <div class="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 class="font-heading font-extrabold text-2xl text-white">Can't find what you need?</h3>
              <p class="text-white/70 mt-1">Send us your BOM and we'll quote your complete project.</p>
            </div>
            <div class="flex gap-4">
              <Link href="/contact/" class="inline-flex items-center gap-2 bg-[#56c270] text-[#042e0d] font-heading font-bold px-6 py-3 rounded hover:bg-white transition-colors">
                Request Quote
              </Link>
              <a href="tel:978-451-6890" class="inline-flex items-center gap-2 bg-[#c3a859] text-white font-heading font-bold px-6 py-3 rounded hover:bg-[#c3a859]/80 transition-colors">
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
