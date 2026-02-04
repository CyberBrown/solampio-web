/**
 * Quote Request Database Client
 *
 * Handles quote request creation, rate limiting, and ERPNext sync.
 * Works with the storefront_quote_requests table.
 */

import type { D1Database } from '@cloudflare/workers-types';
import { server$ } from '@builder.io/qwik-city';

// ============================================================================
// Type Definitions
// ============================================================================

export interface QuoteRequestInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName?: string;
  projectType?: string;
  systemSize?: string;
  projectLocation?: string;
  productList?: string;
  timeline?: string;
  notes?: string;
  honeypot?: string;
}

export interface QuoteRequest {
  id: string;
  quote_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company_name: string | null;
  project_type: string | null;
  system_size: string | null;
  project_location: string | null;
  product_list: string | null;
  timeline: string | null;
  notes: string | null;
  status: string;
  ip_address: string | null;
  erpnext_lead_name: string | null;
  sync_status: string;
  sync_error: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Quote Request Database Class
// ============================================================================

export class QuoteRequestDB {
  constructor(private db: D1Database) {}

  /**
   * Generate a unique quote number
   * Format: QR-YYMMDD-XXXX (e.g., QR-260204-A3F2)
   */
  generateQuoteNumber(): string {
    const now = new Date();
    const year = String(now.getFullYear()).slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`;

    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let suffix = '';
    for (let i = 0; i < 4; i++) {
      suffix += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return `QR-${dateStr}-${suffix}`;
  }

  /**
   * Check if an IP address is rate limited (1 request per 60 seconds)
   */
  async checkRateLimit(ip: string): Promise<boolean> {
    const result = await this.db
      .prepare(
        `SELECT COUNT(*) as count FROM storefront_quote_requests
         WHERE ip_address = ? AND created_at > datetime('now', '-60 seconds')`
      )
      .bind(ip)
      .first<{ count: number }>();

    return (result?.count || 0) > 0;
  }

  /**
   * Create a new quote request
   */
  async createQuoteRequest(
    input: QuoteRequestInput,
    ipAddress?: string
  ): Promise<QuoteRequest> {
    const id = crypto.randomUUID();
    const quoteNumber = this.generateQuoteNumber();

    await this.db
      .prepare(
        `INSERT INTO storefront_quote_requests (
          id, quote_number, first_name, last_name, email, phone, company_name,
          project_type, system_size, project_location, product_list, timeline, notes,
          status, ip_address, sync_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?, 'pending')`
      )
      .bind(
        id,
        quoteNumber,
        input.firstName.trim(),
        input.lastName.trim(),
        input.email.trim().toLowerCase(),
        input.phone.trim(),
        input.companyName?.trim() || null,
        input.projectType || null,
        input.systemSize?.trim() || null,
        input.projectLocation?.trim() || null,
        input.productList?.trim() || null,
        input.timeline || null,
        input.notes?.trim() || null,
        ipAddress || null
      )
      .run();

    return this.getQuoteRequest(id) as Promise<QuoteRequest>;
  }

  /**
   * Get quote request by ID
   */
  async getQuoteRequest(id: string): Promise<QuoteRequest | null> {
    const result = await this.db
      .prepare('SELECT * FROM storefront_quote_requests WHERE id = ?')
      .bind(id)
      .first<QuoteRequest>();

    return result || null;
  }
}

// ============================================================================
// ERPNext Lead Sync
// ============================================================================

async function syncLeadToERPNext(
  quote: QuoteRequest,
  env: { url: string; apiKey: string; apiSecret: string }
): Promise<{ success: boolean; leadName?: string; error?: string }> {
  const headers: HeadersInit = {
    Authorization: `token ${env.apiKey}:${env.apiSecret}`,
    'Content-Type': 'application/json',
  };

  const leadData: Record<string, unknown> = {
    lead_name: `${quote.first_name} ${quote.last_name}`,
    email_id: quote.email,
    phone: quote.phone,
    company_name: quote.company_name || undefined,
    source: 'Website',
    custom_quote_number: quote.quote_number,
    custom_project_type: quote.project_type || undefined,
    custom_system_size: quote.system_size || undefined,
    custom_project_location: quote.project_location || undefined,
    custom_product_list: quote.product_list || undefined,
    custom_timeline: quote.timeline || undefined,
  };

  // Add notes as child table entry if present
  if (quote.notes) {
    leadData.notes = [{ note: quote.notes }];
  }

  const response = await fetch(`${env.url}/api/resource/Lead`, {
    method: 'POST',
    headers,
    body: JSON.stringify(leadData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create Lead: ${errorText}`);
  }

