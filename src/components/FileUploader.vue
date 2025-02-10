<template>
    <main class="border-4 m-2 p-2 rounded">

        <h1 class="text-center text-xl my-2" @click="openFile">New uploader</h1>

<!-- {{ logs }} -->
        <Select
                v-model="waypoint"
                :options="waypoints"
                editable
                placeholder="Select a Waypoint"
                class="w-1/2 m-2 px-2 "
            />

        <input ref="fileInput" multiple type="file" @change="handleFileChange" hidden />
        <div class="flex flex-col md:flex-row justify-around w-full ">
            <div class="flex justify-around gap-4">
                <Button @click="fileInput?.click()" :disabled="loadingInProgress" class="p-button">Select</Button>
                <Button @click="clearAllFiles()" :disabled="loadingInProgress" class="p-button">Clear all</Button>
                <Button @click="uploadFilesNow()" :disabled="loadingInProgress" class="p-button">Upload</Button>
            </div>

            <Select class="min-w-32 my-2" v-model="sortKey" :disabled="loadingInProgress" :options="sortOptions" optionLabel="label" @change="sortFiles" />
        </div>

        <Paginator v-if="files.length" v-model:first="first" :rows="rows" :totalRecords="files.length"
            @page="pageHandler" />


        <div class="flex md:flex-row flex-col justify-between">
            <div>
                <label for="ts">Timestamp from filename </label>
                <Checkbox id="ts" v-model="tsFromFilename" binary @change="handleFileChange"/>
            </div>
            {{ loadedFiles }}/{{ files?.length }} files uploaded at {{ waypoint }}
            <br/>

        </div>
        
        <div v-if="loadingFiles" class="text-sm">
                Uploading {{ loadingFiles }} as {{ userStore?.profile?.email }} at {{ waypoint }}</div>
            
        <!-- {{ first }}{{ URLs }} -->
        <div for v-for="(f, i) in files.slice(first, first + rows)" :key="i"
            class="flex flex-col md:flex-row bg-slate-100 dark:bg-slate-900 justify-around w-full ">
            <img v-if="f.file.type.includes('image')" :src="getThumbUrl(f.file)" :alt="f.name"
                class="w-full md:w-1/3 shadow object-contain  m-2 max-h-40 " />
            <div class="flex flex-col w-full">
                <div>{{ f.file.name }}</div>
                <div class="flex-none text-sm" @click="removeFile(i)">
                    🗑️{{ first + i + 1 }} {{ byteValue(f.file.size) }} | {{ showUploadStatus(f.status) }}
                </div>
                
                <div class="flex-1 text-sm">{{ dayjs(f.timestamp).format('YYYY-MM-DD HH:mm:ss') }} | 
                    {{ tsFromFilename ? dayjs(f.file.lastModified).format('YYYY-MM-DD HH:mm:ss') : '-' }} </div>
            </div>
        </div>

    </main>
</template>

<script setup lang="js">
const props = defineProps({
  raceId: String,
  waypoints: {
    type: Array,
    detault: ["VENUE"],
  },
  accepts: {
    type: String,
    default: ".jpg,.png,image/*,video/*"
  },
  user: { //unused
    type: String,
    default: null
  }
});

import { dayjs,getTimeStampFromStr } from '../helpers';
import Checkbox from 'primevue/checkbox';
import Paginator from 'primevue/paginator';
import { useUserStore } from '../stores';
import Select from 'primevue/select';
import Button from 'primevue/button';
import { ref, onBeforeUnmount,computed } from 'vue'
// Uploader
import createUploader from "../helpers/file-uploader";

const waypoint = ref("VENUE");

const userStore = useUserStore()

const tsFromFilename = ref(false); //temp

const loadingInProgress=ref(false)
const checked=ref(false)
const fileInput = ref(null)
const files = ref([])
const rows = ref(5)
const first = ref(0)
const URLs = ref([])
const logs=ref([]) // only for debug
const loadingFiles=computed(()=>files.value.filter(f=>f.status=='loading').map(f=>f.file.name).join(", "))
const loadedFiles=computed(()=>files.value.filter(f=>f.status==true).length)

const  showUploadStatus=(x)=>x?(x===true?'✅':'⏱️'):"-"

function handleFileChange() {
    const files_list=Array.from(fileInput.value?.files)
    console.log(`files list ${files_list.length}`);
    files.value =files_list.map(file=>{
                    // logs.value.push(file.lastModified )
                    
                    return {
                        file:file,
                        timestamp:tsFromFilename.value?
                                getTimeStampFromStr(file.name):
                                file.lastModified,
                        status:null
                }})
    refreshThumbUrls(first.value)
}

function uploadFilesNow() {
    const {uploadFiles}=createUploader({
        raceId: props.raceId,
        waypoint: waypoint.value,
        user: userStore.profile.email,
    });
    loadingInProgress.value=true
    uploadFiles(files.value,(err,res)=>{
        loadingInProgress.value=false
        console.log(err,res)
    })
    // console.log(files)
    // and do other things...
}

function removeFile(index) {
    console.log(files.value)
    if (files.value.length)
        files.value.splice(index, 1)
}

function clearAllFiles() {
    refreshThumbUrls()
    files.value = []
}

function pageHandler(event) {
    refreshThumbUrls(event.first)
    first.value = event.first
    console.log(event)
}

function refreshThumbUrls() {
    Object.entries(URLs.value).forEach(url => {
        URL.revokeObjectURL([url[1]]);
        // console.log(`releasing url for ${url[0]}`)
    })
    URLs.value = []
}

const getThumbUrl = (file) => {
    if (URLs.value[file.name]) { }
    else {
        // console.log(`creating thumb for ${file.name}`)
        const url = URL.createObjectURL(file)
        URLs.value[file.name] = url
    }
    return URLs.value[file.name]
}

onBeforeUnmount(() => {
    refreshThumbUrls()
})



const sortOptions = ref([
    { label: 'Date High to Low', field: 'lastModified', order: -1 },
    { label: 'Date Low to High', field: 'lastModified', order: 1 },
    { label: 'Name A to Z', field: 'name', order: 1 },
    { label: 'Name Z to A', field: 'name', order: -1 },
]);

// const sortKey = ref(sortOptions.value[0])
function sortFiles(e) {
    console.log(e)
}

const byteValueNumberFormatter = Intl.NumberFormat("en", {
    notation: "compact",
    style: "unit",
    unit: "byte",
    unitDisplay: "narrow",
});
const byteValue = (x) => byteValueNumberFormatter.format(x)

</script>

