/**
 * Custom Link component that disables Qwik's data prefetching
 *
 * By default, Qwik prefetches q-data.json for every visible link,
 * which causes 70+ requests on pages with many links. This devastates
 * Lighthouse scores under throttled conditions.
 *
 * This wrapper sets prefetch="js" to only prefetch JavaScript bundles,
 * not route data. This dramatically reduces network requests while
 * still enabling fast navigation.
 */
import { Link as QwikLink, type LinkProps } from '@builder.io/qwik-city';
import { component$, Slot } from '@builder.io/qwik';

export const Link = component$<LinkProps>((props) => {
  return (
    <QwikLink {...props} prefetch={props.prefetch ?? 'js'}>
      <Slot />
    </QwikLink>
  );
});

// Re-export for convenience
export type { LinkProps };
