<template>

  <Card class="container bg-skyblue-300 flex content-center">
  
    <template #header>
      Race Details
      <!-- <h1 class="text-2xl font-bold mx-auto">{{ race.name }}</h1> -->
      <img
        :src="getPublicUrl('processed', race.id, props.race.coverPage)"
        class="w-[30%] "
      />
    </template>
    <template #content>
        <div class="mx-auto mt-8">
            <div v-if="props.race.status.includes('final')" class="mx-auto">
                Official Results
            </div>
            <div v-else>
                <div
                v-if="props.race.status.includes('provisional')"
                class="mx-auto"
                @click="getCertificate(race, bibData)"
                >
                Provisional Results
                </div>
            </div>
        <!-- {{ props.race.status }} -->
        </div>
    </template>
  </Card>
</template>

<script setup>
const props = defineProps({
    race: Object,
    bibData: Object
})

import { config } from "../config";
import Card from 'primevue/card'
import { getPublicUrl } from "../helpers";
import axios from 'axios';
    
const GS_PREFIX = config.GS_PREFIX;


function getCertificate(race,bibData){
    console.log(race,bibData)
    config.app.CERT_URL = config.app.CERT_URL || 'https://run-pix-admin-nqmxzlpvyq-uc.a.run.app' ;
    const url='https://run-pix-admin-nqmxzlpvyq-uc.a.run.app/cert?cert=run_dist'
    console.log(race.id,race.forms,bibData)
    
    // axios.get(`${GS_PREFIX}/certificates/${
      axios.post(config.app.CERT_URL+'/cert?cert=run_dist', bibData)
      .then((ret) => {
        console.log('Upload success',ret);
    
              
        message.value=`Searching faces in the uploaded image`
        setTimeout(()=>{message.value=''},5000)
      })
      .catch(e=>{
        if (e?.response?.status==422){
          console.log('No faces found in the uploaded image')
        } else
          console.warn(e)
        uploadedImage.value=null
      });
      

}
</script>
