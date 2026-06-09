import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { isAuthorized } from '@/lib/auth';

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  if (!await isAuthorized()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  const { title, body, color } = await request.json();
  const [note] = await sql`
    UPDATE notes SET title = ${title}, body = ${body}, color = ${color}
    WHERE id = ${parseInt(id, 10)}
    RETURNING *
  `;
  if (!note) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(note);
}

export async function DELETE(_request: Request, { params }: Params) {
  if (!await isAuthorized()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  const deleted = await sql`
    DELETE FROM notes WHERE id = ${parseInt(id, 10)} RETURNING id
  `;
  if (deleted.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return new NextResponse(null, { status: 204 });
}
