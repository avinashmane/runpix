// /** https://github.com/firebase/functions-samples/blob/main/quickstarts/uppercase/functions/test/test.online.js
//  * 
// */ 
// // Follow the instructions in uppercase/README.md for running these tests.
// // Visit https://firebase.google.com/docs/functions/unit-testing to learn more
// // about using the `firebase-functions-test` SDK.

// // Chai is a commonly used library for creating unit test suites. It is easily extended with plugins.
// const chai = require('chai');
// const assert = chai.assert;

// // Sinon is a library used for mocking or verifying function calls in JavaScript.
// // const sinon = require('sinon');

// const admin = require('firebase-admin');
// // Require and initialize firebase-functions-test in "online mode" with your project's
// // credentials and service account key.
// const projectId='run-pix'
// const projectConfig={
//     projectId:`${projectId}`,
//     storageBucket: `${projectId}.appspot.com`,
//     databaseURL: `https://${projectId}.firebaseio.com`,
//   }
// const test = require('firebase-functions-test')(projectConfig, 'c:/i/auth/run-pix-092258e3cb1b.json');

// describe('ONLINE: Cloud Functions', () => {
//   let myFunctions;

//   before(() => {
//     // Require index.js and save the exports inside a namespace called myFunctions.
//     // This includes our cloud functions, which can now be accessed at myFunctions.makeUppercase
//     // and myFunctions.addMessage
//     myFunctions = require('../index');
//   });

//   after(() => {
//     // Do cleanup tasks.
//     test.cleanup();
//     // Reset the database.
//     admin.database().ref('messages').remove();
//   });

//   describe('ONLINE: makeUpperCase', () => {
//     // Test Case: setting messages/11111/original to 'input' should cause 'INPUT' to be written to
//     // messages/11111/uppercase
//     it('should upper case input and write it to /uppercase', () => {
//       // [START assertOnline]
//       // Create a DataSnapshot with the value 'input' and the reference path 'messages/11111/original'.
//       const snap = test.database.makeDataSnapshot('input', 'messages/11111/original');

//       // Wrap the makeUppercase function
//       const wrapped = test.wrap(myFunctions.makeUppercase);
//       // Call the wrapped function with the snapshot you constructed.
//       return wrapped(snap).then(() => {
//         // Read the value of the data at messages/11111/uppercase. Because `admin.initializeApp()` is
//         // called in functions/index.js, there's already a Firebase app initialized. Otherwise, add
//         // `admin.initializeApp()` before this line.
//         return admin.database().ref('messages/11111/uppercase').once('value').then((createdSnap) => {
//           // Assert that the value is the uppercased version of our input.
//           assert.equal(createdSnap.val(), 'INPUT');
//         });
//       });
//       // [END assertOnline]
//     })
//   });

//   describe('ONLINE: addMessage', () => {
//     it('should return a 303 redirect', (done) => {
//       // A fake request object, with req.query.text set to 'input'
//       const req = { query: {text: 'input'} };
//       // A fake response object, with a stubbed redirect function which does some assertions
//       const res = {
//         redirect: (code, url) => {
//           // Assert code is 303
//           assert.equal(code, 303);
//           // If the database push is successful, then the URL sent back will have the following format:
//           const expectedRef = new RegExp(projectConfig.databaseURL + '/messages/');
//           assert.isTrue(expectedRef.test(url));
//           done();
//         }
//       };

//       // Invoke addMessage with our fake request and response objects. This will cause the
//       // assertions in the response object to be evaluated.
//       myFunctions.addMessage(req, res);
//     });
//   });
// })