import { describe, it, expect } from 'vitest';
import { formatRand } from './utils';

const NBSP = ' ';

describe('formatRand', () => {
  it('always shows two decimals', () => {
    expect(formatRand(450)).toBe('R450.00');
    expect(formatRand(5)).toBe('R5.00');
    expect(formatRand(0)).toBe('R0.00');
  });

  it('groups thousands with a non-breaking space', () => {
    expect(formatRand(4500)).toBe(`R4${NBSP}500.00`);
    expect(formatRand(11816)).toBe(`R11${NBSP}816.00`);
    expect(formatRand(1234567.5)).toBe(`R1${NBSP}234${NBSP}567.50`);
  });

  it('rounds to cents', () => {
    expect(formatRand(4795.999)).toBe(`R4${NBSP}796.00`);
  });

  it('puts the sign before the currency', () => {
    expect(formatRand(-150)).toBe('-R150.00');
  });
});
