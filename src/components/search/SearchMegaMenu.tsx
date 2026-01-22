/**
 * Live Search Mega Menu Component
 *
 * Provides instant product search with autocomplete as the user types.
 * Shows a dropdown with product results including thumbnails, names, and prices.
 *
 * Features:
 * - Debounced search (200ms)
 * - Keyboard navigation (arrow keys, enter, escape)
 * - Click outside to close
 * - Mobile-friendly
 * - Loading and error states
 */

import {
  component$,
  useSignal,
  useTask$,
  $,
  useOnDocument,
  type QRL,
} from '@builder.io/qwik';
import { Link, useNavigate } from '@builder.io/qwik-city';

interface SearchResult {
  id: string;
  sku: string | null;
  title: string;
  slug: string;
  item_group: string | null;
  price: number | null;
  sale_price: number | null;
  thumbnail_url: string | null;
}

interface SearchResponse {
  query: string;
  total: number;
  results: SearchResult[];
  message?: string;
}

interface SearchMegaMenuProps {
  isCompact?: boolean;
  onClose$?: QRL<() => void>;
}

export const SearchMegaMenu = component$<SearchMegaMenuProps>(({ isCompact = false, onClose$ }) => {
  const searchTerm = useSignal('');
  const results = useSignal<SearchResult[]>([]);
  const total = useSignal(0);
  const isOpen = useSignal(false);
  const isLoading = useSignal(false);
  const error = useSignal<string | null>(null);
  const selectedIndex = useSignal(-1);
  const inputRef = useSignal<HTMLInputElement>();
  const containerRef = useSignal<HTMLDivElement>();

  const nav = useNavigate();

  // Close dropdown when clicking outside
  useOnDocument(
    'click',
    $((event) => {
      if (!containerRef.value) return;
      const target = event.target as Node;
      if (!containerRef.value.contains(target)) {
        isOpen.value = false;
        selectedIndex.value = -1;
      }
    })
  );

  // Close on escape key
  useOnDocument(
    'keydown',
    $((event) => {
      if ((event as KeyboardEvent).key === 'Escape' && isOpen.value) {
        isOpen.value = false;
        selectedIndex.value = -1;
        inputRef.value?.blur();
      }
    })
  );

  // Debounced search - triggers API call when searchTerm changes
  useTask$(async ({ track, cleanup }) => {
    const term = track(() => searchTerm.value);

    // Clear results if query is too short
    if (term.length < 2) {
      results.value = [];
      total.value = 0;
      isOpen.value = false;
      error.value = null;
      return;
    }

    // Debounce: wait 200ms before searching
    const controller = new AbortController();
    cleanup(() => controller.abort());

    await new Promise((resolve) => setTimeout(resolve, 200));

    // Don't proceed if aborted during debounce
    if (controller.signal.aborted) return;

    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(term)}&limit=8`, {
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error('Search request failed');
      }

      const data: SearchResponse = await response.json();
      results.value = data.results;
      total.value = data.total;
      isOpen.value = true;
      selectedIndex.value = -1;
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Ignore abort errors
      }
      console.error('Search error:', err);
      error.value = 'Search unavailable';
      results.value = [];
      total.value = 0;
    } finally {
      isLoading.value = false;
    }
  });

  // Handle keyboard navigation
  const handleKeyDown = $((event: KeyboardEvent) => {
    if (!isOpen.value || results.value.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        selectedIndex.value = Math.min(selectedIndex.value + 1, results.value.length - 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        selectedIndex.value = Math.max(selectedIndex.value - 1, -1);
        break;
      case 'Enter':
        event.preventDefault();
        if (selectedIndex.value >= 0 && selectedIndex.value < results.value.length) {
          const product = results.value[selectedIndex.value];
          const href = `/products/${encodeURIComponent(product.sku || product.id)}/`;
          isOpen.value = false;
          searchTerm.value = '';
          nav(href);
        } else if (searchTerm.value.length >= 2) {
          // Navigate to search results page
          const href = `/search?q=${encodeURIComponent(searchTerm.value)}`;
          isOpen.value = false;
          nav(href);
        }
        break;
    }
  });

  // Handle input focus
  const handleFocus = $(() => {
    if (searchTerm.value.length >= 2 && results.value.length > 0) {
      isOpen.value = true;
    }
  });

  // Handle result click
  const handleResultClick = $(() => {
    isOpen.value = false;
    searchTerm.value = '';
    selectedIndex.value = -1;
    onClose$?.();
  });

  // Format price display
  const formatPrice = (price: number | null, salePrice: number | null): string => {
    const displayPrice = salePrice ?? price;
    if (displayPrice === null) return 'Call for Pricing';
    return `$${displayPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div ref={containerRef} class="relative w-full">
      {/* Search Input */}
      <div class="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder={isCompact ? 'Search...' : 'Search products...'}
          value={searchTerm.value}
          onInput$={(e) => {
            searchTerm.value = (e.target as HTMLInputElement).value;
          }}
          onFocus$={handleFocus}
          onKeyDown$={handleKeyDown}
          class={[
            'w-full border-2 border-gray-200 bg-white text-gray-900 placeholder-gray-500 text-sm rounded-lg focus:outline-none focus:border-solamp-green transition-all duration-300',
            isCompact ? 'px-3 py-1 pr-8' : 'px-4 py-2 pr-12',
          ].join(' ')}
          aria-label="Search products"
          aria-expanded={isOpen.value}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          role="combobox"
        />
        <button
          type="button"
          class={[
            'absolute right-0 top-0 h-full bg-solamp-blue text-white rounded-r-lg hover:bg-solamp-blue/90 transition-colors',
            isCompact ? 'px-2' : 'px-3',
          ].join(' ')}
          aria-label="Search"
          onClick$={() => {
            if (searchTerm.value.length >= 2) {
              nav(`/search?q=${encodeURIComponent(searchTerm.value)}`);
              isOpen.value = false;
            }
          }}
        >
          {isLoading.value ? (
            <svg
              class={isCompact ? 'h-4 w-4 animate-spin' : 'h-5 w-5 animate-spin'}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class={isCompact ? 'h-4 w-4' : 'h-5 w-5'}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Dropdown Results */}
      {isOpen.value && (
        <div
          class="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-[70vh] overflow-hidden"
          role="listbox"
        >
          {error.value ? (
            /* Error State */
            <div class="p-4 text-center text-gray-500">
              <p>{error.value}</p>
            </div>
          ) : results.value.length === 0 ? (
            /* No Results */
            <div class="p-6 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-12 w-12 mx-auto text-gray-300 mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <p class="text-gray-600 font-medium">No products found for "{searchTerm.value}"</p>
              <p class="text-sm text-gray-400 mt-1">Try a different search term or browse our categories</p>
            </div>
          ) : (
            /* Results Grid */
            <>
              <div class="p-4 overflow-y-auto max-h-[calc(70vh-60px)]">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {results.value.map((product, index) => (
                    <Link
                      key={product.id}
                      href={`/products/${encodeURIComponent(product.sku || product.id)}/`}
                      onClick$={handleResultClick}
                      class={[
                        'group block rounded-lg border transition-all',
                        selectedIndex.value === index
                          ? 'border-solamp-blue bg-solamp-blue/5 ring-2 ring-solamp-blue/20'
                          : 'border-gray-200 hover:border-solamp-green hover:shadow-md',
                      ].join(' ')}
                      role="option"
                      aria-selected={selectedIndex.value === index}
                    >
                      {/* Product Image */}
                      <div class="aspect-square bg-gray-50 rounded-t-lg overflow-hidden flex items-center justify-center p-2">
                        {product.thumbnail_url ? (
                          <img
                            src={product.thumbnail_url}
                            alt={product.title}
                            class="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-200"
                            loading="lazy"
                            width="150"
                            height="150"
                          />
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-12 w-12 text-gray-300"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            stroke-width="0.5"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        )}
                      </div>

                      {/* Product Info */}
                      <div class="p-2">
                        <p class="text-[10px] font-mono text-solamp-bronze uppercase tracking-wide truncate">
                          {product.item_group || 'Products'}
                        </p>
                        <p class="text-sm font-semibold text-solamp-forest line-clamp-2 group-hover:text-solamp-blue transition-colors min-h-[2.5rem]">
                          {product.title}
                        </p>
                        <p class="text-sm font-bold text-solamp-green mt-1">
                          {formatPrice(product.price, product.sale_price)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Footer with count and view all */}
              <div class="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                <span class="text-sm text-gray-500">
                  Showing {results.value.length} of {total.value} results
                </span>
                <Link
                  href={`/search?q=${encodeURIComponent(searchTerm.value)}`}
                  onClick$={handleResultClick}
                  class="text-sm font-bold text-solamp-blue hover:underline"
                >
                  View all results →
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
});
