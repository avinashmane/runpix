<template>
<!-- {{bibs}} -->
  <div id="container w-full ">
    <div class="flex flex-row justify-around">
      <div class="flex flex-col">
        <b>Waypt : {{waypoint}}</b>  
        <small v-if="['VENUE'].includes(waypoint)"> Not valid for timing</small>
      </div>      
      <div class="flex flex-col">
        <!-- h-[2rem] w-[2rem] label="Camera" -->
        <span>Camera</span>
        <ToggleSwitch v-model="camera.perm"  @click="toggleVideo" 
                  @dblclick="klick" aria-labelledby="single" />
      </div>
    </div>
    <div v-if="bib" id="lookupoverlay" 
      class="absolute background-0 text-xl text-left text-light">
      <ul >
        <li v-for="b in bibs" class="shadow text-ref-600/70 p-1">
          {{b.Bib}} {{b.Name}}
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
      <div class="flex flex-column gap-2 p-float-label">
        <InputText id="bib" v-model="bib" placeholder="Enter a single bib number" 
          aria-describedby="bib-help" class="w-1/3 border bg-yellow-50"/>
        <Button v-for="d in race?.Distances" @click="recordBib(d)" class="text-white p-2 bg-blue-500 hover:bg-blue-400">
          {{d}}
        </Button>
          
      </div>
      
        <!-- <SelectButton :options="race.Distances" :model="distance"></SelectButton> -->
    </form>

    <div v-if="camera.perm">
      <Button @click="recordBib(null)">Snapshot</Button>
      <div class="label" @click="klick">Zoom:</div>
      <input name="zoom" type="range" disabled>
    </div>

    
    <canvas :hidden="!camera.perm"></canvas>

    <div  v-if="camera.perm">

        <div id="video">
          <!-- <video id="gum" playsinline autoplay muted></video> -->
          <video id="recorded" playsinline ></video>  <!--loop-->
          <div>
              <button id="recButton" @click="clickRecButton" :disabled="button.record.disabled"
              :class="{ Rec: isRecording, notRec: !isRecording }"></button>
              <!-- <Button id="start" @click="startButtonListener">Start camera</Button> -->
              <Button id="record" @click="recordButtonListener" 
                :disabled="button.record.disabled">{{button.record.text}}</Button>
              <Button id="play" @click="playButtonListener" 
                :disabled="button.play.disabled">Play</Button>
              <!-- <Button id="download" @click="downloadButtonListener" 
                :disabled="button.download.disabled">Download</Button> -->
              <Button id="download" @click="uploadVideo" 
                :disabled="button.download.disabled">Upload</Button>
          </div>
          <ol>
            <li  v-for="(v,k) in recordedBlobs">
              {{k}} {{v.size}}
              <Button  @click="playButtonListener(k)" 
                :disabled="button.play.disabled">Play</Button>
            </li>
          </ol>
          <Select :options="mimeOptions" v-model="mimeType" :disabled="button.mimeType.disable"/>
          
          <div>
              <h4>Media Stream Constraints options</h4>
              <p>Echo cancellation: <input type="checkbox" id="echoCancellation"></p>
          </div>

          <div>
            {{recordedBlobs.length}} {{Object.values(recordedBlobs).reduce((sum,f)=>sum=sum+f.size,0)/10**6}}
              <span>{{errorMsg}}</span>
          </div>
        </div>
    </div>
  </div>
  <!-- <button @click="klick">x</button> -->
</template>

<script setup>
  const props = defineProps({
    raceId: String,
    waypoint: String,
    race: Object,
    // bibs: Object,
  })
  import {onMounted, computed,   reactive, ref  } from 'vue'
  import {getAllDocs} from '../api'
// import ToggleButton from 'primevue/togglebutton';
  import InputText from 'primevue/inputtext';
  import SelectButton from 'primevue/selectbutton';
  import Select from 'primevue/select';
  import ToggleSwitch from 'primevue/toggleswitch';
  import { getDateTime  } from "../helpers"
  import {db,  storage  } from "../../firebase/config"
  import { doc, getDoc ,updateDoc, setDoc } from 'firebase/firestore'
  import { ref as stoRef,  uploadBytes,  uploadString  } from "firebase/storage";
