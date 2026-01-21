/**
 * Shipping Method Selector for Checkout
 *
 * Fetches available shipping methods based on cart items and destination,
 * then allows user to select their preferred shipping method.
 */

import { component$, useSignal, useVisibleTask$, $ } from '@builder.io/qwik';
import type { Signal } from '@builder.io/qwik';

export interface ShippingMethod {
  method: string;
  carrier: string;
  service: string;
  rate: number;
  transit_days: number | null;
  delivery_date?: string;
  guaranteed?: boolean;
}

interface ShippingMethodSelectorProps {
  cartItems: Array<{ id: string; quantity: number }>;
  postalCode: Signal<string>;
  city: Signal<string>;
  state: Signal<string>;
  addressLine1: Signal<string>;
  selectedMethod: Signal<ShippingMethod | null>;
  onShippingChange$: (method: ShippingMethod | null) => void;
}

export const ShippingMethodSelector = component$<ShippingMethodSelectorProps>(
  ({ cartItems, postalCode, city, state, addressLine1, selectedMethod, onShippingChange$ }) => {
    const isLoading = useSignal(false);
    const errorMessage = useSignal('');
    const shippingMethods = useSignal<ShippingMethod[]>([]);
    const lastFetchedZip = useSignal('');
    const isResidential = useSignal(true);

    // Fetch shipping rates when ZIP code is complete
    const fetchRates = $(async () => {
      const zip = postalCode.value.trim();

      // Validate ZIP format
      if (!/^\d{5}(-\d{4})?$/.test(zip)) {
        return;
      }

      // Skip if we already fetched for this ZIP
      if (zip === lastFetchedZip.value && shippingMethods.value.length > 0) {
        return;
      }

      isLoading.value = true;
      errorMessage.value = '';
      shippingMethods.value = [];
      selectedMethod.value = null;
      onShippingChange$(null);

      try {
        const response = await fetch('/api/shipping/cart-rates/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: cartItems.map(item => ({
              product_id: item.id,
              quantity: item.quantity,
            })),
            destination_zip: zip,
            destination_city: city.value || undefined,
            destination_state: state.value || undefined,
            destination_address: addressLine1.value || undefined,
            residential: isResidential.value,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to get shipping rates');
        }

        shippingMethods.value = data.shipping_methods || [];
        lastFetchedZip.value = zip;

        // Auto-select cheapest non-pickup option, or pickup if it's the only option
        if (shippingMethods.value.length > 0) {
          const defaultMethod = shippingMethods.value.find(m => m.method !== 'pickup')
            || shippingMethods.value[0];
          selectedMethod.value = defaultMethod;
          onShippingChange$(defaultMethod);
        }
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Failed to get shipping rates';
        errorMessage.value = msg;
        console.error('Shipping rate error:', error);
      } finally {
        isLoading.value = false;
      }
    });

    // Watch for ZIP code changes
    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(({ track }) => {
      const zip = track(() => postalCode.value);

      // Only fetch when we have a valid 5-digit ZIP
      if (/^\d{5}$/.test(zip.trim())) {
        // Debounce the fetch
        const timer = setTimeout(() => {
          fetchRates();
        }, 500);
        return () => clearTimeout(timer);
      }
    });

    // Handle method selection
    const selectMethod = $((method: ShippingMethod) => {
      selectedMethod.value = method;
      onShippingChange$(method);
    });

    // Format transit time display
    const formatTransitTime = (days: number | null, guaranteed?: boolean): string => {
      if (days === null || days === undefined) return 'Varies';
      if (days === 0) return 'Same day';
      if (days === 1) return guaranteed ? '1 business day (guaranteed)' : '1 business day';
      return guaranteed ? `${days} business days (guaranteed)` : `${days} business days`;
    };

    // If no ZIP entered yet, show prompt
    if (!postalCode.value || postalCode.value.length < 5) {
      return (
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <h2 class="font-heading font-bold text-lg text-[#042e0d] mb-4">
            Shipping Method
          </h2>
          <div class="bg-[#f1f1f2] rounded-lg p-4 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-8 w-8 mx-auto text-gray-400 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <p class="text-gray-500 text-sm">
              Enter your ZIP code above to see shipping options
            </p>
          </div>
        </div>
      );
    }

    return (
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-heading font-bold text-lg text-[#042e0d]">
            Shipping Method
          </h2>
          {lastFetchedZip.value && (
            <button
              type="button"
              onClick$={fetchRates}
              class="text-sm text-[#5974c3] hover:underline"
              disabled={isLoading.value}
            >
              Refresh rates
            </button>
          )}
        </div>

        {/* Residential toggle */}
        <div class="mb-4">
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isResidential.value}
              onChange$={(e) => {
                isResidential.value = (e.target as HTMLInputElement).checked;
                // Re-fetch rates with new residential setting
                lastFetchedZip.value = '';
                fetchRates();
              }}
              class="w-4 h-4 text-[#042e0d] rounded"
            />
            <span class="text-sm text-gray-600">This is a residential address</span>
          </label>
        </div>

        {/* Loading state */}
        {isLoading.value && (
          <div class="flex items-center justify-center py-8">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-[#042e0d]"></div>
            <span class="ml-3 text-gray-500 text-sm">Calculating shipping rates...</span>
          </div>
        )}

        {/* Error state */}
        {errorMessage.value && !isLoading.value && (
          <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p class="text-red-600 text-sm">{errorMessage.value}</p>
            <button
              type="button"
              onClick$={fetchRates}
              class="mt-2 text-sm text-[#5974c3] hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Shipping methods list */}
        {!isLoading.value && shippingMethods.value.length > 0 && (
          <div class="space-y-3">
            {shippingMethods.value.map((method) => (
              <label
                key={method.method}
                class={`
                  flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors
                  ${selectedMethod.value?.method === method.method
                    ? 'border-[#042e0d] bg-[#042e0d]/5'
                    : 'border-gray-200 hover:border-[#042e0d]/50'
                  }
                `}
              >
                <input
                  type="radio"
                  name="shippingMethod"
                  value={method.method}
                  checked={selectedMethod.value?.method === method.method}
                  onChange$={() => selectMethod(method)}
                  class="mt-1 w-4 h-4 text-[#042e0d]"
                />
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-[#042e0d]">{method.carrier}</span>
                    {method.method === 'pickup' && (
                      <span class="px-2 py-0.5 bg-[#56c270]/20 text-[#042e0d] text-xs rounded-full font-medium">
                        Free
                      </span>
                    )}
                    {method.guaranteed && method.method !== 'pickup' && (
                      <span class="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                        Guaranteed
                      </span>
                    )}
                  </div>
                  <p class="text-sm text-gray-600">{method.service}</p>
                  <p class="text-xs text-gray-400 mt-1">
                    {formatTransitTime(method.transit_days, method.guaranteed)}
                  </p>
                </div>
                <div class="text-right">
                  <span class={`font-bold ${method.rate === 0 ? 'text-[#56c270]' : 'text-[#042e0d]'}`}>
                    {method.rate === 0 ? 'FREE' : `$${method.rate.toFixed(2)}`}
                  </span>
                </div>
              </label>
            ))}
          </div>
        )}

        {/* No methods available */}
        {!isLoading.value && !errorMessage.value && shippingMethods.value.length === 0 && lastFetchedZip.value && (
          <div class="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p class="text-amber-700 text-sm">
              No shipping options available for this destination. Please contact us for a custom shipping quote.
            </p>
            <a
              href="tel:978-451-6890"
              class="inline-flex items-center gap-2 mt-2 text-sm text-[#5974c3] hover:underline"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call 978-451-6890
            </a>
          </div>
        )}

        {/* Free shipping note */}
        {!isResidential.value && (
          <p class="text-xs text-[#56c270] mt-4">
            Free shipping on orders over $2,500 to commercial addresses
          </p>
        )}
      </div>
    );
  }
);
