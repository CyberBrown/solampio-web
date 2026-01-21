/**
 * Payment Section with Stripe Card Element
 *
 * Uses the simpler Card Element for card payments.
 */

import {
  component$,
  useSignal,
  useVisibleTask$,
  noSerialize,
  type Signal,
  type QRL,
  type NoSerialize,
} from '@builder.io/qwik';
import { loadStripe, type Stripe, type StripeCardElement } from '@stripe/stripe-js';

interface PaymentSectionProps {
  clientSecret: string;
  publishableKey: string;
  isLoading: Signal<boolean>;
  errorMessage: Signal<string>;
  onSubmit$: QRL<(stripe: Stripe, cardElement: StripeCardElement) => Promise<void>>;
}

export const PaymentSection = component$<PaymentSectionProps>(
  ({ clientSecret, publishableKey, isLoading, errorMessage, onSubmit$ }) => {
    const cardElementRef = useSignal<HTMLDivElement>();
    const stripeReady = useSignal(false);
    const stripeInstance = useSignal<NoSerialize<Stripe> | undefined>(undefined);
    const cardElementInstance = useSignal<NoSerialize<StripeCardElement> | undefined>(undefined);

    // Initialize Stripe on mount
    useVisibleTask$(async () => {
      console.log('[PaymentSection] Starting Stripe init');
      if (!cardElementRef.value || !clientSecret) {
        console.log('[PaymentSection] Missing ref or clientSecret');
        return;
      }

      try {
        console.log('[PaymentSection] Loading Stripe...');
        const stripe = await loadStripe(publishableKey);
        if (!stripe) {
          console.error('[PaymentSection] loadStripe returned null');
          errorMessage.value = 'Failed to load payment system';
          return;
        }
        console.log('[PaymentSection] Stripe loaded successfully');

        stripeInstance.value = noSerialize(stripe);

        // Create elements without clientSecret (simpler approach)
        const elements = stripe.elements();
        console.log('[PaymentSection] Elements created');

        // Create card element with styling
        const cardElement = elements.create('card', {
          style: {
            base: {
              fontSize: '16px',
              color: '#042e0d',
              fontFamily: 'Source Sans 3, system-ui, sans-serif',
              '::placeholder': {
                color: '#9ca3af',
              },
            },
            invalid: {
              color: '#dc2626',
              iconColor: '#dc2626',
            },
          },
        });
        console.log('[PaymentSection] Card element created');

        cardElement.mount(cardElementRef.value);
        console.log('[PaymentSection] Card element mounted');

        cardElementInstance.value = noSerialize(cardElement);

        cardElement.on('ready', () => {
          console.log('[PaymentSection] Card element ready!');
          stripeReady.value = true;
        });

        cardElement.on('change', (event) => {
          if (event.error) {
            errorMessage.value = event.error.message;
          } else {
            errorMessage.value = '';
          }
        });
      } catch (err: unknown) {
        console.error('[PaymentSection] Stripe initialization error:', err);
        const message = err instanceof Error ? err.message : 'Unknown error';
        errorMessage.value = `Failed to initialize payment form: ${message}`;
      }
    });

    return (
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <h2 class="font-heading font-bold text-lg text-[#042e0d] mb-4">
          Payment
        </h2>

        {/* Stripe Card Element Container */}
        <div class="mb-6">
          <label class="block text-sm font-bold text-[#042e0d] mb-2">
            Card Details
          </label>
          {!stripeReady.value && (
            <div class="flex items-center justify-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#042e0d]"></div>
              <span class="ml-3 text-gray-500">Loading payment form...</span>
            </div>
          )}
          <div
            ref={cardElementRef}
            class={`border border-gray-300 rounded px-4 py-3 ${stripeReady.value ? '' : 'hidden'}`}
          />
        </div>

        {/* Error Message */}
        {errorMessage.value && (
          <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
            {errorMessage.value}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="button"
          disabled={!stripeReady.value || isLoading.value}
          onClick$={async () => {
            if (stripeInstance.value && cardElementInstance.value) {
              await onSubmit$(stripeInstance.value, cardElementInstance.value);
            }
          }}
          class={`
            w-full py-4 rounded font-heading font-bold text-lg transition-colors
            ${
              stripeReady.value && !isLoading.value
                ? 'bg-[#56c270] text-[#042e0d] hover:bg-[#042e0d] hover:text-white cursor-pointer'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {isLoading.value ? (
            <span class="flex items-center justify-center gap-2">
              <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
              Processing...
            </span>
          ) : (
            'Place Order'
          )}
        </button>

        {/* Terms */}
        <p class="text-xs text-gray-500 mt-4 text-center">
          By placing your order, you agree to our{' '}
          <a href="/terms/" class="text-[#5974c3] hover:underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy/" class="text-[#5974c3] hover:underline">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    );
  }
);
