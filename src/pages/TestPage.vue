<script setup>
import TestComponent from "../components/TestComponent.vue";
import Button from "primevue/button"
import InputText from 'primevue/inputtext';
import SvgText from "../components/SvgText.vue"
import { ref } from "vue";
import { CSVToArray } from "../helpers";
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import {useUserStore}  from '@/stores/index.js'
const userStore = useUserStore()

const toast = useToast();

const show = () => {
    toast.add({ severity: 'info', summary: 'Info', detail: 'Message Content', life: 3000 });
};

</script>

<template>

  <!-- {{ userStore.profile }} -->
  <!-- {{ userStore.roles }} -->
  <Toast/>
  <Button label="toast" @click='show()'>Show</Button>
  <br/>{{ userStore.checkAccess('race','mychoice',"any") }}
  <br/>{{ userStore.checkAccess('race','werun',"any") }}
  <br/>{{ userStore.checkAccess('race','mychoice',"any") }}
  <br/>{{ userStore.checkAccess('race','test',"any") }}

  <div id="testzone" class="container mx-auto">
    <SvgText bottom="testAvinash" 
            radius="250" 
            fontSize="60"
            top="Race Event" 
            radius-ringwidth
            center="AM"/>
    <!-- <SvgText bottom="testAvinash" 
            radius=150
            fontSize=30
            top="Race Event" 
            ring
            center="AM"/> -->
  </div>

  <div class="container mx-auto">
    <div class="w-full text-center justify-center flex-col">
      <div>
        <h1>Test Page</h1>
        <p>
          This is a test page.
        </p>
      </div>
      <img alt="Vue logo" src="../assets/logo.png" class="mx-auto"/>
      <TestComponent msg="Hello Vue and Vite"/>
    </div>
  </div>

</template>

