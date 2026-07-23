import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";
import fs from 'fs';

async function run() {
  const envFile = fs.readFileSync('.env.local', 'utf8');
  envFile.split('\n').forEach(line => {
    if (line.startsWith('NEXT_PUBLIC_FIREBASE_')) {
      const parts = line.split('=');
      const key = parts[0];
      let value = parts.slice(1).join('=');
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  });

  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
  };

  const app = initializeApp(firebaseConfig);
  const storage = getStorage(app);

  const storageRef = ref(storage, 'test-upload.txt');
  try {
    await uploadString(storageRef, 'Hello Firebase Storage', 'raw');
    const url = await getDownloadURL(storageRef);
    console.log("Success! URL:", url);
  } catch (err) {
    console.error("Firebase Storage Error:", err);
  }
}

run();
