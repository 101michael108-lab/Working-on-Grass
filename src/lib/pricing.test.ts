import { describe, it, expect } from 'vitest';
import { getDiscountPercent, getSaleLabel, getSalePrice, getUnitPrice } from './pricing';

describe('getSalePrice', () => {
  it('returns the sale price when it is below the regular price', () => {
    expect(getSalePrice({ price: 450, salePrice: 399 })).toBe(399);
  });

  it('allows a free (R0) sale price', () => {
    expect(getSalePrice({ price: 450, salePrice: 0 })).toBe(0);
  });

  it('ignores a missing sale price', () => {
    expect(getSalePrice({ price: 450 })).toBeNull();
    expect(getSalePrice({ price: 450, salePrice: undefined })).toBeNull();
    expect(getSalePrice({ price: 450, salePrice: null as unknown as number })).toBeNull();
    expect(getSalePrice({ price: 450, salePrice: '' as unknown as number })).toBeNull();
  });

  it('never raises a price: equal or higher sale prices are ignored', () => {
    expect(getSalePrice({ price: 450, salePrice: 450 })).toBeNull();
    expect(getSalePrice({ price: 450, salePrice: 500 })).toBeNull();
  });

  it('ignores negative or non-numeric sale prices', () => {
    expect(getSalePrice({ price: 450, salePrice: -1 })).toBeNull();
    expect(getSalePrice({ price: 450, salePrice: NaN })).toBeNull();
    expect(getSalePrice({ price: 450, salePrice: 'abc' as unknown as number })).toBeNull();
  });

  it('accepts numeric strings (Firestore REST returns integers as strings)', () => {
    expect(getSalePrice({ price: '450' as unknown as number, salePrice: '399' as unknown as number })).toBe(399);
  });
});

describe('getUnitPrice', () => {
  it('charges the sale price when on sale', () => {
    expect(getUnitPrice({ price: 450, salePrice: 399 })).toBe(399);
  });

  it('falls back to the regular price', () => {
    expect(getUnitPrice({ price: 450 })).toBe(450);
    expect(getUnitPrice({ price: 450, salePrice: 600 })).toBe(450);
  });
});

describe('getDiscountPercent', () => {
  it('rounds to a whole percentage', () => {
    expect(getDiscountPercent({ price: 450, salePrice: 399 })).toBe(11);
    expect(getDiscountPercent({ price: 200, salePrice: 150 })).toBe(25);
  });

  it('is 0 when not on sale', () => {
    expect(getDiscountPercent({ price: 450 })).toBe(0);
  });
});

describe('getSaleLabel', () => {
  it('returns the trimmed label while on sale', () => {
    expect(getSaleLabel({ price: 450, salePrice: 399, saleLabel: '  Launch Special ' })).toBe('Launch Special');
  });

  it('hides the label when the product is not on sale', () => {
    expect(getSaleLabel({ price: 450, saleLabel: 'Launch Special' })).toBeNull();
    expect(getSaleLabel({ price: 450, salePrice: 500, saleLabel: 'Launch Special' })).toBeNull();
  });

  it('is null for a missing or blank label', () => {
    expect(getSaleLabel({ price: 450, salePrice: 399 })).toBeNull();
    expect(getSaleLabel({ price: 450, salePrice: 399, saleLabel: '   ' })).toBeNull();
  });
});
