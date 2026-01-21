/**
 * ERPNext API Client
 *
 * Handles API calls to ERPNext for order and customer sync.
 * Uses token-based authentication.
 */

import { server$ } from '@builder.io/qwik-city';
import type { Order } from './orders';

// ============================================================================
// Type Definitions
// ============================================================================

export interface ERPNextCustomer {
  name: string;
  customer_name: string;
  email_id?: string;
  mobile_no?: string;
  customer_type: 'Individual' | 'Company';
  customer_group: string;
  territory: string;
}

export interface ERPNextAddress {
  name?: string;
  address_title: string;
  address_type: 'Billing' | 'Shipping';
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  links: Array<{
    link_doctype: string;
    link_name: string;
  }>;
}

export interface ERPNextSalesOrderItem {
  item_code: string;
  item_name: string;
  qty: number;
  rate: number;
  amount: number;
}

export interface ERPNextSalesOrder {
  name?: string;
  naming_series?: string;
  customer: string;
  transaction_date: string;
  delivery_date: string;
  order_type: string;
  items: ERPNextSalesOrderItem[];
  taxes_and_charges?: string;
  shipping_address_name?: string;
  customer_address?: string;
  contact_email?: string;
  contact_mobile?: string;
  po_no?: string; // External order reference
  custom_web_order_number?: string;
  custom_stripe_payment_intent?: string;
}

interface ERPNextAPIResponse<T> {
  data: T;
  message?: string;
}

// ============================================================================
// ERPNext API Request Helper (Server-side only)
// ============================================================================

