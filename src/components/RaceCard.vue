<template>
  <!--small Race Card-->
  <div class="flex flex-row w-full rounded dark:bg-slate-700 light:bg-yellow-50 shadow-lg h-30 mb-2 p-2">

    <div id="raceImage" class="flex flex-col mx-auto align-middle w-20" @click="router.push(`/e/${race.id}`)">
      <img  class="w-16 rounded-full shadow-lg object-cover aspect-square"
        :src="race?.coverPage ? getPublicUrl('thumbs', race?.id, race?.coverPage) : defaultRaceImage" />
        <!-- 
          v-if="race?.coverPage"
          <SvgTextCicle v-else class="mx-auto m-2"
            width="48" 
            :title="'RCC'"
            :pt="{title:{fontSize: 20, 
                   class:'font-bold text-white'},
                  }"
            >
TEST
        </SvgTextCicle> -->
    </div>

    <div class="flex flex-col w-full">
      <div class="text-sm ml-2 text-left">
        {{ race.Name }}
      </div>

      <div class="w-full flex flex-row justify-left">
        <div class="text-xs flex flex-col w-full ml-2 text-left" @click="router.push(`/e/${race.id}`)">
          <div>{{ race.Date }}</div>
          <small>
            {{ race.Location }}
          </small>
          <small>{{ race.id }}
          </small>
        </div>


      </div>
    </div>
    <div class="flex flex-col justify-end align-around gap-1">

    <a :href="race.linkPhotos"
        ><Button v-if="race.linkPhotos" label="Photos" :pt="smallButton"  class="w-full"></Button>
      </a>
    <Button v-if="!race.linkPhotos && props.menu.includes('photos') && race?.photoStatus?.includes('avail')"
      label="Photos" :pt="smallButton" @click="router.push(`/p/${race.id}`)" />
    <Button
      v-if="props.menu.includes('results') && (race?.status?.includes('final') || race?.status?.includes('provisional'))"
      label="Results" size="small" :pt="smallButton" @click="router.push(`/r/${race.id}`)" />
    <Button
      v-if="race?.certificate?.finisherCertificate && props.menu.includes('results') && (race?.status?.includes('final') || race?.status?.includes('provisional'))"
      label="Certificate" size="small" :pt="smallButton" @click="router.push(`/r/${race.id}`)" />
    <Button v-if="props.menu.includes('edit')" label="Edit" size="small" :pt="smallButton"
      @click="router.push(`/e/${race.id}/edit`)" />

    <Button v-if="!props.menu" label="Race" :pt="smallButton" @click="router.push(`/e/${race.id}`)" />

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
import SvgTextCicle from '../components/SvgTextCircle.vue';
import defaultRaceImage from '../assets/race_image.png'
import { ref } from 'vue'
const router = useRouter()
const smallButton = ref({ label: { class: 'text-sm' } })
</script>
<style scoped></style>