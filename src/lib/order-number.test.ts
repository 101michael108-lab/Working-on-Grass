import { describe, it, expect } from 'vitest';
import { formatOrderRef, orderNumberLabel, parseOrderNumber } from './order-number';

describe('order-number', () => {
  it('formats a sequential number with a leading hash', () => {
    expect(formatOrderRef({ orderNumber: 1001 })).toBe('#1001');
    expect(orderNumberLabel(1001)).toBe('1001');
  });

  it('pads numbers below four digits', () => {
    expect(orderNumberLabel(42)).toBe('0042');
    expect(formatOrderRef({ orderNumber: 42 })).toBe('#0042');
  });

  it('falls back to the short doc id for legacy orders', () => {
    expect(formatOrderRef({ id: 'EEa3GLufAbc123' })).toBe('#EEA3GLUF');
    expect(orderNumberLabel(undefined, 'EEa3GLufAbc123')).toBe('EEA3GLUF');
  });

  it('parses user-typed references to a number', () => {
    expect(parseOrderNumber('#1001')).toBe(1001);
    expect(parseOrderNumber('1001')).toBe(1001);
    expect(parseOrderNumber('  #1001 ')).toBe(1001);
    expect(parseOrderNumber('abc')).toBeNull();
    expect(parseOrderNumber('')).toBeNull();
  });
});
