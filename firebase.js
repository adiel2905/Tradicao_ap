import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-app.js";

import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCbycI_cTKnJoEXLBKEbUQnmgo4YDjFS-g",
  authDomain: "tradicao-barbearia-20924.firebaseapp.com",
  projectId: "tradicao-barbearia-20924",
  storageBucket: "tradicao-barbearia-20924.firebasestorage.app",
  messagingSenderId: "906861289624",
  appId: "1:906861289624:web:883b0e20703e10e670f0ed"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export { db };