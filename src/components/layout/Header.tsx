import { component$, useSignal, useVisibleTask$, $, useContext } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';
import { SidebarContext } from '../../context/sidebar-context';
import { CartContext } from '../../context/cart-context';
import type { Category, Product, Brand } from '../../lib/db';
import { cleanSlug, encodeSkuForUrl } from '../../lib/db';
import { getCategoryImageUrl, getProductThumbnail, getBrandLogoUrl } from '../../lib/images';

// Navigation category with subcategories
interface NavCategory extends Category {
  subcategories: Category[];
}

// Featured products by category ID
type FeaturedProductsMap = Record<string, Product[]>;

// Brands by category ID
type CategoryBrandsMap = Record<string, Brand[]>;

interface HeaderProps {
  categories: NavCategory[];
  featuredProducts?: FeaturedProductsMap;
  categoryBrands?: CategoryBrandsMap;
}

// Priority categories to show in main nav (others go in "More" dropdown)
const PRIORITY_SLUGS = ['solar-panels', 'batteries', 'inverters', 'mounting-and-racking', 'charge-controllers', 'balance-of-system'];

export const Header = component$<HeaderProps>(({ categories, featuredProducts = {}, categoryBrands = {} }) => {
  const isScrolled = useSignal(false);
  const isHovering = useSignal(false);
  const openMenu = useSignal<string | null>(null);
  const sidebar = useContext(SidebarContext);
  const cart = useContext(CartContext);

  // Calculate cart item count
  const cartItemCount = cart.items.value.reduce((sum, item) => sum + item.quantity, 0);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    const handleScroll = () => {
      isScrolled.value = window.scrollY > 50;
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  });

  const closeMenu = $(() => {
    openMenu.value = null;
  });

  // Semi-transparent when scrolled AND not hovering
  const isTransparent = isScrolled.value && !isHovering.value;
  // Compact when scrolled
  const isCompact = isScrolled.value;

  // Split categories into priority (main nav) and others (More dropdown)
  const priorityCategories = categories.filter(cat =>
    PRIORITY_SLUGS.includes(cleanSlug(cat.slug))
  ).sort((a, b) =>
    PRIORITY_SLUGS.indexOf(cleanSlug(a.slug)) - PRIORITY_SLUGS.indexOf(cleanSlug(b.slug))
  );

  const otherCategories = categories.filter(cat =>
    !PRIORITY_SLUGS.includes(cleanSlug(cat.slug))
  );

  // Short display names for nav buttons
  const getShortName = (title: string) => {
    const shortNames: Record<string, string> = {
      'Solar Panels': 'Panels',
      'Mounting and Racking': 'Mounting',
      'Charge Controllers': 'Controllers',
      'Balance of System': 'BOS',
    };
    return shortNames[title] || title;
  };

  return (
    <div class="drawer">
      <input id="mobile-drawer" type="checkbox" class="drawer-toggle" />
      <div class="drawer-content flex flex-col">
        {/* Main header */}
        <header
          class={[
            'fixed top-0 left-0 right-0 z-50 border-b border-t-4 border-t-solamp-blue transition-all duration-300',
            isTransparent
              ? 'bg-white/90 backdrop-blur-md border-gray-200/30'
              : 'bg-white border-gray-200',
          ].join(' ')}
          onMouseEnter$={() => (isHovering.value = true)}
          onMouseLeave$={() => {
            isHovering.value = false;
            openMenu.value = null;
          }}
        >
          <div class="container mx-auto px-4">
            <div class={[
              'flex items-center justify-between gap-4 transition-all duration-300',
              isCompact ? 'h-11' : 'h-16',
            ].join(' ')}>
              {/* Mobile hamburger */}
              <label for="mobile-drawer" class="lg:hidden p-2 -ml-2 cursor-pointer hover:bg-gray-100 rounded">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-solamp-forest" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </label>

              {/* Product sidebar toggle */}
              {sidebar.enabled.value && !sidebar.visible.value && (
                <button
                  onClick$={() => { sidebar.visible.value = true; }}
                  class={[
                    'hidden lg:flex items-center justify-center hover:bg-gray-100 rounded transition-all',
                    isCompact ? 'p-1.5' : 'p-2',
                  ].join(' ')}
                  aria-label="Show product sidebar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class={isCompact ? 'h-5 w-5 text-solamp-forest' : 'h-6 w-6 text-solamp-forest'} fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}

              {/* Logo */}
              <Link href="/" class="flex items-center gap-2 flex-shrink-0 transition-all duration-300">
                <img
                  src="https://cdn11.bigcommerce.com/s-yhdp96gt9k/images/stencil/500w/solamp_logo_tight_1716513374__10848.original.png"
                  alt="Solamp"
                  class={[
                    'w-auto transition-all duration-300',
                    isCompact ? 'h-7' : 'h-10',
                  ].join(' ')}
                />
              </Link>

              {/* Dynamic Categories Navigation */}
              <nav class="hidden lg:flex items-center gap-1 flex-shrink-0">
                {priorityCategories.map((cat) => {
                  const slug = cleanSlug(cat.slug);
                  return (
                    <Link
                      key={cat.id}
                      href={`/products/category/${slug}/`}
                      onMouseEnter$={() => { openMenu.value = slug; }}
                      class={[
                        'font-heading font-bold rounded transition-all duration-300',
                        isCompact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm',
                        openMenu.value === slug ? 'bg-solamp-blue text-white' : 'text-solamp-forest hover:bg-gray-100',
                      ].join(' ')}
                    >
                      {getShortName(cat.title)}
                    </Link>
                  );
                })}

                {/* More dropdown for other categories */}
                {otherCategories.length > 0 && (
                  <button
                    onMouseEnter$={() => { openMenu.value = 'more'; }}
                    class={[
                      'font-heading font-bold rounded transition-all duration-300',
                      isCompact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm',
                      openMenu.value === 'more' ? 'bg-solamp-blue text-white' : 'text-solamp-forest hover:bg-gray-100',
                    ].join(' ')}
                  >
                    More
                  </button>
                )}

                <Link
                  href="/learn/"
                  onMouseEnter$={() => { openMenu.value = null; }}
                  class={[
                    'font-heading font-bold text-solamp-forest hover:text-solamp-blue transition-all duration-300',
                    isCompact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm',
                  ].join(' ')}
                >
                  Resources
                </Link>
              </nav>

              {/* Search */}
              <div class={[
                'hidden md:flex transition-all duration-300',
                isCompact ? 'flex-1 max-w-xs' : 'flex-1 max-w-md',
              ].join(' ')}>
                <div class="relative w-full">
                  <input
                    type="text"
                    placeholder={isCompact ? "Search..." : "Search products..."}
                    class={[
                      'w-full border-2 border-gray-200 bg-white text-gray-900 placeholder-gray-500 text-sm rounded-lg focus:outline-none focus:border-solamp-green transition-all duration-300',
                      isCompact ? 'px-3 py-1 pr-8' : 'px-4 py-2 pr-12',
                    ].join(' ')}
                  />
                  <button class={[
                    'absolute right-0 top-0 h-full bg-solamp-blue text-white rounded-r-lg hover:bg-solamp-blue/90 transition-colors',
                    isCompact ? 'px-2' : 'px-3',
                  ].join(' ')}>
                    <svg xmlns="http://www.w3.org/2000/svg" class={isCompact ? 'h-4 w-4' : 'h-5 w-5'} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Right side - phone + cart */}
              <div class="flex items-center gap-2">
                <a
                  href="tel:978-451-6890"
                  class={[
                    'hidden xl:flex items-center gap-1.5 text-solamp-green font-heading font-bold transition-all duration-300',
                    isCompact ? 'text-xs' : 'text-sm',
                  ].join(' ')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class={isCompact ? 'h-3 w-3' : 'h-4 w-4'} fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  978-451-6890
                </a>
                <Link
                  href="/cart/"
                  class={[
                    'hover:bg-gray-100 rounded-lg transition-all duration-300 relative',
                    isCompact ? 'p-1.5' : 'p-2',
                  ].join(' ')}
                  aria-label="Cart"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class={isCompact ? 'h-5 w-5 text-solamp-forest' : 'h-6 w-6 text-solamp-forest'} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {cartItemCount > 0 && (
                    <span class={[
                      'absolute bg-solamp-green text-solamp-forest font-bold flex items-center justify-center rounded-full',
                      isCompact ? '-top-0.5 -right-0.5 w-4 h-4 text-[9px]' : '-top-0.5 -right-0.5 w-5 h-5 text-xs',
                    ].join(' ')}>{cartItemCount > 99 ? '99+' : cartItemCount}</span>
                  )}
                </Link>
              </div>
            </div>
          </div>

          {/* Dynamic Mega Menus */}
          {priorityCategories.map((cat) => {
            const slug = cleanSlug(cat.slug);
            const categoryImageUrl = getCategoryImageUrl(cat, 'card');
            // Get featured products for this category (and its subcategories)
            const categoryFeatured = featuredProducts[cat.id] || [];
            // Also check subcategories for featured products
            const allFeatured = [...categoryFeatured];
            for (const sub of cat.subcategories) {
              const subFeatured = featuredProducts[sub.id] || [];
              for (const product of subFeatured) {
                if (!allFeatured.some(p => p.id === product.id) && allFeatured.length < 3) {
                  allFeatured.push(product);
                }
              }
            }
            const displayFeatured = allFeatured.slice(0, 3);

            // Get brands for this category (limit to 4 for display)
            const categoryBrandsList = categoryBrands[cat.id] || [];
            const displayBrands = categoryBrandsList.slice(0, 4);

            return (
              <div
                key={cat.id}
                class={[
                  'absolute left-0 right-0 bg-white border-b border-gray-200 shadow-xl transition-all duration-200 z-40',
                  openMenu.value === slug ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none',
                ].join(' ')}
              >
                <div class="container mx-auto px-4 py-6">
                  <div class="flex gap-8">
                    {/* Left side: Subcategories */}
                    <div class="flex-1">
                      <p class="text-xs font-mono text-solamp-forest/50 uppercase tracking-wide mb-3">
                        {cat.title} Categories
                      </p>
                      <div class="flex flex-wrap gap-2">
                        {cat.subcategories.map((sub) => (
                          <Link
                            key={sub.id}
                            href={`/products/category/${slug}/${cleanSlug(sub.slug)}/`}
                            onClick$={closeMenu}
                            class="px-4 py-2 bg-solamp-mist hover:bg-solamp-forest hover:text-white text-sm font-semibold rounded transition-colors text-solamp-forest"
                          >
                            {sub.title}
                          </Link>
                        ))}
                      </div>
                      <div class="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                        <Link
                          href={`/products/category/${slug}/`}
                          onClick$={closeMenu}
                          class="text-sm font-bold text-solamp-blue hover:underline"
                        >
                          View All {cat.title} →
                        </Link>

                        {/* Brands we carry (if any) */}
                        {displayBrands.length > 0 && (
                          <div class="flex items-center gap-2">
                            <span class="text-xs text-solamp-forest/50">Brands:</span>
                            <div class="flex items-center gap-1">
                              {displayBrands.map((brand) => {
                                const logoUrl = getBrandLogoUrl(brand);
                                return (
                                  <Link
                                    key={brand.id}
                                    href={`/products/brand/${brand.slug}/`}
                                    onClick$={closeMenu}
                                    class="w-8 h-8 rounded bg-white border border-gray-200 flex items-center justify-center hover:border-solamp-blue transition-colors"
                                    title={brand.title}
                                  >
                                    {logoUrl ? (
                                      <img
                                        src={logoUrl}
                                        alt={brand.title}
                                        class="w-6 h-6 object-contain"
                                        loading="lazy"
                                      />
                                    ) : (
                                      <span class="text-xs font-bold text-solamp-forest">
                                        {brand.title.charAt(0)}
                                      </span>
                                    )}
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Middle: Featured Products (if available) */}
                    {displayFeatured.length > 0 && (
                      <div class="w-72">
                        <p class="text-xs font-mono text-solamp-forest/50 uppercase tracking-wide mb-3">
                          Featured Products
                        </p>
                        <div class="space-y-3">
                          {displayFeatured.map((product) => {
                            const productImage = getProductThumbnail(product);
                            return (
                              <Link
                                key={product.id}
                                href={`/products/${encodeSkuForUrl(product.sku)}/`}
                                onClick$={closeMenu}
                                class="flex gap-3 p-2 rounded-lg hover:bg-solamp-mist transition-colors group"
                              >
                                {productImage && (
                                  <div class="w-16 h-16 flex-shrink-0 rounded overflow-hidden bg-gray-100">
                                    <img
                                      src={productImage}
                                      alt={product.title}
                                      class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                      loading="lazy"
                                    />
                                  </div>
                                )}
                                <div class="flex-1 min-w-0">
                                  <p class="text-sm font-semibold text-solamp-forest line-clamp-2 group-hover:text-solamp-blue transition-colors">
                                    {product.title}
                                  </p>
                                  {product.price && (
                                    <p class="text-sm text-solamp-green font-bold mt-1">
                                      ${product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </p>
                                  )}
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Right side: Category Image or Quick Links */}
                    {categoryImageUrl ? (
                      <Link
                        href={`/products/category/${slug}/`}
                        onClick$={closeMenu}
                        class="w-56 rounded-lg overflow-hidden group flex-shrink-0"
                      >
                        <div class="relative aspect-[4/3]">
                          <img
                            src={categoryImageUrl}
                            alt={cat.title}
                            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                          <div class="absolute inset-0 bg-gradient-to-t from-solamp-forest/80 to-transparent" />
                          <div class="absolute bottom-0 left-0 right-0 p-4">
                            <p class="text-white font-heading font-bold text-lg">{cat.title}</p>
                            <p class="text-white/80 text-sm">Shop all {cat.count} products →</p>
                          </div>
                        </div>
                      </Link>
                    ) : (
                      <div class="w-56 bg-solamp-mist rounded-lg p-5 flex-shrink-0">
                        <p class="text-xs font-mono text-solamp-forest/50 uppercase tracking-wide mb-3">Quick Links</p>
                        <ul class="space-y-3">
                          <li>
                            <Link href="/learn/" onClick$={closeMenu} class="text-sm text-solamp-forest hover:text-solamp-blue transition-colors flex items-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-solamp-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                              {cat.title} Guide
                            </Link>
                          </li>
                          <li>
                            <Link href="/contact/" onClick$={closeMenu} class="text-sm text-solamp-forest hover:text-solamp-blue transition-colors flex items-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-solamp-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                              Get Expert Help
                            </Link>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* "More" Mega Menu for other categories */}
          {otherCategories.length > 0 && (
            <div
              class={[
                'absolute left-0 right-0 bg-white border-b border-gray-200 shadow-xl transition-all duration-200 z-40',
                openMenu.value === 'more' ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none',
              ].join(' ')}
            >
              <div class="container mx-auto px-4 py-6">
                <p class="text-xs font-mono text-solamp-forest/50 uppercase tracking-wide mb-3">More Categories</p>
                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {otherCategories.map((cat) => (
                    <div key={cat.id}>
                      <Link
                        href={`/products/category/${cleanSlug(cat.slug)}/`}
                        onClick$={closeMenu}
                        class="font-heading font-bold text-solamp-forest hover:text-solamp-blue transition-colors"
                      >
                        {cat.title}
                      </Link>
                      {cat.subcategories.length > 0 && (
                        <ul class="mt-2 space-y-1">
                          {cat.subcategories.slice(0, 4).map((sub) => (
                            <li key={sub.id}>
                              <Link
                                href={`/products/category/${cleanSlug(cat.slug)}/${cleanSlug(sub.slug)}/`}
                                onClick$={closeMenu}
                                class="text-sm text-solamp-forest/70 hover:text-solamp-blue transition-colors"
                              >
                                {sub.title}
                              </Link>
                            </li>
                          ))}
                          {cat.subcategories.length > 4 && (
                            <li>
                              <Link
                                href={`/products/category/${cleanSlug(cat.slug)}/`}
                                onClick$={closeMenu}
                                class="text-sm text-solamp-blue hover:underline"
                              >
                                +{cat.subcategories.length - 4} more
                              </Link>
                            </li>
                          )}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </header>
        {/* Spacer */}
        <div class="h-16" aria-hidden="true"></div>
      </div>

      {/* Mobile drawer sidebar */}
      <div class="drawer-side z-50">
        <label for="mobile-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
        <div class="bg-white min-h-full w-80 overflow-y-auto">
          <div class="p-4 bg-solamp-forest flex items-center justify-between sticky top-0">
            <Link href="/" class="flex items-center gap-2">
              <img
                src="https://cdn11.bigcommerce.com/s-yhdp96gt9k/images/stencil/500w/solamp_logo_tight_1716513374__10848.original.png"
                alt="Solamp"
                class="h-8 w-auto brightness-0 invert"
              />
            </Link>
            <label for="mobile-drawer" class="p-1 text-white/70 hover:text-white cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </label>
          </div>

          <div class="p-4 border-b border-gray-200">
            <div class="relative">
              <input type="text" placeholder="Search products..." class="w-full border border-gray-200 px-3 py-2 pr-10 text-sm rounded-lg text-gray-900 placeholder-gray-500" />
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 absolute right-3 top-1/2 -translate-y-1/2 text-solamp-forest/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <nav class="p-4">
            <div class="mb-4">
              <p class="text-xs font-mono text-solamp-bronze-dark uppercase tracking-wide mb-2">Products</p>
              <ul class="space-y-1">
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={`/products/category/${cleanSlug(cat.slug)}/`}
                      class="block py-2 text-sm font-bold text-solamp-forest hover:text-solamp-green"
                    >
                      {cat.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div class="border-t border-gray-200 pt-4 mb-4">
              <ul class="space-y-1">
                <li><Link href="/learn/" class="block py-2 text-sm text-solamp-forest hover:text-solamp-green">Resources</Link></li>
                <li><Link href="/about/" class="block py-2 text-sm text-solamp-forest hover:text-solamp-green">About Us</Link></li>
                <li><Link href="/contact/" class="block py-2 text-sm text-solamp-bronze-dark font-bold hover:text-solamp-forest">Contact</Link></li>
              </ul>
            </div>
          </nav>

          <div class="p-4 border-t border-gray-200 bg-solamp-mist">
            <p class="text-xs text-solamp-bronze-dark font-semibold mb-1">Need help? Call a Solar Expert</p>
            <a href="tel:978-451-6890" class="font-heading font-bold text-lg text-solamp-forest">978-451-6890</a>
          </div>
        </div>
      </div>
    </div>
  );
});
