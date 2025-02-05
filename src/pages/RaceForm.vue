<template>
  <div class="container mx-auto">
    <div class="w-full text-center justify-center flex-col">
      <Card>
        <template #header>
          <div class="w-full">
            <img class="mx-auto max-h-80 shadow-lg" :src="getPublicUrl('processed', race?.id, race?.coverPage)" />
          </div>
        </template>
        <template #title>
          <h1>{{ race?.Name }}</h1>
        </template>
        <template #subtitle>
          {{ raceId }}
        </template>

        <template #content>
          <div id="raceinfo" class=" text-left w-full  ">
            <div class="my-2 flex flex-col md:flex-row md:justify-between">
              <div class="font-thin text-left"> Date: </div>
              <div> {{ race?.Date }} </div>
            </div>
            <div class="my-2 flex flex-col md:flex-row md:justify-between">
              <div class="font-thin text-left">Location </div>
              <div> {{ race?.Location }} </div>
            </div>

            <div class="my-2 flex flex-col md:flex-row md:justify-between ">
              <div class="font-thin text-left">Race Organizer </div>
              <div class="">{{ race?.raceOrg }}
                <a v-if="race?.linkOrg" :href="race?.linkOrg"
                  class="text-blue-600 visited:text-purple-600 hover:decoration-wavy">
                  {{ race?.linkOrg }}</a>
              </div>
            </div>
            <!-- {{isResultAvailable()}} -->
            <div v-for="(lbl, fld) in links" class="my-2 flex flex-col md:flex-row md:justify-between">
              <div class="font-thin text-left"> {{ lbl }}</div>
              <div>
                <div v-if="['linkPhotos', 'linkResults'].includes(fld) || race?.[fld]">

                  <span v-if="fld == 'linkPhotos' && race?.[fld] && race?.photoStatus?.includes('avail')"
                    class="text-right">
                    <Tag value="Available" />&nbsp; 
                    <i class="pi pi-external-link"></i>
                    <!-- <Tag v-else value="Unavailable"/> -->
                  </span>
                  <span v-if="fld == 'linkResults' && isResultAvailable()"
                        @click="router.push(race?.[fld] || `/r/${race?.id}`)">
                    <Tag >Available</Tag><i class="pi pi-external-link"></i>
                    <!-- <Tag v-else value="Unavailable"/> -->
                  </span>
                <span>
                  <a :href="race?.[fld]" class="text-blue-600 visited:text-purple-600 hover:decoration-wavy">
                    {{ race?.[fld] }} </a>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </template>

        <template #footer>
          <div class="flex justify-around gap-2 my-2">

            <a v-if="race?.linkPhotos" :href="race?.linkPhotos">
              <Button name="photos" raised icon="pi pi-images" class="">
              </Button>
            </a>


            <RouterLink v-if="menuButtons && userStore.checkAccess('race', race?.id, 'update')" v-for="(icon, path) in {
              edit: 'pi-pencil',
              bibs: 'pi-list', log: 'pi-clock'
            }" :to="`/e/${race.id}/${path}`">
              <Button :name="path" raised :icon="'pi ' + icon" class="bg-cyan-200" />
            </RouterLink>

            <!-- </div> -->

            <RouterLink v-if="menuButtons && userStore.checkAccess('race', race?.id, 'timing')" v-for="(icon, path) in {
              entry: 'pi-hashtag',
              'entry/video': 'pi-video'
            }" :to="`/e/${race.id}/${path}`">
              <Button :name="path" raised :icon="'pi ' + icon" class="bg-sky-300" />
            </RouterLink>
            <!-- <Button name="entry" label="Enter Bibs" raised icon="pi pi-hashtag" class=""
            :to="`/e/${race.id}/entry`" />
            <Button name="record" label="Record Video" raised icon="pi pi-video" class=""
            :to="`/e/${race.id}/entry/video`" /> -->


            <RouterLink v-if="props.menuButtons && userStore.checkAccess('photos', race?.id, 'timing')"
              :to="`/e/${race.id}/images`">
              <Button name="upload" labe raised icon="pi pi-bolt" class="bg-sky-400" />
            </RouterLink>
          </div>
          <div class="flex justify-around gap-2 my-2">

          <Button name="races" label="Races" raised icon="pi pi-chevron-left" @click="router.push('/e')"></Button>
          <SplitButton v-if="checkAccessEventRole(race?.id)" :label="race?.id" :model="menuItems" raised />
          </div>
        </template>

      </Card>
    </div>
  </div>
  {{ race?.id }}
