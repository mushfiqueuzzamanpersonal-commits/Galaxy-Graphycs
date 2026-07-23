import { NextResponse } from 'next/server';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get('customerId');
  
  try {
    const ordersCol = collection(db, 'orders');
    const q = customerId ? query(ordersCol, where('customerId', '==', customerId)) : ordersCol;
    const querySnapshot = await getDocs(q);
    const orders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Sort descending by date
    orders.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (!customerId) {
      // Need to fetch user emails for admin panel
      const usersCol = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCol);
      const usersMap: any = {};
      usersSnapshot.docs.forEach(doc => {
        usersMap[doc.id] = doc.data().email || 'Unknown';
      });
      
      const ordersWithEmail = orders.map((order: any) => ({
        ...order,
        customerEmail: usersMap[order.customerId] || 'Unknown'
      }));
      return NextResponse.json(ordersWithEmail);
    }

    return NextResponse.json(orders);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    const orderId = `ORD_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    let fileUrl = null;

    if (data.fileBase64 && data.sampleFileName) {
      const safeFilename = data.sampleFileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `${orderId}_${safeFilename}`;

      if (process.env.CLOUDINARY_URL) {
        try {
          const uploadResponse = await cloudinary.uploader.upload(data.fileBase64, {
            folder: 'galaxy_graphycs_orders',
            public_id: filename,
            resource_type: 'auto' // Supports raw files like PDFs or PSDs
          });
          fileUrl = uploadResponse.secure_url;
        } catch (error) {
          console.error("Cloudinary Upload Failed:", error);
          fileUrl = null;
        }
      } else {
        const base64Data = data.fileBase64.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');
        const filepath = path.join(process.cwd(), 'public', 'uploads', filename);
        await fs.writeFile(filepath, buffer).catch(console.error);
        fileUrl = `/uploads/${filename}`;
      }
    }

    delete data.fileBase64; // Don't store large base64 string in DB

    // Remove any potential undefined fields since Firestore rejects them
    Object.keys(data).forEach(key => {
      if (data[key] === undefined) {
        delete data[key];
      }
    });

    const newOrder = { 
      ...data,
      fileUrl,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };
    
    await setDoc(doc(db, 'orders', orderId), newOrder);
    
    return NextResponse.json({ id: orderId, ...newOrder });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, status } = await request.json();
    
    if (!id) return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });

    const orderRef = doc(db, 'orders', id);
    await updateDoc(orderRef, { status });
    
    return NextResponse.json({ id, status });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });

    await deleteDoc(doc(db, 'orders', id));
    
    return NextResponse.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
