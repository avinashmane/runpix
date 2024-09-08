<script setup>
import LoginCard from "../components/LoginCard.vue";
import Message from "../components/Message.vue";
// import Menu from 'primevue/menu';
import RacesCard from "../components/RacesCard.vue";
import Image from 'primevue/image';
import {useStore} from "vuex";

const store = useStore()
const signInState = store.state.auth.signIn
store.dispatch('getRacesAction')


let items= [
				{
					label: 'Photos',
					img: '/assets/graphics/photos.jpg',
					to: '/p'
				},
				{
					label: 'Results',
					img: '/assets/graphics/results.jpg',
					to: '/r'
				},
				// {
				// 	label: 'Events',
				// 	img: '/assets/graphics/events.jpg',
				// 	to: '/e'
				// },
  ]


</script>

<template>

  <div class="flex flex-col items-center">
  
    <RacesCard :menu="['photos', 'results']"/>

    <div class="container mx-auto">
      <router-link v-for="i in items" :to="i.to">
        <Image :src="i.img" :alt="i.label"/>
      </router-link>
      <div id="login">
        <LoginCard />
      </div>
    </div>
    <Message
        :warning="signInState.isError"
        :warningMsg="signInState.errorMessage"
    />
  </div>
</template>

<style scoped>
.p-image :deep( img) {
  box-shadow: black 1em;
  border-radius: 2em;
  width: 50vw;
  margin: auto;
}
#login {
  color: navy;
  width: 50vw;
  margin: auto;  
}
</style>
