export interface FAQ {
  question: string;
  answer: string;
}

export interface CompetitorIntel {
  name: string;
  url: string;
  price: string | null;
  differentiators: string[];
}

export interface SEOFields {
  seo_title: string | null;
  seo_meta_description: string | null;
  seo_description_summary: string | null;
  seo_og_title: string | null;
  seo_og_description: string | null;
  seo_keywords: string[] | null;
  seo_robots: string;
  seo_faqs: FAQ[] | null;
  seo_related_searches: string[] | null;
  seo_use_cases: string[] | null;
  description_original: string | null;
  seo_last_optimized: string | null;
  seo_competitor_data: CompetitorIntel[] | null;
}

export interface SEOOptimizationResult extends Omit<SEOFields, 'description_original' | 'seo_last_optimized'> {
  optimized_description: string;
}
