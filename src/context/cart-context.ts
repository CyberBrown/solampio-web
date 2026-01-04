/**
 * Cart Context for Quote Cart System
 *
 * Manages cart state using Qwik's context API with localStorage persistence.
 * This is a "quote cart" - users add products and request quotes rather than checkout.
 */

import { createContextId, type Signal } from '@builder.io/qwik';

/**
 * Cart item structure matching product data from D1
 */
export interface CartItem {
  id: string;                    // Product D1 ID
  sku: string;                   // Product SKU
  title: string;                 // Product name
  price: number | null;          // Price (null = "Call for Pricing")
  quantity: number;              // Quantity in cart
  thumbnail_url: string | null;  // Product thumbnail
  stock_qty: number;             // Stock quantity for status display
}

/**
 * Cart state structure
 */
export interface CartState {
  items: Signal<CartItem[]>;
}

/**
 * Cart context ID for use with useContext/useContextProvider
 */
export const CartContext = createContextId<CartState>('cart-context');

/**
 * localStorage key for cart persistence
 */
export const CART_STORAGE_KEY = 'solamp-cart';
