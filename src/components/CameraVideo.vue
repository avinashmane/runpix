<template>
  <!-- {{bibs}} -->
  <div id="container w-full">
    <b>CAMERA : {{ waypoint }}</b> <small v-if="['VENUE'].includes(waypoint)"> Not valid for timing</small>
    <div v-if="bib" id="lookupoverlay" class="absolute background-0 text-xl text-left text-light">
      <ul>
        <li v-for="b in bibs" class="shadow text-ref-600/70 p-1">
          {{ b.Bib }} {{ b.Name }}
        </li>
      </ul>
    </div>

    <div v-if="camera.perm">

      <video id="gum" playsinline autoplay muted v-if="camera.perm">
        <p>
          Your browser doesn't support HTML video.
        </p>
      </video>

    </div>
    <form>
      <div class="flex flex-row gap-2 p-float-label my-2">
        <InputText id="bib" v-model="bib" placeholder="Enter a single bib number" aria-describedby="bib-help"
          class="w-1/3 border bg-yellow-50" />
        <Button v-for="d in race?.Distances" @click="recordBib(d)" class="text-white p-2 bg-blue-500 hover:bg-blue-400">
          {{ d }}
        </Button>
      </div>
    </form>


    <span class="flex flex-auto my-2">
      Camera
      <ToggleSwitchhh v-model="camera.perm" label="Camera" @click="toggleCamera()" @dblclick="klick"
        aria-labelledby="single" />
    </span>

    <div v-if="camera.perm" class="flex flex-col  my-2">

      <div class="flex flex-row">
        <div class="flex flex-col">
          <Button @click="recordBib(null)" class="w-30">Snapshot</Button>
          <h4 @click="klick">MediaStreamConstraints</h4>
        </div>
        <div>
            <Select :options="mimeOptions" v-model="mimeType" :disabled="button.mimeType.disable" />
            <p>Echo cancellation: <input type="checkbox" id="echoCancellation"></p>
            <div v-if="camera.zoomCapability" class="flex flex-row">
            <div class="label">Zoom:</div>
            <input  name="zoom" type="range" disabled>
          </div>
        </div>
        <!-- <canvas></canvas> -->
      </div>
      <div id="video">
        <div class="gap-2">
          <!-- <button id="recButton" @click="clickRecButton" :disabled="button.record.disabled"
            :class="{ Rec: isRecording, notRec: !isRecording }"></button> -->
          <!-- <Button id="start" @click="startButtonListener">Start camera</Button> -->
          <!-- <ToggleSwitch v-model="camera.autoupload" label="Auto Upload" @dblclick="klick"/> -->
          <Button id="record" @click="recordButtonListener" :disabled="button.record.disabled">{{ button.record.text
          }}</Button>
          <Button id="play" @click="playButtonListener" :disabled="button.play.disabled">Play</Button>
          <!-- <Button id="download" @click="downloadButtonListener" 
                :disabled="button.download.disabled">Download</Button> -->
          <Button id="auto" @click="camera.autoupload = !camera.autoupload">
            Auto Upload {{ camera.autoupload ? ' On' : 'Off' }} </Button>

          <Button id="upload" @click="uploadVideo" :disabled="button.download.disabled">Upload</Button>
        </div>

        <video id="recorded" playsinline class="w-40 shadow"></video> <!--loop-->

        <div class="flex flex-col">
          <div v-for="(v, k) in recordedBlobs" class="flex flex-auto">
            <Button @click="playButtonListener(k)" :disabled="button.play.disabled">Play</Button>
            <Button @click="uploadVideo(k)" :disabled="button.play.disabled">Upload</Button>
            <small>{{ k }} Size: {{ compact(v.buffer.size) }} - {{ v.status }}</small>
          </div>
        </div>

        <div>
          {{ recordedBlobs.length }} / {{ Object.values(recordedBlobs).reduce((sum, f) => sum = sum + f?.buffer?.size, 0)
            / 10 ** 6 }}
          <span class="text-gray-500 text-xs">: {{ errorMsg }}</span>
        </div>
      </div>
    </div>
  </div>
  <!-- <button @click="klick">x</button> -->
</template>

<script setup>
/**
 * startCamera -> recording -> blob - upload
 */
import { onMounted, computed, reactive, ref } from 'vue'
import { getAllDocs } from '../api'
// import ToggleButton from 'primevue/togglebutton';
import InputText from 'primevue/inputtext';
import SelectButton from 'primevue/selectbutton';
import Select from 'primevue/select';
import ToggleSwitch from 'primevue/toggleswitch';
import { getDateTime } from "../helpers"
import { db, storage } from "../../firebase/config"
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore'
import { ref as stoRef, uploadBytes, uploadString } from "firebase/storage";
import { useStore } from "vuex";
const store = useStore()
const captureCount = store.state.captureCount
const JSS = JSON.stringify
const compact = (x) => isNaN(x) ? x : Intl.NumberFormat('en', { notation: 'compact' }).format(x) //compact number
console.time('cam')
const log = (...x) => console.timeLog('cam', ...x)

