/** * Only certifiacte related data here */
<template>
  <Card class="container bg-skyblue-300 flex content-center">
    <template #content> 
      <div>
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
          <a :href="cert.url" download="runpix_certificate.png"
            class="p-button py-1 px-2">Download</a>

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

const GS_PREFIX = config.GS_PREFIX;
const cert = ref({
  status: null, // Request, Yes / No, E'
  url: null,
});

console.log(props);

function getCertificate(race, bibData) {
  // const url='https://run-pix-admin-nqmxzlpvyq-uc.a.run.app/cert?cert=run_dist'
  const url = `${config.app.CERT_URL}/api/cert/${props.template}`;
  console.log(config.app,url, props.data);

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