// import { useStore } from "vuex";
// const store = useStore()
// const captureCount = store.state.captureCount
  import { useUserStore, useRaceStore } from '../stores';
  import { config } from '../config';
  const str=(x)=>JSON.stringify(x)
  const userStore = useUserStore()
  const raceStore = useRaceStore()

  const UPLOADS_FOLDER = config.storage.uploads;
  const UPLOADVIDS_FOLDER = config.storage.uploadvid
  
  const userData = userStore.profile//store.state.auth.userDetails.userData

  /**
   * navigator.mediaDevices.getSupportedConstraints()  
   */
   const checked = ref(false);
  const bib = ref("")
  const distance=ref(null)
  // Put variables in global scope to make them available to the browser console.
  let video = null;
  let canvas = null;

  const constraints = {
    audio: false,
    //  audio: {echoCancellation: {exact: hasEchoCancellation}}
    video: {
      facingMode: "environment",
    // width: 1280, height: 720
    }
  };
  const shadowOptions={
      shadowOffsetX : 2,
      shadowOffsetY : 2,
      shadowBlur : 1,
      shadowColor : "#FFF4",
      fillStyle : "Black",
      font : "20px serif",
  }
  const userAgent = navigator.userAgent;
  // /Android|iPhone|iPad/i.test(navigator.userAgent)

  let camera = reactive({
    perm: false,
    permission: 'N'
  })

  onMounted(() => {
    startup();
    getAllDocs(`races/${props.raceId}/bibs`).then(x=>allBibs=x)
    recordedVideo = document.querySelector('video#recorded');
    })

  let klick=()=>{debugger};
  

  async function startup() {
    if (camera.perm==false) return;
    console.log('startup',str(camera))
    
    video = document.querySelector('video');
    canvas = window.canvas = document.querySelector('canvas');
    canvas.width = 480;
    canvas.height = 360;

    
    await init(constraints)
      .then(x=>  getQuery())
      .catch(err=>console.error(err))
  }

  function handleMediaSuccess(stream) {
    window.stream = stream; // make stream available to browser console
    video.srcObject = stream;

    // make track variable available to browser console.
    const videoTracks = stream.getVideoTracks();
    console.log('Got stream with constraints:', constraints);
    console.log(`Using video device: ${videoTracks[0].label}`);
    const [track] = [window.track] = stream.getVideoTracks();
    // debugger;
    try {
      const capabilities = track.getCapabilities();
      const settings = track.getSettings();

      for (const ptz of ['zoom']) { //'pan', 'tilt', 
        // Check whether camera supports pan/tilt/zoom.
        if (!(ptz in settings)) {
          errorMsg=`Camera does not support ${ptz}.`;
          continue;
        }

        // Map it to a slider element.
        const input = document.querySelector(`input[name=${ptz}]`);
        input.min = capabilities[ptz].min;
        input.max = capabilities[ptz].max;
        input.step = capabilities[ptz].step;
        input.value = settings[ptz];
        input.disabled = false;
        input.oninput = async event => {
          try {
            const constraints = {advanced: [{[ptz]: input.value}]};
            await track.applyConstraints(constraints);
          } catch (err) {
            console.error('applyConstraints() failed: ', err);
          }
        };
      }
    }
    catch(err) {
      console.log('Setting zoom failed: ', JSON.stringify(err).substring(0,80))
    }
  }

  function handleError(error) {
    console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
  }

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

  function toggleVideo(e) {
    console.log(e,e.target.checked)
    // camera.perm = !camera.perm;
    console.log('toggleVideo',str(camera),video)
    if (e.target.checked){ //change from camera.perm on 6-nov
      setTimeout(startup,100);
    }else if (video){
      video.pause();
      // video.src=null;
      for (const track of video.srcObject.getTracks()) {
        track.stop();
      }
      video.srcObject = null;
    } 
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


  let capture = function (ts,wpt,counter) {
    wpt = wpt || props.waypoint
    let timestamp = ts || new Date().toISOString()
    // debugger
    let email = userData.email || "userData.email"

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    let ctx=canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, );//canvas.width, canvas.height
    // 'file' comes from the Blob or File API
    let uploadPath = `${UPLOADS_FOLDER}/${props.raceId}/${timestamp}~${wpt}~${email.replace("@","$")}~img_${counter}.png`

    let uploadRef = stoRef(storage, uploadPath);
    const metadata = {
      contentType: 'image/png',
    };

    canvas.toBlob(blob => {
      console.log(`Uploading ${blob.size}b to ${uploadPath}`, blob);

      uploadBytes(uploadRef, blob).then((snapshot) => {
        console.log(`Uploaded a blob or file! ${snapshot.ref.fullPath}`,snapshot);
        Object.assign(ctx,shadowOptions)
        ctx.fillText(uploadPath, 10, 30);
      }).catch(e => {
        console.error("Error uploading " + JSON.stringify(e))
      });
      
    })

  };


  function recordBib(dist){
    // if bib is mentioned...update firebase
    const counter = userStore.getCounter('capture')//getCaptureCounter()
    let ts=new Date().toISOString()
    let bibNo=bib.value.trim()
    // console.log(dist,bib.value,bibNo)
    if (bibNo) {
      
      let email = userData.email || "userData.email"    
      let payload = {bib: bibNo,
        timestamp :ts,
        type: `keyed ${counter}`,
        userId: email.replace("@","$"),
        waypoint: String(dist) || props.waypoint 
      }
      setDoc(doc(db,`races/${props.raceId}/readings/${ts}_${bibNo}`),payload).then(x=>{
        console.log(`${bibNo} ${ts} saved for ${dist}`,camera.perm)
        bib.value=''
      }).catch(console.error)
      // if camera is on send image too
      // debugger;
    }
    // if camera is on them upload image
    if (camera.perm) {
      capture(ts,dist,counter) // assuming waypoint is passed as distance
    }
  }

