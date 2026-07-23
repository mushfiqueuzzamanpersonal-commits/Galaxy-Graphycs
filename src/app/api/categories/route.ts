import { NextResponse } from 'next/server';
import { collection, addDoc, getDocs, doc, deleteDoc, setDoc, query, where, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET() {
  try {
    const snapshot = await getDocs(collection(db, 'categories'));
    const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(categories);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    
    const id = `cat_${Date.now()}`;
    const newCategory = { name };
    
    await setDoc(doc(db, 'categories', id), newCategory);
    
    return NextResponse.json({ id, ...newCategory });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });

    // First delete the category
    await deleteDoc(doc(db, 'categories', id));
    
    // Then optionally delete all associated materials
    try {
      const materialsQuery = query(collection(db, 'materials'), where('categoryId', '==', id));
      const snapshot = await getDocs(materialsQuery);
      
      const batch = writeBatch(db);
      snapshot.docs.forEach((materialDoc) => {
        batch.delete(materialDoc.ref);
      });
      await batch.commit();
    } catch (e) {
      console.warn("Failed to delete associated materials", e);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
