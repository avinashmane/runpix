
var config = {};

// config = {};
config.app = {};// default from firestore app
config.storage = {};
config.api = {};
config.face = {};
config.images = {};
config.raceMgt = {};

config.raceMgt.ingoredBibStatuses=[null,'','From sheet','From sheet'] 
config.face.minDistx100 = 40
config.images.limit_pics = 5000

config.GS_PREFIX = "https://storage.googleapis.com/run-pix.appspot.com/"
config.storage.uploads =  "uploads"
config.storage.viduploads =  "uploadvid"
config.storage.faceUploads =  "faceuploads"

// format usable for data table
config.startListHeaders=[
  { field: "Bib", header: "Bib", sortable: true },
  { field: "Name", header: "Name", sortable: true },
  { field: "Gender", header: "Gender", sortable: true },
  { field: "Category", header: "Category", sortable: true },
  { field: "Distance", header: "Distance", sortable: true },
  { field: "Status", header: "Status", sortable: true },
]

config.raceInfoPanelLabels={
  id:'Id',
  Name: 'Name',
  Location: 'Location',
  Date : {label:'Date',mask:'9999-99-99',placeholder:'YYYY-MM-DD'},
  linkRace: 'Race link',
  linkReg: 'Registration link',
  raceOrg: 'Event Organizer',
  linkOrg: 'Organizer link',
  linkResults: 'Results link',
  linkPhotos: 'Photos link',
  linkFeedback: 'Feedback link',
}

config.api.faceMatchUpload = import.meta.env.VITE_FACEMATCHUPLOAD 
    || "https://runpix-face-nqmxzlpvyq-uc.a.run.app" //"https://express.runpix.forthe.life" //"http://localhost:8080"//

const isDev=()=>import.meta.env.MODE=='development'
config.app.API_URL = isDev() ?  import.meta.env.VITE_API_URL_PREFIX : 
          `https://us-central1-run-pix.cloudfunctions.net`
config.app.CERT_URL = isDev() ?  import.meta.env.VITE_CERT_URL :
          'https://run-pix-admin-nqmxzlpvyq-uc.a.run.app' ;
console.log('Mode: ',import.meta.env.MODE)


//= process.env.WEB_PORT || 9980;
// import { getDocAsync } from "./api";
// const config_substription=getDocAsync("app/webconfig",(x)=>{
//   console.log("app/webconfig",x)
//   // config=Object.assign(config,x)
// })
// module.exports = config;
export {config}