/**
 * Online tests
 */
const {cfg,debug,projroot} = require ("./commonTest")

const GS_URL_PREFIX='https://storage.googleapis.com/run-pix.appspot.com/'
const {assert} = require('chai')

const functions = require('firebase-functions');
const { storageBucket } = require('firebase-functions/params');
const test = require('firebase-functions-test')(cfg.firebaseConfig,
    cfg.service_account);

// Mock functions config values
// test.mockConfig(config);//{ stripe: { key: '23wr42ewr34' }}
// const key = functions.config().stripe.key;
  
config=cfg.firebaseConfig
// after firebase-functions-test has been initialized
describe('index.test.js', function () {
  let myFunctions,
      optionBackup;
  
  this.timeout(40000); // A very long environment setup.
    
  before(function () {
    //save old settings
    optionBackup = process.env.RUNTIME_OPTION
    // disable image recognition
    process.env.RUNTIME_OPTION=JSON.stringify({
      ScanImages: {
        vision: false,
        disabled : false
      }
    })
    process.env.DEBUG_MODE=3
    
    myFunctions= require('../index.js')
    
    debug(`Functions available :>>`,Object.keys(myFunctions))
    
  });

  after(function () {
    // Do cleanup tasks.
    debug("cleaning up")
    test.cleanup();
    process.env.RUNTIME_OPTION=optionBackup
    // Reset the database.
    // admin.database().ref('messages').remove();
  });

  describe('storage_ScanImages_tests', function () {
    // set the bucket
    it("ScanImages defined?",function (){

      assert.isDefined(myFunctions)
    })

    it('ScanImages_JPG image',  function () {
      this.timeout(20000); // A very long environment setup.
      process.env.RUNTIME_OPTION=JSON.stringify({scanImages:{vision:false}})

      // Wrap the makeUppercase function
      // myFunctions.storage.bucket(config.storageBucket);
      const wrapped = test.wrap(myFunctions.ScanImages);
      const data_JPEG = {bucket: config.storageBucket,
                  name: 'uploads/mychoice23jul/2023-07-09T04:53:45.692Z~VENUE~jparagj$gmail.com~1P6A7097.jpg', 
                  // name: 'uploads/lsom23jun/2023-06-27T11:17:58.853Z~VENUE~vishal64049$gmail.com~IMG_1736.JPG',
                  // name: 'uploads/testrun/2023-03-12T02:28:48.000Z~VENUE~avinashmane$gmail.com~20230312_075846.jpg',
                  // name:'uploads/mychoice23mar/2023-03-15T10:32:48.483381~general~bcoconut~DSC_0466.jpg',
                  // name:'uploads/werun2023/2023-03-13T14:28:45.900378~general~vaibhav~S_G01851.jpg', 
                  // name:'uploads/werun2023/2023-03-13T19:25:41.041091~general~vaibhav~_L3A3047.jpg',
                  //  name:'uploads/mychoice23feb/2023-02-12T01:26:04.364Z^venue^avinashmane$gmail.com^20230212_065602.jpg',
                  //  name:'uploads/mychoice23feb/2023-02-12T01:28:29.364Z^venue^avinashmane$gmail.com^20230212_065828.jpg',
                   contentType: 'image/jpeg'};
                  //  https://storage.googleapis.com/run-pix.appspot.com/uploads/mychoice23mar/2022-01-13T12%3A23%3A36.476Z%5Estart%5Eavinashmane%40gmail.com%5E9955-3Certificate.png             
      wrapped(data_JPEG)

    })

    it('ScanImages_MP4 video', function () {
      this.timeout(90000); // A very long environment setup.
      // process.env.RUNTIME_OPTION=JSON.stringify({scanImages:{vision:false}})

      const wrapped = test.wrap(myFunctions.ScanImages);
      const blob = {bucket: config.storageBucket,
        name: 'uploads/testrun/2024-06-10T13:03:05.743Z~VENUE~avinashmane$gmail.com~1000046782.mp4', 
        // name: 'uploads/testrun/2021-01-07T11:38:51.535Z~VENUE~avinashmane$gmail.com~Img 0060-1.m4v', 
                   contentType: 'video/mp4'};
                  //  https://storage.googleapis.com/run-pix.appspot.com/uploads/mychoice23mar/2022-01-13T12%3A23%3A36.476Z%5Estart%5Eavinashmane%40gmail.com%5E9955-3Certificate.png             
      return wrapped(blob).then(debug)
      
    })


    it('ScanImages PNG image', function () {
      this.timeout(20000); // A very long environment setup.
      process.env.RUNTIME_OPTION=JSON.stringify({scanImages:{vision:false}})
      
      // Wrap the makeUppercase function
      // myFunctions.storage.bucket(config.storageBucket);
      const wrapped = test.wrap(myFunctions.ScanImages);
      const data_PNG = {bucket:config.storageBucket,
                      // name:'test/V4AFod9aCoRsEP62GnVm0gPYxXK2/2023-01-27T11:31:41.796Z.png',
                      // name:'uploads/mychoice23mar/2022-01-13T12:23:36.476Z^start^avinashmane$gmail.com^9955-3Certificate.png ',
                      name: 'uploads/mychoice23mar/2023-03-14T13:01:08.206Z^venue^avinashmane$gmail.com^capture.png',
                      contentType: 'image/png'};// PNG captured for the stream

      return wrapped(data_PNG)
      
    })
    it('ScanImages_reprocess image', function () {
      this.timeout(20000); // A very long environment setup.
      process.env.RUNTIME_OPTION=JSON.stringify({scanImages:{vision:false}})

      // Wrap the makeUppercase function
      // myFunctions.storage.bucket(config.storageBucket);
      const wrapped = test.wrap(myFunctions.ScanImages);
      const data_JPEG = {bucket: config.storageBucket,
                  name: 'uploads/werun2024/2024-03-17T05:49:48.000Z~VENUE~avinashmane$gmail.com~1Z2A2506.jpg', 
                   contentType: 'image/jpeg'};
      wrapped(data_JPEG)

    })


    it('Process the EXIF rotation image', async function () {
      this.timeout(20000); // A very long environment setup.
    
      const data_JPEG = {bucket: config.storageBucket,
                  name:'uploads/mychoice23apr/2023-04-01T12:21:36.426Z~venue~avinashmane$gmail.com~20230401_175132.jpg',
                   contentType: 'image/jpeg'};
                  //  https://storage.googleapis.com/run-pix.appspot.com/uploads/mychoice23mar/2022-01-13T12%3A23%3A36.476Z%5Estart%5Eavinashmane%40gmail.com%5E9955-3Certificate.png             

      openURI(GS_URL_PREFIX+data_JPEG.name)

      const wrapped = test.wrap(myFunctions.ScanImages);
      await wrapped(data_JPEG)
      openURI(GS_URL_PREFIX+data_JPEG.name.replace("uploads","processed"))
      return 
    })

  });

  describe('firestore_imageUpdate_tests', function () {
    // Test Case: setting messages/11111/original to 'input' should cause 'INPUT' to be written to
    // messages/11111/uppercase
    xit('should process logical deletion of images', function () {
      // [START assertOnline]
      // Create a DataSnapshot with the value 'input' and the reference path 'messages/11111/original'.
      fsPath='/races/mychoice23apr/images/2022-12-08T07:41:48.652Z~venue~avinashmane$gmail.com~Screenshot 2022-12-08 at 13-11-41 Athlete Heatmaps Strava.png'
      // const snap = test.firestore.makeDocumentSnapshot({disable:new Date().toLocaleString()}, fsPath);
      // Make snapshot for state of database beforehand
      const beforeSnap = test.firestore.makeDocumentSnapshot({foo: 'bar'}, fsPath);
      // Make snapshot for state of database after the change
      const afterSnap = test.firestore.makeDocumentSnapshot({foo: 'faz'}, fsPath);
      const changeReq = test.makeChange(beforeSnap, afterSnap);
      
      // Wrap the makeUppercase function
      const wrapped = test.wrap(myFunctions.imageUpdate);
      // Call the wrapped function with the snapshot you constructed.
      let {change, context} = wrapped(changeReq)
      if( change.before.exists) 
        debug("before",change.before.data())
      if( change.after.exists) 
        debug("after",change.after.data())

      debug("104>>>>>>",context)
      return 
    })
  });


})

