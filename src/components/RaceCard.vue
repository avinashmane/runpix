<template>
  <div class="flex flex-row w-full rounded shadow-lg h-20 mb-2 bg-yellow-50 p-2">

    <div id="raceImage" class="flex flex-col mx-auto align-middle w-20" @click="router.push(`/e/${race.id}`)">
      <img class="w-16 rounded-full shadow-lg object-cover aspect-square"
        :src="race?.coverPage ? getPublicUrl('thumbs', race?.id, race?.coverPage) : defaultRaceImage" />
    </div>

    <div class="flex flex-col w-full">
      <div class="text-sm ml-2 text-left">
        {{ race.Name }} 
      </div>

    <div class="w-full flex flex-row justify-left" >
      <div class="text-xs flex flex-col w-full ml-2 text-left" @click="router.push(`/e/${race.id}`)">
        <div>{{ race.Date }}</div>
        <small>
          {{ race.Location }}</small>
        <small>{{ race.id }}
        </small>
      </div>

      <div class="flex flex-col gap-1  p-0">

        <a v-if="race.linkPhotos" :href="race.linkPhotos" class="p-button p-button-label h-2">Photos</a>
        <Button v-if="!race.linkPhotos && props.menu.includes('photos') && race?.photoStatus?.includes('avail')" label="Photos"
          :pt="smallButton" @click="router.push(`/p/${race.id}`)" />
        <Button
          v-if="props.menu.includes('results') && (race?.status?.includes('final') || race?.status?.includes('provisional'))"
          label="Results" size="small" :pt="smallButton" @click="router.push(`/r/${race.id}`)" />
        <Button
          v-if="props.menu.includes('edit')"
          label="Edit" size="small" :pt="smallButton" @click="router.push(`/e/${race.id}`)" />

        <Button v-if="!props.menu" label="Race" :pt="smallButton"
          @click="router.push(`/e/${race.id}`)" />

      </div>

    </div>
  </div>


  </div>
</template>

<script setup>
const props = defineProps({
  race: Object,
  menu: Array
})
import { getPublicUrl } from "../helpers/index";
import { useRouter } from 'vue-router';
import defaultRaceImage from '../assets/race_image.png'
import {ref} from 'vue'
const router = useRouter()
const smallButton = ref({ label: { class: 'text-sm' } })
</script>
<style scoped>
</style>