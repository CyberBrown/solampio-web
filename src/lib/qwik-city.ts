/**
 * Re-export qwik-city with custom Link that has prefetch="js" default
 *
 * Import from '@/lib/qwik-city' instead of '@builder.io/qwik-city'
 * to get optimized prefetch behavior.
 */

// Re-export everything from qwik-city
export * from '@builder.io/qwik-city';

// Override Link with our custom version
export { Link } from '../components/common/Link';
