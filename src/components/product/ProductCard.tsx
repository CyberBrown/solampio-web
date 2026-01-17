/**
 * Reusable Product Card Component with Add to Cart functionality
 */
import { component$, useSignal, $ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';
import { useCart } from '../../hooks/useCart';
import { encodeSkuForUrl, getStockStatus, type Product } from '../../lib/db';
import { getProductThumbnail } from '../../lib/images';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = component$<ProductCardProps>(({ product }) => {
  const cart = useCart();
  const addedToCart = useSignal(false);

  const handleAddToQuote = $(() => {
    cart.addToCart({
      id: product.id,
      sku: product.sku,
      title: product.title,
      price: product.price,
      thumbnail_url: product.thumbnail_url,
      stock_qty: product.stock_qty,
    });

    addedToCart.value = true;
    setTimeout(() => {
      addedToCart.value = false;
    }, 2000);
  });

  const imageUrl = getProductThumbnail(product);
  const stockInfo = getStockStatus(product);
  const displayPrice = product.sale_price
    ? `$${product.sale_price.toFixed(2)}`
    : product.price
      ? `$${product.price.toFixed(2)}`
      : 'Call for Pricing';

  return (
    <div class="bg-white rounded-lg border border-gray-200 overflow-hidden group hover:shadow-lg transition-shadow">
      <Link href={`/products/${encodeSkuForUrl(product.sku || product.id)}/`} class="block">
        <div class="aspect-[4/3] bg-gray-100 flex items-center justify-center relative p-4">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.title}
              class="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
              width="280"
              height="210"
            />
          ) : (
            <div class="text-center text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="0.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span class="text-xs">Product Photo</span>
            </div>
          )}
          {stockInfo.showBadge && (
            <span class={[
              'absolute top-3 left-3 text-xs font-bold px-2 py-1 rounded',
              stockInfo.badgeClass
            ].join(' ')}>
              {stockInfo.label}
            </span>
          )}
        </div>
      </Link>
      <div class="p-4">
        <p class="text-xs font-mono text-[#c3a859] uppercase tracking-wide mb-1">{product.item_group || 'Products'}</p>
        <Link href={`/products/${encodeSkuForUrl(product.sku || product.id)}/`} class="font-heading font-bold text-[#042e0d] group-hover:text-[#5974c3] transition-colors block">
          {product.title}
        </Link>
        {product.sku && (
          <p class="text-sm text-gray-500 font-mono mt-1">SKU: {product.sku}</p>
        )}
        <div class="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
          <span class="font-heading font-bold text-[#042e0d]">
            {displayPrice}
          </span>
          <button
            onClick$={handleAddToQuote}
            class={[
              'px-3 py-1.5 rounded text-sm font-bold transition-colors',
              addedToCart.value
                ? 'bg-[#56c270] text-white'
                : 'bg-[#042e0d] text-white hover:bg-[#042e0d]/80'
            ].join(' ')}
          >
            {addedToCart.value ? 'Added!' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
});
