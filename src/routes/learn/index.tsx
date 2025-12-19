import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { Link } from '@builder.io/qwik-city';

const featuredCourses = [
  {
    title: 'Solar Fundamentals',
    description: 'Master the basics of solar energy systems and installation.',
    level: 'Beginner',
    duration: '4 hours',
    lessons: 12,
  },
  {
    title: 'Advanced Analytics',
    description: 'Learn to leverage data for optimal solar performance.',
    level: 'Advanced',
    duration: '6 hours',
    lessons: 18,
  },
  {
    title: 'System Integration',
    description: 'Connect solar systems with smart grid infrastructure.',
    level: 'Intermediate',
    duration: '5 hours',
    lessons: 15,
  },
];

const resources = [
  { title: 'Technical Whitepapers', count: 25 },
  { title: 'Case Studies', count: 40 },
  { title: 'Webinar Recordings', count: 18 },
  { title: 'Industry Reports', count: 12 },
];

export default component$(() => {
  return (
    <div class="bg-base-200 min-h-screen">
      {/* Hero */}
      <div class="hero bg-gradient-to-br from-primary to-accent text-white py-20">
        <div class="hero-content text-center">
          <div class="max-w-3xl">
            <h1 class="text-4xl md:text-5xl font-bold mb-6">Learning Hub</h1>
            <p class="text-lg md:text-xl opacity-90 mb-8">
              Accelerate your solar expertise with comprehensive courses, certifications, and resources from industry experts.
            </p>
            <div class="flex flex-wrap justify-center gap-4">
              <Link href="/learn/courses" class="btn btn-secondary">
                Browse Courses
              </Link>
              <button class="btn btn-outline btn-white">
                Get Certified
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div class="container mx-auto px-4 -mt-8">
        <div class="stats shadow w-full">
          <div class="stat">
            <div class="stat-figure text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div class="stat-title">Courses</div>
            <div class="stat-value text-primary">45+</div>
          </div>
          <div class="stat">
            <div class="stat-figure text-secondary">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div class="stat-title">Students</div>
            <div class="stat-value text-secondary">12K+</div>
          </div>
          <div class="stat">
            <div class="stat-figure text-accent">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div class="stat-title">Certified</div>
            <div class="stat-value text-accent">3.5K+</div>
          </div>
        </div>
      </div>

      {/* Featured Courses */}
      <div class="container mx-auto px-4 py-16">
        <div class="flex justify-between items-center mb-8">
          <h2 class="text-3xl font-bold">Featured Courses</h2>
          <Link href="/learn/courses" class="btn btn-ghost btn-sm">
            View All →
          </Link>
        </div>
        <div class="grid md:grid-cols-3 gap-6">
          {featuredCourses.map((course) => (
            <div key={course.title} class="card bg-base-100 shadow-xl">
              <figure class="px-4 pt-4">
                <div class="w-full h-32 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-xl flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </figure>
              <div class="card-body">
                <div class="flex gap-2 mb-2">
                  <span class={`badge badge-sm ${course.level === 'Beginner' ? 'badge-success' : course.level === 'Advanced' ? 'badge-error' : 'badge-warning'}`}>
                    {course.level}
                  </span>
                  <span class="badge badge-sm badge-ghost">{course.duration}</span>
                </div>
                <h3 class="card-title">{course.title}</h3>
                <p class="text-base-content/70 text-sm">{course.description}</p>
                <div class="flex justify-between items-center mt-4">
                  <span class="text-sm text-base-content/60">{course.lessons} lessons</span>
                  <button class="btn btn-primary btn-sm">Start Learning</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resources */}
      <div class="bg-base-100 py-16">
        <div class="container mx-auto px-4">
          <h2 class="text-3xl font-bold mb-8 text-center">Resources Library</h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            {resources.map((resource) => (
              <div key={resource.title} class="card bg-base-200 hover:bg-base-300 transition-colors cursor-pointer">
                <div class="card-body items-center text-center">
                  <h3 class="font-semibold">{resource.title}</h3>
                  <p class="text-2xl font-bold text-primary">{resource.count}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div class="bg-secondary text-secondary-content py-12">
        <div class="container mx-auto px-4 text-center">
          <h2 class="text-2xl font-bold mb-4">Ready to become a solar expert?</h2>
          <p class="opacity-90 mb-6">Start your learning journey today with our free introductory course.</p>
          <button class="btn btn-accent">Start Free Course</button>
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Learning Hub - SolampIO',
  meta: [
    {
      name: 'description',
      content: 'Expand your solar knowledge with SolampIO\'s comprehensive courses and resources.',
    },
  ],
};
