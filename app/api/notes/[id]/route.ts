import { NextResponse } from 'next/server';
import db from '@/lib/db';

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  const { title, body, color } = await request.json();
  const result = db
    .prepare('UPDATE notes SET title = ?, body = ?, color = ? WHERE id = ?')
    .run(title, body, color, id);
  if (result.changes === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(id);
  return NextResponse.json(note);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const result = db.prepare('DELETE FROM notes WHERE id = ?').run(id);
  if (result.changes === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return new NextResponse(null, { status: 204 });
}
