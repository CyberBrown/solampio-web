import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '~/lib/qwik-city';
import { Link } from '~/lib/qwik-city';
import { useCart } from '../../hooks/useCart';
import { encodeSkuForUrl } from '../../lib/db';

export default component$(() => {
  const cart = useCart();
  const items = cart.items.value;
  // Compute values inline instead of using helper functions (avoids serialization issues)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const pricedItems = items.filter(item => item.price !== null);
  const subtotal = pricedItems.length > 0
    ? pricedItems.reduce((sum, item) => sum + (item.price! * item.quantity), 0)
    : null;
  const hasUnpriced = items.some(item => item.price === null);

  return (
    <div class="bg-[#f1f1f2] min-h-screen">
      {/* Header */}
      <section class="bg-[#042e0d] py-8">
        <div class="container mx-auto px-4">
          <nav class="mb-4">
            <ol class="flex items-center gap-2 text-sm">
              <li><Link href="/" class="text-white/50 hover:text-white transition-colors">Home</Link></li>
              <li class="text-white/30">/</li>
              <li class="text-white font-semibold">Shopping Cart</li>
            </ol>
          </nav>
          <h1 class="font-heading font-extrabold text-2xl md:text-3xl text-white">
            Shopping Cart
          </h1>
        </div>
      </section>

      {/* Cart Content */}
      <section class="py-8">
        <div class="container mx-auto px-4">
          {items.length === 0 ? (
            /* Empty Cart State */
            <div class="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h2 class="font-heading font-bold text-xl text-[#042e0d] mb-2">Your cart is empty</h2>
              <p class="text-gray-500 mb-6">Browse our products and add items to your quote request.</p>
              <Link
                href="/products/"
                class="inline-flex items-center gap-2 bg-[#042e0d] text-white font-heading font-bold px-6 py-3 rounded hover:bg-[#042e0d]/80 transition-colors"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div class="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div class="lg:col-span-2">
                <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div class="p-4 border-b border-gray-200 flex justify-between items-center">
                    <p class="font-heading font-bold text-[#042e0d]">{itemCount} {itemCount === 1 ? 'item' : 'items'} in cart</p>
                    <button
                      onClick$={() => cart.clearCart()}
                      class="text-sm text-gray-500 hover:text-red-500 transition-colors"
                    >
                      Clear Cart
                    </button>
                  </div>
                  <div class="divide-y divide-gray-100">
                    {items.map((item) => {
                      const displayPrice = item.price !== null ? `$${item.price.toFixed(2)}` : 'Call for Pricing';
                      const lineTotal = item.price !== null ? `$${(item.price * item.quantity).toFixed(2)}` : 'Call for Pricing';

                      return (
                        <div key={item.id} class="p-4 flex gap-4">
                          <div class="w-20 h-20 bg-gray-100 rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {item.thumbnail_url ? (
                              <img src={item.thumbnail_url} alt={item.title} class="w-full h-full object-contain" />
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="0.5">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            )}
                          </div>
                          <div class="flex-1">
                            <div class="flex justify-between items-start">
                              <div>
                                <Link href={`/products/${encodeSkuForUrl(item.sku)}/`} class="font-heading font-bold text-[#042e0d] hover:text-[#5974c3] transition-colors">
                                  {item.title}
                                </Link>
                                <p class="text-sm text-gray-500 mt-1">SKU: {item.sku}</p>
                              </div>
                              <button
                                onClick$={() => cart.removeFromCart(item.id)}
                                class="text-gray-400 hover:text-red-500 transition-colors"
                                aria-label="Remove item"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                            <div class="flex items-center justify-between mt-4">
                              <div class="flex items-center gap-2">
                                <button
                                  onClick$={() => cart.updateQuantity(item.id, item.quantity - 1)}
                                  class="w-8 h-8 bg-gray-100 rounded flex items-center justify-center hover:bg-gray-200 transition-colors"
                                  aria-label="Decrease quantity"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M20 12H4" />
                                  </svg>
                                </button>
                                <span class="w-10 text-center font-bold">{item.quantity}</span>
                                <button
                                  onClick$={() => cart.updateQuantity(item.id, item.quantity + 1)}
                                  class="w-8 h-8 bg-gray-100 rounded flex items-center justify-center hover:bg-gray-200 transition-colors"
                                  aria-label="Increase quantity"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                                  </svg>
                                </button>
                              </div>
                              <div class="text-right">
                                {item.price !== null && item.quantity > 1 && (
                                  <p class="text-xs text-gray-500">{displayPrice} each</p>
                                )}
                                <p class="font-heading font-bold text-[#042e0d]">{lineTotal}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Continue Shopping */}
                <div class="mt-4">
                  <Link href="/products/" class="inline-flex items-center gap-2 text-[#5974c3] font-bold hover:underline">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Continue Shopping
                  </Link>
                </div>
              </div>

              {/* Order Summary */}
              <div class="lg:col-span-1">
                <div class="bg-white rounded-lg border border-gray-200 p-6 sticky top-24">
                  <h2 class="font-heading font-bold text-lg text-[#042e0d] mb-4">Order Summary</h2>

                  <div class="space-y-3 text-sm border-b border-gray-200 pb-4 mb-4">
                    <div class="flex justify-between">
                      <span class="text-gray-500">Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
                      <span class="font-medium">
                        {subtotal !== null ? `$${subtotal.toFixed(2)}` : 'Call for Pricing'}
                      </span>
                    </div>
                    {hasUnpriced && subtotal !== null && (
                      <p class="text-xs text-[#c3a859]">
                        * Some items require quote for pricing
                      </p>
                    )}
                    <div class="flex justify-between">
                      <span class="text-gray-500">Shipping</span>
                      <span class="font-medium">Calculated at checkout</span>
                    </div>
                  </div>

                  <div class="flex justify-between text-lg font-heading font-bold text-[#042e0d] mb-6">
                    <span>Total</span>
                    <span>{subtotal !== null && !hasUnpriced ? `$${subtotal.toFixed(2)}` : 'Get Quote'}</span>
                  </div>

                  {subtotal !== null && !hasUnpriced && (
                    <Link
                      href="/checkout/"
                      class="block w-full bg-[#042e0d] text-white font-heading font-bold py-3 rounded text-center hover:bg-[#042e0d]/80 transition-colors"
                    >
                      Proceed to Checkout
                    </Link>
                  )}

                  {/* Help */}
                  <div class="mt-6 pt-4 border-t border-gray-200">
                    <p class="text-sm text-gray-500 mb-2">Need help with your order?</p>
                    <a href="tel:978-451-6890" class="inline-flex items-center gap-2 text-[#042e0d] font-bold text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      978-451-6890
                    </a>
                  </div>

                  <Link
                    href="/quote-request/"
                    class="block w-full bg-[#56c270] text-[#042e0d] font-heading font-bold py-3 rounded text-center hover:bg-[#042e0d] hover:text-white transition-colors mt-4"
                  >
                    Get Quote
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Shopping Cart | Solamp Solar & Energy Storage',
  meta: [
    {
      name: 'description',
      content: 'Review your shopping cart and proceed to checkout or request a quote.',
    },
  ],
};
