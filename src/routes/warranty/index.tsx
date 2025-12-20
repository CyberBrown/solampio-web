import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { BasePage } from '../../components/BasePage';

export default component$(() => {
  return (
    <BasePage
      title="Warranty Information"
      subtitle="Manufacturer warranty coverage for solar equipment."
      breadcrumbs={[{ label: 'Warranty' }]}
    >
      <h2>Manufacturer Warranties</h2>
      <p>
        All products sold by Solamp are covered by the original manufacturer's warranty. Warranty terms and coverage vary by manufacturer and product type.
      </p>

      <h2>Common Warranty Periods</h2>
      <div class="not-prose my-6">
        <div class="bg-[#f1f1f2] border border-gray-200 rounded-lg overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-[#042e0d] text-white">
              <tr>
                <th class="px-4 py-3 text-left font-heading">Product Type</th>
                <th class="px-4 py-3 text-left font-heading">Typical Warranty</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr>
                <td class="px-4 py-3 font-medium">Solar Panels</td>
                <td class="px-4 py-3">25-30 year performance, 10-12 year product</td>
              </tr>
              <tr>
                <td class="px-4 py-3 font-medium">Inverters</td>
                <td class="px-4 py-3">5-12 years (extendable)</td>
              </tr>
              <tr>
                <td class="px-4 py-3 font-medium">Batteries</td>
                <td class="px-4 py-3">10 years or cycle-based</td>
              </tr>
              <tr>
                <td class="px-4 py-3 font-medium">Charge Controllers</td>
                <td class="px-4 py-3">5-10 years</td>
              </tr>
              <tr>
                <td class="px-4 py-3 font-medium">Mounting Equipment</td>
                <td class="px-4 py-3">10-25 years</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <h2>Filing a Warranty Claim</h2>
      <ol>
        <li>Document the issue with photos and description</li>
        <li>Gather proof of purchase (invoice or order number)</li>
        <li>Contact us with product details and serial number</li>
        <li>We coordinate with the manufacturer on your behalf</li>
        <li>Replacement or repair arranged per warranty terms</li>
      </ol>

      <h2>What's Not Covered</h2>
      <ul>
        <li>Damage from improper installation</li>
        <li>Physical damage (drops, impacts, weather events)</li>
        <li>Unauthorized modifications</li>
        <li>Normal wear and tear</li>
        <li>Cosmetic damage that doesn't affect performance</li>
      </ul>

      <h2>Extended Warranties</h2>
      <p>
        Many manufacturers offer extended warranty options. Contact us before installation to add extended coverage to eligible products.
      </p>

      <h2>Solamp Support</h2>
      <p>
        As an authorized distributor, we provide warranty support and coordination with manufacturers. Our technical team can help diagnose issues and expedite warranty claims.
      </p>

      <div class="not-prose my-6 p-6 bg-[#56c270]/10 border border-[#56c270] rounded-lg">
        <p class="font-bold text-[#042e0d] mb-2">Need warranty assistance?</p>
        <p class="text-sm text-gray-600 mb-3">Our team is here to help with warranty claims and technical support.</p>
        <a href="tel:978-451-6890" class="inline-flex items-center gap-2 text-[#042e0d] font-bold">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          Call 978-451-6890
        </a>
      </div>
    </BasePage>
  );
});

export const head: DocumentHead = {
  title: 'Warranty Information | Solamp Solar & Energy Storage',
  meta: [
    {
      name: 'description',
      content: 'Warranty information and support for solar equipment from Solamp Solar & Energy Storage.',
    },
  ],
};
