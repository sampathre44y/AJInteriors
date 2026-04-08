import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { readFileSync } from 'fs';

const config = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app);

async function test() {
  try {
    console.log('Testing projects...');
    await getDocs(collection(db, 'projects'));
    console.log('Projects OK');
  } catch (e) {
    console.error('Projects Error:', e.message);
  }
  try {
    console.log('Testing team...');
    await getDocs(collection(db, 'team'));
    console.log('Team OK');
  } catch (e) {
    console.error('Team Error:', e.message);
  }
  process.exit(0);
}
test();
