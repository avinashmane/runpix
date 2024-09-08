<template>

      <Card>
        <template #title > 
            <BackButton/>
            <span @click="klick">Race id {{raceId}} {{ route.params?.mode }}</span>
        </template>

        <template #content>
          
          <tr >
            <td class="p-inputgroup-addon w-sm" @click="klick">
                Waypoint
            </td>
            <td>
              <!-- {{ race }} -->
              <Dropdown v-model="waypoint" :options="race?.Waypoints" editable 
                  placeholder="Select a Waypoint" class="md:w-14rem" />   
              </td>
          </tr>

            <div>
                <CameraVideo v-if="route.params?.mode=='video'" 
                    :waypoint="waypoint" :raceId="raceId" 
                    :race="race"  /> 
                <Camera v-else :waypoint="waypoint"  
                    :race="race" :raceId="raceId" /> 
                <geo-loc/>
            </div>
        
          </template>

      </Card>       

</template>

<script setup>
import { useStore } from 'vuex';
import Camera from "../components/Camera.vue";
import CameraVideo from "../components/CameraVideo.vue";
import GeoLoc from "../components/GeoLoc.vue";
// import RaceLog from "../components/RaceLogCard.vue";
// import RaceStartList from "../components/RaceStartListCard.vue";
// import RaceImages from "../components/RaceImagesCard.vue";
// import RaceInfoPanel from "../components/RaceInfoPanel.vue";
import BackButton from '../components/BackButton.vue'

import Card from 'primevue/card';

import SelectButton from 'primevue/selectbutton';


import Dropdown from 'primevue/dropdown';
import { computed, ref, reactive } from 'vue';
import { useRoute } from 'vue-router';
import {chain,cloneDeep,map,take,keys,orderBy,sumBy,pickBy,split,sortBy,tap,startsWith}  from "lodash-es"

let props = defineProps ({
  option: String
})

const bibRegexDefault = /^\d{3,5}$/;

const route = useRoute();  
const raceId = route.params.raceId
console.log(route)
const store = useStore()
store.dispatch('getRacesAction')
let waypoint=ref(store.state.datastore.race.waypoint)  //ref("venue")

let raceObj
let race=computed(()=>{

  let racefilt=store.state.datastore.races.filter(r=>r.id==raceId);

  if(racefilt.length>0) {
    // debugger
    raceObj=cloneDeep(racefilt[0])
  
    return raceObj //racefilt[0]
  } else 
    return {name:'-',Waypoints:['VENUE']}
});


let bibRegex=computed(()=>{
  console.warn(race.bibPattern)
  if (race.bibPattern){ 
    let bibPattern=race.bibRegex  ;
    if (bibPattern.slice(-1)!='$') bibPattern=bibRegex+'$';
    if (bibPattern.substring(0,1)!='^') bibPattern='^'+bibRegex;
    return RegExp(bibPattern) 
  } else  
    return  bibRegexDefault; 
  } );

let raceStatus=ref("")
let raceStatusOptions=['Started','Stopped']
const options = ref(['Record','Start List','Provisional','Final Results',
            ]); //'Info',,'Images',Upload
const option = ref(props.option ?? 'Info');


console.log({"bibRegex":bibRegex,"race":race, raceId:raceId, props:props})


let klick=() => { 
  debugger;
}

var jsonify=function(o){
    var seen=[];
    var jso=JSON.stringify(o, function(k,v){
        if (typeof v =='object') {
            if ( !seen.indexOf(v) ) { return '__cycle__'; }
            seen.push(v);
        } return v;
    });
    return jso;
};

let timer =ref({
  timerId:null,
  milliseconds:1000,
  now:'',
  time:'',
  duration:''
})

function startTimer() {
        // console.debug(this)
        timer.value.timerId = setInterval(getTime, timer.value.milliseconds); //setting the loop with time interval
}

function getTime() {
  let now=new Date()
  // let timer="Not started"
  // console.log(race.value.timestamp.start)
  // if (store.state.datastore.races.length) debugger
  // if (race && race.value.timestamp && race.value.timestamp.start) {
  try{
    timer.value.start = new Date(race.value.timestamp.start)
    timer.value.duration=new Date(now - timer.value.start)
  // } else {
  } catch (e) {
    timer.value.duration = 'N/A'
  }
  timer.value.now=now.toLocaleString()
}

function stopGPS() {
        console.log('stoping Timer ',geoLocPerm)
        clearInterval(timer.value.timerId); //call this line to stop the loop
      
}
startTimer()

</script>

<style scoped>
div.p-selectbutton  ::v-deep(div) {
  padding: 2px;
}
</style>