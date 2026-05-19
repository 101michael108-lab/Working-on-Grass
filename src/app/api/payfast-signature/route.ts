import { NextRequest, NextResponse } from 'next/server';
import { generatePayfastSignature } from '@/lib/payfast-signature';

export async function POST(req: NextRequest) {
  const data: Record<string, string> = await req.json();
  const signature = generatePayfastSignature(data, process.env.PAYFAST_PASSPHRASE);
  return NextResponse.json({ signature });
}
