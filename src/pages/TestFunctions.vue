<script setup>
import TestComponent from "../components/TestComponent.vue";
import Button from "primevue/button"
import InputText from 'primevue/inputtext';
// import SvgText from "../components/SvgText.vue"
import { ref } from "vue";
import {useUserStore}  from '@/stores/index.js'
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';

const functionUrl=ref('http://localhost:5000/run-pix/us-central1/api')
</script>

<template>

    <h1>Test Functions</h1>
    <InputText v-model="functionUrl" label="functionUrl"></InputText>
    <InputText v-model="functionUrl" label="params"></InputText>
    <Button @click="apiCall(params)"/>

</template>

