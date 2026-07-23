const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, query, orderBy, limit } = require("firebase/firestore");
const fs = require('fs');

async function checkOrders() {
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

  const app = initializeApp({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  });

  const db = getFirestore(app);
  
  const q = query(collection(db, "orders"));
  const snapshot = await getDocs(q);
  
  const orders = snapshot.docs.map(d => ({ id: d.id, fileUrl: d.data().fileUrl, createdAt: d.data().createdAt }));
  orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  console.log("Recent Orders:");
  orders.slice(0, 5).forEach(o => {
    console.log(o.id, "->", o.fileUrl);
  });
}

checkOrders();
