import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { BasePage } from '../../components/BasePage';

export default component$(() => {
  return (
    <BasePage
      title="Terms & Conditions"
      subtitle="Please read these terms carefully before using our services."
      breadcrumbs={[{ label: 'Terms & Conditions' }]}
    >
      <div class="bg-[#f1f1f2] border border-gray-200 rounded-lg p-6 mb-8 not-prose">
        <p class="text-sm text-gray-500">Last updated: December 2024</p>
      </div>

      <h2>1. Acceptance of Terms</h2>
      <p>
        By accessing and using the Solamp Solar & Energy Storage website and services, you accept and agree to be bound by the terms and provisions of this agreement.
      </p>

      <h2>2. Products and Services</h2>
      <p>
        Solamp is a distributor of solar and energy storage equipment. All products are sold subject to manufacturer warranties and specifications. Pricing is subject to change without notice.
      </p>

      <h2>3. Ordering and Payment</h2>
      <p>
        Orders are subject to product availability and credit approval. Payment terms will be established at the time of account creation. All prices are in US dollars unless otherwise specified.
      </p>

      <h2>4. Shipping and Delivery</h2>
      <p>
        Shipping costs and delivery times vary based on product and destination. Risk of loss passes to the buyer upon delivery to the carrier. See our <a href="/shipping/">Shipping Policy</a> for details.
      </p>

      <h2>5. Returns and Refunds</h2>
      <p>
        Returns are subject to our <a href="/returns/">Return Policy</a>. Restocking fees may apply. Products must be in original packaging and unused condition.
      </p>

      <h2>6. Warranty</h2>
      <p>
        Products are covered by manufacturer warranties. Solamp does not provide additional warranties beyond those offered by manufacturers. See our <a href="/warranty/">Warranty Information</a> page.
      </p>

      <h2>7. Limitation of Liability</h2>
      <p>
        Solamp shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of our products or services.
      </p>

      <h2>8. Contact Information</h2>
      <p>
        For questions about these terms, please contact us at <a href="tel:978-451-6890">978-451-6890</a> or visit our <a href="/contact/">Contact page</a>.
      </p>

      <div class="bg-[#f1f1f2] border border-gray-200 rounded-lg p-6 mt-8 not-prose">
        <p class="text-sm text-gray-500 italic">
          This is placeholder content. Actual terms and conditions will be provided by legal counsel and loaded from Strapi CMS.
        </p>
      </div>
    </BasePage>
  );
});

export const head: DocumentHead = {
  title: 'Terms & Conditions | Solamp Solar & Energy Storage',
  meta: [
    {
      name: 'description',
      content: 'Terms and conditions for using Solamp Solar & Energy Storage products and services.',
    },
  ],
};
