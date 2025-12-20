import { component$, useSignal, useVisibleTask$, $ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';

export const Header = component$(() => {
  const isScrolled = useSignal(false);
  const isHovering = useSignal(false);
  const openMenu = useSignal<string | null>(null);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    const handleScroll = () => {
      isScrolled.value = window.scrollY > 50;
    };
    // Check initial scroll position
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  });

  const toggleMenu = $((menuName: string) => {
    if (openMenu.value === menuName) {
      openMenu.value = null;
    } else {
      openMenu.value = menuName;
    }
  });

  const closeMenu = $(() => {
    openMenu.value = null;
  });

  // Semi-transparent when scrolled AND not hovering
  const isTransparent = isScrolled.value && !isHovering.value;
  // Compact when scrolled (regardless of hover - size stays small)
  const isCompact = isScrolled.value;

  return (
    <div class="drawer">
      <input id="mobile-drawer" type="checkbox" class="drawer-toggle" />
      <div class="drawer-content flex flex-col">
        {/* Main header - fixed to viewport, semi-transparent on scroll, opaque on hover */}
        <header
          class={[
            'fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300',
            isTransparent
              ? 'bg-white/70 backdrop-blur-md border-gray-200/50'
              : 'bg-white border-gray-200',
          ].join(' ')}
          onMouseEnter$={() => (isHovering.value = true)}
          onMouseLeave$={() => {
            isHovering.value = false;
            openMenu.value = null;
          }}
        >
          <div class="container mx-auto px-4">
            {/* Single unified header bar */}
            <div class={[
              'flex items-center justify-between gap-4 transition-all duration-300',
              isCompact ? 'h-11' : 'h-16',
            ].join(' ')}>
              {/* Mobile hamburger */}
              <label for="mobile-drawer" class="lg:hidden p-2 -ml-2 cursor-pointer hover:bg-gray-100 rounded">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-[#042e0d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </label>

              {/* Logo - compresses when scrolled */}
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

              {/* Categories - inline in same row, compress on scroll */}
              <nav class="hidden lg:flex items-center gap-1 flex-shrink-0">
                <button
                  onClick$={() => toggleMenu('panels')}
                  onMouseEnter$={() => { if (openMenu.value) openMenu.value = 'panels'; }}
                  class={[
                    'font-heading font-bold rounded transition-all duration-300',
                    isCompact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm',
                    openMenu.value === 'panels' ? 'bg-[#042e0d] text-white' : 'text-[#042e0d] hover:bg-gray-100',
                  ].join(' ')}
                >
                  Panels
                </button>
                <button
                  onClick$={() => toggleMenu('batteries')}
                  onMouseEnter$={() => { if (openMenu.value) openMenu.value = 'batteries'; }}
                  class={[
                    'font-heading font-bold rounded transition-all duration-300',
                    isCompact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm',
                    openMenu.value === 'batteries' ? 'bg-[#042e0d] text-white' : 'text-[#042e0d] hover:bg-gray-100',
                  ].join(' ')}
                >
                  Batteries
                </button>
                <button
                  onClick$={() => toggleMenu('inverters')}
                  onMouseEnter$={() => { if (openMenu.value) openMenu.value = 'inverters'; }}
                  class={[
                    'font-heading font-bold rounded transition-all duration-300',
                    isCompact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm',
                    openMenu.value === 'inverters' ? 'bg-[#042e0d] text-white' : 'text-[#042e0d] hover:bg-gray-100',
                  ].join(' ')}
                >
                  Inverters
                </button>
                <button
                  onClick$={() => toggleMenu('mounting')}
                  onMouseEnter$={() => { if (openMenu.value) openMenu.value = 'mounting'; }}
                  class={[
                    'font-heading font-bold rounded transition-all duration-300',
                    isCompact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm',
                    openMenu.value === 'mounting' ? 'bg-[#042e0d] text-white' : 'text-[#042e0d] hover:bg-gray-100',
                  ].join(' ')}
                >
                  Mounting
                </button>
                <button
                  onClick$={() => toggleMenu('controllers')}
                  onMouseEnter$={() => { if (openMenu.value) openMenu.value = 'controllers'; }}
                  class={[
                    'font-heading font-bold rounded transition-all duration-300',
                    isCompact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm',
                    openMenu.value === 'controllers' ? 'bg-[#042e0d] text-white' : 'text-[#042e0d] hover:bg-gray-100',
                  ].join(' ')}
                >
                  Controllers
                </button>
                <button
                  onClick$={() => toggleMenu('bos')}
                  onMouseEnter$={() => { if (openMenu.value) openMenu.value = 'bos'; }}
                  class={[
                    'font-heading font-bold rounded transition-all duration-300',
                    isCompact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm',
                    openMenu.value === 'bos' ? 'bg-[#042e0d] text-white' : 'text-[#042e0d] hover:bg-gray-100',
                  ].join(' ')}
                >
                  BOS
                </button>
                <Link
                  href="/learn/"
                  class={[
                    'font-heading font-bold text-[#042e0d] hover:text-[#56c270] transition-all duration-300',
                    isCompact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm',
                  ].join(' ')}
                >
                  Resources
                </Link>
              </nav>

              {/* Search - compresses on scroll */}
              <div class={[
                'hidden md:flex transition-all duration-300',
                isCompact ? 'flex-1 max-w-xs' : 'flex-1 max-w-md',
              ].join(' ')}>
                <div class="relative w-full">
                  <input
                    type="text"
                    placeholder={isCompact ? "Search..." : "Search products..."}
                    class={[
                      'w-full border-2 border-gray-200 bg-white text-sm rounded-lg focus:outline-none focus:border-[#56c270] transition-all duration-300',
                      isCompact ? 'px-3 py-1 pr-8' : 'px-4 py-2 pr-12',
                    ].join(' ')}
                  />
                  <button class={[
                    'absolute right-0 top-0 h-full bg-[#042e0d] text-white rounded-r-lg hover:bg-[#042e0d]/90 transition-colors',
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
                    'hidden xl:flex items-center gap-1.5 text-[#56c270] font-heading font-bold transition-all duration-300',
                    isCompact ? 'text-xs' : 'text-sm',
                  ].join(' ')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class={isCompact ? 'h-3 w-3' : 'h-4 w-4'} fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  978-451-6890
                </a>
                <button class={[
                  'hover:bg-gray-100 rounded-lg transition-all duration-300 relative',
                  isCompact ? 'p-1.5' : 'p-2',
                ].join(' ')} aria-label="Cart">
                  <svg xmlns="http://www.w3.org/2000/svg" class={isCompact ? 'h-5 w-5 text-[#042e0d]' : 'h-6 w-6 text-[#042e0d]'} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span class={[
                    'absolute bg-[#56c270] text-[#042e0d] font-bold flex items-center justify-center rounded-full',
                    isCompact ? '-top-0.5 -right-0.5 w-4 h-4 text-[9px]' : '-top-0.5 -right-0.5 w-5 h-5 text-xs',
                  ].join(' ')}>0</span>
                </button>
              </div>
            </div>
          </div>

          {/* Mega Menu Dropdowns - positioned under header */}
          {/* Solar Panels Mega Menu */}
          <div class={[
            'absolute left-0 right-0 bg-white border-b border-gray-200 shadow-xl transition-all duration-200 z-40',
            openMenu.value === 'panels' ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none',
          ].join(' ')}>
            <div class="container mx-auto px-4 py-6">
              <div class="flex gap-8">
                <div class="flex-1">
                  <div class="mb-4 pb-4 border-b border-gray-100">
                    <p class="text-xs font-mono text-[#c3a859] uppercase tracking-wide mb-3">Featured</p>
                    <Link href="/products/znshine-550w-bifacial/" onClick$={closeMenu} class="flex gap-4 group/item">
                      <div class="w-20 h-20 bg-[#f1f1f2] rounded flex items-center justify-center flex-shrink-0">
                        <img src="https://cdn11.bigcommerce.com/s-yhdp96gt9k/images/stencil/1280w/products/706/3697/-ZNShine-450W-Bifacial-Solar-Panel_3693__13117.1760365366.jpg" alt="ZNShine Panel" class="w-16 h-16 object-contain" />
                      </div>
                      <div>
                        <p class="font-heading font-bold text-[#042e0d] group-hover/item:text-[#5974c3] transition-colors">ZNShine 550W Bifacial</p>
                        <p class="text-sm text-[#042e0d]/60">Mono PERC | High Efficiency</p>
                        <p class="text-sm text-[#56c270] font-semibold mt-1">In Stock - Starting at $189</p>
                      </div>
                    </Link>
                  </div>
                  <p class="text-xs font-mono text-[#042e0d]/50 uppercase tracking-wide mb-3">Categories</p>
                  <div class="flex flex-wrap gap-2">
                    <Link href="/products/" onClick$={closeMenu} class="px-4 py-2 bg-[#f1f1f2] hover:bg-[#042e0d] hover:text-white text-sm font-semibold rounded transition-colors text-[#042e0d]">Rooftop</Link>
                    <Link href="/products/" onClick$={closeMenu} class="px-4 py-2 bg-[#f1f1f2] hover:bg-[#042e0d] hover:text-white text-sm font-semibold rounded transition-colors text-[#042e0d]">Ground Mount</Link>
                    <Link href="/products/" onClick$={closeMenu} class="px-4 py-2 bg-[#f1f1f2] hover:bg-[#042e0d] hover:text-white text-sm font-semibold rounded transition-colors text-[#042e0d]">Off Grid</Link>
                    <Link href="/products/" onClick$={closeMenu} class="px-4 py-2 bg-[#f1f1f2] hover:bg-[#042e0d] hover:text-white text-sm font-semibold rounded transition-colors text-[#042e0d]">Portable</Link>
                    <Link href="/products/" onClick$={closeMenu} class="px-4 py-2 bg-[#c3a859]/20 text-[#c3a859] hover:bg-[#c3a859] hover:text-white text-sm font-semibold rounded transition-colors">Pallet Deals</Link>
                  </div>
                </div>
                <div class="w-64 bg-[#f1f1f2] rounded-lg p-5">
                  <p class="text-xs font-mono text-[#042e0d]/50 uppercase tracking-wide mb-3">Resources</p>
                  <ul class="space-y-3">
                    <li><Link href="/learn/" onClick$={closeMenu} class="text-sm text-[#042e0d] hover:text-[#5974c3] transition-colors flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[#5974c3]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>Panel Selection Guide</Link></li>
                    <li><Link href="/learn/" onClick$={closeMenu} class="text-sm text-[#042e0d] hover:text-[#5974c3] transition-colors flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[#5974c3]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>Sizing Calculator</Link></li>
                  </ul>
                  <div class="mt-4 pt-4 border-t border-gray-300">
                    <Link href="/products/" onClick$={closeMenu} class="text-sm font-bold text-[#5974c3] hover:underline">View All Panels →</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Batteries Mega Menu */}
          <div class={[
            'absolute left-0 right-0 bg-white border-b border-gray-200 shadow-xl transition-all duration-200 z-40',
            openMenu.value === 'batteries' ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none',
          ].join(' ')}>
            <div class="container mx-auto px-4 py-6">
              <div class="flex gap-8">
                <div class="flex-1">
                  <div class="mb-4 pb-4 border-b border-gray-100">
                    <p class="text-xs font-mono text-[#c3a859] uppercase tracking-wide mb-3">Featured</p>
                    <Link href="/products/fortress-power-eflex/" onClick$={closeMenu} class="flex gap-4 group/item">
                      <div class="w-20 h-20 bg-[#f1f1f2] rounded flex items-center justify-center flex-shrink-0">
                        <img src="https://cdn11.bigcommerce.com/s-yhdp96gt9k/images/stencil/1280w/products/694/3652/Fortress-Power-Fortress-Power-eFlex-MAX-54-kW_3616__72874.1758739079.jpg" alt="Fortress Power" class="w-16 h-16 object-contain" />
                      </div>
                      <div>
                        <p class="font-heading font-bold text-[#042e0d] group-hover/item:text-[#5974c3] transition-colors">Fortress Power eFlex 5.4</p>
                        <p class="text-sm text-[#042e0d]/60">5.4kWh LiFePO4 | Stackable</p>
                        <p class="text-sm text-[#56c270] font-semibold mt-1">In Stock - Starting at $2,195</p>
                      </div>
                    </Link>
                  </div>
                  <p class="text-xs font-mono text-[#042e0d]/50 uppercase tracking-wide mb-3">Categories</p>
                  <div class="flex flex-wrap gap-2">
                    <Link href="/products/" onClick$={closeMenu} class="px-4 py-2 bg-[#f1f1f2] hover:bg-[#042e0d] hover:text-white text-sm font-semibold rounded transition-colors text-[#042e0d]">Lithium LiFePO4</Link>
                    <Link href="/products/" onClick$={closeMenu} class="px-4 py-2 bg-[#f1f1f2] hover:bg-[#042e0d] hover:text-white text-sm font-semibold rounded transition-colors text-[#042e0d]">High Voltage</Link>
                    <Link href="/products/" onClick$={closeMenu} class="px-4 py-2 bg-[#f1f1f2] hover:bg-[#042e0d] hover:text-white text-sm font-semibold rounded transition-colors text-[#042e0d]">Rack Mounted</Link>
                    <Link href="/products/" onClick$={closeMenu} class="px-4 py-2 bg-[#f1f1f2] hover:bg-[#042e0d] hover:text-white text-sm font-semibold rounded transition-colors text-[#042e0d]">ESS Systems</Link>
                  </div>
                </div>
                <div class="w-64 bg-[#f1f1f2] rounded-lg p-5">
                  <p class="text-xs font-mono text-[#042e0d]/50 uppercase tracking-wide mb-3">Resources</p>
                  <ul class="space-y-3">
                    <li><Link href="/learn/" onClick$={closeMenu} class="text-sm text-[#042e0d] hover:text-[#5974c3] transition-colors flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[#5974c3]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>LiFePO4 vs Li-ion Guide</Link></li>
                    <li><Link href="/learn/" onClick$={closeMenu} class="text-sm text-[#042e0d] hover:text-[#5974c3] transition-colors flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[#5974c3]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>Battery Bank Sizing</Link></li>
                  </ul>
                  <div class="mt-4 pt-4 border-t border-gray-300">
                    <Link href="/products/" onClick$={closeMenu} class="text-sm font-bold text-[#5974c3] hover:underline">View All Batteries →</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Inverters Mega Menu */}
          <div class={[
            'absolute left-0 right-0 bg-white border-b border-gray-200 shadow-xl transition-all duration-200 z-40',
            openMenu.value === 'inverters' ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none',
          ].join(' ')}>
            <div class="container mx-auto px-4 py-6">
              <div class="flex gap-8">
                <div class="flex-1">
                  <div class="mb-4 pb-4 border-b border-gray-100">
                    <p class="text-xs font-mono text-[#c3a859] uppercase tracking-wide mb-3">Featured</p>
                    <Link href="/products/sol-ark-15k/" onClick$={closeMenu} class="flex gap-4 group/item">
                      <div class="w-20 h-20 bg-[#f1f1f2] rounded flex items-center justify-center flex-shrink-0">
                        <img src="https://cdn11.bigcommerce.com/s-yhdp96gt9k/images/stencil/1280w/products/130/3415/Sol-ark-Sol-Ark-Hybrid-Inverter_2494__62281.1757948040.jpg" alt="Sol-Ark Inverter" class="w-16 h-16 object-contain" />
                      </div>
                      <div>
                        <p class="font-heading font-bold text-[#042e0d] group-hover/item:text-[#5974c3] transition-colors">Sol-Ark 15K Hybrid</p>
                        <p class="text-sm text-[#042e0d]/60">15kW | 48V | All-in-One</p>
                        <p class="text-sm text-[#56c270] font-semibold mt-1">In Stock - Starting at $5,495</p>
                      </div>
                    </Link>
                  </div>
                  <p class="text-xs font-mono text-[#042e0d]/50 uppercase tracking-wide mb-3">Categories</p>
                  <div class="flex flex-wrap gap-2">
                    <Link href="/products/" onClick$={closeMenu} class="px-4 py-2 bg-[#f1f1f2] hover:bg-[#042e0d] hover:text-white text-sm font-semibold rounded transition-colors text-[#042e0d]">Hybrid</Link>
                    <Link href="/products/" onClick$={closeMenu} class="px-4 py-2 bg-[#f1f1f2] hover:bg-[#042e0d] hover:text-white text-sm font-semibold rounded transition-colors text-[#042e0d]">Grid Tie</Link>
                    <Link href="/products/" onClick$={closeMenu} class="px-4 py-2 bg-[#f1f1f2] hover:bg-[#042e0d] hover:text-white text-sm font-semibold rounded transition-colors text-[#042e0d]">Off Grid</Link>
                    <Link href="/products/" onClick$={closeMenu} class="px-4 py-2 bg-[#f1f1f2] hover:bg-[#042e0d] hover:text-white text-sm font-semibold rounded transition-colors text-[#042e0d]">Microinverters</Link>
                    <Link href="/products/" onClick$={closeMenu} class="px-4 py-2 bg-[#f1f1f2] hover:bg-[#042e0d] hover:text-white text-sm font-semibold rounded transition-colors text-[#042e0d]">Commercial</Link>
                  </div>
                </div>
                <div class="w-64 bg-[#f1f1f2] rounded-lg p-5">
                  <p class="text-xs font-mono text-[#042e0d]/50 uppercase tracking-wide mb-3">Resources</p>
                  <ul class="space-y-3">
                    <li><Link href="/learn/" onClick$={closeMenu} class="text-sm text-[#042e0d] hover:text-[#5974c3] transition-colors flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[#5974c3]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>Inverter Selection</Link></li>
                    <li><Link href="/learn/" onClick$={closeMenu} class="text-sm text-[#042e0d] hover:text-[#5974c3] transition-colors flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[#5974c3]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>Rosie Inverter Specs</Link></li>
                  </ul>
                  <div class="mt-4 pt-4 border-t border-gray-300">
                    <Link href="/products/" onClick$={closeMenu} class="text-sm font-bold text-[#5974c3] hover:underline">View All Inverters →</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mounting Mega Menu */}
          <div class={[
            'absolute left-0 right-0 bg-white border-b border-gray-200 shadow-xl transition-all duration-200 z-40',
            openMenu.value === 'mounting' ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none',
          ].join(' ')}>
            <div class="container mx-auto px-4 py-6">
              <p class="text-xs font-mono text-[#042e0d]/50 uppercase tracking-wide mb-3">Categories</p>
              <div class="flex flex-wrap gap-2">
                <Link href="/products/" onClick$={closeMenu} class="px-4 py-2 bg-[#f1f1f2] hover:bg-[#042e0d] hover:text-white text-sm font-semibold rounded transition-colors text-[#042e0d]">Ground Mounts</Link>
                <Link href="/products/" onClick$={closeMenu} class="px-4 py-2 bg-[#f1f1f2] hover:bg-[#042e0d] hover:text-white text-sm font-semibold rounded transition-colors text-[#042e0d]">Pitched Roof</Link>
                <Link href="/products/" onClick$={closeMenu} class="px-4 py-2 bg-[#f1f1f2] hover:bg-[#042e0d] hover:text-white text-sm font-semibold rounded transition-colors text-[#042e0d]">Flat Roof</Link>
                <Link href="/products/" onClick$={closeMenu} class="px-4 py-2 bg-[#f1f1f2] hover:bg-[#042e0d] hover:text-white text-sm font-semibold rounded transition-colors text-[#042e0d]">Metal Roof</Link>
                <Link href="/products/" onClick$={closeMenu} class="px-4 py-2 bg-[#f1f1f2] hover:bg-[#042e0d] hover:text-white text-sm font-semibold rounded transition-colors text-[#042e0d]">Pole Mount</Link>
                <Link href="/products/" onClick$={closeMenu} class="px-4 py-2 bg-[#f1f1f2] hover:bg-[#042e0d] hover:text-white text-sm font-semibold rounded transition-colors text-[#042e0d]">Hardware</Link>
              </div>
              <div class="mt-4 pt-4 border-t border-gray-200">
                <Link href="/products/" onClick$={closeMenu} class="text-sm font-bold text-[#5974c3] hover:underline">View All Mounting →</Link>
              </div>
            </div>
          </div>

          {/* Controllers Mega Menu */}
          <div class={[
            'absolute left-0 right-0 bg-white border-b border-gray-200 shadow-xl transition-all duration-200 z-40',
            openMenu.value === 'controllers' ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none',
          ].join(' ')}>
            <div class="container mx-auto px-4 py-6">
              <p class="text-xs font-mono text-[#042e0d]/50 uppercase tracking-wide mb-3">Categories</p>
              <div class="flex flex-wrap gap-2">
                <Link href="/products/" onClick$={closeMenu} class="px-4 py-2 bg-[#f1f1f2] hover:bg-[#042e0d] hover:text-white text-sm font-semibold rounded transition-colors text-[#042e0d]">MPPT</Link>
                <Link href="/products/" onClick$={closeMenu} class="px-4 py-2 bg-[#f1f1f2] hover:bg-[#042e0d] hover:text-white text-sm font-semibold rounded transition-colors text-[#042e0d]">PWM</Link>
                <Link href="/products/" onClick$={closeMenu} class="px-4 py-2 bg-[#f1f1f2] hover:bg-[#042e0d] hover:text-white text-sm font-semibold rounded transition-colors text-[#042e0d]">Stacking</Link>
                <Link href="/products/" onClick$={closeMenu} class="px-4 py-2 bg-[#f1f1f2] hover:bg-[#042e0d] hover:text-white text-sm font-semibold rounded transition-colors text-[#042e0d]">DC Power</Link>
              </div>
              <div class="mt-4 pt-4 border-t border-gray-200">
                <Link href="/products/" onClick$={closeMenu} class="text-sm font-bold text-[#5974c3] hover:underline">View All Controllers →</Link>
              </div>
            </div>
          </div>

          {/* BOS Mega Menu */}
          <div class={[
            'absolute left-0 right-0 bg-white border-b border-gray-200 shadow-xl transition-all duration-200 z-40',
            openMenu.value === 'bos' ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none',
          ].join(' ')}>
            <div class="container mx-auto px-4 py-6">
              <p class="text-xs font-mono text-[#042e0d]/50 uppercase tracking-wide mb-3">Categories</p>
              <div class="flex flex-wrap gap-2">
                <Link href="/products/" onClick$={closeMenu} class="px-4 py-2 bg-[#f1f1f2] hover:bg-[#042e0d] hover:text-white text-sm font-semibold rounded transition-colors text-[#042e0d]">Combiners</Link>
                <Link href="/products/" onClick$={closeMenu} class="px-4 py-2 bg-[#f1f1f2] hover:bg-[#042e0d] hover:text-white text-sm font-semibold rounded transition-colors text-[#042e0d]">Breakers</Link>
                <Link href="/products/" onClick$={closeMenu} class="px-4 py-2 bg-[#f1f1f2] hover:bg-[#042e0d] hover:text-white text-sm font-semibold rounded transition-colors text-[#042e0d]">Wire &amp; Cable</Link>
                <Link href="/products/" onClick$={closeMenu} class="px-4 py-2 bg-[#f1f1f2] hover:bg-[#042e0d] hover:text-white text-sm font-semibold rounded transition-colors text-[#042e0d]">Rapid Shutdown</Link>
                <Link href="/products/" onClick$={closeMenu} class="px-4 py-2 bg-[#f1f1f2] hover:bg-[#042e0d] hover:text-white text-sm font-semibold rounded transition-colors text-[#042e0d]">Surge Protection</Link>
                <Link href="/products/" onClick$={closeMenu} class="px-4 py-2 bg-[#f1f1f2] hover:bg-[#042e0d] hover:text-white text-sm font-semibold rounded transition-colors text-[#042e0d]">Monitoring</Link>
              </div>
              <div class="mt-4 pt-4 border-t border-gray-200">
                <Link href="/products/" onClick$={closeMenu} class="text-sm font-bold text-[#5974c3] hover:underline">View All BOS →</Link>
              </div>
            </div>
          </div>
        </header>
        {/* Spacer to prevent content from being hidden behind fixed header */}
        <div class="h-16" aria-hidden="true"></div>
      </div>

      {/* Mobile drawer sidebar */}
      <div class="drawer-side z-50">
        <label for="mobile-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
        <div class="bg-white min-h-full w-80 overflow-y-auto">
          <div class="p-4 bg-[#042e0d] flex items-center justify-between sticky top-0">
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
              <input type="text" placeholder="Search products..." class="w-full border border-gray-200 px-3 py-2 pr-10 text-sm rounded-lg" />
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 absolute right-3 top-1/2 -translate-y-1/2 text-[#042e0d]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <nav class="p-4">
            <div class="mb-4">
              <p class="text-xs font-mono text-[#c3a859] uppercase tracking-wide mb-2">Products</p>
              <ul class="space-y-1">
                <li><Link href="/products/" class="block py-2 text-sm font-bold text-[#042e0d] hover:text-[#56c270]">Solar Panels</Link></li>
                <li><Link href="/products/" class="block py-2 text-sm font-bold text-[#042e0d] hover:text-[#56c270]">Batteries</Link></li>
                <li><Link href="/products/" class="block py-2 text-sm font-bold text-[#042e0d] hover:text-[#56c270]">Inverters</Link></li>
                <li><Link href="/products/" class="block py-2 text-sm font-bold text-[#042e0d] hover:text-[#56c270]">Mounting</Link></li>
                <li><Link href="/products/" class="block py-2 text-sm font-bold text-[#042e0d] hover:text-[#56c270]">Controllers</Link></li>
                <li><Link href="/products/" class="block py-2 text-sm font-bold text-[#042e0d] hover:text-[#56c270]">Balance of System</Link></li>
              </ul>
            </div>

            <div class="border-t border-gray-200 pt-4 mb-4">
              <ul class="space-y-1">
                <li><Link href="/learn/" class="block py-2 text-sm text-[#042e0d] hover:text-[#56c270]">Resources</Link></li>
                <li><Link href="/about/" class="block py-2 text-sm text-[#042e0d] hover:text-[#56c270]">About Us</Link></li>
                <li><Link href="/contact/" class="block py-2 text-sm text-[#c3a859] font-bold hover:text-[#042e0d]">Contact</Link></li>
              </ul>
            </div>
          </nav>

          <div class="p-4 border-t border-gray-200 bg-[#f1f1f2]">
            <p class="text-xs text-[#c3a859] font-semibold mb-1">Need help? Call a Solar Expert</p>
            <a href="tel:978-451-6890" class="font-heading font-bold text-lg text-[#042e0d]">978-451-6890</a>
          </div>
        </div>
      </div>
    </div>
  );
});
