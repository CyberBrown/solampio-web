import type {
  ERPNextItem,
  ERPNextCustomer,
  ERPNextSalesOrder,
  CreateSalesOrderPayload,
  PaginationInfo,
  ItemPrice,
  PriceList,
  ItemWithChildren,
  ItemComplete,
  CreateItemPayload,
  CreateItemPricePayload,
  ItemResponse,
  ItemPriceResponse,
  BulkResult,
  ERPNextErrorDetail,
  ERPNextFieldError,
  ItemAttribute,
  ItemAttributeValue,
  CreateItemAttributePayload,
  ERPNextBrand,
  ERPNextBrandExtended,
  CreateBrandPayload,
} from '../../types';

// ============================================================================
// Error Classes
// ============================================================================

/**
 * Base ERPNext API Error
 */
export class ERPNextAPIError extends Error {
  public readonly statusCode: number;
  public readonly errorType: ERPNextErrorDetail['type'];
  public readonly fieldErrors?: ERPNextFieldError[];
  public readonly rawResponse?: string;

  constructor(detail: ERPNextErrorDetail) {
    super(detail.message);
    this.name = 'ERPNextAPIError';
    this.statusCode = detail.statusCode;
    this.errorType = detail.type;
    this.fieldErrors = detail.fieldErrors;
    this.rawResponse = detail.rawResponse;
  }

  toDetail(): ERPNextErrorDetail {
    return {
      statusCode: this.statusCode,
      message: this.message,
      type: this.errorType,
      fieldErrors: this.fieldErrors,
      rawResponse: this.rawResponse,
    };
  }
}

/**
 * 404 Not Found - Item or doctype doesn't exist
 */
export class ERPNextNotFoundError extends ERPNextAPIError {
  constructor(doctype: string, name: string, rawResponse?: string) {
    super({
      statusCode: 404,
      message: `${doctype} '${name}' not found`,
      type: 'not_found',
      rawResponse,
    });
    this.name = 'ERPNextNotFoundError';
  }
}

/**
 * 417 Validation Error - Field-level validation failures
 */
export class ERPNextValidationError extends ERPNextAPIError {
  constructor(message: string, fieldErrors?: ERPNextFieldError[], rawResponse?: string) {
    super({
      statusCode: 417,
      message,
      type: 'validation',
      fieldErrors,
      rawResponse,
    });
    this.name = 'ERPNextValidationError';
  }
}

/**
 * 409 Duplicate Entry - Record already exists
 */
export class ERPNextDuplicateError extends ERPNextAPIError {
  constructor(doctype: string, name: string, rawResponse?: string) {
    super({
      statusCode: 409,
      message: `${doctype} '${name}' already exists`,
      type: 'duplicate',
      rawResponse,
    });
    this.name = 'ERPNextDuplicateError';
  }
}

// ============================================================================
// Interfaces
// ============================================================================

// Re-export lookup cache and types
export { LookupCache } from './lookups';
export type {
  ItemGroup,
  Brand,
  PriceList,
  UOM,
  Warehouse,
  Country,
  Currency,
  Company,
  Supplier,
  ItemTaxTemplate,
  ValidationResult,
  ValidationSummary,
} from './lookups';

// Re-export custom field management
export {
  CustomFieldManager,
  REQUIRED_CUSTOM_FIELDS,
  EXTENDED_CUSTOM_FIELDS,
  ITEM_GROUP_CUSTOM_FIELDS,
  STOREFRONT_FEATURED_CUSTOM_FIELDS,
  BRAND_CUSTOM_FIELDS,
  CUSTOMER_CUSTOM_FIELDS,
  ADDRESS_CUSTOM_FIELDS,
  SALES_ORDER_CUSTOM_FIELDS,
  MULTI_CATEGORY_CUSTOM_FIELDS,
  WEBSITE_CATEGORY_CUSTOM_FIELD,
  // Shipping custom fields
  SHIPPING_SECTION_FIELDS,
  PRODUCT_DIMENSION_FIELDS,
  SHIPPING_DIMENSION_FIELDS,
  SHIPPING_QUALIFICATION_FIELDS,
  SHIPPING_VARIANT_FIELDS,
  ALL_SHIPPING_CUSTOM_FIELDS,
  BC_TO_CUSTOM_FIELD_MAP,
  mapBCProductToCustomFields,
  prepareItemPayloadWithCustomFields,
  extractCustomFieldValues,
  validateCustomFieldValues,
  getCustomFieldNames,
} from './custom-fields';
export type {
  CustomFieldDef,
  CustomFieldCheck,
  CreateFieldResult,
} from './custom-fields';

interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

interface FetchOptions {
  page?: number;
  limit?: number;
  filters?: Record<string, unknown>;
}

interface BulkInsertOptions {
  batchSize?: number;
  delayBetweenBatches?: number; // milliseconds
}

// ============================================================================
// Client Implementation
// ============================================================================

export class ERPNextClient {
  private baseUrl: string;
  private headers: HeadersInit;

