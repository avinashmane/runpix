<template>
<Card>
    <!-- <template #header>
        <img alt="user header" src="/images/finisher.png" />
    </template> -->
    <template #title>
      <div class="flex flex-row w-full ">
        <img
        :src="getPublicUrl('processed', race.id, race.coverPage)"
        class="w-[20%] h-[20%] mr-2 rounded-full"
        />
        <div>
          <div class=" w-full">{{ getFinishStatus() }}</div>
          <div class=" w-full text-2xl">{{ race.Name }} </div>
          <div class=" w-full text-base">{{ race.Location }} </div>
          <div class=" w-full text-base">{{ race.Date }} </div>
        </div>
      </div>
    </template>

    <template #content>

      <table>
        <tr>
          <td colspan="2" class="text-center"><i class="pi pi-star" style="font-size: 2rem"></i></td>
        </tr>
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
          <td>{{ bibData['Start Time'] }}</td>
        </tr>
        <tr>
          <td>Finish</td>
          <td>{{ bibData['Finish Time'] }}</td>
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


      <div class="mx-auto mt-2">
          <div v-if="race?.status.includes('final')" class="mx-auto">
              Official Results
          </div>

          <div v-if="race?.status.includes('provisional')"
            class="mx-auto"
            >
              Provisional Results

          </div>            

          <Certificate v-if="race?.certificate" 
                :template="race?.certificate?.finisherCertificate"
                :data="getCertData()" />

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

const race=ref(props.race)
const bibData=ref(props.bibData)
const getFinishStatus = () => !isNaN(bibData.value.Rank) ? 'FINISHER' : 'FINISH STATUS'


</script>