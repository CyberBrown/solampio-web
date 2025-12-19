import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';

export default component$(() => {
  return (
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div class="container mx-auto px-4 py-16">
        <div class="max-w-4xl mx-auto text-center">
          <h1 class="text-5xl font-bold text-gray-900 mb-6">
            Welcome to SolampIO
          </h1>
          <p class="text-xl text-gray-700 mb-8">
            The B2B Solar Industry Platform
          </p>
          <div class="bg-white rounded-lg shadow-xl p-8 mb-8">
            <h2 class="text-2xl font-semibold text-gray-800 mb-4">
              Powering the Solar Revolution
            </h2>
            <p class="text-gray-600 mb-6">
              SolampIO connects solar businesses with cutting-edge tools and analytics
              to streamline operations, maximize efficiency, and accelerate growth.
            </p>
            <button class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors">
              Get Started
            </button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-white rounded-lg shadow-md p-6">
              <h3 class="text-lg font-semibold text-gray-800 mb-2">Analytics</h3>
              <p class="text-gray-600">Real-time insights for solar operations</p>
            </div>
            <div class="bg-white rounded-lg shadow-md p-6">
              <h3 class="text-lg font-semibold text-gray-800 mb-2">Integration</h3>
              <p class="text-gray-600">Seamless connection with existing systems</p>
            </div>
            <div class="bg-white rounded-lg shadow-md p-6">
              <h3 class="text-lg font-semibold text-gray-800 mb-2">Automation</h3>
              <p class="text-gray-600">Streamline workflows and reduce costs</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'SolampIO - B2B Solar Industry Platform',
  meta: [
    {
      name: 'description',
      content: 'SolampIO is the leading B2B platform for the solar industry',
    },
  ],
};
