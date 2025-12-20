import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { BasePage } from '../../components/BasePage';

export default component$(() => {
  return (
    <BasePage
      title="Returns Policy"
      subtitle="Our return and exchange policies for solar equipment."
      breadcrumbs={[{ label: 'Returns' }]}
    >
      <h2>Return Eligibility</h2>
      <p>
        Most products may be returned within 30 days of delivery if they are unused, in original packaging, and in resalable condition. Some restrictions apply.
      </p>

      <h2>Non-Returnable Items</h2>
      <ul>
        <li>Custom or special order products</li>
        <li>Products that have been installed or used</li>
        <li>Products with damaged or missing packaging</li>
        <li>Clearance or final sale items</li>
        <li>Products returned after 30 days</li>
      </ul>

      <h2>Restocking Fees</h2>
      <div class="not-prose my-6">
        <div class="bg-[#f1f1f2] border border-gray-200 rounded-lg overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-[#042e0d] text-white">
              <tr>
                <th class="px-4 py-3 text-left font-heading">Return Timeframe</th>
                <th class="px-4 py-3 text-left font-heading">Restocking Fee</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr>
                <td class="px-4 py-3">Within 14 days</td>
                <td class="px-4 py-3">15%</td>
              </tr>
              <tr>
                <td class="px-4 py-3">15-30 days</td>
                <td class="px-4 py-3">25%</td>
              </tr>
              <tr>
                <td class="px-4 py-3">After 30 days</td>
                <td class="px-4 py-3">Not accepted</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <h2>Return Process</h2>
      <ol>
        <li>Contact us to request an RMA (Return Merchandise Authorization) number</li>
        <li>Pack items securely in original packaging</li>
        <li>Include the RMA number on the outside of the package</li>
        <li>Ship to the address provided with your RMA</li>
        <li>Refund processed within 5-7 business days of receipt</li>
      </ol>

      <h2>Damaged or Defective Products</h2>
      <p>
        If you receive a damaged or defective product, contact us immediately. Do not refuse delivery - accept the shipment and note damage on the delivery receipt. We will arrange replacement or repair under warranty at no additional cost.
      </p>

      <h2>Exchanges</h2>
      <p>
        To exchange a product, return the original item and place a new order. This ensures the fastest processing and delivery of your replacement.
      </p>

      <h2>Questions?</h2>
      <p>
        Contact our customer service team at <a href="tel:978-451-6890">978-451-6890</a> for return assistance.
      </p>
    </BasePage>
  );
});

export const head: DocumentHead = {
  title: 'Returns Policy | Solamp Solar & Energy Storage',
  meta: [
    {
      name: 'description',
      content: 'Return and exchange policies for Solamp Solar & Energy Storage products.',
    },
  ],
};
