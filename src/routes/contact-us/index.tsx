import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { Link } from '~/lib/qwik-city';

export default component$(() => {
  return (
    <div class="bg-white min-h-screen">
      {/* Hero - SOLID Forest Green */}
      <section class="bg-[#042e0d] py-12">
        <div class="container mx-auto px-4">
          <nav class="mb-4">
            <ol class="flex items-center gap-2 text-sm">
              <li><Link href="/" class="text-white/50 hover:text-white transition-colors">Home</Link></li>
              <li class="text-white/30">/</li>
              <li class="text-white font-semibold">Contact Us</li>
            </ol>
          </nav>
          <div class="max-w-3xl">
            <div class="inline-flex items-center gap-2 bg-[#c3a859]/20 text-[#c3a859] px-3 py-1 rounded-full text-sm font-semibold mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Talk to a Solar Expert
            </div>
            <h1 class="font-heading font-extrabold text-3xl md:text-4xl text-white mb-4">
              Contact Us
            </h1>
            <p class="text-white/80 text-lg max-w-2xl">
              Have questions about equipment, need a quote, or want to open a dealer account? We're here to help.
            </p>
          </div>
        </div>
      </section>

      <div class="container mx-auto px-4 py-12">
        <div class="grid lg:grid-cols-3 gap-10">
          {/* Contact Form */}
          <div class="lg:col-span-2">
            <div class="bg-[#f1f1f2] rounded-lg p-6 md:p-8">
              <h2 class="font-heading font-extrabold text-xl text-[#042e0d] mb-6">Send us a message</h2>
              <div dangerouslySetInnerHTML={`<script type="text/javascript" src="https://form.jotform.com/jsform/260164461032143"></script>`} />
            </div>
          </div>

          {/* Contact Info Sidebar */}
          <div class="space-y-6">
            {/* Call */}
            <div class="bg-[#042e0d] rounded-lg p-6 text-white">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-12 h-12 bg-[#c3a859] rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <p class="text-white/60 text-sm">Call a Solar Expert</p>
                  <a href="tel:978-451-6890" class="font-heading font-extrabold text-xl text-[#56c270] hover:text-white transition-colors">978-451-6890</a>
                </div>
              </div>
              <p class="text-white/70 text-sm">
                Mon-Fri 8am-5pm EST. Talk to real people who understand system design.
              </p>
            </div>

            {/* Quick Contact */}
            <div class="bg-[#f1f1f2] rounded-lg p-6">
              <h3 class="font-heading font-bold text-lg text-[#042e0d] mb-4">Quick Contact</h3>
              <div class="space-y-4">
                <div class="flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#c3a859] mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p class="font-bold text-[#042e0d] text-sm">Email</p>
                    <a href="mailto:info@solampio.com" class="text-[#5974c3] hover:underline text-sm">info@solampio.com</a>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#c3a859] mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p class="font-bold text-[#042e0d] text-sm">Hours</p>
                    <p class="text-gray-600 text-sm">Mon-Fri 8am-5pm EST</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Request Quote */}
            <div class="bg-[#c3a859]/10 border border-[#c3a859]/20 rounded-lg p-6">
              <h3 class="font-heading font-bold text-lg text-[#042e0d] mb-2">Need a Quote?</h3>
              <p class="text-sm text-gray-600 mb-4">
                Send us your BOM or project details. We respond within 24 hours.
              </p>
              <a href="mailto:quotes@solampio.com" class="inline-flex items-center gap-2 bg-[#c3a859] text-white font-bold px-4 py-2 rounded text-sm hover:bg-[#c3a859]/80 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                quotes@solampio.com
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <section class="py-12 bg-[#f1f1f2] border-t border-gray-200">
        <div class="container mx-auto px-4">
          <h2 class="font-heading font-extrabold text-2xl text-[#042e0d] text-center mb-8">Frequently Asked Questions</h2>
          <div class="max-w-3xl mx-auto space-y-4">
            <div class="bg-white border border-gray-200 rounded-lg">
              <details class="group">
                <summary class="flex items-center justify-between p-4 cursor-pointer font-bold text-[#042e0d]">
                  What does Solamp IO mean?
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div class="px-4 pb-4 text-gray-600">
                  "Sol" is short for solar, also the Roman god of the sun. "Amp" is electrical current. Combined with "IO" meaning input/output, it represents solar electricity in and out—in other words, solar batteries.
                </div>
              </details>
            </div>
            <div class="bg-white border border-gray-200 rounded-lg">
              <details class="group">
                <summary class="flex items-center justify-between p-4 cursor-pointer font-bold text-[#042e0d]">
                  What does Solamp IO do?
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div class="px-4 pb-4 text-gray-600">
                  We sell renewable energy products including solar panels and batteries. We operate retail and wholesale locations in Massachusetts and online.
                </div>
              </details>
            </div>
            <div class="bg-white border border-gray-200 rounded-lg">
              <details class="group">
                <summary class="flex items-center justify-between p-4 cursor-pointer font-bold text-[#042e0d]">
                  How can I get my question answered about products?
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div class="px-4 pb-4 text-gray-600">
                  Product pages feature a "questions and answers" section, or you can contact us online or call 978-451-6890.
                </div>
              </details>
            </div>
            <div class="bg-white border border-gray-200 rounded-lg">
              <details class="group">
                <summary class="flex items-center justify-between p-4 cursor-pointer font-bold text-[#042e0d]">
                  How do I place an order?
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div class="px-4 pb-4 text-gray-600">
                  Orders can be placed via the website or by phone at 978-451-6890.
                </div>
              </details>
            </div>
            <div class="bg-white border border-gray-200 rounded-lg">
              <details class="group">
                <summary class="flex items-center justify-between p-4 cursor-pointer font-bold text-[#042e0d]">
                  What payment methods are accepted?
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div class="px-4 pb-4 text-gray-600">
                  American Express, Discover, Mastercard, Visa, Apple Pay, Amazon Pay, Google Pay, Klarna, plus ACH and wire transfers.
                </div>
              </details>
            </div>
            <div class="bg-white border border-gray-200 rounded-lg">
              <details class="group">
                <summary class="flex items-center justify-between p-4 cursor-pointer font-bold text-[#042e0d]">
                  How much does shipping cost?
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div class="px-4 pb-4 text-gray-600">
                  Free shipping on all items! Some products are local pickup only.
                </div>
              </details>
            </div>
            <div class="bg-white border border-gray-200 rounded-lg">
              <details class="group">
                <summary class="flex items-center justify-between p-4 cursor-pointer font-bold text-[#042e0d]">
                  How long until delivery?
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div class="px-4 pb-4 text-gray-600">
                  Typically ships within 1-3 business days, arriving within 2-7 business days.
                </div>
              </details>
            </div>
            <div class="bg-white border border-gray-200 rounded-lg">
              <details class="group">
                <summary class="flex items-center justify-between p-4 cursor-pointer font-bold text-[#042e0d]">
                  What is your return policy?
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div class="px-4 pb-4 text-gray-600">
                  We do not accept returns.
                </div>
              </details>
            </div>
            <div class="bg-white border border-gray-200 rounded-lg">
              <details class="group">
                <summary class="flex items-center justify-between p-4 cursor-pointer font-bold text-[#042e0d]">
                  How do I initiate a return?
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div class="px-4 pb-4 text-gray-600">
                  Contact support within 15 days of delivery if an incorrect item was received.
                </div>
              </details>
            </div>
            <div class="bg-white border border-gray-200 rounded-lg">
              <details class="group">
                <summary class="flex items-center justify-between p-4 cursor-pointer font-bold text-[#042e0d]">
                  Do you offer warranties?
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div class="px-4 pb-4 text-gray-600">
                  No; manufacturers provide all product warranties.
                </div>
              </details>
            </div>
            <div class="bg-white border border-gray-200 rounded-lg">
              <details class="group">
                <summary class="flex items-center justify-between p-4 cursor-pointer font-bold text-[#042e0d]">
                  How do I create an account?
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div class="px-4 pb-4 text-gray-600">
                  Click the "Register" button at the top right of the website.
                </div>
              </details>
            </div>
            <div class="bg-white border border-gray-200 rounded-lg">
              <details class="group">
                <summary class="flex items-center justify-between p-4 cursor-pointer font-bold text-[#042e0d]">
                  How do I reset my password?
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div class="px-4 pb-4 text-gray-600">
                  Click "Sign In," then select the "Forgot your password?" link.
                </div>
              </details>
            </div>
            <div class="bg-white border border-gray-200 rounded-lg">
              <details class="group">
                <summary class="flex items-center justify-between p-4 cursor-pointer font-bold text-[#042e0d]">
                  Can I cancel my order?
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div class="px-4 pb-4 text-gray-600">
                  Most orders cannot be cancelled after confirmation because products are custom-built or specially procured. Cancellations are handled case-by-case at our discretion.
                </div>
              </details>
            </div>
            <div class="bg-white border border-gray-200 rounded-lg">
              <details class="group">
                <summary class="flex items-center justify-between p-4 cursor-pointer font-bold text-[#042e0d]">
                  Do you offer installation services?
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div class="px-4 pb-4 text-gray-600">
                  No. We do not offer any onsite work, site visits, or hands-on installation services. We are a product supplier only.
                </div>
              </details>
            </div>
            <div class="bg-white border border-gray-200 rounded-lg">
              <details class="group">
                <summary class="flex items-center justify-between p-4 cursor-pointer font-bold text-[#042e0d]">
                  What if my shipment arrives damaged?
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div class="px-4 pb-4 text-gray-600">
                  Inspect all packages before signing. Note any visible damage on the packing slip. Contact us immediately with photos if you discover damage.
                </div>
              </details>
            </div>
            <div class="bg-white border border-gray-200 rounded-lg">
              <details class="group">
                <summary class="flex items-center justify-between p-4 cursor-pointer font-bold text-[#042e0d]">
                  Who is responsible for permits and system design?
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div class="px-4 pb-4 text-gray-600">
                  You are. Customers are responsible for ensuring product compatibility, securing permits, utility interconnection agreements, and code compliance.
                </div>
              </details>
            </div>
            <div class="bg-white border border-gray-200 rounded-lg">
              <details class="group">
                <summary class="flex items-center justify-between p-4 cursor-pointer font-bold text-[#042e0d]">
                  Do you help with tax credits or rebates?
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div class="px-4 pb-4 text-gray-600">
                  No. We cannot provide tax or investment advice. Consult a certified tax professional about incentives like the federal solar tax credit.
                </div>
              </details>
            </div>
            <div class="bg-white border border-gray-200 rounded-lg">
              <details class="group">
                <summary class="flex items-center justify-between p-4 cursor-pointer font-bold text-[#042e0d]">
                  What shipping method do you use?
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div class="px-4 pb-4 text-gray-600">
                  Most orders ship via LTL freight. We also ship some orders via USPS and UPS. Let us know if you need a lift gate, residential delivery, or call-ahead service.
                </div>
              </details>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Contact Us | Solamp Solar & Energy Storage',
  meta: [
    {
      name: 'description',
      content: 'Contact Solamp for quotes, technical questions, or to open a dealer account. Call 978-451-6890 or send us a message.',
    },
  ],
};
