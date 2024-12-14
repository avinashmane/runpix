<template>
  <Card id="result_select">
    <template #content>
      <h1 @dblclick="klick()" class="text-lg">Results </h1>

      <RaceSelectionByYear v-model="raceId"
        :races="races"
        @change="loadRace"
      ></RaceSelectionByYear>

      <div class="card flex justify-content-center w-full mt-2">
        <Button @click="cancelBibSelection()"><i class="pi pi-times w-6 "></i></Button>

        <AutoComplete v-model="bibSelection" showClear :suggestions="items" @complete="searchBib"
          :dropdown-click="searchBib" class="w-full " inputClass="w-full px-2 mx-2" />
        <Button name="searchResults" @click="searchResults" icon="pi pi-search" raised></Button>
      </div>
    </template>
  </Card>


  <div v-if="bibSelection && ('Name' in bibData) && raceId" class="container  text-xl mx-auto mt-30 center">
    <!-- <small>{{ message }}</small> -->
    <ResultCard :race="race" :bibData="bibData" :get-cert-data="getCertData">
    </ResultCard>
  </div>
  

  <!--Show the leader board -->
  <Card v-if="!bibSelection && raceInfo.top" class="w-full mx-auto my-2 ">
      <template #subtitle>
        <div class="flex w-full justify-end">
          <a v-if="race.linkPhotos && ['available'].includes(race.photoStatus)" 
              :href="race.linkPhotos" class="p-button font-bold text-white">
              Photos
          </a>
          <a v-if="race.linkFeedback" :href="race.linkFeedback" class="p-button font-bold  text-white">
            Feedback
          </a>
        </div>
        <hr/>
        <div class="w-full mx-auto">
          <div class="text-2xl text-center">{{race.Name}}</div>
          <div class="text-xl text-center">{{race.Date}}</div>
          <div class="text-lg text-center">{{race.Location}}</div>
        </div>
      </template>

      <template #content>
        <div v-for="catTop, cat in raceInfo.top">
          <h2 class="text-2xl bg-indigo-300 shadow-lg px-2 rounded my-2">{{ cat }}</h2>
          <div class="w-full">
            <div v-for="r, category in catTop" @click="setBib(r.Bib)" 
              class="flex flex-row shadow-md justify-left items-center">
              <span v-for="f in ['Rank', 'Bib', 'Name', 'Race Time']" 
                :class="f+'   p-1 text-sm'">
                {{ r[f] }}
              </span>
            </div>
          </div>
        </div>
      </template>
  </Card>
  
  <img v-else src="/assets/graphics/finish.jpg" class="m-[10%] w-[80%]"/>

  <!-- {{races.map(x=>x.status)}} -->
</template>

<script setup>
import { config } from "../config"
import { useStore } from 'vuex';

import AutoComplete from 'primevue/autocomplete';
import Card from 'primevue/card';
import ResultCard from "../components/ResultCard.vue"
import RaceSelectionByYear from "../components/RaceSelectionByYear.vue"
import { collection, getDocs, doc, query, where, limit, onSnapshot } from "firebase/firestore"; //ref as dbRef,
import { db } from "../../firebase/config"
import { useRoute, useRouter } from 'vue-router';
import { computed, ref } from 'vue';
import {chain,cloneDeep,map,take,keys,orderBy,groupBy,sumBy,pickBy,split,sortBy,tap,startsWith, each}  from "lodash-es"
// import * as _ from 'lodash-es'

const router = useRouter()
const route = useRoute();
const params = route.params;
const store = useStore()
store.dispatch('getRacesAction')

const races = computed(() => orderBy(store.state.datastore.races
  .filter(x => checkResStatus(x)),
  "Date","desc")
)
let race = computed(() =>
  (races.value.length && raceId.value) ?
    races.value.find(x => x.id == raceId.value) : { Name: '' })

let raceId = ref(params.raceId)
// let bib = ref(params.bib)

if (params.raceId)
  loadRaceId(params.raceId)


const bibSelection = ref(params.bib);
const items = ref([]);
const entries = ref([])
const message = ref("")
let filteredBibObjects = ref([])

let bibData = computed(() => {
  if (!filteredBibObjects.value.length) 
    return {}

  let filt = filteredBibObjects.value.filter(x => x.Bib == bibSelection.value.split(' ')[0])
  return filt.length ? filt[0] : {}
})



