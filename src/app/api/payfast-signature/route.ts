import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Replicates PHP's urlencode() used by PayFast's generateSignature function.
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

  // PayFast's generateSignature iterates fields in insertion order (array_filter preserves order),
  // url-encodes each value with PHP urlencode, and skips empty values.
  const checkString = Object.entries(data)
    .filter(([, v]) => v.trim() !== '')
    .map(([k, v]) => `${k}=${phpUrlencode(v.trim())}`)
    .join('&');

  const passphrase = process.env.PAYFAST_PASSPHRASE;
  const fullString = passphrase
    ? `${checkString}&passphrase=${phpUrlencode(passphrase.trim())}`
    : checkString;

  const signature = crypto.createHash('md5').update(fullString).digest('hex');
  return NextResponse.json({ signature });
}
