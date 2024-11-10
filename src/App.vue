<script setup>
import Nav from "./components/Nav.vue";
import Footer from "./components/Footer.vue";

const callback = (response) => {
  // This callback will be triggered when the user selects or login to
  // his Google account from the popup
  console.log("Handle the response", response)
}

</script>

<template>
  <Nav/>
  <!-- LOGIN Status -->
  <div class="mt-20 min-h-[10vh] max-w-screen-md mx-auto ">
    <!-- bg-gradient-to-r from-primary-200 to-green-200 -->
    <RouterView />
  </div>
  
  <Footer/>

</template>

<style scoped>

</style>
