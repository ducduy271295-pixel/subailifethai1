import { collection, getDocs, setDoc, deleteDoc, doc } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js';
import { db } from './firebase-config.js';

export async function getDBData(collectionName) {
  const snapshot = await getDocs(collection(db, collectionName));
  return snapshot.docs.map((item) => item.data());
}

export async function saveDBData(collectionName, data) {
  if (!data?.id) throw new Error('Missing document id');
  await setDoc(doc(db, collectionName, data.id), data, { merge: true });
}

export async function deleteDBData(collectionName, id) {
  await deleteDoc(doc(db, collectionName, id));
}
