import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  const notes = db.prepare('SELECT * FROM notes ORDER BY created_at DESC').all();
  return NextResponse.json(notes);
}

export async function POST(request: Request) {
  const { title, body, color } = await request.json();
  const result = db
    .prepare('INSERT INTO notes (title, body, color) VALUES (?, ?, ?)')
    .run(title ?? '', body ?? '', color ?? 'sand');
  const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(result.lastInsertRowid);
  return NextResponse.json(note, { status: 201 });
}
