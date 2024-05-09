<template>
    <!-- <Button @click="router.back()"><Icon id="back"/></Button> -->
    <!-- v-if="route.params.team"  -->
    <div class="flex my-0 w-full justify-end ">

    <button @click="router.back()" :class="'float-right'">
        <!-- <Icon id="pi pi-close" label="X" :class="props.class || 'right-2 top-2 w-6 h-6'" /> -->

        <span :class="props.class || 'pi pi-pi-chevron-left right-2 top-2 w-6 h-6 pi pi-times'"></span>
    </button>
    </div>
</template>
<script setup>
const props = defineProps({
    class: String,
    iconClass: String
})
import { useRouter } from 'vue-router';
// import Icon from 'primevue/icon';
const router = useRouter()
</script>