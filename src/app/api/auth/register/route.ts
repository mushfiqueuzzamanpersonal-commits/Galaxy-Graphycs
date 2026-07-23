import { NextResponse } from 'next/server';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();
    
    const usersCol = collection(db, 'users');
    const q = query(usersCol, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const id = Date.now().toString();
    const newUser = {
      name,
      email,
      password, // Should be hashed in a real app
      role: 'customer' // Default role for new registrations
    };

    await setDoc(doc(db, 'users', id), newUser);

    const { password: _, ...userInfo } = newUser;
    return NextResponse.json({ user: { id, ...userInfo } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
