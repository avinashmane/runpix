<script setup>
// import { useStore } from 'vuex';
import { useUserStore } from '../stores';
import { useRoute } from 'vue-router';
import {ref, reactive } from "vue";
import {GoogleAuthProvider,signInWithPopup } from 'firebase/auth'
import {firebaseAuth } from '../../firebase/config'
import InputText from 'primevue/inputtext';
import LoadingSpinner from './LoadingSpinner.vue';
import router from "../router";
import {debug} from "../helpers"

// const store = useStore()
const userStore = useUserStore()
// const signInState = store.state.auth.signIn
const route = useRoute()

const passwordModel = ref('')
const emailModel= ref(route.query?.email||'')
const localState = reactive({
  disableSignIn: true,
  emailError: false,
  passwordError: false,
})

const signIn = () => {
  userStore.signInAction({email: emailModel.value, password: passwordModel.value}).then(() => {
  // store.dispatch('signInAction', 
    if (userStore.isSignIn) {
    // if (!signInState.isError) {
      // store.dispatch('getUserAction')
      router.push('/home')
    }
  })
}

const signInGoogle =async () => {
  await userStore.signInGoogleAction().then(x=>{
    if (userStore.isSignIn) {
      router.push('/home')
    } else {
      debug('error in dispatch')
    }
  })
}

const validateEmail = () => {
  const mail_format = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  localState.emailError = emailModel.value.length < 1 || !emailModel.value.match(mail_format);
}

const validatePassword = () => {
  localState.passwordError = passwordModel.value.length < 1;
}

const validateForm = () => {
  validateEmail()
  validatePassword()
  localState.disableSignIn = (localState.emailError || localState.passwordError);
}



</script>

<template>
  <!-- <LoadingSpinner v-if="signInState.isLoading" /> -->

  <div class="w-full mt-2 mb-2">
    <button class="bg-blue-300 rounded-full drop-shadow-lg text-white text-md h-9 w-full opacity-40 ableSignIn" @click="signInGoogle">
      Login with Google</button>
  </div>


  <form v-if="route.query.email" class="flex-col text-center bg-white w-full rounded-xl shadow-lg mx-auto sm:w-full p-5 relative" 
    @submit.prevent="signIn" @change="validateForm">
    <h1 class="text-left text-2xl mb-10 ml-3">Login</h1>
    <div class="md:w-[65%] mx-auto my-10 sm:w-full">
      <span class="p-float-label mb-2">
        <InputText id="EmailInputText" type="email" v-model="emailModel" class="w-full" required :class="{'p-invalid': localState.emailError}"/>
        <label for="EmailInputText">Email</label>
      </span>
      <p v-if="localState.emailError" class="text-red-500 text-xs italic text-left">Email is required</p>
    </div>
    <div class="md:w-[65%] mx-auto my-10 sm:w-full">
      <span class="p-float-label mb-2">
        <InputText id="PasswordInputText" type="password" v-model="passwordModel" 
          class="w-full" required :class="{'p-invalid': localState.passwordError}"/>
        <label for="PasswordInputText">Password</label>
      </span>
      <p v-if="localState.passwordError" class="text-red-500 text-xs italic text-left">Password is required</p>
    </div>
    <button class="bg-[#2B2E4A] rounded-full drop-shadow-lg text-white text-md h-9 w-[85px] opacity-40" 
    :class="{ 'ableSignIn': !localState.disableSignIn }" :disabled="localState.disableSignIn">
      Login</button>
    <br/>
  </form> 

</template>

<style scoped >
/* lang="postcss" */
.ableSignIn {
  @apply hover:bg-indigo-300 transition ease-in-out opacity-100
}
</style>
