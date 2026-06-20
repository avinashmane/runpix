<template>
    <!--List of all races or RaceCards-->

    <h1 @dblclick="klick" class="text-center text-xl">Races</h1> 

    <DataView v-if="races.length" :value="races" :sort-field="Date" 
        paginator :rows="10" :sort-order="-1" :pt="{
        header: { class: 'bg-red-500 ' },
        content: { class: 'text-lg ' },
        title: {class:'text-xl'}
    }">
        <template #list="slotProps">

                <div v-for="(race, index) in slotProps.items" :key="index" class="col-12">
                    <RaceCard :race="race" :menu="props.menu" />
                </div>

        </template>

    </DataView>
    <img v-else src="/assets/graphics/finisher-1.jpg"/>

    <Button v-if="races.length" class="justify-end" :label="allRaces?'Less':'More'" @click="allRaces=!allRaces"></Button>
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
import dayjs from 'dayjs';
import { computed,ref } from 'vue';
import { useRaceStore } from '../stores';

const raceStore =  useRaceStore()
const allRaces = ref(false)
const display_recent_races_before = dayjs().add(7,'day').format('YYYY-MM-DD')

const races = computed(() => {
    const ret = orderBy(
            raceStore.races
                .filter(race => !race?.status?.includes('nolist')),
            ["Date"], ['desc']
        )
        // .map(x=>{console.warn(">>"+`${x.Date} < ${display_recent_races_before}`); return x})
        .filter((x,i)=> allRaces.value ? true : x?.Date < display_recent_races_before)
        .filter((x, i) => allRaces.value ? true : i < 5)  // show top 10 races
    // .filter(x => new Date(x.Date).getFullYear() == new Date().getFullYear())
    // .filter(x => checkResStatus(x))  
    // console.log(ret.map(x=>x.id).join(','))
    return ret
})
</script>