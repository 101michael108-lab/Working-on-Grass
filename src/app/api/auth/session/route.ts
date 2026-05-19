import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminFirestore } from '@/lib/firebase-admin';

const SESSION_COOKIE = '__session';
const SESSION_MAX_AGE_MS = 60 * 60 * 24 * 5 * 1000; // 5 days

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    const idToken = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;

    if (!idToken) {
      return NextResponse.json({ error: 'Missing token' }, { status: 401 });
    }

    const decoded = await getAdminAuth().verifyIdToken(idToken);
    const userSnap = await getAdminFirestore().collection('users').doc(decoded.uid).get();

    if (!userSnap.exists || userSnap.data()?.role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const sessionCookie = await getAdminAuth().createSessionCookie(idToken, {
      expiresIn: SESSION_MAX_AGE_MS,
    });

    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE_MS / 1000,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Session creation failed:', error);
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  return response;
}
