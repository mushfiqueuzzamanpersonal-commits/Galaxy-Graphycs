import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get('categoryId');
  const db = await readDb();
  
  if (!db) return NextResponse.json({ error: 'Database error' }, { status: 500 });
  
  if (categoryId) {
    const materials = db.materials.filter((m: any) => m.categoryId === categoryId);
    return NextResponse.json(materials);
  }
  
  return NextResponse.json(db.materials);
}

export async function POST(request: Request) {
  try {
    const { categoryId, name, pricePerSqFt } = await request.json();
    const db = await readDb();
    
    if (!db) return NextResponse.json({ error: 'Database error' }, { status: 500 });
    
    const newMaterial = { 
      id: `mat_${Date.now()}`, 
      categoryId, 
      name, 
      pricePerSqFt: Number(pricePerSqFt) 
    };
    db.materials.push(newMaterial);
    
    await writeDb(db);
    return NextResponse.json(newMaterial);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, pricePerSqFt } = await request.json();
    const db = await readDb();
    
    if (!db) return NextResponse.json({ error: 'Database error' }, { status: 500 });
    
    const index = db.materials.findIndex((m: any) => m.id === id);
    if (index !== -1) {
      if (name) db.materials[index].name = name;
      if (pricePerSqFt) db.materials[index].pricePerSqFt = Number(pricePerSqFt);
      await writeDb(db);
      return NextResponse.json(db.materials[index]);
    }
    
    return NextResponse.json({ error: 'Material not found' }, { status: 404 });
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
    
    db.materials = db.materials.filter((m: any) => m.id !== id);
    await writeDb(db);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
