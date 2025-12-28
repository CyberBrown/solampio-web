import { component$, useContext } from '@builder.io/qwik';
import { Link, useLocation } from '@builder.io/qwik-city';
import { SidebarContext } from '../../context/sidebar-context';

// Placeholder data - will be replaced with real data later
const categories = [
  {
    name: 'Solar Panels',
    slug: 'solar-panels',
    count: 45,
    subcategories: [
      { name: 'Rooftop', slug: 'rooftop', count: 18 },
      { name: 'Ground Mount', slug: 'ground-mount', count: 12 },
      { name: 'Off Grid', slug: 'off-grid', count: 8 },
      { name: 'Portable', slug: 'portable', count: 7 },
    ],
  },
  {
    name: 'Batteries & Storage',
    slug: 'batteries',
    count: 32,
    subcategories: [
      { name: 'LiFePO4', slug: 'lifepo4', count: 15 },
      { name: 'High Voltage', slug: 'high-voltage', count: 8 },
      { name: 'Rack Mounted', slug: 'rack-mounted', count: 6 },
      { name: 'ESS Systems', slug: 'ess', count: 3 },
    ],
  },
  {
    name: 'Inverters',
    slug: 'inverters',
    count: 28,
    subcategories: [
      { name: 'Hybrid', slug: 'hybrid', count: 10 },
      { name: 'Grid Tie', slug: 'grid-tie', count: 8 },
      { name: 'Off Grid', slug: 'off-grid', count: 6 },
      { name: 'Microinverters', slug: 'microinverters', count: 4 },
    ],
  },
  {
    name: 'Charge Controllers',
    slug: 'charge-controllers',
    count: 18,
    subcategories: [
      { name: 'MPPT', slug: 'mppt', count: 12 },
      { name: 'PWM', slug: 'pwm', count: 6 },
    ],
  },
  {
    name: 'Mounting & Racking',
    slug: 'mounting',
    count: 56,
    subcategories: [
      { name: 'Ground Mounts', slug: 'ground-mounts', count: 15 },
      { name: 'Pitched Roof', slug: 'pitched-roof', count: 18 },
      { name: 'Flat Roof', slug: 'flat-roof', count: 10 },
      { name: 'Metal Roof', slug: 'metal-roof', count: 8 },
      { name: 'Pole Mount', slug: 'pole-mount', count: 5 },
    ],
  },
  {
    name: 'Balance of System',
    slug: 'bos',
    count: 124,
    subcategories: [
      { name: 'Combiners', slug: 'combiners', count: 20 },
      { name: 'Breakers', slug: 'breakers', count: 25 },
      { name: 'Wire & Cable', slug: 'wire-cable', count: 40 },
      { name: 'Rapid Shutdown', slug: 'rapid-shutdown', count: 15 },
      { name: 'Surge Protection', slug: 'surge-protection', count: 12 },
      { name: 'Monitoring', slug: 'monitoring', count: 12 },
    ],
  },
];

const brands = [
  { name: 'MidNite Solar', slug: 'midnite-solar', count: 45 },
  { name: 'Sol-Ark', slug: 'sol-ark', count: 12 },
  { name: 'Fortress Power', slug: 'fortress-power', count: 8 },
  { name: 'Tamarack', slug: 'tamarack', count: 35 },
  { name: 'Morningstar', slug: 'morningstar', count: 18 },
  { name: 'OutBack Power', slug: 'outback-power', count: 22 },
  { name: 'Victron', slug: 'victron', count: 28 },
  { name: 'ZNShine', slug: 'znshine', count: 15 },
  { name: 'EG4', slug: 'eg4', count: 10 },
  { name: 'SimpliPhi', slug: 'simpliphi', count: 6 },
  { name: 'S-5!', slug: 's-5', count: 20 },
  { name: 'IronRidge', slug: 'ironridge', count: 25 },
];

