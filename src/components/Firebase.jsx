// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth }  from "firebase/auth"
import { getStorage } from "firebase/storage"

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBQnx9elB9f9kIxgrPmqJyus1N1M0jkSyY",
  authDomain: "menuscanner-be714.firebaseapp.com",
  databaseURL: "https://menuscanner-be714-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "menuscanner-be714",
  storageBucket: "menuscanner-be714.appspot.com",
  messagingSenderId: "1010500293816",
  appId: "1:1010500293816:web:a4a023e989ee71d1d3d04d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const storage = getStorage(app);
export const db = getDatabase(app);