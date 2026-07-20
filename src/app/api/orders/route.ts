import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get('customerId');
  const db = await readDb();
  
  if (!db) return NextResponse.json({ error: 'Database error' }, { status: 500 });
  
  if (customerId) {
    const orders = db.orders.filter((o: any) => o.customerId === customerId);
    // Sort descending by date
    orders.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return NextResponse.json(orders);
  }
  
  // Sort descending by date for all orders
  const allOrders = [...db.orders].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return NextResponse.json(allOrders);
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const db = await readDb();
    
    if (!db) return NextResponse.json({ error: 'Database error' }, { status: 500 });
    
    const orderId = `ORD_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    let fileUrl = null;

    if (data.fileBase64 && data.sampleFileName) {
      const base64Data = data.fileBase64.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      const safeFilename = data.sampleFileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `${orderId}_${safeFilename}`;
      const filepath = path.join(process.cwd(), 'public', 'uploads', filename);
      await fs.writeFile(filepath, buffer);
      fileUrl = `/uploads/${filename}`;
    }

    const newOrder = { 
      id: orderId,
      ...data,
      fileUrl,
      fileBase64: undefined, // Don't store large base64 string in DB
      status: 'Pending',
      createdAt: new Date().toISOString()
    };
    db.orders.push(newOrder);
    
    await writeDb(db);
    return NextResponse.json(newOrder);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, status } = await request.json();
    const db = await readDb();
    
    if (!db) return NextResponse.json({ error: 'Database error' }, { status: 500 });
    
    const index = db.orders.findIndex((o: any) => o.id === id);
    if (index !== -1) {
      db.orders[index].status = status;
      await writeDb(db);
      return NextResponse.json(db.orders[index]);
    }
    
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
