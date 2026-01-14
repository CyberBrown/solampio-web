/**
 * Checkout Page
 *
 * Single-page checkout with contact, shipping, and payment sections.
 * Uses Stripe Elements for secure card payments.
 */

import { component$, useSignal, useVisibleTask$, $ } from '@builder.io/qwik';
import { routeLoader$, useNavigate } from '@builder.io/qwik-city';
import type { DocumentHead } from '@builder.io/qwik-city';
import { Link } from '@builder.io/qwik-city';
import type { Stripe, StripeCardElement } from '@stripe/stripe-js';

import { useCart } from '../../hooks/useCart';
import { ContactSection } from '../../components/checkout/ContactSection';
import { ShippingSection } from '../../components/checkout/ShippingSection';
import { OrderSummary } from '../../components/checkout/OrderSummary';
import { PaymentSection } from '../../components/checkout/PaymentSection';
import {
  createPaymentIntent,
  updatePaymentIntent,
} from '../../lib/stripe';

// Load Stripe publishable key from environment
export const useCheckoutConfig = routeLoader$(async (requestEvent) => {
  const publishableKey = requestEvent.env.get('STRIPE_PUBLISHABLE_KEY');
  if (!publishableKey) {
    throw new Error('STRIPE_PUBLISHABLE_KEY not configured');
  }
  return { publishableKey };
});

