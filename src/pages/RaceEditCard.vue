<template>
  <div class="container mx-auto">
    <div class="w-full text-center justify-center">
      <Card>
        <template #title>
          <BackButton></BackButton>
          <span @click="klick">Race id {{ raceId }} </span>
        </template>

        <template #content>
          <div class="flex items-center gap-4">
            <span>
              WayPoint
            </span>
            <Select v-model="waypoint" :options="race?.Waypoints" editable
              placeholder="Select a Waypoint" />
          </div>
        </template>

      </Card>

      <!-- <div class="w-full my-2">
        <SelectButton v-model="option" :options="options" />
      </div> -->

      <!-- <div class="card flex justify-center m-2"> -->
        <!-- <Card>
          <template #content> -->
        <Stepper value="1" class="basis-[50rem]">
          <div class="bg-surface-50 dark:bg-surface-900">

          <StepItem value="1">
            <Step>Master Data</Step>
            <StepPanel v-slot="{ activateCallback }">
              <race-info-panel :waypoint="waypoint" />

              <div class="flex pt-6 justify-end">
                <Button label="Next" icon="pi pi-arrow-right" iconPos="right" @click="activateCallback('2')" />
              </div>
            </StepPanel>
          </StepItem>

          <StepItem value="2">
            <Step>Start List</Step>
            <StepPanel v-slot="{ activateCallback }">
              <div class="flex flex-col m-4">
                Load the bibs.
                <Button @click="router.push(`/e/${race.id}/bibs`)">Start List</Button>
              </div>
              <div class="flex pt-6 justify-between">
                <Button label="Back" severity="secondary" icon="pi pi-arrow-left" @click="activateCallback('1')" />
                <Button label="Next" icon="pi pi-arrow-right" iconPos="right" @click="activateCallback('3')" />
              </div>
            </StepPanel>
          </StepItem>
          <StepItem value="3">
            <Step>Race Ops</Step>
            <StepPanel v-slot="{ activateCallback }">
              <div class="flex flex-col m-4">
                <!-- <Camera :waypoint="waypoint" :raceId="raceId" :race="race" />
                  <geo-loc /> -->
                  <Button @click="router.push(`/e/${race.id}/entry`)">Race Timing</Button>
              </div>
              <div class="flex pt-6 justify-between">
                <Button label="Back" severity="secondary" icon="pi pi-arrow-left" @click="activateCallback('2')" />
                <Button label="Next" icon="pi pi-arrow-right" iconPos="right" @click="activateCallback('4')" />
              </div>
            </StepPanel>
          </StepItem>

          <StepItem value="4">
            <Step>Provisional Results</Step>
            <StepPanel v-slot="{ activateCallback }">
              <div class="flex flex-col h-24 m-4">
                <!-- <RaceLog :waypoint="waypoint" :raceId="raceId" :race="race" /> -->
                <Button @click="router.push(`/e/${race.id}/log`)">Race Log</Button>
              </div>
              <div class="pt-6">
                <Button label="Back" severity="secondary" icon="pi pi-arrow-left" @click="activateCallback('3')" />
                <Button label="Next" icon="pi pi-arrow-right" iconPos="right" @click="activateCallback('5')" />
              </div>
            </StepPanel>
          </StepItem>

          <StepItem value="5">
            <Step>Photo Ops</Step>
            <StepPanel v-slot="{ activateCallback }">
              <div class="flex flex-col h-24 m-4">
                <Button><RouterLink :to="`/e/${raceId}/images`">Race Photos</RouterLink></Button>
              </div>
              <div class="pt-6">
                <Button label="Back" severity="secondary" icon="pi pi-arrow-left" @click="activateCallback('4')" />
                <Button label="Next" icon="pi pi-arrow-right" iconPos="right" @click="activateCallback('6')" />
              </div>
            </StepPanel>
          </StepItem>

          <StepItem value="6">
            <Step>Closure</Step>
            <StepPanel v-slot="{ activateCallback }">
              <div class="flex flex-col h-48">
                <div
                  class="border-2 border-dashed border-surface-200 dark:border-surface-700 rounded bg-surface-50 dark:bg-surface-950 flex-auto flex justify-center items-center font-medium">
                  Content III</div>
              </div>
              <div class="pt-6">
                <Button label="Back" severity="secondary" icon="pi pi-arrow-left" @click="activateCallback('5')" />
              </div>
            </StepPanel>
          </StepItem>
        </div>
        </Stepper>
      <!-- </template>
      </Card> -->
      <!-- </div> -->


      <Card>
        <template #content>
          <router-link to="/e" class="text-xl">
            <Button raised icon="pi pi-chevron-left" class="p-2" >Races</Button>
          </router-link>

          <!-- <RaceStartList v-if="option=='Start List'" :raceId="raceId" :race="race"/> -->

        </template>

      </Card>
    </div>
  </div>