const props = defineProps({
  raceId: String,
  waypoint: String,
  race: Object,
  // bibs: Object,
})
const UPLOADS_FOLDER = config.storage.uploads;
const UPLOADVIDS_FOLDER = config.storage.uploadvid

const userData = store.state.auth.userDetails.userData

/**
 * navigator.mediaDevices.getSupportedConstraints()  
 */
const bib = ref("")
const distance = ref(null)
// Put variables in global scope to make them available to the browser console.
let video = null;
// let canvas = null;
let klick = () => { debugger };
let allBibs = []
const bibs = computed((n = 10) => allBibs.filter(x =>
  x.Bib.includes(bib.value)).slice(0, n))//


// This code is adapted from
// https://rawgit.com/Miguelao/demos/master/mediarecorder.html

/* globals MediaRecorder */
let mediaRecorder;
let recordedBlobs = {};
let tsVideo // timestamp of current video
let button = reactive({
  "record": { "text": 'Starting Camera' },
  "play": {},
  "download": {},
  "mimeType": { "disabled": true }
})

const constraints = {
  audio: false,
  //  audio: {echoCancellation: {exact: hasEchoCancellation}}
  video: {
    facingMode: "environment",
    // width: 1280, height: 720
    frameRate: { min: 1, ideal: 15, maximum: 25 }
  }
};
const shadowOptions = {
  shadowOffsetX: 2,
  shadowOffsetY: 2,
  shadowBlur: 1,
  shadowColor: "#FFF4",
  fillStyle: "Black",
  font: "20px serif",
}
const userAgent = navigator.userAgent;
// /Android|iPhone|iPad/i.test(navigator.userAgent)

let camera = reactive({
  perm: true,
  permission: 'N',
  zoomCapability: true
})

// Turn on/off camera
function toggleCamera(e) {
  camera.perm = !camera.perm;
  if (camera.perm) {
    setTimeout(startCamera, 100);
  } else {
    video.pause();
    video.src = null;
    for (const track of video.srcObject.getTracks()) {
      track.stop();
    }
    video.srcObject = null;
    mediaRecorder = null
  }
  // log(camera.perm, e)
}


async function startCamera() {
  button.record.text === 'Not Ready to Record'
  if (camera.perm == false) return;

  video = document.querySelector('video#gum');
  recordedVideo = document.querySelector('video#recorded');
  // canvas = window.canvas = document.querySelector('canvas');
  // canvas.width = 480;
  // canvas.height = 360;

  await getStream(constraints);
  // getQuery()
}

async function getStream(constraints) {
  try {
    // log(`getStream (${JSS(constraints)})`)
    return await navigator.mediaDevices.getUserMedia(constraints)
      .then(stream => {
        // log('getStream')
        getStreamSuccess(stream)   // 
      })
  } catch (e) {
    console.error('navigator.getUserMedia error:', e);
    // debugger
    errorMsg.value = `navigator.getUserMedia error:${e.toString()}`;
  }
}

function getStreamSuccess(stream) {
  button.record.disabled = false;
  log('getUserMedia() got stream:', stream);
  window.stream = stream;
  video.srcObject = stream;

  mimeOptions.value = getSupportedMimeTypes()
  if (mimeOptions.value.length)
    mimeType.value = mimeOptions.value[0]

  button.mimeType.disable = false
  button.record.text = 'Start Recording'

  manageZoom(stream);

}

async function manageZoom(stream) {
  const videoTracks = stream.getVideoTracks();
  log(`Using video device: ${videoTracks[0].label}`);
  const [track] = [window.track] = stream.getVideoTracks();
  log('Got stream with constraints:', constraints);
  // debugger;

  try {
    const settings = track.getSettings();
    for (const ptz of ['zoom']) { //'pan', 'tilt', 
      // Check whether camera supports pan/tilt/zoom.
      if (!(ptz in settings)) {
        errorMsg.value = `Camera does not support ${ptz}.`;
        camera.zoomCapability = false
        continue;
      }

      // Map it to a slider element.
      const capabilities = track.getCapabilities();
      const input = document.querySelector(`input[name=${ptz}]`);
      input.min = capabilities[ptz].min;
      input.max = capabilities[ptz].max;
      input.step = capabilities[ptz].step;
      input.value = settings[ptz];
      input.disabled = false;
      input.oninput = async (event) => {
        try {
          const constraints = { advanced: [{ [ptz]: input.value }] };
          await track.applyConstraints(constraints);
        } catch (err) {
          console.error('applyConstraints() failed: ', err);
          throw err
        }
      };
    }
  }
  catch (err) {
    log('Setting zoom failed: ', JSON.stringify(err).substring(0, 80));
  }
}


