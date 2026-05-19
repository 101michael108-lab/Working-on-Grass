import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase-admin';
import { isAdminUid } from '@/lib/admin-config';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!idToken) {
      return NextResponse.json({ isAdmin: false }, { status: 401 });
    }

    const decoded = await getAdminAuth().verifyIdToken(idToken);
    const isAdmin =
      decoded.admin === true || isAdminUid(decoded.uid);

    return NextResponse.json({ isAdmin });
  } catch {
    return NextResponse.json({ isAdmin: false }, { status: 401 });
  }
}
