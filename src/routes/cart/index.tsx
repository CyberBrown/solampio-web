import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { Link } from '@builder.io/qwik-city';

// Sample cart items - will be managed via localStorage/context
const cartItems = [
  {
    id: '1',
    name: 'Sol-Ark 15K-2P Hybrid Inverter',
    sku: 'SA-15K-2P',
    price: 'Call for Pricing',
    quantity: 1,
    image: null,
    stock: 'In Stock',
  },
  {
    id: '2',
    name: 'Fortress Power eFlex 5.4',
    sku: 'FP-EFLEX-54',
    price: 'Call for Pricing',
    quantity: 2,
    image: null,
    stock: 'In Stock',
  },
  {
    id: '3',
    name: 'MidNite Classic 150',
    sku: 'MN-CL150',
    price: 'Call for Pricing',
    quantity: 1,
    image: null,
    stock: 'Low Stock',
  },
];

export default component$(() => {
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
          <div class="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div class="lg:col-span-2">
              <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div class="p-4 border-b border-gray-200">
                  <p class="font-heading font-bold text-[#042e0d]">{cartItems.length} items in cart</p>
                </div>
                <div class="divide-y divide-gray-100">
                  {cartItems.map((item) => (
                    <div key={item.id} class="p-4 flex gap-4">
                      <div class="w-20 h-20 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="0.5">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div class="flex-1">
                        <div class="flex justify-between items-start">
                          <div>
                            <Link href={`/products/${item.id}/`} class="font-heading font-bold text-[#042e0d] hover:text-[#5974c3] transition-colors">
                              {item.name}
                            </Link>
                            <p class="text-sm text-gray-500 mt-1">SKU: {item.sku}</p>
                            <span class={`inline-block text-xs font-bold px-2 py-0.5 rounded mt-2 ${
                              item.stock === 'In Stock' ? 'bg-[#56c270]/10 text-[#042e0d]' : 'bg-[#c3a859]/10 text-[#c3a859]'
                            }`}>
                              {item.stock}
                            </span>
                          </div>
                          <button class="text-gray-400 hover:text-red-500 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                        <div class="flex items-center justify-between mt-4">
                          <div class="flex items-center gap-2">
                            <button class="w-8 h-8 bg-gray-100 rounded flex items-center justify-center hover:bg-gray-200 transition-colors">
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M20 12H4" />
                              </svg>
                            </button>
                            <span class="w-10 text-center font-bold">{item.quantity}</span>
                            <button class="w-8 h-8 bg-gray-100 rounded flex items-center justify-center hover:bg-gray-200 transition-colors">
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                          </div>
                          <p class="font-heading font-bold text-[#042e0d]">{item.price}</p>
                        </div>
                      </div>
                    </div>
                  ))}
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
                    <span class="text-gray-500">Subtotal ({cartItems.length} items)</span>
                    <span class="font-medium">Call for Pricing</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">Shipping</span>
                    <span class="font-medium">Calculated at checkout</span>
                  </div>
                </div>

                <div class="flex justify-between text-lg font-heading font-bold text-[#042e0d] mb-6">
                  <span>Total</span>
                  <span>Call for Quote</span>
                </div>

                <Link
                  href="/quote-request/"
                  class="block w-full bg-[#56c270] text-[#042e0d] font-heading font-bold py-3 rounded text-center hover:bg-[#042e0d] hover:text-white transition-colors mb-3"
                >
                  Request Quote
                </Link>

                <Link
                  href="/checkout/"
                  class="block w-full bg-[#042e0d] text-white font-heading font-bold py-3 rounded text-center hover:bg-[#042e0d]/80 transition-colors mb-4"
                >
                  Proceed to Checkout
                </Link>

                <div class="text-center">
                  <button class="text-[#5974c3] text-sm font-bold hover:underline">
                    Save Cart for Later
                  </button>
                </div>

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
              </div>
            </div>
          </div>
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
