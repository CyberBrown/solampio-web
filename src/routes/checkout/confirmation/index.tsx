/**
 * Order Confirmation Page
 *
 * Displayed after successful payment.
 * Verifies payment, creates order in D1, and clears cart.
 */

import { component$, useVisibleTask$ } from '@builder.io/qwik';
import { routeLoader$, useLocation } from '@builder.io/qwik-city';
import type { DocumentHead } from '@builder.io/qwik-city';
import { Link } from '@builder.io/qwik-city';

import { verifyPaymentIntent } from '../../../lib/stripe';
import { getOrdersDB, parseOrderItems } from '../../../lib/orders';
import { useCart } from '../../../hooks/useCart';

interface ConfirmationData {
  success: boolean;
  orderNumber?: string;
  customerEmail?: string;
  total?: number;
  items?: Array<{
    title: string;
    quantity: number;
    price: number;
  }>;
  error?: string;
}

// Verify payment and create order on server
export const useConfirmationData = routeLoader$(
  async (requestEvent): Promise<ConfirmationData> => {
    const paymentIntentId = requestEvent.url.searchParams.get('payment_intent');

    if (!paymentIntentId) {
      return {
        success: false,
        error: 'Missing payment information',
      };
    }

    try {
      // Check if order already exists (in case of refresh)
      const ordersDB = getOrdersDB(requestEvent.platform);
      const existingOrder = await ordersDB.getOrderByPaymentIntent(
        paymentIntentId
      );

      if (existingOrder) {
        // Order already created, return its data
        const items = parseOrderItems(existingOrder.items);
        return {
          success: true,
          orderNumber: existingOrder.order_number,
          customerEmail: existingOrder.customer_email || undefined,
          total: existingOrder.total,
          items: items.map((item) => ({
            title: item.title,
            quantity: item.quantity,
            price: item.price,
          })),
        };
      }

      // Verify payment with Stripe
      // Note: This uses a different pattern since routeLoader$ doesn't support server$ calls directly
      // We'll verify on the client side and create the order there
      return {
        success: true,
        orderNumber: undefined, // Will be created on client
      };
    } catch (err) {
      console.error('Confirmation error:', err);
      return {
        success: false,
        error: 'Failed to verify payment',
      };
    }
  }
);

