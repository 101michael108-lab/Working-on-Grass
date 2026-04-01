import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Mimics PHP's urlencode() which PayFast uses server-side to verify signatures.
function phpUrlencode(str: string): string {
  return encodeURIComponent(str)
    .replace(/%20/g, '+')
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A')
    .replace(/~/g, '%7E');
}

export async function POST(req: NextRequest) {
  const data: Record<string, string> = await req.json();

  // Use insertion order — PayFast verifies using the order fields are received in the POST,
  // which matches the order they appear in our HTML form (Object.entries insertion order).
  const checkString = Object.entries(data)
    .map(([k, v]) => `${k}=${phpUrlencode(v.trim())}`)
    .join('&');

  const passphrase = process.env.PAYFAST_PASSPHRASE;
  const fullString = passphrase
    ? `${checkString}&passphrase=${phpUrlencode(passphrase.trim())}`
    : checkString;

  const signature = crypto.createHash('md5').update(fullString).digest('hex');
  return NextResponse.json({ signature });
}
