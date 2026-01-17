import { component$, useSignal, useVisibleTask$, $, type Signal } from '@builder.io/qwik';
import type { ProductImage } from '../../lib/db';
import { getCfImageUrl, type ImageVariant } from '../../lib/images';

export interface GalleryImage {
  cf_image_id: string;
  thumbnail_url: string;
  image_url: string;
  sort_order: number;
  is_primary: number;
}

export interface ProductImageGalleryProps {
  images: GalleryImage[];
  productTitle: string;
  fallbackImage?: string | null;
  selectedImageIndex?: Signal<number>;
}

/**
 * Get the best URL for a gallery image at the specified variant
 * Prefers CF Images, falls back to stored URLs
 */
function getGalleryImageUrl(image: GalleryImage, variant: ImageVariant): string | null {
  if (image.cf_image_id) {
    return getCfImageUrl(image.cf_image_id, variant);
  }
  // Fallback based on variant
  if (variant === 'thumbnail') {
    return image.thumbnail_url || image.image_url;
  }
  return image.image_url || image.thumbnail_url;
}

export default component$<ProductImageGalleryProps>(({
  images,
  productTitle,
  fallbackImage,
  selectedImageIndex: externalIndex
}) => {
  // Image selection state
  const internalIndex = useSignal(0);
  const selectedIndex = externalIndex || internalIndex;

  // Zoom state
  const isZooming = useSignal(false);
  const zoomPosition = useSignal({ x: 50, y: 50 });
  const lensPosition = useSignal({ x: 0, y: 0 });

  // Mobile lightbox state
  const isLightboxOpen = useSignal(false);
  const lightboxScale = useSignal(1);
  const lightboxOffset = useSignal({ x: 0, y: 0 });

  // Touch handling for swipe
  const touchStart = useSignal({ x: 0, y: 0 });
  const isDragging = useSignal(false);

  // Thumbnail scroll
  const thumbnailContainerRef = useSignal<HTMLDivElement>();
  const canScrollLeft = useSignal(false);
  const canScrollRight = useSignal(false);

  // Determine if we have images to show
  const hasImages = images.length > 0;
  const hasMultipleImages = images.length > 1;

  // Get current image URLs
  const currentImage = hasImages ? images[selectedIndex.value] : null;
  const detailUrl = currentImage
    ? getGalleryImageUrl(currentImage, 'detail')
    : fallbackImage;
  const zoomUrl = currentImage
    ? getGalleryImageUrl(currentImage, 'zoom')
    : fallbackImage;

  // Check thumbnail scroll state
  const updateScrollButtons = $(() => {
    const container = thumbnailContainerRef.value;
    if (!container) return;

    canScrollLeft.value = container.scrollLeft > 0;
    canScrollRight.value =
      container.scrollLeft < container.scrollWidth - container.clientWidth - 1;
  });

  // Initialize scroll button state
  useVisibleTask$(({ track }) => {
    track(() => images.length);
    // Delay to ensure DOM is ready
    setTimeout(() => updateScrollButtons(), 100);
  });

  // Scroll thumbnails
  const scrollThumbnails = $((direction: 'left' | 'right') => {
    const container = thumbnailContainerRef.value;
    if (!container) return;

    const scrollAmount = 200; // pixels to scroll
    const targetScroll = direction === 'left'
      ? container.scrollLeft - scrollAmount
      : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });

    // Update button state after scroll
    setTimeout(() => updateScrollButtons(), 300);
  });

  // Handle mouse move for zoom lens
  const handleMouseMove = $((e: MouseEvent) => {
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();

    // Calculate position as percentage
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Clamp values
    zoomPosition.value = {
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y))
    };

    // Calculate lens position (center the lens on cursor)
    const lensSize = 150; // px
    lensPosition.value = {
      x: e.clientX - rect.left - lensSize / 2,
      y: e.clientY - rect.top - lensSize / 2
    };
  });

  // Navigate to next/previous image
  const goToImage = $((direction: 'prev' | 'next') => {
    if (!hasMultipleImages) return;

    if (direction === 'prev') {
      selectedIndex.value = selectedIndex.value === 0
        ? images.length - 1
        : selectedIndex.value - 1;
    } else {
      selectedIndex.value = selectedIndex.value === images.length - 1
        ? 0
        : selectedIndex.value + 1;
    }
  });

  // Handle touch start for swipe
  const handleTouchStart = $((e: TouchEvent) => {
    if (e.touches.length === 1) {
      touchStart.value = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
      isDragging.value = true;
    }
  });

  // Handle touch end for swipe
  const handleTouchEnd = $((e: TouchEvent) => {
    if (!isDragging.value) return;
    isDragging.value = false;

    const touchEnd = e.changedTouches[0];
    const deltaX = touchEnd.clientX - touchStart.value.x;
    const deltaY = touchEnd.clientY - touchStart.value.y;

    // Only handle horizontal swipe if it's more horizontal than vertical
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        goToImage('prev');
      } else {
        goToImage('next');
      }
    }
  });

  // Open lightbox on mobile tap
  const handleImageClick = $(() => {
    // Check if mobile (touch device)
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      isLightboxOpen.value = true;
      lightboxScale.value = 1;
      lightboxOffset.value = { x: 0, y: 0 };
    }
  });

  // Close lightbox
  const closeLightbox = $(() => {
    isLightboxOpen.value = false;
    lightboxScale.value = 1;
    lightboxOffset.value = { x: 0, y: 0 };
  });

  // Handle pinch zoom in lightbox
  const pinchState = useSignal({ initialDistance: 0, initialScale: 1 });

  const handleLightboxTouchStart = $((e: TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch start
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchState.value = {
        initialDistance: Math.sqrt(dx * dx + dy * dy),
        initialScale: lightboxScale.value
      };
    } else if (e.touches.length === 1) {
      touchStart.value = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
    }
  });

  const handleLightboxTouchMove = $((e: TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch zoom
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const currentDistance = Math.sqrt(dx * dx + dy * dy);

      if (pinchState.value.initialDistance > 0) {
        const scale = (currentDistance / pinchState.value.initialDistance) * pinchState.value.initialScale;
        lightboxScale.value = Math.max(1, Math.min(4, scale));
      }
    }
  });

  const handleLightboxTouchEnd = $((e: TouchEvent) => {
    if (e.changedTouches.length === 1 && lightboxScale.value === 1) {
      // Swipe to navigate when not zoomed
      const touchEnd = e.changedTouches[0];
      const deltaX = touchEnd.clientX - touchStart.value.x;

      if (Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
          goToImage('prev');
        } else {
          goToImage('next');
        }
      }
    }
    pinchState.value = { initialDistance: 0, initialScale: 1 };
  });

  // Placeholder SVG for no image
  const PlaceholderImage = () => (
    <div class="w-full h-full flex items-center justify-center text-gray-300">
      <div class="text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-32 w-32 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="0.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span class="text-sm">Product Photo</span>
      </div>
    </div>
  );

  return (
    <div class="product-image-gallery">
      {/* Main Image Container */}
      <div
        class="relative bg-gray-100 rounded-lg aspect-square flex items-center justify-center overflow-hidden mb-4 cursor-crosshair"
        onMouseEnter$={() => { if (detailUrl) isZooming.value = true; }}
        onMouseLeave$={() => { isZooming.value = false; }}
        onMouseMove$={handleMouseMove}
        onTouchStart$={handleTouchStart}
        onTouchEnd$={handleTouchEnd}
        onClick$={handleImageClick}
      >
        {detailUrl ? (
          <>
            {/* Main Image */}
            <img
              src={detailUrl}
              alt={productTitle}
              class="w-full h-full object-contain p-4 select-none"
              draggable={false}
            />

            {/* Zoom Lens (Desktop only) */}
            {isZooming.value && zoomUrl && (
              <div
                class="absolute pointer-events-none border-2 border-[#042e0d] rounded-full overflow-hidden shadow-lg hidden md:block"
                style={{
                  width: '150px',
                  height: '150px',
                  left: `${lensPosition.value.x}px`,
                  top: `${lensPosition.value.y}px`,
                  backgroundImage: `url(${zoomUrl})`,
                  backgroundSize: '400%',
                  backgroundPosition: `${zoomPosition.value.x}% ${zoomPosition.value.y}%`,
                  backgroundColor: 'white',
                }}
              />
            )}

            {/* Navigation Arrows (visible on hover for desktop, always on mobile) */}
            {hasMultipleImages && (
              <>
                <button
                  onClick$={(e) => { e.stopPropagation(); goToImage('prev'); }}
                  class="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-md flex items-center justify-center transition-all opacity-0 hover:opacity-100 focus:opacity-100 md:opacity-0 md:group-hover:opacity-100"
                  style={{ opacity: 'var(--nav-opacity, 0)' }}
                  aria-label="Previous image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#042e0d]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick$={(e) => { e.stopPropagation(); goToImage('next'); }}
                  class="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-md flex items-center justify-center transition-all opacity-0 hover:opacity-100 focus:opacity-100"
                  aria-label="Next image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#042e0d]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Image Counter */}
            {hasMultipleImages && (
              <div class="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                {selectedIndex.value + 1} / {images.length}
              </div>
            )}

            {/* Zoom hint on desktop */}
            <div class="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded hidden md:flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
              Hover to zoom
            </div>

            {/* Tap hint on mobile */}
            <div class="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded flex md:hidden items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
              Tap to expand
            </div>
          </>
        ) : (
          <PlaceholderImage />
        )}
      </div>

      {/* Thumbnail Strip */}
      {hasMultipleImages && (
        <div class="relative">
          {/* Scroll Left Button */}
          {canScrollLeft.value && (
            <button
              onClick$={() => scrollThumbnails('left')}
              class="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
              aria-label="Scroll thumbnails left"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[#042e0d]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Thumbnails Container */}
          <div
            ref={thumbnailContainerRef}
            class="flex gap-2 overflow-x-auto pb-2 scroll-smooth scrollbar-hide px-1"
            onScroll$={updateScrollButtons}
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {images.map((img, index) => {
              const thumbUrl = getGalleryImageUrl(img, 'thumbnail');
              const isSelected = selectedIndex.value === index;

              return (
                <button
                  key={img.cf_image_id || index}
                  onClick$={() => { selectedIndex.value = index; }}
                  class={[
                    'flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200',
                    isSelected
                      ? 'border-[#042e0d] ring-2 ring-[#042e0d]/20 scale-105'
                      : 'border-gray-200 hover:border-gray-400'
                  ].join(' ')}
                  aria-label={`View image ${index + 1}`}
                  aria-pressed={isSelected}
                >
                  {thumbUrl ? (
                    <img
                      src={thumbUrl}
                      alt={`${productTitle} - Image ${index + 1}`}
                      class="w-full h-full object-cover"
                      width={64}
                      height={64}
                      loading={index > 4 ? 'lazy' : 'eager'}
                    />
                  ) : (
                    <div class="w-full h-full bg-gray-200 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Scroll Right Button */}
          {canScrollRight.value && (
            <button
              onClick$={() => scrollThumbnails('right')}
              class="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
              aria-label="Scroll thumbnails right"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[#042e0d]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Mobile Lightbox */}
      {isLightboxOpen.value && (
        <div
          class="fixed inset-0 z-50 bg-black flex items-center justify-center"
          onClick$={closeLightbox}
        >
          {/* Close Button */}
          <button
            onClick$={closeLightbox}
            class="absolute top-4 right-4 z-10 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
            aria-label="Close lightbox"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Image Counter */}
          {hasMultipleImages && (
            <div class="absolute top-4 left-4 bg-black/60 text-white text-sm px-3 py-1 rounded">
              {selectedIndex.value + 1} / {images.length}
            </div>
          )}

          {/* Lightbox Image */}
          <div
            class="w-full h-full flex items-center justify-center overflow-hidden"
            onTouchStart$={handleLightboxTouchStart}
            onTouchMove$={handleLightboxTouchMove}
            onTouchEnd$={handleLightboxTouchEnd}
            onClick$={(e) => e.stopPropagation()}
          >
            {zoomUrl && (
              <img
                src={zoomUrl}
                alt={productTitle}
                class="max-w-full max-h-full object-contain select-none"
                style={{
                  transform: `scale(${lightboxScale.value}) translate(${lightboxOffset.value.x}px, ${lightboxOffset.value.y}px)`,
                  transition: lightboxScale.value === 1 ? 'transform 0.2s ease-out' : 'none',
                }}
                draggable={false}
              />
            )}
          </div>

          {/* Navigation Arrows */}
          {hasMultipleImages && (
            <>
              <button
                onClick$={(e) => { e.stopPropagation(); goToImage('prev'); }}
                class="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                aria-label="Previous image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick$={(e) => { e.stopPropagation(); goToImage('next'); }}
                class="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                aria-label="Next image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Pinch to zoom hint */}
          <div class="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded">
            Pinch to zoom | Swipe to navigate
          </div>
        </div>
      )}

      {/* CSS for hiding scrollbar */}
      <style>
        {`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>
    </div>
  );
});
