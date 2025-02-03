<template>
    <main class="border-4 m-2 p-2 rounded">



        <input ref="fileInput" multiple type="file" @change="handleFileChange" hidden />
        <div class="flex flex-col md:flex-row justify-around w-full ">
            <div class="flex justify-around gap-4">
                <Button @click="fileInput?.click()" :disabled="loadingInProgress" class="p-button">Select</Button>
                <Button @click="clearAllFiles()" :disabled="loadingInProgress" class="p-button">Clear all</Button>
                <Button @click="doSomething()" :disabled="loadingInProgress" class="p-button">Upload</Button>
            </div>
            <Select
                v-model="waypoint"
                :options="waypoints"
                editable
                placeholder="Select a Waypoint"
                class="w-1/3 m-1 px-2"
            />
            <Select class="min-w-32 " v-model="sortKey" :disabled="loadingInProgress" :options="sortOptions" optionLabel="label" @change="sortFiles" />
        </div>

        <Paginator v-if="files.length" v-model:first="first" :rows="rows" :totalRecords="files.length"
            @page="pageHandler" />


        <!-- <DataView v-if="files.length" :value="files" paginator :rows="rows" :first="first" @page="pageHandler"
            :sort-field="sortKey.field" :sort-order="sortKey.order" :pt="{
                header: { class: 'bg-red-500 ' },
                content: { class: 'text-lg ' },
                title: { class: 'text-xl' }
            }">
            <template #header> -->
        <div class="flex justify-center">

        </div>
        {{ loadedFiles }}/{{ files?.length }} files uploaded
        <br/>
        Uploading {{ loadingFiles }}  as {{ store.profile.email }}
        
        <!-- {{ first }}{{ URLs }} -->

        <div for v-for="(f, i) in files.slice(first, first + rows)" :key="i"
            class="flex flex-col md:flex-row bg-slate-100 dark:bg-slate-900 justify-around w-full ">
            <img v-if="f.file.type.includes('image')" :src="getThumbUrl(f.file)" :alt="f.name"
                class="w-full md:w-1/3 shadow object-contain  m-2 max-h-40 " />
            <div class="flex flex-col w-full">
                <div>{{ f.file.name }}</div>
                <div class="flex-none text-sm" @click="removeFile(i)">🗑️{{ first + i + 1 }} {{ byteValue(f.file.size) }}</div>

                <div class="flex-1 text-sm">{{ dayjs(f.file.lastModified).format() }} -- {{ f.status }}</div>
            </div>
        </div>
        <!-- </div> -->
        <!-- </template>
        </DataView> -->
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

import { dayjs } from '../helpers';
// import DataView from 'primevue/dataview';
import Paginator from 'primevue/paginator';
import { useUserStore } from '../stores';
import Select from 'primevue/select';
import Button from 'primevue/button';
import { ref, onBeforeUnmount,computed } from 'vue'
// Uploader
import createUploader from "../helpers/file-uploader";

const waypoint = ref("VENUE");

const store = useUserStore()
const { uploadFiles } = createUploader({
  raceId: props.raceId,
  waypoint: waypoint.value,
  user: store.profile.email,
});

const loadingInProgress=ref(false)
const fileInput = ref(null)
const files = ref([])
const rows = ref(5)
const first = ref(0)
const URLs = ref([])

const loadingFiles=computed(()=>files.value.filter(f=>f.status=='loading').length)
const loadedFiles=computed(()=>files.value.filter(f=>f.status==true).length)

function handleFileChange() {
    files.value = Array.from(fileInput.value?.files)
                .map(file=>({
                    file:file,
                    status:null
                }))
    refreshThumbUrls(first.value)
}

function doSomething() {
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

