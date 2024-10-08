/** 
 * Structure 
 * 1 includes
 * 2 configation
 * 3 HTTP triggers: image generator
 * 4 Firestore triggered
 * 5. Storage triggered: Scan images
*/
'use strict';
/* ~~~~~~~~~~~~ 1. includes ~~~~~~~~~~~~~ */
let lazy={ // modules to be lazy loaded
  videocr:null,
  Video:null// video intelligence
} 

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const sharp = require('sharp')
const exifr = require('exifr');
const {debounce}  = require('lodash'); //stack
const dayjs = require("dayjs")
// Vision API
const vision = require('@google-cloud/vision');

const {processFitnessActivity} = require("./virtualRaces");
const { getImageHeight } = require('./imageProcessing');

const raceTiming = require('./raceTiming') //stack

const { DEBUG_MODE, GS_URL_PREFIX, JPEG_EXTENSION, RUNTIME_OPTION, UPLOADS_FOLDER, 
  UPLOADVID_FOLDER, META_KEYS, bibRegex, NOTIMING_WAYPOINTS, testData, PROCESSED_FOLDER, 
  THUMBNAILS_FOLDER, WATERMARK_PATH, NOTFOUND, RESIZE_OPTION, JPG_OPTIONS, THUMBSIZE_OPTION, 
  THUMB_JPG_OPTIONS,settings } = require('./settings');
const { getNormalSize, parseObjName , getIsoDate , addSeconds, log, debug, error
  } = require('./utils');
  const { firestore,updFSReadings, delFSReadings, updFSImageData,updFSVideoData } = require('./firebaseUser');

// Node.js core modules


const JSS=JSON.stringify
// firestore settor/gettors
const doc=(path)=>admin.firestore().doc(path)
const get=(path,callback)=>doc(path).get().then(x=>callback(x.data())) 
const getCol=(path,callback)=>admin.firestore().collection(path).get()
                        .then(snap=>{
                            let arr=[]
                            snap.forEach(doc=>arr.push(callback(doc)))
                            return arr;
                        })

// Since this code will be running in the Cloud Functions environment
// we call initialize Firestore without any arguments because it
// detects authentication from the environment.
let cfg ;
if(admin.apps.length==0) {
  admin.initializeApp();
  admin.firestore().settings({ ignoreUndefinedProperties: true });
  admin.firestore().doc('app/config').onSnapshot(snap=>cfg=snap.data())
}

let watermarks={}; //key="raceId" : watermark sharp image

let race_cfg={};
const getRaceCfg= async (race) =>  { 
  if (race_cfg.hasOwnProperty(race)) 
    return race_cfg[race] 
  admin.firestore().doc(`races/${race}`)
    .onSnapshot(snap=>{
      race_cfg[race]=snap.data();
      debug(`load ${race}`,race_cfg[race])
      return race_cfg[race] 
    })
  // function below waits 3 seconds
  return await new Promise(resolve => setTimeout(resolve, 1000))
                        .then(()=> race_cfg[race])
};
exports.getRaceCfg = getRaceCfg;


/* ~~~~~~~~~~~~ 3. HTTPS functions  ~~~~~~~~~~~~~ */
 const {app} = require("./express");

 
 // This HTTPS endpoint can  be made accessed by `Authorization` HTTP header
 // with value `Bearer <Firebase ID Token>`.  Not used
exports.api = functions.https.onRequest(app);
/* ~~~~~~~~~~~~ 4. Firestore functions  ~~~~~~~~~~~~~ */

