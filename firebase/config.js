import { initializeApp } from 'firebase/app'
import { getAuth, } from 'firebase/auth'
import { getFirestore, doc ,getDoc   } from "firebase/firestore"; 
import { getStorage } from "firebase/storage"
import { config } from '../src/config';

const firebaseConfig = {
    apiKey: `${import.meta.env.VITE_API_KEY}`,
    authDomain: `${import.meta.env.VITE_AUTH_DOMAIN}`,
    projectId: `${import.meta.env.VITE_PROJECT_ID}`,
    storageBucket: `${import.meta.env.VITE_STORAGE_BUCKET}`,
    messagingSenderId: `${import.meta.env.VITE_MESSAGING_SENDER_ID}`,
    appId: `${import.meta.env.VITE_APP_ID}`,
    measurementId: `${import.meta.env.VITE_MEASUREMENT_ID}`
}

if (import.meta.dev) console.log(firebaseConfig)

initializeApp(firebaseConfig)
const firebaseAuth = getAuth()
// connectAuthEmulator(firebaseAuth, "http://localhost:5000");


const db = getFirestore()
const storage = getStorage()
// console.debug('firebaseAuth', firebaseAuth)

export { firebaseAuth, db, storage }
