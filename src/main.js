import { createApp } from 'vue'
import App from './App.vue'
import './index.css'
import router from './router'

import store from './store'; //vuex to be removed
import { createPinia } from 'pinia' ; // move to pinia

import PrimeVue from 'primevue/config';
import Button from 'primevue/button';
import ToastService from 'primevue/toastservice';
import Tooltip from 'primevue/tooltip';
import Ripple from 'primevue/ripple';
import { definePreset } from '@primevue/themes';
import Aura from '@primevue/themes/aura';

const MyPreset = definePreset(Aura, {
    semantic: {
        primary: {
            50: '{indigo.50}',
            100: '{indigo.100}',
            200: '{indigo.200}',
            300: '{indigo.300}',
            400: '{indigo.400}',
            500: '{indigo.500}',
            600: '{indigo.600}',
            700: '{indigo.700}',
            800: '{indigo.800}',
            900: '{indigo.900}',
            950: '{indigo.950}'
        }
    }
});
// import 'primevue/resources/primevue.min.css';
// import "primevue/resources/themes/lara-light-indigo/theme.css";
import 'primeicons/primeicons.css';  
import VueGtag from "vue-gtag-next";
import VueSocialSharing from 'vue-social-sharing'
// import vue3GoogleLogin from 'vue3-google-login'


const app = createApp(App)
const pinia = createPinia()

if (import.meta.env.MODE === 'development') {
    app.config.devtools = true
    app.config.performance = true
}

app.use(store)
    .use(VueGtag, {
        property: {
        id: "G-BV8G5NRLDP"
        }
    })
    .use(VueSocialSharing)
    .use(router)
    .use(pinia)
    // PrimeVUE
    .use(PrimeVue,{
        theme: { preset: MyPreset},
        locale: {
            fileSizeTypes: ['G','M'],
            en: {
            message: "Message",
            },
            ja: {
            message: "メッセージ",
            },
            de: {
            message: "Nachricht",
            },
      }},) //{ unstyled: true }
    .use(ToastService)
//     // .use(vue3GoogleLogin, {
//     // clientId: '1008690560612-k8am9a162v8i2psshjidecn0d10adkij.apps.googleusercontent.com'
//     // } )

app.component('Button', Button);
app.directive('tooltip', Tooltip);
app.directive('ripple', Ripple);
app.mount('#app')
