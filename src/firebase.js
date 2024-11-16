// firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration (thay thế bằng cấu hình của bạn)
const firebaseConfig = {
  apiKey: 'AIzaSyAofBVrkjgPCDt9eisQCT_Dn4t76T1_55k',
  authDomain: 'witcher-sshoes.firebaseapp.com',
  projectId: 'witcher-sshoes',
  storageBucket: 'witcher-sshoes.firebasestorage.app',
  messagingSenderId: '282834722292',
  appId: '1:282834722292:web:cea4bde04ac46e6bb86da1',
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);

// Khởi tạo Firestore
const db = getFirestore(app);

export { db };
