import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();
    const db = await readDb();

    if (!db) {
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (db.users.find((u: any) => u.email === email)) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password, // Should be hashed in a real app
      role: 'customer' // Default role for new registrations
    };

    db.users.push(newUser);
    const success = await writeDb(db);

    if (success) {
      const { password: _, ...userInfo } = newUser;
      return NextResponse.json({ user: userInfo });
    } else {
      return NextResponse.json({ error: 'Failed to save user' }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
