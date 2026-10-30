import { describe, it, expect, vi } from 'vitest';
import {
  RESEND_ENDPOINT,
  isRetryableStatus,
  resolveFromAddress,
  resolveTransport,
  retryDelayMs,
  sendViaResend,
  toResendPayload,
} from './email-transport';

const okResponse = (body: unknown = { id: 'msg_1' }) =>
  new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } });

const errResponse = (status: number, body = 'nope', headers: Record<string, string> = {}) =>
  new Response(body, { status, headers });

describe('resolveTransport', () => {
  it('uses the extension until an API key exists', () => {
    expect(resolveTransport({})).toBe('extension');
    expect(resolveTransport({ RESEND_API_KEY: '   ' })).toBe('extension');
  });

  it('switches to the provider as soon as a key is present', () => {
    expect(resolveTransport({ RESEND_API_KEY: 're_123' })).toBe('resend');
  });

  it('lets an explicit setting win, so the extension can take over in an outage', () => {
    expect(resolveTransport({ RESEND_API_KEY: 're_123', EMAIL_TRANSPORT: 'extension' })).toBe('extension');
    expect(resolveTransport({ EMAIL_TRANSPORT: 'RESEND' })).toBe('resend');
    // An unrecognised value must not silently disable sending.
    expect(resolveTransport({ RESEND_API_KEY: 're_123', EMAIL_TRANSPORT: 'typo' })).toBe('resend');
  });
});

describe('resolveFromAddress', () => {
  it('prefers the infrastructure address over whatever Settings holds', () => {
    // The env value is the one verified with the provider; a typed Settings
    // value must not be able to break sending.
    expect(
      resolveFromAddress({ envFrom: 'WoG <orders@mail.workingongrass.co.za>', docFrom: 'WoG <nope@example.com>' })
    ).toBe('WoG <orders@mail.workingongrass.co.za>');
  });

  it('falls back to the queued document and then to nothing', () => {
    expect(resolveFromAddress({ docFrom: 'WoG <a@b.co>' })).toBe('WoG <a@b.co>');
    expect(resolveFromAddress({ envFrom: '  ', docFrom: '  ' })).toBeUndefined();
    expect(resolveFromAddress({})).toBeUndefined();
  });
});

describe('toResendPayload', () => {
  const from = 'WoG <orders@mail.workingongrass.co.za>';

  it('maps an outbox document to the provider request', () => {
    const payload = toResendPayload(
      {
        to: ['owner@farm.co.za', 'sales@farm.co.za'],
        replyTo: 'buyer@example.com',
        message: { subject: '[SALES] New Order #1001', html: '<p>hi</p>', text: 'hi' },
      },
      from
    );

    expect(payload).toEqual({
      from,
      to: ['owner@farm.co.za', 'sales@farm.co.za'],
      subject: '[SALES] New Order #1001',
      html: '<p>hi</p>',
      text: 'hi',
      reply_to: 'buyer@example.com',
    });
  });

  it('normalises a single recipient to a list', () => {
    const payload = toResendPayload({ to: 'buyer@example.com', message: { subject: 's', html: 'h' } }, from);
    expect(payload.to).toEqual(['buyer@example.com']);
  });

  it('keeps URL attachments as paths, which the provider fetches at send time', () => {
    const payload = toResendPayload(
      {
        to: 'buyer@example.com',
        message: {
          subject: 'Order Confirmation',
          html: 'h',
          attachments: [
            { filename: 'Invoice-1001.pdf', path: 'https://site/api/invoice?t=x', contentType: 'application/pdf' },
            { filename: 'Guide.pdf', path: 'https://site/guide.pdf' },
            // No path: nothing to fetch, so it is dropped rather than failing.
            { filename: 'broken.pdf' },
          ],
        },
      },
      from
    );

    expect(payload.attachments).toEqual([
      { filename: 'Invoice-1001.pdf', path: 'https://site/api/invoice?t=x', content_type: 'application/pdf' },
      { filename: 'Guide.pdf', path: 'https://site/guide.pdf' },
    ]);
  });

  it('refuses a request the provider would reject anyway', () => {
    expect(() => toResendPayload({ to: '', message: { subject: 's', html: 'h' } }, from)).toThrow(/recipient/);
    expect(() => toResendPayload({ to: 'a@b.co', message: { subject: 's' } }, from)).toThrow(/html nor a text/);
  });
});

describe('retry policy', () => {
  it('retries a rate limit and an upstream fault, but not a rejection', () => {
    expect(isRetryableStatus(429)).toBe(true);
    expect(isRetryableStatus(503)).toBe(true);
    expect(isRetryableStatus(422)).toBe(false);
    expect(isRetryableStatus(403)).toBe(false);
  });

  it('honours retry-after, capped so a payment webhook cannot hang', () => {
    expect(retryDelayMs('1', 1)).toBe(1000);
    expect(retryDelayMs('600', 1)).toBe(2000);
    expect(retryDelayMs(null, 1)).toBe(250);
    expect(retryDelayMs(null, 3)).toBe(1000);
  });
});