  constructor(url: string, apiKey: string, apiSecret: string) {
    this.baseUrl = url.replace(/\/$/, '');
    this.headers = {
      'Authorization': `token ${apiKey}:${apiSecret}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  // ============================================================================
  // Error Parsing
  // ============================================================================

  /**
   * Parse ERPNext error response and throw appropriate error class
   */
  private parseAndThrowError(statusCode: number, responseText: string, doctype?: string, name?: string): never {
    let parsedError: { message?: string; exc_type?: string; _server_messages?: string } | null = null;

    try {
      parsedError = JSON.parse(responseText);
    } catch {
      // Response is not JSON
    }

    // Extract message from _server_messages if present
    let message = parsedError?.message || responseText;
    let fieldErrors: ERPNextFieldError[] | undefined;

    if (parsedError?._server_messages) {
      try {
        const serverMessages = JSON.parse(parsedError._server_messages);
        if (Array.isArray(serverMessages) && serverMessages.length > 0) {
          const firstMessage = JSON.parse(serverMessages[0]);
          message = firstMessage.message || message;
        }
      } catch {
        // Couldn't parse server messages
      }
    }

    // Parse field-level validation errors
    if (statusCode === 417 && responseText.includes('ValidationError')) {
      fieldErrors = this.parseFieldErrors(responseText);
    }

    // 404: Not Found
    if (statusCode === 404) {
      throw new ERPNextNotFoundError(doctype || 'Document', name || 'unknown', responseText);
    }

    // 417: Validation Error
    if (statusCode === 417) {
      throw new ERPNextValidationError(message, fieldErrors, responseText);
    }

    // 409: Duplicate Entry (also check for DuplicateEntryError in message)
    if (statusCode === 409 || message.includes('DuplicateEntryError') || message.includes('already exists')) {
      throw new ERPNextDuplicateError(doctype || 'Document', name || 'unknown', responseText);
    }

    // 403: Permission denied
    if (statusCode === 403) {
      throw new ERPNextAPIError({
        statusCode,
        message: `Permission denied: ${message}`,
        type: 'permission',
        rawResponse: responseText,
      });
    }

    // 500+: Server errors
    if (statusCode >= 500) {
      throw new ERPNextAPIError({
        statusCode,
        message: `Server error: ${message}`,
        type: 'server',
        rawResponse: responseText,
      });
    }

    // Unknown error
    throw new ERPNextAPIError({
      statusCode,
      message,
      type: 'unknown',
      rawResponse: responseText,
    });
  }

  /**
   * Parse field-level validation errors from ERPNext response
   */
  private parseFieldErrors(responseText: string): ERPNextFieldError[] {
    const fieldErrors: ERPNextFieldError[] = [];

    try {
      const parsed = JSON.parse(responseText);
      if (parsed._server_messages) {
        const serverMessages = JSON.parse(parsed._server_messages);
        for (const msg of serverMessages) {
          try {
            const msgObj = JSON.parse(msg);
            // ERPNext often includes field info in the message
            const fieldMatch = msgObj.message?.match(/(?:Row #\d+:?\s*)?(\w+):\s*(.+)/);
            if (fieldMatch) {
              fieldErrors.push({
                fieldname: fieldMatch[1],
                message: fieldMatch[2],
              });
            } else if (msgObj.message) {
              fieldErrors.push({
                fieldname: 'unknown',
                message: msgObj.message,
              });
            }
          } catch {
            // Skip unparseable messages
          }
        }
      }
    } catch {
      // Return empty array if parsing fails
    }

    return fieldErrors;
  }

  // ============================================================================
  // HTTP Methods
  // ============================================================================

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}/api/resource${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.headers,
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      // Extract doctype and name from endpoint for error messages
      const endpointMatch = endpoint.match(/\/([^/?]+)(?:\/([^/?]+))?/);
      const doctype = endpointMatch?.[1]?.replace(/%20/g, ' ');
      const name = endpointMatch?.[2] ? decodeURIComponent(endpointMatch[2]) : undefined;
      this.parseAndThrowError(response.status, errorText, doctype, name);
    }

    return response.json() as Promise<T>;
  }

  private async method<T>(method: string, args?: Record<string, unknown>): Promise<T> {
    const url = `${this.baseUrl}/api/method/${method}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(args || {}),
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.parseAndThrowError(response.status, errorText);
    }

    const result = await response.json() as { message: T };
    return result.message;
  }

  /**
   * Convert filter object to Frappe array filter syntax.
   * Frappe expects: [["field", "=", "value"], ...]
   */
  private normalizeFilters(filters: Record<string, unknown>): Array<[string, string, unknown]> {
    return Object.entries(filters).map(([field, value]) => {
      if (Array.isArray(value) && value.length === 3) {
        // Already in [field, operator, value] format
        return value as [string, string, unknown];
      }
      // Convert to equals comparison
      return [field, '=', value];
    });
  }

  // ============================================================================
  // Generic Resource Methods (for Custom Fields and other doctypes)
  // ============================================================================

  /**
   * Get a single resource by doctype and name
   */
  async getResource<T>(doctype: string, name: string): Promise<T> {
    const result = await this.request<{ data: T }>(
      `/${encodeURIComponent(doctype)}/${encodeURIComponent(name)}`
    );
    return result.data;
  }

