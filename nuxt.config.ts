// https://nuxt.com/docs/api/configuration/nuxt-config
import Aura from '@primevue/themes/aura'
import path from 'path';

const baseUrl='/';
const alias = {
  // primevue: path.resolve(__dirname, '../../packages/primevue/src'),
  '@': path.resolve(__dirname, 'nuxt'),
};
// console.log(alias);
const head = {
  title: 'Memories for the life',
  meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'description', content: 'Build your own UI library with the flexibility of Tailwind CSS and the convenience of PrimeVue components.' },
      { name: 'robots', content: 'index,follow' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:site', content: '@primevue' },
      { name: 'twitter:title', content: 'Tailwind CSS based Vue UI Component Library' },
      { name: 'twitter:description', content: 'Build your own UI library with the flexibility of Tailwind CSS and the convenience of PrimeVue components.' },
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: 'Tailwind CSS based Vue UI Component Library' },
      { property: 'og:url', content: 'https://tailwind.primevue.org/' },
      { property: 'og:description', content: 'Build your own UI library with the flexibility of Tailwind CSS and the convenience of PrimeVue components.' },
      { property: 'og:image', content: 'https://www.primefaces.org/static/social/primevue-preview.jpg' },
      { property: 'og:ttl', content: '604800' }
  ],
  link: [
      { rel: 'icon', href: baseUrl + 'favicon.ico' },
      { rel: 'stylesheet', as: 'font', href: 'https://rsms.me/inter/inter.css' }
  ],
  // script: [
  //     {
  //         src: baseUrl + 'scripts/prism.js',
  //         'data-manual': true
  //     }
  // ],
  htmlAttrs: {}
}
/**
 * Options
 */

export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  alias: alias,
  app: {
    head: head
  },
  dir: {
    app: 'nuxt/',
    assets: '../public/assets',
    // public: '../public',
    // pages: '../src/pages',
  },
  // dev: true,
  srcDir: 'nuxt/',
  buildModules: [
   'nuxt-vite',
  //  '@primevue/nuxt'
   '@primevue/nuxt-module',
   '@nuxtjs/tailwindcss'
  ],
  primevue: {
    autoImport: true,
    components:{
      include: '*',
    },
    options: {
        theme: {
            preset: Aura
          }
      }
  },
  vite: {
    optimizeDeps: {
        noDiscovery: true,
        include: []
    },
    esbuild: {
        minifyIdentifiers: false,
        minifyWhitespace: false
    },
    css: {
        preprocessorOptions: {
            scss: {
                silenceDeprecations: ['legacy-js-api'] //@todo
            }
        }
    }
  },
  postcss: {
    plugins: {
        'postcss-import': {},
        tailwindcss: {},
        autoprefixer: {}
    }
  },
  nitro: {
      alias
  },
  features: {devLogs: true} ,
  devServer: {
    host: "0.0.0.0",
    port: 3000,
    // https: {
    //   key: './certs/selfsigned.crt',
    //   cert: './certs/selfsigned.key'
    // }
  },
  devtools: { enabled: true },
  hooks: {
    'pages:extend' (routes) {
      [
        {
          name: 'Home',
          path: '/Home',
          file: '/home/avinash/runpix/nuxt/pages/HomePage.vue',
        },
        {
          name: 'LoginPage',
          path: '/login',
          file: '/home/avinash/runpix/nuxt/pages/LoginPage.vue',
        },
        {
          name: 'ProfilePage',
          path: '/profile',
          file: '/home/avinash/runpix/nuxt/pages/ProfilePage.vue',
        },
        {
          name: 'RacesPage',
          path: '/races',
          file: '/home/avinash/runpix/nuxt/pages/RacesPage.vue',
        },
        {
          name: 'RegisterPage',
          path: '/register',
          file: '/home/avinash/runpix/nuxt/pages/RegisterPage.vue',
        }].forEach(x=>routes.push(x))      //
    }
  },
  css: ['primeicons/primeicons.css',  
  'assets/tailwind.css',
  './src/style.css',
  './src/index.css'
  // './node_modules/primevue/umd/primevue.min.js',
  //'@/assets/styles/tailwind/main.css', '@/assets/styles/layout/layout.scss'
  ]
})
