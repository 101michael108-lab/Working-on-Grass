import type { Product } from '@/lib/types';

type ShippingProduct = Pick<Product, 'shippingFee' | 'isDigital'>;

/** Effective shipping for one product (digital → free, else override or store default). */
export function getProductShippingFee(
  product: ShippingProduct,
  globalShippingFee: number
): number {
  if (product.isDigital) return 0;
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
  cartItems: { product: ShippingProduct }[],
  globalShippingFee: number
): number {
  if (cartItems.length === 0) return globalShippingFee;

  return cartItems.reduce(
    (max, item) => Math.max(max, getProductShippingFee(item.product, globalShippingFee)),
    0
  );
}

export function cartUsesProductShippingOverride(
  cartItems: { product: ShippingProduct }[],
  globalShippingFee: number
): boolean {
  // Digital items are free by category, not a custom rate the admin set —
  // don't let them flip the "product rate" label on.
  return cartItems.some(
    (item) =>
      !item.product.isDigital &&
      getProductShippingFee(item.product, globalShippingFee) !== globalShippingFee
  );
}
