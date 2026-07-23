import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fileUrl = searchParams.get('fileUrl');
  const orderId = searchParams.get('orderId');

  if (!fileUrl) {
    return NextResponse.json({ error: 'File URL is required' }, { status: 400 });
  }

  try {
    const filename = fileUrl.split('/').pop();
    if (!filename) {
      return NextResponse.json({ error: 'Invalid file URL' }, { status: 400 });
    }

    const filepath = path.join(process.cwd(), 'public', 'uploads', filename);
    
    // Read the file
    let fileBuffer;
    let fallbackRedirect = false;
    try {
      fileBuffer = await fs.readFile(filepath);
    } catch (e) {
      console.warn("Local file read failed, falling back to redirect. Path:", filepath);
      fallbackRedirect = true;
    }
    
    // Delete the file locally if it exists
    if (!fallbackRedirect) {
      try {
        await fs.unlink(filepath);
      } catch (e) {
        console.error("Failed to delete file:", e);
      }
    }

    // If orderId is provided, remove fileUrl from order so it won't be shown anymore
    if (orderId) {
      try {
        const orderRef = doc(db, 'orders', orderId);
        await updateDoc(orderRef, { fileUrl: null });
      } catch (e) {
        console.error("Failed to update order:", e);
      }
    }

    if (fallbackRedirect) {
      return NextResponse.redirect(new URL(fileUrl, request.url));
    }

    // Determine content type
    const ext = path.extname(filename).toLowerCase();
    const contentType = ext === '.pdf' ? 'application/pdf' : 
                        ext === '.png' ? 'image/png' : 
                        ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 
                        'application/octet-stream';

    // Return the file for download
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
