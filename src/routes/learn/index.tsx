import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { Link } from '@builder.io/qwik-city';

const guides = [
  {
    title: '2025 Solar Tax Credit Guide',
    description: 'Federal ITC and state incentives explained for installers and their customers.',
    category: 'Guide',
  },
  {
    title: 'LiFePO4 vs Lithium-Ion Batteries',
    description: 'Battery chemistry comparison to help you choose the right storage solution.',
    category: 'Comparison',
  },
  {
    title: 'MidNite Rosie Inverter Overview',
    description: 'Technical specs, installation tips, and configuration for the Rosie series.',
    category: 'Product',
  },
  {
    title: 'Ground Mount vs Roof Mount',
    description: 'When to choose ground mount systems and site assessment considerations.',
    category: 'Guide',
  },
  {
    title: 'Battery Sizing for Off-Grid',
    description: 'Calculate battery bank size for off-grid residential and commercial systems.',
    category: 'Calculator',
  },
  {
    title: 'Sol-Ark 15K Installation Guide',
    description: 'Step-by-step installation and commissioning for Sol-Ark hybrid inverters.',
    category: 'Product',
  },
];

const courses = [
  {
    title: 'Solar Fundamentals',
    description: 'Core concepts of PV systems, components, and installation basics.',
    duration: '4 hours',
    lessons: 12,
    level: 'Beginner',
  },
  {
    title: 'Battery Storage Design',
    description: 'Design energy storage systems for residential and commercial applications.',
    duration: '6 hours',
    lessons: 18,
    level: 'Intermediate',
  },
  {
    title: 'Off-Grid System Design',
    description: 'Complete off-grid system sizing, component selection, and installation.',
    duration: '8 hours',
    lessons: 24,
    level: 'Advanced',
  },
];

