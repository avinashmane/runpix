<template>
    <div class="p-inputgroup flex">
      <Select v-model="year" :options="years" class="w-4/12 " />
      <Select v-model="raceId" :options="races" optionLabel="Name" 
        optionValue="id" @change="change"
        placeholder="Select a race" class="w-full" />
    </div>
</template>

<script setup>
const props=defineProps({
    races: Array
})
const model = defineModel()
const emit = defineEmits(['change'])

import Select from 'primevue/select';
import { computed, ref } from 'vue';

const year = ref(new Date().getUTCFullYear())
let years = Array(year.value - (year.value - 6)).fill('').map((v, idx) => year.value - idx);

const raceId=ref(model.value)

const races=computed(()=>{
    return props.races
            .filter(x => new Date(x.Date).getFullYear() == year.value)
})

function change(){
    model.value=raceId.value
    emit('change',raceId)
}
</script>