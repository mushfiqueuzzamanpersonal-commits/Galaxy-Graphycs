import { NextResponse } from 'next/server';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    const usersCol = collection(db, 'users');
    const q = query(usersCol, where('email', '==', email), where('password', '==', password));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // In a real app, you would create a session/JWT here
      // For this demo, we'll just return the user info
      const userDoc = querySnapshot.docs[0];
      const user = { id: userDoc.id, ...userDoc.data() } as any;
      const { password: _, ...userInfo } = user;
      return NextResponse.json({ user: userInfo });
    } else {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
