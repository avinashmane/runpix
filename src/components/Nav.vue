<template>
  <div id="menubar" class="w-screen flex items-center  shadow-lg inset-x-0 top-0 fixed justify-center z-40">
    <div class="flex w-full bg-primary-900">
      <span class="flex items-center w-full justify-center">
          <Menubar :model="items" class="w-full bg-transparent">
            <template #start>
              <a class="ml-2 text-primary" href="/">
                <img class="logo" 
                  src="/assets/graphics/logo_runpix.png" 
                  :alt="site" /> 
              </a>              
            </template>
            <template #item="{ item, props, hasSubmenu }">
                <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
                    <a v-ripple :href="href" v-bind="props.action" @click="navigate">
                        <span :class="item.icon" />
                        <span class="ml-2">{{ item.label }}</span>
                    </a>
                </router-link>
                <a v-else v-ripple :href="item.url" :target="item.target" v-bind="props.action">
                    <span :class="item.icon" />
                    <span class="ml-2">{{ item.label }}</span>
                    <span v-if="hasSubmenu" class="pi pi-fw pi-angle-down ml-2" />
                </a>
            </template>

            <template #end>
              <div class="sm:flex items-center w-[30%]  justify-center">
                <div v-if="userState.isSignIn" class="flex flex-row">
                  <router-link to="/" class="mr-2 hover:text-[#FF9000] transition ease-in-out">
                    <i class="pi pi-home" style="font-size: 2rem"></i>
                  </router-link>
                  <router-link to="/profile" class="mr-2 hover:text-[#FF9000] transition ease-in-out h-[2rem] w-[2rem]">
                    <img :src="userStore.profile.photoURL"
                      class="rounded-full shadow-lg " 
                      referrerpolicy="no-referrer"
                      crossorigin="anonymous"
                      alt="profile" />
                  </router-link>
                </div>
                <div v-else>
                  <router-link to="/login" class=" mr-2 transition ease-in-out">
                    <i class="pi pi-home" style="font-size: 2rem"></i>
                  </router-link>
                </div>
              </div>
            </template>
        </Menubar>
      </span>
    </div>
  </div>

</template>

<script setup>
import { firebaseAuth } from '../../firebase/config';
import { useStore } from "vuex";
import { ref,watchEffect, computed } from "vue";
import { useUserStore } from '../stores';
import Menubar from "primevue/menubar";
const userStore =  useUserStore()
const store = useStore()

const userState = computed(() => store.state.auth.userDetails)

const firebaseUser = () => firebaseAuth.onAuthStateChanged(user => {
  // console.warn(`firebaseAuth.onAuthStateChanged ${JSON.stringify(user)}`)
  if (user) {
    userStore.login(user)
    store.commit('successRequestUser', user)
  } else {
    userStore.logout()
    store.commit('failRequestUser', 'Fail to get user')
  }
});

watchEffect(firebaseUser)

let site= computed(()=>{
  if (document.location.href.toLowerCase().search("fitness.forthe.life")!=-1) 
    return "Fitness.ForThe.life"
  if (document.location.href.toLowerCase().search("memories.forthe.life")!=-1) 
    return "Memories.ForThe.life"
  // default
  return 'RUN PiX'
  })

  const items = computed(()=>[
    // {
    //     label: 'Races',
    //     icon: 'pi pi-search',
    //     items: [
            {
                label: 'Results',
                icon: 'pi pi-bolt',
                route: '/r'
            },
            {
                label: 'Photos',
                icon: 'pi pi-server',
                route: '/p'
            },
            {
                label: 'Admin',
                icon: 'pi pi-pencil',
                route: '/e'
            },
    //     ]
    // },
    {
        label: 'Terms',
        icon: 'pi pi-envelope',
        route: '/terms'
    },
    {
        label: 'Help',
        icon: 'pi pi-info',
        url: 'https://avinashmane.github.io/runpix-docs/'
    },
    userState.isSignIn ? 
    {
        label: 'Logout',
        icon: 'pi pi-exit',
        route: '/profile'
    } :
    {
        label: 'Login',
        icon: 'pi pi-star',
        command: () => {  // copied from login card
          store.dispatch('signInGoogleAction').then(() => {
            if (!signInState.isError) {
              store.dispatch('getUserAction')
              router.push('/home')
            } else {
              debug('error in dispatch')
            }
          })
        }
    },
]);
</script>

<style scoped>
img.logo {
  max-height: 3em;
}
</style>