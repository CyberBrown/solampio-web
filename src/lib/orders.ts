/**
 * Orders Database Client
 *
 * Handles order creation and management in D1.
 * Works with the existing storefront_orders table schema.
 */

import type { D1Database } from '@cloudflare/workers-types';

// ============================================================================
// Type Definitions
// ============================================================================

export interface ShippingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderItem {
  productId: string;
  sku: string;
  title: string;
  thumbnailUrl: string | null;
  price: number;
  quantity: number;
}

export interface CreateOrderInput {
  // Customer info (guest checkout)
  customerEmail?: string;
  customerPhone: string;
  customerName: string;

  // Address
  shippingAddress: ShippingAddress;

  // Cart items
  items: OrderItem[];

  // Totals (in dollars, matching existing schema)
  subtotal: number;
  shipping?: number;
  tax?: number;
  total: number;

  // Payment
  stripePaymentIntentId: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  customer_name: string | null;
  status: string;
  payment_status: string | null;
  stripe_payment_intent_id: string | null;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  items: string; // JSON string
  shipping_address: string | null; // JSON string
  billing_address: string | null; // JSON string
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Orders Database Class
// ============================================================================

export class OrdersDB {
  constructor(private db: D1Database) {}

  /**
   * Generate a unique order number
   * Format: SOL-YYMMDD-XXXX (e.g., SOL-250107-A3F2)
   */
  private generateOrderNumber(): string {
    const now = new Date();
    const year = String(now.getFullYear()).slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`;

    // Generate 4-character alphanumeric suffix
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excludes confusing chars
    let suffix = '';
    for (let i = 0; i < 4; i++) {
      suffix += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return `SOL-${dateStr}-${suffix}`;
  }

  /**
   * Create a new order from checkout
   */
  async createOrder(input: CreateOrderInput): Promise<Order> {
    const id = crypto.randomUUID();
    const orderNumber = this.generateOrderNumber();

    // Format items as JSON (matching existing schema)
    const itemsJson = JSON.stringify(
      input.items.map((item) => ({
        product_id: item.productId,
        sku: item.sku,
        title: item.title,
        thumbnail_url: item.thumbnailUrl,
        price: item.price,
        quantity: item.quantity,
        line_total: item.price * item.quantity,
      }))
    );

    // Format address as JSON
    const shippingAddressJson = JSON.stringify({
      line1: input.shippingAddress.line1,
      line2: input.shippingAddress.line2 || '',
      city: input.shippingAddress.city,
      state: input.shippingAddress.state,
      postal_code: input.shippingAddress.postalCode,
      country: input.shippingAddress.country,
    });

    // Map payment status
    const status = input.paymentStatus === 'paid' ? 'confirmed' : 'draft';

    await this.db
      .prepare(
        `
      INSERT INTO storefront_orders (
        id, order_number, customer_id, customer_email, customer_phone, customer_name,
        status, payment_status, stripe_payment_intent_id,
        subtotal, tax, shipping, total,
        items, shipping_address, billing_address,
        sync_source, sync_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
      )
      .bind(
        id,
        orderNumber,
        null, // customer_id - null for guest checkout
        input.customerEmail || null,
        input.customerPhone,
        input.customerName,
        status,
        input.paymentStatus,
        input.stripePaymentIntentId,
        input.subtotal,
        input.tax || 0,
        input.shipping || 0,
        input.total,
        itemsJson,
        shippingAddressJson,
        shippingAddressJson, // Use same for billing
        'web_checkout',
        'pending'
      )
      .run();

    return this.getOrder(id) as Promise<Order>;
  }

  /**
   * Get order by ID
   */
  async getOrder(id: string): Promise<Order | null> {
    const result = await this.db
      .prepare('SELECT * FROM storefront_orders WHERE id = ?')
      .bind(id)
      .first<Order>();

    return result || null;
  }

  /**
   * Get order by Stripe PaymentIntent ID
   */
  async getOrderByPaymentIntent(
    paymentIntentId: string
  ): Promise<Order | null> {
    const result = await this.db
      .prepare(
        'SELECT * FROM storefront_orders WHERE stripe_payment_intent_id = ?'
      )
      .bind(paymentIntentId)
      .first<Order>();

    return result || null;
  }

  /**
   * Get order by order number
   */
  async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    const result = await this.db
      .prepare('SELECT * FROM storefront_orders WHERE order_number = ?')
      .bind(orderNumber)
      .first<Order>();

    return result || null;
  }

  /**
   * Update order status after payment confirmation
   */
  async updateOrderStatus(
    id: string,
    updates: {
      status?: string;
      paymentStatus?: string;
    }
  ): Promise<void> {
    const setClauses: string[] = ['updated_at = datetime(\'now\')'];
    const params: (string | null)[] = [];

    if (updates.status) {
      setClauses.push('status = ?');
      params.push(updates.status);
    }

    if (updates.paymentStatus) {
      setClauses.push('payment_status = ?');
      params.push(updates.paymentStatus);
    }

    params.push(id);

    await this.db
      .prepare(
        `UPDATE storefront_orders SET ${setClauses.join(', ')} WHERE id = ?`
      )
      .bind(...params)
      .run();
  }

  /**
   * Get orders by customer email
   */
  async getOrdersByEmail(email: string): Promise<Order[]> {
    const result = await this.db
      .prepare(
        `
      SELECT * FROM storefront_orders
      WHERE customer_email = ?
      ORDER BY created_at DESC
    `
      )
      .bind(email)
      .all<Order>();

    return result.results || [];
  }
}

// ============================================================================
// Helper Functions for Qwik
// ============================================================================

/**
 * Get OrdersDB instance from Qwik request event
 * Use this in routeLoader$ and server$ functions
 */
export function getOrdersDB(platform: any): OrdersDB {
  if (!platform?.env?.DB) {
    throw new Error(
      'D1 database binding not found. Make sure DB is configured in wrangler.toml'
    );
  }
  return new OrdersDB(platform.env.DB);
}

/**
 * Parse order items from JSON string
 */
export function parseOrderItems(
  itemsJson: string
): Array<{
  product_id: string;
  sku: string;
  title: string;
  thumbnail_url: string | null;
  price: number;
  quantity: number;
  line_total: number;
}> {
  try {
    return JSON.parse(itemsJson);
  } catch {
    return [];
  }
}

/**
 * Parse shipping address from JSON string
 */
export function parseShippingAddress(
  addressJson: string | null
): ShippingAddress | null {
  if (!addressJson) return null;
  try {
    const parsed = JSON.parse(addressJson);
    return {
      line1: parsed.line1,
      line2: parsed.line2,
      city: parsed.city,
      state: parsed.state,
      postalCode: parsed.postal_code,
      country: parsed.country,
    };
  } catch {
    return null;
  }
}
