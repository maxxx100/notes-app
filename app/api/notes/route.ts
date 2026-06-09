import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  const notes = await sql`SELECT * FROM notes ORDER BY created_at DESC`;
  return NextResponse.json(notes);
}

export async function POST(request: Request) {
  const { title, body, color } = await request.json();
  const [note] = await sql`
    INSERT INTO notes (title, body, color)
    VALUES (${title ?? ''}, ${body ?? ''}, ${color ?? 'sand'})
    RETURNING *
  `;
  return NextResponse.json(note, { status: 201 });
}
