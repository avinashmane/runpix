/**
 * firebaseAdmin....should be combined with firebaseUser
 */
'use strict';
const admin = require('firebase-admin');

const JSS = JSON.stringify;
// firestore settor/gettors
const doc = (path) => admin.firestore().doc(path);
exports.doc = doc;
const get = (path, callback) => doc(path).get().then(x => callback(x.data()));
const getCol = (path, callback) => admin.firestore().collection(path).get()
  .then(snap => {
    let arr = [];
    snap.forEach(doc => arr.push(callback(doc)));
    return arr;
  });
exports.getCol = getCol;
// Since this code will be running in the Cloud Functions environment
// we call initialize Firestore without any arguments because it
// detects authentication from the environment.
let cfg;
if (admin.apps.length == 0) {
  admin.initializeApp();
  admin.firestore().settings({ ignoreUndefinedProperties: true });
  admin.firestore().doc('app/config').onSnapshot(snap => cfg = snap.data());
}