// Listen for changes in all documents in the 'races' collection and all subcollections
exports.timingUpdate = functions.firestore
    .document('races/{raceId}/videos/{videoPath}')
    .onWrite((change, context) => {

      
      // // Get an object with the current document value.
      const raceId = context.params.raceId
      const videoPath = context.params.videoPath
      // // If the document does not exist, it has been deleted.
      const document = change.after.exists ? change.after.data() : null;
      // // Get an object with the previous document value (for update or delete)
      const oldDocument = change.before.data();

      var [ignore, ignore_, waypoint, userId, date, gps, fileName] = parseObjName(videoPath);
      // // perform desired operations ...
      if (document) { // add or update
        // bib "124"
        // imagePath "processed/testrun/2023-03-12T02:28:48.000Z~VENUE~avinashmane$gmail.com~20230312_075846.jpg"
        // score 0
        // timestamp "2023-03-13T02:28:00.000Z"
        // userId "avinashmane$gmail.com"
        // waypoint "VENUE" 
        document.textAnnotations.forEach((textAnn)=>{
          let  timestamp = addSeconds(document.timestamp, textAnn.secStart)
          
          updFSReadings(raceId, userId, textAnn.text, timestamp?.toISOString(), textAnn.confidence, 
            textAnn.waypoint, {}, videoPath )
        }) 
        
      } else { /// deletions

        oldDocument.textAnnotations.forEach((textAnn)=>{
          
          let timestamp = addSeconds(oldDocument.timestamp, textAnn.secStart);
          
          delFSReadings(raceId,textAnn.text,timestamp.toISOString())
        })
      }
      // if (getRaceCfg()?.processing?.scanImages){
      //   debug(context.params,change?.before?.data(),change?.after?.data())
      // } else {
      //   debug(`Function is disabled due to races/${context.params.raceId}/images/{imagePath}!=true`);
      //   return null;
      // }
      return true
    });

  exports.readingsToResult = functions.firestore
    .document('races/{raceId}/readings/{time_bib}')
    .onWrite((change, context) => {
  
    // // Get an object with the current document value.
    const raceId = context.params.raceId
    // const time_bib = context.params.time_bib
    // // If the document does not exist, it has been deleted.
    // const document = change.after.exists ? change.after.data() : null;
    // // Get an object with the previous document value (for update or delete)
    // const oldDocument = change.before.data();

    if (getRaceCfg()?.processing?.readingsToResult!==false){
      debounced_save_result(raceId,)
    } else {
      debug(`Function is disabled due to races/${raceId}/processing?.readingsToResult!=true`);
      return null;
    }
    return true
  });


  /**
   * Virtual races
   */
exports.activitiesToResult = functions.firestore
  .document('races/{raceId}/activities/{ath_wpt_act}')
  .onWrite(async (change, context) => {

  let allEntries;
  // // Get an object with the current document value.
  const raceId = context.params.raceId
  const race  = await firestore.get(`/races/${raceId}`,x=>x)
  const activities = await getCol(`/races/${raceId}/activities`,
    doc=>raceTiming.mapActivityToResult(doc,[]))

    allEntries=raceTiming.checkRuleSplitDups(activities)
    // Registration name Rule
    if (race.registrationRequired){
        "filter and map name from bibs"
    } else{
        allEntries=allEntries.map(x=>Object.assign(x,{
            Name : `Strava ${x.athlete}`
        }))
    }

    const ret = raceTiming.finalize_results(allEntries,race)

    // Save all entries
    ret.docs.forEach((category) => {
        debug(`saving ${category.entries.length} entries for ${category.cat}`);
        for(let x of category.entries) {
            try {
                // debug(`${x.Rank} ${x.Name} ${x['Race Time']}`)
                firestore.doc(`races/${raceId}/result/${x.Bib}`)
                    .set( x)
                    .then(debug(`saved ${x.bib}`))
                
            } catch (e) {
                console.error("error saving", e);
            }
        };
    });


     doc( `races/${raceId}`).update({
         "timestamp.live": new Date().toISOString(),
     });

  return true
});

/* ~~~~~~~~~~~~ 5. Storage functions  ~~~~~~~~~~~~~ */

/**
 * When an image is uploaded a) check texts Cloud Vision, JPG conv and update in firestores
 * input   {bucket:'',name:'uploads/event/personId/image'}
 * a) Process photos
 * - prefixed folder
 * - read EXIF
 * - JPG conversion (low)
 * - update in firestore
 *    - all text annotations --- 
 *      - image...textJSON
 * 
 * B)  upload reading
 *    - bib matching annotations
 *    - update readings
 * 
 * '{"bucket":"run-pix.appspot.com","name":"uploads/werun2023/2023-03-13T19:25:41.041091~general~vaibhav~_L3A3047.jpg","contentType":"image/jpeg"}'
 * "{\"bucket\":\"run-pix.appspot.com\",\"name\":\"uploads/werun2023/2023-03-13T19:25:41.041091~general~vaibhav~_L3A3047.jpg\",\"contentType\":\"image/jpeg\"}"
 */

exports.ScanImages = functions.runWith({
    memory: "1GB", // Ensure the function has enough memory and time
  }).storage.object().onFinalize(async (object) => {

  if (RUNTIME_OPTION?.ScanImages?.disabled) {
        log(`Function is disabled due to RUNTIME_OPTION.ScanImages.disabled=${RUNTIME_OPTION.ScanImages.disabled}`);
        return null;
  // Ignore images not in uploads
  } else if ( object?.name?.startsWith(`${UPLOADS_FOLDER}/`) ||
        object?.name?.startsWith(`${UPLOADVID_FOLDER}/`) ||
       object?.name?.startsWith(`test/`)) {  
    // if this is triggered on a file that is an image.
    if (object?.contentType?.startsWith('image/')) {

      await processImage(object);

    } else if (object?.contentType?.startsWith('video/')){

      await this.scanVideo(object)

    } else {

      log(`Ignoring upload "${object.name}"  is not an image/video.`);

    }
  }

  // log('all done')
  return null;

});

