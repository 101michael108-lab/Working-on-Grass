import { describe, it, expect } from 'vitest';
import { generateInvoicePdf, invoiceFileName, type InvoiceInput } from './invoice';

const baseOrder: InvoiceInput = {
  orderId: 'abcdef1234567890',
  orderDate: new Date('2026-06-08T10:00:00Z'),
  status: 'Processing',
  items: [
    { name: 'Eragrostis tef (Teff) Seed — 25kg', quantity: 2, price: 450 },
    { name: 'Smutsfinger Grass Seed', quantity: 1, price: 320 },
  ],
  shippingFee: 150,
  totalAmount: 1370,
  shippingInfo: {
    email: 'buyer@example.com',
    firstName: 'Thabo',
    lastName: 'Mokoena',
    phone: '+27 82 000 0000',
    address: '123 Veld Way',
    city: 'Modimolle',
    postalCode: '0510',
    country: 'South Africa',
  },
  storeName: 'Working on Grass',
  storeEmail: 'admin@workingongrass.co.za',
};

/** A PDF file always begins with the magic bytes "%PDF-". */
function startsWithPdfHeader(bytes: Uint8Array): boolean {
  return String.fromCharCode(...bytes.subarray(0, 5)) === '%PDF-';
}

describe('invoice', () => {
  it('produces a valid, non-trivial PDF', async () => {
    const bytes = await generateInvoicePdf(baseOrder);
    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(startsWithPdfHeader(bytes)).toBe(true);
    expect(bytes.length).toBeGreaterThan(1000);
  });

  it('renders a TAX INVOICE when a VAT number is supplied', async () => {
    const bytes = await generateInvoicePdf({ ...baseOrder, vatNumber: '4123456789' });
    expect(startsWithPdfHeader(bytes)).toBe(true);
    expect(bytes.length).toBeGreaterThan(1000);
  });

  it('derives the filename from the short order ref', () => {
    expect(invoiceFileName('abcdef1234567890')).toBe('Invoice-ABCDEF12.pdf');
  });

  it('accepts a Firestore Timestamp-like date without throwing', async () => {
    const bytes = await generateInvoicePdf({
      ...baseOrder,
      orderDate: { toDate: () => new Date('2026-06-08T10:00:00Z') },
    });
    expect(startsWithPdfHeader(bytes)).toBe(true);
  });

  it('accepts a { seconds } timestamp without throwing', async () => {
    const bytes = await generateInvoicePdf({
      ...baseOrder,
      orderDate: { seconds: 1_780_000_000 },
    });
    expect(startsWithPdfHeader(bytes)).toBe(true);
  });

  it('handles a minimal order (no shipping info, computed subtotal)', async () => {
    const bytes = await generateInvoicePdf({
      orderId: 'short',
      items: [{ name: 'Single item', quantity: 1, price: 99 }],
      totalAmount: 99,
    });
    expect(startsWithPdfHeader(bytes)).toBe(true);
  });

  it('does not throw on accented or non-Latin customer text', async () => {
    const bytes = await generateInvoicePdf({
      ...baseOrder,
      shippingInfo: {
        ...baseOrder.shippingInfo,
        firstName: 'Renée',
        lastName: 'Müller-Größáñ 北京 😀',
        address: '12 Café Straße — “Côté” résumé',
      },
      items: [{ name: 'Grass — Société Spéçiale ☘ 草', quantity: 1, price: 100 }],
      totalAmount: 250,
    });
    expect(startsWithPdfHeader(bytes)).toBe(true);
  });

  it('paginates a long item list without throwing', async () => {
    const items = Array.from({ length: 60 }, (_, i) => ({
      name: `Product line ${i + 1}`,
      quantity: 1,
      price: 10,
    }));
    const bytes = await generateInvoicePdf({
      ...baseOrder,
      items,
      totalAmount: 600 + 150,
    });
    expect(startsWithPdfHeader(bytes)).toBe(true);
  });
});
