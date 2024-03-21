/**
 * Check files
 */
import admin from "firebase-admin";
let app={}

app.instance = app.instance||admin.initializeApp();

console.log("Checking files...");


process.argv.forEach(function (arg,i) {
  console.log(i,arg);
});


// Get the database
const db = admin.firestore();

const admin = require('firebase-admin');

admin.initializeApp({
  // Your Firebase project configuration
});

const db = admin.firestore();

async function listFirestoreData(collectionName) {
  const colRef = db.collection(collectionName);
  const docs = await colRef.get();

  const data = [];
  docs.forEach((doc) => {
    data.push(doc.data());
  });

  return data;
}

// Example usage
listFirestoreData("users")
  .then((data) => {
    console.log("Firestore data:", data);
  })
  .catch((error) => {
    console.error("Error fetching data:", error);
  });