</template>

<script setup>

import Stepper from 'primevue/stepper';
import StepList from 'primevue/steplist';
import StepPanels from 'primevue/steppanels';
import StepItem from 'primevue/stepitem';
import Step from 'primevue/step';
import StepPanel from 'primevue/steppanel';
import BackButton from "../components/BackButton.vue"
// import { useStore } from 'vuex';
import { useRaceStore } from '../stores';
// import Camera from "../components/old_Camera.vue";
import Camera from "../components/Camera.vue";
import GeoLoc from "../components/GeoLoc.vue";
// import RaceLog from "../components/RaceLogCard.vue";
// import RaceStartList from "../components/RaceStartListCard.vue";
import RaceImages from "../components/RaceImagesCard.vue";
import RaceInfoPanel from "../components/RaceInfoPanel.vue";

import Card from 'primevue/card';

import SelectButton from 'primevue/selectbutton';


import Select from 'primevue/select';
import { computed, ref, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { chain, cloneDeep, map, take, keys, orderBy, sumBy, pickBy, split, sortBy, tap, startsWith } from "lodash-es"
import {storeToRefs} from 'pinia'
let props = defineProps({
  option: String
})

const bibRegexDefault = /^\d{3,5}$/;

const route = useRoute();
const router = useRouter();

const raceId = route.params.raceId

// const store = useStore()
// store.dispatch('getRacesAction')
const raceStore = useRaceStore()
raceStore.setRaceId(raceId)
let {race} = storeToRefs(raceStore)
let waypoint = raceStore.race?.waypoint//ref(store.state.datastore.race.waypoint)  //ref("venue")


// let raceObj
// let race = computed(() => {

//   let racefilt = store.state.datastore.races.filter(r => r.id == raceId);

//   if (racefilt.length > 0) {
//     // debugger
//     raceObj = cloneDeep(racefilt[0])

//     return raceObj //racefilt[0]
//   } else
//     return { name: '-', Waypoints: ['VENUE'] }
// });


let bibRegex = computed(() => {
  console.warn(race.bibPattern)
  if (race.bibPattern) {
    let bibPattern = race.bibRegex;
    if (bibPattern.slice(-1) != '$') bibPattern = bibRegex + '$';
    if (bibPattern.substring(0, 1) != '^') bibPattern = '^' + bibRegex;
    return RegExp(bibPattern)
  } else
    return bibRegexDefault;
});

let raceStatus = ref("")
let raceStatusOptions = ['Started', 'Stopped']
const options = ref(['Record', 'Start List', 'Provisional', 'Final Results',
]); //'Info',,'Images',Upload
const option = ref(props.option ?? 'Info');


console.log({ "bibRegex": bibRegex, "race": race, raceId: raceId, props: props })


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

function getTime() {
  let now = new Date()
  // let timer="Not started"
  // console.log(race.value.timestamp.start)
  // if (store.state.datastore.races.length) debugger
  // if (race && race.value.timestamp && race.value.timestamp.start) {
  try {
    timer.value.start = new Date(race.value.timestamp.start)
    timer.value.duration = new Date(now - timer.value.start)
    // } else {
  } catch (e) {
    timer.value.duration = 'N/A'
  }
  timer.value.now = now.toLocaleString()
}

function stopGPS() {
  console.log('stoping Timer ', geoLocPerm)
  clearInterval(timer.value.timerId); //call this line to stop the loop

}
startTimer()

</script>

<style scoped>div.p-selectbutton ::v-deep(div) {
  padding: 2px;
}</style>