/** * Only certifiacte related data here */
<template>
  <Card class="bg-skyblue-300 flex content-center p-0 m-0">
    <template #content> 
      <div class="flex justify-around w-full">
          <Button v-if="!cert.status || cert.status == 'E'"
            @click="getCertificate(props.template, props.data)"
            class="mx-auto"
            label="Get Certificate"
            >Get Certificate</Button
          >
        <span v-if="cert.status == 'E'">
          Error: Please try later!
        </span>
        
        <div v-if="cert.status == 'R'">
          <ProgressSpinner/>
        </div>

        <div v-if="cert.status == 'Y'">
          <div class="flex justify-around w-full">
            <a :href="cert.url" download="runpix_certificate.png"
              class="p-button py-1 px-2 my-2">Download</a>
            <ShareNetwork v-for="socialMedia in socialMedias"
              :network="socialMedia.network"
              :url="cert.url"
              :title="`Finisher certificate for ${props.data.race_name}`"
              :description="`I am excited to share my finisher certificate at ${props.data.cert_url}.  Draw the inspiration from more achievers for the race.`"
              quote="Discipline is the bridge between goals and accomplishments."
              hashtags="#finisher #discipline #fitness4life #runpix"
              class="p-button py-1 px-2 my-2 capitalize"
            >
              {{socialMedia.network}}
          </ShareNetwork>
          </div>
            
          <Image :src="cert.url" class="w-full mt-4" />
        </div>

      </div>
    </template>
  </Card>
</template>

<script setup>
const props = defineProps({
  template: String, // Google doc id
  data: Object,
  message: String,
});

import { config } from "../config";
import { ref } from "vue";
import Card from "primevue/card";
import Button from "primevue/button";
import Image from "primevue/image";
import ProgressSpinner from "primevue/progressspinner";

import axios from "axios";

const socialMedias=ref([
  {
    network: 'facebook',
  },
  {
    network: 'whatsapp',
  },
  {
    network: 'linkedin',
  }
])
const thisUrl=window.location.href;
const GS_PREFIX = config.GS_PREFIX;
const cert = ref({
  status: null, // Request, Yes / No, E'
  url: null,
});

console.log(window.location,props);

function getCertificate(race, bibData) {
  // const url='https://run-pix-admin-nqmxzlpvyq-uc.a.run.app/cert?cert=run_dist'
  const url = `${config.app.CERT_URL}/api/cert/${props.template}`;
  // console.log(config.app,url, props.data);

  cert.value.status = "R";

  // console.log(JSON.stringify(props.data));

  return axios
    .post(url, props.data, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((ret) => {
      console.log("Certificate generated", ret);
      cert.value.status = "Y";
      cert.value.url = ret.data.contentUrl;
      console.log(cert);
      return ret;
    })
    .catch((e) => {
      cert.value.status = "E";
      console.warn( e);
    });
}
</script>
