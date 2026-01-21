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

    const erpnextUrl = this.platform?.env?.ERPNEXT_URL;
    const erpnextApiKey = this.platform?.env?.ERPNEXT_API_KEY;
    const erpnextApiSecret = this.platform?.env?.ERPNEXT_API_SECRET;

    if (erpnextUrl && erpnextApiKey && erpnextApiSecret) {
      try {
        erpnextSyncResult = await syncOrderToERPNextInternal(
          order,
          { url: erpnextUrl, apiKey: erpnextApiKey, apiSecret: erpnextApiSecret }
        );

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
      console.log('[Orders] ERPNext not configured, skipping sync');
      erpnextSyncResult = { success: false, error: 'ERPNext not configured' };
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

/**
 * Internal function to sync order to ERPNext
 */
async function syncOrderToERPNextInternal(
  order: Order,
  env: { url: string; apiKey: string; apiSecret: string }
): Promise<{ success: boolean; salesOrderName?: string; customerName?: string; error?: string }> {
  const headers: HeadersInit = {
    Authorization: `token ${env.apiKey}:${env.apiSecret}`,
    'Content-Type': 'application/json',
  };

  // 1. Find or create customer
  let customerName: string;

  if (order.customer_email) {
    // Search for existing customer by email
    const searchUrl = `${env.url}/api/resource/Customer?filters=[["email_id","=","${encodeURIComponent(order.customer_email)}"]]&fields=["name"]`;
    console.log('[ERPNext] Searching for customer by email:', order.customer_email);

    const searchResponse = await fetch(searchUrl, { headers });
    if (searchResponse.ok) {
      const searchResult = await searchResponse.json() as { data: Array<{ name: string }> };
      if (searchResult.data && searchResult.data.length > 0) {
        customerName = searchResult.data[0].name;
        console.log('[ERPNext] Found existing customer:', customerName);
      } else {
        // Create new customer
        const createCustomerResponse = await fetch(`${env.url}/api/resource/Customer`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            customer_name: order.customer_name,
            email_id: order.customer_email,
            mobile_no: order.customer_phone,
            customer_type: 'Individual',
            customer_group: 'Individual',
            territory: 'United States',
          }),
        });

        if (!createCustomerResponse.ok) {
          const errorText = await createCustomerResponse.text();
          throw new Error(`Failed to create customer: ${errorText}`);
        }

        const customerResult = await createCustomerResponse.json() as { data: { name: string } };
        customerName = customerResult.data.name;
        console.log('[ERPNext] Created new customer:', customerName);
      }
    } else {
      throw new Error(`Failed to search for customer: ${await searchResponse.text()}`);
    }
  } else {
    // Create customer without email
    const createCustomerResponse = await fetch(`${env.url}/api/resource/Customer`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        customer_name: order.customer_name,
        mobile_no: order.customer_phone,
        customer_type: 'Individual',
        customer_group: 'Individual',
        territory: 'United States',
      }),
    });

    if (!createCustomerResponse.ok) {
      const errorText = await createCustomerResponse.text();
      throw new Error(`Failed to create customer: ${errorText}`);
    }

    const customerResult = await createCustomerResponse.json() as { data: { name: string } };
    customerName = customerResult.data.name;
    console.log('[ERPNext] Created new customer (no email):', customerName);
  }

  // 2. Create shipping address
  let shippingAddressName: string | undefined;

  if (order.shipping_address) {
    try {
      const shippingData = JSON.parse(order.shipping_address);
      const createAddressResponse = await fetch(`${env.url}/api/resource/Address`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          address_title: `${order.customer_name} - ${order.order_number}`,
          address_type: 'Shipping',
          address_line1: shippingData.line1,
          address_line2: shippingData.line2 || '',
          city: shippingData.city,
          state: shippingData.state,
          pincode: shippingData.postal_code,
          country: shippingData.country === 'US' ? 'United States' : shippingData.country,
          links: [
            {
              link_doctype: 'Customer',
              link_name: customerName,
            },
          ],
        }),
      });

      if (createAddressResponse.ok) {
        const addressResult = await createAddressResponse.json() as { data: { name: string } };
        shippingAddressName = addressResult.data.name;
        console.log('[ERPNext] Created shipping address:', shippingAddressName);
      } else {
        console.error('[ERPNext] Failed to create address:', await createAddressResponse.text());
        // Continue without address
      }
    } catch (err) {
      console.error('[ERPNext] Error creating address:', err);
      // Continue without address
    }
  }

  // 3. Create Sales Order
  let items: Array<{ sku: string; title: string; price: number; quantity: number }> = [];
  try {
    items = JSON.parse(order.items);
  } catch {
    throw new Error('Failed to parse order items');
  }

  const soItems = items.map((item) => ({
    item_code: item.sku,
    item_name: item.title,
    qty: item.quantity,
    rate: item.price,
    amount: item.price * item.quantity,
  }));

  const today = new Date();
  const deliveryDate = new Date(today);
  deliveryDate.setDate(deliveryDate.getDate() + 7);

  const salesOrderData: Record<string, unknown> = {
    customer: customerName,
    transaction_date: today.toISOString().split('T')[0],
    delivery_date: deliveryDate.toISOString().split('T')[0],
    order_type: 'Sales',
    items: soItems,
    contact_email: order.customer_email || undefined,
    contact_mobile: order.customer_phone || undefined,
    po_no: order.order_number,
  };

  if (shippingAddressName) {
    salesOrderData.shipping_address_name = shippingAddressName;
    salesOrderData.customer_address = shippingAddressName;
  }

  const createSOResponse = await fetch(`${env.url}/api/resource/Sales Order`, {
    method: 'POST',
    headers,
    body: JSON.stringify(salesOrderData),
  });

  if (!createSOResponse.ok) {
    const errorText = await createSOResponse.text();
    throw new Error(`Failed to create Sales Order: ${errorText}`);
  }

  const soResult = await createSOResponse.json() as { data: { name: string } };
  console.log('[ERPNext] Created Sales Order:', soResult.data.name);

  return {
    success: true,
    salesOrderName: soResult.data.name,
    customerName,
  };
}
