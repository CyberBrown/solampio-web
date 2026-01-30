/**
 * ERPNext Lookup Tables Pre-fetching
 *
 * Fetches and caches Link field reference data for validation and navigation.
 * ERPNext uses Link fields that reference other doctypes - this ensures data integrity.
 */

// ============================================================================
// Lookup Types
// ============================================================================

export interface ItemGroup {
  name: string;
  parent_item_group: string | null;
  is_group: boolean;
  // Computed during tree building
  children?: ItemGroup[];
  level?: number;
  path?: string[];
}

export interface Brand {
  name: string;
  description: string | null;
  image?: string | null;
  // BC migration custom fields
  bc_brand_id?: number | null;
  bc_custom_url?: string | null;
  cf_image_id?: string | null;
  cf_image_grayscale?: string | null;
}

export interface PriceList {
  name: string;
  currency: string;
  selling: boolean;
  buying: boolean;
  enabled: boolean;
}

export interface UOM {
  name: string;
  enabled: boolean;
}

export interface Warehouse {
  name: string;
  warehouse_name: string;
  company: string | null;
  is_group: boolean;
  parent_warehouse: string | null;
  // Computed during tree building
  children?: Warehouse[];
  level?: number;
  path?: string[];
}

export interface Country {
  name: string;
  code: string;
  country_name: string;
}

export interface Currency {
  name: string;
  enabled: boolean;
  fraction: string;
  fraction_units: number;
  symbol: string;
}

export interface Company {
  name: string;
  company_name: string;
  abbr: string;
  default_currency: string;
  country: string;
}

export interface Supplier {
  name: string;
  supplier_name: string;
  supplier_group: string | null;
  country: string | null;
}

export interface ItemTaxTemplate {
  name: string;
  title: string;
  company: string;
  disabled: boolean;
}

// ============================================================================
// Validation Result Types
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  field: string;
  value: string;
  doctype: string;
  message?: string;
}

export interface ValidationSummary {
  valid: boolean;
  errors: ValidationResult[];
  warnings: ValidationResult[];
}

// ============================================================================
// ERPNext API Response Types
// ============================================================================

interface ERPNextListResponse<T> {
  data: T[];
}

// ============================================================================
// LookupCache Class
// ============================================================================

export class LookupCache {
  private baseUrl: string;
  private headers: HeadersInit;

  // Lookup maps
  private itemGroups: Map<string, ItemGroup> = new Map();
  private itemGroupTree: ItemGroup[] = [];
  private brands: Map<string, Brand> = new Map();
  private priceLists: Map<string, PriceList> = new Map();
  private uoms: Map<string, UOM> = new Map();
  private warehouses: Map<string, Warehouse> = new Map();
  private warehouseTree: Warehouse[] = [];
  private countries: Map<string, Country> = new Map();
  private currencies: Map<string, Currency> = new Map();
  private companies: Map<string, Company> = new Map();
  private suppliers: Map<string, Supplier> = new Map();
  private itemTaxTemplates: Map<string, ItemTaxTemplate> = new Map();

  // Cache state
  private initialized = false;
  private lastRefresh: Date | null = null;

  // Logging callback
  private logger: (level: 'info' | 'warn' | 'error', message: string) => void;

  constructor(
    url: string,
    apiKey: string,
    apiSecret: string,
    logger?: (level: 'info' | 'warn' | 'error', message: string) => void
  ) {
    this.baseUrl = url.replace(/\/$/, '');
    this.headers = {
      Authorization: `token ${apiKey}:${apiSecret}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    this.logger = logger || ((level, msg) => console.log(`[${level.toUpperCase()}] ${msg}`));
  }

  // ============================================================================
  // Core API Methods
  // ============================================================================

  private async fetchDoctype<T>(
    doctype: string,
    fields: string[],
    filters?: Record<string, unknown>
  ): Promise<T[]> {
    const params = new URLSearchParams({
      fields: JSON.stringify(fields),
      limit_page_length: '0', // Fetch all records
    });

    if (filters) {
      params.set('filters', JSON.stringify(filters));
    }

    const url = `${this.baseUrl}/api/resource/${encodeURIComponent(doctype)}?${params}`;

    const response = await fetch(url, { headers: this.headers });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch ${doctype}: ${response.status} - ${error}`);
    }

