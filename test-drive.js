const { google } = require('googleapis');
const { Readable } = require('stream');
const fs = require('fs');

async function testUpload() {
  const envFile = fs.readFileSync('.env.local', 'utf8');
  envFile.split('\n').forEach(line => {
    if (line.startsWith('GOOGLE_')) {
      const parts = line.split('=');
      const key = parts[0];
      let value = parts.slice(1).join('=');
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  });

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });

  const drive = google.drive({ version: 'v3', auth });
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  const fileMetadata = {
    name: 'test_upload.txt',
    parents: folderId ? [folderId] : undefined,
  };

  const media = {
    mimeType: 'text/plain',
    body: Readable.from(Buffer.from('Hello, Google Drive!')),
  };

  try {
    console.log('Attempting upload to folder:', folderId);
    const file = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink, webContentLink',
    });

    console.log('Upload successful! File ID:', file.data.id);
    
    // Clean up
    await drive.files.delete({ fileId: file.data.id });
    console.log('Cleanup successful.');
  } catch (err) {
    console.error("Drive Upload Error:", err.message, err.response?.data);
  }
}

testUpload();
