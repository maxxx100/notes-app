import { createHmac } from 'crypto';
import { cookies } from 'next/headers';

export const SESSION_COOKIE = 'notes_session';

// Deterministic token derived from the password — no server-side state needed.
export function makeToken(): string {
  const secret = process.env.NOTES_PASSWORD ?? '';
  return createHmac('sha256', secret).update('notes-v1').digest('hex');
}

export async function isAuthorized(): Promise<boolean> {
  if (!process.env.NOTES_PASSWORD) return false;
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  return !!token && token === makeToken();
}
