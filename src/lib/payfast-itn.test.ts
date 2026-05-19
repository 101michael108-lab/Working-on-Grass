import { describe, it, expect } from 'vitest';
import {
  isPayfastPaymentComplete,
  verifyItnSignature,
  getPayfastValidateUrl,
} from './payfast-itn';

describe('payfast-itn', () => {
  it('detects COMPLETE payment status case-insensitively', () => {
    expect(isPayfastPaymentComplete('COMPLETE')).toBe(true);
    expect(isPayfastPaymentComplete('complete')).toBe(true);
    expect(isPayfastPaymentComplete('PENDING')).toBe(false);
  });

  it('uses validate URLs for live vs sandbox', () => {
    expect(getPayfastValidateUrl(false)).toContain('sandbox.payfast.co.za');
    expect(getPayfastValidateUrl(true)).toContain('www.payfast.co.za');
  });

  it('verifies signature with field-order fallback', () => {
    const pfData = {
      merchant_id: '10000100',
      merchant_key: '46f0cd694581a',
      m_payment_id: 'order-1',
      amount: '100.00',
      payment_status: 'COMPLETE',
    };
    const entries = Object.entries(pfData);
    const sig = verifyItnSignature(entries, pfData, 'dummy', undefined);
    expect(sig).toBe(false);
  });
});
