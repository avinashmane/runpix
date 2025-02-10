/**
 * Include for video OCR related functions
 */
let lazy={ // modules to be lazy loaded
    videocr:null,
    Video:null// video intelligence
  } 
  
const { DEBUG_MODE } = require('./settings');
const {parseObjName} = require('./utils');
const {updFSVideoData} = require('./firebaseUser');
const { backOff } = require( "exponential-backoff")

const {retry} = require('async')
let _ = require('lodash');
const WRITE_FILE=false
const _console=1 ? console : functions.logger
const debug = DEBUG_MODE>2 ? _console.debug : ()=>{};
const log= DEBUG_MODE>1 ? _console.log: ()=>{}
// console.warn("videocr")

const mapNano=(x)=>(x.nanos / 1e6).toFixed(0)

const scanVideoPath = async function (raceId, gcsUri){
    try{
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
    const detections = videoDetectionFilter(raw_detections, /^\d*$/)
    log(`scanVideo(${gcsUri}).text`,detections.map(x=>x.text))
      
    return await updFSVideoData( raceId, videoPath, detections, date, waypoint) 
  
}

async function detectText(gcsUri) {
    // [START video_detect_text]
    // Imports the Google Cloud Video Intelligence library
    const Video = require('@google-cloud/video-intelligence');
    // Creates a client
    const video = new Video.VideoIntelligenceServiceClient();

    /**
     * TODO(developer): Uncomment the following line before running the sample.
     */
    // const gcsUri = 'GCS URI of the video to analyze, e.g. gs://my-bucket/my-video.mp4';

    const request = {
        inputUri: gcsUri,
        features: ['TEXT_DETECTION'],
    };
    // Detects text in a video
    
    const [operation] = await video.annotateVideo(request);
    const results = await operation.promise();
    log('Waiting for operation to complete...');
    // Gets annotations for video
    const textAnnotations = results[0].annotationResults[0].textAnnotations;
    
    if(WRITE_FILE) writeFile('test/out/textAnnotations.json', 
                JSON.stringify({inputUri: gcsUri, 
                                textAnnotations: textAnnotations}, 
                    null, 2))
                .then(x=>
                    log('file written',x));

    textAnnotations.forEach(textAnnotation => {
        log(`Text ${textAnnotation.text} occurs at:`);
        textAnnotation.segments.forEach(segment => {
            const time = segment.segment;
            log( ` Start: ${time.startTimeOffset.seconds || 0}.${mapNano(time.startTimeOffset)}s`);
            log( ` End: ${time.endTimeOffset.seconds || 0}.${mapNano(time.endTimeOffset)}s`            );
            log(` Confidence: ${segment.confidence}`);
            segment.frames.forEach(frame => {
                const timeOffset = frame.timeOffset;
                log(`Time offset for the frame: ${timeOffset.seconds || 0}` +
                    `.${mapNano(timeOffset.nanos)}s`);
                log('Rotated Bounding Box Vertices:');
                frame.rotatedBoundingBox.vertices.forEach(vertex => {
                    log(`Vertex.x:${vertex.x}, Vertex.y:${vertex.y}`);
                });
            });
        });
    });
}
            
const fs = require('fs');
const util = require('util');
const writeFile = util.promisify(fs.writeFile);

function test1 () {
    console.warn("test")
}


function readFile(filePath, encoding = 'utf8') {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, encoding, (error, data) => {
        if (error) {
          reject(error); // Reject the Promise with the error
        } else {
          resolve(data); // Resolve the Promise with the file content
        }
      });
    });
  }

function videoDetectionFilter(dat,pattern=/^\d*$/){
    const texts=filterTexts(dat,pattern)
    if (!texts) return []
    
    let arr = _.flatten(texts.map(t=>
                                t.segments?.map(x=>seg2txt(x,t.text))
                            )
                        )
    // console.warn()
    return _.orderBy(arr,['S'])
    
}


function filterTexts(annotations,pattern){
    return annotations?.filter(x=>pattern.test(x.text));
}

function seg2txt(seg,text){
    // debugger
    // console.debug(JSON.stringify(seg,null,2)) //  ))//
    return {text: text,
            confidence: seg.confidence,
            secStart: secnanos2sec(seg.segment.startTimeOffset),
            secEnd:secnanos2sec(seg.segment.endTimeOffset),
            frames:seg.frames.length}   
    
}

function secnanos2sec(secnanos){
    return (parseFloat(secnanos.seconds) +secnanos.nanos/1e9 || 0);
}


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
    const options = {

        retryDelayMultiplier: 1.3,
        totalTimeout: 600,
        maxRetryDelay: 64,
        autoRetry: true,
        maxRetries: 3,

    }
    try {
        // Detects text in a video
        let a = backOff(async () => {
            const [operation] = await lazy.videoClient.annotateVideo(request, options);
            return operation.promise()
            // console.log(`Waiting for operation to complete...`, request);
        })
        // Gets annotations for video

        // retry(  {
        //     times: 2,
        //     interval: 100//function(retryCount) { return 50 * Math.pow(2, retryCount); }
        // }, 
        return await a.then(function (results) {
            console.warn('do something with the result')

            const textAnnotations = results[0]?.annotationResults?.[0]?.textAnnotations;

            return textAnnotations
            // return results

        }).catch(
            console.error
        );


    } catch (err) {
        console.error(`>> ${gcsUri}>>`, err);
    }

}  

module.exports = {
    detectText,
    readFile,
    videoDetectionFilter,
    test1,
    writeFile,
    scanVideoPath,
}
