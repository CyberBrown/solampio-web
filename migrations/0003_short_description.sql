-- Add short_description column for LLM-generated product summaries
ALTER TABLE storefront_products ADD COLUMN short_description TEXT;
