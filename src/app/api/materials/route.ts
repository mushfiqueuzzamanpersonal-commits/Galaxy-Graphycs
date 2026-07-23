import { NextResponse } from 'next/server';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get('categoryId');
  
  try {
    const materialsCol = collection(db, 'materials');
    const q = categoryId ? query(materialsCol, where('categoryId', '==', categoryId)) : materialsCol;
    const snapshot = await getDocs(q);
    const materials = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(materials);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { categoryId, name, pricePerSqFt } = await request.json();
    
    const id = `mat_${Date.now()}`;
    const newMaterial = { 
      categoryId, 
      name, 
      pricePerSqFt: Number(pricePerSqFt) 
    };
    
    await setDoc(doc(db, 'materials', id), newMaterial);
    
    return NextResponse.json({ id, ...newMaterial });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, pricePerSqFt } = await request.json();
    
    if (!id) return NextResponse.json({ error: 'Material ID is required' }, { status: 400 });

    const materialRef = doc(db, 'materials', id);
    const updates: any = {};
    if (name) updates.name = name;
    if (pricePerSqFt) updates.pricePerSqFt = Number(pricePerSqFt);
    
    await updateDoc(materialRef, updates);
    
    return NextResponse.json({ id, ...updates });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) return NextResponse.json({ error: 'Material ID is required' }, { status: 400 });

    await deleteDoc(doc(db, 'materials', id));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