onMounted(() => {
  startCamera();
  getAllDocs(`races/${props.raceId}/bibs`).then(x => allBibs = x)
  log('On mounted')
})


const recordButtonListener = () => {

  if (button.record.text === 'Start Recording') {
    startRecording();
    button.record.text = 'Stop Recording';

  } else if (button.record.text == 'Stop Recording') {
    stopRecording();
    button.record.text = 'Start Recording';
    button.play.disabled = button.download.disabled = button.mimeType.disabled = false
  }
};

function startRecording() {

  const counter = getCaptureCounter()// const _mimeType = mimeType.value;
  const options = {
    // mimeType: mimeType.value
    // audioBitsPerSecond: 128000,
    //   videoBitsPerSecond: 250000,
    // mimeType: "video/mp4",
  };

  try {
    mediaRecorder = mediaRecorder || new MediaRecorder(window.stream, options);
    tsVideo = new Date().toISOString();
    recordedBlobs[tsVideo] = {
      id: counter,
      buffer: 'WIP',
      status: 'recording'
    };
    mediaRecorder.onstop = (event) => {
      // start time for next video
      if (camera.autoupload) {
        log(`Auto upload ${tsVideo}`)
        uploadVideo(tsVideo)
      }
      // log('Recorder stopped: ', event);
      log('Recorded Blobs: ', recordedBlobs);
      tsVideo = new Date().toISOString();

    };
    mediaRecorder.onstart = console.info
    mediaRecorder.onerror = console.error
    mediaRecorder.ondataavailable = handleDataAvailable;
    log('MediaRecorder started', mediaRecorder, 'with options', options);
    mediaRecorder.start();

    button.record.text = 'Stop Recording';
    button.play.disabled = button.download.disabled = button.mimeType.disable = true

  } catch (e) {
    console.error('Exception while creating MediaRecorder:', window.stream, e);
    errorMsg.value = `Exception while creating MediaRecorder: ${JSON.stringify(e)}`;
    // debugger
    return;
  }
}

function stopRecording() {
  try {
    mediaRecorder.stop();
    // tsVideo = tsVideo + 'STOP'
  } catch (e) {
    console.error(`stopRecording() error`)
    button.record.text === 'Start Recording' // reset
    throw e
  }
}

function handleDataAvailable(event) {
  // timeStamp
  let ts = tsVideo//.split("STOP")[0] 

  recordedBlobs[ts].status = 'recorded'

  if (event.data && event.data.size > 0) {
    recordedBlobs[ts].buffer = event.data;
  }
  // tsVideo = tsVideo.includes('STOP') ? '' : new Date().toISOString()
  log(`handleDataAvailable ${tsVideo} ${ts}`, event.data);

}

const playButtonListener = (idx) => {
  const _mimeType = mimeType.value.split(';', 1)[0];
  let superBuffer
  // debugger// console.warn(idx)
  try {
    if (idx in recordedBlobs) {
      superBuffer = recordedBlobs[idx].buffer
    } else {
      superBuffer = new Blob(Object.values(recordedBlobs).map(x => x.buffer),
        { type: _mimeType });
    }

    if (superBuffer.length < 10) { // less than 10 byte e.g. WIP
      log('WIP Buffer')
      return
    }

    recordedVideo.src = recordedVideo.srcObject = null;

    recordedVideo.src = window.URL.createObjectURL(superBuffer);
    recordedVideo.addEventListener("ended", (event) => {
      URL.revokeObjectURL(recordedVideo.src);
      log(
        "Video ended . It has finished playing or no further data."
      );
    });
    recordedVideo.controls = true;
    recordedVideo.play();
  } catch (e) {
    debugger
    throw e
  }
};


const uploadVideo = (blobId) => {
  if (!blobId) return
  let ext
  const wpt = props.waypoint
  let timestamp = blobId || new Date().toISOString()
  let counter = recordedBlobs[blobId].id
  let mimeType = recordedBlobs[blobId].buffer?.type?.split(";")[0]
  try { ext = mimeType.split("/")[1] } catch (e) { ext = 'webm' }
  recordedBlobs[blobId].status = 'uploading'
  // log(blobId,counter,recordedBlobs[blobId].buffer.type)
  // debugger
  let email = userData.email || "userData.email"
  let uploadPath = `${UPLOADVIDS_FOLDER}/${props.raceId}/${timestamp}~${wpt}~${email.replace("@", "$")}~vid_${counter}.${ext}`
  const metadata = { contentType: mimeType }; //'video/webm',
  // log(` uploadBuffer(${uploadPath}, ${JSS(metadata)})`)
  uploadBuffer(uploadPath, metadata, blobId);

}

