<template>
  <div class="container mx-auto">
    
    <Card class="w-full text-center justify-center flex-col rounded">

      <template #content>
        <RacesCard :menu="['edit', 'results']" :nolist="nolist"/>

      </template>
    </Card>

    <TabView>
      <TabPanel header="Process">
          <InputSwitch v-model="nolist"/> 
          <p>
            Mark old races as "nolist"
          </p>
      </TabPanel>
      <TabPanel header="Create">
          <p>
            <div class="flex gap-5 mx-5">
                <!-- <label for="newRaceId">Race Id</label> -->
                <Button type="button" @click="createNewRace"
                  label="Create"></Button>
                <InputText id="newRaceId" v-model="newRaceId" aria-describedby="raceId-help" class="w-1/3 border"/>

            </div>
            <small id="username-help">Enter your id for the Race.  Only a-z0-9. All lowercase. No space </small>
          </p>
      </TabPanel>
      <TabPanel header="Record">
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
import { useStore } from 'vuex';
import { useRouter, useLink } from 'vue-router'
import Card from 'primevue/card' ;
import { computed,ref } from 'vue';
import {getDateTime} from '../helpers';
import InputSwitch from 'primevue/inputswitch';
import {db} from '../../firebase/config'
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import InputText from 'primevue/inputtext';
import { doc, getDoc ,updateDoc, setDoc } from 'firebase/firestore'
import { getPublicUrl } from "../helpers/index";
import {chain,cloneDeep,map,take,keys,orderBy,sumBy,pickBy,split,sortBy,tap,startsWith}  from "lodash-es"
import RacesCard from '../components/RacesCard.vue';

const store = useStore()
const router = useRouter()

const newRaceId=ref('newrace23month')
const races = computed(() => {let arr = store.state.datastore.races
                              if (arr instanceof Object) 
                                arr=orderBy(arr,"Date","desc")
                                if (nolist.value ){
                                  return arr
                                } else {
                                  return arr.filter(x=>!(x.status && x.status.includes('nolist')))
                                }
                              })

store.dispatch('getRacesAction')

function createNewRace(){
  // debugger;
  if(newRaceId.value){
    let newRace=newRaceId.value.replace(/[^0-9A-z]*/g,"").toLowerCase()
    getDoc(doc(db,'races/default'))
      .then(snap=>{
        let data=snap.data();
        data.id = newRace;
        data.name=newRaceId.value;  
        data.photoStatus="available"
        data.status=[]
        setDoc(doc(db,`races/${newRace}`),data)
          .then(x=>
            console.log(`Created race with id ${newRace}`)
          )
      }) 
  }
}

let fsdb={races:[]}

let nolist=ref(false)

// let js=(x)=>JSON.parse(JSON.stringify(x))

let klick=() => { 
  debugger;
}

// const races=getRaces(fsdb)
// debugger;
// console.log(fsdb)

function NOP() {}
// then in the optimised code
NOP(fsdb);
</script>

