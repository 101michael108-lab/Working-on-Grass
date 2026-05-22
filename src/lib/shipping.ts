import type { Product } from '@/lib/types';

/** Effective shipping for one product (override or store default). */
export function getProductShippingFee(
  product: Pick<Product, 'shippingFee'>,
  globalShippingFee: number
): number {
  if (
    product.shippingFee != null &&
    !Number.isNaN(product.shippingFee) &&
    product.shippingFee >= 0
  ) {
    return product.shippingFee;
  }
  return globalShippingFee;
}

/** Order shipping = highest applicable rate among cart lines (per-product override or global). */
export function calculateOrderShipping(
  cartItems: { product: Pick<Product, 'shippingFee'> }[],
  globalShippingFee: number
): number {
  if (cartItems.length === 0) return globalShippingFee;

  return cartItems.reduce(
    (max, item) => Math.max(max, getProductShippingFee(item.product, globalShippingFee)),
    0
  );
}

export function cartUsesProductShippingOverride(
  cartItems: { product: Pick<Product, 'shippingFee'> }[],
  globalShippingFee: number
): boolean {
  return cartItems.some(
    (item) => getProductShippingFee(item.product, globalShippingFee) !== globalShippingFee
  );
}
