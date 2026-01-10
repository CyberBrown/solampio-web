import { component$ } from '@builder.io/qwik';
import { routeLoader$, Link } from '@builder.io/qwik-city';
import type { DocumentHead } from '@builder.io/qwik-city';
import { getArticlesBySection, type Article } from '~/lib/db';

export const useVideos = routeLoader$(async ({ platform }) => {
  try {
    const db = platform.env?.DB;
    if (!db) return [];
    return await getArticlesBySection(db, 'videos');
  } catch {
    return [];
  }
});

export default component$(() => {
  const videos = useVideos();

  return (
    <div class="bg-white min-h-screen">
      {/* Hero */}
      <section class="bg-[#56c270] py-10">
        <div class="container mx-auto px-4">
          <nav class="text-sm mb-4">
            <Link href="/learn/" class="text-white/60 hover:text-white">Learn</Link>
            <span class="text-white/40 mx-2">/</span>
            <Link href="/learn/archives/" class="text-white/60 hover:text-white">Archives</Link>
            <span class="text-white/40 mx-2">/</span>
            <span class="text-white">Videos</span>
          </nav>
          <h1 class="font-heading font-extrabold text-2xl md:text-3xl text-white mb-2">
            Video Library
          </h1>
          <p class="text-white/80 max-w-2xl">
            Product demos, installation tutorials, and educational videos for professional installers.
          </p>
        </div>
      </section>

      {/* Videos Grid */}
      <section class="py-8">
        <div class="container mx-auto px-4">
          {videos.value.length === 0 ? (
            <div class="text-center py-12 bg-gray-50 rounded-lg max-w-2xl mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 class="font-heading font-bold text-gray-600 mb-2">No videos yet</h2>
              <p class="text-gray-500 text-sm">
                Video content is being added. Check back soon.
              </p>
            </div>
          ) : (
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
              {videos.value.map((video: Article) => (
                <Link
                  key={video.id}
                  href={`/learn/archives/videos/${video.slug}/`}
                  class="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg hover:border-[#56c270] transition-all group"
                >
                  {/* Video Thumbnail Placeholder */}
                  <div class="aspect-video bg-[#042e0d] flex items-center justify-center relative">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {/* Play Button Overlay */}
                    <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div class="w-14 h-14 bg-[#56c270] rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div class="p-4">
                    <h2 class="font-heading font-bold text-[#042e0d] group-hover:text-[#56c270] transition-colors mb-1">
                      {video.title}
                    </h2>
                    {video.excerpt && (
                      <p class="text-sm text-gray-500 line-clamp-2">{video.excerpt}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Back Link */}
      <section class="py-6 border-t border-gray-100">
        <div class="container mx-auto px-4">
          <Link href="/learn/archives/" class="text-[#5974c3] text-sm font-semibold hover:underline inline-flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Archives
          </Link>
        </div>
      </section>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Video Library | Cleantech Archives | Solamp',
  meta: [
    {
      name: 'description',
      content: 'Product demos, installation tutorials, and educational videos for professional solar installers.',
    },
  ],
};
