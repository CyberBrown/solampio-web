import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { Link } from '@builder.io/qwik-city';

const values = [
  {
    title: 'Technical Expertise',
    description: 'Our team includes engineers who\'ve designed and installed systems in the field.',
    icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  },
  {
    title: 'Tier-1 Only',
    description: 'We partner directly with manufacturers. No gray market. Full manufacturer warranties.',
    icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
  },
  {
    title: 'Real Support',
    description: 'Call us and talk to a person who understands solar. We answer questions before the sale.',
    icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
  },
  {
    title: 'Installer Focused',
    description: 'We sell to pros. Our pricing, inventory, and service are built for professional installers.',
    icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  },
];

const brandPartners = [
  'MidNite Solar',
  'Sol-Ark',
  'Fortress Power',
  'Tamarack',
  'Morningstar',
  'OutBack Power',
  'S-5!',
  'Victron',
];

export default component$(() => {
  return (
    <div class="bg-white min-h-screen">
      {/* Hero */}
      <section class="bg-[#042e0d] py-16">
        <div class="container mx-auto px-4">
          <div class="max-w-3xl">
            <div class="inline-flex items-center gap-2 bg-[#c3a859]/20 text-[#c3a859] px-3 py-1 rounded-full text-sm font-semibold mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Since 2006
            </div>
            <h1 class="font-heading font-extrabold text-3xl md:text-4xl lg:text-5xl text-white mb-4">
              18+ Years Serving Solar Professionals
            </h1>
            <p class="text-white/80 text-lg max-w-2xl">
              Solamp started as an installer. We built a distribution company because we couldn't find a supplier who understood the real challenges of solar installation.
            </p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section class="py-12 bg-[#f1f1f2]">
        <div class="container mx-auto px-4">
          <div class="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p class="text-xs font-mono text-[#c3a859] uppercase tracking-wide mb-2">Our Story</p>
              <h2 class="font-heading font-extrabold text-2xl md:text-3xl text-[#042e0d] mb-6">Built by Installers, for Installers</h2>
              <p class="text-gray-600 mb-4">
                In 2006, we were installing off-grid systems in rural New England and couldn't find a distributor who stocked what we needed, understood the equipment, or could answer technical questions.
              </p>
              <p class="text-gray-600 mb-4">
                So we built one. What started as a way to source equipment for our own projects became a full-service distribution company serving professional installers across the country.
              </p>
              <p class="text-gray-600">
                Today we're still installer-focused. Our team includes engineers who've designed systems, climbed on roofs, and troubleshot problems in the field. When you call us, you talk to someone who gets it.
              </p>
            </div>
            <div class="bg-[#042e0d]/5 border border-[#042e0d]/10 rounded-lg p-8">
              <div class="grid grid-cols-2 gap-6 text-center">
                <div>
                  <p class="font-heading font-extrabold text-4xl text-[#042e0d]">18+</p>
                  <p class="text-sm text-gray-500">Years in Business</p>
                </div>
                <div>
                  <p class="font-heading font-extrabold text-4xl text-[#042e0d]">500+</p>
                  <p class="text-sm text-gray-500">Installer Customers</p>
                </div>
                <div>
                  <p class="font-heading font-extrabold text-4xl text-[#042e0d]">50+</p>
                  <p class="text-sm text-gray-500">Brand Partners</p>
                </div>
                <div>
                  <p class="font-heading font-extrabold text-4xl text-[#042e0d]">24hr</p>
                  <p class="text-sm text-gray-500">Quote Response</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section class="py-12 bg-white">
        <div class="container mx-auto px-4">
          <div class="text-center mb-10">
            <h2 class="font-heading font-extrabold text-2xl md:text-3xl text-[#042e0d]">What Sets Us Apart</h2>
            <p class="text-gray-500 mt-2 max-w-2xl mx-auto">
              We're not a warehouse with a website. We're a team of solar professionals.
            </p>
          </div>
          <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <div key={value.title} class="bg-[#f1f1f2] rounded-lg p-6 text-center">
                <div class="w-14 h-14 bg-[#c3a859]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-[#c3a859]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d={value.icon} />
                  </svg>
                </div>
                <h3 class="font-heading font-bold text-lg text-[#042e0d] mb-2">{value.title}</h3>
                <p class="text-sm text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Partners */}
      <section class="py-12 bg-[#f1f1f2] border-y border-gray-200">
        <div class="container mx-auto px-4">
          <div class="text-center mb-8">
            <p class="text-xs font-mono text-[#c3a859] uppercase tracking-wide mb-2">Authorized Distributor</p>
            <h2 class="font-heading font-extrabold text-2xl text-[#042e0d]">Our Brand Partners</h2>
          </div>
          <div class="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {brandPartners.map((brand) => (
              <span key={brand} class="font-heading font-bold text-lg text-gray-400 hover:text-[#042e0d] transition-colors cursor-pointer">{brand}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Location */}
      <section class="py-12 bg-white">
        <div class="container mx-auto px-4">
          <div class="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p class="text-xs font-mono text-[#c3a859] uppercase tracking-wide mb-2">Visit Us</p>
              <h2 class="font-heading font-extrabold text-2xl md:text-3xl text-[#042e0d] mb-6">Based in Massachusetts</h2>
              <p class="text-gray-600 mb-6">
                We're located in Boxboro, MA, with easy access to I-495 and I-95. Our warehouse stocks popular items for same-day or next-day pickup.
              </p>
              <div class="space-y-4">
                <div class="flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#c3a859] mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p class="font-bold text-[#042e0d]">Address</p>
                    <p class="text-gray-600">330 Codman Hill Road<br />Boxboro, MA 01719</p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#c3a859] mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div>
                    <p class="font-bold text-[#042e0d]">Phone</p>
                    <a href="tel:978-451-6890" class="text-[#5974c3] hover:underline">978-451-6890</a>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#c3a859] mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p class="font-bold text-[#042e0d]">Hours</p>
                    <p class="text-gray-600">Monday - Friday: 8am - 5pm EST</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="bg-gray-100 rounded-lg aspect-video flex items-center justify-center">
              <div class="text-center text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="0.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <span class="text-sm">Map</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section class="bg-[#042e0d] py-10">
        <div class="container mx-auto px-4">
          <div class="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 class="font-heading font-extrabold text-2xl text-white">Ready to work with us?</h3>
              <p class="text-white/70 mt-1">Open a dealer account or request a quote for your next project.</p>
            </div>
            <div class="flex gap-4">
              <Link href="/contact/" class="inline-flex items-center gap-2 bg-[#56c270] text-[#042e0d] font-heading font-bold px-6 py-3 rounded hover:bg-white transition-colors">
                Contact Us
              </Link>
              <a href="tel:978-451-6890" class="inline-flex items-center gap-2 bg-[#c3a859] text-white font-heading font-bold px-6 py-3 rounded hover:bg-[#c3a859]/80 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                978-451-6890
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'About Us | Solamp Solar & Energy Storage',
  meta: [
    {
      name: 'description',
      content: 'Solamp has been serving solar installers since 2006. We distribute Tier-1 solar and energy storage equipment with technical support from real engineers.',
    },
  ],
};