let allBibs=[]
const bibs = computed((n=10)=> allBibs.filter(x=>
          x.Bib.includes(bib.value)).slice(0,n))//

// This code is adapted from
// https://rawgit.com/Miguelao/demos/master/mediarecorder.html

'use strict';

/* globals MediaRecorder */

let mediaRecorder;
let recordedBlobs={};
let tsVideo // timestamp of current video
let button=reactive({"record":{"text":'Start Recording'},
                     "play":{},
                     "download":{},
                     "mimeType":{"disabled":true}
                    })

const recordButtonListener= () => {

  if (button.record.text === 'Start Recording') {
    startRecording();
    button.record.text = 'Stop Recording';

  } else {
    stopRecording();
    button.record.text = 'Start Recording';
    button.play.disabled = false;
    button.download.disabled = false;
    button.mimeType.disabled=false
  }
};

const playButtonListener= (idx) => {
  const _mimeType = mimeType.value.split(';', 1)[0];
  let superBuffer
  // debugger// console.warn(idx)

  if (idx in recordedBlobs){
    superBuffer = recordedBlobs[idx]
  } else {
    superBuffer = new Blob(Object.values(recordedBlobs), {type: _mimeType});
  }
  recordedVideo.src = null;
  recordedVideo.srcObject = null;
  recordedVideo.src = window.URL.createObjectURL(superBuffer);
  recordedVideo.addEventListener("ended", (event) => {
    URL.revokeObjectURL(recordedVideo.src);
  console.log(
    "Video stopped either because it has finished playing or no further data is available."
    );
  });
  recordedVideo.controls = true;
  recordedVideo.play();
};


