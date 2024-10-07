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
  <div class="mt-20 min-h-[90vh] max-w-screen-md mx-auto bg-gradient-to-r from-indigo-200 to-blue-200 border-red-600">
    <RouterView />
  </div>
  <Footer/>

</template>

<style scoped>
RouterView {
  /* min-height: calc(85vh - 70px); */
}

footer {
  height: 15vh;
}
</style>
