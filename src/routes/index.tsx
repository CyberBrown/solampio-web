import { component$, useSignal, useVisibleTask$, $ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { Link, routeLoader$ } from '@builder.io/qwik-city';
import { getDB, cleanSlug } from '../lib/db';
import { getProductThumbnail, getLocalCategoryImage } from '../lib/images';
import { ProductCard } from '../components/product/ProductCard';

// Load top-level categories from D1
export const useCategories = routeLoader$(async (requestEvent) => {
  const db = getDB(requestEvent.platform);
  return await db.getTopLevelCategories();
});

// Load featured products from D1
export const useFeaturedProducts = routeLoader$(async (requestEvent) => {
  const db = getDB(requestEvent.platform);
  return await db.getFeaturedProducts(4);
});

// Load brands that have products
export const useBrands = routeLoader$(async (requestEvent) => {
  const db = getDB(requestEvent.platform);
  return await db.getBrandsWithProducts();
});

// Load featured products by category for category tiles
export const useFeaturedByCategory = routeLoader$(async (requestEvent) => {
  const db = getDB(requestEvent.platform);
  const featuredMap = await db.getFeaturedProductsByCategory();
  // Convert Map to plain object for serialization
  const result: Record<string, { thumbnail_url: string | null; image_url: string | null }> = {};
  featuredMap.forEach((product, categoryId) => {
    result[categoryId] = {
      thumbnail_url: product.thumbnail_url,
      image_url: product.image_url
    };
  });
  return result;
});

const projectTypes = [
  {
    name: 'Off-Grid Cabin',
    description: 'Complete independence from the utility grid',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    products: ['Solar Panels', 'Batteries', 'Charge Controllers', 'Inverters'],
    color: 'bg-solamp-forest',
    href: '/products/',
  },
  {
    name: 'RV & Van Life',
    description: 'Mobile solar for life on the road',
    icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
    products: ['Flexible Panels', 'Portable Power', 'MPPT Controllers'],
    color: 'bg-solamp-blue',
    href: '/products/',
  },
  {
    name: 'Grid-Tied Backup',
    description: 'Stay powered when the grid goes down',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    products: ['Hybrid Inverters', 'Battery Banks', 'Transfer Switches'],
    color: 'bg-solamp-bronze',
    href: '/products/',
  },
  {
    name: 'DIY Starter',
    description: 'Small projects to get started with solar',
    icon: 'M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z',
    products: ['Starter Kits', 'Small Panels', 'PWM Controllers'],
    color: 'bg-solamp-green',
    href: '/products/',
  },
];

export default component$(() => {
  const categories = useCategories();
  const featuredProducts = useFeaturedProducts();
  const brands = useBrands();
  const featuredByCategory = useFeaturedByCategory();

  // Mobile zoom state for hero image
  const mobileZoomLevel = useSignal(1.4); // Start zoomed in on cabin
  const isTouching = useSignal(false);
  const lastPinchDistance = useSignal(0);

  // Handle tap to toggle zoom on mobile
  const handleTap = $(() => {
    // Toggle between zoomed in (1.4) and zoomed out (1.0)
    mobileZoomLevel.value = mobileZoomLevel.value > 1.2 ? 1.0 : 1.4;
  });

  // Handle pinch zoom on mobile
  const handleTouchStart = $((e: TouchEvent) => {
    if (e.touches.length === 2) {
      isTouching.value = true;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastPinchDistance.value = Math.sqrt(dx * dx + dy * dy);
    }
  });

  const handleTouchMove = $((e: TouchEvent) => {
    if (e.touches.length === 2 && isTouching.value) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const delta = distance - lastPinchDistance.value;

      // Adjust zoom based on pinch (inverted: pinch in = zoom in on cabin)
      const newZoom = Math.max(1.0, Math.min(1.6, mobileZoomLevel.value + delta * 0.002));
      mobileZoomLevel.value = newZoom;
      lastPinchDistance.value = distance;
    }
  });

  const handleTouchEnd = $(() => {
    isTouching.value = false;
  });

  return (
    <div class="bg-white">
      {/* Hero with responsive zoom image */}
      <section class="relative overflow-hidden bg-solamp-forest">
        {/* Background image with viewport-based zoom effect */}
        {/* Desktop: CSS handles zoom based on viewport width */}
        {/* Mobile: JavaScript handles tap/pinch interactions */}
        <div
          class="absolute inset-0 hero-zoom-image lg:block hidden"
          style={{
            backgroundImage: 'url(/images/wide-shot-of-a-small-cabin-far-in-the-di_lMru1hJZQ0yhClg5ZqcrpQ_v8qATksYQgKM-i-cckB5DQ.png)',
            backgroundPosition: 'center 40%',
            backgroundRepeat: 'no-repeat',
          }}
        />
        {/* Mobile version with touch controls */}
        <div
          class="absolute inset-0 lg:hidden outline-none focus:outline-none select-none"
          style={{
            backgroundImage: 'url(/images/wide-shot-of-a-small-cabin-far-in-the-di_lMru1hJZQ0yhClg5ZqcrpQ_v8qATksYQgKM-i-cckB5DQ.png)',
            backgroundPosition: 'center 40%',
            backgroundRepeat: 'no-repeat',
            backgroundSize: `${mobileZoomLevel.value * 100}%`,
            transition: isTouching.value ? 'none' : 'background-size 0.3s ease-out',
            WebkitTapHighlightColor: 'transparent',
          }}
          onClick$={handleTap}
          onTouchStart$={handleTouchStart}
          onTouchMove$={handleTouchMove}
          onTouchEnd$={handleTouchEnd}
        />
        {/* Dark overlay for text readability */}
        <div class="absolute inset-0 bg-solamp-forest/70" />

        {/* Content */}
        <div class="relative container mx-auto px-4 py-12 md:py-16 lg:py-20">
          <div class="grid lg:grid-cols-5 gap-8 items-center">
            <div class="lg:col-span-3">
              <div class="inline-flex items-center gap-2 bg-white/80 text-solamp-forest px-3 py-1 rounded-full text-sm font-semibold mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                Built on 20+ Years of Experience
              </div>
              <h1 class="font-heading font-extrabold text-3xl md:text-4xl lg:text-5xl text-white mb-4 leading-tight drop-shadow-lg">
                Solar &amp; Energy Storage Components You Can Count On
              </h1>
              <span class="block text-white-safe text-lg mb-6 max-w-2xl drop-shadow">
                From barn installations to off-grid cabins, we supply first-class components that power real projects.
                Technical guidance from engineers who've been there.
              </span>
              <div class="flex flex-wrap gap-3">
                <Link href="/products/" class="inline-flex items-center gap-2 bg-solamp-green text-solamp-forest font-heading font-bold px-6 py-3 rounded hover:bg-white transition-colors">
                  Browse Products
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link href="/contact/" class="inline-flex items-center gap-2 bg-solamp-bronze text-white font-heading font-bold px-6 py-3 rounded hover:bg-solamp-bronze/80 transition-colors">
                  Request Quote
                </Link>
              </div>
            </div>

            {/* Expert support card */}
            <div class="lg:col-span-2">
              <div class="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-6">
                <div class="flex items-center gap-3 mb-4">
                  <div class="w-14 h-14 bg-solamp-bronze rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-white-60-safe text-sm">Call a Solar Expert</p>
                    <a href="tel:978-451-6890" class="font-heading font-extrabold text-2xl text-white hover:text-solamp-green transition-colors">978-451-6890</a>
                  </div>
                </div>
                <p class="text-white-70-safe text-sm leading-relaxed">
                  Not sure which inverter pairs with your battery bank? Need help sizing a system for a customer?
                  Our engineers understand the real-world challenges of solar installation.
                </p>
                <div class="mt-4 pt-4 border-t border-white/10">
                  <p class="text-xs text-white-50-safe">Mon-Fri 8am-5pm EST • Boxboro, MA</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Partners - Visual Polish with Logo cards */}
      <section class="bg-solamp-mist border-b border-gray-300 py-8">
        <div class="container mx-auto px-4 text-center">
          <p class="text-xs font-mono text-solamp-bronze-dark uppercase tracking-widest mb-6">Authorized Technical Distributor</p>
          <div class="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            {brands.value.slice(0, 8).map((brand) => (
              <Link
                key={brand.id}
                href={`/products/brand/${cleanSlug(brand.slug)}/`}
                class="bg-white border border-gray-200 rounded px-6 py-3 shadow-sm hover:shadow-md hover:border-solamp-green transition-all"
              >
                <span class="font-heading font-bold text-solamp-forest/40 hover:text-solamp-forest transition-colors whitespace-nowrap">
                  {brand.title}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Category tiles - Photo backgrounds with dark overlay, like SparkFun */}
      <section class="py-12 bg-white">
        <div class="container mx-auto px-4">
          <div class="flex justify-between items-end mb-8">
            <div>
              <h2 class="font-heading font-extrabold text-2xl md:text-3xl text-solamp-forest">Shop by Category</h2>
              <p class="text-solamp-forest/70 mt-1">Equipment for every installation type</p>
            </div>
            <Link href="/products/" class="text-solamp-blue font-bold hover:underline hidden md:block">View All Products →</Link>
          </div>
          <div class="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.value.slice(0, 6).map((cat) => {
              const catSlug = cleanSlug(cat.slug);
              // Prefer local category images, fall back to featured product or legacy URL
              const localImage = getLocalCategoryImage(cat.title);
              const featuredProduct = featuredByCategory.value[cat.id];
              const imageUrl = localImage || featuredProduct?.image_url || featuredProduct?.thumbnail_url || cat.image_url;
              return (
                <Link key={cat.id} href={`/products/category/${catSlug}/`} class="group relative overflow-hidden rounded-lg aspect-[4/3] transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  {/* Background - featured product photo or category image */}
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={cat.title}
                      class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      width="400"
                      height="300"
                    />
                  ) : (
                    <div class="absolute inset-0 bg-solamp-forest" />
                  )}
                  {/* Dark overlay for text readability */}
                  <div class="absolute inset-0 bg-solamp-forest/50 group-hover:bg-solamp-forest/70 transition-colors duration-300"></div>
                  {/* Border highlight on hover */}
                  <div class="absolute inset-0 border-2 border-transparent group-hover:border-solamp-green rounded-lg transition-colors duration-300"></div>
                  {/* Text content */}
                  <div class="absolute inset-0 flex flex-col justify-end p-4">
                    <h3 class="font-heading font-extrabold text-xl text-white">{cat.title}</h3>
                    <p class="text-white-safe text-sm">{cat.description || `${cat.count} products`}</p>
                  </div>
                  {/* Hover arrow */}
                  <div class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-solamp-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products - SparkFun style cards */}
      <section class="py-12 bg-solamp-mist">
        <div class="container mx-auto px-4">
          <div class="flex justify-between items-end mb-8">
            <div>
              <h2 class="font-heading font-extrabold text-2xl md:text-3xl text-solamp-forest">Featured Products</h2>
              <p class="text-solamp-forest/70 mt-1">Popular items from our catalog</p>
            </div>
            <Link href="/products/" class="text-solamp-blue font-bold hover:underline hidden md:block">View All →</Link>
          </div>
          <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredProducts.value.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Project Types / Ecosystems - SparkFun inspired */}
      <section class="py-12 bg-white">
        <div class="container mx-auto px-4">
          <div class="text-center mb-10">
            <p class="text-xs font-mono text-solamp-bronze-dark uppercase tracking-wider mb-2">Shop by Application</p>
            <h2 class="font-heading font-extrabold text-2xl md:text-3xl text-solamp-forest">What Are You Building?</h2>
            <p class="text-solamp-forest/70 mt-2">Find the right components for your project type</p>
          </div>
          <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {projectTypes.map((project) => (
              <Link key={project.name} href={project.href} class="group block h-full">
                <div class="bg-solamp-mist border border-gray-200 rounded-lg overflow-hidden hover:border-solamp-green hover:shadow-lg transition-all h-full flex flex-col">
                  {/* Header with icon - fixed height for consistency */}
                  <div class={`${project.color} p-5 h-28 flex items-start gap-4`}>
                    <div class="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d={project.icon} />
                      </svg>
                    </div>
                    <div class="flex-1 min-w-0">
                      <h3 class="font-heading font-bold text-lg text-white">{project.name}</h3>
                      <p class="text-white-safe text-sm line-clamp-2">{project.description}</p>
                    </div>
                  </div>
                  {/* Products list */}
                  <div class="p-4 flex-1 flex flex-col">
                    <p class="text-xs font-mono text-solamp-forest/50 uppercase tracking-wide mb-2">Key Components</p>
                    <div class="flex flex-wrap gap-2 flex-1">
                      {project.products.map((prod) => (
                        <span key={prod} class="bg-white border border-gray-200 text-solamp-forest text-xs px-2 py-1 rounded h-fit">{prod}</span>
                      ))}
                    </div>
                    <div class="mt-4 pt-3 border-t border-gray-200">
                      <span class="text-solamp-blue font-bold text-sm group-hover:underline">Browse Components →</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Solamp - Enhanced with more visual weight */}
      <section class="py-16 bg-solamp-mist">
        <div class="container mx-auto px-4">
          <div class="text-center mb-12">
            <p class="text-xs font-mono text-solamp-bronze-dark uppercase tracking-wider mb-2">The Solamp Difference</p>
            <h2 class="font-heading font-extrabold text-2xl md:text-3xl text-solamp-forest">Why Installers Choose Solamp</h2>
            <p class="text-solamp-forest/70 mt-3 max-w-2xl mx-auto text-lg">
              We're not a faceless distributor. We're a team of solar professionals who've been in the trenches.
            </p>
          </div>
          <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="bg-white rounded-lg p-6 border border-gray-200 hover:border-solamp-green hover:shadow-lg transition-all group">
              <div class="w-14 h-14 bg-solamp-forest rounded-lg flex items-center justify-center mb-4 group-hover:bg-solamp-green transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 class="font-heading font-bold text-lg text-solamp-forest mb-2">Technical Guidance</h3>
              <p class="text-sm text-solamp-forest/70 leading-relaxed">Our team is here to help you find the right components for your project and answer your questions.</p>
            </div>
            <div class="bg-white rounded-lg p-6 border border-gray-200 hover:border-solamp-green hover:shadow-lg transition-all group">
              <div class="w-14 h-14 bg-solamp-forest rounded-lg flex items-center justify-center mb-4 group-hover:bg-solamp-green transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 class="font-heading font-bold text-lg text-solamp-forest mb-2">First-Class Components</h3>
              <p class="text-sm text-solamp-forest/70 leading-relaxed">Direct manufacturer relationships. Authorized distributor with full product warranties.</p>
            </div>
            <div class="bg-white rounded-lg p-6 border border-gray-200 hover:border-solamp-green hover:shadow-lg transition-all group">
              <div class="w-14 h-14 bg-solamp-forest rounded-lg flex items-center justify-center mb-4 group-hover:bg-solamp-green transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 class="font-heading font-bold text-lg text-solamp-forest mb-2">20+ Years</h3>
              <p class="text-sm text-solamp-forest/70 leading-relaxed">Built on two decades of industry experience. We've seen it all.</p>
            </div>
            <div class="bg-white rounded-lg p-6 border border-gray-200 hover:border-solamp-green hover:shadow-lg transition-all group">
              <div class="w-14 h-14 bg-solamp-forest rounded-lg flex items-center justify-center mb-4 group-hover:bg-solamp-green transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 class="font-heading font-bold text-lg text-solamp-forest mb-2">Training & Guides</h3>
              <p class="text-sm text-solamp-forest/70 leading-relaxed">Courses, documentation, and resources to grow your installation business.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA - SOLID Forest Green, no gradient */}
      <section class="bg-solamp-forest py-10">
        <div class="container mx-auto px-4">
          <div class="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 class="font-heading font-extrabold text-2xl text-white">Ready to quote your next project?</h3>
              <p class="text-white-70-safe mt-1">Send us your project details online, on the phone, or in person.</p>
            </div>
            <div class="flex gap-4">
              <Link href="/contact/" class="inline-flex items-center gap-2 bg-solamp-green text-solamp-forest font-heading font-bold px-6 py-3 rounded hover:bg-white transition-colors">
                Request Quote
              </Link>
              <a href="tel:978-451-6890" class="inline-flex items-center gap-2 bg-solamp-bronze text-white font-heading font-bold px-6 py-3 rounded hover:bg-solamp-bronze/80 transition-colors">
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
      <section class="py-12 bg-solamp-mist">
        <div class="container mx-auto px-4">
          <div class="flex justify-between items-end mb-8">
            <div>
              <h2 class="font-heading font-extrabold text-2xl md:text-3xl text-solamp-forest">Resources</h2>
              <p class="text-solamp-forest/70 mt-1">Guides and tools for solar professionals</p>
            </div>
            <Link href="/learn/" class="text-solamp-blue font-bold hover:underline hidden md:block">View All →</Link>
          </div>
          <div class="grid md:grid-cols-3 gap-5">
            <Link href="/learn/" class="bg-white rounded-lg border border-transparent shadow-sm hover:shadow-md p-5 transition-shadow group">
              <div class="flex items-center gap-2 mb-3">
                <span class="bg-solamp-bronze/10 text-solamp-bronze-dark text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Guide</span>
              </div>
              <h3 class="font-heading font-bold text-lg text-solamp-forest group-hover:text-solamp-blue transition-colors">2025 Solar Tax Credit Guide</h3>
              <p class="text-sm text-solamp-forest/70 mt-2 leading-relaxed">Federal ITC and state incentives explained for installers.</p>
            </Link>
            <Link href="/learn/" class="bg-white rounded-lg border border-transparent shadow-sm hover:shadow-md p-5 transition-shadow group">
              <div class="flex items-center gap-2 mb-3">
                <span class="bg-solamp-blue/10 text-solamp-blue text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Product</span>
              </div>
              <h3 class="font-heading font-bold text-lg text-solamp-forest group-hover:text-solamp-blue transition-colors">MidNite Solar Rosie Overview</h3>
              <p class="text-sm text-solamp-forest/70 mt-2 leading-relaxed">Technical specs and installation tips for the Rosie series.</p>
            </Link>
            <Link href="/learn/" class="bg-white rounded-lg border border-transparent shadow-sm hover:shadow-md p-5 transition-shadow group">
              <div class="flex items-center gap-2 mb-3">
                <span class="bg-solamp-green/10 text-solamp-forest text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Comparison</span>
              </div>
              <h3 class="font-heading font-bold text-lg text-solamp-forest group-hover:text-solamp-blue transition-colors">LiFePO4 vs Lithium-Ion</h3>
              <p class="text-sm text-solamp-forest/70 mt-2 leading-relaxed">Battery chemistry comparison for energy storage projects.</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust indicators */}
      <section class="py-12 bg-white border-t border-gray-100">
        <div class="container mx-auto px-4">
          <div class="flex flex-wrap justify-center items-center gap-10 md:gap-16 text-center">
            <div>
              <p class="font-heading font-extrabold text-3xl text-solamp-forest">20+</p>
              <p class="text-xs font-mono text-solamp-bronze-dark uppercase tracking-widest mt-1">Years in Business</p>
            </div>
            <div>
              <p class="font-heading font-extrabold text-3xl text-solamp-forest">500+</p>
              <p class="text-xs font-mono text-solamp-bronze-dark uppercase tracking-widest mt-1">Installer Customers</p>
            </div>
            <div>
              <p class="font-heading font-extrabold text-3xl text-solamp-forest">50+</p>
              <p class="text-xs font-mono text-solamp-bronze-dark uppercase tracking-widest mt-1">Brand Partners</p>
            </div>
            <div>
              <p class="font-heading font-extrabold text-3xl text-solamp-forest">Fast</p>
              <p class="text-xs font-mono text-solamp-bronze-dark uppercase tracking-widest mt-1">Quote Response</p>
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