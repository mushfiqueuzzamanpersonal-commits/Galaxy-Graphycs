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
    
    // Let the admin keep the download link until they manually delete it.

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

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fileUrl = searchParams.get('fileUrl');
    const orderId = searchParams.get('orderId');

    if (!fileUrl || !orderId) {
      return NextResponse.json({ error: 'File URL and Order ID are required' }, { status: 400 });
    }

    // 1. Remove from Firebase database
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, { fileUrl: null });

    // 2. Remove from Cloudinary (if applicable)
    if (process.env.CLOUDINARY_URL && fileUrl.includes('cloudinary.com')) {
      const { v2: cloudinary } = await import('cloudinary');
      const filename = fileUrl.split('/').pop();
      if (filename) {
        const baseName = filename.substring(0, filename.lastIndexOf('.')) || filename;
        
        // Cloudinary stores images and raw files differently. We attempt deletion on all likely formats to be safe.
        const imageIdWithExt = `galaxy_graphycs_orders/${filename}`;
        const imageIdWithoutExt = `galaxy_graphycs_orders/${baseName}`;

        await Promise.allSettled([
          cloudinary.uploader.destroy(imageIdWithExt),
          cloudinary.uploader.destroy(imageIdWithoutExt),
          cloudinary.uploader.destroy(imageIdWithExt, { resource_type: 'raw' }),
          cloudinary.uploader.destroy(imageIdWithoutExt, { resource_type: 'raw' })
        ]);
      }
    }

    // 3. Remove local file fallback (if applicable)
    if (!fileUrl.includes('cloudinary.com')) {
      const filename = fileUrl.split('/').pop();
      if (filename) {
        const filepath = path.join(process.cwd(), 'public', 'uploads', filename);
        try {
          const fs = await import('fs/promises');
          await fs.default.unlink(filepath);
        } catch (e) {
          // Ignore if local file doesn't exist
        }
      }
    }

    return NextResponse.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error("Delete Error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
