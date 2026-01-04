/**
 * Cart Hook for Quote Cart Operations
 *
 * Provides functions to manipulate cart state.
 * Must be used within a component that has CartContext available.
 */

import { useContext, $ } from '@builder.io/qwik';
import { CartContext, type CartItem, CART_STORAGE_KEY } from '../context/cart-context';

/**
 * Product data needed to add to cart
 */
export interface AddToCartProduct {
  id: string;
  sku: string | null;
  title: string;
  price: number | null;
  thumbnail_url: string | null;
  stock_qty: number;
}

/**
 * Hook providing cart operations
 */
export function useCart() {
  const cart = useContext(CartContext);

  /**
   * Save cart to localStorage
   */
  const saveToStorage = $((items: CartItem[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  });

  /**
   * Add a product to cart or update quantity if already exists
   */
  const addToCart = $((product: AddToCartProduct, quantity: number = 1) => {
    const existingIndex = cart.items.value.findIndex(item => item.id === product.id);

    if (existingIndex >= 0) {
      // Update existing item quantity
      const newItems = [...cart.items.value];
      newItems[existingIndex] = {
        ...newItems[existingIndex],
        quantity: newItems[existingIndex].quantity + quantity,
      };
      cart.items.value = newItems;
    } else {
      // Add new item
      const newItem: CartItem = {
        id: product.id,
        sku: product.sku || '',
        title: product.title,
        price: product.price,
        quantity,
        thumbnail_url: product.thumbnail_url,
        stock_qty: product.stock_qty,
      };
      cart.items.value = [...cart.items.value, newItem];
    }

    saveToStorage(cart.items.value);
  });

  /**
   * Remove an item from cart by ID
   */
  const removeFromCart = $((id: string) => {
    cart.items.value = cart.items.value.filter(item => item.id !== id);
    saveToStorage(cart.items.value);
  });

  /**
   * Update quantity for an item
   */
  const updateQuantity = $((id: string, quantity: number) => {
    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      cart.items.value = cart.items.value.filter(item => item.id !== id);
    } else {
      const newItems = cart.items.value.map(item =>
        item.id === id ? { ...item, quantity } : item
      );
      cart.items.value = newItems;
    }
    saveToStorage(cart.items.value);
  });

  /**
   * Clear all items from cart
   */
  const clearCart = $(() => {
    cart.items.value = [];
    saveToStorage([]);
  });

  /**
   * Get total number of items (sum of quantities)
   */
  const getItemCount = () => {
    return cart.items.value.reduce((sum, item) => sum + item.quantity, 0);
  };

  /**
   * Get subtotal for items with prices
   * Returns null if no items have prices
   */
  const getSubtotal = () => {
    const pricedItems = cart.items.value.filter(item => item.price !== null);
    if (pricedItems.length === 0) return null;

    return pricedItems.reduce((sum, item) => sum + (item.price! * item.quantity), 0);
  };

  /**
   * Check if cart has any items without prices (requires quote)
   */
  const hasUnpricedItems = () => {
    return cart.items.value.some(item => item.price === null);
  };

  return {
    items: cart.items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getItemCount,
    getSubtotal,
    hasUnpricedItems,
  };
}
