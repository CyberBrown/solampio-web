/**
 * Search Results Page
 *
 * Displays full search results with pagination.
 * Uses the same search API as the mega menu but with more results.
 */

import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { routeLoader$, useLocation } from '@builder.io/qwik-city';
import { getDB, type Product } from '../../lib/db';
import { ProductCard } from '../../components/product/ProductCard';

interface SearchResult {
  products: Product[];
  total: number;
  query: string;
}

export const useSearchResults = routeLoader$(async (requestEvent): Promise<SearchResult> => {
  const query = requestEvent.url.searchParams.get('q')?.trim() || '';

  if (query.length < 2) {
    return { products: [], total: 0, query };
  }

  const db = getDB(requestEvent.platform);
  const products = await db.searchProducts(query, 50);

  return {
    products,
    total: products.length,
    query,
  };
});

export default component$(() => {
  const location = useLocation();
  const searchResults = useSearchResults();
  const { products, total, query } = searchResults.value;

  return (
    <div class="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section class="bg-solamp-forest py-8">
        <div class="container mx-auto px-4">
          <nav class="text-sm text-white/60 mb-4">
            <a href="/" class="hover:text-white">Home</a>
            <span class="mx-2">/</span>
            <span class="text-white">Search</span>
          </nav>
          <h1 class="font-heading font-extrabold text-2xl md:text-3xl text-white">
            {query ? `Search Results for "${query}"` : 'Search Products'}
          </h1>
          {query && (
            <p class="text-white/80 mt-2">
              {total} {total === 1 ? 'product' : 'products'} found
            </p>
          )}
        </div>
      </section>

      {/* Search Form for refinement */}
      <section class="py-6 border-b border-gray-200 bg-white">
        <div class="container mx-auto px-4">
          <form action="/search" method="get" class="max-w-2xl">
            <div class="flex gap-2">
              <input
                type="text"
                name="q"
                value={query}
                placeholder="Search products..."
                class="flex-1 border-2 border-gray-200 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-solamp-green"
              />
              <button
                type="submit"
                class="bg-solamp-blue text-white px-6 py-3 rounded-lg font-bold hover:bg-solamp-blue/90 transition-colors"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Results */}
      <section class="py-8">
        <div class="container mx-auto px-4">
          {!query || query.length < 2 ? (
            /* No search query */
            <div class="text-center py-16">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-16 w-16 mx-auto text-gray-300 mb-4"
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
              <h2 class="text-xl font-heading font-bold text-gray-600 mb-2">
                Enter a search term
              </h2>
              <p class="text-gray-500">
                Type at least 2 characters to search for products
              </p>
            </div>
          ) : products.length === 0 ? (
            /* No results */
            <div class="text-center py-16">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-16 w-16 mx-auto text-gray-300 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h2 class="text-xl font-heading font-bold text-gray-600 mb-2">
                No products found for "{query}"
              </h2>
              <p class="text-gray-500 mb-6">
                Try a different search term or browse our categories
              </p>
              <div class="flex flex-wrap justify-center gap-2">
                <a
                  href="/categories/solar-panels/"
                  class="px-4 py-2 bg-solamp-mist text-solamp-forest font-semibold rounded hover:bg-solamp-forest hover:text-white transition-colors"
                >
                  Solar Panels
                </a>
                <a
                  href="/categories/batteries/"
                  class="px-4 py-2 bg-solamp-mist text-solamp-forest font-semibold rounded hover:bg-solamp-forest hover:text-white transition-colors"
                >
                  Batteries
                </a>
                <a
                  href="/categories/inverters/"
                  class="px-4 py-2 bg-solamp-mist text-solamp-forest font-semibold rounded hover:bg-solamp-forest hover:text-white transition-colors"
                >
                  Inverters
                </a>
                <a
                  href="/products/"
                  class="px-4 py-2 bg-solamp-blue text-white font-semibold rounded hover:bg-solamp-blue/90 transition-colors"
                >
                  Browse All Products
                </a>
              </div>
            </div>
          ) : (
            /* Results grid */
            <div class="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
});

export const head: DocumentHead = ({ resolveValue }) => {
  const results = resolveValue(useSearchResults);
  const query = results.query;

  return {
    title: query
      ? `Search: ${query} | Solamp Solar & Energy Storage`
      : 'Search Products | Solamp Solar & Energy Storage',
    meta: [
      {
        name: 'description',
        content: query
          ? `Search results for "${query}" - Find solar panels, batteries, inverters, and more from Solamp.`
          : 'Search our catalog of solar panels, batteries, inverters, charge controllers, and balance of system components.',
      },
      {
        name: 'robots',
        content: 'noindex', // Don't index search results pages
      },
    ],
  };
};
