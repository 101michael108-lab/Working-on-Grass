import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Mimics PHP's urlencode() which PayFast uses server-side to verify signatures.
// encodeURIComponent leaves !, ', (, ), *, ~ unencoded — PHP encodes them.
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
