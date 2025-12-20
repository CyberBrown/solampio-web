import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { Link } from '@builder.io/qwik-city';

const featuredProducts = [
  {
    category: 'Solar Panels',
    name: 'ZNShine 450W Bifacial',
    specs: 'Mono PERC | Bifacial',
    price: 'Starting at $189',
    stock: 'In Stock',
    href: '/products/',
    image: 'https://cdn11.bigcommerce.com/s-yhdp96gt9k/images/stencil/1280w/products/706/3697/-ZNShine-450W-Bifacial-Solar-Panel_3693__13117.1760365366.jpg',
  },
  {
    category: 'Inverters',
    name: 'Sol-Ark 15K Hybrid',
    specs: '15kW | 48V | All-in-One',
    price: 'Starting at $5,495',
    stock: 'In Stock',
    href: '/products/',
    image: 'https://cdn11.bigcommerce.com/s-yhdp96gt9k/images/stencil/1280w/products/130/3415/Sol-ark-Sol-Ark-Hybrid-Inverter_2494__62281.1757948040.jpg',
  },
  {
    category: 'Batteries',
    name: 'Fortress Power eFlex MAX',
    specs: '5.4kWh | LiFePO4 | Stackable',
    price: 'Starting at $2,195',
    stock: 'In Stock',
    href: '/products/',
    image: 'https://cdn11.bigcommerce.com/s-yhdp96gt9k/images/stencil/1280w/products/694/3652/Fortress-Power-Fortress-Power-eFlex-MAX-54-kW_3616__72874.1758739079.jpg',
  },
  {
    category: 'Portable Power',
    name: 'Titan Mini Power Pack',
    specs: 'Portable | Solar Ready',
    price: 'Starting at $1,299',
    stock: 'In Stock',
    href: '/products/',
    image: 'https://cdn11.bigcommerce.com/s-yhdp96gt9k/images/stencil/1280w/products/717/3739/-Titan-Mini-Portable-Solar-Battery-Pack_3724__87428.1761763224.jpg',
  },
];

const projectTypes = [
  {
    name: 'Off-Grid Cabin',
    description: 'Complete independence from the utility grid',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    products: ['Solar Panels', 'Batteries', 'Charge Controllers', 'Inverters'],
    color: 'bg-[#042e0d]',
    href: '/products/',
  },
  {
    name: 'RV & Van Life',
    description: 'Mobile solar for life on the road',
    icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
    products: ['Flexible Panels', 'Portable Power', 'MPPT Controllers'],
    color: 'bg-[#5974c3]',
    href: '/products/',
  },
  {
    name: 'Grid-Tied Backup',
    description: 'Stay powered when the grid goes down',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    products: ['Hybrid Inverters', 'Battery Banks', 'Transfer Switches'],
    color: 'bg-[#c3a859]',
    href: '/products/',
  },
  {
    name: 'DIY Starter',
    description: 'Small projects to get started with solar',
    icon: 'M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z',
    products: ['Starter Kits', 'Small Panels', 'PWM Controllers'],
    color: 'bg-[#56c270]',
    href: '/products/',
  },
];

