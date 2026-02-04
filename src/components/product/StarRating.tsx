import { component$ } from '@builder.io/qwik';

interface StarRatingProps {
  rating: number;
  count: number;
  size?: 'sm' | 'lg';
}

export const StarRating = component$<StarRatingProps>(({ rating, count, size = 'sm' }) => {
  const starSize = size === 'lg' ? 24 : 16;
  const clampedRating = Math.min(5, Math.max(0, rating));
  const fillPercent = (clampedRating / 5) * 100;

  const label = size === 'lg'
    ? `${clampedRating.toFixed(1)} out of 5 (${count} review${count !== 1 ? 's' : ''})`
    : `${clampedRating.toFixed(1)} stars from ${count} review${count !== 1 ? 's' : ''}`;

  return (
    <div class="flex items-center gap-1.5" aria-label={label} role="img">
      <div class="relative inline-flex" style={{ width: `${starSize * 5 + 4 * 2}px`, height: `${starSize}px` }}>
        {/* Empty stars (background) */}
        <div class="absolute inset-0 flex items-center gap-0.5 text-gray-300">
          {[0, 1, 2, 3, 4].map((i) => (
            <svg key={i} width={starSize} height={starSize} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          ))}
        </div>
        {/* Filled stars (overlay with clip) */}
        <div
          class="absolute inset-0 flex items-center gap-0.5 text-[#c3a859] overflow-hidden"
          style={{ width: `${fillPercent}%` }}
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <svg key={i} width={starSize} height={starSize} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          ))}
        </div>
      </div>
      {size === 'lg' ? (
        <span class="text-sm text-gray-600 ml-1">
          {clampedRating.toFixed(1)} out of 5 ({count} review{count !== 1 ? 's' : ''})
        </span>
      ) : (
        <span class="text-xs text-gray-500">({count})</span>
      )}
    </div>
  );
});
