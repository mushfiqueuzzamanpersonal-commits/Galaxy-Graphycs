import fs from 'fs/promises';
import path from 'path';

const dbFilePath = path.join(process.cwd(), 'db.json');

export async function readDb() {
  try {
    const data = await fs.readFile(dbFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading database:", error);
    return null;
  }
}

export async function writeDb(data: any) {
  try {
    await fs.writeFile(dbFilePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error("Error writing database:", error);
    return false;
  }
}