const categoryTiles = [
  {
    name: 'Solar Panels',
    description: 'Rooftop, ground mount, off-grid',
    image: 'https://cdn11.bigcommerce.com/s-yhdp96gt9k/images/stencil/1280w/products/364/3115/CW-Energy-410w-Bifacial-Perc-Monocrystalline-Solar-Panel-from-CW-Energy_2651__20471.1755546904.jpg',
    href: '/products/',
  },
  {
    name: 'Batteries',
    description: 'LiFePO4, lithium, rack mount',
    image: 'https://cdn11.bigcommerce.com/s-yhdp96gt9k/images/stencil/1280w/products/662/3505/-Titan-Power-Pack_3239__41557.1757958790.jpg',
    href: '/products/',
  },
  {
    name: 'Inverters',
    description: 'Hybrid, grid-tie, off-grid',
    image: 'https://cdn11.bigcommerce.com/s-yhdp96gt9k/images/stencil/1280w/products/130/3415/Sol-ark-Sol-Ark-Hybrid-Inverter_2494__62281.1757948040.jpg',
    href: '/products/',
  },
  {
    name: 'Charge Controllers',
    description: 'MPPT, PWM, stacking',
    image: 'https://cdn11.bigcommerce.com/s-yhdp96gt9k/images/stencil/1280w/products/694/3652/Fortress-Power-Fortress-Power-eFlex-MAX-54-kW_3616__72874.1758739079.jpg',
    href: '/products/',
  },
  {
    name: 'Mounting',
    description: 'Ground, roof, pole mount',
    image: 'https://cdn11.bigcommerce.com/s-yhdp96gt9k/images/stencil/1500x1500/products/163/2794/Tamarack-Ground-Mount-Kit_907__48088.1758915279.jpg',
    href: '/products/',
  },
  {
    name: 'Balance of System',
    description: 'Wire, combiners, monitoring',
    image: 'https://cdn11.bigcommerce.com/s-yhdp96gt9k/images/stencil/1500x1500/products/162/3716/tamarack_module_kit__45249.1760740354.jpg',
    href: '/products/',
  },
];

const brandPartners = [
  'MidNite Solar',
  'Sol-Ark',
  'Fortress Power',
  'Tamarack',
  'Morningstar',
  'OutBack Power',
];

