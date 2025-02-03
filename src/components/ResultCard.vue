<template>
<Card>
    <!-- <template #header>
        <img alt="user header" src="/images/finisher.png" />
    </template> -->
    <template #title>
      <div class="w-full text-white bg-primary text-center">{{ getFinishStatus() }}</div>
      <div class="flex flex-row w-full ">
        <img
        :src="getPublicUrl('processed', race.id, race.coverPage)"
        class="w-[20%] h-[20%] mr-2 rounded-full"
        />
        <div>
          <div class=" w-full text-2xl">{{ race.Name }} </div>
          <div class=" w-full text-base">{{ race.Location }} </div>
          <div class=" w-full text-base">{{ race.Date }} </div>
        </div>
      </div>
    </template>

    <template #content>
      <div class="relative isolate">
        <span class="w-full absolute top-0 left-0 text-center mt-8 text-4xl">{{ initials(bibData.Name ) }}</span>
        <img src="/assets/graphics/award.svg"
        class="h-40 mx-auto"/>
      </div>

      <table class="mx-auto">
        <tr>
          <td class="w-1/3">Bib</td>
          <td class="w-2/3">{{ bibData.Bib }}</td>
        </tr>
        <tr>
          <td>Name</td>
          <td>{{ bibData.Name }}</td>
        </tr>
        <tr>
          <td>Gender</td>
          <td>{{ bibData['Gender'] }}</td>
        </tr>
        <tr>
          <td>Race</td>
          <td>{{ bibData.Race }}</td>
        </tr>
        <tr>
          <td>Start</td> 
          <td>{{ time(bibData['Start Time']) }}</td>
        </tr>
        <tr>
          <td>Finish</td>
          <td>{{ time(bibData['Finish Time']) }}</td>
        </tr>
        <tr>
          <td>Net Time</td>
          <td>{{ bibData['Race Time'] }}</td>
        </tr>
        <tr>
          <td>Category</td>
          <td>{{ bibData.Category }}</td>
        </tr>
        <tr>
          <td>Rank</td>
          <td>{{ bibData.Rank }}</td>
        </tr>
        <tr v-if="bibData.device_name">
          <td>Device</td>
          <td>{{ bibData.device_name }} ({{ bibData.event }})</td>
        </tr>
        <tr v-if="bibData.activity">
          <td>Activity</td>
          <td><a class="text-blue-600 dark:text-blue-500 hover:underline" 
            :href="`https://www.strava.com/activities/${bibData.activity}`" >{{bibData.activity }}</a>&nbsp;
            <small> Check out the activity!</small></td>
          
        </tr>          
      </table>


      <div class="w-full flex flex-col justify-center mt-2">
          <div v-if="race?.status.includes('final')" class="text-center">
              Official Results
          </div>

          <div v-if="race?.status.includes('provisional')"
            class="text-center"
            >
              Provisional Results
          </div>            

          <Certificate v-if="race?.certificate" 
                :template="race?.certificate?.finisherCertificate"
                :data="getCertData()" 
                class="w-full"
                />

      </div>

    </template>
  </Card>
</template>
<script setup>
const props=defineProps({
  race: Object,
  bibData: Object,
  getCertData: Function
})
import Card from 'primevue/card';
import { getPublicUrl } from "../helpers";
import Certificate  from '../components/CertificateView.vue';
import {ref} from 'vue'
import dayjs from 'dayjs'

const race=ref(props.race)
const bibData=ref(props.bibData)
const getFinishStatus = () => !isNaN(bibData.value.Rank) ? 'FINISHER' : 'FINISH STATUS'

function initials(name){
  const titles='DR.MR.'
  if (typeof name=="string")
    return name.split(/[\. ]/)
                .filter(x=>!titles.includes(x.toUpperCase()))
                .map(x=>x.toUpperCase().slice(0,1))
                .join("")
}
function time(time_str){
  // if only time is passed?
  if(! (/(am|pm)/i.test(time_str))) 
    time_str= race.value.Date+" "+time_str
  return dayjs(time_str).format('HH:mm:ss A Z')
}
</script>