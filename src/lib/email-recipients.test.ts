import { describe, it, expect } from 'vitest';
import {
  DEFAULT_ADMIN_EMAIL,
  hasRecipient,
  isEmailish,
  parseEmailList,
  primaryRecipient,
  resolveAdminRecipients,
  resolveSenderEmail,
} from './email-recipients';

describe('email-recipients', () => {
  it('accepts real addresses and rejects values that cannot be one', () => {
    expect(isEmailish('admin@workingongrass.co.za')).toBe(true);
    expect(isEmailish('  admin@workingongrass.co.za  ')).toBe(true);
    expect(isEmailish('Working on Grass')).toBe(false);
    expect(isEmailish('admin@localhost')).toBe(false);
    expect(isEmailish('')).toBe(false);
    expect(isEmailish(undefined)).toBe(false);
  });

  it('splits a multi-address field and drops the unusable entries', () => {
    expect(parseEmailList('a@b.co, c@d.co')).toEqual(['a@b.co', 'c@d.co']);
    expect(parseEmailList('a@b.co; c@d.co')).toEqual(['a@b.co', 'c@d.co']);
    // One typo must not cost the other recipients their notification.
    expect(parseEmailList('a@b.co, nonsense, c@d.co')).toEqual(['a@b.co', 'c@d.co']);
    expect(parseEmailList('a@b.co, a@b.co')).toEqual(['a@b.co']);
    expect(parseEmailList('')).toEqual([]);
  });

  it('always resolves at least one admin recipient', () => {
    expect(resolveAdminRecipients({ contactEmail: 'owner@farm.co.za' })).toEqual(['owner@farm.co.za']);
    expect(resolveAdminRecipients({ contactEmail: 'a@b.co,c@d.co' })).toEqual(['a@b.co', 'c@d.co']);
    expect(resolveAdminRecipients({ contactEmail: '' })).toEqual([DEFAULT_ADMIN_EMAIL]);
    expect(resolveAdminRecipients({ contactEmail: 'not an address' })).toEqual([DEFAULT_ADMIN_EMAIL]);
    expect(resolveAdminRecipients(null)).toEqual([DEFAULT_ADMIN_EMAIL]);
  });

  it('omits an unusable sender so the extension DEFAULT_FROM applies', () => {
    expect(resolveSenderEmail({ senderEmail: 'sales@farm.co.za' })).toBe('sales@farm.co.za');
    // The blank default, and the case that used to break every outgoing email.
    expect(resolveSenderEmail({ senderEmail: '' })).toBeUndefined();
    expect(resolveSenderEmail({ senderEmail: 'Working on Grass' })).toBeUndefined();
    expect(resolveSenderEmail(undefined)).toBeUndefined();
  });

  it('detects an empty recipient in both shapes', () => {
    expect(hasRecipient('a@b.co')).toBe(true);
    expect(hasRecipient(['a@b.co'])).toBe(true);
    expect(hasRecipient('   ')).toBe(false);
    // An empty array is truthy, which is why this check exists at all.
    expect(hasRecipient([])).toBe(false);
    expect(hasRecipient(undefined)).toBe(false);
  });

  it('picks one address to show in a template', () => {
    expect(primaryRecipient(['a@b.co', 'c@d.co'])).toBe('a@b.co');
    expect(primaryRecipient('a@b.co')).toBe('a@b.co');
    expect(primaryRecipient([])).toBe('');
  });
});
