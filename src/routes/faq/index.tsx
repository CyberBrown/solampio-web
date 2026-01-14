import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { Link } from '@builder.io/qwik-city';

const faqs = [
  {
    category: 'Ordering',
    questions: [
      {
        q: 'How do I place an order?',
        a: 'You can place orders through our website, by phone at 978-451-6890, or by emailing your order to our sales team. For large projects, we recommend requesting a quote first.',
      },
      {
        q: 'Do you offer credit terms?',
        a: 'Yes, we offer net-30 terms for qualified customers. Complete our credit application during account registration or contact our team for more information.',
      },
      {
        q: 'Can I get a quote for my project?',
        a: 'Absolutely! Use our Request Quote feature or send us your bill of materials. We typically respond within 24 hours for standard quotes.',
      },
      {
        q: 'What payment methods do you accept?',
        a: 'We accept credit cards (Visa, Mastercard, American Express), ACH/wire transfer, and check. Credit terms available for approved accounts.',
      },
    ],
  },
  {
    category: 'Shipping',
    questions: [
      {
        q: 'How long does shipping take?',
        a: 'Most in-stock items ship within 1-2 business days. Ground freight typically takes 3-7 days depending on location. Express options available.',
      },
      {
        q: 'Do you ship to Alaska, Hawaii, or internationally?',
        a: 'Yes, we ship to all 50 states and internationally. Contact us for shipping quotes to Alaska, Hawaii, or international destinations.',
      },
      {
        q: 'Is there free shipping?',
        a: 'Free ground shipping on orders over $2,500 to commercial addresses in the continental US. Some exclusions apply for oversized items.',
      },
    ],
  },
  {
    category: 'Products',
    questions: [
      {
        q: 'Are you an authorized distributor?',
        a: 'Yes, we are an authorized distributor for all brands we carry. This means full manufacturer warranty support and access to technical resources.',
      },
      {
        q: 'Can you help with system design?',
        a: 'Our team can assist with system design, component selection, and troubleshooting. Call us to discuss your project requirements.',
      },
      {
        q: 'Do you carry replacement parts?',
        a: 'Yes, we stock replacement parts and accessories for the equipment we sell. Contact us with your model number for availability.',
      },
    ],
  },
  {
    category: 'Returns & Warranty',
    questions: [
      {
        q: 'What is your return policy?',
        a: 'Most products can be returned within 30 days if unused and in original packaging. Restocking fees apply. See our Returns page for details.',
      },
      {
        q: 'How do I file a warranty claim?',
        a: 'Contact us with your order number, product serial number, and description of the issue. We coordinate warranty claims with manufacturers on your behalf.',
      },
    ],
  },
];

export default component$(() => {
  return (
    <div class="bg-white min-h-screen">
      {/* Hero */}
      <section class="bg-[#042e0d] py-10">
        <div class="container mx-auto px-4">
          <nav class="mb-4">
            <ol class="flex items-center gap-2 text-sm">
              <li><Link href="/" class="text-white/50 hover:text-white transition-colors">Home</Link></li>
              <li class="text-white/30">/</li>
              <li class="text-white font-semibold">FAQ</li>
            </ol>
          </nav>
          <div class="max-w-3xl">
            <h1 class="font-heading font-extrabold text-3xl md:text-4xl text-white mb-3">
              Frequently Asked Questions
            </h1>
            <p class="text-white/80 text-lg">
              Find answers to common questions about ordering, shipping, products, and more.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section class="border-b border-gray-200 py-4 bg-[#f1f1f2]">
        <div class="container mx-auto px-4">
          <div class="flex flex-wrap gap-2 justify-center">
            {faqs.map((cat) => (
              <a
                key={cat.category}
                href={`#${cat.category.toLowerCase()}`}
                class="px-4 py-2 bg-white border border-gray-200 rounded text-sm font-bold text-[#042e0d] hover:border-[#042e0d] transition-colors"
              >
                {cat.category}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section class="py-10">
        <div class="container mx-auto px-4">
          <div class="max-w-3xl mx-auto">
            {faqs.map((category) => (
              <div key={category.category} id={category.category.toLowerCase()} class="mb-10">
                <h2 class="font-heading font-extrabold text-xl text-[#042e0d] mb-6 pb-2 border-b border-gray-200">
                  {category.category}
                </h2>
                <div class="space-y-4">
                  {category.questions.map((faq, i) => (
                    <details key={i} class="group bg-[#f1f1f2] rounded-lg border border-gray-200">
                      <summary class="flex items-center justify-between p-4 cursor-pointer list-none">
                        <span class="font-heading font-bold text-[#042e0d] pr-4">{faq.q}</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-5 w-5 text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          stroke-width="2"
                        >
                          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </summary>
                      <div class="px-4 pb-4 text-gray-600">
                        {faq.a}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Still Have Questions */}
      <section class="py-10 bg-[#f1f1f2]">
        <div class="container mx-auto px-4">
          <div class="max-w-2xl mx-auto text-center">
            <h2 class="font-heading font-extrabold text-2xl text-[#042e0d] mb-4">
              Still have questions?
            </h2>
            <p class="text-gray-600 mb-6">
              Our team is here to help. Give us a call or send us a message.
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:978-451-6890"
                class="inline-flex items-center justify-center gap-2 bg-[#042e0d] text-white font-heading font-bold px-6 py-3 rounded hover:bg-[#042e0d]/80 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                978-451-6890
              </a>
              <Link
                href="/contact/"
                class="inline-flex items-center justify-center gap-2 bg-[#56c270] text-[#042e0d] font-heading font-bold px-6 py-3 rounded hover:bg-white transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section class="bg-[#042e0d] py-10">
        <div class="container mx-auto px-4">
          <div class="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 class="font-heading font-extrabold text-2xl text-white">Ready to get started?</h3>
              <p class="text-white/70 mt-1">Browse our catalog or request a quote for your project.</p>
            </div>
            <div class="flex gap-4">
              <Link href="/products/" class="inline-flex items-center gap-2 bg-[#56c270] text-[#042e0d] font-heading font-bold px-6 py-3 rounded hover:bg-white transition-colors">
                Shop Products
              </Link>
              <Link href="/contact/" class="inline-flex items-center gap-2 bg-[#c3a859] text-white font-heading font-bold px-6 py-3 rounded hover:bg-[#c3a859]/80 transition-colors">
                Request Quote
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'FAQ | Solamp Solar & Energy Storage',
  meta: [
    {
      name: 'description',
      content: 'Frequently asked questions about Solamp Solar & Energy Storage - ordering, shipping, products, returns, and warranty.',
    },
  ],
};
