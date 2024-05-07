<template>
  <div class="flex flex-row w-full rounded shadow-lg h-20 mb-2 bg-yellow-50 p-2">

    <div id="raceImage" class="flex flex-col mx-auto align-middle w-20" @click="router.push(`/e/${race.id}`)">
      <img class="w-16 rounded-full shadow-lg object-cover aspect-square"
        :src="race?.coverPage ? getPublicUrl('thumbs', race?.id, race?.coverPage) : defaultRaceImage" />
    </div>

    <div class="flex flex-col w-full">
      <div class="text-sm">
        {{ race.Name }} 
      </div>

    <div class="w-full flex flex-row justify-left" >

      <div class="text-xs flex flex-col w-full" @click="router.push(`/e/${race.id}`)">
        <div>{{ race.Date }}</div>
        <small>
          {{ race.Location }}</small>
        <small>{{ race.id }}
        </small>
      </div>

      <div class="flex flex-col gap-1  p-0">

        <Button v-if="props.menu.includes('photos') && race?.photoStatus?.includes('avail')" label="Photos"
          :pt="{ label: { class: 'text-sm' } }" @click="router.push(`/p/${race.id}`)" />
        <Button
          v-if="props.menu.includes('results') && (race?.status?.includes('final') || race?.status?.includes('provisional'))"
          label="Results" size="small" :pt="{ label: { class: 'text-sm' } }" @click="router.push(`/r/${race.id}`)" />

        <Button v-if="!props.menu" label="Race" :pt="{ label: { class: 'text-sm' } }"
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
const router = useRouter()

</script>

<style scoped></style>