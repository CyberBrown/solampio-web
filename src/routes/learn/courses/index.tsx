import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { Link } from '@builder.io/qwik-city';

const courses = [
  {
    id: 1,
    title: 'Solar Fundamentals 101',
    description: 'Core concepts of photovoltaic systems, components, and basic installation principles for new installers.',
    level: 'Beginner',
    duration: '4 hours',
    lessons: 12,
  },
  {
    id: 2,
    title: 'Battery Storage Design',
    description: 'Design and size energy storage systems for residential and commercial solar applications.',
    level: 'Intermediate',
    duration: '6 hours',
    lessons: 18,
  },
  {
    id: 3,
    title: 'Off-Grid System Design',
    description: 'Complete off-grid system sizing, component selection, and installation for cabins and remote sites.',
    level: 'Advanced',
    duration: '8 hours',
    lessons: 24,
  },
  {
    id: 4,
    title: 'MPPT Controller Programming',
    description: 'Configure and optimize MPPT charge controllers from MidNite, Morningstar, and Victron.',
    level: 'Intermediate',
    duration: '3 hours',
    lessons: 8,
  },
  {
    id: 5,
    title: 'Grid-Tie Installation',
    description: 'Install and commission grid-tied solar systems including interconnection requirements.',
    level: 'Intermediate',
    duration: '5 hours',
    lessons: 15,
  },
  {
    id: 6,
    title: 'Hybrid Inverter Systems',
    description: 'Design and install hybrid inverter systems with battery backup for whole-home protection.',
    level: 'Advanced',
    duration: '6 hours',
    lessons: 16,
  },
];

export default component$(() => {
  return (
    <div class="bg-white min-h-screen">
      {/* Breadcrumb */}
      <section class="bg-[#f1f1f2] border-b border-gray-200">
        <div class="container mx-auto px-4 py-3">
          <nav class="text-sm">
            <ol class="flex items-center gap-2">
              <li><Link href="/" class="text-gray/50 hover:text-[#042e0d] transition-colors">Home</Link></li>
              <li class="text-gray/30">/</li>
              <li><Link href="/learn/" class="text-gray/50 hover:text-[#042e0d] transition-colors">Learn</Link></li>
              <li class="text-gray/30">/</li>
              <li class="text-[#042e0d] font-semibold">Courses</li>
            </ol>
          </nav>
        </div>
      </section>

      {/* Header */}
      <section class="py-10 bg-white">
        <div class="container mx-auto px-4">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 class="font-heading font-extrabold text-3xl text-[#042e0d]">Training Courses</h1>
              <p class="text-gray/60 mt-1">Structured learning for solar professionals</p>
            </div>
            <div class="flex gap-2">
              <select class="border border-gray-200 bg-white px-3 py-2 text-sm rounded focus:outline-none focus:border-primary">
                <option disabled selected>Filter by level</option>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
              <select class="border border-gray-200 bg-white px-3 py-2 text-sm rounded focus:outline-none focus:border-primary">
                <option disabled selected>Sort by</option>
                <option>Most Popular</option>
                <option>Duration</option>
                <option>Level</option>
              </select>
            </div>
          </div>

          {/* Course Grid */}
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course.id} class="bg-[#f1f1f2] border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg hover:border-primary transition-all group">
                <div class="h-36 bg-gradient-to-br from-primary to-solamp-forest flex items-center justify-center relative">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-14 w-14 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span class={`absolute top-3 right-3 text-xs font-bold px-2 py-1 rounded ${course.level === 'Beginner' ? 'bg-[#56c270] text-[#042e0d]' : course.level === 'Advanced' ? 'bg-[#c3a859] text-white' : 'bg-solamp-blue text-white'}`}>
                    {course.level}
                  </span>
                </div>
                <div class="p-5">
                  <h2 class="font-heading font-bold text-lg text-[#042e0d] group-hover:text-[#5974c3] transition-colors mb-2">{course.title}</h2>
                  <p class="text-sm text-gray/60 mb-4 line-clamp-2">{course.description}</p>

                  <div class="flex items-center gap-4 text-sm text-gray/50 mb-4">
                    <span class="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {course.duration}
                    </span>
                    <span>{course.lessons} lessons</span>
                  </div>

                  <button class="w-full bg-[#042e0d] text-white font-heading font-bold py-2 rounded hover:bg-[#042e0d] transition-colors">
                    Start Course
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section class="bg-[#042e0d] py-10">
        <div class="container mx-auto px-4">
          <div class="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 class="font-heading font-extrabold text-2xl text-white">Need training for your team?</h3>
              <p class="text-white/70 mt-1">Contact us about custom training programs for installers.</p>
            </div>
            <Link href="/contact-us/" class="inline-flex items-center gap-2 bg-[#c3a859] text-white font-heading font-bold px-6 py-3 rounded hover:bg-[#c3a859]/80 transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Training Courses | Solamp Solar & Energy Storage',
  meta: [
    {
      name: 'description',
      content: 'Solar installation training courses for professional installers. From fundamentals to advanced system design.',
    },
  ],
};
