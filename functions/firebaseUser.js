/**
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

const admin = require('firebase-admin');
const cookieParser = require('cookie-parser')();
const functions = require('firebase-functions');
const { error } = require("./utils");
const { cleanForFS, log, debug } = require("./utils");

// Express middleware that checks if a Firebase ID Tokens is passed in the `Authorization` HTTP
// header or the `__session` cookie and decodes it.
// The Firebase ID token needs to be passed as a Bearer token in the Authorization HTTP header like this:
// `Authorization: Bearer <Firebase ID Token>`.
// When decoded successfully, the ID Token content will be added as `req.user`.
async function validateFirebaseIdToken(req, res, next) {
  functions.logger.log('Check if request is authorized with Firebase ID token');

  const idToken = await getIdTokenFromRequest(req, res);
  if (idToken) {
    await addDecodedIdTokenToRequest(idToken, req);
  }
  next();
}

/**
 * Returns a Promise with the Firebase ID Token if found in the Authorization or the __session cookie.
 */
function getIdTokenFromRequest(req, res) {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    functions.logger.log('Found "Authorization" header');
    // Read the ID Token from the Authorization header.
    return Promise.resolve(req.headers.authorization.split('Bearer ')[1]);
  }
  return new Promise((resolve, reject) => {
    cookieParser(req, res, () => {
      if (req.cookies && req.cookies.__session) {
        functions.logger.log('Found "__session" cookie');
        // Read the ID Token from cookie.
        resolve(req.cookies.__session);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Returns a Promise with the Decoded ID Token and adds it to req.user.
 */
async function addDecodedIdTokenToRequest(idToken, req) {
  try {
    const decodedIdToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedIdToken;
    functions.logger.log('ID Token correctly decoded', decodedIdToken);
  } catch (error) {
    functions.logger.error('Error while verifying Firebase ID token:', error);
  }
}

class Firestore {
  cfg = {}

  constructor() {
    if (!admin.apps.length)
      admin.initializeApp()
    this.firestore = admin.firestore()
    this.firestore.settings({ ignoreUndefinedProperties: true });
    this.firestore.doc('app/config').onSnapshot(snap => this.cfg = snap.data());

    this.storage = admin.storage()

  }
  col = (path) => this.firestore.doc(path)
  /** read data /w callback */
  doc = (path) => this.firestore.doc(path)

  get = (path, callback) => this.doc(path).get()
    .then(x => callback(x.data()))

  getCol = (path, callback) => this.firestore.collection(path).get()
    .then(snap => {
      let arr = []
      snap.forEach(doc => arr.push(callback(doc)))
      return arr;
    })
}

let firestore_ = new Firestore()
exports.firestore = firestore_

exports.validateFirebaseIdToken = validateFirebaseIdToken;

async function firebaseGet(path) {
  var docRef = firestore_.doc(path);
  return docRef.get().then((doc) => {
    if (doc.exists) {
      return doc.data();
    } else {
      // doc.data() will be undefined in this case
      error(`No document at ${path}`);
    }
  }).catch((error) => {
    error("Error getting document:", error);
  });
}
async function updFSImageData(raceId, imagePath, detections, texts, exifdata) {
  debug(`writing to firestore ${imagePath}`);
  // return await admin.firestore()
  //               .collection('races').doc(raceId)
  //               .collection('images').doc(imagePath).
  return await firestore.doc(`races/${raceId}/images/${imagePath}`).
    set({
      imagePath: imagePath,
      texts: texts,
      timestamp: new Date().toISOString(),
      textAnnotations: detections,
      metadata: exifdata
    });
}
exports.updFSImageData = updFSImageData;


async function updFSReadings(raceId, userId, bibStr, timestamp, score,
  waypoint, attrs, fileName) {

  let x = await admin.firestore()
    .collection('races').doc(cleanForFS(raceId))
    .collection("readings").doc(cleanForFS([timestamp, bibStr].join("_")))
    .set({
      bib: bibStr,
      userId: userId,
      imagePath: fileName,
      waypoint: waypoint,
      // latlng: new admin.firestore.GeoPoint(parseFloat(latitude), parseFloat(longitude)),
      timestamp: timestamp,
      score: score
    })
    .then((x) => {
      log({
        bib: bibStr,
        userId: userId,
        imagePath: fileName,
        waypoint: waypoint,
        // latlng: new admin.firestore.GeoPoint(parseFloat(latitude), parseFloat(longitude)),
        timestamp: timestamp,
        score: score
      });
      return x;
    })
    .catch((error) => {
      error("Error writing document: ", error);
      return error;
    });
  // log(x)
}
exports.updFSReadings = updFSReadings;

async function delFSReadings(raceId, bibStr, timestamp) {

  let x = await admin.firestore()
    .collection('races').doc(cleanForFS(raceId))
    .collection("readings").doc(cleanForFS([timestamp, bibStr].join("_")))
    .delete()
    .then((x) => {
      log({
        op: "delete",
        bib: bibStr,
        timestamp: timestamp,
      });
      return x;
    })
    .catch((error) => {
      error("Error deleting document: ", error);
      return error;
    });
}
exports.delFSReadings = delFSReadings;

async function updFSVideoData(raceId, videoPath, detections, timestamp, waypoint, metadata) {
  let payload = {
    videoPath: videoPath,
    textAnnotations: detections,
    waypoint: waypoint,
    timestamp: timestamp || new Date().toISOString()
  };

  if (metadata)
    payload.metadata = metadata;

  debug(`writing to firestore ${videoPath}`);

  return await admin.firestore()
    .collection('races').doc(raceId)
    .collection('videos').doc(videoPath)
    .set(payload)
    .catch(console.error);

}
exports.updFSVideoData = updFSVideoData;


