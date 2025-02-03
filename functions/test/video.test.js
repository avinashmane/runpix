/**
 * Online tests
 */



const DEBUG=1
const GS_URL_PREFIX='https://storage.googleapis.com/run-pix.appspot.com/'
const MAX_FILES = 5;
const {cfg,debug} = require ("./commonTest")

const log=(...msg)=> (DEBUG) ? debug(`${new Date().toISOString()}`,...msg) : {}
const JSS=JSON.stringify
const {assert} = require('chai')
const { firebaseConfig } = require('firebase-functions');
const functions = require('firebase-functions');
const { storageBucket } = require('firebase-functions/params');
const test = require('firebase-functions-test')(cfg.firebaseConfig,
    cfg.service_account);

let admin=null,
    app=null;
admin= require('firebase-admin')
app = admin.apps[0] || admin.initializeApp();

const bucketName = 'run-pix-videos'
const bucket = admin.storage().bucket(bucketName)
  
describe('List all video files - not useful', function ( ){


  let filenames=[123,234];

  before(`Before: list files ${bucketName}`,async function (){
    this.timeout(10000)
    return bucket.getFiles().then(data=>{
      const [files] = data
      filenames=files.map(o=>({n:o.name,
                              t:o.metadata.contentType,
                              s:o.metadata.size}))
      log(`${filenames.length} files found`)
      assert(filenames.length>5,'min 5 files found')
      assert.isArray(filenames)
    })
   // 'files' will be an array containing information about each file in the bucket.
  })


  filenames.slice(0,MAX_FILES).forEach(function (file){
    // log(file)
      it(`log test ${file}`, function () {
        log(`file ${file}`)
    })

  })

  it('dummy', function () {
    // this.skip()
    log('Files:',filenames );
    // filenames.forEach(console.warn)
    assert.equal(1,1)
  })

})


describe('OCR video basic tests', function () {

  var indexModule = require('../index.js'); // Works for both ESM and CommonJS
  var videocrModule = require('../videoocr.js'); // Works for both ESM and CommonJS
  this.timeout(20000); 
  
  before(function () {

    // testModule = require("../index.js")
    // log("before", testModule,testModule.value )
  });

  it('indexModule.scanVideo() mp4',async function (){
    
    return indexModule.scanVideo('gs://run-pix.appspot.com/uploadvid/testrun/20230305_072443_cf4cc23.mp4').then(x=>{
      log('scanVideo()',x);
      
    })
    .catch(console.error)
    
    // testModule.detectText('gs://run-pix-videos/test/VID_20240310_074051.mp4')
  })

  it('indexModule.scanVideo() laptop webm',async function (){
    // indexModule.scanVideo('gs://run-pix-videos/test/VID_20240310_074051.mp4').then(x=>{
    return indexModule.scanVideo('gs://run-pix.appspot.com/uploadvid/testrun/2024-05-08T04:00:12.112Z~VENUE~userData.email~vid_0.webm').then(x=>{
      log('scanVideo()',x);
    })
    .catch(console.error)
    
    // testModule.detectText('gs://run-pix-videos/test/VID_20240310_074051.mp4')
  })
  

  it('indexModule.scanVideo() mobile MI12pro webm',async function (){
    // indexModule.scanVideo('gs://run-pix-videos/test/VID_20240310_074051.mp4').then(x=>{
    return indexModule.scanVideo('gs://run-pix.appspot.com/uploadvid/testrun/2024-05-08T06:10:08.601Z~VENUE~avinashmane$gmail.com~vid_0.webm').then(x=>{
      log('scanVideo()',x);
    })
    .catch(console.error)
    
    // testModule.detectText('gs://run-pix-videos/test/VID_20240310_074051.mp4')
  })
  xit('indexModule.getImageMetadata()',async function () {
    indexModule.getImageMetadata('gs://run-pix-videos','test/VID_20240310_074051.mp4')
    .then(res=>{
      log(res);
      assert.isObject(res)
    })
    .catch(console.error)

  })

  it('indexModule.readFile+videocrModule.videoDetectionFilter',async function (){
      // videocr.
      let res=JSON.parse(await indexModule.readFile('test/out/textAnnotations.json'))
      log(videocrModule.videoDetectionFilter(res.textAnnotations))
      // testModule.detectText('gs://run-pix-videos/test/VID_20240310_074051.mp4')
  })
})

/**
 * MOCK Run processing
 */
describe('MOCK run race-vid2firestore mychoice25jan', function () {
  var indexModule = require('../index.js'); // Works for both ESM and CommonJS
  var videocrModule = require('../videoocr.js'); // Works for both ESM and CommonJS
  this.timeout(100000); 
  const prefix='gs://run-pix.appspot.com/uploadvid/mychoice25jan'
  const filenames=`2025-01-12T02:18:45.249Z~VENUE~undefined~VID_20250112_074842.mp4
  2025-01-12T02:20:24.297Z~VENUE~undefined~VID_20250112_075021.mp4
  2025-01-12T02:20:47.621Z~VENUE~undefined~VID_20250112_075044.mp4
  2025-01-12T02:21:57.601Z~VENUE~undefined~VID_20250112_075153.mp4
  2025-01-12T02:25:49.835Z~VENUE~undefined~VID_20250112_075546.mp4`.split('\n').map(x=>`${prefix}/${x.trim()}`)
  const selectedFiles=filenames//.slice(0,2)

  before(function () {
    optionBackup = process.env.RUNTIME_OPTION
    process.env.DEBUG_MODE=3
    log("total files: ", selectedFiles.length )
  });

  after(() => {
    // Do cleanup tasks.
    debug("cleaning up")
    test.cleanup();
    process.env.RUNTIME_OPTION=optionBackup
    // Reset the database.
    // admin.database().ref('messages').remove();
  });

  // for each file
  it(`MOCK pass1 processing {shortFilename}`,async function (done) {
    // log(`scanVideo() ${shortFilename}`)
    selectedFiles.forEach(async function (file){
        let shortFilename = file.split("/").pop()
        log(`scanVideo() ${shortFilename}`)
        
        await indexModule.scanVideo(file).then(x=>{
          log(`done scanVideo() ${shortFilename}`)
        
      })
      .catch(console.error)
        
    })
    done()
  })

  it('Create and save annotations from video',async function (done){
    this.skip()
    
    // indexModule.scanVideo('gs://run-pix-videos/test/VID_20240310_074051.mp4').then(x=>{
    indexModule.scanVideo('gs://run-pix.appspot.com/uploadvid/testrun/20230305_072443_cf4cc23.mp4').then(x=>{
      log('scanVideo()',x);
      done()
    })
    .catch(console.error)
    
    // testModule.detectText('gs://run-pix-videos/test/VID_20240310_074051.mp4')
  })

  it('Read metadata from video',async function (done) {
    this.skip()
    indexModule.getImageMetadata('gs://run-pix-videos','test/VID_20240310_074051.mp4')
    .then(res=>{
      log(res);
      done()
    })
    .catch(console.error)

  })

  it('Read firestore',async function (){
    this.skip()
    
    let res=JSON.parse(await indexModule.readFile('test/out/textAnnotations.json'))
    log(videocrModule.videoDetectionFilter(res.textAnnotations))
    
  })
})