<template>

  <div class="container mx-auto">
    <div class="w-full text-center justify-center flex-col">
      <Card>
        <template #title > 
          <span @click="klick">Race id {{raceId}}             </span>
        </template>

        <template #content>
          
          <tr v-if="option!='Info'">
            <td class="p-inputgroup-addon w-sm" @click="klick">
                Waypoint
            </td>
            <td>
              <!-- {{ race }} -->
              <Select v-model="waypoint" :options="race?.Waypoints" editable 
                  placeholder="Select a Waypoint" class="md:w-14rem" />   
              </td>
          </tr>
        </template>

      </Card>
      <div class="w-full my-2">
        <SelectButton v-model="option" :options="options"/>
      </div>

      <Card>
          <template #content>

            <race-info-panel v-if="option=='Info'" :waypoint="waypoint"/>
            <router-link to="/e" class="text-xl">
              <Button raised icon="pi pi-chevron-left" class="p-2"/> 
            </router-link>

            <!-- <RaceStartList v-if="option=='Start List'" :raceId="raceId" :race="race"/> -->

            <div v-if="option=='Record'">
              <Camera :waypoint="waypoint" :raceId="raceId" 
              :race="race"  /> 
              <!-- :bibs="bibs" -->
              <geo-loc/>
            </div>
            <RaceLog v-if="option=='Provisional'" :waypoint="waypoint" :raceId="raceId" :race="race"/>


            <!-- <RaceImages :waypoint="waypoint" v-if="option=='Images'"
                        :bibRegex="race.bibPattern" :raceId="raceId"/> -->
            <!-- <router-link :to="'/e/'+raceId+'/i'"><Button>Images</Button></router-link> -->
        
          </template>

          <!-- <template #footer>
            <router-link to="/races">
              <Button name="races" >Races</Button>
            </router-link>
            <Button name="create" @click="klick">Check</Button>
          </template> -->
    
      </Card>       
    </div>
  </div>
</template>

<script setup>
import { useStore } from 'vuex';
// import Camera from "../components/old_Camera.vue";
import Camera from "../components/Camera.vue";
import GeoLoc from "../components/GeoLoc.vue";
import RaceLog from "../components/RaceLogCard.vue";
// import RaceStartList from "../components/RaceStartListCard.vue";
import RaceImages from "../components/RaceImagesCard.vue";
import RaceInfoPanel from "../components/RaceInfoPanel.vue";

import Card from 'primevue/card';

import SelectButton from 'primevue/selectbutton';


import Select from 'primevue/select';
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