// const uploadVideo_old = (event, wpt, ts) => {
//   const counter = getCaptureCounter()
//   wpt = wpt || props.waypoint
//   let timestamp = ts || new Date().toISOString()
//   // debugger
//   let email = userData.email || "userData.email"
//   let uploadPath = `${UPLOADVIDS_FOLDER}/${props.raceId}/${timestamp}~${wpt}~${email.replace("@", "$")}~vid_${counter}.webm`
//   const metadata = { contentType: 'video/webm', };

//   uploadBuffer(uploadPath, metadata);

// }

function uploadBuffer(uploadPath, metadata, blobId) {
  let uploadRef = stoRef(storage, uploadPath);
  const blob = recordedBlobs[blobId].buffer
  log(`Uploading ${blob.size}b to ${uploadPath}`, blob);

  uploadBytes(uploadRef, blob, metadata).then((snapshot) => {
    log(`Uploaded a video! ${snapshot.ref.fullPath}`, snapshot);
    recordedBlobs[blobId].status='uploaded'
  }).catch(e => {
    recordedBlobs[blobId].status='errupload'
    console.error("Error uploading " + JSON.stringify(e));
  });
}


const downloadButtonListener = () => {
  const blob = new Blob(Object.values(recordedBlobs).map(x => x.buffer), { type: 'video/webm' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = 'test.webm';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 100);
};

function getCaptureCounter() {
  const counter = store.state.counters.capture;
  store.dispatch('incrementCountAction', 'capture');
  return counter;
}

function getSupportedMimeTypes() {
  const possibleTypes = [
    'video/webm;codecs=av1,opus',
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=h264,opus',
    // "video/webm;codecs=daala",
    // "video/mpeg",
    'video/mp4;codecs=h264,aac',
  ];
  return possibleTypes.filter(mimeType => {
    return MediaRecorder.isTypeSupported(mimeType);
  });
}


// let codecPreferences ;
let errorMsg = ref();
let recordedVideo;

const mimeOptions = ref([])
const mimeType = ref('')


// experimental below
// rec button
const isRecording = ref(false)
const clickRecButton = function () {
  isRecording.value = !isRecording.value;
  console.warn(`recording : ${isRecording.value}`)
  if (isRecording.value) {

  }
  else {

  }
};

function handleError(error) {
  log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
}

const startButtonListener = async () => {
  document.querySelector('button#start').disabled = true;
  const hasEchoCancellation = document.querySelector('#echoCancellation').checked;
  const constraints = {
    audio: {
      echoCancellation: { exact: hasEchoCancellation }
    },
    video: {
      // width: 1280, height: 720
    }
  };
  log('Using media constraints:', constraints);
  await getStream(constraints);
};

function getQuery() {
  // try {
  //   navigator.permissions.query({ name: "camera" }).then(res => {
  //       if(res.state == "granted"){ // has permission
  //           camera.permission='Y'}
  //   });
  // } catch(TypeError) {
  //   camera.permission='X'
  // }

}
function playPauseMedia() {
  if (media.paused) {
    video.setAttribute('data-icon', 'u');
    media.play();
  } else {
    video.setAttribute('data-icon', 'P');
    media.pause();
  }
}


// function getStreamMediaSuccess(stream) {
//   window.stream = stream; // make stream available to browser console
//   video.srcObject = stream;

//   // make track variable available to browser console.
//   const videoTracks = stream.getVideoTracks();
//   log('Got stream with constraints:', constraints);
//   log(`Using video device: ${videoTracks[0].label}`);
//   const [track] = [window.track] = stream.getVideoTracks();
//   // debugger;
//   manageZoom(track);
// }

</script>

<style scoped>
canvas {
  width: 50vw;
}

li.shadow {
  color: yellow;
  opacity: .5;
  text-shadow: black .3em;
}

button#recButton {
  width: 35px;
  height: 35px;
  /* font-size: 0;
	background-color: red; */
  border: 0;
  border-radius: 35px;
  margin: 18px;
  outline: none;
}

.notRec {
  background-color: darkred;
}

.Rec {
  background-color: red;
  animation-name: pulse;
  animation-duration: 1.5s;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
}

@keyframes pulse {
  0% {
    box-shadow: 0px 0px 5px 0px rgba(173, 0, 0, .3);
  }

  65% {
    box-shadow: 0px 0px 5px 13px rgba(173, 0, 0, .3);
  }

  90% {
    box-shadow: 0px 0px 5px 13px rgba(173, 0, 0, 0);
  }
}
</style>
