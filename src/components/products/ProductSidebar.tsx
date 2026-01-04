import { component$, useContext } from '@builder.io/qwik';
import { Link, useLocation } from '@builder.io/qwik-city';
import { SidebarContext } from '../../context/sidebar-context';
import type { Category, Brand } from '../../lib/db';
import { cleanSlug } from '../../lib/db';

// Type for hierarchical category structure
interface HierarchicalCategory extends Category {
  subcategories: Category[];
}

interface ProductSidebarProps {
  categories: HierarchicalCategory[];
  brands: Brand[];
}

export const ProductSidebar = component$<ProductSidebarProps>(({ categories, brands }) => {
  const loc = useLocation();
  const currentPath = loc.url.pathname;
  const sidebar = useContext(SidebarContext);

  // More precise path matching - checks for exact path segment match
  const matchesCategory = (path: string, catSlug: string) => {
    // Match /products/category/{catSlug}/ or /products/category/{catSlug}/{subSlug}/
    return path.startsWith(`/products/category/${catSlug}/`);
  };

  const matchesSubcategory = (path: string, catSlug: string, subSlug: string) => {
    return path.startsWith(`/products/category/${catSlug}/${subSlug}/`) ||
           path === `/products/category/${catSlug}/${subSlug}`;
  };

  return (
    <>
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
              const catSlug = cleanSlug(cat.slug);
              const isActive = matchesCategory(currentPath, catSlug);
              const isParentActive = cat.subcategories.some((sub) =>
                matchesSubcategory(currentPath, catSlug, cleanSlug(sub.slug))
              );

              return (
                <li key={cat.id}>
                  <Link
                    href={`/products/category/${catSlug}/`}
                    class={[
                      'flex items-center justify-between py-1.5 px-2 rounded text-sm transition-colors',
                      isActive || isParentActive
                        ? 'bg-[#042e0d] text-white font-semibold'
                        : 'text-[#042e0d] hover:bg-gray-100',
                    ].join(' ')}
                  >
                    <span>{cat.title}</span>
                    <span class={[
                      'text-xs',
                      isActive || isParentActive ? 'text-white/70' : 'text-gray-400',
                    ].join(' ')}>
                      {cat.count}
                    </span>
                  </Link>
                  {/* Subcategories - show when parent is active */}
                  {(isActive || isParentActive) && cat.subcategories.length > 0 && (
                    <ul class="ml-3 mt-1 space-y-0.5 border-l-2 border-[#56c270]/30 pl-3">
                      {cat.subcategories.map((sub) => {
                        const subSlug = cleanSlug(sub.slug);
                        const isSubActive = matchesSubcategory(currentPath, catSlug, subSlug);
                        return (
                          <li key={sub.id}>
                            <Link
                              href={`/products/category/${catSlug}/${subSlug}/`}
                              class={[
                                'flex items-center justify-between py-1 px-2 rounded text-xs transition-colors',
                                isSubActive
                                  ? 'bg-[#56c270]/20 text-[#042e0d] font-semibold'
                                  : 'text-gray-600 hover:bg-gray-50',
                              ].join(' ')}
                            >
                              <span>{sub.title}</span>
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
              const brandSlug = cleanSlug(brand.slug);
              const isActive = currentPath.startsWith(`/products/brand/${brandSlug}/`) ||
                               currentPath === `/products/brand/${brandSlug}`;
              return (
                <li key={brand.id}>
                  <Link
                    href={`/products/brand/${brandSlug}/`}
                    class={[
                      'flex items-center justify-between py-1.5 px-2 rounded text-sm transition-colors',
                      isActive
                        ? 'bg-[#5974c3] text-white font-semibold'
                        : 'text-[#042e0d] hover:bg-gray-100',
                    ].join(' ')}
                  >
                    <span>{brand.title}</span>
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
    </>
  );
});