  const result = (await response.json()) as { data: { name: string } };
  return { success: true, leadName: result.data.name };
}

// ============================================================================
// Server Function
// ============================================================================

export const submitQuoteRequest = server$(async function (
  input: QuoteRequestInput
): Promise<{
  success: boolean;
  quoteNumber?: string;
  error?: string;
}> {
  // Honeypot check
  if (input.honeypot) {
    // Silently reject bot submissions
    return { success: true, quoteNumber: 'QR-000000-0000' };
  }

  // Validate required fields
  if (!input.firstName?.trim() || !input.lastName?.trim() || !input.email?.trim() || !input.phone?.trim()) {
    return { success: false, error: 'Please fill in all required fields.' };
  }

  // Basic email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  const db = this.platform?.env?.DB;
  if (!db) {
    return { success: false, error: 'Service temporarily unavailable.' };
  }

  const quotesDB = new QuoteRequestDB(db);

  try {
    // Rate limit check
    const ip = this.request.headers.get('cf-connecting-ip') || this.request.headers.get('x-forwarded-for') || 'unknown';
    const isRateLimited = await quotesDB.checkRateLimit(ip);
    if (isRateLimited) {
      return { success: false, error: 'Please wait before submitting another request.' };
    }

    // Create quote request in D1
    const quote = await quotesDB.createQuoteRequest(input, ip);
    console.log('[Quotes] Created quote request:', quote.quote_number);

    // Sync to ERPNext as Lead
    const erpnextUrl = this.platform?.env?.ERPNEXT_URL;
    const erpnextApiKey = this.platform?.env?.ERPNEXT_API_KEY;
    const erpnextApiSecret = this.platform?.env?.ERPNEXT_API_SECRET;

    if (erpnextUrl && erpnextApiKey && erpnextApiSecret) {
      try {
        const syncResult = await syncLeadToERPNext(quote, {
          url: erpnextUrl,
          apiKey: erpnextApiKey,
          apiSecret: erpnextApiSecret,
        });

        if (syncResult.success) {
          await db
            .prepare(
              `UPDATE storefront_quote_requests
               SET sync_status = 'synced',
                   erpnext_lead_name = ?,
                   updated_at = datetime('now')
               WHERE id = ?`
            )
            .bind(syncResult.leadName || null, quote.id)
            .run();
          console.log('[Quotes] Synced to ERPNext Lead:', syncResult.leadName);
        }
      } catch (err) {
        console.error('[Quotes] ERPNext sync error:', err);
        await db
          .prepare(
            `UPDATE storefront_quote_requests
             SET sync_status = 'failed',
                 sync_error = ?,
                 updated_at = datetime('now')
             WHERE id = ?`
          )
          .bind(
            err instanceof Error ? err.message : 'Unknown error',
            quote.id
          )
          .run();
      }
    } else {
      console.log('[Quotes] ERPNext not configured, skipping sync');
    }

    return { success: true, quoteNumber: quote.quote_number };
  } catch (err) {
    console.error('[Quotes] Error creating quote request:', err);
    return {
      success: false,
      error: 'Something went wrong. Please try again or call us at 978-451-6890.',
    };
  }
});
