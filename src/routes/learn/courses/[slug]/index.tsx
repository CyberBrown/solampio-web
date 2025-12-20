import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { useLocation, Link } from '@builder.io/qwik-city';

export default component$(() => {
  const loc = useLocation();
  const slug = loc.params.slug;

  // Format slug to title
  const title = slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <div class="bg-white min-h-screen">
      {/* Header */}
      <section class="bg-[#042e0d] py-8">
        <div class="container mx-auto px-4">
          <nav class="mb-4">
            <ol class="flex items-center gap-2 text-sm flex-wrap">
              <li><Link href="/" class="text-white/50 hover:text-white transition-colors">Home</Link></li>
              <li class="text-white/30">/</li>
              <li><Link href="/learn/" class="text-white/50 hover:text-white transition-colors">Learn</Link></li>
              <li class="text-white/30">/</li>
              <li><Link href="/learn/courses/" class="text-white/50 hover:text-white transition-colors">Courses</Link></li>
              <li class="text-white/30">/</li>
              <li class="text-white font-semibold">{title}</li>
            </ol>
          </nav>
          <div class="max-w-3xl">
            <div class="flex items-center gap-3 mb-3">
              <span class="text-xs font-bold px-2 py-1 rounded bg-[#56c270]/20 text-[#56c270]">Beginner</span>
              <span class="text-sm text-white/60">4 hours | 12 lessons</span>
            </div>
            <h1 class="font-heading font-extrabold text-2xl md:text-3xl text-white mb-3">
              {title}
            </h1>
            <p class="text-white/80">
              Core concepts of PV systems, components, and installation basics for solar professionals.
            </p>
          </div>
        </div>
      </section>

      {/* Course Content */}
      <section class="py-10">
        <div class="container mx-auto px-4">
          <div class="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div class="lg:col-span-2">
              {/* Moodle Embed Placeholder */}
              <div class="bg-[#f1f1f2] border border-gray-200 rounded-lg p-8 text-center mb-8">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-20 w-20 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-gray-500 mb-2">Course content will be embedded from Moodle LMS</p>
                <p class="text-sm text-gray-400 mb-4">Source: learn.solampio.com</p>
                <a
                  href="https://learn.solampio.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-2 bg-[#042e0d] text-white font-bold px-6 py-3 rounded hover:bg-[#042e0d]/80 transition-colors"
                >
                  Open in Moodle
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>

              {/* Course Overview */}
              <div class="mb-8">
                <h2 class="font-heading font-bold text-xl text-[#042e0d] mb-4">Course Overview</h2>
                <p class="text-gray-600 mb-4">
                  This comprehensive course covers the fundamentals of solar photovoltaic systems.
                  You'll learn about solar panel technology, system components, basic electrical concepts,
                  and installation best practices.
                </p>
                <p class="text-gray-600">
                  Upon completion, you'll have the foundational knowledge needed to assist with solar
                  installations and continue to more advanced training.
                </p>
              </div>

              {/* What You'll Learn */}
              <div class="mb-8">
                <h2 class="font-heading font-bold text-xl text-[#042e0d] mb-4">What You'll Learn</h2>
                <ul class="grid md:grid-cols-2 gap-3">
                  {[
                    'Solar panel types and technologies',
                    'System component identification',
                    'Basic electrical concepts for solar',
                    'Site assessment fundamentals',
                    'Safety protocols and requirements',
                    'Tools and equipment overview',
                    'Code compliance basics',
                    'Troubleshooting introduction',
                  ].map((item) => (
                    <li key={item} class="flex items-start gap-2 text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#56c270] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Lessons */}
              <div>
                <h2 class="font-heading font-bold text-xl text-[#042e0d] mb-4">Course Lessons</h2>
                <div class="space-y-3">
                  {[
                    { num: 1, title: 'Introduction to Solar Energy', duration: '15 min' },
                    { num: 2, title: 'How Solar Panels Work', duration: '20 min' },
                    { num: 3, title: 'Types of Solar Panels', duration: '25 min' },
                    { num: 4, title: 'Inverters and Power Conversion', duration: '20 min' },
                    { num: 5, title: 'Battery Storage Basics', duration: '20 min' },
                    { num: 6, title: 'Balance of System Components', duration: '15 min' },
                    { num: 7, title: 'Electrical Fundamentals', duration: '25 min' },
                    { num: 8, title: 'Site Assessment', duration: '20 min' },
                    { num: 9, title: 'Safety and PPE', duration: '15 min' },
                    { num: 10, title: 'Installation Overview', duration: '25 min' },
                    { num: 11, title: 'Code and Permitting Basics', duration: '20 min' },
                    { num: 12, title: 'Course Summary and Quiz', duration: '20 min' },
                  ].map((lesson) => (
                    <div key={lesson.num} class="flex items-center justify-between bg-[#f1f1f2] rounded-lg p-4 border border-gray-200">
                      <div class="flex items-center gap-4">
                        <span class="w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm font-bold text-[#042e0d] border border-gray-200">
                          {lesson.num}
                        </span>
                        <span class="font-medium text-[#042e0d]">{lesson.title}</span>
                      </div>
                      <span class="text-sm text-gray-400">{lesson.duration}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div class="lg:col-span-1">
              <div class="sticky top-24 space-y-6">
                {/* Enroll Card */}
                <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-lg">
                  <p class="text-sm text-gray-500 mb-1">Course Access</p>
                  <p class="font-heading font-extrabold text-2xl text-[#042e0d] mb-4">Free for Customers</p>
                  <a
                    href="https://learn.solampio.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="block w-full bg-[#56c270] text-[#042e0d] font-heading font-bold py-3 rounded text-center hover:bg-[#042e0d] hover:text-white transition-colors mb-3"
                  >
                    Start Course
                  </a>
                  <p class="text-xs text-gray-400 text-center">
                    Requires Solamp customer account
                  </p>
                </div>

                {/* Course Info */}
                <div class="bg-[#f1f1f2] border border-gray-200 rounded-lg p-6">
                  <h3 class="font-heading font-bold text-[#042e0d] mb-4">Course Details</h3>
                  <div class="space-y-3 text-sm">
                    <div class="flex justify-between">
                      <span class="text-gray-500">Duration</span>
                      <span class="font-semibold text-[#042e0d]">4 hours</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-500">Lessons</span>
                      <span class="font-semibold text-[#042e0d]">12</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-500">Level</span>
                      <span class="font-semibold text-[#042e0d]">Beginner</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-500">Certificate</span>
                      <span class="font-semibold text-[#042e0d]">Yes</span>
                    </div>
                  </div>
                </div>

                {/* Prerequisites */}
                <div class="bg-[#f1f1f2] border border-gray-200 rounded-lg p-6">
                  <h3 class="font-heading font-bold text-[#042e0d] mb-4">Prerequisites</h3>
                  <ul class="space-y-2 text-sm text-gray-600">
                    <li class="flex items-start gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#c3a859] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      No prior solar experience required
                    </li>
                    <li class="flex items-start gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#c3a859] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Basic understanding of electricity helpful
                    </li>
                  </ul>
                </div>

                {/* Help */}
                <div class="text-center">
                  <p class="text-sm text-gray-500 mb-2">Questions about this course?</p>
                  <a href="tel:978-451-6890" class="text-[#5974c3] font-bold hover:underline">
                    Call 978-451-6890
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Courses */}
      <section class="py-10 bg-[#f1f1f2]">
        <div class="container mx-auto px-4">
          <h2 class="font-heading font-bold text-xl text-[#042e0d] mb-6">Continue Learning</h2>
          <div class="grid md:grid-cols-3 gap-5">
            {[
              { title: 'Battery Storage Design', level: 'Intermediate', slug: 'battery-storage-design' },
              { title: 'Off-Grid System Design', level: 'Advanced', slug: 'off-grid-system-design' },
              { title: 'Commercial Solar', level: 'Intermediate', slug: 'commercial-solar' },
            ].map((course) => (
              <Link key={course.slug} href={`/learn/courses/${course.slug}/`} class="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-lg hover:border-[#042e0d] transition-all group">
                <span class={`text-xs font-bold px-2 py-1 rounded ${course.level === 'Intermediate' ? 'bg-[#5974c3]/10 text-[#5974c3]' : 'bg-[#c3a859]/10 text-[#c3a859]'}`}>
                  {course.level}
                </span>
                <h3 class="font-heading font-bold text-[#042e0d] group-hover:text-[#5974c3] transition-colors mt-3">{course.title}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section class="bg-[#042e0d] py-10">
        <div class="container mx-auto px-4">
          <div class="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 class="font-heading font-extrabold text-2xl text-white">Ready to get started?</h3>
              <p class="text-white/70 mt-1">Create your free learning account today.</p>
            </div>
            <a
              href="https://learn.solampio.com"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 bg-[#56c270] text-[#042e0d] font-heading font-bold px-6 py-3 rounded hover:bg-white transition-colors"
            >
              Access Moodle LMS
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
});

export const head: DocumentHead = ({ params }) => {
  const title = params.slug
    .split('-')
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    title: `${title} | Training Courses | Solamp Solar & Energy Storage`,
    meta: [
      {
        name: 'description',
        content: `${title} - Professional solar training course from Solamp. Learn at your own pace with our Moodle LMS.`,
      },
    ],
  };
};
