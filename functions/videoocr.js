/**
 * Include for video OCR related functions
 */
const { DEBUG_MODE } = require('./settings');

let _ = require('lodash');
const WRITE_FILE=false
const _console=1 ? console : functions.logger
const debug = DEBUG_MODE>2 ? _console.debug : ()=>{};
const log= DEBUG_MODE>1 ? _console.log: ()=>{}
// console.warn("videocr")

const mapNano=(x)=>(x.nanos / 1e6).toFixed(0)


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
    let arr = _.flatten(filterTexts(dat,pattern)
                            .map(t=>
                                t.segments.map(x=>seg2txt(x,t.text))
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

// detectText(
//     'gs://cloud-samples-data/video/googlework_short.mp4'
// ).then(
//     (x) => {
//     console.log('Text detection call complete.',x);
//     },
//     err => {
//     console.error('ERROR:', err);
//     }
// ).catch(console.error);

module.exports = {
    detectText: detectText,
    readFile: readFile,
    videoDetectionFilter: videoDetectionFilter,
    test1: test1,
    writeFile: writeFile,
}
