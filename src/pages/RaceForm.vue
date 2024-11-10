<template>
  <div class="container mx-auto">
    <div class="w-full text-center justify-center flex-col">
      <Card>
        <template #header>
          <div class="w-full">
            <img class="mx-auto max-h-80 shadow-lg" :src="getPublicUrl('processed', raceObj?.id, raceObj?.coverPage)" />
          </div>
        </template>
        <template #title>
          <h1>{{ raceObj?.Name }}</h1>
        </template>
        <template #subtitle></template>
        <template #content>
          <table id="raceinfo" class="table-auto text-left w-full  ">
            <tr>
              <td> Date: </td>
              <td> {{ raceObj?.Date }} </td>
            </tr>
            <tr>
              <td>Location </td>
              <td> {{ raceObj?.Location }} </td>
            </tr>

            <tr>
              <td>Race Organizer </td>
              <td>{{ raceObj?.raceOrg }}
                <a v-if="raceObj?.linkOrg" :href="raceObj?.linkOrg"
                  class="text-blue-600 visited:text-purple-600 hover:decoration-wavy">
                  {{ raceObj?.linkOrg }}</a>
              </td>
            </tr>
            {{isResultAvailable()}}
            <tr v-for="(lbl, fld) in links" class="flex gap-2">
              <div v-if="['linkPhotos','linkResults'].includes(fld) || raceObj?.[fld] ">
               {{ lbl }}
                <span v-if="fld == 'linkPhotos' && raceObj?.[fld] && raceObj?.photoStatus?.includes('avail')">
                  <Tag value="Available" />&nbsp; 
                  <i class="pi pi-external-link"></i>
                  <!-- <Tag v-else value="Unavailable"/> -->
                </span>
                <span v-if="fld == 'linkResults' && isResultAvailable()"
                      @click="router.push(raceObj?.[fld] || `/r/${raceObj?.id}`)">
                  <Tag >Available</Tag><i class="pi pi-external-link"></i>
                  <!-- <Tag v-else value="Unavailable"/> -->
                </span>
              <span>
                <a :href="raceObj?.[fld]" class="text-blue-600 visited:text-purple-600 hover:decoration-wavy">
                  {{ raceObj?.[fld] }} </a>
                </span>
              </div>
            </tr>

          </table>
        </template>

        <template #footer>
          <div class="flex justify-around gap-2 my-2">

            <a v-if="raceObj?.linkPhotos" :href="raceObj?.linkPhotos">
              <Button name="photos" raised icon="pi pi-images" class="">
              </Button>
            </a>


            <RouterLink v-if="menuButtons && userStore.checkAccess('race', raceObj?.id, 'update')" v-for="(icon, path) in {
              edit: 'pi-pencil',
              bibs: 'pi-list', log: 'pi-clock'
            }" :to="`/e/${raceObj.id}/${path}`">
              <Button :name="path" raised :icon="'pi ' + icon" class="bg-cyan-200" />
            </RouterLink>

            <!-- </div> -->

            <RouterLink v-if="menuButtons && userStore.checkAccess('race', raceObj?.id, 'timing')" v-for="(icon, path) in {
              entry: 'pi-hashtag',
              'entry/video': 'pi-video'
            }" :to="`/e/${raceObj.id}/${path}`">
              <Button :name="path" raised :icon="'pi ' + icon" class="bg-sky-300" />
            </RouterLink>
            <!-- <Button name="entry" label="Enter Bibs" raised icon="pi pi-hashtag" class=""
            :to="`/e/${raceObj.id}/entry`" />
            <Button name="record" label="Record Video" raised icon="pi pi-video" class=""
            :to="`/e/${raceObj.id}/entry/video`" /> -->


            <RouterLink v-if="props.menuButtons && userStore.checkAccess('photos', raceObj?.id, 'timing')"
              :to="`/e/${raceObj.id}/images`">
              <Button name="upload" labe raised icon="pi pi-bolt" class="bg-sky-400" />
            </RouterLink>
          </div>
          <div class="flex justify-around gap-2 my-2">

          <Button name="races" label="Races" raised icon="pi pi-chevron-left" @click="router.push('/e')"></Button>
          <SplitButton v-if="checkAccessEventRole(raceObj?.id)" :label="raceObj?.id" :model="menuItems" raised />
          </div>
        </template>

      </Card>
    </div>
  </div>
</template>

<script setup>
let props = defineProps({
  option: String,
  menuButtons: Boolean
})
import { useStore } from 'vuex';
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

const userStore = useUserStore()
const bibRegexDefault = /^\d{3,5}$/;
const links = ref(pickBy(config.raceInfoPanelLabels, (v, k) => startsWith(k, 'link')))
const route = useRoute();
const router = useRouter()
const store = useStore()
const raceId = route.params.raceId
const menuButtons=ref(props.menuButtons || route.menu)

store.dispatch('getRacesAction')
let waypoint = ref(store.state.datastore.race.waypoint)  //ref("venue")

const raceObj = computed(() => {
  try {
    return store.state.datastore.racesObj[raceId]
  } catch (e) {
    return { name: '-', Waypoints: ['VENUE'] } //, error: e 
  }
});
const isResultAvailable =()=>["live","final","provisional"].some(x=>raceObj?.value?.status?.includes(x))
const menuItems = [
  {
    label: 'Photos search',
    icon: 'pi pi-images',
    to: `/p`
  },
  {
    label: 'Edit Race',
    icon: 'pi pi-pencil',
    command: () => { router.push(`/e/${raceObj.value?.id}/edit`); }
  },
  {
    label: 'Start List', icon: 'pi pi-list',
    command: () => { router.push(`/e/${raceObj.value?.id}/bibs`); }
  },
  {
    label: 'Enter Bibs', icon: 'pi pi-hashtag',
    command: () => { router.push(`/e/${raceObj.value?.id}/entry`); }
  },
  {
    label: 'Record Video', icon: 'pi pi-video',
    command: () => { router.push(`/e/${raceObj.value?.id}/entry/video`); }
  },
  {
    label: 'Provisional Timing', icon: 'pi pi-clock',
    command: () => { router.push(`/e/${raceObj.value?.id}/log`); }
  },
  {
    label: 'Upload Images', icon: 'pi pi-bolt',
    command: () => { router.push(`/e/${raceObj.value?.id}/images`); }
  },
  {
    label: 'Organizer Website',
    icon: 'pi pi-external-link',
    command: () => {
      window.location.href = raceObj.value.linkOrg;
    }
  },
];

let raceStatus = ref("")
let raceStatusOptions = ['Started', 'Stopped']
const options = ref(['Record', 'Start List', 'Provisional', 'Final Results',
]); //'Info',,'Images'
const option = ref(props.option ?? 'Info');


// console.log({ "race": raceObj, raceId: raceId, props: props, user: getUser() })

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

table#raceinfo ::v-deep(td) {
  padding-top: .5em;
  border-top: thin lightgrey;
}

/* btn {
  @apply bg-blue-500 hover:bg-blue-400
} */
</style>