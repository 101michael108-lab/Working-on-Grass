import { describe, it, expect } from 'vitest';
import { normaliseReason } from './funnel-store';

describe('normaliseReason', () => {
  it('keeps a sensible reason as it is', () => {
    expect(normaliseReason('out_of_stock')).toBe('out_of_stock');
    expect(normaliseReason('OUT OF STOCK')).toBe('out_of_stock');
  });

  it('strips anything that could not safely be a Firestore field name', () => {
    // The reason arrives from a public endpoint and becomes a map key.
    expect(normaliseReason('../../etc/passwd')).toBe('etc_passwd');
    expect(normaliseReason('a.b.c')).toBe('a_b_c');
    expect(normaliseReason('__proto__')).toBe('proto');
  });

  it('bounds the length and always returns something usable', () => {
    expect(normaliseReason('x'.repeat(200))).toHaveLength(40);
    expect(normaliseReason('')).toBe('unknown');
    expect(normaliseReason('!!!')).toBe('unknown');
    expect(normaliseReason(undefined)).toBe('unknown');
  });
});
