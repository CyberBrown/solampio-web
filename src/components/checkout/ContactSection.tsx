/**
 * Contact Information Section for Checkout
 */

import { component$ } from '@builder.io/qwik';
import type { Signal } from '@builder.io/qwik';

interface ContactSectionProps {
  email: Signal<string>;
  phone: Signal<string>;
  name: Signal<string>;
}

export const ContactSection = component$<ContactSectionProps>(
  ({ email, phone, name }) => {
    return (
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <h2 class="font-heading font-bold text-lg text-[#042e0d] mb-4">
          Contact Information
        </h2>

        <div class="space-y-4">
          {/* Full Name */}
          <div>
            <label
              for="name"
              class="block text-sm font-bold text-[#042e0d] mb-1"
            >
              Full Name <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={name.value}
              onInput$={(e) =>
                (name.value = (e.target as HTMLInputElement).value)
              }
              class="w-full border border-gray-300 px-4 py-3 rounded focus:outline-none focus:border-[#042e0d] transition-colors"
              placeholder="John Smith"
            />
          </div>

          {/* Email */}
          <div>
            <label
              for="email"
              class="block text-sm font-bold text-[#042e0d] mb-1"
            >
              Email Address
              <span class="text-gray-400 font-normal ml-1">(optional)</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email.value}
              onInput$={(e) =>
                (email.value = (e.target as HTMLInputElement).value)
              }
              class="w-full border border-gray-300 px-4 py-3 rounded focus:outline-none focus:border-[#042e0d] transition-colors"
              placeholder="john@example.com"
            />
            <p class="text-xs text-gray-500 mt-1">
              For order confirmation and updates
            </p>
          </div>

          {/* Phone */}
          <div>
            <label
              for="phone"
              class="block text-sm font-bold text-[#042e0d] mb-1"
            >
              Phone Number <span class="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              required
              value={phone.value}
              onInput$={(e) =>
                (phone.value = (e.target as HTMLInputElement).value)
              }
              class="w-full border border-gray-300 px-4 py-3 rounded focus:outline-none focus:border-[#042e0d] transition-colors"
              placeholder="(555) 123-4567"
            />
            <p class="text-xs text-gray-500 mt-1">
              Required for shipping coordination
            </p>
          </div>
        </div>
      </div>
    );
  }
);
