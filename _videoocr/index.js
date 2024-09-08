
const fs = require('fs');
const util = require('util');
const writeFile = util.promisify(fs.writeFile);


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
    console.log('Waiting for operation to complete...');
    // Gets annotations for video
    const textAnnotations = results[0].annotationResults[0].textAnnotations;
    
    writeFile('textAnnotations.json', 
                JSON.stringify({inputUri: gcsUri, 
                                textAnnotations: textAnnotations}, 
                    null, 2))
                .then(x=>
                    console.warn('file written',x));

    textAnnotations.forEach(textAnnotation => {
    console.log(`Text ${textAnnotation.text} occurs at:`);
    textAnnotation.segments.forEach(segment => {
        const time = segment.segment;
        console.log(
        ` Start: ${time.startTimeOffset.seconds || 0}.${(
            time.startTimeOffset.nanos / 1e6
        ).toFixed(0)}s`
        );
        console.log(
        ` End: ${time.endTimeOffset.seconds || 0}.${(
            time.endTimeOffset.nanos / 1e6
        ).toFixed(0)}s`
        );
        console.log(` Confidence: ${segment.confidence}`);
        segment.frames.forEach(frame => {
        const timeOffset = frame.timeOffset;
        console.log(
            `Time offset for the frame: ${timeOffset.seconds || 0}` +
            `.${(timeOffset.nanos / 1e6).toFixed(0)}s`
        );
        console.log('Rotated Bounding Box Vertices:');
        frame.rotatedBoundingBox.vertices.forEach(vertex => {
            console.log(`Vertex.x:${vertex.x}, Vertex.y:${vertex.y}`);
        });
        });
    });
    });
}



detectText(
    'gs://cloud-samples-data/video/googlework_short.mp4'
).then(
    (x) => {
    console.log('Text detection call complete.',x);
    },
    err => {
    console.error('ERROR:', err);
    }
).catch(console.error);