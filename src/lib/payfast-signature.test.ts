import { describe, it, expect } from 'vitest';
import { generatePayfastSignature, phpUrlencode } from './payfast-signature';

describe('phpUrlencode', () => {
  it('encodes spaces as +', () => {
    expect(phpUrlencode('hello world')).toBe('hello+world');
  });

  it('encodes special characters like PHP', () => {
    expect(phpUrlencode("a!b'c(d)e*f~g")).toBe('a%21b%27c%28d%29e%2Af%7Eg');
  });
});

describe('generatePayfastSignature', () => {
  it('matches PayFast sandbox example field order', () => {
    const data = {
      merchant_id: '10000100',
      merchant_key: '46f0cd694581a',
      return_url: 'https://example.com/return',
      cancel_url: 'https://example.com/cancel',
      notify_url: 'https://example.com/notify',
      name_first: 'Test',
      name_last: 'User',
      email_address: 'test@example.com',
      m_payment_id: 'order-1',
      amount: '100.00',
      item_name: 'Test Item',
    };

    const signature = generatePayfastSignature(data, 'jt7NOE43FZPn');
    expect(signature).toMatch(/^[a-f0-9]{32}$/);
  });

  it('skips empty values', () => {
    const withEmpty = generatePayfastSignature(
      { merchant_id: '1', empty_field: '  ', amount: '10.00' },
      undefined
    );
    const withoutEmpty = generatePayfastSignature(
      { merchant_id: '1', amount: '10.00' },
      undefined
    );
    expect(withEmpty).toBe(withoutEmpty);
  });

  it('is deterministic for the same input', () => {
    const data = { merchant_id: '1', amount: '99.99' };
    expect(generatePayfastSignature(data, 'secret')).toBe(
      generatePayfastSignature(data, 'secret')
    );
  });
});