</template>

<script setup>
let props = defineProps({
  option: String,
  menuButtons: Boolean
})
// import { useStore } from 'vuex';
import { useRaceStore } from '../stores';
import { useRouter, useLink, useRoute } from 'vue-router'
import { computed, ref, reactive } from 'vue';
import Card from 'primevue/card';
import SplitButton from 'primevue/splitbutton';

// import SelectButton from 'primevue/selectbutton';
import { config } from '../config';
import Tag from 'primevue/tag'
import RaceEdit from "../pages/RaceEditCard.vue";
import { getPublicUrl } from "../helpers/index";
import { getUser, checkAccessEventRole } from "../api"
import { chain, cloneDeep, map, take, keys, orderBy, sumBy, pickBy, split, sortBy, tap, startsWith } from "lodash-es"
import { useUserStore } from '../stores';
import {storeToRefs} from 'pinia'
const userStore = useUserStore()
const bibRegexDefault = /^\d{3,5}$/;
const links = ref(pickBy(config.raceInfoPanelLabels, (v, k) => startsWith(k, 'link')))
const route = useRoute();
const router = useRouter()
// const store = useStore()
const raceStore = useRaceStore()
// console.warn(raceStore.raceId)
if(route.params.raceId) 
  raceStore.setRaceId( route.params.raceId)
const menuButtons=ref(props.menuButtons || route.menu)

// store.dispatch('getRacesAction')

const {race} = storeToRefs(raceStore)
let waypoint = race?.value?.waypoint//ref(store.state.datastore.race.waypoint)  //ref("venue")
// const race = computed(() => {
//   try {
//     return store.state.datastore.racesObj[raceId]
//   } catch (e) {
//     return { name: '-', Waypoints: ['VENUE'] } //, error: e 
//   }
// });
const isResultAvailable =()=>["live","final","provisional"].some(x=>race?.value?.status?.includes(x))
const menuItems = [
  {
    label: 'Photos search',
    icon: 'pi pi-images',
    command: () => { router.push(`/p/${race.value?.id}`); }
  },
  {
    label: 'Edit Race',
    icon: 'pi pi-pencil',
    command: () => { router.push(`/e/${race.value?.id}/edit`); }
  },
  {
    label: 'Start List', icon: 'pi pi-list',
    command: () => { router.push(`/e/${race.value?.id}/bibs`); }
  },
  {
    label: 'Enter Bibs', icon: 'pi pi-hashtag',
    command: () => { router.push(`/e/${race.value?.id}/entry`); }
  },
  {
    label: 'Record Video', icon: 'pi pi-video',
    command: () => { router.push(`/e/${race.value?.id}/entry/video`); }
  },
  {
    label: 'Provisional Timing', icon: 'pi pi-clock',
    command: () => { router.push(`/e/${race.value?.id}/log`); }
  },
  {
    label: 'Upload Images', icon: 'pi pi-bolt',
    command: () => { router.push(`/e/${race.value?.id}/images`); }
  },
  {
    label: 'Organizer Website',
    icon: 'pi pi-external-link',
    command: () => {
      window.location.href = race.value.linkOrg;
    }
  },
];

let raceStatus = ref("")
let raceStatusOptions = ['Started', 'Stopped']
const options = ref(['Record', 'Start List', 'Provisional', 'Final Results',
]); //'Info',,'Images'
const option = ref(props.option ?? 'Info');


// console.log({ "race": race, raceId: raceId, props: props, user: getUser() })

// let js=(x)=>JSON.parse(JSON.stringify(x))

let klick = () => {
  debugger;
}

var jsonify = function (o) {
  var seen = [];
  var jso = JSON.stringify(o, function (k, v) {
    if (typeof v == 'object') {
      if (!seen.indexOf(v)) { return '__cycle__'; }
      seen.push(v);
    } return v;
  });
  return jso;
};

let timer = ref({
  timerId: null,
  milliseconds: 1000,
  now: '',
  time: '',
  duration: ''
})
function startTimer() {
  // console.debug(this)
  timer.value.timerId = setInterval(getTime, timer.value.milliseconds); //setting the loop with time interval
}

</script>

<style scoped>
div.p-selectbutton ::v-deep(div) {
  padding: 2px;
}

table#raceinfo ::v-deep(div) {
  padding-top: .5em;
  border-top: thin lightgrey;
}

/* btn {
  @apply bg-blue-500 hover:bg-blue-400
} */
</style>