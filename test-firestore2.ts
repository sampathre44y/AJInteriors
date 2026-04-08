import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { readFileSync } from 'fs';

const config = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app);

async function test() {
  try {
    console.log('Testing random collection...');
    await getDocs(collection(db, 'random_test_collection_123'));
    console.log('Random collection OK (Rules are completely open)');
  } catch (e) {
    console.error('Random collection Error:', e.message);
  }
  process.exit(0);
}
test();
