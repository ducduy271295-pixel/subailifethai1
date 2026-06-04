import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-storage.js';

export const ADMIN_EMAIL = 'ducduy271295@gmail.com';

const firebaseConfig = {
  apiKey: 'AIzaSyB2WEw253DlimzByZUDiv1i-87WqM6InfQ',
  authDomain: 'duyaffiliateglobal.firebaseapp.com',
  projectId: 'duyaffiliateglobal',
  storageBucket: 'duyaffiliateglobal.firebasestorage.app',
  messagingSenderId: '832643984656',
  appId: '1:832643984656:web:c8b56313d5773c4e27c995',
  measurementId: 'G-VVTHRDH4JL'
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
