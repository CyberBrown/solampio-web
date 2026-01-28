import { getCFImageUrl } from './images';

export interface GMCFeedItem {
  id: string;
  title: string;
  description: string;
  link: string;
  image_link: string;
  additional_image_link?: string[];
  price: string;
  availability: string;
  condition: string;
  brand: string;
  gtin?: string;
  mpn?: string;
  google_product_category?: string;
  product_type?: string;
  shipping_weight?: string;
  shipping_label?: string;
  custom_label_0?: string;
  custom_label_1?: string;
  custom_label_2?: string;
  custom_label_3?: string;
  custom_label_4?: string;
}

export interface GMCProduct {
  sku: string;
  name: string;
  seo_title: string | null;
  description: string | null;
  slug: string;
  category_slug: string | null;
  cf_image_id: string | null;
  image_url: string | null;
  price: number | null;
  brand_name: string | null;
  weight_lbs: number | null;
  gtin: string | null;
  mpn: string | null;
  gmc_google_category: string | null;
  gmc_product_type: string | null;
  gmc_condition: string | null;
  gmc_availability: string | null;
  gmc_shipping_label: string | null;
  gmc_custom_label_0: string | null;
  gmc_custom_label_1: string | null;
  gmc_custom_label_2: string | null;
  gmc_custom_label_3: string | null;
  gmc_custom_label_4: string | null;
  gmc_additional_images: string | null;
}

const BASE_URL = 'https://solampio.com';

export function productToGMCFeedItem(product: GMCProduct): GMCFeedItem {
  // Products are accessed directly via /{sku}/ in the Qwik app
  const encodedSku = encodeURIComponent(product.sku);
  const productUrl = `${BASE_URL}/${encodedSku}/`;

  const imageUrl = product.cf_image_id
    ? getCFImageUrl(product.cf_image_id, 'product')
    : product.image_url;

  let additionalImages: string[] | undefined;
  if (product.gmc_additional_images) {
    try {
      const imageIds = JSON.parse(product.gmc_additional_images) as string[];
      additionalImages = imageIds
        .map(id => getCFImageUrl(id, 'product'))
        .filter((url): url is string => url !== null);
    } catch {
      // Invalid JSON, skip
    }
  }

  const formattedPrice = product.price
    ? `${product.price.toFixed(2)} USD`
    : undefined;

  const shippingWeight = product.weight_lbs
    ? `${product.weight_lbs} lb`
    : undefined;

  const item: GMCFeedItem = {
    id: product.sku,
    title: product.seo_title || product.name,
    description: product.description || '',
    link: productUrl,
    image_link: imageUrl || '',
    price: formattedPrice || '',
    availability: product.gmc_availability || 'in_stock',
    condition: product.gmc_condition || 'new',
    brand: product.brand_name || '',
  };

  if (additionalImages?.length) item.additional_image_link = additionalImages;
  if (product.gtin) item.gtin = product.gtin;
  if (product.mpn) item.mpn = product.mpn;
  if (product.gmc_google_category) item.google_product_category = product.gmc_google_category;
  if (product.gmc_product_type) item.product_type = product.gmc_product_type;
  if (shippingWeight) item.shipping_weight = shippingWeight;
  if (product.gmc_shipping_label) item.shipping_label = product.gmc_shipping_label;
  if (product.gmc_custom_label_0) item.custom_label_0 = product.gmc_custom_label_0;
  if (product.gmc_custom_label_1) item.custom_label_1 = product.gmc_custom_label_1;
  if (product.gmc_custom_label_2) item.custom_label_2 = product.gmc_custom_label_2;
  if (product.gmc_custom_label_3) item.custom_label_3 = product.gmc_custom_label_3;
  if (product.gmc_custom_label_4) item.custom_label_4 = product.gmc_custom_label_4;

  return item;
}

export function generateGMCFeedTSV(products: GMCProduct[]): string {
  const headers = [
    'id', 'title', 'description', 'link', 'image_link', 'additional_image_link',
    'price', 'availability', 'condition', 'brand', 'gtin', 'mpn',
    'google_product_category', 'product_type', 'shipping_weight', 'shipping_label',
    'custom_label_0', 'custom_label_1', 'custom_label_2', 'custom_label_3', 'custom_label_4',
  ];

  const rows = products.map(product => {
    const item = productToGMCFeedItem(product);
    return [
      item.id,
      item.title,
      item.description.replace(/\t/g, ' ').replace(/\n/g, ' '),
      item.link,
      item.image_link,
      item.additional_image_link?.join(',') || '',
      item.price,
      item.availability,
      item.condition,
      item.brand,
      item.gtin || '',
      item.mpn || '',
      item.google_product_category || '',
      item.product_type || '',
      item.shipping_weight || '',
      item.shipping_label || '',
      item.custom_label_0 || '',
      item.custom_label_1 || '',
      item.custom_label_2 || '',
      item.custom_label_3 || '',
      item.custom_label_4 || '',
    ].join('\t');
  });

  return [headers.join('\t'), ...rows].join('\n');
}

export function generateGMCFeedJSON(products: GMCProduct[]): GMCFeedItem[] {
  return products.map(productToGMCFeedItem);
}