function openURI (URI) {
  var start = (process.platform == 'darwin'? 'open': process.platform == 'win32'? 'start': 'xdg-open');
  // require('child_process').exec(start + ' ' + URI);
}                                  
// Invoke the wrapped function without specifying the event context.

// myFunctions.ScanImages({},{params:data_JPEG})
// wrapped(data_PNG);
// after firebase-functions-test has been initialized
describe('general_tests', function () {
  it("timeout",async function () {
    debug("started",now())
    await sleep(1500,console.warn,"sleep complete")
    debug("ended",now())

  })
})

now=()=>new Date().toISOString()

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function sleep(secs,fn, ...args) {
  await timeout(secs);
  return fn(...args);
}


// let admin=null
// describe('List all video files', function ( ){
//   admin= admin ||  require('firebase-admin')
//   const bucketName = 'run-pix-videos'
//   const bucket = admin.storage().bucket(bucketName)
//   let filenames=[];

//   before('Before: list files',async function (done){
//     const [files] = await bucket.getFiles();
//     filenames=files.map(o=>o.name)
//     // 'files' will be an array containing information about each file in the bucket.
//     debug('Files:', );
//     done()
//     // debugger
//     return true
//   })

//   filenames.forEach(function (x){
//     it('processing ${x}',function () {
//       debug(`file ${x}`)
//     })
//   })

// })


// describe('OCR video test suite', function () {
  
//   var indexModule = require('../index.js'); // Works for both ESM and CommonJS
//   var videocrModule = require('../videoocr.js'); // Works for both ESM and CommonJS
//   this.timeout(5000); 

//   before(function () {
//     // testModule = require("../index.js")
//     // debug("before", testModule,testModule.value )
//   });

//   it('Create and save annotations from video',async function (done){
//     this.skip()
    
//     indexModule.scanVideo('gs://run-pix-videos/test/VID_20240310_074051.mp4').then(x=>{
//       debug('scanVideo()',x);
//       done()
//     })
//     .catch(console.error)
    
//     // testModule.detectText('gs://run-pix-videos/test/VID_20240310_074051.mp4')
//   })

//   it('Read metadata from video',async function (done) {
//     this.skip()
//     indexModule.getImageMetadata('gs://run-pix-videos','test/VID_20240310_074051.mp4')
//     .then(res=>{
//       debug(res);
//       done()
//     })
//     .catch(console.error)

//   })

//   it('Read annotations',async function (){
//       // videocr.
//       let res=JSON.parse(await indexModule.readFile('test/out/textAnnotations.json'))
//       debug(videocrModule.videoDetectionFilter(res.textAnnotations))
//       // testModule.detectText('gs://run-pix-videos/test/VID_20240310_074051.mp4')
//   })
// })
