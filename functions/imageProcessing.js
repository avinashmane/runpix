/**
 * Structure
 * 1 includes
 * 2 configation
 * 3 HTTP triggers: image generator
 * 4 Firestore triggered
 * 5. Storage triggered: Scan images
*/
'use strict';
const exifr = require("exifr");
const sharp = require("sharp");
const { getNormalSize, error } = require("./utils");


async function getImageMetadata(bucket, filePath, metadataReqd = true) {
  // Downloads the file into a buffer in memory.
  const contents = await bucket.file(filePath).download();
  let img, size, imgMetadata;
  try {
    img = sharp(contents[0]); // contents
    size = getNormalSize(await img.metadata());
    imgMetadata = size;
  } catch (e) {
    error(`can't make sharp object for ${filePath}`, e);
  }
  if (metadataReqd) {
    imgMetadata = Object.assign(imgMetadata,
      await exifr.parse(contents[0], true)
    );
  }
  return [img, imgMetadata];
}
exports.getImageMetadata = getImageMetadata;


function getImageHeight(meta) {
  try {
    return meta.Orientation == "Horizontal (normal)" ? meta.ImageHeight : meta.ImageWidth;
  } catch (e) {
    return (meta.orientation || 0) >= 5 ? meta.height : meta.width;
  }
}

exports.getImageHeight = getImageHeight;

function getImageWidth(image, metadata) {
  try {
    // fails for light room https://www.reddit.com/r/Lightroom/comments/yheq9r/image_dimensions_not_included_in_exif_data_for/
    let width = Math.max.apply(Math, Object.keys(metadata).filter(x => x.includes('idth')).map(x => metadata[x]));
    return width;
  } catch (e) {
    console.error(e);

  }
}

exports.getImageWidth = getImageWidth;