<script setup>
import {  computed, ref } from 'vue'
import { useToast } from "primevue/usetoast";
import { db, storage } from "../../firebase/config"
import { getStorage, ref as dbRef, uploadBytes } from "firebase/storage";
import {useStore} from "vuex";
import Button from 'primevue/button';
import Toast from 'primevue/toast';
import Select from 'primevue/select';
// import FileUpload from 'primevue/fileupload';
import { useRoute } from 'vue-router';
import {debug} from "../helpers"

const UPLOADS_FOLDER = 'uploads';

const route = useRoute();  

const props = defineProps({
  raceId: String,
  waypoint: String,
})

const store = useStore()
const userData = store.state.auth.userDetails.userData 

const race = computed(() => {
  for (let r of store.state.datastore.races) 
    if(r.id==route.params.raceId)
      return r
  })

let fileList; // list of File objects
const files = ref([]);
// const fileName = computed(() => file.value?.name);
// const fileExtension = computed(() => fileName.value?.substr(fileName.value?.lastIndexOf(".") + 1));
// const fileMimeType = computed(() => file.value?.type);

const uploadFile = (event) => {
    fileList=event.target.files
    let arr=[]
    for(let i=0;i<fileList.length;i++){
        let file_i = fileList[i]
        let fileObj={}
        for (let x of ['name','size','lastModified','type']){ 
            if (true || file_i.hasOwnProperty(x)){
                fileObj[x]=file_i[x];
            }
        };
        createImage(file_i,i)
        arr.push(fileObj)
    }

  files.value = arr;

};

const submitFile = async () => {

    // const storage = getStorage();

    for (let file of fileList){
        let timestamp = new Date(file.lastModified).toISOString()
        let uploadPath = `${UPLOADS_FOLDER}/${props.raceId}/${timestamp}~${props.waypoint}~${userData.email.replace("@","$")}~${file.name}`

        console.log(uploadPath);
        uploadFiletoGCS(uploadPath, file);
    }

  function uploadFiletoGCS(uploadPath, file) {
    // Create file metadata including the content type
    /** @type {any} */
    const metadata={
      contentType: file.type,
    };

    const storageRef=dbRef(storage, uploadPath);

    // 'file' comes from the Blob or File API
    uploadBytes(storageRef, file, metadata).then((snapshot) => {
      console.log(`Uploaded a blob or file!`);
      // debugger;
    });
  }
};

async function createImage(file_i,i) {
    var reader = new FileReader();
    reader.onload = function(event) {
      const imageUrl = event.target.result;
      debug(event)
        files.value[i]=imageUrl;
    }
    console.log(reader.readAsDataURL(file_i))
}
function removeImage(index) {
  files.value.splice(index, 1)
}
function klick(){
    debugger;
}
</script>

<template>
    {{props.raceId}}/~{{userData.email}}~file
    {{props.waypoint}}
    <div>
        <input id="upload" type="file" accept=".jpg,.png,image/*" multiple @change="uploadFile" />
        <Button @click="submitFile">Submit</Button>
        <Button @click="klick()">debug</Button>
        <table>
            <tr v-for="(f,i) in files">
                <td>{{i}}</td>
                <td>{{new Date(f.lastModified).toLocaleString()}}</td>
                <td>{{f.name}}</td>
                <td>{{f.uploaded?"✅":"▪️"}}</td>
            </tr>
        </table>
    </div>
    <hr/>

</template>

<style scoped>

</style>