async function erpnextRequest<T>(
  method: 'GET' | 'POST' | 'PUT',
  endpoint: string,
  body?: Record<string, unknown>,
  env?: { ERPNEXT_URL?: string; ERPNEXT_API_KEY?: string; ERPNEXT_API_SECRET?: string }
): Promise<T> {
  const url = env?.ERPNEXT_URL || process.env.ERPNEXT_URL;
  const apiKey = env?.ERPNEXT_API_KEY || process.env.ERPNEXT_API_KEY;
  const apiSecret = env?.ERPNEXT_API_SECRET || process.env.ERPNEXT_API_SECRET;

  if (!url || !apiKey || !apiSecret) {
    throw new Error('ERPNext API credentials not configured');
  }

  const headers: HeadersInit = {
    Authorization: `token ${apiKey}:${apiSecret}`,
    'Content-Type': 'application/json',
  };

  const fetchOptions: RequestInit = {
    method,
    headers,
  };

  if (body && (method === 'POST' || method === 'PUT')) {
    fetchOptions.body = JSON.stringify(body);
  }

  const fullUrl = `${url}/api/${endpoint}`;
  console.log(`[ERPNext] ${method} ${fullUrl}`);

  const response = await fetch(fullUrl, fetchOptions);

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[ERPNext] API error: ${response.status} ${errorText}`);
    throw new Error(`ERPNext API error: ${response.status} - ${errorText}`);
  }

  const result = await response.json() as ERPNextAPIResponse<T>;
  return result.data;
}

// ============================================================================
// Customer Functions
// ============================================================================

/**
 * Find a customer by email address
 */
export const findCustomerByEmail = server$(async function (
  email: string
): Promise<ERPNextCustomer | null> {
  const env = {
    ERPNEXT_URL: this.platform?.env?.ERPNEXT_URL,
    ERPNEXT_API_KEY: this.platform?.env?.ERPNEXT_API_KEY,
    ERPNEXT_API_SECRET: this.platform?.env?.ERPNEXT_API_SECRET,
  };

  try {
    // Search for customer by email
    const customers = await erpnextRequest<ERPNextCustomer[]>(
      'GET',
      `resource/Customer?filters=[["email_id","=","${encodeURIComponent(email)}"]]&fields=["name","customer_name","email_id","mobile_no","customer_type","customer_group","territory"]`,
      undefined,
      env
    );

    if (customers && customers.length > 0) {
      console.log(`[ERPNext] Found existing customer: ${customers[0].name}`);
      return customers[0];
    }

    return null;
  } catch (err) {
    console.error('[ERPNext] Error finding customer:', err);
    return null;
  }
});

/**
 * Create a new customer in ERPNext
 */
export const createCustomer = server$(async function (
  customerData: {
    name: string;
    email: string;
    phone: string;
  }
): Promise<ERPNextCustomer> {
  const env = {
    ERPNEXT_URL: this.platform?.env?.ERPNEXT_URL,
    ERPNEXT_API_KEY: this.platform?.env?.ERPNEXT_API_KEY,
    ERPNEXT_API_SECRET: this.platform?.env?.ERPNEXT_API_SECRET,
  };

  const customer = await erpnextRequest<ERPNextCustomer>(
    'POST',
    'resource/Customer',
    {
      customer_name: customerData.name,
      email_id: customerData.email,
      mobile_no: customerData.phone,
      customer_type: 'Individual',
      customer_group: 'Individual', // Default customer group
      territory: 'United States', // Default territory
    },
    env
  );

  console.log(`[ERPNext] Created new customer: ${customer.name}`);
  return customer;
});

/**
 * Find or create a customer by email
 */
export const findOrCreateCustomer = server$(async function (
  customerData: {
    name: string;
    email: string;
    phone: string;
  }
): Promise<ERPNextCustomer> {
  const env = {
    ERPNEXT_URL: this.platform?.env?.ERPNEXT_URL,
    ERPNEXT_API_KEY: this.platform?.env?.ERPNEXT_API_KEY,
    ERPNEXT_API_SECRET: this.platform?.env?.ERPNEXT_API_SECRET,
  };

  // First try to find existing customer
  try {
    const customers = await erpnextRequest<ERPNextCustomer[]>(
      'GET',
      `resource/Customer?filters=[["email_id","=","${encodeURIComponent(customerData.email)}"]]&fields=["name","customer_name","email_id","mobile_no","customer_type","customer_group","territory"]`,
      undefined,
      env
    );

    if (customers && customers.length > 0) {
      console.log(`[ERPNext] Found existing customer: ${customers[0].name}`);
      return customers[0];
    }
  } catch (err) {
    console.error('[ERPNext] Error searching for customer:', err);
  }

  // Create new customer
  const customer = await erpnextRequest<ERPNextCustomer>(
    'POST',
    'resource/Customer',
    {
      customer_name: customerData.name,
      email_id: customerData.email,
      mobile_no: customerData.phone,
      customer_type: 'Individual',
      customer_group: 'Individual',
      territory: 'United States',
    },
    env
  );

  console.log(`[ERPNext] Created new customer: ${customer.name}`);
  return customer;
});

// ============================================================================
// Address Functions
// ============================================================================

/**
 * Create a shipping address for a customer
 */
export const createAddress = server$(async function (
  customerName: string,
  address: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  }
): Promise<ERPNextAddress> {
  const env = {
    ERPNEXT_URL: this.platform?.env?.ERPNEXT_URL,
    ERPNEXT_API_KEY: this.platform?.env?.ERPNEXT_API_KEY,
    ERPNEXT_API_SECRET: this.platform?.env?.ERPNEXT_API_SECRET,
  };

  const erpAddress = await erpnextRequest<ERPNextAddress>(
    'POST',
    'resource/Address',
    {
      address_title: `${address.name} - Shipping`,
      address_type: 'Shipping',
      address_line1: address.line1,
      address_line2: address.line2 || '',
      city: address.city,
      state: address.state,
      pincode: address.postalCode,
      country: address.country === 'US' ? 'United States' : address.country,
      links: [
        {
          link_doctype: 'Customer',
          link_name: customerName,
        },
      ],
    },
    env
  );

  console.log(`[ERPNext] Created address: ${erpAddress.name}`);
  return erpAddress;
});

// ============================================================================
// Sales Order Functions
// ============================================================================

/**
 * Create a Sales Order in ERPNext from a web order
 */
export const createSalesOrder = server$(async function (
  order: Order,
  customerName: string,
  shippingAddressName?: string
): Promise<ERPNextSalesOrder> {
  const env = {
    ERPNEXT_URL: this.platform?.env?.ERPNEXT_URL,
    ERPNEXT_API_KEY: this.platform?.env?.ERPNEXT_API_KEY,
    ERPNEXT_API_SECRET: this.platform?.env?.ERPNEXT_API_SECRET,
  };

  // Parse order items
  let items: Array<{
    product_id: string;
    sku: string;
    title: string;
    price: number;
    quantity: number;
  }> = [];

  try {
    items = JSON.parse(order.items);
  } catch {
    throw new Error('Failed to parse order items');
  }

  // Map items to ERPNext format
  const soItems: ERPNextSalesOrderItem[] = items.map((item) => ({
    item_code: item.sku,
    item_name: item.title,
    qty: item.quantity,
    rate: item.price,
    amount: item.price * item.quantity,
  }));

  // Calculate delivery date (default to 7 days from now)
  const today = new Date();
  const deliveryDate = new Date(today);
  deliveryDate.setDate(deliveryDate.getDate() + 7);

  const salesOrder: Partial<ERPNextSalesOrder> = {
    customer: customerName,
    transaction_date: today.toISOString().split('T')[0],
    delivery_date: deliveryDate.toISOString().split('T')[0],
    order_type: 'Sales',
    items: soItems,
    contact_email: order.customer_email || undefined,
    contact_mobile: order.customer_phone || undefined,
    po_no: order.order_number, // Store web order number as PO reference
  };

  // Add shipping address if available
  if (shippingAddressName) {
    salesOrder.shipping_address_name = shippingAddressName;
    salesOrder.customer_address = shippingAddressName;
  }

  const result = await erpnextRequest<ERPNextSalesOrder>(
    'POST',
    'resource/Sales Order',
    salesOrder,
    env
  );

  console.log(`[ERPNext] Created Sales Order: ${result.name}`);
  return result;
});

// ============================================================================
// Main Sync Function
// ============================================================================

/**
 * Sync a web order to ERPNext
 * Creates Customer (if needed), Address, and Sales Order
 */
export const syncOrderToERPNext = server$(async function (
  order: Order
): Promise<{
  success: boolean;
  customerName?: string;
  salesOrderName?: string;
  error?: string;
}> {
  const env = {
    ERPNEXT_URL: this.platform?.env?.ERPNEXT_URL,
    ERPNEXT_API_KEY: this.platform?.env?.ERPNEXT_API_KEY,
    ERPNEXT_API_SECRET: this.platform?.env?.ERPNEXT_API_SECRET,
  };

  // Check if ERPNext is configured
  if (!env.ERPNEXT_URL || !env.ERPNEXT_API_KEY || !env.ERPNEXT_API_SECRET) {
    console.log('[ERPNext] API not configured, skipping sync');
    return { success: false, error: 'ERPNext API not configured' };
  }

  try {
    // 1. Find or create customer
    let customer: ERPNextCustomer;

    // Try to find existing customer by email
    if (order.customer_email) {
      const existingCustomers = await erpnextRequest<ERPNextCustomer[]>(
        'GET',
        `resource/Customer?filters=[["email_id","=","${encodeURIComponent(order.customer_email)}"]]&fields=["name","customer_name","email_id","mobile_no","customer_type","customer_group","territory"]`,
        undefined,
        env
      );

      if (existingCustomers && existingCustomers.length > 0) {
        customer = existingCustomers[0];
        console.log(`[ERPNext] Using existing customer: ${customer.name}`);
      } else {
        // Create new customer
        customer = await erpnextRequest<ERPNextCustomer>(
          'POST',
          'resource/Customer',
          {
            customer_name: order.customer_name,
            email_id: order.customer_email,
            mobile_no: order.customer_phone,
            customer_type: 'Individual',
            customer_group: 'Individual',
            territory: 'United States',
          },
          env
        );
        console.log(`[ERPNext] Created new customer: ${customer.name}`);
      }
    } else {
      // No email - create customer with phone as identifier
      customer = await erpnextRequest<ERPNextCustomer>(
        'POST',
        'resource/Customer',
        {
          customer_name: order.customer_name,
          mobile_no: order.customer_phone,
          customer_type: 'Individual',
          customer_group: 'Individual',
          territory: 'United States',
        },
        env
      );
      console.log(`[ERPNext] Created new customer (no email): ${customer.name}`);
    }

    // 2. Create shipping address
    let shippingAddressName: string | undefined;

    if (order.shipping_address) {
      try {
        const shippingData = JSON.parse(order.shipping_address);
        const address = await erpnextRequest<ERPNextAddress>(
          'POST',
          'resource/Address',
          {
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
                link_name: customer.name,
              },
            ],
          },
          env
        );
        shippingAddressName = address.name;
        console.log(`[ERPNext] Created shipping address: ${shippingAddressName}`);
      } catch (err) {
        console.error('[ERPNext] Error creating address:', err);
        // Continue without address
      }
    }

    // 3. Create Sales Order
    let items: Array<{
      sku: string;
      title: string;
      price: number;
      quantity: number;
    }> = [];

    try {
      items = JSON.parse(order.items);
    } catch {
      throw new Error('Failed to parse order items');
    }

    const soItems: ERPNextSalesOrderItem[] = items.map((item) => ({
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
      customer: customer.name,
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

    const salesOrder = await erpnextRequest<ERPNextSalesOrder>(
      'POST',
      'resource/Sales Order',
      salesOrderData,
      env
    );

    console.log(`[ERPNext] Created Sales Order: ${salesOrder.name}`);

    return {
      success: true,
      customerName: customer.name,
      salesOrderName: salesOrder.name,
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('[ERPNext] Sync error:', errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
});

/**
 * Update order sync status in D1 after ERPNext sync
 */
export const updateOrderSyncStatus = server$(async function (
  orderId: string,
  syncStatus: 'synced' | 'failed',
  erpnextOrderName?: string
): Promise<void> {
  const db = this.platform?.env?.DB;
  if (!db) {
    throw new Error('Database not available');
  }

  await db
    .prepare(
      `UPDATE storefront_orders
       SET sync_status = ?,
           erpnext_sales_order = ?,
           updated_at = datetime('now')
       WHERE id = ?`
    )
    .bind(syncStatus, erpnextOrderName || null, orderId)
    .run();

  console.log(`[Orders] Updated sync status for ${orderId}: ${syncStatus}`);
});
