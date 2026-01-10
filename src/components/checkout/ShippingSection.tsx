/**
 * Shipping Address Section for Checkout
 */

import { component$ } from '@builder.io/qwik';
import type { Signal } from '@builder.io/qwik';

interface ShippingSectionProps {
  addressLine1: Signal<string>;
  addressLine2: Signal<string>;
  city: Signal<string>;
  state: Signal<string>;
  postalCode: Signal<string>;
}

// US States for dropdown
const US_STATES = [
  { value: '', label: 'Select State' },
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
];

export const ShippingSection = component$<ShippingSectionProps>(
  ({ addressLine1, addressLine2, city, state, postalCode }) => {
    return (
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <h2 class="font-heading font-bold text-lg text-[#042e0d] mb-4">
          Shipping Address
        </h2>

        <div class="space-y-4">
          {/* Address Line 1 */}
          <div>
            <label
              for="address1"
              class="block text-sm font-bold text-[#042e0d] mb-1"
            >
              Street Address <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="address1"
              name="address1"
              required
              value={addressLine1.value}
              onInput$={(e) =>
                (addressLine1.value = (e.target as HTMLInputElement).value)
              }
              class="w-full border border-gray-300 px-4 py-3 rounded focus:outline-none focus:border-[#042e0d] transition-colors"
              placeholder="123 Main Street"
            />
          </div>

          {/* Address Line 2 */}
          <div>
            <label
              for="address2"
              class="block text-sm font-bold text-[#042e0d] mb-1"
            >
              Apt, Suite, Unit
              <span class="text-gray-400 font-normal ml-1">(optional)</span>
            </label>
            <input
              type="text"
              id="address2"
              name="address2"
              value={addressLine2.value}
              onInput$={(e) =>
                (addressLine2.value = (e.target as HTMLInputElement).value)
              }
              class="w-full border border-gray-300 px-4 py-3 rounded focus:outline-none focus:border-[#042e0d] transition-colors"
              placeholder="Apt 4B"
            />
          </div>

          {/* City */}
          <div>
            <label
              for="city"
              class="block text-sm font-bold text-[#042e0d] mb-1"
            >
              City <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="city"
              name="city"
              required
              value={city.value}
              onInput$={(e) =>
                (city.value = (e.target as HTMLInputElement).value)
              }
              class="w-full border border-gray-300 px-4 py-3 rounded focus:outline-none focus:border-[#042e0d] transition-colors"
              placeholder="Boston"
            />
          </div>

          {/* State and ZIP Row */}
          <div class="grid grid-cols-2 gap-4">
            {/* State */}
            <div>
              <label
                for="state"
                class="block text-sm font-bold text-[#042e0d] mb-1"
              >
                State <span class="text-red-500">*</span>
              </label>
              <select
                id="state"
                name="state"
                required
                value={state.value}
                onChange$={(e) =>
                  (state.value = (e.target as HTMLSelectElement).value)
                }
                class="w-full border border-gray-300 px-4 py-3 rounded focus:outline-none focus:border-[#042e0d] transition-colors bg-white"
              >
                {US_STATES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* ZIP Code */}
            <div>
              <label
                for="postalCode"
                class="block text-sm font-bold text-[#042e0d] mb-1"
              >
                ZIP Code <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="postalCode"
                name="postalCode"
                required
                value={postalCode.value}
                onInput$={(e) =>
                  (postalCode.value = (e.target as HTMLInputElement).value)
                }
                class="w-full border border-gray-300 px-4 py-3 rounded focus:outline-none focus:border-[#042e0d] transition-colors"
                placeholder="02101"
                pattern="[0-9]{5}(-[0-9]{4})?"
              />
            </div>
          </div>

          {/* Country (fixed to US for now) */}
          <div>
            <label class="block text-sm font-bold text-[#042e0d] mb-1">
              Country
            </label>
            <div class="border border-gray-200 bg-gray-50 px-4 py-3 rounded text-gray-600">
              United States
            </div>
          </div>
        </div>
      </div>
    );
  }
);
