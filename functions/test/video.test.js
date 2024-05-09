/**
 * Online tests
 */


const projectId='run-pix'
const config={
    projectId:`${projectId}`,
    storageBucket: `${projectId}.appspot.com`,
    databaseURL: `https://${projectId}.firebaseio.com`,
  }

const DEBUG=1
const GS_URL_PREFIX='https://storage.googleapis.com/run-pix.appspot.com/'
const MAX_FILES = 5;

const log=(msg)=> (DEBUG) ? console.log(`${new Date().toISOString()} : ${msg}`) : {}
const JSS=JSON.stringify
const {assert} = require('chai')
const { firebaseConfig } = require('firebase-functions');
const functions = require('firebase-functions');
const { storageBucket } = require('firebase-functions/params');
const test = require('firebase-functions-test')(config,
    'c:/i/auth/run-pix-092258e3cb1b.json');

let admin=null,
    app=null;

xdescribe('List all video files - not useful', function ( ){

  admin= admin ||  require('firebase-admin')
  app = app || admin.initializeApp();

  const bucketName = 'run-pix-videos'
  const bucket = admin.storage().bucket(bucketName)

  let filenames=[123,234];

  before(`Before: list files ${bucketName}`,async function (){
    this.timeout(10000)
    return bucket.getFiles().then(data=>{
      const [files] = data
      filenames=files.map(o=>({n:o.name,
                              t:o.metadata.contentType,
                              s:o.metadata.size}))
      console.log(`${filenames.length} files found`)
      assert(filenames.length>5,'min 5 files found')
      assert.isArray(filenames)
    })
   // 'files' will be an array containing information about each file in the bucket.
  })


  filenames.slice(0,MAX_FILES).forEach(function (file){
    // console.log(file)
      it(`log test ${file}`, function () {
        log(`file ${file}`)
    })

  })

  it('dummy', function () {
    // this.skip()
    console.log('Files:',filenames );
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
    // console.log("before", testModule,testModule.value )
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
  it('indexModule.getImageMetadata()',async function () {
    indexModule.getImageMetadata('gs://run-pix-videos','test/VID_20240310_074051.mp4')
    .then(res=>{
      console.log(res);
      assert.isObject(res)
    })
    .catch(console.error)

  })

  it('indexModule.readFile+videocrModule.videoDetectionFilter',async function (){
      // videocr.
      let res=JSON.parse(await indexModule.readFile('test/out/textAnnotations.json'))
      console.log(videocrModule.videoDetectionFilter(res.textAnnotations))
      // testModule.detectText('gs://run-pix-videos/test/VID_20240310_074051.mp4')
  })
})

/**
 * MOCH Run processing
 */
xdescribe('MOCK run race-vid2firestore mychoice24mar', function () {
  var indexModule = require('../index.js'); // Works for both ESM and CommonJS
  var videocrModule = require('../videoocr.js'); // Works for both ESM and CommonJS
  this.timeout(100000); 
  const filenames=`gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_065448.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_065713.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_065843.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_065922.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_070038.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_070118.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_070129.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_070246.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_070310.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_070318.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_070407.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_070430.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_070438.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_070452.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_070511.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_070518.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_070534.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_070538.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_070544.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_070553.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_070634.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_070655.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_070707.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_070714.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_070739.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_070805.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_070822.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_070834.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_070842.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_070847.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_070914.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_070922.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_070944.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_070952.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_071005.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_071023.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_071051.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_071104.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_071111.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_071130.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_071242.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_071309.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_071325.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_071348.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_071420.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_071430.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_071514.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_071536.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_071601.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_071627.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_071705.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_071725.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_071743.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_071748.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_071817.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_071841.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_071933.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_071948.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_072021.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_072041.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_072052.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_072106.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_072146.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_072209.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_072218.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_072239.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_072317.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_072338.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_072423.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_072448.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_072613.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_072626.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_072642.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_072700.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_072703.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_072717.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_072744.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_072831.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_072845.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_072902.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_072910.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_072924.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_072933.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_073048.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_073101.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_073125.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_073206.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_073218.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_073224.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_073432.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_073439.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_073512.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_073626.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_073642.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_073707.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_073820.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_073941.mp4
  gs://run-pix.appspot.com/uploadvid/mychoice24mar/VID_20240310_074051.mp4`.split('\n')
  const selectedFiles=filenames.slice(0,2)

  before(function () {
    optionBackup = process.env.RUNTIME_OPTION
    process.env.DEBUG_MODE=3
    console.log("total files: ", selectedFiles.length )
  });

  after(() => {
    // Do cleanup tasks.
    console.debug("cleaning up")
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
      console.log('scanVideo()',x);
      done()
    })
    .catch(console.error)
    
    // testModule.detectText('gs://run-pix-videos/test/VID_20240310_074051.mp4')
  })

  it('Read metadata from video',async function (done) {
    this.skip()
    indexModule.getImageMetadata('gs://run-pix-videos','test/VID_20240310_074051.mp4')
    .then(res=>{
      console.log(res);
      done()
    })
    .catch(console.error)

  })

  it('Read firestore',async function (){
    this.skip()
    
    let res=JSON.parse(await indexModule.readFile('test/out/textAnnotations.json'))
    console.log(videocrModule.videoDetectionFilter(res.textAnnotations))
    
  })
})