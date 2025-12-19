import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { Link } from '@builder.io/qwik-city';

const courses = [
  {
    id: 1,
    title: 'Solar Fundamentals 101',
    description: 'A comprehensive introduction to solar energy systems, components, and basic installation principles.',
    level: 'Beginner',
    duration: '4 hours',
    lessons: 12,
    rating: 4.8,
    students: 2453,
  },
  {
    id: 2,
    title: 'Advanced Solar Analytics',
    description: 'Master data-driven decision making for solar operations with advanced analytics techniques.',
    level: 'Advanced',
    duration: '6 hours',
    lessons: 18,
    rating: 4.9,
    students: 1287,
  },
  {
    id: 3,
    title: 'Grid Integration Essentials',
    description: 'Learn to connect solar systems with utility grids while maintaining compliance and efficiency.',
    level: 'Intermediate',
    duration: '5 hours',
    lessons: 15,
    rating: 4.7,
    students: 1892,
  },
  {
    id: 4,
    title: 'Solar System Design',
    description: 'Design optimal solar installations for residential and commercial applications.',
    level: 'Intermediate',
    duration: '8 hours',
    lessons: 24,
    rating: 4.8,
    students: 3201,
  },
  {
    id: 5,
    title: 'Maintenance & Troubleshooting',
    description: 'Identify and resolve common solar system issues with proven troubleshooting methodologies.',
    level: 'Intermediate',
    duration: '4 hours',
    lessons: 10,
    rating: 4.6,
    students: 1654,
  },
  {
    id: 6,
    title: 'Solar Sales Certification',
    description: 'Develop the skills to effectively communicate solar value propositions to customers.',
    level: 'Beginner',
    duration: '3 hours',
    lessons: 8,
    rating: 4.5,
    students: 987,
  },
];

export default component$(() => {
  return (
    <div class="bg-base-200 min-h-screen">
      {/* Breadcrumb */}
      <div class="bg-base-100 border-b">
        <div class="container mx-auto px-4 py-3">
          <div class="breadcrumbs text-sm">
            <ul>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/learn">Learn</Link></li>
              <li class="text-primary">Courses</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Header */}
      <div class="container mx-auto px-4 py-8">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 class="text-3xl font-bold">All Courses</h1>
            <p class="text-base-content/70">Browse our complete course catalog</p>
          </div>
          <div class="flex gap-2">
            <select class="select select-bordered select-sm">
              <option disabled selected>Filter by level</option>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
            <select class="select select-bordered select-sm">
              <option disabled selected>Sort by</option>
              <option>Most Popular</option>
              <option>Highest Rated</option>
              <option>Newest</option>
            </select>
          </div>
        </div>

        {/* Course Grid */}
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} class="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
              <figure class="px-4 pt-4">
                <div class="w-full h-40 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center relative">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span class={`badge absolute top-2 right-2 ${course.level === 'Beginner' ? 'badge-success' : course.level === 'Advanced' ? 'badge-error' : 'badge-warning'}`}>
                    {course.level}
                  </span>
                </div>
              </figure>
              <div class="card-body">
                <h2 class="card-title text-lg">{course.title}</h2>
                <p class="text-sm text-base-content/70 line-clamp-2">{course.description}</p>

                <div class="flex items-center gap-4 text-sm text-base-content/60 mt-2">
                  <span class="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {course.duration}
                  </span>
                  <span>{course.lessons} lessons</span>
                </div>

                <div class="flex items-center justify-between mt-4 pt-4 border-t">
                  <div class="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-accent" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <span class="font-medium">{course.rating}</span>
                    <span class="text-base-content/50">({course.students.toLocaleString()})</span>
                  </div>
                  <button class="btn btn-primary btn-sm">Enroll</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div class="flex justify-center mt-12">
          <div class="join">
            <button class="join-item btn btn-sm">«</button>
            <button class="join-item btn btn-sm btn-active">1</button>
            <button class="join-item btn btn-sm">2</button>
            <button class="join-item btn btn-sm">3</button>
            <button class="join-item btn btn-sm">»</button>
          </div>
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Courses - SolampIO Learning Hub',
  meta: [
    {
      name: 'description',
      content: 'Browse all SolampIO courses and start your solar energy learning journey.',
    },
  ],
};
