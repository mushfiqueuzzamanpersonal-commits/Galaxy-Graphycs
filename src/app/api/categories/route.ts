import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

export async function GET() {
  const db = await readDb();
  if (!db) return NextResponse.json({ error: 'Database error' }, { status: 500 });
  return NextResponse.json(db.categories);
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    const db = await readDb();
    
    if (!db) return NextResponse.json({ error: 'Database error' }, { status: 500 });
    
    const newCategory = { id: `cat_${Date.now()}`, name };
    db.categories.push(newCategory);
    
    await writeDb(db);
    return NextResponse.json(newCategory);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const db = await readDb();
    
    if (!db) return NextResponse.json({ error: 'Database error' }, { status: 500 });
    
    db.categories = db.categories.filter((c: any) => c.id !== id);
    // Also remove associated materials (optional based on requirements)
    db.materials = db.materials.filter((m: any) => m.categoryId !== id);
    
    await writeDb(db);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
