import { component$ } from '@builder.io/qwik';
import { routeLoader$, Link } from '~/lib/qwik-city';
import type { DocumentHead } from '~/lib/qwik-city';
import { getArticleBySlug, parseArticleTags, parseRelatedArticles, getRelatedArticlesBySlugs, type Article } from '~/lib/db';

export const useVideo = routeLoader$(async ({ params, platform, status }) => {
  try {
    const db = platform.env?.DB;
    if (!db) {
      status(500);
      return { video: null, related: [] };
    }

    const video = await getArticleBySlug(db, params.slug);
    if (!video || video.section !== 'videos') {
      status(404);
      return { video: null, related: [] };
    }

    // Fetch related videos if any
    const relatedSlugs = parseRelatedArticles(video.related_articles);
    const related = relatedSlugs.length > 0
      ? await getRelatedArticlesBySlugs(db, relatedSlugs)
      : [];

    return { video, related };
  } catch {
    status(500);
    return { video: null, related: [] };
  }
});

export default component$(() => {
  const data = useVideo();

  if (!data.value.video) {
    return (
      <div class="bg-white min-h-screen">
        <section class="py-16">
          <div class="container mx-auto px-4 text-center">
            <h1 class="font-heading font-bold text-2xl text-gray-800 mb-4">Video Not Found</h1>
            <p class="text-gray-500 mb-6">The video you're looking for doesn't exist or has been moved.</p>
            <Link href="/learn/archives/videos/" class="text-[#5974c3] font-semibold hover:underline">
              Browse all Videos
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const video = data.value.video;
  const related = data.value.related;
  const tags = parseArticleTags(video.tags);

  return (
    <div class="bg-white min-h-screen">
      {/* Header */}
      <section class="bg-[#56c270] py-6">
        <div class="container mx-auto px-4">
          <nav class="text-sm mb-3">
            <Link href="/learn/" class="text-white/60 hover:text-white">Learn</Link>
            <span class="text-white/40 mx-2">/</span>
            <Link href="/learn/archives/" class="text-white/60 hover:text-white">Archives</Link>
            <span class="text-white/40 mx-2">/</span>
            <Link href="/learn/archives/videos/" class="text-white/60 hover:text-white">Videos</Link>
          </nav>
          <h1 class="font-heading font-extrabold text-2xl md:text-3xl text-white">
            {video.title}
          </h1>
          {tags.length > 0 && (
            <div class="flex flex-wrap gap-2 mt-3">
              {tags.map((tag: string) => (
                <span key={tag} class="text-xs bg-white/10 text-white/80 px-2 py-1 rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Video Player Area */}
      <section class="bg-[#042e0d]">
        <div class="container mx-auto px-4">
          <div class="max-w-4xl mx-auto">
            {/* Video embed placeholder - content field may contain iframe or video URL */}
            <div class="aspect-video bg-black flex items-center justify-center">
              {video.content.includes('<iframe') || video.content.includes('<video') ? (
                <div
                  class="w-full h-full"
                  dangerouslySetInnerHTML={video.content}
                />
              ) : (
                <div class="text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-20 w-20 text-white/20 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p class="text-white/40">Video player</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Description */}
      <article class="py-8">
        <div class="container mx-auto px-4">
          <div class="max-w-4xl mx-auto">
            {video.excerpt && (
              <p class="text-lg text-gray-600 mb-6">
                {video.excerpt}
              </p>
            )}
            {/* Show content as description if not embedded video */}
            {!video.content.includes('<iframe') && !video.content.includes('<video') && (
              <div
                class="prose prose-lg max-w-none prose-headings:font-heading prose-headings:text-[#042e0d] prose-a:text-[#5974c3]"
                dangerouslySetInnerHTML={video.content}
              />
            )}
          </div>
        </div>
      </article>

      {/* Related Videos */}
      {related.length > 0 && (
        <section class="py-8 bg-[#f1f1f2] border-t border-gray-200">
          <div class="container mx-auto px-4">
            <h2 class="font-heading font-bold text-lg text-[#042e0d] mb-4">Related Videos</h2>
            <div class="grid md:grid-cols-3 gap-4 max-w-4xl">
              {related.map((relatedVideo: Article) => (
                <Link
                  key={relatedVideo.id}
                  href={`/learn/archives/${relatedVideo.section}/${relatedVideo.slug}/`}
                  class="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md hover:border-[#56c270] transition-all group"
                >
                  <div class="aspect-video bg-[#042e0d] flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div class="p-3">
                    <h3 class="font-heading font-bold text-sm text-[#042e0d] group-hover:text-[#56c270] transition-colors">
                      {relatedVideo.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Navigation */}
      <section class="py-6 border-t border-gray-100">
        <div class="container mx-auto px-4">
          <Link href="/learn/archives/videos/" class="text-[#5974c3] text-sm font-semibold hover:underline inline-flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Video Library
          </Link>
        </div>
      </section>
    </div>
  );
});

export const head: DocumentHead = ({ resolveValue }) => {
  const data = resolveValue(useVideo);
  const video = data?.video;

  return {
    title: video ? `${video.title} | Video Library | Solamp` : 'Video Not Found | Solamp',
    meta: [
      {
        name: 'description',
        content: video?.excerpt || 'Product demos, installation tutorials, and educational videos from the Cleantech Archives.',
      },
    ],
  };
};
