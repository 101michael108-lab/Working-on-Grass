import { describe, it, expect } from 'vitest';
import {
  calculateOrderShipping,
  cartUsesProductShippingOverride,
  getProductShippingFee,
} from './shipping';

describe('shipping', () => {
  it('uses global fee when product has no override', () => {
    expect(getProductShippingFee({ shippingFee: undefined }, 150)).toBe(150);
  });

  it('uses product override when set', () => {
    expect(getProductShippingFee({ shippingFee: 80 }, 150)).toBe(80);
  });

  it('allows free shipping override', () => {
    expect(getProductShippingFee({ shippingFee: 0 }, 150)).toBe(0);
  });

  it('uses highest rate in mixed cart', () => {
    const fee = calculateOrderShipping(
      [
        { product: { shippingFee: 50 } },
        { product: {} },
        { product: { shippingFee: 200 } },
      ],
      150
    );
    expect(fee).toBe(200);
  });

  it('detects when cart uses a product override', () => {
    expect(
      cartUsesProductShippingOverride([{ product: { shippingFee: 99 } }], 150)
    ).toBe(true);
    expect(cartUsesProductShippingOverride([{ product: {} }], 150)).toBe(false);
  });
});