async function processImage(object) {
  var [folder, raceId, waypoint, userId, date, gps, fileName] = parseObjName(object.name);

  if (raceId == 'default')
    debug(object, folder, raceId, waypoint, userId, date, gps, "file", fileName);

  const detections = await getAIdetections(object);

  // PART II   save images/ref data
  try {

    /** get metadata from the filename race_wpt_user_timestamp */
    var { attrs, imagePath } = await compressImage(raceId, object.name, object.bucket, {});

    attrs = META_KEYS.reduce((a, x) => {
      if (x in attrs)
        a[x] = attrs[x];
      return a;
    }, {});

    // log("open waypointation codes")
    // var pluscode=encode({  latitude: attrs.latitude,longitude: attrs.longitude})
    log(`AI results on image "${object.name}"`, detections.length);
    let texts = [];
    // get ISO Date for correct part TODO /// for time readings
    let readingDate = getIsoDate(attrs, date);

    for (let i = 0; i < detections.length; i++) {
      let d = detections[i];
      // only if it looks like a bib
      if (d.description && d.description.match(bibRegex)) {
        try {

          let score = processBounding(d.boundingPoly, getImageHeight(attrs));

          // if its not a  non-timing waypoint record timing
          if (NOTIMING_WAYPOINTS.includes(waypoint) == false) {
            await updFSReadings(raceId, userId, d.description,
              readingDate, score,
              waypoint, attrs, imagePath);
          }
          // add only new texts in all cases
          if (texts.indexOf(d.description) == -1)
            texts.push(d.description);
        }
        catch (e) {
          error('error updFSReadings', e);
        }
      }
    }

    // trim attributions TODO
    // Saving Image data in firestore.. referred image should be jpg
    log(`updating firestore on image data`);
    await updFSImageData(raceId, fileName, detections, texts, attrs);

  } catch (e) {
    error(`Error in image processing "${object.name}"`, e);
  }
}

async function getAIdetections(object) {
  let data;
  // Check the image content using the Cloud Vision API.
  try {
    if (RUNTIME_OPTION.ScanImages && !RUNTIME_OPTION.ScanImages.vision) {
      log('Skipping vision text detection');
      data = [{ "textAnnotations": [] }]; 
    } else {
      const visionClient = new vision.ImageAnnotatorClient();
      data = await visionClient.textDetection(
        `gs://${object.bucket}/${object.name}`
      );

    }
  } catch (e) {
    log(`error running computer vision ${testData} ${JSON.stringify(e)}`);
  }

  const detections = data[0].textAnnotations;
  return detections;
}

async function compressImage(raceId,filePath, bucketName, metadata) {

  const fileName = filePath.split('/').pop();
  const newFileName = fileName.replace(/\.png$/, ".jpg")
  const newFilePath = `${PROCESSED_FOLDER}/${raceId}/${newFileName}`
  const thumbsPath = `${THUMBNAILS_FOLDER}/${raceId}/${newFileName}`
  let image;

  // log(">>>",raceId, fileName)

  const bucket = admin.storage().bucket(bucketName);
  
  try{
    let imgMetadata;
    [image, imgMetadata] = await getImageMetadata(bucket,filePath).catch(error);  
    metadata = Object.assign( metadata, imgMetadata)
    
  } catch (e) {
    error("getImageMetadata",e)
  }

  // check if watermark exists for the race
  if (!watermarks[raceId]) {
    log(`reading watermark for ${raceId} at ${WATERMARK_PATH(raceId)}`)
    // return as a array
    let retval = await getImageMetadata(bucket,WATERMARK_PATH(raceId),false)
                    .catch((e)=>{
                      functions.logger.warn(`Watermark not found ${WATERMARK_PATH(raceId)} ${JSON.stringify(e)}`)
                      watermarks[raceId]=NOTFOUND
                      return [NOTFOUND]
                    });

    watermarks[raceId] =retval[0]
    
  }

  log(`Saving JPG ${newFilePath}`)
  await saveJPG(bucket, newFilePath, image, metadata, watermarks[raceId]);
  // log(">>>>",JSON.stringify(await image.metadata()).substring(0,200))

  log(`Saving thumb ${thumbsPath}`)
  saveThumb(bucket, thumbsPath, image, metadata);

  let attrs=metadata;//Object.assign(metadata, {imagePath: newFilePath, })
  // debug(metadata)

  return {attrs:attrs,imagePath: newFilePath}
}

