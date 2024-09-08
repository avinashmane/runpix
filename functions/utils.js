/**
 * Structure
 * 1 includes
 * 2 configation
 * 3 HTTP triggers: image generator
 * 4 Firestore triggered
 * 5. Storage triggered: Scan images
*/
'use strict';
const {DEBUG_MODE} = require('./settings');
const functions = require('firebase-functions');

const debug = DEBUG_MODE>2 ? functions.logger.debug : ()=>{};
const log= DEBUG_MODE>1 ? functions.logger.log: ()=>{}
const error=  functions.logger.error;

function encodeKey(x) {
  return x.replace(/[\\\/]/g, "~");
}
function decodeKey() {
  return x.replace(/[\^]/g, "/");
}
function cleanForFS(s) {
  return s.replace(/[\/]/g, "_");
}

/**
 * Structure
 * 1 includes
 * 2 configation
 * 3 HTTP triggers: image generator
 * 4 Firestore triggered
 * 5. Storage triggered: Scan images
*/
'use strict';
// Based on EXIF rotation metadata, get the right-side-up width and height:
function getNormalSize({
  width, height, orientation
}) {
  return (orientation || 0) >= 5 ? {
    width: height,
    height: width
  } : {
    width,
    height
  };
}


function getpathfromGcsUri(gcsUri) {
  // 'run-pix-videos/test/VID_20240310_074051.mp4'.match(/(^(gs\:\/\/)?([^\/]*)\/)(.*)/,).splice(-2)
  // returns bucket and path - not used
  return gcsUri.split('/').pop()
}


function getIsoDate(metadata, date) {
  let isoDate;
  try {
    ['DateTimeOriginal', 'DateCreated', 'CreatedDate']
      .forEach(x => {
        if (metadata.hasOwnProperty(x) && metadata[x] && metadata[x].length > 0) {
          isoDate = metadata[x].toISOString();
          return isoDate;
        }
      });
  } catch (e) {
    debug(e);
  }

  return isoDate || date;
}

function printannotations(textAnnotations) {
  textAnnotations.forEach(textAnnotation => {
    console.log(`Text ${textAnnotation.text} occurs at:`);
    textAnnotation.segments.forEach(segment => {
      const time = segment.segment;
      console.log(
        ` Start: ${time.startTimeOffset.seconds || 0}.${(
          time.startTimeOffset.nanos / 1000000
        ).toFixed(0)}s`
      );
      console.log(
        ` End: ${time.endTimeOffset.seconds || 0}.${(
          time.endTimeOffset.nanos / 1000000
        ).toFixed(0)}s`
      );
      console.log(` Confidence: ${segment.confidence}`);
      segment.frames.forEach(frame => {
        const timeOffset = frame.timeOffset;
        console.log(
          `Time offset for the frame: ${timeOffset.seconds || 0}` +
          `.${(timeOffset.nanos / 1000000).toFixed(0)}s`
        );
        // console.log('Rotated Bounding Box Vertices:');
        // frame.rotatedBoundingBox.vertices.forEach(vertex => {
        //   console.log(`Vertex.x:${vertex.x}, Vertex.y:${vertex.y}`);
        // });
      });
    });
  });
}

function parseObjName(name) {
  // uploads/race/wpt~time~user~waypoint
  // uploads/mychoice23mar/2022-01-13T12:23:36.476Z~start~avinashmane@gmail.com~9955-3Certificate.png
  var raceId = 'default', waypoint = 'general', userId = 'unknown', date = 'nodate', gps = '', folder, fileName;

  try {
    // remove leading /
    name = (name.charAt(0) == '/') ? name.substring(1) : name;

    var parsePath = name.split(/\//g);
    if (parsePath.length == 3) {
      folder = parsePath[0];
      raceId = parsePath[1];
    }
    var names = parsePath.pop().split(/[\^~]/g);
    if (names.length == 5)
      [date, waypoint, userId, gps, fileName] = names;
    else if (names.length == 4)
      [date, waypoint, userId, fileName] = names;
    else if (names.length == 3)
      [date, userId, fileName] = names;
    else if (names.length == 2)
      [userId, fileName] = names;
    else if (names.length == 1)
      [fileName] = names;
  } catch (e) {
    error('error', e);
  }

  fileName = name.split('/').pop();

  return [folder, raceId, waypoint, userId, date, gps, fileName];
}


function addSeconds(timestamp, seconds) {
  let ts = new Date(timestamp);
  ts.setMilliseconds(ts.getMilliseconds() + seconds * 1000);
  return ts;
}

module.exports =  {encodeKey,decodeKey,
  cleanForFS,getNormalSize, getpathfromGcsUri, 
  printannotations, parseObjName,
  getIsoDate, addSeconds,
  log, error, debug
};