export default component$(() => {
  return (
    <div class="bg-white min-h-screen">
      {/* Hero - SOLID Forest Green */}
      <section class="bg-[#042e0d] py-12">
        <div class="container mx-auto px-4">
          <div class="max-w-3xl">
            <div class="inline-flex items-center gap-2 bg-[#c3a859]/20 text-[#c3a859] px-3 py-1 rounded-full text-sm font-semibold mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Resources for Installers
            </div>
            <h1 class="font-heading font-extrabold text-3xl md:text-4xl text-white mb-4">
              Learning &amp; Resources
            </h1>
            <p class="text-white/80 text-lg max-w-2xl">
              Guides, product documentation, training courses, and tools to help you design and install better solar systems.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section class="border-b border-gray-200 py-4 bg-[#f1f1f2]">
        <div class="container mx-auto px-4">
          <div class="flex flex-wrap gap-3 justify-center">
            <Link href="/learn/courses/" class="px-4 py-2 bg-white border border-gray-200 rounded text-sm font-bold text-[#042e0d] hover:border-[#042e0d] transition-colors">
              Training Courses
            </Link>
            <Link href="/docs/" class="px-4 py-2 bg-white border border-gray-200 rounded text-sm font-bold text-[#042e0d] hover:border-[#042e0d] transition-colors">
              Product Library
            </Link>
            <a href="#guides" class="px-4 py-2 bg-white border border-gray-200 rounded text-sm font-bold text-[#042e0d] hover:border-[#042e0d] transition-colors">
              Guides &amp; Articles
            </a>
            <a href="#tools" class="px-4 py-2 bg-white border border-gray-200 rounded text-sm font-bold text-[#042e0d] hover:border-[#042e0d] transition-colors">
              Design Tools
            </a>
          </div>
        </div>
      </section>

      {/* Guides */}
      <section id="guides" class="py-12 bg-white">
        <div class="container mx-auto px-4">
          <div class="flex justify-between items-end mb-8">
            <div>
              <h2 class="font-heading font-extrabold text-2xl md:text-3xl text-[#042e0d]">Guides &amp; Articles</h2>
              <p class="text-gray-500 mt-1">Technical resources for professional installers</p>
            </div>
          </div>
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {guides.map((guide) => (
              <Link key={guide.title} href="/learn/" class="bg-[#f1f1f2] rounded-lg border border-gray-200 p-5 hover:shadow-lg hover:border-[#042e0d] transition-all group">
                <div class="flex items-center gap-2 mb-3">
                  <span class={`text-xs font-bold px-2 py-1 rounded ${
                    guide.category === 'Guide' ? 'bg-[#c3a859]/10 text-[#c3a859]' :
                    guide.category === 'Comparison' ? 'bg-[#56c270]/10 text-[#042e0d]' :
                    guide.category === 'Product' ? 'bg-[#5974c3]/10 text-[#5974c3]' :
                    'bg-[#5974c3]/10 text-[#5974c3]'
                  }`}>{guide.category}</span>
                </div>
                <h3 class="font-heading font-bold text-lg text-[#042e0d] group-hover:text-[#5974c3] transition-colors mb-2">{guide.title}</h3>
                <p class="text-sm text-gray-500">{guide.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Training Courses */}
      <section class="py-12 bg-[#f1f1f2]">
        <div class="container mx-auto px-4">
          <div class="flex justify-between items-end mb-8">
            <div>
              <h2 class="font-heading font-extrabold text-2xl md:text-3xl text-[#042e0d]">Training Courses</h2>
              <p class="text-gray-500 mt-1">Structured learning paths for solar professionals</p>
            </div>
            <Link href="/learn/courses/" class="text-[#5974c3] font-bold hover:underline hidden md:block">View All Courses →</Link>
          </div>
          <div class="grid md:grid-cols-3 gap-5">
            {courses.map((course) => (
              <div key={course.title} class="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                <div class="h-32 bg-[#042e0d] flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div class="p-5">
                  <div class="flex gap-2 mb-3">
                    <span class={`text-xs font-bold px-2 py-0.5 rounded ${course.level === 'Beginner' ? 'bg-[#56c270]/10 text-[#042e0d]' : course.level === 'Advanced' ? 'bg-[#c3a859]/10 text-[#c3a859]' : 'bg-[#5974c3]/10 text-[#5974c3]'}`}>
                      {course.level}
                    </span>
                    <span class="text-xs text-gray-400">{course.duration}</span>
                  </div>
                  <h3 class="font-heading font-bold text-lg text-[#042e0d] mb-2">{course.title}</h3>
                  <p class="text-sm text-gray-500 mb-4">{course.description}</p>
                  <div class="flex justify-between items-center">
                    <span class="text-xs text-gray-400">{course.lessons} lessons</span>
                    <button class="bg-[#042e0d] text-white px-4 py-1.5 rounded text-sm font-bold hover:bg-[#042e0d]/80 transition-colors">
                      Start Course
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Design Tools */}
      <section id="tools" class="py-12 bg-white">
        <div class="container mx-auto px-4">
          <div class="text-center mb-10">
            <h2 class="font-heading font-extrabold text-2xl md:text-3xl text-[#042e0d]">Design Tools</h2>
            <p class="text-gray-500 mt-2 max-w-2xl mx-auto">
              Calculators and tools to help you size systems and select components.
            </p>
          </div>
          <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div class="bg-[#f1f1f2] rounded-lg p-5 text-center border border-gray-200">
              <div class="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-[#042e0d]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 class="font-heading font-bold text-[#042e0d] mb-1">Battery Sizing</h3>
              <p class="text-xs text-gray-500">Calculate battery bank capacity</p>
            </div>
            <div class="bg-[#f1f1f2] rounded-lg p-5 text-center border border-gray-200">
              <div class="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-[#042e0d]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 class="font-heading font-bold text-[#042e0d] mb-1">Array Sizing</h3>
              <p class="text-xs text-gray-500">Size PV arrays for loads</p>
            </div>
            <div class="bg-[#f1f1f2] rounded-lg p-5 text-center border border-gray-200">
              <div class="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-[#042e0d]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 class="font-heading font-bold text-[#042e0d] mb-1">Wire Sizing</h3>
              <p class="text-xs text-gray-500">Calculate conductor sizes</p>
            </div>
            <div class="bg-[#f1f1f2] rounded-lg p-5 text-center border border-gray-200">
              <div class="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-[#042e0d]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 class="font-heading font-bold text-[#042e0d] mb-1">String Calculator</h3>
              <p class="text-xs text-gray-500">Panel string configurations</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA - SOLID Forest Green */}
      <section class="bg-[#042e0d] py-10">
        <div class="container mx-auto px-4">
          <div class="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 class="font-heading font-extrabold text-2xl text-white">Have a technical question?</h3>
              <p class="text-white/70 mt-1">Our engineers are here to help with system design and troubleshooting.</p>
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
  title: 'Learning & Resources | Solamp Solar & Energy Storage',
  meta: [
    {
      name: 'description',
      content: 'Solar installation guides, training courses, product documentation, and design tools for professional installers.',
    },
  ],
};