async function getImageMetadata(bucket,filePath,metadataReqd=true) {
  // Downloads the file into a buffer in memory.
  const contents =   await bucket.file(filePath).download();
  let img,size,imgMetadata;
  try{
      img = sharp(contents[0])// contents
      size = getNormalSize(await img.metadata())
      imgMetadata=size
  } catch (e){
    error(`can't make sharp object for ${filePath}`,e)
  }
  if (metadataReqd){
    imgMetadata =  Object.assign(imgMetadata,
                        await exifr.parse(contents[0],true)
    )
  }
  return [img, imgMetadata]
}


/**
 * Saves image in storage after a) resize b) watermark
 * @param {*} bucket 
 * @param {*} filePath 
 * @param {*} image 
 * @param {*} metadata 
 * @param {*} watermarkImg 
 * @returns 
 */
async function saveJPG(bucket, filePath, image, metadata, watermarkImg) {

  // assert(image instanceof sharp)
  // Create Sharp pipeline for resizing the image and use pipe to read from bucket read stream
  const transformer = sharp(); 
  transformer.rotate()
             .withMetadata()
             .resize(  RESIZE_OPTION )
             .jpeg(    JPG_OPTIONS)

  // log(await watermarkImg.metadata()) 
  if (watermarkImg && (watermarkImg!=NOTFOUND)){
    
    let adjWm=await watermarkImg.resize({ width: RESIZE_OPTION.width})
                                .toBuffer()
      
    transformer
      .composite([{ input: adjWm, gravity: 'south',
    }])
    // log('watermark done')
  } 
  // else {error('watermarkImg',watermarkImg && (watermarkImg!=NOTFOUND))}

  let options = {resumable:false,public:true,metadata:metadata}
  const remoteWriteStream = bucket.file(filePath).createWriteStream(options);
  await (image.rotate()
        .pipe(transformer)
        // .jpeg(JPG_OPTIONS)
        .pipe(remoteWriteStream)
      )
        .on('error', function(err) {error(`Error saving JPG ${JSON.stringify(err)}`)})
        .on('finish', function() {
          // The file upload is complete.
          log(`Saved JPG ${filePath}`)
      })
    // .then(()=>log(`Writing watermarked image: ${newFilePath}`))
    // .catch((e)=>{error(`error in saveJPG() ${JSON.stringify(e)}`)})
  
  return image
}

function saveThumb(bucket, filePath, image,metadata) {

  // Create write stream for uploading thumbnail
  // const thumbnailUploadStream = bucket.file(thumbFilePath).createWriteStream({metadata});
  let options = {resumable:false,public:true,metadata:metadata}
  const remoteWriteStream = bucket.file(filePath).createWriteStream(options);

  // Create Sharp pipeline for resizing the image and use pipe to read from bucket read stream
  const transformer = sharp();
  
  transformer.resize(  THUMBSIZE_OPTION)
             .jpeg(THUMB_JPG_OPTIONS)

  image.rotate()
    .pipe(transformer)
    .toFormat('jpg')
    .pipe(remoteWriteStream)
    // .catch((e)=>{error(`error in saveThumb() ${JSON.stringify(e)}`)});

}

/** return bounding box 
 */
 function processBounding(boundingPoly, height) {
  const start = 1, //2nd point  top right
    end = 2; //3rd point    bottom right
  let heightPixels;
  if (boundingPoly.vertices.length == 4) {
    // log(JSON.stringify(boundingPoly.vertices,2))
    heightPixels = Math.sqrt(Math.abs((boundingPoly.vertices[start].x - boundingPoly.vertices[end].x) ** 2 -
      (boundingPoly.vertices[start].y - boundingPoly.vertices[end].y) ** 2)).toFixed(2)
      // return boundingPoly.vertices.map(pt => `${pt.x},${pt.y}`).join("/") + ` score ${heightPixels*100/height}`
    // log(heightPixels,typeof(heightPixels),height,typeof(height))
    return parseInt(heightPixels*100/height)
  }
  error('number of corner for bounding ploy is not 4...not supposed to happen')

}


/**
 * Video OCR
 * 
 * scanVideo:  gets text annotations from GCS video to firestore
 * @param {*} gcsUri 
 */