    const result = (await response.json()) as ERPNextListResponse<T>;
    return result.data;
  }

  // ============================================================================
  // Initialization
  // ============================================================================

  /**
   * Initialize all lookup caches. Call this on startup.
   */
  async initialize(): Promise<void> {
    this.logger('info', 'Initializing ERPNext lookup caches...');

    const startTime = Date.now();

    try {
      // Fetch all lookups in parallel for performance
      const [
        itemGroups,
        brands,
        priceLists,
        uoms,
        warehouses,
        countries,
        currencies,
        companies,
        suppliers,
        itemTaxTemplates,
      ] = await Promise.all([
        this.fetchItemGroups(),
        this.fetchBrands(),
        this.fetchPriceLists(),
        this.fetchUOMs(),
        this.fetchWarehouses(),
        this.fetchCountries(),
        this.fetchCurrencies(),
        this.fetchCompanies(),
        this.fetchSuppliers(),
        this.fetchItemTaxTemplates(),
      ]);

      // Populate maps
      itemGroups.forEach((g) => this.itemGroups.set(g.name, g));
      brands.forEach((b) => this.brands.set(b.name, b));
      priceLists.forEach((p) => this.priceLists.set(p.name, p));
      uoms.forEach((u) => this.uoms.set(u.name, u));
      warehouses.forEach((w) => this.warehouses.set(w.name, w));
      countries.forEach((c) => this.countries.set(c.name, c));
      currencies.forEach((c) => this.currencies.set(c.name, c));
      companies.forEach((c) => this.companies.set(c.name, c));
      suppliers.forEach((s) => this.suppliers.set(s.name, s));
      itemTaxTemplates.forEach((t) => this.itemTaxTemplates.set(t.name, t));

      // Build tree structures
      this.itemGroupTree = this.buildTree(itemGroups, 'parent_item_group');
      this.warehouseTree = this.buildTree(warehouses, 'parent_warehouse');

      this.initialized = true;
      this.lastRefresh = new Date();

      const elapsed = Date.now() - startTime;
      this.logger(
        'info',
        `Lookup caches initialized in ${elapsed}ms: ` +
          `${this.itemGroups.size} item groups, ${this.brands.size} brands, ` +
          `${this.priceLists.size} price lists, ${this.uoms.size} UOMs, ` +
          `${this.warehouses.size} warehouses, ${this.countries.size} countries, ` +
          `${this.companies.size} companies, ${this.suppliers.size} suppliers`
      );
    } catch (error) {
      this.logger('error', `Failed to initialize lookup caches: ${error}`);
      throw error;
    }
  }

  /**
   * Refresh all caches. Call periodically or when data changes.
   */
  async refresh(): Promise<void> {
    this.initialized = false;
    this.itemGroups.clear();
    this.brands.clear();
    this.priceLists.clear();
    this.uoms.clear();
    this.warehouses.clear();
    this.countries.clear();
    this.currencies.clear();
    this.companies.clear();
    this.suppliers.clear();
    this.itemTaxTemplates.clear();

    await this.initialize();
  }

  // ============================================================================
  // Fetch Methods
  // ============================================================================

  private async fetchItemGroups(): Promise<ItemGroup[]> {
    const data = await this.fetchDoctype<{
      name: string;
      parent_item_group: string | null;
      is_group: number;
    }>('Item Group', ['name', 'parent_item_group', 'is_group']);

    return data.map((row) => ({
      name: row.name,
      parent_item_group: row.parent_item_group || null,
      is_group: Boolean(row.is_group),
    }));
  }

  private async fetchBrands(): Promise<Brand[]> {
    const data = await this.fetchDoctype<{
      name: string;
      description: string | null;
      image?: string | null;
      custom_bc_brand_id?: number | null;
      custom_bc_custom_url?: string | null;
      custom_cf_image_id?: string | null;
      custom_cf_image_grayscale?: string | null;
    }>('Brand', [
      'name',
      'description',
      'image',
      'custom_bc_brand_id',
      'custom_bc_custom_url',
      'custom_cf_image_id',
      'custom_cf_image_grayscale',
    ]);

    return data.map((row) => ({
      name: row.name,
      description: row.description || null,
      image: row.image || null,
      bc_brand_id: row.custom_bc_brand_id || null,
      bc_custom_url: row.custom_bc_custom_url || null,
      cf_image_id: row.custom_cf_image_id || null,
      cf_image_grayscale: row.custom_cf_image_grayscale || null,
    }));
  }

  private async fetchPriceLists(): Promise<PriceList[]> {
    const data = await this.fetchDoctype<{
      name: string;
      currency: string;
      selling: number;
      buying: number;
      enabled: number;
    }>('Price List', ['name', 'currency', 'selling', 'buying', 'enabled']);

    return data.map((row) => ({
      name: row.name,
      currency: row.currency,
      selling: Boolean(row.selling),
      buying: Boolean(row.buying),
      enabled: Boolean(row.enabled),
    }));
  }

  private async fetchUOMs(): Promise<UOM[]> {
    const data = await this.fetchDoctype<{
      name: string;
      enabled: number;
    }>('UOM', ['name', 'enabled']);

    return data.map((row) => ({
      name: row.name,
      enabled: Boolean(row.enabled),
    }));
  }

  private async fetchWarehouses(): Promise<Warehouse[]> {
    const data = await this.fetchDoctype<{
      name: string;
      warehouse_name: string;
      company: string | null;
      is_group: number;
      parent_warehouse: string | null;
    }>('Warehouse', ['name', 'warehouse_name', 'company', 'is_group', 'parent_warehouse']);

    return data.map((row) => ({
      name: row.name,
      warehouse_name: row.warehouse_name,
      company: row.company || null,
      is_group: Boolean(row.is_group),
      parent_warehouse: row.parent_warehouse || null,
    }));
  }

  private async fetchCountries(): Promise<Country[]> {
    const data = await this.fetchDoctype<{
      name: string;
      code: string;
      country_name: string;
    }>('Country', ['name', 'code', 'country_name']);

    return data;
  }

  private async fetchCurrencies(): Promise<Currency[]> {
    const data = await this.fetchDoctype<{
      name: string;
      enabled: number;
      fraction: string;
      fraction_units: number;
      symbol: string;
    }>('Currency', ['name', 'enabled', 'fraction', 'fraction_units', 'symbol']);

    return data.map((row) => ({
      ...row,
      enabled: Boolean(row.enabled),
    }));
  }

  private async fetchCompanies(): Promise<Company[]> {
    const data = await this.fetchDoctype<Company>('Company', [
      'name',
      'company_name',
      'abbr',
      'default_currency',
      'country',
    ]);
    return data;
  }

  private async fetchSuppliers(): Promise<Supplier[]> {
    const data = await this.fetchDoctype<{
      name: string;
      supplier_name: string;
      supplier_group: string | null;
      country: string | null;
    }>('Supplier', ['name', 'supplier_name', 'supplier_group', 'country']);

    return data;
  }

  private async fetchItemTaxTemplates(): Promise<ItemTaxTemplate[]> {
    const data = await this.fetchDoctype<{
      name: string;
      title: string;
      company: string;
      disabled: number;
    }>('Item Tax Template', ['name', 'title', 'company', 'disabled']);

    return data.map((row) => ({
      ...row,
      disabled: Boolean(row.disabled),
    }));
  }

  // ============================================================================
  // Tree Building
  // ============================================================================

  private buildTree<T extends { name: string; children?: T[]; level?: number; path?: string[] }>(
    items: T[],
    parentField: keyof T
  ): T[] {
    const itemMap = new Map<string, T>();
    const roots: T[] = [];

    // First pass: index all items
    items.forEach((item) => {
      item.children = [];
      item.level = 0;
      item.path = [item.name];
      itemMap.set(item.name, item);
    });

    // Second pass: build hierarchy
    items.forEach((item) => {
      const parentName = item[parentField] as string | null;
      if (parentName && itemMap.has(parentName)) {
        const parent = itemMap.get(parentName)!;
        parent.children!.push(item);
        item.level = (parent.level || 0) + 1;
        item.path = [...(parent.path || []), item.name];
      } else {
        roots.push(item);
      }
    });

    return roots;
  }

  // ============================================================================
  // Getter Methods
  // ============================================================================

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('LookupCache not initialized. Call initialize() first.');
    }
  }

  // Item Groups
  getItemGroup(name: string): ItemGroup | undefined {
    this.ensureInitialized();
    return this.itemGroups.get(name);
  }

  getAllItemGroups(): ItemGroup[] {
    this.ensureInitialized();
    return Array.from(this.itemGroups.values());
  }

  getItemGroupTree(): ItemGroup[] {
    this.ensureInitialized();
    return this.itemGroupTree;
  }

  getItemGroupPath(name: string): string[] {
    this.ensureInitialized();
    const group = this.itemGroups.get(name);
    return group?.path || [];
  }

  // Brands
  getBrand(name: string): Brand | undefined {
    this.ensureInitialized();
    return this.brands.get(name);
  }

  getAllBrands(): Brand[] {
    this.ensureInitialized();
    return Array.from(this.brands.values());
  }

  /**
   * Get a brand by its BigCommerce ID
   */
  getBrandByBCId(bcBrandId: number): Brand | undefined {
    this.ensureInitialized();
    return Array.from(this.brands.values()).find(b => b.bc_brand_id === bcBrandId);
  }

  /**
   * Build a map from BC brand ID to ERPNext brand name
   * Useful for product sync when mapping brand_id to brand name
   */
  getBCBrandIdMap(): Map<number, string> {
    this.ensureInitialized();
    const map = new Map<number, string>();
    for (const brand of this.brands.values()) {
      if (brand.bc_brand_id) {
        map.set(brand.bc_brand_id, brand.name);
      }
    }
    return map;
  }

  // Price Lists
  getPriceList(name: string): PriceList | undefined {
    this.ensureInitialized();
    return this.priceLists.get(name);
  }

  getAllPriceLists(): PriceList[] {
    this.ensureInitialized();
    return Array.from(this.priceLists.values());
  }

  getSellingPriceLists(): PriceList[] {
    this.ensureInitialized();
    return Array.from(this.priceLists.values()).filter((p) => p.selling && p.enabled);
  }

  getBuyingPriceLists(): PriceList[] {
    this.ensureInitialized();
    return Array.from(this.priceLists.values()).filter((p) => p.buying && p.enabled);
  }

  // UOMs
  getUOM(name: string): UOM | undefined {
    this.ensureInitialized();
    return this.uoms.get(name);
  }

  getAllUOMs(): UOM[] {
    this.ensureInitialized();
    return Array.from(this.uoms.values());
  }

  getEnabledUOMs(): UOM[] {
    this.ensureInitialized();
    return Array.from(this.uoms.values()).filter((u) => u.enabled);
  }

  // Warehouses
  getWarehouse(name: string): Warehouse | undefined {
    this.ensureInitialized();
    return this.warehouses.get(name);
  }

  getAllWarehouses(): Warehouse[] {
    this.ensureInitialized();
    return Array.from(this.warehouses.values());
  }

  getWarehouseTree(): Warehouse[] {
    this.ensureInitialized();
    return this.warehouseTree;
  }

  getWarehousesByCompany(company: string): Warehouse[] {
    this.ensureInitialized();
    return Array.from(this.warehouses.values()).filter((w) => w.company === company);
  }

  // Countries
  getCountry(name: string): Country | undefined {
    this.ensureInitialized();
    return this.countries.get(name);
  }

  getAllCountries(): Country[] {
    this.ensureInitialized();
    return Array.from(this.countries.values());
  }

  // Currencies
  getCurrency(name: string): Currency | undefined {
    this.ensureInitialized();
    return this.currencies.get(name);
  }

  getAllCurrencies(): Currency[] {
    this.ensureInitialized();
    return Array.from(this.currencies.values());
  }

  getEnabledCurrencies(): Currency[] {
    this.ensureInitialized();
    return Array.from(this.currencies.values()).filter((c) => c.enabled);
  }

  // Companies
  getCompany(name: string): Company | undefined {
    this.ensureInitialized();
    return this.companies.get(name);
  }

  getAllCompanies(): Company[] {
    this.ensureInitialized();
    return Array.from(this.companies.values());
  }

  // Suppliers
  getSupplier(name: string): Supplier | undefined {
    this.ensureInitialized();
    return this.suppliers.get(name);
  }

  getAllSuppliers(): Supplier[] {
    this.ensureInitialized();
    return Array.from(this.suppliers.values());
  }

  // Item Tax Templates
  getItemTaxTemplate(name: string): ItemTaxTemplate | undefined {
    this.ensureInitialized();
    return this.itemTaxTemplates.get(name);
  }

  getAllItemTaxTemplates(): ItemTaxTemplate[] {
    this.ensureInitialized();
    return Array.from(this.itemTaxTemplates.values());
  }

  getItemTaxTemplatesByCompany(company: string): ItemTaxTemplate[] {
    this.ensureInitialized();
    return Array.from(this.itemTaxTemplates.values()).filter(
      (t) => t.company === company && !t.disabled
    );
  }

  // ============================================================================
  // Validation Methods
  // ============================================================================

  /**
   * Check if a Link field value exists in the referenced doctype
   */
  validateLink(doctype: string, value: string | undefined | null): ValidationResult {
    if (!value) {
      return { valid: true, field: '', value: '', doctype, message: 'Empty value (allowed)' };
    }

    this.ensureInitialized();

    const validators: Record<string, () => boolean> = {
      'Item Group': () => this.itemGroups.has(value),
      Brand: () => this.brands.has(value),
      'Price List': () => this.priceLists.has(value),
      UOM: () => this.uoms.has(value),
      Warehouse: () => this.warehouses.has(value),
      Country: () => this.countries.has(value),
      Currency: () => this.currencies.has(value),
      Company: () => this.companies.has(value),
      Supplier: () => this.suppliers.has(value),
      'Item Tax Template': () => this.itemTaxTemplates.has(value),
    };

    const validator = validators[doctype];
    if (!validator) {
      return {
        valid: true,
        field: '',
        value,
        doctype,
        message: `Unknown doctype ${doctype}, skipping validation`,
      };
    }

    const valid = validator();
    if (!valid) {
      this.logger('warn', `Invalid Link reference: ${doctype} "${value}" not found`);
    }

    return {
      valid,
      field: '',
      value,
      doctype,
      message: valid ? undefined : `${doctype} "${value}" does not exist`,
    };
  }

  /**
   * Validate multiple Link fields on an Item
   */
  validateItemLinks(item: {
    item_group?: string;
    brand?: string;
    stock_uom?: string;
    weight_uom?: string;
    country_of_origin?: string;
    default_warehouse?: string;
  }): ValidationSummary {
    const errors: ValidationResult[] = [];
    const warnings: ValidationResult[] = [];

    // Required fields - add to errors
    if (item.item_group) {
      const result = this.validateLink('Item Group', item.item_group);
      result.field = 'item_group';
      if (!result.valid) errors.push(result);
    }

    if (item.stock_uom) {
      const result = this.validateLink('UOM', item.stock_uom);
      result.field = 'stock_uom';
      if (!result.valid) errors.push(result);
    }

    // Optional fields - add to warnings
    if (item.brand) {
      const result = this.validateLink('Brand', item.brand);
      result.field = 'brand';
      if (!result.valid) warnings.push(result);
    }

    if (item.weight_uom) {
      const result = this.validateLink('UOM', item.weight_uom);
      result.field = 'weight_uom';
      if (!result.valid) warnings.push(result);
    }

    if (item.country_of_origin) {
      const result = this.validateLink('Country', item.country_of_origin);
      result.field = 'country_of_origin';
      if (!result.valid) warnings.push(result);
    }

    if (item.default_warehouse) {
      const result = this.validateLink('Warehouse', item.default_warehouse);
      result.field = 'default_warehouse';
      if (!result.valid) warnings.push(result);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Suggest similar values when a Link reference is invalid
   */
  suggestSimilar(doctype: string, value: string, maxSuggestions = 5): string[] {
    this.ensureInitialized();

    const collections: Record<string, Map<string, unknown>> = {
      'Item Group': this.itemGroups,
      Brand: this.brands,
      'Price List': this.priceLists,
      UOM: this.uoms,
      Warehouse: this.warehouses,
      Country: this.countries,
      Currency: this.currencies,
      Company: this.companies,
      Supplier: this.suppliers,
      'Item Tax Template': this.itemTaxTemplates,
    };

    const collection = collections[doctype];
    if (!collection) return [];

    const valueLower = value.toLowerCase();
    const names = Array.from(collection.keys());

    // Score based on substring match and edit distance approximation
    const scored = names
      .map((name) => {
        const nameLower = name.toLowerCase();
        let score = 0;

        // Exact prefix match
        if (nameLower.startsWith(valueLower)) score += 100;
        // Contains the value
        else if (nameLower.includes(valueLower)) score += 50;
        // Value contains the name
        else if (valueLower.includes(nameLower)) score += 30;
        // First letters match
        else if (nameLower[0] === valueLower[0]) score += 10;

        return { name, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxSuggestions)
      .map((item) => item.name);

    return scored;
  }

  // ============================================================================
  // Cache Status
  // ============================================================================

  isInitialized(): boolean {
    return this.initialized;
  }

  getLastRefresh(): Date | null {
    return this.lastRefresh;
  }

  getCacheStats(): Record<string, number> {
    return {
      itemGroups: this.itemGroups.size,
      brands: this.brands.size,
      priceLists: this.priceLists.size,
      uoms: this.uoms.size,
      warehouses: this.warehouses.size,
      countries: this.countries.size,
      currencies: this.currencies.size,
      companies: this.companies.size,
      suppliers: this.suppliers.size,
      itemTaxTemplates: this.itemTaxTemplates.size,
    };
  }
}
