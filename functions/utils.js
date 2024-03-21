/**
 * Structure
 * 1 includes
 * 2 configation
 * 3 HTTP triggers: image generator
 * 4 Firestore triggered
 * 5. Storage triggered: Scan images
*/
'use strict';
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


module.exports= {encodeKey,decodeKey,cleanForFS,getNormalSize, getpathfromGcsUri};
