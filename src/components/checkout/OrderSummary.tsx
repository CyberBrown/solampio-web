/**
 * Order Summary Sidebar for Checkout
 *
 * Displays cart items and totals with sticky positioning.
 */

import { component$ } from '@builder.io/qwik';
import type { CartItem } from '../../context/cart-context';

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
}

export const OrderSummary = component$<OrderSummaryProps>(
  ({ items, subtotal }) => {
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
      <div class="bg-white rounded-lg border border-gray-200 p-6 sticky top-24">
        <h2 class="font-heading font-bold text-lg text-[#042e0d] mb-4">
          Order Summary
        </h2>

        {/* Items List */}
        <div class="space-y-3 max-h-64 overflow-y-auto mb-4">
          {items.map((item) => (
            <div key={item.id} class="flex gap-3">
              {/* Thumbnail */}
              <div class="w-12 h-12 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                {item.thumbnail_url ? (
                  <img
                    src={item.thumbnail_url}
                    alt={item.title}
                    class="w-full h-full object-contain"
                    width={48}
                    height={48}
                  />
                ) : (
                  <div class="w-full h-full flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-6 w-6 text-gray-300"
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
                  </div>
                )}
              </div>

              {/* Item Info */}
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-[#042e0d] truncate">
                  {item.title}
                </p>
                <p class="text-xs text-gray-500">Qty: {item.quantity}</p>
              </div>

              {/* Price */}
              <div class="text-sm font-medium text-[#042e0d]">
                ${((item.price || 0) * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div class="border-t border-gray-200 pt-4 space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">
              Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})
            </span>
            <span class="font-medium">${subtotal.toFixed(2)}</span>
          </div>

          <div class="flex justify-between text-sm">
            <span class="text-gray-500">Shipping</span>
            <span class="text-[#56c270] font-medium">FREE</span>
          </div>

          <div class="flex justify-between text-sm">
            <span class="text-gray-500">Tax</span>
            <span class="text-gray-500">Calculated at checkout</span>
          </div>
        </div>

        {/* Total */}
        <div class="border-t border-gray-200 mt-4 pt-4">
          <div class="flex justify-between text-lg font-heading font-bold text-[#042e0d]">
            <span>Total</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <p class="text-xs text-[#56c270] mt-1 font-medium">
            Free shipping included
          </p>
        </div>

        {/* Security Badge */}
        <div class="mt-6 pt-4 border-t border-gray-200">
          <div class="flex items-center gap-2 text-sm text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 text-[#56c270]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <span>Secure checkout powered by Stripe</span>
          </div>
        </div>
      </div>
    );
  }
);
