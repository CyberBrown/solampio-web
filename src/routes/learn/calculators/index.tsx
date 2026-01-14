import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { Link } from '@builder.io/qwik-city';

const calculators = [
  {
    name: 'Battery Sizing Calculator',
    description: 'Calculate the optimal battery bank capacity based on your daily loads, backup requirements, and depth of discharge preferences.',
    slug: 'battery-sizing',
    icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z',
    color: 'bg-[#5974c3]',
  },
  {
    name: 'Solar Array Sizing Calculator',
    description: 'Determine the right solar panel wattage for your location and energy needs using sun hours and system efficiency factors.',
    slug: 'array-sizing',
    icon: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z',
    color: 'bg-[#c3a859]',
  },
  {
    name: 'Wire Gauge Calculator',
    description: 'Find the correct AWG wire size based on current, distance, and acceptable voltage drop for safe and efficient installations.',
    slug: 'wire-gauge',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    color: 'bg-[#56c270]',
  },
  {
    name: 'ROI Estimator',
    description: 'Calculate solar system payback period and return on investment based on system cost, utility rates, and energy production.',
    slug: 'roi-estimator',
    icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    color: 'bg-[#042e0d]',
  },
];

export default component$(() => {
  return (
    <div class="bg-white min-h-screen">
      <section class="bg-[#042e0d] py-12">
        <div class="container mx-auto px-4">
          <div class="max-w-3xl">
            <div class="inline-flex items-center gap-2 bg-[#c3a859]/20 text-[#c3a859] px-3 py-1 rounded-full text-sm font-semibold mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Design Tools
            </div>
            <h1 class="font-heading font-extrabold text-3xl md:text-4xl text-white mb-4">Solar Calculators</h1>
            <p class="text-white/80 text-lg max-w-2xl">Professional-grade calculators to help you size batteries, solar arrays, wiring, and estimate project ROI.</p>
          </div>
        </div>
      </section>

      <section class="bg-[#f1f1f2] border-b border-gray-200 py-3">
        <div class="container mx-auto px-4">
          <nav class="flex items-center gap-2 text-sm">
            <Link href="/learn/" class="text-[#5974c3] hover:underline">Learning & Resources</Link>
            <span class="text-gray-400">/</span>
            <span class="text-gray-600">Calculators</span>
          </nav>
        </div>
      </section>

      <section class="py-12">
        <div class="container mx-auto px-4">
          <div class="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {calculators.map((calc) => (
              <Link key={calc.slug} href={`/learn/calculators/${calc.slug}/`} class="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:border-[#042e0d] transition-all group">
                <div class={`w-14 h-14 ${calc.color} rounded-lg flex items-center justify-center mb-4`}>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d={calc.icon} />
                  </svg>
                </div>
                <h2 class="font-heading font-bold text-xl text-[#042e0d] group-hover:text-[#5974c3] transition-colors mb-2">{calc.name}</h2>
                <p class="text-gray-500 text-sm">{calc.description}</p>
                <div class="mt-4 flex items-center text-[#5974c3] font-semibold text-sm">
                  Open Calculator
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section class="py-10 bg-[#f1f1f2]">
        <div class="container mx-auto px-4">
          <div class="max-w-4xl mx-auto">
            <h2 class="font-heading font-extrabold text-xl text-[#042e0d] text-center mb-8">Why Use Our Calculators?</h2>
            <div class="grid md:grid-cols-3 gap-6">
              <div class="text-center">
                <div class="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-[#56c270]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 class="font-heading font-bold text-[#042e0d] mb-1">Accurate Results</h3>
                <p class="text-sm text-gray-500">Industry-standard formulas used by professional installers</p>
              </div>
              <div class="text-center">
                <div class="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-[#5974c3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3 class="font-heading font-bold text-[#042e0d] mb-1">Product Recommendations</h3>
                <p class="text-sm text-gray-500">Get matched with products from our catalog</p>
              </div>
              <div class="text-center">
                <div class="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-[#c3a859]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </div>
                <h3 class="font-heading font-bold text-[#042e0d] mb-1">Save & Share</h3>
                <p class="text-sm text-gray-500">Save your calculations and share with clients</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="bg-[#042e0d] py-10">
        <div class="container mx-auto px-4">
          <div class="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 class="font-heading font-extrabold text-2xl text-white">Need help with system design?</h3>
              <p class="text-white/70 mt-1">Our team can review your calculations and help optimize your system.</p>
            </div>
            <a href="tel:978-451-6890" class="inline-flex items-center gap-2 bg-[#c3a859] text-white font-heading font-bold px-6 py-3 rounded hover:bg-[#c3a859]/80 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call 978-451-6890
            </a>
          </div>
        </div>
      </section>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Solar Calculators | Solamp Solar & Energy Storage',
  meta: [{ name: 'description', content: 'Free solar calculators for battery sizing, array sizing, wire gauge, and ROI estimation.' }],
};
