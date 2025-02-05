<template>
  <div class="container mx-auto">
    
    <Card class="w-full text-center justify-center flex-col rounded " >

      <template #content>
        <RacesCard :menu="['edit', 'results']" :nolist="nolist" />
      </template>
    </Card>

    <TabView>
      <TabPanel header="Process">
          <ToggleSwitch v-model="nolist"/> 
          <p>
            Mark old races as "nolist"
          </p>
      </TabPanel>
      <TabPanel header="Create">
          <p>
            <div class="flex flex-col gap-5 mx-5">
                <!-- <label for="newRaceId">Race Id</label> -->

                <div>
                  <label for="newRaceId">new Race Id</label>
                  <InputText id="newRaceId" v-model="newRaceId" aria-describedby="raceId-help" class="w-full border"/>
                  <small id="username-help">Enter your id for the Race.  Only a-z0-9. All lowercase. No space </small>
                </div>
                <label for="templateRaceId">Template Race Id</label>
                <InputText id="templateRaceId" v-model="templateRaceId" aria-describedby="templateRaceId-help" class="w-full border"/>

                <Button type="button" @click="createNewRace"
                  label="Create"></Button>
            </div>
            
          </p>
      </TabPanel>
      <TabPanel header="Help">
          <Button><a href="https://avinashmane.github.io/runpix-docs/" target="_blank">RunPix Documentation
            <i class="pi pi-external-link"></i>
          </a></Button>
          <p>
            <ol>
              <li>Edit the information of the race</li>
              <li>Start the race</li>
              <li>Record the timing</li>
              <li>Close the races</li>
              <li>Finalize the results</li>
              <li>Upload Photos</li>
              <li>Publish the Photos link</li>
            </ol>   
            
          </p>
      </TabPanel>
  </TabView>
  </div>
</template>

<script setup>
// import { useStore } from 'vuex';
import { useRaceStore } from '../stores';
import { useRouter, useLink } from 'vue-router'
import Card from 'primevue/card' ;
import { computed,ref } from 'vue';
import {dayjs, nextNthSunday} from '../helpers';
import ToggleSwitch from 'primevue/toggleswitch';
import {db} from '../../firebase/config'
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import InputText from 'primevue/inputtext';
import { doc, getDoc ,updateDoc, setDoc } from 'firebase/firestore'
import { getPublicUrl } from "../helpers/index";
import {chain,cloneDeep,map,take,keys,orderBy,sumBy,pickBy,split,sortBy,tap,startsWith,lowerCase}  from "lodash-es"
import RacesCard from '../components/RacesCard.vue';

// const store = useStore()
const raceStore = useRaceStore()
const router = useRouter()

const newRaceId=ref(`mychoice${dayjs().format('YYMMM').toLowerCase()}`)
const templateRaceId=ref(`mychoice24may`)
const races = computed(() => {let arr = raceStore.races
                              if (arr instanceof Object) 
                                arr=orderBy(arr,"Date","desc")
                                if (nolist.value ){
                                  return arr
                                } else {
                                  return arr.filter(x=>!(x.status && x.status.includes('nolist')))
                                }
                              })

// store.dispatch('getRacesAction')

function createNewRace(){
  // debugger;
  if(newRaceId.value){
    let newRace=newRaceId.value.replace(/[^0-9A-z]*/g,"").toLowerCase()
    getDoc(doc(db,`races/${templateRaceId.value}`))
      .then(snap=>{
        let data=snap.data();
        data.id = newRace;
        data.name=newRaceId.value;  
        data.photoStatus="available"
        data.status=[]
        data.timestamp={created:dayjs().toISOString()}
        data.Date=nextNthSunday(1)
        data.Name=`Copy of ${data.Name}`
        setDoc(doc(db,`races/${newRace}`),data)
          .then(x=>
            console.log(`Created race with id ${newRace}`)
          )
      }) 
    router.push(`/race/${newRace}`)
  }
}

let fsdb={races:[]}

let nolist=ref(false)

let klick=() => { 
  debugger;
}


function NOP() {}
// then in the optimised code
NOP(fsdb);
</script>