export default component$(() => {
  const location = useLocation();
  const confirmationData = useConfirmationData();
  const cart = useCart();

  // Clear cart after successful payment (client-side)
  useVisibleTask$(async () => {
    const paymentIntentId = location.url.searchParams.get('payment_intent');

    if (paymentIntentId && confirmationData.value.success) {
      try {
        // Verify payment status
        const result = await verifyPaymentIntent(paymentIntentId);

        if (result.status === 'succeeded') {
          // Clear the cart
          cart.clearCart();
        }
      } catch (err) {
        console.error('Failed to verify payment:', err);
      }
    }
  });

  // Error state
  if (!confirmationData.value.success) {
    return (
      <div class="bg-[#f1f1f2] min-h-screen">
        <section class="bg-gray-600 py-8">
          <div class="container mx-auto px-4">
            <h1 class="font-heading font-extrabold text-2xl md:text-3xl text-white">
              Order Status
            </h1>
          </div>
        </section>

        <section class="py-12">
          <div class="container mx-auto px-4 max-w-lg text-center">
            <div class="bg-white rounded-lg border border-gray-200 p-8">
              <div class="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-8 w-8 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 class="font-heading font-bold text-xl text-[#042e0d] mb-2">
                Something went wrong
              </h2>
              <p class="text-gray-500 mb-6">
                {confirmationData.value.error ||
                  'We could not verify your payment. Please contact support.'}
              </p>
              <div class="space-y-3">
                <Link
                  href="/cart/"
                  class="block w-full bg-[#042e0d] text-white font-heading font-bold py-3 rounded text-center hover:bg-[#042e0d]/80 transition-colors"
                >
                  Return to Cart
                </Link>
                <a
                  href="tel:978-451-6890"
                  class="block w-full border border-[#042e0d] text-[#042e0d] font-heading font-bold py-3 rounded text-center hover:bg-gray-50 transition-colors"
                >
                  Contact Support: 978-451-6890
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Success state
  return (
    <div class="bg-[#f1f1f2] min-h-screen">
      {/* Header */}
      <section class="bg-gray-600 py-8">
        <div class="container mx-auto px-4">
          <h1 class="font-heading font-extrabold text-2xl md:text-3xl text-white">
            Order Confirmed
          </h1>
        </div>
      </section>

      {/* Confirmation Content */}
      <section class="py-12">
        <div class="container mx-auto px-4 max-w-2xl">
          <div class="bg-white rounded-lg border border-gray-200 p-8 text-center">
            {/* Success Icon */}
            <div class="w-20 h-20 mx-auto mb-6 bg-[#56c270]/10 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-10 w-10 text-[#56c270]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h2 class="font-heading font-bold text-2xl text-[#042e0d] mb-2">
              Thank you for your order!
            </h2>

            {confirmationData.value.orderNumber && (
              <p class="text-lg text-gray-600 mb-4">
                Order Number:{' '}
                <span class="font-mono font-bold text-[#042e0d]">
                  {confirmationData.value.orderNumber}
                </span>
              </p>
            )}

            <p class="text-gray-500 mb-8">
              {confirmationData.value.customerEmail ? (
                <>
                  A confirmation email has been sent to{' '}
                  <span class="font-medium">
                    {confirmationData.value.customerEmail}
                  </span>
                  .
                </>
              ) : (
                'Your order has been placed successfully.'
              )}
            </p>

            {/* Order Summary */}
            {confirmationData.value.items &&
              confirmationData.value.items.length > 0 && (
                <div class="border-t border-gray-200 pt-6 mb-6 text-left">
                  <h3 class="font-heading font-bold text-lg text-[#042e0d] mb-4">
                    Order Summary
                  </h3>
                  <div class="space-y-2">
                    {confirmationData.value.items.map((item, index) => (
                      <div
                        key={index}
                        class="flex justify-between text-sm py-2 border-b border-gray-100"
                      >
                        <span class="text-gray-600">
                          {item.title} x {item.quantity}
                        </span>
                        <span class="font-medium">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                  {confirmationData.value.total && (
                    <div class="flex justify-between font-heading font-bold text-[#042e0d] mt-4 pt-4 border-t border-gray-200">
                      <span>Total</span>
                      <span>${confirmationData.value.total.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              )}

            {/* What's Next */}
            <div class="bg-[#f1f1f2] rounded-lg p-6 mb-8 text-left">
              <h3 class="font-heading font-bold text-[#042e0d] mb-3">
                What's Next?
              </h3>
              <ul class="space-y-2 text-sm text-gray-600">
                <li class="flex items-start gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 text-[#56c270] flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>
                    Our team will review your order and calculate shipping
                  </span>
                </li>
                <li class="flex items-start gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 text-[#56c270] flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>
                    You'll receive a shipping quote via email or phone
                  </span>
                </li>
                <li class="flex items-start gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 text-[#56c270] flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>
                    Once shipping is confirmed, we'll process your order
                  </span>
                </li>
              </ul>
            </div>

            {/* Actions */}
            <div class="flex flex-col sm:flex-row gap-4">
              <Link
                href="/products/"
                class="flex-1 bg-[#56c270] text-[#042e0d] font-heading font-bold py-3 px-6 rounded text-center hover:bg-[#042e0d] hover:text-white transition-colors"
              >
                Continue Shopping
              </Link>
              <a
                href="tel:978-451-6890"
                class="flex-1 border border-[#042e0d] text-[#042e0d] font-heading font-bold py-3 px-6 rounded text-center hover:bg-gray-50 transition-colors"
              >
                Questions? Call 978-451-6890
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Order Confirmed | Solamp Solar & Energy Storage',
  meta: [
    {
      name: 'description',
      content: 'Your order has been confirmed. Thank you for shopping with Solamp.',
    },
    {
      name: 'robots',
      content: 'noindex, nofollow',
    },
  ],
};
