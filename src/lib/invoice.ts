/**
 * @fileOverview Isomorphic PDF invoice generator.
 *
 * Runs both server-side (PayFast ITN route, to attach the invoice to the
 * confirmation email) and client-side (checkout success page, for the
 * "Download Invoice" button). Built on pdf-lib, which is pure JS and works in
 * both the Node server runtime and the browser — so the same layout is shared.
 */

import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import { orderNumberLabel } from '@/lib/order-number';

export interface InvoiceInput {
  orderId: string;
  /** Sequential customer-facing number; falls back to the short doc id when absent. */
  orderNumber?: number;
  orderDate?: Date | string | number | { toDate: () => Date } | { seconds: number };
  status?: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  /** Optional — computed from items when omitted. */
  subtotal?: number;
  shippingFee?: number;
  totalAmount: number;
  shippingInfo?: {
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    /** Buyer's own VAT number, so a VAT-registered customer can claim. */
    vatNumber?: string;
  };
  /** Separate billing address — when present, the Bill To uses it. */
  billingInfo?: {
    firstName?: string;
    lastName?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
  storeName?: string;
  /** Shown in the footer as the store contact address. */
  storeEmail?: string;
  /** VAT registration number — when set, the document is titled "TAX INVOICE". */
  vatNumber?: string;
}

// Brand palette (mirrors the confirmation email).
const GREEN = rgb(0.102, 0.227, 0.102); // #1a3a1a
const ACCENT = rgb(0.761, 0.255, 0.047); // #c2410c
const INK = rgb(0.2, 0.2, 0.2);
const MUTED = rgb(0.42, 0.447, 0.502); // #6b7280
const LINE = rgb(0.898, 0.906, 0.922); // #e5e7eb
const SHADE = rgb(0.973, 0.98, 0.988); // #f8fafc
const WHITE = rgb(1, 1, 1);

// A4 in points.
const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 50;
const RIGHT = PAGE_W - MARGIN;

const STORE_LOCATION = 'Modimolle, Limpopo, South Africa';

/** South African VAT is charged at 15% on an inclusive basis. */
const VAT_RATE = 0.15;

function toDate(value: InvoiceInput['orderDate']): Date {
  if (!value) return new Date();
  if (value instanceof Date) return value;
  if (typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    return value.toDate();
  }
  if (typeof value === 'object' && 'seconds' in value && typeof value.seconds === 'number') {
    return new Date(value.seconds * 1000);
  }
  return new Date(value as string | number);
}

function formatDate(value: InvoiceInput['orderDate']): string {
  return toDate(value).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' });
}

/** e.g. 1234.5 -> "R 1 234.50" (space thousands separator, common in ZA). */
function rands(n: number): string {
  const fixed = (Math.round((n + Number.EPSILON) * 100) / 100).toFixed(2);
  const [int, dec] = fixed.split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `R ${grouped}.${dec}`;
}

/**
 * pdf-lib's standard fonts can only encode WinAnsi (CP1252) and throw on
 * anything else. Customer-entered names/addresses and product names may contain
 * characters outside that range, so fold accented Latin to ASCII and replace
 * any remaining unencodable character with "?" — never let the PDF throw.
 */
function sanitize(input?: string): string {
  if (!input) return '';
  return input
    .replace(/[‘’‚‛]/g, "'") // curly single quotes
    .replace(/[“”„‟]/g, '"') // curly double quotes
    .normalize('NFKD') // é -> e + combining accent
    .replace(/[̀-ͯ]/g, '') // strip combining marks
    // Keep printable ASCII plus a few WinAnsi-safe symbols (en/em dash, bullet,
    // ellipsis, £, €); fold everything else to "?".
    .replace(/[^\x20-\x7E–—•…£€]/g, '?');
}

/** Suggested download filename for an order's invoice. */
export function invoiceFileName(orderId: string, orderNumber?: number): string {
  return `Invoice-${orderNumberLabel(orderNumber, orderId)}.pdf`;
}

/** Truncate text with an ellipsis so it fits within maxWidth at the given size. */
function fit(text: string, maxWidth: number, size: number, font: PDFFont): string {
  if (font.widthOfTextAtSize(text, size) <= maxWidth) return text;
  let t = text;
  while (t.length > 1 && font.widthOfTextAtSize(`${t}…`, size) > maxWidth) {
    t = t.slice(0, -1);
  }
  return `${t}…`;
}

/**
 * Generates an invoice PDF for an order and returns the raw bytes.
 * Server callers can wrap the result in a Buffer for base64 email attachment;
 * browser callers can wrap it in a Blob for download.
 */
export async function generateInvoicePdf(input: InvoiceInput): Promise<Uint8Array> {
  const storeName = sanitize(input.storeName) || 'Working on Grass';
  const vatNumber = sanitize(input.vatNumber);
  const docTitle = vatNumber ? 'TAX INVOICE' : 'INVOICE';
  const items = input.items || [];
  const subtotal = input.subtotal ?? items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const total = input.totalAmount;
  const shipping = input.shippingFee ?? Math.max(0, total - subtotal);
  const vat = total - total / (1 + VAT_RATE);

  const invoiceNo = orderNumberLabel(input.orderNumber, input.orderId);

  const pdf = await PDFDocument.create();
  pdf.setTitle(`Invoice ${invoiceNo}`);
  pdf.setProducer(storeName);
  pdf.setCreator(storeName);

  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  let page = pdf.addPage([PAGE_W, PAGE_H]);

  const text = (s: string, x: number, y: number, size: number, f: PDFFont, color = INK) =>
    page.drawText(s, { x, y, size, font: f, color });

  const textRight = (s: string, rightX: number, y: number, size: number, f: PDFFont, color = INK) =>
    page.drawText(s, { x: rightX - f.widthOfTextAtSize(s, size), y, size, font: f, color });

  // --- Header band ---
  page.drawRectangle({ x: 0, y: PAGE_H - 70, width: PAGE_W, height: 70, color: GREEN });
  text(storeName, MARGIN, PAGE_H - 44, 20, bold, WHITE);
  textRight(docTitle, RIGHT, PAGE_H - 44, docTitle.length > 8 ? 18 : 22, bold, WHITE);

  let y = PAGE_H - 110;

  // --- Meta (right) + Bill To (left) ---
  const metaRows: Array<[string, string]> = [
    ['Invoice No', `INV-${invoiceNo}`],
    ['Date', formatDate(input.orderDate)],
  ];
  if (input.status) metaRows.push(['Status', sanitize(input.status)]);
  if (vatNumber) metaRows.push(['VAT No', vatNumber]);

  let metaY = y;
  for (const [label, value] of metaRows) {
    textRight(label.toUpperCase(), RIGHT - 150, metaY, 8, bold, MUTED);
    textRight(value, RIGHT, metaY, 10, font, INK);
    metaY -= 16;
  }

  // Bill To — the billing address when it differs, else the shipping address.
  // Contact email and buyer VAT always come from the shipping/contact details.
  text('BILL TO', MARGIN, y, 8, bold, MUTED);
  let billY = y - 16;
  const ship = input.shippingInfo || {};
  const bill = input.billingInfo;
  const addr = bill || ship;
  const name = sanitize(
    [bill?.firstName ?? ship.firstName, bill?.lastName ?? ship.lastName].filter(Boolean).join(' ').trim()
  );
  const billLines = [
    name,
    sanitize(ship.email),
    sanitize(bill ? '' : ship.phone),
    sanitize(addr.address),
    sanitize([addr.city, addr.postalCode].filter(Boolean).join(', ')),
    sanitize(addr.country),
    ship.vatNumber ? sanitize(`VAT No: ${ship.vatNumber}`) : '',
  ].filter((l) => l.length > 0);
  for (const line of billLines) {
    text(fit(line, 240, 10, font), MARGIN, billY, 10, line === name ? bold : font, line === name ? INK : MUTED);
    billY -= 15;
  }

  y = Math.min(metaY, billY) - 28;

  // --- Items table header ---
  const QTY_RIGHT = 380;
  const UNIT_RIGHT = 470;
  const AMT_RIGHT = RIGHT;
  const ITEM_MAX = QTY_RIGHT - MARGIN - 70;

  const drawTableHeader = () => {
    page.drawRectangle({ x: MARGIN, y: y - 6, width: RIGHT - MARGIN, height: 24, color: SHADE });
    text('ITEM', MARGIN + 8, y, 9, bold, MUTED);
    textRight('QTY', QTY_RIGHT, y, 9, bold, MUTED);
    textRight('UNIT PRICE', UNIT_RIGHT, y, 9, bold, MUTED);
    textRight('AMOUNT', AMT_RIGHT - 8, y, 9, bold, MUTED);
    y -= 30;
  };
  drawTableHeader();

  for (const item of items) {
    if (y < 140) {
      // Continue on a fresh page.
      page = pdf.addPage([PAGE_W, PAGE_H]);
      y = PAGE_H - MARGIN;
      drawTableHeader();
    }
    text(fit(sanitize(item.name), ITEM_MAX, 10, font), MARGIN + 8, y, 10, font, INK);
    textRight(String(item.quantity), QTY_RIGHT, y, 10, font, INK);
    textRight(rands(item.price), UNIT_RIGHT, y, 10, font, INK);
    textRight(rands(item.price * item.quantity), AMT_RIGHT - 8, y, 10, font, INK);
    y -= 18;
    page.drawLine({ start: { x: MARGIN, y: y + 4 }, end: { x: RIGHT, y: y + 4 }, thickness: 0.5, color: LINE });
    y -= 8;
  }

  // --- Totals ---
  y -= 10;
  const totalsLabelRight = UNIT_RIGHT;
  const totalRow = (label: string, value: string, opts?: { bold?: boolean; color?: typeof INK }) => {
    const f = opts?.bold ? bold : font;
    textRight(label, totalsLabelRight, y, opts?.bold ? 12 : 10, f, opts?.color ?? MUTED);
    textRight(value, AMT_RIGHT - 8, y, opts?.bold ? 12 : 10, f, opts?.color ?? INK);
    y -= opts?.bold ? 22 : 18;
  };
  totalRow('Subtotal', rands(subtotal));
  totalRow('Shipping', shipping > 0 ? rands(shipping) : 'Free');
  page.drawLine({ start: { x: totalsLabelRight - 140, y: y + 6 }, end: { x: AMT_RIGHT - 8, y: y + 6 }, thickness: 1, color: LINE });
  y -= 6;
  totalRow('Total Paid', rands(total), { bold: true, color: ACCENT });
  textRight(`Includes VAT (15%): ${rands(vat)}`, AMT_RIGHT - 8, y, 8, font, MUTED);

  // --- Footer ---
  const footerY = 70;
  page.drawLine({ start: { x: MARGIN, y: footerY + 24 }, end: { x: RIGHT, y: footerY + 24 }, thickness: 0.5, color: LINE });
  text('Thank you for your order.', MARGIN, footerY + 6, 10, bold, GREEN);
  const contact = [storeName, STORE_LOCATION, sanitize(input.storeEmail)].filter(Boolean).join('  •  ');
  text(fit(contact, RIGHT - MARGIN, 8, font), MARGIN, footerY - 8, 8, font, MUTED);

  return pdf.save();
}