lazy.videocr=require('./videoocr')
  
exports.scanVideo = async function (storageObject) {
  let gcsUri = storageObject
  try{
    if (typeof storageObject=== 'object') {
      gcsUri = `gs://${storageObject?.bucket}/${storageObject?.name}`
      /**
      bucket; // The Storage bucket that contains the file.
      name; // File path in the bucket.
      contentType; // File content type.
      */
    } 
    
    var [bucket,raceId,videoPath] = gcsUri.split(/\//,).splice(-3)
    var [ignore, ignore_, waypoint, userId, date, gps, fileName] = parseObjName(videoPath);

  } catch (e) {
    console.error(`error parsing ${gcsUri}`,e)
  }

  // raceId='testrun'
  // const detections = [ {
  //   text: 'testt',
  //   confidence: 0.9237396717071533,
  //   secStart: 0.233333,
  //   secEnd: 0.333333,
  //   frames: 2
  // }]
  const raw_detections = await detectVideoText(gcsUri)
  // printannotations(raw_detections);
  const detections = lazy.videocr.videoDetectionFilter(raw_detections, /^\d*$/)
  log(`scanVideo(${gcsUri}).text`,detections.map(x=>x.text))
    
  return await updFSVideoData( raceId, videoPath, detections, date, waypoint) 
};


const detectVideoText = async function (gcsUri) {
  // [START video_detect_text]
  // Imports the Google Cloud Video Intelligence library

  lazy.Video = lazy.Video || require('@google-cloud/video-intelligence');
  // Creates a client
  lazy.videoClient = lazy.videoClient || new lazy.Video.VideoIntelligenceServiceClient();

  const request = {
    inputUri: gcsUri,
    features: ['TEXT_DETECTION'],
  };
  try {
    // Detects text in a video
    const [operation] = await lazy.videoClient.annotateVideo(request);
    // console.log(`Waiting for operation to complete...`, request);
    
    // Gets annotations for video
    const results = await operation.promise()
    const textAnnotations = results[0]?.annotationResults?.[0]?.textAnnotations;

    return textAnnotations
  } catch (err) {
    console.error(`>> ${gcsUri}>>`, err);
  }
}

exports.testHttp = functions.https.onRequest(async (req, res)=>{
  log("testHttp",req.query?.raceId)
  res.send(await getRaceCfg(req.query?.raceId))

});


async function save_result(raceId, options) {

  const race = await getRaceCfg(raceId)
  const bibs = await getCol(`/races/${raceId}/bibs`,
    doc => (Object.assign({ id: doc.id }, doc.data())))
  const data = await getCol(`/races/${raceId}/readings`,
    doc => raceTiming.mapReading(doc, bibs))
  
  
  const allEntries = raceTiming.addStatusFields(data,
    race?.timestamp?.start)
  
  const ret = raceTiming.finalize_results(allEntries, race)

  let stats={
    bibs :bibs.length,
    readings: data.length,
    results: ret.length || 0,
    savedResults: 0
  }
  // Save all entries
  ret.docs.forEach((category) => {
    log(`saving ${category.entries.length} entries for ${category.cat}`);
    category.entries.forEach((x) => {
      try {
        // console.log(`${x.Rank} ${x.Name} ${x['Race Time']}`)
        doc(`races/${raceId}/result/${x.Bib}`)
          .set(x)
          .then(x=> {stats.savedResults++})
          .catch(console.error)

      } catch (e) {
        console.error("error saving", e);
      }
    });
  });
  
  // update /races
  doc(`races/${raceId}`).update({
    "timestamp.result": new Date().toISOString(),
    stats: stats
  });
  return stats
}

const debounced_save_result = debounce(save_result, 2000)

/** Receveie fitness activities from Indiathon
 * Pubsub
 * {
          type: 'activity',
          athlete: pvtProfile,
          activity: actRec,
          event: data,
        }
 */
exports.receiveRaceActivities = functions.pubsub.topic(settings.indiathon.topic)
  .onPublish(async (messageObject) => {
    // Decode the PubSub Message body.
    const message = messageObject.data ? JSON.parse(Buffer.from(messageObject.data, 'base64').toString()) : null;
    
    const act=await processFitnessActivity(message)
    // Print the message in the logs.
    functions.logger.log(`Processed message!`,act,message);
    return null;
  });

/**
 * Exports for testing
 */
exports.readFile = lazy.videocr.readFile
exports.imageresult = lazy.videocr.imageresult;
exports.save_result = save_result