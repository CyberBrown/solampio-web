const CF_IMAGES_ACCOUNT_HASH = 'Fdrr4r8cVWsy-JJCR0JU_Q';

export type ImageVariant = 'thumb' | 'card' | 'product' | 'hero' | 'public';

export function getCFImageUrl(cfImageId: string | null, variant: ImageVariant = 'product'): string | null {
  if (!cfImageId) return null;
  return `https://imagedelivery.net/${CF_IMAGES_ACCOUNT_HASH}/${cfImageId}/${variant}`;
}
