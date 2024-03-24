import { initializeApp } from 'firebase/app'
import { getAuth,
    // connectAuthEmulator ,initializeAuth, indexedDBLocalPersistence, browserPopupRedirectResolver
 } from 'firebase/auth'
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

initializeApp(firebaseConfig)
const firebaseAuth = getAuth()
// connectAuthEmulator(firebaseAuth, "http://localhost:5000");
// const firebaseAuth = initializeAuth({
//     persistence: indexedDBLocalPersistence,
//     popupRedirectResolver: browserPopupRedirectResolver// No popupRedirectResolver defined
//   })
// debugger;    
const db = getFirestore()
const storage = getStorage()
// console.debug('firebaseAuth', firebaseAuth)
getDoc(doc(db,'app/config'))
                .then(docSnap => {
                    if (docSnap.exists()) {
                        config.app = Object.assign(config.app,docSnap.data())
                        console.log("app/config loaded :"+Object.keys(config.app).length );
                    } else {
                        // doc.data() will be undefined in this case
                        console.log("No app/config");
                    }
                })

export { firebaseAuth, db, storage }
