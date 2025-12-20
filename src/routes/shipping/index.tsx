import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { BasePage } from '../../components/BasePage';

export default component$(() => {
  return (
    <BasePage
      title="Shipping Information"
      subtitle="Delivery options, transit times, and shipping policies."
      breadcrumbs={[{ label: 'Shipping' }]}
    >
      <h2>Shipping Methods</h2>
      <p>
        We offer multiple shipping options to meet your project timelines. Most orders ship within 1-2 business days of order confirmation.
      </p>

      <div class="not-prose my-6">
        <div class="bg-[#f1f1f2] border border-gray-200 rounded-lg overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-[#042e0d] text-white">
              <tr>
                <th class="px-4 py-3 text-left font-heading">Method</th>
                <th class="px-4 py-3 text-left font-heading">Transit Time</th>
                <th class="px-4 py-3 text-left font-heading">Notes</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr>
                <td class="px-4 py-3 font-medium">Ground Freight</td>
                <td class="px-4 py-3">3-7 business days</td>
                <td class="px-4 py-3 text-gray-500">Most economical for heavy items</td>
              </tr>
              <tr>
                <td class="px-4 py-3 font-medium">UPS/FedEx Ground</td>
                <td class="px-4 py-3">3-5 business days</td>
                <td class="px-4 py-3 text-gray-500">Small packages and accessories</td>
              </tr>
              <tr>
                <td class="px-4 py-3 font-medium">Express</td>
                <td class="px-4 py-3">1-2 business days</td>
                <td class="px-4 py-3 text-gray-500">Additional charges apply</td>
              </tr>
              <tr>
                <td class="px-4 py-3 font-medium">Will Call</td>
                <td class="px-4 py-3">Same day</td>
                <td class="px-4 py-3 text-gray-500">Pick up at our facility</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <h2>Freight Shipments</h2>
      <p>
        Large items such as solar panels, inverters, and battery systems ship via freight carrier. Residential deliveries may require liftgate service (additional charge).
      </p>
      <ul>
        <li>Inspect all shipments upon delivery</li>
        <li>Note any damage on the delivery receipt</li>
        <li>Take photos of damaged packaging before opening</li>
        <li>Report damage within 24 hours</li>
      </ul>

      <h2>Free Shipping</h2>
      <p>
        Free ground shipping is available on orders over $2,500 to commercial addresses in the continental US. Some exclusions apply for oversized or hazardous items.
      </p>

      <h2>Alaska, Hawaii, and International</h2>
      <p>
        We ship to Alaska, Hawaii, and international destinations. Contact us for shipping quotes to these locations.
      </p>

      <h2>Order Tracking</h2>
      <p>
        Tracking information is provided via email once your order ships. You can also view tracking in your <a href="/account/orders/">account dashboard</a>.
      </p>

      <div class="bg-[#f1f1f2] border border-gray-200 rounded-lg p-6 mt-8 not-prose">
        <p class="text-sm text-gray-500 italic">
          Shipping rates and times are estimates. Actual rates calculated at checkout. Contact us for expedited options.
        </p>
      </div>
    </BasePage>
  );
});

export const head: DocumentHead = {
  title: 'Shipping Information | Solamp Solar & Energy Storage',
  meta: [
    {
      name: 'description',
      content: 'Shipping options, transit times, and delivery policies for Solamp Solar & Energy Storage orders.',
    },
  ],
};