/////////////////////////////
const searchBib = async (event) => {
  // exit if raceId is not selected
  if (!raceId.value) return;
  console.log(raceId.value)
  // debugger
  var raceBibsCol = collection(db, "races", raceId.value, "result");
  entries.value = []
  let n = 10,
    _items = [];
  console.warn(`Search bib ${event.query}`)
  let searchField = isNaN(event.query) ?
    'Name' : 'Bib';
  let qryString = isNaN(event.query) ?
    event.query.toUpperCase() : event.query;
  let querySnapshot = await getDocs(
    query(raceBibsCol,
      where(searchField, ">=", qryString),
      where(searchField, "<=", qryString + '\uf8ff'),
      limit(n))
  );

  querySnapshot.forEach((doc) => {
    let data = doc.data()
    _items.push(data);
  });

  // map values to list and database
  if (_items.length) {
    filteredBibObjects.value = _items;
    items.value = _items.map(data => [
      data.Bib,
      // data.Race,
      data.Name
    ].join(' - '));
  } else {
    items.value = [event.query.split(" ")[0]]
  }
  message.value = "..."
  console.warn(_items)
}


const searchResults = async () => {
  let bibNo = bibSelection.value.split(" ")[0]

  if (!raceId.value) {
    message.value = `Select race `
    return []
  }
  console.log(`searching for ${bibNo}`)
  return await searchResultsForBib(bibNo)
}

if (params.bib)
  searchResults()

async function searchResultsForBib(bibNo) {
  let containsOperator = '==',//"array-contains",
    _items = [];

  if (bibNo.toUpperCase() == 'MISSING') {
    bibNo = []
    containsOperator = '=='
  }

  message.value = `Searching results for ${bibSelection.value} `

  var resultsCol = collection(db, "races", raceId.value, "result"); //  

  let querySnapshot = await getDocs(
    query(resultsCol,
      where('Bib', containsOperator, bibNo),
    ));
  if (querySnapshot.docs.length) {
    for (let i = 0; i < querySnapshot.docs.length; i++) {
      let data = querySnapshot.docs[i].data()

      if (!(data.status && data.status == "hidden")){      
        _items.push(mapBibResult(data));
      }
    };
    filteredBibObjects.value = _items
    entries.value = _items;
    message.value = `Found  `
    return _items
  }
  message.value = `Not found`
}

function mapBibResult(data) {
  data=JSON.parse(JSON.stringify(data))
  if ('Rank' in data){
    data['Rank'] = `${data['Rank']}`;
  }
  return data
}

const raceInfo = ref({})

let loadRace = (e) => {
  let raceId = e.value;
  // console.log(raceId)
  if (raceId) {
    // debugger
    loadRaceId(raceId)
  }
  router.replace(`/r/${e.value}`)

}
const setBib = async (bibNo) => {
  bibSelection.value = bibNo
  // debugger
  // await searchBib()
  router.replace(`/r/${raceId.value}/${bibNo}`)
  await searchResults()
}
function cancelBibSelection(){
  bibSelection.value = ''; 
  entries.value = [];
  router.replace(`/r/${raceId.value}`)
}

let klick = () => {
  debugger;
}

const checkResStatus = (race) => {
  
  if (race.status)
    return (race.status.includes('final') || race.status.includes('provisional'))
}

async function loadRaceId(raceId) {
  var resultsCol = collection(db, "races", raceId, "result"); //  
  return await getDocs(
    query(resultsCol, where('Rank', '<=', 5),))
    .then(querySnapshot => {
      let data = querySnapshot.docs.map(doc => {
        let dat = doc.data()
        if (!'valid'.includes(dat.Status)) {
          ["Start Time", "Race Time", "Finish Time"].forEach(x => dat[x] = '')
        }
        return dat;
      });
      // tree shaking has problem with chain
      // raceInfo.value.top = _.chain(data)
      //   .groupBy("Category")
      //   .pickBy((x, k) => { console.log(">",k); return !k.includes('Other') })
      //   .value()
      raceInfo.value.top = pickBy(
                              groupBy(data,"Category"),
                              (x, k) => { console.log(">",k); return !k.includes('Other') })

    })
}

function getCertData(){
  return Object.assign({
      cert_key: [race.value.id,
                bibData.value.Bib,
                race.value.certificate.finisherCertificate.slice(0,8)
              ].join('-'), 
      race_name: race.value.Name,
      race_date: race.value.Date,
      cert_url: window.location.href
      },
      bibData.value
    )

}

</script>

<style scoped>table tr td:first {
  font-variant: small-caps;
}

span.Rank {
  @apply w-[1rem] text-center
}
span.Bib {
  @apply text-xl min-w-[5rem] text-center
}
span.Name {
  @apply w-full flex-1 text-center
}
span.Time {
  @apply justify-self-end text-center flex-initial
}
</style>