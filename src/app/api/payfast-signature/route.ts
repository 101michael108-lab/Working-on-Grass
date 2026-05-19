import { NextRequest, NextResponse } from 'next/server';
import { generatePayfastSignature } from '@/lib/payfast-signature';

export async function POST(req: NextRequest) {
  try {
    const data: Record<string, string> = await req.json();

    if (!data.merchant_id?.trim() || !data.merchant_key?.trim()) {
      return NextResponse.json(
        {
          error:
            'Missing PayFast merchant_id or merchant_key. For live mode, set these in Admin → Settings. For sandbox, set NEXT_PUBLIC_PAYFAST_SANDBOX_* in App Hosting.',
        },
        { status: 400 }
      );
    }

    const passphrase = process.env.PAYFAST_PASSPHRASE?.trim();
    const signature = generatePayfastSignature(data, passphrase || undefined);

    return NextResponse.json({ signature });
  } catch (error) {
    console.error('PayFast signature error:', error);
    return NextResponse.json({ error: 'Could not generate payment signature.' }, { status: 500 });
  }
}
