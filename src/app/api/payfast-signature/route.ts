import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const data: Record<string, string> = await req.json();

  // Build the signature string from all fields in the order received
  const checkString = Object.entries(data)
    .map(([k, v]) => `${k}=${encodeURIComponent(v.trim()).replace(/%20/g, '+')}`)
    .join('&');

  const passphrase = process.env.PAYFAST_PASSPHRASE;
  const fullString = passphrase ? `${checkString}&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, '+')}` : checkString;

  const signature = crypto.createHash('md5').update(fullString).digest('hex');
  return NextResponse.json({ signature });
}