export default component$(() => {
  const nav = useNavigate();
  const cart = useCart();
  const config = useCheckoutConfig();

  // Form state
  const name = useSignal('');
  const email = useSignal('');
  const phone = useSignal('');
  const addressLine1 = useSignal('');
  const addressLine2 = useSignal('');
  const city = useSignal('');
  const state = useSignal('');
  const postalCode = useSignal('');

  // Payment state
  const clientSecret = useSignal('');
  const paymentIntentId = useSignal('');
  const isLoading = useSignal(false);
  const errorMessage = useSignal('');
  const checkoutReady = useSignal(false);

  // Get cart data - compute values inline to avoid serialization issues
  const items = cart.items.value;
  const pricedItems = items.filter(item => item.price !== null);
  const subtotal = pricedItems.length > 0
    ? pricedItems.reduce((sum, item) => sum + (item.price! * item.quantity), 0)
    : 0;
  const hasUnpricedItems = items.some(item => item.price === null);

  // Initialize PaymentIntent when checkout loads
  useVisibleTask$(async () => {
    console.log('[Checkout] Starting PaymentIntent init, items:', items.length, 'subtotal:', subtotal);
    if (items.length === 0 || hasUnpricedItems) {
      console.log('[Checkout] No items or unpriced items, skipping');
      return;
    }

    // Minimum amount for Stripe is $0.50
    if (subtotal < 0.50) {
      errorMessage.value = 'Minimum order amount is $0.50';
      return;
    }

    try {
      // Create PaymentIntent with cart total
      const amountCents = Math.round(subtotal * 100);
      console.log('[Checkout] Creating PaymentIntent for', amountCents, 'cents');
      const result = await createPaymentIntent({
        amountCents,
        metadata: {
          source: 'web_checkout',
        },
      });

      console.log('[Checkout] PaymentIntent created:', result.paymentIntentId);
      clientSecret.value = result.clientSecret;
      paymentIntentId.value = result.paymentIntentId;
      checkoutReady.value = true;
      console.log('[Checkout] checkoutReady set to true');
    } catch (err: any) {
      console.error('[Checkout] Failed to initialize checkout:', err);
      // Show more specific error message
      if (err?.message?.includes('STRIPE_SECRET_KEY')) {
        errorMessage.value = 'Payment system not configured. Please contact support.';
      } else if (err?.message) {
        errorMessage.value = `Checkout error: ${err.message}`;
      } else {
        errorMessage.value = 'Failed to initialize checkout. Please try again.';
      }
    }
  });

  // Validate form
  const validateForm = $(() => {
    if (!name.value.trim()) {
      errorMessage.value = 'Please enter your name';
      return false;
    }
    if (!phone.value.trim()) {
      errorMessage.value = 'Please enter your phone number';
      return false;
    }
    if (!addressLine1.value.trim()) {
      errorMessage.value = 'Please enter your street address';
      return false;
    }
    if (!city.value.trim()) {
      errorMessage.value = 'Please enter your city';
      return false;
    }
    if (!state.value) {
      errorMessage.value = 'Please select your state';
      return false;
    }
    if (!postalCode.value.trim()) {
      errorMessage.value = 'Please enter your ZIP code';
      return false;
    }
    return true;
  });

  // Handle payment submission
  const handleSubmit = $(async (stripe: Stripe, cardElement: StripeCardElement) => {
    // Validate form first
    const isValid = await validateForm();
    if (!isValid) return;

    isLoading.value = true;
    errorMessage.value = '';

    try {
      // Update PaymentIntent with customer info
      await updatePaymentIntent(paymentIntentId.value, {
        customerEmail: email.value || undefined,
        shippingAddress: {
          name: name.value,
          line1: addressLine1.value,
          line2: addressLine2.value || undefined,
          city: city.value,
          state: state.value,
          postal_code: postalCode.value,
          country: 'US',
        },
        metadata: {
          customer_name: name.value,
          customer_phone: phone.value,
          customer_email: email.value || '',
        },
      });

      // Confirm payment with Card Element
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret.value,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: name.value,
              email: email.value || undefined,
              phone: phone.value || undefined,
              address: {
                line1: addressLine1.value,
                line2: addressLine2.value || undefined,
                city: city.value,
                state: state.value,
                postal_code: postalCode.value,
                country: 'US',
              },
            },
          },
          receipt_email: email.value || undefined,
        }
      );

      if (error) {
        if (error.type === 'card_error' || error.type === 'validation_error') {
          errorMessage.value = error.message || 'Payment failed';
        } else {
          errorMessage.value = 'An unexpected error occurred. Please try again.';
        }
      } else if (paymentIntent?.status === 'succeeded') {
        // Payment successful - redirect to confirmation
        await nav(`/checkout/confirmation/?payment_intent=${paymentIntent.id}`);
      } else if (paymentIntent?.status === 'requires_action') {
        // 3D Secure or other action required - Stripe handles this automatically
        errorMessage.value = 'Additional authentication required. Please complete the verification.';
      }
    } catch (err) {
      console.error('Payment error:', err);
      errorMessage.value = 'Payment failed. Please try again.';
    } finally {
      isLoading.value = false;
    }
  });

  // Empty cart state
  if (items.length === 0) {
    return (
      <div class="bg-[#f1f1f2] min-h-screen">
        <section class="bg-gray-600 py-8">
          <div class="container mx-auto px-4">
            <h1 class="font-heading font-extrabold text-2xl md:text-3xl text-white">
              Checkout
            </h1>
          </div>
        </section>

        <section class="py-12">
          <div class="container mx-auto px-4 max-w-lg text-center">
            <div class="bg-white rounded-lg border border-gray-200 p-8">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-16 w-16 mx-auto text-gray-300 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="1"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <h2 class="font-heading font-bold text-xl text-[#042e0d] mb-2">
                Your cart is empty
              </h2>
              <p class="text-gray-500 mb-6">
                Add some items to your cart before checking out.
              </p>
              <Link
                href="/products/"
                class="inline-flex items-center gap-2 bg-[#042e0d] text-white font-heading font-bold px-6 py-3 rounded hover:bg-[#042e0d]/80 transition-colors"
              >
                Browse Products
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Unpriced items - redirect to quote
  if (hasUnpricedItems) {
    return (
      <div class="bg-[#f1f1f2] min-h-screen">
        <section class="bg-gray-600 py-8">
          <div class="container mx-auto px-4">
            <h1 class="font-heading font-extrabold text-2xl md:text-3xl text-white">
              Checkout
            </h1>
          </div>
        </section>

        <section class="py-12">
          <div class="container mx-auto px-4 max-w-lg text-center">
            <div class="bg-white rounded-lg border border-gray-200 p-8">
              <div class="w-16 h-16 mx-auto mb-4 bg-[#c3a859]/10 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-8 w-8 text-[#c3a859]"
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
                Quote Required
              </h2>
              <p class="text-gray-500 mb-6">
                Some items in your cart require a custom quote. Please submit a
                quote request to get pricing.
              </p>
              <Link
                href="/quote-request/"
                class="inline-flex items-center gap-2 bg-[#56c270] text-[#042e0d] font-heading font-bold px-6 py-3 rounded hover:bg-[#042e0d] hover:text-white transition-colors"
              >
                Request Quote
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div class="bg-[#f1f1f2] min-h-screen">
      {/* Header */}
      <section class="bg-gray-600 py-8">
        <div class="container mx-auto px-4">
          <nav class="mb-4">
            <ol class="flex items-center gap-2 text-sm">
              <li>
                <Link
                  href="/"
                  class="text-white/70 hover:text-white transition-colors"
                >
                  Home
                </Link>
              </li>
              <li class="text-white/50">/</li>
              <li>
                <Link
                  href="/cart/"
                  class="text-white/70 hover:text-white transition-colors"
                >
                  Cart
                </Link>
              </li>
              <li class="text-white/50">/</li>
              <li class="text-white font-semibold">Checkout</li>
            </ol>
          </nav>
          <div class="flex items-center justify-between">
            <h1 class="font-heading font-extrabold text-2xl md:text-3xl text-white">
              Secure Checkout
            </h1>
            <div class="flex items-center gap-2 text-white/80 text-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
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
              <span>SSL Secured</span>
            </div>
          </div>
        </div>
      </section>

      {/* Checkout Content */}
      <section class="py-8">
        <div class="container mx-auto px-4">
          <div class="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Forms */}
            <div class="lg:col-span-2 space-y-6">
              {/* Contact Section */}
              <ContactSection email={email} phone={phone} name={name} />

              {/* Shipping Section */}
              <ShippingSection
                addressLine1={addressLine1}
                addressLine2={addressLine2}
                city={city}
                state={state}
                postalCode={postalCode}
              />

              {/* Payment Section */}
              {checkoutReady.value && clientSecret.value ? (
                <PaymentSection
                  clientSecret={clientSecret.value}
                  publishableKey={config.value.publishableKey}
                  isLoading={isLoading}
                  errorMessage={errorMessage}
                  onSubmit$={handleSubmit}
                />
              ) : errorMessage.value ? (
                <div class="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 class="font-heading font-bold text-lg text-[#042e0d] mb-4">
                    Payment
                  </h2>
                  <div class="p-4 bg-red-50 border border-red-200 rounded text-red-600 text-sm mb-4">
                    {errorMessage.value}
                  </div>
                  <p class="text-gray-500 text-sm">
                    Please contact us at{' '}
                    <a href="tel:978-451-6890" class="text-[#5974c3] font-bold">
                      978-451-6890
                    </a>{' '}
                    to complete your order.
                  </p>
                </div>
              ) : (
                <div class="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 class="font-heading font-bold text-lg text-[#042e0d] mb-4">
                    Payment
                  </h2>
                  <div class="flex items-center justify-center py-8">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#042e0d]"></div>
                    <span class="ml-3 text-gray-500">
                      Initializing secure payment...
                    </span>
                  </div>
                </div>
              )}

              {/* Back to Cart */}
              <div>
                <Link
                  href="/cart/"
                  class="inline-flex items-center gap-2 text-[#5974c3] font-bold hover:underline"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  Return to Cart
                </Link>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div class="lg:col-span-1">
              <OrderSummary items={items} subtotal={subtotal} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Checkout | Solamp Solar & Energy Storage',
  meta: [
    {
      name: 'description',
      content: 'Complete your order securely with Solamp.',
    },
    {
      name: 'robots',
      content: 'noindex, nofollow',
    },
  ],
};
