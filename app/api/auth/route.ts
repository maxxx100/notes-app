import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE, makeToken, isAuthorized } from '@/lib/auth';

export async function GET() {
  return NextResponse.json({ ok: await isAuthorized() });
}

export async function POST(request: Request) {
  const { password } = await request.json();

  if (!process.env.NOTES_PASSWORD) {
    return NextResponse.json({ ok: false, error: 'NOTES_PASSWORD is not configured' }, { status: 500 });
  }
  if (password !== process.env.NOTES_PASSWORD) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const store = await cookies();
  store.set(SESSION_COOKIE, makeToken(), {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    // No maxAge → expires when the browser session ends
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  return NextResponse.json({ ok: true });
}
