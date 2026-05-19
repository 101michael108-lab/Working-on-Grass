import { NextRequest, NextResponse } from 'next/server';
import { generatePayfastSignature } from '@/lib/payfast-signature';
import { getPayfastPassphrase, isSandboxMerchantId } from '@/lib/payfast-config';

type SignatureRequestBody = {
  payfastData: Record<string, string>;
  isLiveMode?: boolean;
};

function parseSignatureRequest(body: unknown): SignatureRequestBody | null {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return null;
  }

  const record = body as Record<string, unknown>;

  if (
    record.payfastData &&
    typeof record.payfastData === 'object' &&
    !Array.isArray(record.payfastData)
  ) {
    return {
      payfastData: record.payfastData as Record<string, string>,
      isLiveMode: record.isLiveMode === true,
    };
  }

  if (typeof record.merchant_id === 'string') {
    return {
      payfastData: record as Record<string, string>,
      isLiveMode: record.isLiveMode === true,
    };
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const parsed = parseSignatureRequest(await req.json());

    if (!parsed) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { payfastData: data, isLiveMode = false } = parsed;
    const merchantId = data.merchant_id?.trim() ?? '';
    const merchantKey = data.merchant_key?.trim() ?? '';

    if (!merchantId || !merchantKey) {
      return NextResponse.json(
        {
          error:
            'Missing PayFast merchant_id or merchant_key. For live mode, set these in Admin → Settings. For sandbox, set NEXT_PUBLIC_PAYFAST_SANDBOX_* in App Hosting.',
        },
        { status: 400 }
      );
    }

    if (isLiveMode && isSandboxMerchantId(merchantId)) {
      return NextResponse.json(
        {
          error:
            'Live mode is on but the merchant ID looks like a sandbox test account. In Admin → Settings, enter your live PayFast Merchant ID and Key from payfast.co.za (not sandbox.payfast.co.za).',
        },
        { status: 400 }
      );
    }

    const passphrase = getPayfastPassphrase(isLiveMode);
    const signature = generatePayfastSignature(data, passphrase);

    if (isLiveMode && !passphrase) {
      console.warn(
        'PayFast live signature: PAYFAST_PASSPHRASE is empty. If your PayFast live account has a security passphrase, set it with: firebase apphosting:secrets:set payfast-passphrase'
      );
    }

    return NextResponse.json({ signature });
  } catch (error) {
    console.error('PayFast signature error:', error);
    return NextResponse.json({ error: 'Could not generate payment signature.' }, { status: 500 });
  }
}
