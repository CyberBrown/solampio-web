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
   * Find or create a customer for web checkout
   */
  private async findOrCreateCustomer(input: {
    email?: string;
    name: string;
    phone: string;
  }): Promise<string> {
    // If we have an email, try to find existing customer
    if (input.email) {
      const existing = await this.db
        .prepare('SELECT id FROM storefront_customers WHERE email = ?')
        .bind(input.email)
        .first<{ id: string }>();

      if (existing) {
        return existing.id;
      }
    }

    // Create a new customer
    const customerId = crypto.randomUUID();
    const nameParts = input.name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Use email or generate a placeholder for guest customers
    const email = input.email || `guest_${customerId}@checkout.local`;

    await this.db
      .prepare(
        `INSERT INTO storefront_customers (id, email, first_name, last_name, phone, sync_source, sync_status)
         VALUES (?, ?, ?, ?, ?, 'web_checkout', 'pending')`
      )
      .bind(customerId, email, firstName, lastName, input.phone)
      .run();

    return customerId;
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

    // Find or create customer record (required for foreign key)
    const customerId = await this.findOrCreateCustomer({
      email: input.customerEmail,
      name: input.customerName,
      phone: input.customerPhone,
    });

    await this.db
      .prepare(
        `
      INSERT INTO storefront_orders (
        id, order_number, customer_id, customer_email, customer_phone, customer_name,
        status, payment_status, stripe_payment_intent_id,
        subtotal, tax, shipping, total,
        items, shipping_address, billing_address,
        sync_source, sync_status, erpnext_sales_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
      )
      .bind(
        id,
        orderNumber,
        customerId, // customer_id - from storefront_customers table
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
        'pending',
        null // erpnext_sales_order - will be updated after sync
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

// ============================================================================
// Server Functions for Order Creation
// ============================================================================

import { server$ } from '@builder.io/qwik-city';

/**
 * Create order from checkout and sync to ERPNext
 * Called after successful Stripe payment
 */
export const createOrderFromCheckout = server$(async function (input: {
  customerEmail?: string;
  customerPhone: string;
  customerName: string;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  shipping?: number;
  shippingMethod?: string;
  total: number;
  stripePaymentIntentId: string;
  paymentMethod?: 'card' | 'check';
}): Promise<{
  success: boolean;
  orderNumber?: string;
  orderId?: string;
  erpnextSyncResult?: {
    success: boolean;
    salesOrderName?: string;
    error?: string;
  };
  error?: string;
}> {
  const db = this.platform?.env?.DB;
  if (!db) {
    return { success: false, error: 'Database not available' };
  }

  const ordersDB = new OrdersDB(db);

  try {
    // Check if order already exists for this payment intent
    const existingOrder = await ordersDB.getOrderByPaymentIntent(input.stripePaymentIntentId);
    if (existingOrder) {
      console.log('[Orders] Order already exists for payment intent:', existingOrder.order_number);
      return {
        success: true,
        orderNumber: existingOrder.order_number,
        orderId: existingOrder.id,
      };
    }

    // Create order in D1
    // For check payments, status is 'pending' until check is received
    const paymentStatus = input.paymentMethod === 'check' ? 'pending' : 'paid';
    const order = await ordersDB.createOrder({
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone,
      customerName: input.customerName,
      shippingAddress: input.shippingAddress,
      items: input.items,
      subtotal: input.subtotal,
      shipping: input.shipping,
      total: input.total,
      stripePaymentIntentId: input.stripePaymentIntentId,
      paymentStatus,
    });

    console.log('[Orders] Created order:', order.order_number);

    // Sync to ERPNext
    let erpnextSyncResult: { success: boolean; salesOrderName?: string; error?: string } = {
      success: false,
      error: 'ERPNext sync not attempted',
    };

    const workerSyncSecret = this.platform?.env?.WORKER_SYNC_SECRET;

    if (workerSyncSecret) {
      try {
        erpnextSyncResult = await syncOrderViaMigrationWorker(order, workerSyncSecret);

        // Update sync status in D1
        if (erpnextSyncResult.success) {
          await db
            .prepare(
              `UPDATE storefront_orders
               SET sync_status = 'synced',
                   erpnext_sales_order = ?,
                   updated_at = datetime('now')
               WHERE id = ?`
            )
            .bind(erpnextSyncResult.salesOrderName || null, order.id)
            .run();
        } else {
          await db
            .prepare(
              `UPDATE storefront_orders
               SET sync_status = 'failed',
                   updated_at = datetime('now')
               WHERE id = ?`
            )
            .bind(order.id)
            .run();
        }
      } catch (err) {
        console.error('[Orders] ERPNext sync error:', err);
        erpnextSyncResult = {
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        };
      }
    } else {
      console.log('[Orders] WORKER_SYNC_SECRET not configured, skipping ERPNext sync');
      erpnextSyncResult = { success: false, error: 'Worker sync not configured' };
    }

    return {
      success: true,
      orderNumber: order.order_number,
      orderId: order.id,
      erpnextSyncResult,
    };
  } catch (err) {
    console.error('[Orders] Error creating order:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to create order',
    };
  }
});

const MIGRATION_WORKER_URL = 'https://solampio-migration.solamp.workers.dev';

/**
 * Sync order to ERPNext via the migration worker
 */
async function syncOrderViaMigrationWorker(
  order: Order,
  workerSyncSecret: string,
): Promise<{ success: boolean; salesOrderName?: string; customerName?: string; error?: string }> {
  // Parse shipping address and items from JSON strings
  let shippingAddress: { line1: string; line2?: string; city: string; state: string; postal_code: string; country: string } | undefined;
  if (order.shipping_address) {
    try {
      shippingAddress = JSON.parse(order.shipping_address);
    } catch {
      console.error('[Orders] Failed to parse shipping address');
    }
  }

  let items: Array<{ sku: string; title: string; price: number; quantity: number }> = [];
  try {
    items = JSON.parse(order.items);
  } catch {
    throw new Error('Failed to parse order items');
  }

  const response = await fetch(`${MIGRATION_WORKER_URL}/api/web-orders/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${workerSyncSecret}`,
    },
    body: JSON.stringify({
      order_number: order.order_number,
      customer_name: order.customer_name,
      customer_email: order.customer_email || undefined,
      customer_phone: order.customer_phone || undefined,
      shipping_address: shippingAddress || {
        line1: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'US',
      },
      items: items.map((item) => ({
        sku: item.sku,
        title: item.title,
        quantity: item.quantity,
        price: item.price,
      })),
      stripe_payment_intent_id: order.stripe_payment_intent_id || undefined,
    }),
  });

  const result = (await response.json()) as {
    success: boolean;
    data?: { sales_order_name: string; customer_name: string | null };
    error?: string;
  };

  if (!result.success) {
    console.error('[Orders] Migration worker sync failed:', result.error);
    return { success: false, error: result.error || 'Migration worker sync failed' };
  }

  console.log('[Orders] Synced to ERPNext via migration worker:', result.data?.sales_order_name);
  return {
    success: true,
    salesOrderName: result.data?.sales_order_name,
    customerName: result.data?.customer_name || undefined,
  };
}
