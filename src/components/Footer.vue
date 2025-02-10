
<template>
  <div class="flex flex-cols justify-around py-2 mx-4 mx-auto dark:bg-blue-900 hover:items-center">
    <a v-for="x in footer" :href="x.link" class="flex flex-col">
      <i :class="x.icon+' text-xl text-center'"/>
      <div class="mx-auto">{{x.text}}</div>
    </a>
    <!-- <a href="">
      <i class="" ></i>
      RUNPIX @2023
    </a> -->
    <!-- <a href="">
      <i class="" style="font-size: 1.5rem"></i>
      Feedback
    </a>
    <a href="">
      <i class="" style="font-size: 1.5rem"></i>
      Feature requests
    </a>    
    <a href="">
      <i class="" style="font-size: 1.5rem"></i>
      Terms
    </a> -->
    
  </div>
</template>

<script setup>
import {useRouter} from 'vue-router'
const router = useRouter()
let header="text|icon|link".split('|')
let values=`
RUNPIX @2023|pi pi-camera|https://www.facebook.com/runpixindia
Feedback|pi pi-star-fill|https://runpix.page.link/feedback
Feature requests|pi pi-user-edit|https://runpix.page.link/features
Terms|pi pi-info-circle|/terms.html`
// bg-indigo-900 text-white
const footer=values.split('\n').filter(x=>x)
             .map(x=>x.split("|"))
             .map(x=>header.reduce((obj, k, i) => ({...obj, [k]: x[i] }), {})) 
</script>

<style scoped>

</style>