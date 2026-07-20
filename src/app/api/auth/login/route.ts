import { NextResponse } from 'next/server';
import { readDb } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const db = await readDb();

    if (!db) {
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    const user = db.users.find((u: any) => u.email === email && u.password === password);

    if (user) {
      // In a real app, you would create a session/JWT here
      // For this demo, we'll just return the user info
      const { password: _, ...userInfo } = user;
      return NextResponse.json({ user: userInfo });
    } else {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
