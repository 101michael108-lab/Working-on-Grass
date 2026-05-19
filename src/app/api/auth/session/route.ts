import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, hasAdminCredentials } from '@/lib/firebase-admin';
import { isAdminUid } from '@/lib/admin-config';

const SESSION_COOKIE = '__session';
const SESSION_MAX_AGE_MS = 60 * 60 * 24 * 5 * 1000; // 5 days

export async function POST(req: NextRequest) {
  if (!hasAdminCredentials()) {
    return NextResponse.json(
      {
        error:
          'Firebase Admin SDK is not configured. Set GOOGLE_APPLICATION_CREDENTIALS to your service account JSON path in .env.local.',
        code: 'admin_sdk_missing',
      },
      { status: 503 }
    );
  }

  try {
    const authHeader = req.headers.get('Authorization');
    const idToken = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;

    if (!idToken) {
      return NextResponse.json({ error: 'Missing token' }, { status: 401 });
    }

    const auth = getAdminAuth();
    const decoded = await auth.verifyIdToken(idToken);

    if (!isAdminUid(decoded.uid)) {
      return NextResponse.json(
        {
          error: `UID ${decoded.uid} is not listed in ADMIN_UIDS.`,
          code: 'not_authorized',
        },
        { status: 403 }
      );
    }

    await auth.setCustomUserClaims(decoded.uid, { admin: true });

    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn: SESSION_MAX_AGE_MS,
    });

    const response = NextResponse.json({ ok: true, refreshToken: true });
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
    return NextResponse.json(
      {
        error: 'Could not verify token or create session. Check service account permissions.',
        code: 'session_failed',
      },
      { status: 401 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const response = NextResponse.json({ ok: true });

  try {
    const authHeader = req.headers.get('Authorization');
    const idToken = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;

    if (idToken) {
      const decoded = await getAdminAuth().verifyIdToken(idToken);
      await getAdminAuth().setCustomUserClaims(decoded.uid, { admin: false });
    }
  } catch {
    /* ignore */
  }

  response.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  return response;
}