  /**
   * Create a new resource
   */
  async createResource<T>(doctype: string, data: Record<string, unknown>): Promise<T> {
    const result = await this.request<{ data: T }>(
      `/${encodeURIComponent(doctype)}`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return result.data;
  }

  /**
   * Update an existing resource
   */
  async updateResource<T>(doctype: string, name: string, data: Record<string, unknown>): Promise<T> {
    const result = await this.request<{ data: T }>(
      `/${encodeURIComponent(doctype)}/${encodeURIComponent(name)}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
    return result.data;
  }

  /**
   * Delete a resource
   */
  async deleteResource(doctype: string, name: string): Promise<void> {
    await this.request(
      `/${encodeURIComponent(doctype)}/${encodeURIComponent(name)}`,
      { method: 'DELETE' }
    );
  }

  // Items
  async getItems(options: FetchOptions = {}): Promise<PaginatedResponse<ERPNextItem>> {
    const { page = 1, limit = 50, filters } = options;

    const params = new URLSearchParams({
      limit_start: ((page - 1) * limit).toString(),
      limit_page_length: limit.toString(),
      // Request all fields with '*' - API permissions will determine what's returned
      fields: JSON.stringify(['*']),
    });

    if (filters) {
      // Convert to Frappe array filter syntax
      const filterArray = this.normalizeFilters(filters);
      params.set('filters', JSON.stringify(filterArray));
    }

    const result = await this.request<{ data: ERPNextItem[] }>(`/Item?${params}`);

    // ERPNext doesn't return total count in list response, need separate call
    const countResult = await this.method<number>('frappe.client.get_count', {
      doctype: 'Item',
      filters: filters || {},
    });

    return {
      data: result.data,
      pagination: {
        page,
        per_page: limit,
        total: countResult,
        total_pages: Math.ceil(countResult / limit),
      },
    };
  }

  /**
   * Get a single item with all child tables populated
   * GET /api/resource/Item/{itemCode}
   *
   * ERPNext automatically returns child tables:
   * - uoms[] - Alternate units of measure
   * - barcodes[] - Barcodes (GTIN, UPC, EAN, etc.)
   * - item_defaults[] - Company-specific defaults
   * - taxes[] - Item tax templates
   * - reorder_levels[] - Reorder triggers per warehouse
   * - supplier_items[] - Supplier-specific details
   */
  async getItem(itemCode: string): Promise<ItemWithChildren> {
    const result = await this.request<{ data: ItemWithChildren }>(`/Item/${encodeURIComponent(itemCode)}`);

    // Ensure child tables are always arrays (ERPNext returns empty arrays, but be defensive)
    const item = result.data;
    return {
      ...item,
      uoms: item.uoms || [],
      barcodes: item.barcodes || [],
      item_defaults: item.item_defaults || [],
      taxes: item.taxes || [],
      reorder_levels: item.reorder_levels || [],
      supplier_items: item.supplier_items || [],
      website_specifications: item.website_specifications || [],
      attributes: item.attributes || [],
    };
  }

  /**
   * Get item with all child tables AND all associated Item Prices
   * Fetches Item and Item Prices in parallel for efficiency
   */
  async getItemWithPrices(itemCode: string): Promise<ItemComplete> {
    const [item, prices] = await Promise.all([
      this.getItem(itemCode),
      this.getItemPrices(itemCode),
    ]);

    return {
      ...item,
      prices,
    };
  }

  /**
   * Create a new item with optional child tables
   * POST /api/resource/Item
   *
   * Child tables (uoms, barcodes, item_defaults, etc.) can be included
   * in the payload and will be created alongside the parent Item.
   */
  async createItem(item: CreateItemPayload): Promise<ItemWithChildren> {
    const result = await this.request<ItemResponse>('/Item', {
      method: 'POST',
      body: JSON.stringify(item),
    });
    return result.data;
  }

  /**
   * Update an existing item
   * PUT /api/resource/Item/{itemCode}
   *
   * For child tables, you can:
   * - Replace entire child table by passing the full array
   * - Update specific rows by including their 'name' field
   * - Add new rows by including rows without 'name'
   */
  async updateItem(itemCode: string, updates: Partial<CreateItemPayload>): Promise<ItemWithChildren> {
    const result = await this.request<ItemResponse>(`/Item/${encodeURIComponent(itemCode)}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return result.data;
  }

  /**
   * Create a new Item Price
   * POST /api/resource/Item Price
   */
  async createItemPrice(price: CreateItemPricePayload): Promise<ItemPrice> {
    const result = await this.request<ItemPriceResponse>('/Item%20Price', {
      method: 'POST',
      body: JSON.stringify(price),
    });
    return result.data;
  }

  /**
   * Delete an Item Price by name
   * DELETE /api/resource/Item Price/{name}
   */
  async deleteItemPrice(name: string): Promise<void> {
    await this.request(`/Item%20Price/${encodeURIComponent(name)}`, {
      method: 'DELETE',
    });
  }

  /**
   * Upsert an Item Price - updates existing or creates new
   * If a price exists with same item_code, price_list, uom, and min_qty,
   * it will be deleted and recreated if the rate is different.
   */
  async upsertItemPrice(price: CreateItemPricePayload): Promise<ItemPrice> {
    // Get existing prices for this item
    const existing = await this.getItemPrices(price.item_code);

    // Find matching price entry
    const match = existing.find(p =>
      p.price_list === price.price_list &&
      (p.uom || 'Nos') === (price.uom || 'Nos') &&
      (p.min_qty || 0) === (price.min_qty || 0)
    );

    if (match) {
      // If rate is the same, return existing
      if (match.price_list_rate === price.price_list_rate) {
        return match;
      }

      // Delete existing price (ERPNext doesn't allow price updates)
      await this.deleteItemPrice(match.name);
    }

    // Create new price
    return this.createItemPrice(price);
  }

  /**
   * Bulk create items with rate limiting
   *
   * Attempts to use Frappe bulk insert if available, otherwise
   * falls back to batched individual inserts with rate limiting.
   */
  async bulkCreateItems(
    items: CreateItemPayload[],
    options: BulkInsertOptions = {}
  ): Promise<BulkResult<ItemWithChildren>> {
    const { batchSize = 10, delayBetweenBatches = 100 } = options;

    const result: BulkResult<ItemWithChildren> = {
      success: [],
      failed: [],
      total: items.length,
      successCount: 0,
      failedCount: 0,
    };

    // Try Frappe bulk insert first
    const bulkInsertAvailable = await this.checkBulkInsertAvailable();

    if (bulkInsertAvailable && items.length > 1) {
      try {
        const bulkResult = await this.frappeBlockInsert(items);
        result.success = bulkResult;
        result.successCount = bulkResult.length;
        return result;
      } catch (error) {
        // Bulk insert failed, fall back to individual inserts
        console.warn('Bulk insert failed, falling back to individual inserts:', error);
      }
    }

    // Batched individual inserts with rate limiting
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);

      // Process batch in parallel
      const batchResults = await Promise.allSettled(
        batch.map(item => this.createItem(item))
      );

      // Collect results
      for (let j = 0; j < batchResults.length; j++) {
        const batchResult = batchResults[j];
        const item = batch[j];

        if (batchResult.status === 'fulfilled') {
          result.success.push(batchResult.value);
          result.successCount++;
        } else {
          const error = batchResult.reason;
          const errorDetail: ERPNextErrorDetail = error instanceof ERPNextAPIError
            ? error.toDetail()
            : {
                statusCode: 500,
                message: error?.message || 'Unknown error',
                type: 'unknown',
              };

          result.failed.push({ item, error: errorDetail });
          result.failedCount++;
        }
      }

      // Rate limiting delay between batches
      if (i + batchSize < items.length && delayBetweenBatches > 0) {
        await this.delay(delayBetweenBatches);
      }
    }

    return result;
  }

