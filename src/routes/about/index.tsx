import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { Link } from '@builder.io/qwik-city';

const team = [
  { name: 'Sarah Chen', role: 'CEO & Co-Founder', bio: 'Former VP at SunPower with 15+ years in solar.' },
  { name: 'Marcus Rodriguez', role: 'CTO & Co-Founder', bio: 'Ex-Google engineer, solar tech enthusiast.' },
  { name: 'Emma Thompson', role: 'Head of Product', bio: 'Product leader from Tesla Energy division.' },
  { name: 'David Kim', role: 'VP of Engineering', bio: 'Built systems at scale for AWS and Microsoft.' },
];

const values = [
  {
    title: 'Innovation',
    description: 'Pushing the boundaries of what\'s possible in solar technology.',
    icon: '💡',
  },
  {
    title: 'Sustainability',
    description: 'Committed to a cleaner, more sustainable energy future.',
    icon: '🌱',
  },
  {
    title: 'Reliability',
    description: 'Building systems our customers can depend on 24/7.',
    icon: '🛡️',
  },
  {
    title: 'Partnership',
    description: 'Growing together with our customers and the industry.',
    icon: '🤝',
  },
];

export default component$(() => {
  return (
    <div class="bg-base-200 min-h-screen">
      {/* Hero */}
      <div class="hero bg-gradient-to-br from-secondary to-neutral text-white py-20">
        <div class="hero-content text-center">
          <div class="max-w-3xl">
            <h1 class="text-4xl md:text-5xl font-bold mb-6">About SolampIO</h1>
            <p class="text-lg md:text-xl opacity-90">
              We're on a mission to accelerate the world's transition to solar energy through innovative B2B technology solutions.
            </p>
          </div>
        </div>
      </div>

      {/* Story */}
      <div class="container mx-auto px-4 py-16">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span class="badge badge-primary mb-4">Our Story</span>
            <h2 class="text-3xl font-bold mb-6">Building the Future of Solar</h2>
            <p class="text-base-content/70 mb-4">
              Founded in 2020, SolampIO emerged from a simple observation: the solar industry was growing rapidly, but the tools available to businesses were outdated and disconnected.
            </p>
            <p class="text-base-content/70 mb-4">
              Our founders, veterans of the energy and tech industries, set out to build a comprehensive platform that would help solar businesses operate more efficiently, make better decisions, and ultimately accelerate the adoption of clean energy.
            </p>
            <p class="text-base-content/70">
              Today, we serve thousands of solar professionals across the globe, from small installers to large utility companies, all working together toward a sustainable future.
            </p>
          </div>
          <div class="bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl p-8 aspect-video flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-32 w-32 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Values */}
      <div class="bg-base-100 py-16">
        <div class="container mx-auto px-4">
          <div class="text-center mb-12">
            <h2 class="text-3xl font-bold mb-4">Our Values</h2>
            <p class="text-base-content/70 max-w-2xl mx-auto">
              These core principles guide everything we do at SolampIO.
            </p>
          </div>
          <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <div key={value.title} class="card bg-base-200 hover:bg-base-300 transition-colors">
                <div class="card-body items-center text-center">
                  <span class="text-4xl mb-2">{value.icon}</span>
                  <h3 class="card-title">{value.title}</h3>
                  <p class="text-sm text-base-content/70">{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div class="container mx-auto px-4 py-16">
        <div class="stats shadow w-full bg-base-100">
          <div class="stat">
            <div class="stat-title">Customers</div>
            <div class="stat-value text-primary">5,000+</div>
            <div class="stat-desc">Solar businesses worldwide</div>
          </div>
          <div class="stat">
            <div class="stat-title">Installations Monitored</div>
            <div class="stat-value text-secondary">250K+</div>
            <div class="stat-desc">Across 40 countries</div>
          </div>
          <div class="stat">
            <div class="stat-title">Energy Tracked</div>
            <div class="stat-value text-accent">50 GWh</div>
            <div class="stat-desc">Monthly production monitored</div>
          </div>
          <div class="stat">
            <div class="stat-title">Team Size</div>
            <div class="stat-value">150+</div>
            <div class="stat-desc">Experts in solar & tech</div>
          </div>
        </div>
      </div>

      {/* Team */}
      <div class="bg-base-100 py-16">
        <div class="container mx-auto px-4">
          <div class="text-center mb-12">
            <h2 class="text-3xl font-bold mb-4">Leadership Team</h2>
            <p class="text-base-content/70 max-w-2xl mx-auto">
              Experienced leaders from the solar, energy, and technology industries.
            </p>
          </div>
          <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member) => (
              <div key={member.name} class="card bg-base-200">
                <div class="card-body items-center text-center">
                  <div class="avatar placeholder mb-4">
                    <div class="bg-primary text-primary-content rounded-full w-24">
                      <span class="text-3xl">{member.name.charAt(0)}</span>
                    </div>
                  </div>
                  <h3 class="font-bold">{member.name}</h3>
                  <p class="text-sm text-primary">{member.role}</p>
                  <p class="text-sm text-base-content/60">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div class="bg-secondary text-secondary-content py-12">
        <div class="container mx-auto px-4 text-center">
          <h2 class="text-2xl font-bold mb-4">Join Our Mission</h2>
          <p class="opacity-90 mb-6">We're always looking for talented people who share our vision.</p>
          <div class="flex flex-wrap justify-center gap-4">
            <button class="btn btn-accent">View Open Positions</button>
            <Link href="/contact" class="btn btn-outline btn-white">
              Get in Touch
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'About Us - SolampIO',
  meta: [
    {
      name: 'description',
      content: 'Learn about SolampIO\'s mission to accelerate the solar energy transition through innovative technology.',
    },
  ],
};
