/**
 * Structure
 * 1 includes
 * 2 configation
 * 3 HTTP triggers: image generator
 * 4 Firestore triggered
 * 5. Storage triggered: Scan images
*/
'use strict';
const sharp = require('sharp');

/* ~~~~~~~~~~~~ 2. config ~~~~~~~~~~~~~ */
// options for triggers
const defaultFor = (OPTION, default_) => {
  let cfg;
  try {
    if (process.env[OPTION])
      cfg = JSON.parse(process.env[OPTION]);

    else
      cfg = default_;
  } catch (e) { console.error(e); }
  
  return cfg;
};
const RUNTIME_OPTION = defaultFor("RUNTIME_OPTION", {
  ScanImages: {
    vision: true,
    disabled: false
  }
});
exports.RUNTIME_OPTION = RUNTIME_OPTION;
const testData = 'test/annotations_data.json';
exports.testData = testData;
// Where we'll config
const UPLOADS_FOLDER = 'uploads';
const PROCESSED_FOLDER = 'processed';
exports.UPLOADS_FOLDER = UPLOADS_FOLDER;
exports.PROCESSED_FOLDER = PROCESSED_FOLDER;
exports.UPLOADVID_FOLDER = 'uploadvid';
// File extension for the created JPEG files.
const THUMBNAILS_FOLDER = 'thumbs';
exports.THUMBNAILS_FOLDER = THUMBNAILS_FOLDER;
const NOTFOUND = 'notfound';
exports.NOTFOUND = NOTFOUND;
const GS_URL_PREFIX = "https://storage.googleapis.com/run-pix.appspot.com/";
exports.GS_URL_PREFIX = GS_URL_PREFIX;
const JPEG_EXTENSION = '.jpg';
exports.JPEG_EXTENSION = JPEG_EXTENSION;
const WATERMARK_PATH = (x) => `ref/watermark/${x}.png`;
exports.WATERMARK_PATH = WATERMARK_PATH;
const bibRegex = /^[A-Z]{0,1}[0-9]{3,5}$/;
exports.bibRegex = bibRegex;
const RESIZE_OPTION = defaultFor("RESIZE_OPTION", {
  width: 3072,
  height: 3072,
  fit: sharp.fit.inside,
  position: sharp.strategy.entropy
});
exports.RESIZE_OPTION = RESIZE_OPTION;
const THUMBSIZE_OPTION = defaultFor("THUMBSIZE_OPTION", {
  width: 400,
  height: 300,
  fit: sharp.fit.inside,
  position: sharp.strategy.entropy
});
exports.THUMBSIZE_OPTION = THUMBSIZE_OPTION;
const JPG_OPTIONS = defaultFor("JPG_OPTIONS", { quality: 60, progressive: true });
exports.JPG_OPTIONS = JPG_OPTIONS;
const THUMB_JPG_OPTIONS = defaultFor("JPG_OPTIONS", { quality: 30, progressive: true });
exports.THUMB_JPG_OPTIONS = THUMB_JPG_OPTIONS;
const NOTIMING_WAYPOINTS = defaultFor("NOTIMING_WAYPOINTS", ['VENUE', 'venue', 'general']);
exports.NOTIMING_WAYPOINTS = NOTIMING_WAYPOINTS;
const META_KEYS = ['ImageHeight', 'ImageWidth', 'ExifVersion', 'DateCreated', 'WhiteBalance', 'FocalLength', 'DigitalCreationTime',
  'DateTimeOriginal', 'OffsetTimeOriginal', 'CreateDate', 'SubSecTimeOriginal', 'ModifyDate',
  'ApproximateFocusDistance', 'OriginalDocumentID', 'format', "ShutterSpeedValue",
  'Artist', 'ExposureCompensation', "ImageUniqueID", 'Lens', "FocalLengthIn35mmFormat",
  'Make', "Model", 'ExposureTime', 'LensModel', 'PreservedFileName', 'Flash', 'ISO', "latitude", "longitude"];
exports.META_KEYS = META_KEYS;
const DEBUG_MODE = defaultFor("DEBUG_MODE", 2);
exports.DEBUG_MODE = DEBUG_MODE;


exports.settings = {
  indiathon: {
    topic: 'fitnessActivities',
    subscription: 'projects/run-pix/subscriptions/fitnessActivities-sub', // substription to be deleted
    // topic: 'projects/run-pix/topics/fitnessActivities'
  }
}

const envDEBUGRegex=RegExp(process.env.DEBUG)
exports.debug=(...args)=> { //false ? console.log : () => {}
  if (/[A-Z]/.test(args[0])){
    if (settings?.debug?.[args[0]] || envDEBUGRegex.test(args[0])){
      return console.debug(...args.slice(1)) // skip first parameter
    } else
      return
  }
  if (isDevelopmentMode())
    return console.debug(...args)
}

exports.errFn=(...args)=>{
  newArgs = args.map(e=>e instanceof Error?
    `${e.name} ${e.fileName||''} ${e.lineNumber||''}${e.message} ${JSON.stringify(e).substring(0,100)}` : e
  )
  console.error(`Err ${args[0]}:`, ...newArgs.splice(1))
}