  /**
   * Check if Frappe bulk insert method is available
   */
  private async checkBulkInsertAvailable(): Promise<boolean> {
    try {
      // Check if the bulk insert method exists
      await this.method<unknown>('frappe.client.get_list', {
        doctype: 'DocType',
        filters: { name: 'Item' },
        limit_page_length: 1,
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Use Frappe's bulk insert capability
   */
  private async frappeBlockInsert(items: CreateItemPayload[]): Promise<ItemWithChildren[]> {
    const result = await this.method<ItemWithChildren[]>('frappe.client.insert_many', {
      docs: items.map(item => ({
        doctype: 'Item',
        ...item,
      })),
    });
    return result;
  }

  /**
   * Utility delay function for rate limiting
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Item Prices
  async getItemPrices(itemCode: string): Promise<ItemPrice[]> {
    const filters = JSON.stringify([['item_code', '=', itemCode]]);
    // Removed 'min_qty' and 'batch_no' - not permitted in ERPNext v15 queries
    const fields = JSON.stringify(['name', 'item_code', 'price_list', 'price_list_rate', 'currency', 'uom', 'valid_from', 'valid_upto', 'buying', 'selling']);

    const result = await this.request<{ data: ItemPrice[] }>(
      `/Item%20Price?filters=${encodeURIComponent(filters)}&fields=${encodeURIComponent(fields)}`
    );
    return result.data;
  }

  async getPricesByPriceList(priceListName: string, options: FetchOptions = {}): Promise<PaginatedResponse<ItemPrice>> {
    const { page = 1, limit = 50 } = options;
    const filters = JSON.stringify([['price_list', '=', priceListName]]);
    // Removed 'min_qty' and 'batch_no' - not permitted in ERPNext v15 queries
    const fields = JSON.stringify(['name', 'item_code', 'price_list', 'price_list_rate', 'currency', 'uom', 'valid_from', 'valid_upto', 'buying', 'selling']);

    const params = new URLSearchParams({
      limit_start: ((page - 1) * limit).toString(),
      limit_page_length: limit.toString(),
      filters,
      fields,
    });

    const result = await this.request<{ data: ItemPrice[] }>(`/Item%20Price?${params}`);

    const countResult = await this.method<number>('frappe.client.get_count', {
      doctype: 'Item Price',
      filters: [['price_list', '=', priceListName]],
    });

    return {
      data: result.data,
      pagination: {
        page,
        per_page: limit,
        total: countResult,
        total_pages: Math.ceil(countResult / limit),
      },
    };
  }

  async getPriceList(name: string): Promise<PriceList> {
    const result = await this.request<{ data: PriceList }>(`/Price%20List/${encodeURIComponent(name)}`);
    return result.data;
  }

  async getPriceLists(): Promise<PriceList[]> {
    const fields = JSON.stringify(['name', 'price_list_name', 'currency', 'buying', 'selling', 'enabled']);
    const result = await this.request<{ data: PriceList[] }>(`/Price%20List?fields=${encodeURIComponent(fields)}`);
    return result.data;
  }

  /**
   * Create a new Price List
   * POST /api/resource/Price List
   */
  async createPriceList(priceList: {
    price_list_name: string;
    currency?: string;
    buying?: number;
    selling?: number;
    enabled?: number;
  }): Promise<PriceList> {
    const result = await this.request<{ data: PriceList }>('/Price%20List', {
      method: 'POST',
      body: JSON.stringify({
        price_list_name: priceList.price_list_name,
        currency: priceList.currency || 'USD',
        buying: priceList.buying ?? 0,
        selling: priceList.selling ?? 1,
        enabled: priceList.enabled ?? 1,
      }),
    });
    return result.data;
  }

  /**
   * Ensure a Price List exists
   * Creates if doesn't exist, returns existing if it does
   */
  async ensurePriceList(priceList: {
    price_list_name: string;
    currency?: string;
    buying?: number;
    selling?: number;
    enabled?: number;
  }): Promise<{ priceList: PriceList; created: boolean }> {
    try {
      const existing = await this.getPriceList(priceList.price_list_name);
      return { priceList: existing, created: false };
    } catch (error) {
      if (error instanceof ERPNextNotFoundError) {
        const created = await this.createPriceList(priceList);
        return { priceList: created, created: true };
      }
      throw error;
    }
  }

  // Customers
  async getCustomers(options: FetchOptions = {}): Promise<PaginatedResponse<ERPNextCustomer>> {
    const { page = 1, limit = 50, filters } = options;

    const params = new URLSearchParams({
      limit_start: ((page - 1) * limit).toString(),
      limit_page_length: limit.toString(),
      fields: JSON.stringify(['name', 'customer_name', 'customer_type', 'customer_group', 'territory', 'email_id', 'mobile_no']),
    });

    if (filters) {
      params.set('filters', JSON.stringify(filters));
    }

    const result = await this.request<{ data: ERPNextCustomer[] }>(`/Customer?${params}`);

    const countResult = await this.method<number>('frappe.client.get_count', {
      doctype: 'Customer',
      filters: filters || {},
    });

    return {
      data: result.data,
      pagination: {
        page,
        per_page: limit,
        total: countResult,
        total_pages: Math.ceil(countResult / limit),
      },
    };
  }

  async getCustomer(name: string): Promise<ERPNextCustomer> {
    const result = await this.request<{ data: ERPNextCustomer }>(`/Customer/${encodeURIComponent(name)}`);
    return result.data;
  }

  async createCustomer(customer: Partial<ERPNextCustomer>): Promise<ERPNextCustomer> {
    const result = await this.request<{ data: ERPNextCustomer }>('/Customer', {
      method: 'POST',
      body: JSON.stringify(customer),
    });
    return result.data;
  }

  /**
   * Find a customer by BigCommerce customer ID
   */
  async findCustomerByBCId(bcCustomerId: number): Promise<ERPNextCustomer | null> {
    try {
      const result = await this.request<{ data: ERPNextCustomer[] }>(
        `/Customer?filters=[["custom_bc_customer_id","=",${bcCustomerId}]]&fields=["name","customer_name","email_id","custom_bc_customer_id"]`
      );
      return result.data.length > 0 ? result.data[0] : null;
    } catch {
      return null;
    }
  }

  // Addresses
  /**
   * Create an Address document in ERPNext
   * Addresses are linked to customers via Dynamic Link
   */
  async createAddress(address: {
    address_title: string;
    address_type: 'Billing' | 'Shipping' | 'Office' | 'Personal' | 'Plant' | 'Postal' | 'Shop' | 'Subsidiary' | 'Warehouse' | 'Other';
    address_line1: string;
    address_line2?: string;
    city: string;
    state?: string;
    pincode?: string;
    country: string;
    phone?: string;
    email_id?: string;
    is_primary_address?: 0 | 1;
    is_shipping_address?: 0 | 1;
    custom_bc_address_id?: number;
    links?: Array<{
      link_doctype: string;
      link_name: string;
    }>;
  }): Promise<{ name: string }> {
    const result = await this.request<{ data: { name: string } }>('/Address', {
      method: 'POST',
      body: JSON.stringify(address),
    });
    return result.data;
  }

  /**
   * Get addresses linked to a customer
   */
  async getAddressesByCustomer(customerName: string): Promise<Array<{ name: string; address_title: string; address_type: string }>> {
    const result = await this.request<{ data: Array<{ name: string; address_title: string; address_type: string }> }>(
      `/Address?filters=[["Dynamic Link","link_name","=","${encodeURIComponent(customerName)}"],["Dynamic Link","link_doctype","=","Customer"]]&fields=["name","address_title","address_type"]`
    );
    return result.data;
  }

  /**
   * Find an address by BigCommerce address ID
   */
  async findAddressByBCId(bcAddressId: number): Promise<{ name: string } | null> {
    try {
      const result = await this.request<{ data: Array<{ name: string }> }>(
        `/Address?filters=[["custom_bc_address_id","=",${bcAddressId}]]&fields=["name"]`
      );
      return result.data.length > 0 ? result.data[0] : null;
    } catch {
      return null;
    }
  }

  // Item Groups (categories)
  // Note: Custom fields removed - API user doesn't have permission to query them
  // Transform function will use defaults for missing custom fields
  async getItemGroups(): Promise<Array<{
    name: string;
    item_group_name?: string;
    parent_item_group: string;
    is_group?: number;
  }>> {
    // Only request standard fields - custom fields may not be permitted via API
    // Transform function will use defaults for missing custom fields
    const fields = [
      'name',
      'item_group_name',
      'parent_item_group',
      'is_group',
    ];
    const result = await this.request<{ data: Array<{
      name: string;
      item_group_name?: string;
      parent_item_group: string;
      is_group?: number;
    }> }>(
      `/Item%20Group?fields=${JSON.stringify(fields)}&limit_page_length=0`
    );
    return result.data;
  }

  async createItemGroup(group: { item_group_name: string; parent_item_group?: string }): Promise<{ name: string }> {
    const result = await this.request<{ data: { name: string } }>('/Item%20Group', {
      method: 'POST',
      body: JSON.stringify(group),
    });
    return result.data;
  }

  // Get doctype meta (field definitions)
  async getDoctypeMeta(doctype: string): Promise<Array<{ fieldname: string; fieldtype: string; label: string; reqd?: number }>> {
    const result = await this.method<{ docs: Array<{ fields: Array<{ fieldname: string; fieldtype: string; label: string; reqd?: number }> }> }>(
      'frappe.client.get',
      { doctype: 'DocType', name: doctype }
    );
    return result.docs?.[0]?.fields || [];
  }

  // Utility methods
  async checkConnection(): Promise<boolean> {
    try {
      await this.method<unknown>('frappe.auth.get_logged_user');
      return true;
    } catch {
      return false;
    }
  }

  async getDocCount(doctype: string, filters?: Record<string, unknown>): Promise<number> {
    return this.method<number>('frappe.client.get_count', {
      doctype,
      filters: filters || {},
    });
  }

  /**
   * Call a Frappe API method
   */
  async callMethod<T>(methodName: string, args?: Record<string, unknown>): Promise<T> {
    return this.method<T>(methodName, args);
  }

  // ============================================================================
  // Item Attribute Methods
  // ============================================================================

  /**
   * Get an Item Attribute by name
   * GET /api/resource/Item Attribute/{name}
   */
  async getItemAttribute(name: string): Promise<ItemAttribute | null> {
    try {
      const result = await this.request<{ data: ItemAttribute }>(
        `/Item%20Attribute/${encodeURIComponent(name)}`
      );
      return result.data;
    } catch (error) {
      if (error instanceof ERPNextNotFoundError) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Create a new Item Attribute with values
   * POST /api/resource/Item Attribute
   */
  async createItemAttribute(payload: CreateItemAttributePayload): Promise<ItemAttribute> {
    const result = await this.request<{ data: ItemAttribute }>(
      '/Item%20Attribute',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
    return result.data;
  }

  /**
   * Update an existing Item Attribute
   * PUT /api/resource/Item Attribute/{name}
   */
  async updateItemAttribute(
    name: string,
    updates: Partial<CreateItemAttributePayload>
  ): Promise<ItemAttribute> {
    const result = await this.request<{ data: ItemAttribute }>(
      `/Item%20Attribute/${encodeURIComponent(name)}`,
      {
        method: 'PUT',
        body: JSON.stringify(updates),
      }
    );
    return result.data;
  }

  /**
   * Add values to an existing Item Attribute
   * Fetches current values and merges with new ones to avoid duplicates
   */
  async addItemAttributeValue(
    attributeName: string,
    value: string,
    abbr?: string
  ): Promise<ItemAttribute> {
    // Get existing attribute
    const existing = await this.getItemAttribute(attributeName);
    if (!existing) {
      throw new ERPNextNotFoundError('Item Attribute', attributeName);
    }

    // Check if value already exists
    const existingValues = existing.item_attribute_values || [];
    const valueExists = existingValues.some(v => v.attribute_value === value);

    if (valueExists) {
      return existing; // Value already exists, return as-is
    }

    // Generate abbreviation if not provided
    const abbreviation = abbr || this.generateAbbreviation(value);

    // Merge existing and new values
    const allValues = [
      ...existingValues.map(v => ({
        attribute_value: v.attribute_value,
        abbr: v.abbr,
      })),
      {
        attribute_value: value,
        abbr: abbreviation,
      },
    ];

    // Update the attribute
    return this.updateItemAttribute(attributeName, {
      item_attribute_values: allValues,
    });
  }

  /**
   * Add multiple values to an existing Item Attribute
   */
  async addItemAttributeValues(
    attributeName: string,
    values: Array<{ attribute_value: string; abbr?: string }>
  ): Promise<ItemAttribute> {
    // Get existing attribute
    const existing = await this.getItemAttribute(attributeName);
    if (!existing) {
      throw new ERPNextNotFoundError('Item Attribute', attributeName);
    }

    // Get existing value names to avoid duplicates
    const existingValueSet = new Set(
      (existing.item_attribute_values || []).map(v => v.attribute_value)
    );

    // Filter to only new values
    const newValues = values.filter(v => !existingValueSet.has(v.attribute_value));

    if (newValues.length === 0) {
      return existing; // No new values to add
    }

    // Merge existing and new values
    const allValues = [
      ...(existing.item_attribute_values || []).map(v => ({
        attribute_value: v.attribute_value,
        abbr: v.abbr,
      })),
      ...newValues.map(v => ({
        attribute_value: v.attribute_value,
        abbr: v.abbr || this.generateAbbreviation(v.attribute_value),
      })),
    ];

    // Update the attribute
    return this.updateItemAttribute(attributeName, {
      item_attribute_values: allValues,
    });
  }

  /**
   * Ensure an Item Attribute exists with all required values
   * Creates if doesn't exist, adds missing values if it does
   */
  async ensureItemAttribute(
    attributeName: string,
    values: string[]
  ): Promise<{ attribute: ItemAttribute; created: boolean; valuesAdded: string[] }> {
    const existing = await this.getItemAttribute(attributeName);

    if (!existing) {
      // Create new attribute
      const attribute = await this.createItemAttribute({
        attribute_name: attributeName,
        item_attribute_values: values.map(v => ({
          attribute_value: v,
          abbr: this.generateAbbreviation(v),
        })),
      });
      return {
        attribute,
        created: true,
        valuesAdded: values,
      };
    }

    // Check which values are missing
    const existingValueSet = new Set(
      (existing.item_attribute_values || []).map(v => v.attribute_value)
    );
    const missingValues = values.filter(v => !existingValueSet.has(v));

    if (missingValues.length === 0) {
      return {
        attribute: existing,
        created: false,
        valuesAdded: [],
      };
    }

    // Add missing values
    const attribute = await this.addItemAttributeValues(
      attributeName,
      missingValues.map(v => ({ attribute_value: v }))
    );

    return {
      attribute,
      created: false,
      valuesAdded: missingValues,
    };
  }

  /**
   * Get all Item Attributes
   * GET /api/resource/Item Attribute
   */
  async getItemAttributes(): Promise<ItemAttribute[]> {
    const result = await this.request<{ data: ItemAttribute[] }>(
      '/Item%20Attribute?fields=["name","attribute_name"]'
    );
    return result.data;
  }

  /**
   * Generate abbreviation for an attribute value
   * Used for ERPNext Item Attribute Value abbr field
   */
  private generateAbbreviation(value: string, maxLength = 5): string {
    // Remove special characters and get uppercase
    const words = value.replace(/[^a-zA-Z0-9\s]/g, '').trim().split(/\s+/);

    if (words.length === 1) {
      // Single word: take first N characters
      return words[0].substring(0, maxLength).toUpperCase();
    }

    // Multiple words: take first letter of each word
    const abbr = words.map(w => w[0] || '').join('').toUpperCase();
    return abbr.substring(0, maxLength);
  }

  // ============================================================================
  // Brand Methods
  // ============================================================================

  /**
   * Get a Brand by name
   * GET /api/resource/Brand/{name}
   */
  async getBrand(name: string): Promise<ERPNextBrandExtended | null> {
    // Guard against undefined/null/empty - brand is optional for items
    if (!name) {
      return null;
    }
    try {
      const result = await this.request<{ data: ERPNextBrandExtended }>(
        `/Brand/${encodeURIComponent(name)}`
      );
      return result.data;
    } catch (error) {
      if (error instanceof ERPNextNotFoundError) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Get all Brands
   * GET /api/resource/Brand
   */
  async getBrands(): Promise<ERPNextBrandExtended[]> {
    const fields = [
      'name',
      'brand',
      'description',
      'image',
      'custom_bc_brand_id',
      'custom_bc_custom_url',
      'custom_cf_image_id',
      'custom_cf_image_grayscale',
      'custom_meta_keywords',
      'custom_show_in_website',
    ];
    const result = await this.request<{ data: ERPNextBrandExtended[] }>(
      `/Brand?fields=${JSON.stringify(fields)}&limit_page_length=0`
    );
    return result.data;
  }

  /**
   * Create a new Brand
   * POST /api/resource/Brand
   */
  async createBrand(payload: CreateBrandPayload): Promise<ERPNextBrandExtended> {
    const result = await this.request<{ data: ERPNextBrandExtended }>(
      '/Brand',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
    return result.data;
  }

  /**
   * Update an existing Brand
   * PUT /api/resource/Brand/{name}
   */
  async updateBrand(
    name: string,
    updates: Partial<CreateBrandPayload>
  ): Promise<ERPNextBrandExtended> {
    const result = await this.request<{ data: ERPNextBrandExtended }>(
      `/Brand/${encodeURIComponent(name)}`,
      {
        method: 'PUT',
        body: JSON.stringify(updates),
      }
    );
    return result.data;
  }

  /**
   * Delete a Brand
   * DELETE /api/resource/Brand/{name}
   */
  async deleteBrand(name: string): Promise<void> {
    await this.request(
      `/Brand/${encodeURIComponent(name)}`,
      { method: 'DELETE' }
    );
  }

  /**
   * Ensure a Brand exists with the specified data
   * Creates if doesn't exist, updates if it does
   *
   * @returns The brand and whether it was created or updated
   */
  async ensureBrand(
    payload: CreateBrandPayload
  ): Promise<{ brand: ERPNextBrandExtended; created: boolean; updated: boolean }> {
    const existing = await this.getBrand(payload.brand);

    if (!existing) {
      // Create new brand
      const brand = await this.createBrand(payload);
      return {
        brand,
        created: true,
        updated: false,
      };
    }

    // Check if update is needed (compare relevant fields)
    const needsUpdate =
      (payload.description !== undefined && payload.description !== existing.description) ||
      (payload.image !== undefined && payload.image !== existing.image) ||
      (payload.custom_bc_brand_id !== undefined && payload.custom_bc_brand_id !== existing.custom_bc_brand_id) ||
      (payload.custom_bc_custom_url !== undefined && payload.custom_bc_custom_url !== existing.custom_bc_custom_url) ||
      (payload.custom_cf_image_id !== undefined && payload.custom_cf_image_id !== existing.custom_cf_image_id) ||
      (payload.custom_cf_image_grayscale !== undefined && payload.custom_cf_image_grayscale !== existing.custom_cf_image_grayscale) ||
      (payload.custom_meta_keywords !== undefined && payload.custom_meta_keywords !== existing.custom_meta_keywords);

    if (needsUpdate) {
      const brand = await this.updateBrand(payload.brand, payload);
      return {
        brand,
        created: false,
        updated: true,
      };
    }

    return {
      brand: existing,
      created: false,
      updated: false,
    };
  }

  /**
   * Get a Brand by its BigCommerce ID (custom field lookup)
   */
  async getBrandByBCId(bcBrandId: number): Promise<ERPNextBrandExtended | null> {
    const filters = JSON.stringify([['custom_bc_brand_id', '=', bcBrandId]]);
    const result = await this.request<{ data: ERPNextBrandExtended[] }>(
      `/Brand?filters=${encodeURIComponent(filters)}&limit_page_length=1`
    );

    if (result.data && result.data.length > 0) {
      return result.data[0];
    }
    return null;
  }

  // ============================================================================
  // Sales Order Methods
  // ============================================================================

  /**
   * Create a Sales Order
   * POST /api/resource/Sales Order
   */
  async createSalesOrder(order: CreateSalesOrderPayload): Promise<ERPNextSalesOrder> {
    const result = await this.request<{ data: ERPNextSalesOrder }>(
      '/Sales%20Order',
      {
        method: 'POST',
        body: JSON.stringify(order),
      }
    );
    return result.data;
  }

  /**
   * Submit a Sales Order (change docstatus from 0 to 1)
   * PUT /api/resource/Sales Order/{name}
   *
   * ERPNext requires using frappe.client.submit for document submission
   */
  async submitSalesOrder(name: string): Promise<ERPNextSalesOrder> {
    const result = await this.method<ERPNextSalesOrder>('frappe.client.submit', {
      doc: {
        doctype: 'Sales Order',
        name: name,
      },
    });
    return result;
  }

  /**
   * Get a Sales Order by name
   * GET /api/resource/Sales Order/{name}
   */
  async getSalesOrder(name: string): Promise<ERPNextSalesOrder | null> {
    try {
      const result = await this.request<{ data: ERPNextSalesOrder }>(
        `/Sales%20Order/${encodeURIComponent(name)}`
      );
      return result.data;
    } catch (error) {
      if (error instanceof ERPNextNotFoundError) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Find a Sales Order by BigCommerce Order ID
   */
  async findSalesOrderByBCId(bcOrderId: number): Promise<ERPNextSalesOrder | null> {
    try {
      const result = await this.request<{ data: ERPNextSalesOrder[] }>(
        `/Sales%20Order?filters=[["custom_bc_order_id","=",${bcOrderId}]]&fields=["name","customer","transaction_date","grand_total","docstatus","custom_bc_order_id"]`
      );
      return result.data.length > 0 ? result.data[0] : null;
    } catch {
      return null;
    }
  }

  /**
   * Find an Item by its item_code (SKU)
   * Only returns enabled items (disabled=0) that are not templates (has_variants=0)
   */
  async findItemBySKU(sku: string): Promise<ERPNextItem | null> {
    try {
      const result = await this.request<{ data: ERPNextItem[] }>(
        `/Item?filters=[["item_code","=","${encodeURIComponent(sku)}"],["disabled","=",0],["has_variants","=",0]]&fields=["name","item_code","item_name","stock_uom","standard_rate","disabled"]`
      );
      return result.data.length > 0 ? result.data[0] : null;
    } catch {
      return null;
    }
  }

  /**
   * Find an Item by its item_code (SKU), including disabled items
   */
  async findItemBySKUIncludeDisabled(sku: string): Promise<(ERPNextItem & { disabled?: number }) | null> {
    try {
      const result = await this.request<{ data: (ERPNextItem & { disabled?: number })[] }>(
        `/Item?filters=[["item_code","=","${encodeURIComponent(sku)}"]]&fields=["name","item_code","item_name","stock_uom","standard_rate","disabled"]`
      );
      return result.data.length > 0 ? result.data[0] : null;
    } catch {
      return null;
    }
  }

  /**
   * Create and submit a Sales Order in one operation
   * Uses frappe.client.insert with docstatus=1 to create as submitted
   */
  async createAndSubmitSalesOrder(order: CreateSalesOrderPayload): Promise<ERPNextSalesOrder> {
    // Create and submit in one call to avoid race conditions
    const result = await this.method<ERPNextSalesOrder>('frappe.client.insert', {
      doc: {
        doctype: 'Sales Order',
        docstatus: 1, // Create as submitted
        ...order,
      },
    });
    return result;
  }
}