export const ProductSidebar = component$(() => {
  const loc = useLocation();
  const currentPath = loc.url.pathname;
  const sidebar = useContext(SidebarContext);

  return (
    <aside class="w-64 flex-shrink-0">
      <div class="fixed top-16 left-0 w-64 h-[calc(100vh-4rem)] overflow-y-auto bg-white border-r border-gray-200 p-4">
        {/* Collapse Button - aligned left at top */}
        <button
          onClick$={() => { sidebar.visible.value = false; }}
          class="flex items-center gap-2 text-xs text-gray-500 hover:text-[#042e0d] mb-4 group transition-colors"
          aria-label="Collapse sidebar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
          <span class="group-hover:underline">Collapse</span>
        </button>

        {/* Categories */}
        <div class="mb-6">
          <p class="text-xs font-mono text-[#c3a859] uppercase tracking-wide mb-3">Categories</p>
          <ul class="space-y-1">
            {categories.map((cat) => {
              const isActive = currentPath.includes(`/category/${cat.slug}`);
              const isParentActive = cat.subcategories.some((sub) =>
                currentPath.includes(`/category/${cat.slug}/${sub.slug}`)
              );

              return (
                <li key={cat.slug}>
                  <Link
                    href={`/products/category/${cat.slug}/`}
                    class={[
                      'flex items-center justify-between py-1.5 px-2 rounded text-sm transition-colors',
                      isActive || isParentActive
                        ? 'bg-[#042e0d] text-white font-semibold'
                        : 'text-[#042e0d] hover:bg-gray-100',
                    ].join(' ')}
                  >
                    <span>{cat.name}</span>
                    <span class={[
                      'text-xs',
                      isActive || isParentActive ? 'text-white/70' : 'text-gray-400',
                    ].join(' ')}>
                      {cat.count}
                    </span>
                  </Link>
                  {/* Subcategories - show when parent is active */}
                  {(isActive || isParentActive) && (
                    <ul class="ml-3 mt-1 space-y-0.5 border-l-2 border-[#56c270]/30 pl-3">
                      {cat.subcategories.map((sub) => {
                        const isSubActive = currentPath.includes(`/category/${cat.slug}/${sub.slug}`);
                        return (
                          <li key={sub.slug}>
                            <Link
                              href={`/products/category/${cat.slug}/${sub.slug}/`}
                              class={[
                                'flex items-center justify-between py-1 px-2 rounded text-xs transition-colors',
                                isSubActive
                                  ? 'bg-[#56c270]/20 text-[#042e0d] font-semibold'
                                  : 'text-gray-600 hover:bg-gray-50',
                              ].join(' ')}
                            >
                              <span>{sub.name}</span>
                              <span class="text-gray-400">{sub.count}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Brands */}
        <div class="mb-6">
          <p class="text-xs font-mono text-[#c3a859] uppercase tracking-wide mb-3">Brands</p>
          <ul class="space-y-0.5">
            {brands.map((brand) => {
              const isActive = currentPath.includes(`/brand/${brand.slug}`);
              return (
                <li key={brand.slug}>
                  <Link
                    href={`/products/brand/${brand.slug}/`}
                    class={[
                      'flex items-center justify-between py-1.5 px-2 rounded text-sm transition-colors',
                      isActive
                        ? 'bg-[#5974c3] text-white font-semibold'
                        : 'text-[#042e0d] hover:bg-gray-100',
                    ].join(' ')}
                  >
                    <span>{brand.name}</span>
                    <span class={[
                      'text-xs',
                      isActive ? 'text-white/70' : 'text-gray-400',
                    ].join(' ')}>
                      {brand.count}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Help Box */}
        <div class="bg-white border border-gray-200 rounded-lg p-4 mt-6">
          <p class="text-xs font-mono text-[#c3a859] uppercase tracking-wide mb-2">Need Help?</p>
          <p class="text-sm text-gray-600 mb-3">Our engineers can help you find the right equipment.</p>
          <a
            href="tel:978-451-6890"
            class="flex items-center justify-center gap-2 bg-[#042e0d] text-white text-sm font-bold py-2 px-3 rounded hover:bg-[#042e0d]/80 transition-colors w-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            978-451-6890
          </a>
        </div>
      </div>
    </aside>
  );
});

// Export categories and brands for use in other components
export { categories, brands };
