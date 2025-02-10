<template>
  
<Card>
    <!-- <template #header>
        <img alt="user header" src="/images/finisher.png" />
    </template> -->
    <template #title>
      <div class="w-full text-white dark:text-slate-100 bg-slate-700 dark:bg-primary-100 text-center rounded-lg shadow-lg py-3">{{ race.Name }}</div>
      <div class="flex flex-row w-full mt-10">
        <img v-if="race.coverPage"
        :src="getPublicUrl('processed', race.id, race.coverPage)"
        class="w-[20%] h-[20%] mr-2 rounded-full"
        />
        <SvgTextCicle v-else class="mx-auto m-2"
            width="250" 
            :upper="race.Date" 
            :title="getFinishStatus()"
            :subtitle="race.Name"
            :lower="race.Location" 
            :pt="{rim:{ fill: 'lightskyblue', 
                    class:'text-blue-300 shadow-xl',
                    fontSize: 30},
                  title:{fontSize: 40, 
                    baseline:'hanging',
                    class:'font-bold text-white'},
                  subtitle:{fontSize: 20, 
                    baseline:'middle ',
                    class: 'text-red-300 shadow-lg w-full',
                  }}"
            >
        </SvgTextCicle>
      </div>
    </template>

    <template #content>
      <div class="mx-auto">
        <div v-for="(v,k) in resultData"
          class="flex flex-col md:flex-row w-full justify-between gap-2">
          <div class="font-thin text-center md:text-start text-sm">{{ k }}</div>
          <div class="font-bold text-center md:text-end">{{ v }}</div>
          <hr class="md:hidden"/>
        </div>

        <div v-if="bibData.device_name">
          <div  class="font-thin text-center md:text-start">Device</div>
          <div>{{ bibData.device_name }} ({{ bibData.event }})</div>
        </div>
        <div v-if="bibData.activity">
          <div class="font-thin text-center md:text-start">Activity</div>
          <div class="font-bold text-center md:text-end"><a class="text-blue-600 dark:text-blue-500 hover:underline" 
            :href="`https://www.strava.com/activities/${bibData.activity}`" >{{bibData.activity }}</a>&nbsp;
            <small> Check out the activity!</small></div>
          
          </div>          
      </div>

      <div class="relative isolate">
        <span class="w-full absolute top-0 left-0 text-center mt-8 text-4xl">{{ initials(bibData.Name ) }}</span>
        <img src="/assets/graphics/award.svg" alt="award ribbon"
              class="h-40 mx-auto w-full dark:invert"/>
            
      </div>

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
import SvgTextCicle from '../components/SvgTextCircle.vue';
import { getPublicUrl, dayjs } from "../helpers";
import Certificate  from '../components/CertificateView.vue';
import {ref, computed} from 'vue'


const race=ref(props.race)
const bibData=ref(props.bibData)
const getFinishStatus = () => !isNaN(bibData.value.Rank) ? 'FINISHER' : 'FINISH STATUS'

const resultData=computed(() => {
  return {
          Bib: props.bibData.Bib ,
          Name: props.bibData.Name, 
          Race: props.bibData.Race,
          "Net Time": props.bibData['Race Time'],
          Start: timeFmt(props.bibData['Start Time']),
          Finish: timeFmt(props.bibData['Finish Time']),

          Gender: props.bibData['Gender'],
          Category: props.bibData.Category,
          Rank: props.bibData.Rank}
})

function initials(name){
  const titles='DR.MR.'
  if (typeof name=="string")
    return name.split(/[\. ]/)
                .filter(x=>!titles.includes(x.toUpperCase()))
                .map(x=>x.toUpperCase().slice(0,1))
                .join("")
}
function timeFmt(time_str){
  // if only time is passed?
  // if( (/(am|pm)/i.test(time_str))){
  if(time_str?.split(' ')[0].includes('day')) {  // first word includes day
    return dayjs(time_str+' UTC').format('HH:mm:ss A Z')
    time_str= time_str.split(' ').slice(1).join(' ' )// skip first column i.e.
  } else {
    time_str= race.value.Date+" "+time_str
    console.log(time_str)
    return dayjs(time_str).format('HH:mm:ss A Z')
  }
}
</script>