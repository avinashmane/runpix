<script setup>
import { computed } from 'vue';
// import { useStore } from 'vuex';
import { useUserStore } from '../stores';
import router from "../router";

const userStore = useUserStore()
// const userState = computed(() => store.state.auth.userDetails)
const userData= userStore.profile//store.state.auth.userDetails.userData.toJSON()
const logOut = () => {
  userStore.logout()
  // store.dispatch('logOutAction')
  router.push('/login')
}
const getDate=(x)=>{
  const d = new Date(parseInt(x)).toLocaleDateString()
  // console.log(typeof(x))
  return d
}
const showChangePassword = () => {
  userStore.showChangePassword()
  // return store.dispatch('activeChangePasswordSheetAction')
}

</script>

<template>
  <!-- {{userData}} -->
  <div class="flex-col text-center bg-white md:w-[75%] rounded-xl shadow-lg mx-auto sm:w-full relative pb-5 mb-8">
    <div class="overflow-hidden w-full h-full">
      <img class="rounded-tl-xl rounded-tr-xl h-[300px] w-full top-0 left-0 " src="../assets/portfolio-1.jpg"  alt="portfolio"/>
    </div>
    <div class="flex justify-center z-30 absolute w-full top-[13rem]">
      <img class="rounded-full h-[200px] w-[200px] border-8 border-white" :src="userData.photoURL" alt="profile"/>
    </div>
    
    <div class="mt-28">
      <h2 class="text-3xl text-left ml-5 " v-text="userData.displayName" />
      <h2 class="text-xl text-left ml-5 mb-7" v-text="userData.email" />
      <h2 class="text-sm text-left ml-5 mb-3" >uid: {{userData.uid}}</h2>
      <h2 class="text-sm text-left ml-5 mb-3" >Last Login: {{ getDate(userData.lastLoginAt) }}</h2>
      <h2 class="text-sm text-left ml-5 mb-3" >Roles: {{userStore.roles}}</h2>
      
      <div class="text-center mr-5 flex justify-end">
        <button class="bg-[#2B2E4A] rounded-full drop-shadow-lg text-white text-md h-9 w-[85px] hover:bg-[#FF9000] transition ease-in-out mr-5" @click="logOut">LogOut</button>
        <button class="bg-[#2B2E4A] rounded-full drop-shadow-lg text-white text-md h-9 w-[190px] hover:bg-[#FF9000] transition ease-in-out" @click="showChangePassword">Change Password</button>
      </div>
    </div>
    <!-- {{ userState.userData.toJSON().photoURL }}
    {{ Object.keys(userState.userData.toJSON()) }} -->
  </div>
</template>

<style scoped>

</style>
