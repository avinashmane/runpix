<script setup>
import { useStore } from "vuex";
import RacesCard from "../components/RacesCard.vue";
import Image from 'primevue/image';
import Panel from 'primevue/panel'
const store = useStore()
store.dispatch('getRacesAction')

const signInState = store.state.auth.signIn
const userData = store.state.auth.userDetails.userData
const dispKeys = { 'displayName': 'Name', 'email': 'eMail' }//"uid":"uid",

let items = [
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
  {
    label: 'Events',
    img: '/assets/graphics/events.jpg',
    to: '/e'
  },
]
</script>

<template>

  <div class="rounded bg-white shadow-lg m-2 p-2">
    <div class="w-full text-center ">
      <h1 class="text-xl">Home </h1>
      <RacesCard menu="['photos', 'results']"/>
    </div>
  </div>

  <Panel header="Menu" toggleable :pt="{
                  root: {class: 'mx-2 mb-4'},
                  header: (options) => ({
                    id: 'myPanelHeader',
                    style: {
                      'user-select': 'none'
                    },
                    class: [
                      'border-primary',
                      {
                        'bg-blue-500': options.state.d_collapsed,
                        'bg-blue-200': !options.state.d_collapsed
                      }
                    ]
                  }),
                  content: { class: 'border-primary text-lg text-primary-700' },
                  title: 'text-lg',                                     // OR { class: 'text-xl' }
                  toggler: () => 'bg-primary hover:bg-primary-reverse'  // OR { class: 'bg-primary hover:bg-primary-reverse' }
                }">

      <p class="m-0">
      <div class="flex flex-col items-center">
        <div class="container mx-auto">
          <!-- <Menu :model="items" class="mx-auto"/> -->
          <router-link v-for="i in items" :to="i.to" class="">
            <Image :src="i.img" :alt="i.label" />
          </router-link>
        </div>
        <div v-if="userData.uid">
          <div v-for="(v, k) in dispKeys">
            <span><b>{{ v }}: </b></span>
            <span>{{ userData[k] }}</span>
          </div>

        </div>
        <div v-else>
          Not logged in
        </div>
      </div>
      </p>

  </Panel>

</template>

<style scoped>
.p-image :deep(img) {
  box-shadow: #ddd8 1em;
  border-radius: 2em;
  width: 50vw;
  margin: auto;
}

.btn {
  @apply py-2 px-4 font-semibold rounded-lg shadow-md;
}

.btn-green {
  @apply text-white bg-green-500 hover:bg-green-700;
}
</style>