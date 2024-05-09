<template>
    <h1 @dblclick="klick" class="text-xl text-center">Races</h1> 
    <DataView :value="races" :sort-field="Date" :sort-order="-1" :pt="{
        root: { class: 'bg-transparent' },
        content: { class: 'border-primary text-lg text-primary-700' },
        title: 'text-xl'
    }">
        <template #list="slotProps">
            <!-- <div class="list gap-2"> -->
                <div v-for="(race, index) in slotProps.items" :key="index" class="col-12">
                    <RaceCard :race="race" :menu="props.menu" />
                </div>
            <!-- </div> -->
        </template>
    </DataView>
</template>

<script setup>
const props=defineProps({
    menu: Array,
    sort: Array,
    nolist: Boolean, // include races marked as nolist
})
import DataView from 'primevue/dataview'
import RaceCard from "../components/RaceCard.vue";
import { orderBy } from 'lodash-es'
import { useStore } from "vuex";
import { computed } from 'vue';
const store = useStore()

const races = computed(() => orderBy(
      store.state.datastore.races
        .filter(race=> !race?.status?.includes('nolist')),
      ["Date"],['desc'])
  // .filter(x => new Date(x.Date).getFullYear() == new Date().getFullYear())
  // .filter(x => checkResStatus(x))
)
</script>