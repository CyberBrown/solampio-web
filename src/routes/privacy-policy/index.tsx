import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { BasePage } from '../../components/BasePage';

export default component$(() => {
  return (
    <BasePage
      title="Privacy Policy"
      subtitle="How we collect, use, and protect your information."
      breadcrumbs={[{ label: 'Privacy Policy' }]}
    >
      <div class="bg-[#f1f1f2] border border-gray-200 rounded-lg p-6 mb-8 not-prose">
        <p class="text-sm text-gray-500">Last updated: December 2024</p>
      </div>

      <h2>Information We Collect</h2>
      <p>
        We collect information you provide directly to us, including name, email address, phone number, company information, and shipping addresses when you create an account or place an order.
      </p>

      <h2>How We Use Your Information</h2>
      <p>We use the information we collect to:</p>
      <ul>
        <li>Process and fulfill your orders</li>
        <li>Communicate with you about products, services, and promotions</li>
        <li>Provide customer support</li>
        <li>Improve our website and services</li>
        <li>Comply with legal obligations</li>
      </ul>

      <h2>Information Sharing</h2>
      <p>
        We do not sell your personal information. We may share information with service providers who assist in our operations, such as shipping carriers and payment processors.
      </p>

      <h2>Data Security</h2>
      <p>
        We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.
      </p>

      <h2>Your Rights</h2>
      <p>
        You may access, update, or delete your account information at any time by logging into your account or contacting us directly.
      </p>

      <h2>Cookies</h2>
      <p>
        We use cookies and similar technologies to improve your browsing experience and analyze site traffic. You can control cookies through your browser settings.
      </p>

      <h2>Contact Us</h2>
      <p>
        For questions about this privacy policy, please contact us at <a href="tel:978-451-6890">978-451-6890</a> or visit our <a href="/contact-us/">Contact page</a>.
      </p>

      <div class="bg-[#f1f1f2] border border-gray-200 rounded-lg p-6 mt-8 not-prose">
        <p class="text-sm text-gray-500 italic">
          This is placeholder content. Actual privacy policy will be provided by legal counsel and loaded from Strapi CMS.
        </p>
      </div>
    </BasePage>
  );
});

export const head: DocumentHead = {
  title: 'Privacy Policy | Solamp Solar & Energy Storage',
  meta: [
    {
      name: 'description',
      content: 'Privacy policy for Solamp Solar & Energy Storage. Learn how we collect, use, and protect your information.',
    },
  ],
};
