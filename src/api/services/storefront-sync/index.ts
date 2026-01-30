/**
 * Storefront Sync Module
 * Exports all sync-related functionality
 */

export { StorefrontSyncManager } from './manager';
export type { SyncResult, FullSyncOptions } from './manager';

export {
  transformItem,
  transformItemGroup,
  transformBrand,
  hasProductChanged,
  hasCategoryChanged,
  hasBrandChanged,
  slugify,
  generateId,
} from './transforms';

export type {
  ERPNextItem,
  ERPNextItemGroup,
  ERPNextBrand,
  ERPNextItemPrice,
} from './transforms';

export type {
  D1Product,
  D1Category,
  D1Brand,
  D1SyncLog,
  D1SyncState,
  CreateD1Product,
  CreateD1Category,
  CreateD1Brand,
} from './types';
