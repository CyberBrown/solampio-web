/**
 * Product Description Cleaner
 *
 * Utilities for cleaning HTML product descriptions migrated from BigCommerce
 * and generating summaries.
 */

/**
 * Clean HTML description by removing problematic markup while preserving content
 */
export function cleanDescription(html: string | null): string {
  if (!html) return '';

  let cleaned = html;

  // Remove script and style tags and their content
  cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  cleaned = cleaned.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // Remove HTML comments
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '');

  // Remove all inline styles
  cleaned = cleaned.replace(/\s*style\s*=\s*["'][^"']*["']/gi, '');

  // Remove class attributes (often BigCommerce-specific)
  cleaned = cleaned.replace(/\s*class\s*=\s*["'][^"']*["']/gi, '');

  // Remove id attributes
  cleaned = cleaned.replace(/\s*id\s*=\s*["'][^"']*["']/gi, '');

  // Remove data-* attributes
  cleaned = cleaned.replace(/\s*data-[a-z-]+\s*=\s*["'][^"']*["']/gi, '');

  // Remove align, valign, width, height, border, cellpadding, cellspacing attributes
  cleaned = cleaned.replace(/\s*(align|valign|width|height|border|cellpadding|cellspacing|bgcolor|color)\s*=\s*["'][^"']*["']/gi, '');

  // Remove font tags but keep content
  cleaned = cleaned.replace(/<\/?font[^>]*>/gi, '');

  // Remove span tags but keep content (usually just styling wrappers)
  cleaned = cleaned.replace(/<\/?span[^>]*>/gi, '');

  // Remove div tags but keep content (preserve structure with line breaks)
  cleaned = cleaned.replace(/<div[^>]*>/gi, '\n');
  cleaned = cleaned.replace(/<\/div>/gi, '\n');

  // Convert <br> and <br/> to newlines
  cleaned = cleaned.replace(/<br\s*\/?>/gi, '\n');

  // Simplify tables to a cleaner format
  cleaned = simplifyTables(cleaned);

  // Remove empty tags (including nested)
  let prevLength;
  do {
    prevLength = cleaned.length;
    cleaned = cleaned.replace(/<(\w+)[^>]*>\s*<\/\1>/gi, '');
  } while (cleaned.length < prevLength);

  // Remove &nbsp; and replace with regular spaces
  cleaned = cleaned.replace(/&nbsp;/gi, ' ');

  // Decode common HTML entities
  cleaned = cleaned.replace(/&amp;/g, '&');
  cleaned = cleaned.replace(/&lt;/g, '<');
  cleaned = cleaned.replace(/&gt;/g, '>');
  cleaned = cleaned.replace(/&quot;/g, '"');
  cleaned = cleaned.replace(/&#39;/g, "'");
  cleaned = cleaned.replace(/&rsquo;/g, "'");
  cleaned = cleaned.replace(/&lsquo;/g, "'");
  cleaned = cleaned.replace(/&rdquo;/g, '"');
  cleaned = cleaned.replace(/&ldquo;/g, '"');
  cleaned = cleaned.replace(/&mdash;/g, '—');
  cleaned = cleaned.replace(/&ndash;/g, '–');
  cleaned = cleaned.replace(/&bull;/g, '•');
  cleaned = cleaned.replace(/&copy;/g, '©');
  cleaned = cleaned.replace(/&reg;/g, '®');
  cleaned = cleaned.replace(/&trade;/g, '™');
  cleaned = cleaned.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)));

  // Normalize whitespace
  cleaned = cleaned.replace(/[ \t]+/g, ' ');  // Multiple spaces/tabs to single space
  cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n');  // Multiple newlines to double
  cleaned = cleaned.replace(/^\s+|\s+$/gm, '');  // Trim each line

  // Final trim
  cleaned = cleaned.trim();

  return cleaned;
}

/**
 * Simplify HTML tables to a cleaner text format
 * Converts table rows to "Label: Value" format
 */
function simplifyTables(html: string): string {
  // Match complete tables
  return html.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, (_, tableContent) => {
    const rows: string[] = [];

    // Extract rows
    const rowMatches = tableContent.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);
    for (const rowMatch of rowMatches) {
      const rowContent = rowMatch[1];

      // Extract cells (th or td)
      const cells: string[] = [];
      const cellMatches = rowContent.matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi);
      for (const cellMatch of cellMatches) {
        // Strip HTML from cell content and trim
        const cellText = cellMatch[1]
          .replace(/<[^>]*>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        if (cellText) {
          cells.push(cellText);
        }
      }

      if (cells.length >= 2) {
        // Format as "Label: Value"
        rows.push(`${cells[0]}: ${cells.slice(1).join(', ')}`);
      } else if (cells.length === 1) {
        rows.push(cells[0]);
      }
    }

    return rows.length > 0 ? '\n' + rows.join('\n') + '\n' : '';
  });
}

/**
 * Extract plain text from HTML, stripping all tags
 */
export function stripHtml(html: string | null): string {
  if (!html) return '';

  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract a plain text excerpt from description
 * Smart truncation that doesn't cut words mid-way
 */
export function extractExcerpt(html: string | null, maxLength = 500): string {
  const text = stripHtml(html);

  if (text.length <= maxLength) return text;

  // Find a good break point (end of sentence or word)
  let truncated = text.substring(0, maxLength);

  // Try to break at end of sentence
  const sentenceEnd = truncated.lastIndexOf('. ');
  if (sentenceEnd > maxLength * 0.6) {
    return truncated.substring(0, sentenceEnd + 1);
  }

  // Otherwise break at word boundary
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > maxLength * 0.8) {
    truncated = truncated.substring(0, lastSpace);
  }

  return truncated + '...';
}

/**
 * Generate a prompt for AI summary generation
 */
export function generateSummaryPrompt(productTitle: string, description: string): string {
  const cleanText = stripHtml(description);

  return `Generate a concise product summary (2-3 sentences, max 500 characters) for this solar equipment product. Focus on: what the product is, its key benefit, and primary use case. Be factual, no marketing fluff.

Product: ${productTitle}

Description:
${cleanText.substring(0, 2000)}

Summary:`;
}

/**
 * Check if a description needs cleaning
 * Returns true if description contains problematic HTML patterns
 */
export function needsCleaning(html: string | null): boolean {
  if (!html) return false;

  // Check for common problematic patterns
  const problematicPatterns = [
    /style\s*=/i,           // Inline styles
    /class\s*=/i,           // Classes (often BigCommerce-specific)
    /<font\b/i,             // Font tags
    /<table\b/i,            // Tables that need conversion
    /&nbsp;/i,              // Non-breaking spaces
    /<div\b/i,              // Div wrappers
    /<span\b/i,             // Span wrappers
    /data-[a-z-]+\s*=/i,    // Data attributes
  ];

  return problematicPatterns.some(pattern => pattern.test(html));
}

/**
 * Validate a generated summary
 * Returns true if summary meets requirements
 */
export function isValidSummary(summary: string | null): boolean {
  if (!summary) return false;

  const trimmed = summary.trim();

  // Check length (should be 50-500 chars)
  if (trimmed.length < 50 || trimmed.length > 500) return false;

  // Should contain at least one sentence
  if (!trimmed.includes('.')) return false;

  // Should not be just the product title repeated
  return true;
}
