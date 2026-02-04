/**
 * SEO Utilities
 *
 * Provides JSON-LD structured data generators and social meta tag helpers
 * for better search engine visibility and social sharing.
 */

import type { DocumentMeta } from '@builder.io/qwik-city';

// Base URL for the site
export const SITE_URL = 'https://solampio.com';
export const SITE_NAME = 'Solamp Solar & Energy Storage';
export const SITE_PHONE = '978-451-6890';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/solamp-og-image.png`;

// Organization data (used across the site)
export const ORGANIZATION = {
  name: 'Solamp',
  legalName: 'Solamp Solar & Energy Storage',
  url: SITE_URL,
  logo: `${SITE_URL}/images/solamp-logo.webp`,
  phone: SITE_PHONE,
  email: 'sales@solampio.com',
};

// -----------------------------------------------------------------------------
// JSON-LD Schema Generators
// -----------------------------------------------------------------------------

/**
 * Generate Organization schema (for homepage/about)
 */
export function generateOrganizationSchema(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: ORGANIZATION.name,
    legalName: ORGANIZATION.legalName,
    url: ORGANIZATION.url,
    logo: ORGANIZATION.logo,
    telephone: ORGANIZATION.phone,
    email: ORGANIZATION.email,
    sameAs: [
      // Add social media links when available
    ],
  };
}

/**
 * Generate WebSite schema with search action (for homepage)
 */
export function generateWebSiteSchema(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Generate Product schema for product pages
 */
export interface ProductSchemaInput {
  name: string;
  description?: string;
  sku: string;
  image?: string | string[];
  brand?: string;
  price?: number;
  priceCurrency?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder' | 'LimitedAvailability';
  url: string;
  category?: string;
  ratingValue?: number;
  ratingCount?: number;
}

export function generateProductSchema(product: ProductSchemaInput): object {
  const images = Array.isArray(product.image)
    ? product.image
    : product.image
      ? [product.image]
      : [];

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    sku: product.sku,
    url: product.url,
  };

  if (product.description) {
    schema.description = product.description;
  }

  if (images.length > 0) {
    schema.image = images.length === 1 ? images[0] : images;
  }

  if (product.brand) {
    schema.brand = {
      '@type': 'Brand',
      name: product.brand,
    };
  }

  if (product.category) {
    schema.category = product.category;
  }

  // Add AggregateRating if rating data is available
  if (product.ratingValue && product.ratingCount && product.ratingCount > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.ratingValue,
      ratingCount: product.ratingCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  // Add Offer if price is available
  if (product.price !== undefined && product.price > 0) {
    schema.offers = {
      '@type': 'Offer',
      url: product.url,
      priceCurrency: product.priceCurrency || 'USD',
      price: product.price,
      availability: `https://schema.org/${product.availability || 'InStock'}`,
      seller: {
        '@type': 'Organization',
        name: ORGANIZATION.name,
      },
    };
  }

  return schema;
}

/**
 * Generate BreadcrumbList schema
 */
export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate FAQPage schema
 */
export interface FAQItem {
  question: string;
  answer: string;
}

export function generateFAQSchema(faqs: FAQItem[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate Article schema (for blog/learn articles)
 */
export interface ArticleSchemaInput {
  headline: string;
  description?: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
  author?: string;
  url: string;
}

export function generateArticleSchema(article: ArticleSchemaInput): object {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.headline,
    url: article.url,
    publisher: {
      '@type': 'Organization',
      name: ORGANIZATION.name,
      logo: {
        '@type': 'ImageObject',
        url: ORGANIZATION.logo,
      },
    },
  };

  if (article.description) {
    schema.description = article.description;
  }

  if (article.image) {
    schema.image = article.image;
  }

  if (article.datePublished) {
    schema.datePublished = article.datePublished;
  }

  if (article.dateModified) {
    schema.dateModified = article.dateModified;
  }

  if (article.author) {
    schema.author = {
      '@type': 'Person',
      name: article.author,
    };
  }

  return schema;
}

// -----------------------------------------------------------------------------
// Social Meta Tag Generators
// -----------------------------------------------------------------------------

/**
 * Generate Open Graph meta tags
 */
export interface OpenGraphInput {
  title: string;
  description: string;
  url: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  siteName?: string;
}

export function generateOpenGraphMeta(og: OpenGraphInput): DocumentMeta[] {
  const meta: DocumentMeta[] = [
    { property: 'og:title', content: og.title },
    { property: 'og:description', content: og.description },
    { property: 'og:url', content: og.url },
    { property: 'og:type', content: og.type || 'website' },
    { property: 'og:site_name', content: og.siteName || SITE_NAME },
  ];

  if (og.image) {
    meta.push(
      { property: 'og:image', content: og.image },
      { property: 'og:image:alt', content: og.title }
    );
  }

  return meta;
}

/**
 * Generate Twitter Card meta tags
 */
export interface TwitterCardInput {
  title: string;
  description: string;
  image?: string;
  card?: 'summary' | 'summary_large_image';
}

export function generateTwitterMeta(twitter: TwitterCardInput): DocumentMeta[] {
  const meta: DocumentMeta[] = [
    { name: 'twitter:card', content: twitter.card || 'summary_large_image' },
    { name: 'twitter:title', content: twitter.title },
    { name: 'twitter:description', content: twitter.description },
  ];

  if (twitter.image) {
    meta.push({ name: 'twitter:image', content: twitter.image });
  }

  return meta;
}

// -----------------------------------------------------------------------------
// Combined Helpers
// -----------------------------------------------------------------------------

/**
 * Generate all social meta tags (OG + Twitter)
 */
export interface SocialMetaInput {
  title: string;
  description: string;
  url: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
}

export function generateSocialMeta(input: SocialMetaInput): DocumentMeta[] {
  return [
    ...generateOpenGraphMeta({
      title: input.title,
      description: input.description,
      url: input.url,
      image: input.image,
      type: input.type,
    }),
    ...generateTwitterMeta({
      title: input.title,
      description: input.description,
      image: input.image,
    }),
  ];
}

/**
 * Create a script tag object for JSON-LD (to use with head.scripts)
 */
export function createJsonLdScript(schema: object | object[]): {
  script: string;
  props: { type: string };
} {
  return {
    script: JSON.stringify(schema),
    props: { type: 'application/ld+json' },
  };
}

/**
 * Helper to combine multiple schemas into a single array
 */
export function combineSchemas(...schemas: object[]): object[] {
  return schemas;
}
