import { describe, it, expect, beforeAll } from 'vitest';
import { signInvoiceToken, verifyInvoiceToken } from './invoice-token';

beforeAll(() => {
  process.env.INVOICE_TOKEN_SECRET = 'unit-test-secret-please-change';
});

describe('invoice-token', () => {
  it('round-trips a valid token', () => {
    const token = signInvoiceToken('order_123', 'uid_ABC');
    expect(token).toBeTruthy();
    expect(verifyInvoiceToken(token!)).toEqual({ orderId: 'order_123', uid: 'uid_ABC' });
  });

  it('rejects a tampered signature', () => {
    const token = signInvoiceToken('order_123', 'uid_ABC')!;
    const tampered = token.slice(0, -2) + (token.endsWith('aa') ? 'bb' : 'aa');
    expect(verifyInvoiceToken(tampered)).toBeNull();
  });

  it('rejects an expired token', () => {
    const token = signInvoiceToken('order_123', 'uid_ABC', -1000)!;
    expect(verifyInvoiceToken(token)).toBeNull();
  });

  it('rejects malformed input', () => {
    expect(verifyInvoiceToken('not.a.real.token')).toBeNull();
    expect(verifyInvoiceToken('')).toBeNull();
  });
});