const uploadVideo=(event,wpt,ts) => {
  const counter = userStore.getCounter('capture')//getCaptureCounter()
  wpt = wpt || props.waypoint
  let timestamp = ts || new Date().toISOString()
  // debugger
  let email = userData.email || "userData.email"
  let uploadPath = `${UPLOADVIDS_FOLDER}/${props.raceId}/${timestamp}~${wpt}~${email.replace("@","$")}~vid_${counter}.webm`
  let uploadRef = stoRef(storage, uploadPath);
  const metadata = {    contentType: 'video/webm', };

  const blob = new Blob(Object.values(recordedBlobs), metadata);
  console.log(`Uploading ${blob.size}b to ${uploadPath}`, blob);

  uploadBytes(uploadRef, blob, metadata).then((snapshot) => {
    console.log(`Uploaded a video! ${snapshot.ref.fullPath}`,snapshot);
  }).catch(e => {
    console.error("Error uploading " + JSON.stringify(e))
  });
      

}
const downloadButtonListener=  () => {
  const blob = new Blob(Object.values(recordedBlobs), {type: 'video/webm'});
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

// function getCaptureCounter() {
//   // const counter=store.state.counters.capture;
//   // store.dispatch('incrementCountAction', 'capture');
//   return userStore.getCounter('capture');
// }

function handleDataAvailable(event) {
  // timeStamp
  let ts
  
  ts = tsVideo.includes('STOP') ? tsVideo.split("STOP")[0] : tsVideo
  
  if (event.data && event.data.size > 0) {
    recordedBlobs[ts]=event.data;
  }
  // start time for next video
  tsVideo=tsVideo.includes('STOP') ? '' : new Date().toISOString()
  console.log(`handleDataAvailable ${tsVideo} ${ts}`, event.data);

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

function startRecording() {
  // recordedBlobs = [];
  const _mimeType = mimeType.value;
  const options = {_mimeType};

  try {
    mediaRecorder = new MediaRecorder(window.stream, options);
    tsVideo=new Date().toISOString();
    recordedBlobs[tsVideo]='WIP';
  } catch (e) {
    console.error('Exception while creating MediaRecorder:', e);
    errorMsg = `Exception while creating MediaRecorder: ${JSON.stringify(e)}`;
    return;
  }

  console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
  button.record.text = 'Stop Recording';
  button.play.disabled = true;
  button.download.disabled = true;
  button.mimeType.disable=true
  mediaRecorder.onstop = (event) => {
    console.log('Recorder stopped: ', event);
    console.log('Recorded Blobs: ', recordedBlobs);
  };
  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.start();
  console.log('MediaRecorder started', mediaRecorder);
}

function stopRecording() {
  mediaRecorder.stop();
  tsVideo=tsVideo+'STOP'
}

function handleSuccess(stream) {
  button.record.disabled = false;
  console.log('getUserMedia() got stream:', stream);
  window.stream = stream;
  // console.trace(stream)
  const gumVideo = document.querySelector('video#gum');
  gumVideo.srcObject = stream;

  mimeOptions.value=getSupportedMimeTypes()
  if (mimeOptions.value.length) 
    mimeType.value=mimeOptions.value[0]

  button.mimeType.disable=false
}

async function init(constraints) {
  try {
    const stream = await navigator.mediaDevices
                .getUserMedia(constraints);
    console.trace(constraints)
    handleSuccess(stream);
  } catch (e) {
    const stream = await navigator.mediaDevices
                .getUserMedia({audio:false,video:true});
    console.trace(constraints,stream)    
    console.error('navigator.getUserMedia error:', e);
    // debugger
    errorMsg = `navigator.getUserMedia error:${e.toString()}`;
  }
}

const startButtonListener= async () => {
    document.querySelector('button#start').disabled = true;
    const hasEchoCancellation = document.querySelector('#echoCancellation').checked;
    const constraints = {
      audio: {
        echoCancellation: {exact: hasEchoCancellation}
      },
      video: {
        // width: 1280, height: 720
      }
    };
    console.log('Using media constraints:', constraints);
    await init(constraints);
  };

// let codecPreferences ;
let errorMsg ;
let recordedVideo ;

const mimeOptions=ref([])
const mimeType=ref('')
// rec button
const isRecording=ref(false)
const clickRecButton=function(){
  isRecording.value=!isRecording.value;
  console.warn(`recording : ${isRecording.value}`)
	if(isRecording.value){

	}
	else{

	}
};	

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

.notRec{
	background-color: darkred;
}

.Rec{
  background-color: red;
	animation-name: pulse;
	animation-duration: 1.5s;
	animation-iteration-count: infinite;
	animation-timing-function: linear;
}

@keyframes pulse{
	0%{
		box-shadow: 0px 0px 5px 0px rgba(173,0,0,.3);
	}
	65%{
		box-shadow: 0px 0px 5px 13px rgba(173,0,0,.3);
	}
	90%{
		box-shadow: 0px 0px 5px 13px rgba(173,0,0,0);
	}
}

</style>
