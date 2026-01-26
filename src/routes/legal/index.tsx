import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';

export default component$(() => {
  return (
    <div class="bg-white min-h-screen">
      {/* Hero */}
      <section class="bg-[#042e0d] py-8">
        <div class="container mx-auto px-4">
          <h1 class="font-heading font-extrabold text-3xl md:text-4xl text-white mb-2">
            Legal Terms
          </h1>
          <p class="text-white/80">Last Updated: January 26, 2026</p>
        </div>
      </section>

      <div class="container mx-auto px-4 py-8 max-w-4xl">
        {/* Plain Language Summary */}
        <div class="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-lg mb-8">
          <h2 class="font-heading font-bold text-xl text-[#042e0d] mb-4">The Short Version</h2>
          <p class="text-gray-700 mb-4">Here's a friendly summary of the key points (the full legal language is below):</p>
          <ul class="space-y-2 text-gray-700">
            <li><strong>All sales are final</strong> - We sell solar panels, batteries, and energy storage products. Returns are rare exceptions granted at our discretion.</li>
            <li><strong>No onsite services</strong> - We're a product supplier only. We provide remote support but don't visit job sites or perform installations.</li>
            <li><strong>Shipping risk transfers at pickup</strong> - Once the carrier has your order, you're responsible for any damage claims. Inspect everything before signing!</li>
            <li><strong>Product warranties come from manufacturers</strong> - We don't provide warranties ourselves, but we can help you navigate the manufacturer's warranty process.</li>
            <li><strong>We're not tax, legal, or financial advisors</strong> - We can share general info about solar incentives, but please consult professionals for specific advice.</li>
            <li><strong>Be kind to each other</strong> - We treat our customers with respect and expect the same in return.</li>
          </ul>
        </div>

        {/* Quick Navigation */}
        <nav class="bg-gray-100 p-6 rounded-lg mb-8">
          <h3 class="font-heading font-bold text-lg text-[#042e0d] mb-4">Jump to Section</h3>
          <div class="flex flex-wrap gap-2">
            <a href="#terms-and-conditions" class="px-4 py-2 bg-white border border-gray-300 rounded text-sm font-medium text-[#042e0d] hover:bg-[#042e0d] hover:text-white transition-colors">Terms &amp; Conditions</a>
            <a href="#privacy-policy" class="px-4 py-2 bg-white border border-gray-300 rounded text-sm font-medium text-[#042e0d] hover:bg-[#042e0d] hover:text-white transition-colors">Privacy Policy</a>
            <a href="#shipping-policy" class="px-4 py-2 bg-white border border-gray-300 rounded text-sm font-medium text-[#042e0d] hover:bg-[#042e0d] hover:text-white transition-colors">Shipping Policy</a>
            <a href="#refund-return-policy" class="px-4 py-2 bg-white border border-gray-300 rounded text-sm font-medium text-[#042e0d] hover:bg-[#042e0d] hover:text-white transition-colors">Refund &amp; Return Policy</a>
            <a href="#disclaimer" class="px-4 py-2 bg-white border border-gray-300 rounded text-sm font-medium text-[#042e0d] hover:bg-[#042e0d] hover:text-white transition-colors">Disclaimer</a>
            <a href="#mobile-terms" class="px-4 py-2 bg-white border border-gray-300 rounded text-sm font-medium text-[#042e0d] hover:bg-[#042e0d] hover:text-white transition-colors">Mobile Terms</a>
          </div>
        </nav>

        {/* Terms and Conditions */}
        <section id="terms-and-conditions" class="mb-12 scroll-mt-24">
          <h2 class="font-heading font-extrabold text-2xl text-[#042e0d] border-b-2 border-[#042e0d] pb-2 mb-6">Terms and Conditions</h2>

          <h3 class="font-heading font-bold text-lg text-[#042e0d] mt-6 mb-3">Agreement to Our Legal Terms and Conditions</h3>
          <p class="text-gray-600 text-sm mb-4">Updated January 26, 2026</p>

          <p class="text-gray-700 mb-4">We are Solamp, Inc. ("The Company", "Company," "we," "us," "our"), a company registered in Massachusetts, United States at 3 Post Office Square, Acton, MA 01720.</p>

          <p class="text-gray-700 mb-4">We operate the websites <a href="https://www.solampio.com" class="text-[#5974c3] hover:underline">www.solampio.com</a>, <a href="https://solampliving.com" class="text-[#5974c3] hover:underline">solampliving.com</a>, <a href="https://contentforgebrand.com" class="text-[#5974c3] hover:underline">contentforgebrand.com</a>, <a href="https://voltagelabs.net" class="text-[#5974c3] hover:underline">voltagelabs.net</a>, and <a href="https://solamp.io" class="text-[#5974c3] hover:underline">solamp.io</a> (the "Site", and "Sites"), as well as any other related products and services that refer or link to these legal terms (the "Legal Terms") (collectively, the "Services").</p>

          <p class="text-gray-700 mb-4">We provide an ecommerce website where people can shop for products, get education and value-add services.</p>

          <div class="bg-gray-100 p-4 rounded-lg mb-4">
            <p class="font-bold text-[#042e0d] mb-2">Contact Us:</p>
            <p class="text-gray-700">Phone: <a href="tel:978-451-6890" class="text-[#5974c3] hover:underline">(978) 451-6890</a><br />
            Email: <a href="mailto:info@solampio.com" class="text-[#5974c3] hover:underline">info@solampio.com</a><br />
            Mail: 3 Post Office Square, Acton, MA 01720</p>
          </div>

          <p class="text-gray-700 mb-4">These Legal Terms constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you"), and Solamp Inc, concerning your access to and use of the Services. You agree that by accessing the Services, you have read, understood, and agreed to be bound by all of these Legal Terms. <strong>IF YOU DO NOT AGREE WITH ALL OF THESE LEGAL TERMS, THEN YOU ARE EXPRESSLY PROHIBITED FROM USING THE SERVICES AND YOU MUST DISCONTINUE USE IMMEDIATELY.</strong></p>

          <p class="text-gray-700 mb-4">Supplemental terms and conditions or documents that may be posted on the Services from time to time are hereby expressly incorporated herein by reference. We reserve the right, in our sole discretion, to make changes or modifications to these Legal Terms at any time and for any reason. We will alert you about any changes by updating the "Last updated" date of these Legal Terms, and you waive any right to receive specific notice of each such change. It is your responsibility to periodically review these Legal Terms to stay informed of updates.</p>

          <p class="text-gray-700 mb-4">The Services are intended for users who are at least 18 years old. Persons under the age of 18 are not permitted to use or register for the Services.</p>

          <h3 class="font-heading font-bold text-lg text-[#042e0d] mt-8 mb-3">1. Introduction</h3>
          <p class="text-gray-700 mb-4">Solamp is a brand operated by Solamp Inc. that offers and sells to the public solar electric, battery energy storage and related cleantech renewable energy and sustainable lifestyle products, as well as services and education about the material and industry.</p>
          <p class="text-gray-700 mb-4">We are here to help you with your renewable energy system installation. We don't have the same level of knowledge about your site as you, and/or the system installer do. If you don't feel comfortable with any or all of the system design and installation process please seek the help of a professional.</p>
          <p class="text-gray-700 mb-4 italic">The ultimate responsibility for the systems, including but not limited to product compatibility, permitting, interconnection, operability, and performance is with the purchaser of products and/or services.</p>

          <h3 class="font-heading font-bold text-lg text-[#042e0d] mt-8 mb-3">2. Scope of Work</h3>

          <h4 class="font-bold text-[#042e0d] mt-4 mb-2">Onsite Work</h4>
          <p class="text-gray-700 mb-4">We do not offer any onsite work. We don't visit site locations or offer hands-on service at the project location. We need you to provide good data and information about the site conditions and we will do our best to advise based on all the information you provide. Not all problems can be fixed remotely.</p>

          <h4 class="font-bold text-[#042e0d] mt-4 mb-2">Product Estimates and Performance Claims</h4>
          <p class="text-gray-700 mb-4">System estimates are estimates only and not guarantees. We try our best to be as accurate as possible in our estimates but we are not onsite and many factors can lead to more or less production than expected.</p>

          <h4 class="font-bold text-[#042e0d] mt-4 mb-2">Programs, Incentives, Grants and Project Economics</h4>
          <p class="text-gray-700 mb-4">We do not offer tax advice or investment advice. Any claims about tax credits or other tax consequences is for general education purposes and not specific advice. Get the opinion of a certified professional accountant or tax professional before making any decisions.</p>

          <h4 class="font-bold text-[#042e0d] mt-4 mb-2">Warranties</h4>
          <p class="text-gray-700 mb-4">The Company provides no warranty for products or services provided. In some cases the manufacturer of a product may provide a product warranty. The Company, at its discretion, may assist you in researching the specifics of any potential product warranty and the process in how to file a warranty claim with a manufacturer, if available.</p>

          <h4 class="font-bold text-[#042e0d] mt-4 mb-2">Permits and Interconnection</h4>
          <p class="text-gray-700 mb-4">Your project may require local, state, federal or other permits, as well as a signed interconnection agreement with a utility company. We are not responsible for securing any permits, licenses, or interconnection agreements. The ultimate responsibility for permits and interconnection is with the buyer.</p>

          <h3 class="font-heading font-bold text-lg text-[#042e0d] mt-8 mb-3">3-8. Services, IP, Users, Products & Payment</h3>
          <p class="text-gray-700 mb-4">We grant you a non-exclusive, non-transferable, revocable license to access the Services for your personal, non-commercial use or internal business purpose. You represent that all registration information you submit will be true, accurate, current, and complete. We accept Visa, Mastercard, American Express, Discover, and PayPal. All payments shall be in US dollars.</p>

          <h3 class="font-heading font-bold text-lg text-[#042e0d] mt-8 mb-3">9. Return Policy</h3>
          <p class="text-gray-700 mb-4"><strong>All sales are final.</strong> No refund will be issued except by rare exception granted by The Company at its sole discretion on a case-by-case basis.</p>
          <p class="text-gray-700 mb-4"><strong>Return Merchandise Authorization (RMA):</strong> If you believe you have grounds for a return, you must obtain prior approval via an RMA before attempting any return. RMAs are exceptions to our all-sales-final policy and are granted only at our sole discretion.</p>
          <p class="text-gray-700 mb-4"><strong>Defective Products:</strong> If you believe a product is defective, please first contact the manufacturer directly to initiate a warranty claim. We can assist you in navigating the manufacturer's warranty process, but the ultimate responsibility for warranty claims lies with you and the manufacturer.</p>

          <h3 class="font-heading font-bold text-lg text-[#042e0d] mt-8 mb-3">10-21. Prohibited Activities, Content, Management & Governing Law</h3>
          <p class="text-gray-700 mb-4">You may not access or use the Services for any purpose other than that for which we make the Services available. These Legal Terms and your use of the Services are governed by and construed in accordance with the laws of the Commonwealth of Massachusetts.</p>

          <h3 class="font-heading font-bold text-lg text-[#042e0d] mt-8 mb-3">22. Dispute Resolution</h3>

          <h4 class="font-bold text-[#042e0d] mt-4 mb-2">Binding Arbitration</h4>
          <p class="text-gray-700 mb-4">If the Parties are unable to resolve a Dispute through informal negotiations, the Dispute will be finally and exclusively resolved by binding arbitration under the Commercial Arbitration Rules of the American Arbitration Association. The arbitration will take place in Middlesex County, Massachusetts.</p>

          <h4 class="font-bold text-[#042e0d] mt-4 mb-2">Small Claims Court Exception</h4>
          <p class="text-gray-700 mb-4">Notwithstanding the foregoing, either Party may bring an individual action in small claims court in Middlesex County, Massachusetts, if the claim qualifies for small claims court jurisdiction.</p>

          <h4 class="font-bold text-[#042e0d] mt-4 mb-2">Restrictions</h4>
          <p class="text-gray-700 mb-4">Any arbitration shall be limited to the Dispute between the Parties individually. No arbitration shall be joined with any other proceeding; there is no right for any Dispute to be arbitrated on a class-action basis.</p>

          <h3 class="font-heading font-bold text-lg text-[#042e0d] mt-8 mb-3">23-30. Corrections, Disclaimers, Liability & Miscellaneous</h3>
          <p class="text-gray-700 mb-4">THE SERVICES ARE PROVIDED ON AN AS-IS AND AS-AVAILABLE BASIS. We reserve the right to correct any errors, inaccuracies, or omissions at any time without prior notice. Our liability will at all times be limited to the amount paid by you during the six (6) month period prior to any cause of action arising.</p>

          <h3 class="font-heading font-bold text-lg text-[#042e0d] mt-8 mb-3">31. Responsibility</h3>
          <p class="text-gray-700 mb-4">It is the responsibility of the customer to ensure that the products they purchase are compatible with each other and the specific location of installation. Neither Solamp nor any of its employees have visited the site or personally assessed the actual design requirements. Actual product may look different than pictured.</p>

          <h3 class="font-heading font-bold text-lg text-[#042e0d] mt-8 mb-3">32. Technical Support</h3>
          <p class="text-gray-700 mb-4">Solamp does not guarantee any technical assistance or technical support. Please contact manufacturers directly for accurate answers to your technical questions both before and after point of sale.</p>

          <h3 class="font-heading font-bold text-lg text-[#042e0d] mt-8 mb-3">33. Mutual Kindness and Respect</h3>
          <p class="text-gray-700 mb-4">The Company and its employees are skilled professionals, trained to provide customers with kindness and respect at all times. Our expectation is that our customers will treat all of us at the Company likewise. Use of profanity, hostility, verbal abuse and general unpleasantness will constitute immediate grounds for termination of our business relationship.</p>

          <h3 class="font-heading font-bold text-lg text-[#042e0d] mt-8 mb-3">34. Title and Risk of Loss</h3>
          <p class="text-gray-700 mb-4">All orders ship Ex Works Origin and title and risk of loss passes from buyer to seller the moment that the item is given to the shipping carrier. The buyer is advised to purchase appropriate insurance to protect against loss.</p>

          <h3 class="font-heading font-bold text-lg text-[#042e0d] mt-8 mb-3">35. Cancellations</h3>
          <p class="text-gray-700 mb-4">Many products are custom, built to order or specially procured. For these reasons many orders cannot be canceled, delayed or returned for any reason. All sales are final.</p>

          <a href="#top" class="inline-block mt-6 px-4 py-2 bg-gray-100 rounded text-sm text-[#042e0d] hover:bg-[#042e0d] hover:text-white transition-colors">&uarr; Back to Top</a>
        </section>

        {/* Privacy Policy */}
        <section id="privacy-policy" class="mb-12 scroll-mt-24">
          <h2 class="font-heading font-extrabold text-2xl text-[#042e0d] border-b-2 border-[#042e0d] pb-2 mb-6">Privacy Policy</h2>
          <p class="text-gray-600 text-sm mb-4">Last Updated: January 26, 2026</p>

          <p class="text-gray-700 mb-4">This Privacy Policy describes our policies and procedures on the collection, use and disclosure of your information when you use the Service and tells you about your privacy rights and how the law protects you.</p>

          <h3 class="font-heading font-bold text-lg text-[#042e0d] mt-6 mb-3">Information We Collect</h3>
          <p class="text-gray-700 mb-4">We may collect personally identifiable information including: email address, first and last name, phone number, address, and usage data. Usage data may include your device's IP address, browser type, pages visited, and other diagnostic data.</p>

          <h3 class="font-heading font-bold text-lg text-[#042e0d] mt-6 mb-3">How We Use Your Data</h3>
          <p class="text-gray-700 mb-4">We use your data to provide and maintain our Service, manage your account, perform contracts, contact you, provide news and offers, manage requests, and for business transfers and analysis.</p>

          <h3 class="font-heading font-bold text-lg text-[#042e0d] mt-6 mb-3">Cookies and Tracking</h3>
          <p class="text-gray-700 mb-4">We use cookies and similar tracking technologies to track activity on our Service and store certain information. You can instruct your browser to refuse all cookies, but some parts of our Service may not function properly.</p>

          <h3 class="font-heading font-bold text-lg text-[#042e0d] mt-6 mb-3">California Consumer Privacy Act (CCPA/CPRA) Rights</h3>
          <p class="text-gray-700 mb-4">If you are a California resident, you have specific rights under the CCPA and CPRA:</p>
          <ul class="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li><strong>Right to Know/Access:</strong> Request disclosure of what personal information we've collected about you.</li>
            <li><strong>Right to Delete:</strong> Request deletion of your personal information.</li>
            <li><strong>Right to Correct:</strong> Request correction of inaccurate personal information.</li>
            <li><strong>Right to Opt-Out:</strong> Opt out of sale or sharing of your personal information. <strong>Note: Solamp does not sell your personal information.</strong></li>
            <li><strong>Right to Non-Discrimination:</strong> We will not discriminate against you for exercising your privacy rights.</li>
          </ul>
          <p class="text-gray-700 mb-4">To exercise these rights, contact us at <a href="mailto:info@solampio.com" class="text-[#5974c3] hover:underline">info@solampio.com</a> or call <a href="tel:978-451-6890" class="text-[#5974c3] hover:underline">(978) 451-6890</a>.</p>

          <h3 class="font-heading font-bold text-lg text-[#042e0d] mt-6 mb-3">Data Security</h3>
          <p class="text-gray-700 mb-4">The security of your Personal Data is important to us, but no method of transmission over the Internet is 100% secure. We strive to use commercially acceptable means to protect your data.</p>

          <h3 class="font-heading font-bold text-lg text-[#042e0d] mt-6 mb-3">Contact Us</h3>
          <p class="text-gray-700 mb-4">If you have questions about this Privacy Policy, contact us at <a href="mailto:info@solampio.com" class="text-[#5974c3] hover:underline">info@solampio.com</a>, call <a href="tel:978-451-6890" class="text-[#5974c3] hover:underline">(978) 451-6890</a>, or write to 3 Post Office Square, Acton, MA 01720.</p>

          <a href="#top" class="inline-block mt-6 px-4 py-2 bg-gray-100 rounded text-sm text-[#042e0d] hover:bg-[#042e0d] hover:text-white transition-colors">&uarr; Back to Top</a>
        </section>

        {/* Shipping Policy */}
        <section id="shipping-policy" class="mb-12 scroll-mt-24">
          <h2 class="font-heading font-extrabold text-2xl text-[#042e0d] border-b-2 border-[#042e0d] pb-2 mb-6">Shipping Policy</h2>
          <p class="text-gray-600 text-sm mb-4">Last Updated: January 26, 2026</p>

          <h3 class="font-heading font-bold text-lg text-[#042e0d] mt-6 mb-3">Shipping Methods</h3>
          <p class="text-gray-700 mb-4">We ship to US addresses only. Parcel packages ship via UPS or USPS. Oversized or overweight items ship via LTL Freight. For international orders, we can ship to a freight forwarder that you arrange.</p>

          <h3 class="font-heading font-bold text-lg text-[#042e0d] mt-6 mb-3">Delivery Times</h3>
          <p class="text-gray-700 mb-4">On average we ship items within 3 business days and often ship the same day. Most items take 1-5 business days for transit. Some items are special order with longer lead times noted on the website.</p>

          <h3 class="font-heading font-bold text-lg text-[#042e0d] mt-6 mb-3">Local Pickup</h3>
          <p class="text-gray-700 mb-4">Some items are available for pickup at our location. Local pickup orders do not include packaging unless arranged in advance. Order ahead online or by phone and we'll have your products ready.</p>

          <h3 class="font-heading font-bold text-lg text-[#042e0d] mt-6 mb-3">Risk of Loss</h3>
          <p class="text-gray-700 mb-4">All orders ship Ex Works Origin. Title and risk of loss passes to the buyer when the item is given to the shipping carrier. We recommend purchasing appropriate insurance.</p>

          <h3 class="font-heading font-bold text-lg text-[#042e0d] mt-6 mb-3">Inspecting Your Delivery</h3>
          <p class="text-gray-700 mb-4">Before signing, inspect your order for damage. If you suspect damage, write "concealed damage possible" on the packing slip. Once you sign, you accept the product was delivered in perfect condition unless noted. If you see damage, note it and take pictures immediately.</p>

          <a href="#top" class="inline-block mt-6 px-4 py-2 bg-gray-100 rounded text-sm text-[#042e0d] hover:bg-[#042e0d] hover:text-white transition-colors">&uarr; Back to Top</a>
        </section>

        {/* Refund & Return Policy */}
        <section id="refund-return-policy" class="mb-12 scroll-mt-24">
          <h2 class="font-heading font-extrabold text-2xl text-[#042e0d] border-b-2 border-[#042e0d] pb-2 mb-6">Refund &amp; Return Policy</h2>
          <p class="text-gray-600 text-sm mb-4">Last Updated: January 26, 2026</p>

          <p class="text-gray-700 mb-4 font-bold text-lg">All sales are final. All products are sold "as is".</p>

          <h3 class="font-heading font-bold text-lg text-[#042e0d] mt-6 mb-3">Cancellation Requests</h3>
          <p class="text-gray-700 mb-4">If you would like to cancel your order prior to shipping, contact us and we will attempt to do so. Many items are custom, built to order, or special order and may not be cancelable even if not yet shipped.</p>

          <h3 class="font-heading font-bold text-lg text-[#042e0d] mt-6 mb-3">Returns</h3>
          <p class="text-gray-700 mb-4">We do not accept returns. Many products (lithium batteries, solar panels, racking) require specialized handling. Some items are made-to-order. For these reasons, we cannot accept returned items.</p>

          <h3 class="font-heading font-bold text-lg text-[#042e0d] mt-6 mb-3">Incorrect Items</h3>
          <p class="text-gray-700 mb-4">If you received an incorrect item, contact us within 15 days of delivery at <a href="mailto:info@solampio.com" class="text-[#5974c3] hover:underline">info@solampio.com</a> or <a href="tel:978-451-6890" class="text-[#5974c3] hover:underline">(978) 451-6890</a>. You'll need to provide photo or video evidence.</p>

          <h3 class="font-heading font-bold text-lg text-[#042e0d] mt-6 mb-3">Defective Products</h3>
          <p class="text-gray-700 mb-4">If a product is defective, contact the manufacturer directly to initiate a warranty claim. We provide no product warranties, but we can help you navigate the manufacturer's warranty process.</p>

          <a href="#top" class="inline-block mt-6 px-4 py-2 bg-gray-100 rounded text-sm text-[#042e0d] hover:bg-[#042e0d] hover:text-white transition-colors">&uarr; Back to Top</a>
        </section>

        {/* Disclaimer */}
        <section id="disclaimer" class="mb-12 scroll-mt-24">
          <h2 class="font-heading font-extrabold text-2xl text-[#042e0d] border-b-2 border-[#042e0d] pb-2 mb-6">Disclaimer</h2>
          <p class="text-gray-600 text-sm mb-4">Last Updated: January 26, 2026</p>

          <p class="text-gray-700 mb-4">The information contained on the Service is for general information purposes only. The Company assumes no responsibility for errors or omissions in the contents of the Service.</p>

          <p class="text-gray-700 mb-4">In no event shall the Company be liable for any special, direct, indirect, consequential, or incidental damages arising out of or in connection with the use of the Service.</p>

          <p class="text-gray-700 mb-4">The Service may contain links to external websites that are not provided or maintained by the Company. We do not guarantee the accuracy, relevance, timeliness, or completeness of any information on these external websites.</p>

          <p class="text-gray-700 mb-4">The information on the Service is provided with the understanding that the Company is not engaged in rendering legal, accounting, tax, or other professional advice and services. It should not be used as a substitute for consultation with professional advisers.</p>

          <p class="text-gray-700 mb-4">All information is provided "as is", with no guarantee of completeness, accuracy, timeliness or results obtained from use of this information, and without warranty of any kind.</p>

          <a href="#top" class="inline-block mt-6 px-4 py-2 bg-gray-100 rounded text-sm text-[#042e0d] hover:bg-[#042e0d] hover:text-white transition-colors">&uarr; Back to Top</a>
        </section>

        {/* Mobile Terms */}
        <section id="mobile-terms" class="mb-12 scroll-mt-24">
          <h2 class="font-heading font-extrabold text-2xl text-[#042e0d] border-b-2 border-[#042e0d] pb-2 mb-6">Mobile Terms of Service</h2>
          <p class="text-gray-600 text-sm mb-4">Last Updated: January 26, 2026</p>

          <p class="text-gray-700 mb-4">By consenting to Solamp, Inc's SMS/text messaging service, you agree to receive recurring SMS/text messages from and on behalf of Solamp, Inc through your wireless provider to the mobile number you provided, even if your mobile number is registered on any Do Not Call list.</p>

          <p class="text-gray-700 mb-4">Service-related messages may include updates, alerts, and information (e.g., order updates, account alerts). Promotional messages may include promotions, specials, and marketing offers.</p>

          <p class="text-gray-700 mb-4">Your participation is completely voluntary. Consent is not a condition of any purchase. Message frequency varies. Message and data rates may apply.</p>

          <p class="text-gray-700 mb-4"><strong>Opt-Out:</strong> Text STOP to +1-844-651-0423 or click unsubscribe in any text message to cancel.</p>

          <p class="text-gray-700 mb-4"><strong>Help:</strong> Text HELP to +1-844-651-0423 or email <a href="mailto:info@solampio.com" class="text-[#5974c3] hover:underline">info@solampio.com</a>.</p>

          <a href="#top" class="inline-block mt-6 px-4 py-2 bg-gray-100 rounded text-sm text-[#042e0d] hover:bg-[#042e0d] hover:text-white transition-colors">&uarr; Back to Top</a>
        </section>

        {/* Footer */}
        <footer class="mt-12 pt-6 border-t-2 border-[#042e0d] text-center text-gray-600">
          <p class="mb-2">Serving Acton, Boxborough, Maynard, Leominster and surrounding towns, Massachusetts, New England, the United States and the World.</p>
          <p class="mb-2">&copy; 2026 Solamp, Inc. All rights reserved.</p>
          <p>3 Post Office Square, Acton, MA 01720 | <a href="tel:978-451-6890" class="text-[#5974c3] hover:underline">(978) 451-6890</a> | <a href="mailto:info@solampio.com" class="text-[#5974c3] hover:underline">info@solampio.com</a></p>
        </footer>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Legal Terms | Solamp IO - Solar & Energy Storage',
  meta: [
    {
      name: 'description',
      content: 'Solamp IO terms and conditions, privacy policy, shipping policy, return policy, and disclaimers for solar and energy storage products.',
    },
  ],
};