export default component$(() => {
  return (
    <div class="bg-white">
      {/* Hero - SOLID Forest Green, no gradients */}
      <section class="bg-[#042e0d]">
        <div class="container mx-auto px-4 py-12 md:py-16">
          <div class="grid lg:grid-cols-5 gap-8 items-center">
            <div class="lg:col-span-3">
              <div class="inline-flex items-center gap-2 bg-[#c3a859]/20 text-[#c3a859] px-3 py-1 rounded-full text-sm font-semibold mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                18+ Years Serving Solar Professionals
              </div>
              <h1 class="font-heading font-extrabold text-3xl md:text-4xl lg:text-5xl text-white mb-4 leading-tight">
                Solar &amp; Energy Storage Components You Can Count On
              </h1>
              <p class="text-white/80 text-lg mb-6 max-w-2xl">
                From barn installations to off-grid cabins, we supply the Tier-1 equipment that powers real projects.
                Technical support from engineers who've been there.
              </p>
              <div class="flex flex-wrap gap-3">
                <Link href="/products/" class="inline-flex items-center gap-2 bg-[#56c270] text-[#042e0d] font-heading font-bold px-6 py-3 rounded hover:bg-white transition-colors">
                  Browse Products
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link href="/contact/" class="inline-flex items-center gap-2 bg-[#c3a859] text-white font-heading font-bold px-6 py-3 rounded hover:bg-[#c3a859]/80 transition-colors">
                  Request Quote
                </Link>
              </div>
            </div>

            {/* Expert support card */}
            <div class="lg:col-span-2">
              <div class="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-6">
                <div class="flex items-center gap-3 mb-4">
                  <div class="w-14 h-14 bg-[#c3a859] rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-white/60 text-sm">Call a Solar Expert</p>
                    <a href="tel:978-451-6890" class="font-heading font-extrabold text-2xl text-white hover:text-[#56c270] transition-colors">978-451-6890</a>
                  </div>
                </div>
                <p class="text-white/70 text-sm leading-relaxed">
                  Not sure which inverter pairs with your battery bank? Need help sizing a system for a customer?
                  Our engineers understand the real-world challenges of solar installation.
                </p>
                <div class="mt-4 pt-4 border-t border-white/10">
                  <p class="text-xs text-white/50">Mon-Fri 8am-5pm EST • Boxboro, MA</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Partners */}
      <section class="bg-[#f1f1f2] border-b border-gray-300 py-5">
        <div class="container mx-auto px-4">
          <div class="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            <span class="text-xs font-mono text-[#c3a859] uppercase tracking-wider">Authorized Distributor</span>
            {brandPartners.map((brand) => (
              <span key={brand} class="font-heading font-bold text-gray-400 hover:text-[#042e0d] transition-colors cursor-pointer">{brand}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Category tiles - Photo backgrounds with dark overlay, like SparkFun */}
      <section class="py-12 bg-white">
        <div class="container mx-auto px-4">
          <div class="flex justify-between items-end mb-8">
            <div>
              <h2 class="font-heading font-extrabold text-2xl md:text-3xl text-[#042e0d]">Shop by Category</h2>
              <p class="text-[#042e0d]/70 mt-1">Equipment for every installation type</p>
            </div>
            <Link href="/products/" class="text-[#5974c3] font-bold hover:underline hidden md:block">View All Products →</Link>
          </div>
          <div class="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryTiles.map((cat) => (
              <Link key={cat.name} href={cat.href} class="group relative overflow-hidden rounded-lg aspect-[4/3] transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                {/* Background - real product photo */}
                <img
                  src={cat.image}
                  alt={cat.name}
                  class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  width="400"
                  height="300"
                />
                {/* Dark overlay for text readability - lighter filter */}
                <div class="absolute inset-0 bg-[#042e0d]/40 group-hover:bg-[#042e0d]/55 transition-colors duration-300"></div>
                {/* Border highlight on hover */}
                <div class="absolute inset-0 border-2 border-transparent group-hover:border-[#56c270] rounded-lg transition-colors duration-300"></div>
                {/* Text content */}
                <div class="absolute inset-0 flex flex-col justify-end p-4">
                  <h3 class="font-heading font-extrabold text-xl text-white">{cat.name}</h3>
                  <p class="text-white/80 text-sm">{cat.description}</p>
                </div>
                {/* Hover arrow */}
                <div class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-[#56c270]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products - SparkFun style cards */}
      <section class="py-12 bg-[#f1f1f2]">
        <div class="container mx-auto px-4">
          <div class="flex justify-between items-end mb-8">
            <div>
              <h2 class="font-heading font-extrabold text-2xl md:text-3xl text-[#042e0d]">Featured Products</h2>
              <p class="text-[#042e0d]/70 mt-1">Popular items from our catalog</p>
            </div>
            <Link href="/products/" class="text-[#5974c3] font-bold hover:underline hidden md:block">View All →</Link>
          </div>
          <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredProducts.map((product) => (
              <div key={product.name} class="bg-white rounded-lg border border-gray-200 overflow-hidden group hover:shadow-lg transition-shadow">
                {/* Product image - clickable link to product page */}
                <Link href={product.href} class="aspect-square bg-white flex items-center justify-center relative p-4 block">
                  <img
                    src={product.image}
                    alt={product.name}
                    class="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    width="280"
                    height="280"
                  />
                  {/* Stock badge */}
                  <span class="absolute top-3 left-3 bg-[#56c270] text-[#042e0d] text-xs font-bold px-2 py-1 rounded">{product.stock}</span>
                </Link>
                {/* Product info */}
                <div class="p-4">
                  <p class="text-xs font-mono text-[#c3a859] uppercase tracking-wide mb-1">{product.category}</p>
                  <Link href={product.href} class="font-heading font-bold text-[#042e0d] group-hover:text-[#5974c3] transition-colors block">{product.name}</Link>
                  <p class="text-sm text-[#042e0d]/70 font-mono mt-1">{product.specs}</p>
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

      {/* Project Types / Ecosystems - SparkFun inspired */}
      <section class="py-12 bg-white">
        <div class="container mx-auto px-4">
          <div class="text-center mb-10">
            <p class="text-xs font-mono text-[#c3a859] uppercase tracking-wider mb-2">Shop by Application</p>
            <h2 class="font-heading font-extrabold text-2xl md:text-3xl text-[#042e0d]">What Are You Building?</h2>
            <p class="text-[#042e0d]/70 mt-2">Find the right components for your project type</p>
          </div>
          <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {projectTypes.map((project) => (
              <Link key={project.name} href={project.href} class="group block h-full">
                <div class="bg-[#f1f1f2] border border-gray-200 rounded-lg overflow-hidden hover:border-[#56c270] hover:shadow-lg transition-all h-full flex flex-col">
                  {/* Header with icon - fixed height for consistency */}
                  <div class={`${project.color} p-5 h-28 flex items-start gap-4`}>
                    <div class="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d={project.icon} />
                      </svg>
                    </div>
                    <div class="flex-1 min-w-0">
                      <h3 class="font-heading font-bold text-lg text-white">{project.name}</h3>
                      <p class="text-white/80 text-sm line-clamp-2">{project.description}</p>
                    </div>
                  </div>
                  {/* Products list */}
                  <div class="p-4 flex-1 flex flex-col">
                    <p class="text-xs font-mono text-[#042e0d]/50 uppercase tracking-wide mb-2">Key Components</p>
                    <div class="flex flex-wrap gap-2 flex-1">
                      {project.products.map((prod) => (
                        <span key={prod} class="bg-white border border-gray-200 text-[#042e0d] text-xs px-2 py-1 rounded h-fit">{prod}</span>
                      ))}
                    </div>
                    <div class="mt-4 pt-3 border-t border-gray-200">
                      <span class="text-[#5974c3] font-bold text-sm group-hover:underline">Browse Components →</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Solamp - Enhanced with more visual weight */}
      <section class="py-16 bg-[#f1f1f2]">
        <div class="container mx-auto px-4">
          <div class="text-center mb-12">
            <p class="text-xs font-mono text-[#c3a859] uppercase tracking-wider mb-2">The Solamp Difference</p>
            <h2 class="font-heading font-extrabold text-2xl md:text-3xl text-[#042e0d]">Why Installers Choose Solamp</h2>
            <p class="text-[#042e0d]/70 mt-3 max-w-2xl mx-auto text-lg">
              We're not a faceless distributor. We're a team of solar professionals who've been in the trenches.
            </p>
          </div>
          <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="bg-white rounded-lg p-6 border border-gray-200 hover:border-[#56c270] hover:shadow-lg transition-all group">
              <div class="w-14 h-14 bg-[#042e0d] rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#56c270] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 class="font-heading font-bold text-lg text-[#042e0d] mb-2">Technical Support</h3>
              <p class="text-sm text-[#042e0d]/70 leading-relaxed">Real engineers who understand system design, troubleshooting, and the challenges of installation.</p>
            </div>
            <div class="bg-white rounded-lg p-6 border border-gray-200 hover:border-[#56c270] hover:shadow-lg transition-all group">
              <div class="w-14 h-14 bg-[#042e0d] rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#56c270] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 class="font-heading font-bold text-lg text-[#042e0d] mb-2">Tier-1 Only</h3>
              <p class="text-sm text-[#042e0d]/70 leading-relaxed">Direct manufacturer relationships. No gray market products. Full warranties honored.</p>
            </div>
            <div class="bg-white rounded-lg p-6 border border-gray-200 hover:border-[#56c270] hover:shadow-lg transition-all group">
              <div class="w-14 h-14 bg-[#042e0d] rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#56c270] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 class="font-heading font-bold text-lg text-[#042e0d] mb-2">18+ Years</h3>
              <p class="text-sm text-[#042e0d]/70 leading-relaxed">Deep industry knowledge since before the solar boom. We've seen it all.</p>
            </div>
            <div class="bg-white rounded-lg p-6 border border-gray-200 hover:border-[#56c270] hover:shadow-lg transition-all group">
              <div class="w-14 h-14 bg-[#042e0d] rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#56c270] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 class="font-heading font-bold text-lg text-[#042e0d] mb-2">Training & Guides</h3>
              <p class="text-sm text-[#042e0d]/70 leading-relaxed">Courses, documentation, and resources to grow your installation business.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA - SOLID Forest Green, no gradient */}
      <section class="bg-[#042e0d] py-10">
        <div class="container mx-auto px-4">
          <div class="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 class="font-heading font-extrabold text-2xl text-white">Ready to quote your next project?</h3>
              <p class="text-white/70 mt-1">Send us your BOM or call to discuss. We respond within 24 hours.</p>
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

      {/* Resources */}
      <section class="py-12 bg-[#f1f1f2]">
        <div class="container mx-auto px-4">
          <div class="flex justify-between items-end mb-8">
            <div>
              <h2 class="font-heading font-extrabold text-2xl md:text-3xl text-[#042e0d]">Resources</h2>
              <p class="text-[#042e0d]/70 mt-1">Guides and tools for solar professionals</p>
            </div>
            <Link href="/learn/" class="text-[#5974c3] font-bold hover:underline hidden md:block">View All →</Link>
          </div>
          <div class="grid md:grid-cols-3 gap-5">
            <Link href="/learn/" class="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-lg transition-shadow group">
              <div class="flex items-center gap-2 mb-3">
                <span class="bg-[#c3a859]/10 text-[#c3a859] text-xs font-bold px-2 py-1 rounded">GUIDE</span>
              </div>
              <h3 class="font-heading font-bold text-lg text-[#042e0d] group-hover:text-[#5974c3] transition-colors">2025 Solar Tax Credit Guide</h3>
              <p class="text-sm text-[#042e0d]/70 mt-2">Federal ITC and state incentives explained for installers.</p>
            </Link>
            <Link href="/learn/" class="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-lg transition-shadow group">
              <div class="flex items-center gap-2 mb-3">
                <span class="bg-[#5974c3]/10 text-[#5974c3] text-xs font-bold px-2 py-1 rounded">PRODUCT</span>
              </div>
              <h3 class="font-heading font-bold text-lg text-[#042e0d] group-hover:text-[#5974c3] transition-colors">MidNite Solar Rosie Overview</h3>
              <p class="text-sm text-[#042e0d]/70 mt-2">Technical specs and installation tips for the Rosie series.</p>
            </Link>
            <Link href="/learn/" class="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-lg transition-shadow group">
              <div class="flex items-center gap-2 mb-3">
                <span class="bg-[#56c270]/10 text-[#042e0d] text-xs font-bold px-2 py-1 rounded">COMPARISON</span>
              </div>
              <h3 class="font-heading font-bold text-lg text-[#042e0d] group-hover:text-[#5974c3] transition-colors">LiFePO4 vs Lithium-Ion</h3>
              <p class="text-sm text-[#042e0d]/70 mt-2">Battery chemistry comparison for energy storage projects.</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust indicators */}
      <section class="py-8 bg-white border-t border-gray-200">
        <div class="container mx-auto px-4">
          <div class="flex flex-wrap justify-center items-center gap-10 md:gap-16 text-center">
            <div>
              <p class="font-heading font-extrabold text-3xl text-[#042e0d]">18+</p>
              <p class="text-sm text-[#042e0d]/60">Years in Business</p>
            </div>
            <div>
              <p class="font-heading font-extrabold text-3xl text-[#042e0d]">500+</p>
              <p class="text-sm text-[#042e0d]/60">Installer Customers</p>
            </div>
            <div>
              <p class="font-heading font-extrabold text-3xl text-[#042e0d]">50+</p>
              <p class="text-sm text-[#042e0d]/60">Brand Partners</p>
            </div>
            <div>
              <p class="font-heading font-extrabold text-3xl text-[#042e0d]">24hr</p>
              <p class="text-sm text-[#042e0d]/60">Quote Response</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Solamp | Solar & Energy Storage for Professional Installers',
  meta: [
    {
      name: 'description',
      content: 'Solar panels, batteries, inverters, and balance of system from Tier-1 manufacturers. 18+ years serving professional solar installers with technical support.',
    },
  ],
};
