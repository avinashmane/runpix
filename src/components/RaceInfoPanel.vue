<template>

  <form>
    <template v-for="(label,key) in labels" >
      <div class="w-full flex flex-col md:flex-row mb-2 w-full text-left" v-if="!'Waypoints id'.includes(key)">
        <div class="text-sm p-0 w-full md:w-[30%]">
            {{(typeof label=="string") ? label : label.label}}
        </div>
        <div class="pr-1 w-full">
          <InputText v-if='typeof label=="string"' :disabled="!editable" class="w-full"
              v-model="race[key]" autofocus />
          <InputMask v-else :disabled="!editable"  class="w-full"
              v-model="race[key]" v-bind:mask="label.mask" :placeholder="label.placeholder" />
        </div>
      </div>
    </template>

    <div class="w-full flex flex-col md:flex-row mb-2 w-full text-left" >
      <div class="text-sm p-0 w-full md:w-[30%]">
        Distances
      </div>
      <div class="pr-1 w-full">
        <InputText :disabled="!editable" separator="," class="w-full"
          v-model="raceArr.Distances" aria-labelledby="multiple" />
      </div>
    </div>
    <div class="w-full flex flex-col md:flex-row mb-2 w-full text-left" >
      <div class="text-sm p-0 w-full md:w-[30%]">
        Waypoints
      </div>
      <div class="pr-1 w-full">
        <InputText :disabled="!editable" class="w-full"
          v-model="raceArr.Waypoints" aria-labelledby="multiple" />
      </div>
    </div>

    <div>
      <small>Status</small>
      <MultiSelect :disabled="!editable" class="status-button"
        v-model="race.status"  :options="raceStatusOptions"
        multiple aria-labelledby="multiple" />
    </div>

    <div v-for="(v,k) in race.timestamp" class="capitalize">
      {{k}} : {{dayjs(v).format("MMM D, YYYY h:mm:ss A Z")}} 
    </div>
    
    <Inplace :disabled="!editable">
        <template #display>
            <span class="pi pi-search" style="vertical-align: middle"></span>
            <span style="margin-left: 0.5rem; vertical-align: middle">View Watermark</span>
        </template>
        <template #content>
            <img class="w-full" alt="Watermark" :src="`https://storage.googleapis.com/run-pix.appspot.com/ref/watermark/${raceId}.png`" />
        </template>
    </Inplace>
    
    <div class="flex-row">
      <ToggleButton v-model="editable" onLabel="Review" offLabel="Edit"
      onIcon="pi pi-edit" offIcon="pi pi-no" class="w-9rem bg-blue-500 hover:bg-blue-400" />
      <Button :disabled="!editable" @click="saveChanges" class="w-9rem bg-blue-500 hover:bg-blue-400">Save Changes</Button>
      <Button :disabled="!editable" @click="flagOff" class="w-9rem bg-blue-500 hover:bg-blue-400">Flag Off</Button>
    </div>
  </form>
  <div v-if="!editable">
    NOTE: You need to be in edit mode to make changes or flag-off
  </div>
</template>

<script setup>
const props =  defineProps({
  race: Object,
  waypoint: String
})
import InputMask from 'primevue/inputmask';
import SelectButton from 'primevue/selectbutton';
import Inplace from 'primevue/inplace';
import InputText from 'primevue/inputtext';
import Chips from 'primevue/chips'
import ToggleButton from 'primevue/togglebutton';
import IftaLabel from 'primevue/iftalabel';
import MultiSelect from 'primevue/multiselect';
// import { useStore } from 'vuex';
import { useUserStore, useRaceStore} from '../stores'
import { computed ,ref, reactive } from 'vue';
import { useRoute } from 'vue-router';
import { doc, getDoc ,updateDoc, setDoc } from 'firebase/firestore'
import {db} from '../../firebase/config'

import {chain,cloneDeep,map,take,keys,orderBy,sumBy,pickBy,split,sortBy,tap,startsWith} from 'lodash-es'
import { getLocalDateTime,dayjs ,debug } from '../helpers';
import { config } from '../config';
import {storeToRefs} from 'pinia'
// let js=(x)=>JSON.parse(JSON.stringify(x))
let getArr=(x,sep=',')=> (x && typeof x ==  "string" )? x.split(sep): x 
let joinArr=(x,sep=",")=>{//debug(x);
      let ret = (x && x instanceof Array) ? x.filter((v, i, arr) => arr.indexOf(v) === i)
        .map(x=>typeof x ==  "string"?x.toUpperCase():String(x).toUpperCase()).join(sep) : x
      return ret
    }


const route = useRoute();  
const raceId = route.params.raceId

// const store = useStore()
// store.dispatch('getRacesAction')
const raceStore = useRaceStore()
const userStore = useUserStore()
raceStore.setRaceId(raceId)
let {race}=storeToRefs(raceStore)
// let race=computed(()=>{
//   let racefilt=store.state.datastore.races.filter(r=>r.id==raceId);
//   if(racefilt.length) {
//     Object.keys(arrayLabels).forEach((k)=>{if(k in racefilt[0]) raceArr.value[k]=joinArr(racefilt[0][k])})
//     return racefilt[0]
//   } else return {name:'-',Waypoints:['VENUE']}
//   });

const labels=config.raceInfoPanelLabels
const arrayLabels={
  'Waypoints':'Waypoints',
  'Distances':'Distances'
}

const editable=ref(false)
const raceArr=ref({})
const raceStatusOptions = ref([
                 'planned', 'started' ,'stopped' , 
                 'provisional' , 'final' ,'nolist' 
            ]);



let flagOff=(e,a)=>{
  const now=new Date().toISOString()
  
  if (!race.value.timestamp)
    race.value.timestamp={}
  
  race.value.timestamp['start']=now
      
  let ts=cloneDeep(race.value.timestamp)
  
  updateDoc(doc(db,`races/${raceId}`),{'timestamp':ts})
  setDoc(doc(db,
    'races',raceId,'readings',`${now}_START_${props.waypoint}`),
    {
      timestamp: now,
      userId: userStore?.profile?.email //store.state.auth.userDetails.userData.email
    }
  );
  debug(ts)
  editable.value=false;
}

let saveChanges=(e)=>{
  const now=new Date().toISOString()
  let UpdValues=cloneDeep(race.value)
  
  if (!race.value.timestamp)  UpdValues['timestamp']={'create': now}
  UpdValues['timestamp']['modify']= now
  
  for (let arrayValue of Object.keys(arrayLabels)) {
    UpdValues[arrayValue]=getArr(raceArr.value[arrayValue])
  }
  if(!UpdValues.Waypoints) UpdValues.Waypoints=['VENUE','END']
  if(!UpdValues.Distances) UpdValues.Distances=['5K','10K']

  // debug(`races/${raceId}`,JSON.stringify(UpdValues))
  updateDoc(doc(db,`races/${raceId}`),UpdValues)

  editable.value=false;
}

let klick=() => { 
  // debug(value.value.map(x=>x.value).join('/'))
  debugger;
}

</script>

<style scoped>

.p-button-label{
  margin: 0;
  color: red;
}

ToggleButton,
Button {
  padding: .5rem;
  vertical-align: middle;
  height: 3rem;
  margin-inline: 1em;
  /* color: red; */
}
</style>