describe('sendViaResend', () => {
  it('posts the payload and returns the provider message id', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(okResponse({ id: 'msg_abc' }));
    const result = await sendViaResend(
      { from: 'a@b.co', to: ['c@d.co'], subject: 's', html: 'h' },
      're_key',
      fetchImpl as unknown as typeof fetch
    );

    expect(result).toEqual({ messageId: 'msg_abc', attempts: 1 });
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe(RESEND_ENDPOINT);
    expect(init.headers.Authorization).toBe('Bearer re_key');
    expect(JSON.parse(init.body)).toMatchObject({ to: ['c@d.co'], subject: 's' });
  });

  it('retries a rate limit and succeeds', async () => {
    // Two emails go out per order and the documented limit is 2 requests a
    // second, so a 429 is an expected condition rather than an outage.
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(errResponse(429, 'rate_limit_exceeded', { 'retry-after': '1' }))
      .mockResolvedValueOnce(okResponse({ id: 'msg_after_retry' }));

    const result = await sendViaResend(
      { from: 'a@b.co', to: ['c@d.co'], subject: 's', html: 'h' },
      're_key',
      fetchImpl as unknown as typeof fetch
    );

    expect(result).toEqual({ messageId: 'msg_after_retry', attempts: 2 });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('gives up immediately on a rejection and reports the provider message', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(errResponse(403, 'domain is not verified'));

    await expect(
      sendViaResend({ from: 'a@b.co', to: ['c@d.co'], subject: 's', html: 'h' }, 're_key', fetchImpl as unknown as typeof fetch)
    ).rejects.toThrow(/403.*domain is not verified/);

    // A 403 will not fix itself; retrying would only delay the webhook.
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('retries a network fault, then reports it', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error('ECONNRESET'));

    await expect(
      sendViaResend({ from: 'a@b.co', to: ['c@d.co'], subject: 's', html: 'h' }, 're_key', fetchImpl as unknown as typeof fetch)
    ).rejects.toThrow('ECONNRESET');

    expect(fetchImpl).toHaveBeenCalledTimes(3);
  });
});

/** Minimal stand-in for the Admin SDK surface the writeback touches. */
function fakeDb() {
  const writes: Record<string, any> = {};
  return {
    writes,
    db: {
      collection: (name: string) => {
        if (name !== 'mail') throw new Error(`unexpected collection ${name}`);
        return {
          doc: (id: string) => ({
            set: async (data: Record<string, any>) => {
              writes[id] = { ...(writes[id] ?? {}), ...data };
            },
          }),
        };
      },
    } as any,
  };
}

const QUEUED = {
  to: 'owner@farm.co.za',
  message: { subject: '[SALES] New Order #1001', html: '<p>sold</p>' },
};

describe('dispatchQueuedMail', () => {
  it('does nothing under the extension transport, leaving it to pick the document up', async () => {
    const { dispatchQueuedMail } = await import('./email-transport');
    const { db, writes } = fakeDb();
    const fetchImpl = vi.fn();
    vi.stubGlobal('fetch', fetchImpl);

    const transport = await dispatchQueuedMail(db, 'mail1', QUEUED, {});

    expect(transport).toBe('extension');
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(writes).toEqual({});
    vi.unstubAllGlobals();
  });

  it('records a provider success in the same delivery field the Email Log reads', async () => {
    const { dispatchQueuedMail } = await import('./email-transport');
    const { db, writes } = fakeDb();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(okResponse({ id: 'msg_xyz' })));

    const transport = await dispatchQueuedMail(db, 'mail1', QUEUED, {
      RESEND_API_KEY: 're_key',
      EMAIL_FROM: 'WoG <orders@mail.workingongrass.co.za>',
    });

    expect(transport).toBe('resend');
    expect(writes.mail1.delivery).toMatchObject({
      state: 'SUCCESS',
      attempts: 1,
      provider: 'resend',
      error: null,
      info: { messageId: 'msg_xyz', accepted: ['owner@farm.co.za'] },
    });
    expect(writes.mail1.delivery.endTime).toBeInstanceOf(Date);
    vi.unstubAllGlobals();
  });

  it('records a provider rejection verbatim instead of throwing at the webhook', async () => {
    const { dispatchQueuedMail } = await import('./email-transport');
    const { db, writes } = fakeDb();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(errResponse(403, 'The domain is not verified')));

    const transport = await dispatchQueuedMail(db, 'mail1', QUEUED, {
      RESEND_API_KEY: 're_key',
      EMAIL_FROM: 'WoG <orders@mail.workingongrass.co.za>',
    });

    expect(transport).toBe('resend');
    expect(writes.mail1.delivery.state).toBe('ERROR');
    expect(writes.mail1.delivery.error).toMatch(/403.*not verified/);
    vi.unstubAllGlobals();
  });

  it('reports a missing sender as a configuration error rather than sending', async () => {
    const { dispatchQueuedMail } = await import('./email-transport');
    const { db, writes } = fakeDb();
    const fetchImpl = vi.fn();
    vi.stubGlobal('fetch', fetchImpl);

    await dispatchQueuedMail(db, 'mail1', QUEUED, { RESEND_API_KEY: 're_key' });

    expect(fetchImpl).not.toHaveBeenCalled();
    expect(writes.mail1.delivery.state).toBe('ERROR');
    expect(writes.mail1.delivery.error).toMatch(/EMAIL_FROM/);
    vi.unstubAllGlobals();
  });
});
