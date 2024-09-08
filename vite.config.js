import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import mkcert from 'vite-plugin-mkcert'
import path from 'path'
// import { chunkSplitPlugin } from 'vite-plugin-chunk-split';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
            vue(),
            mkcert(),
            // chunkSplitPlugin()
            ],
  server: {
    host: true,
    port: 5000, 
    https: true,
    open: '/',
    // open: '/race/test1',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    minify: false,
    rollupOptions: {
      output: {
        // preserveModules: true,
        // preserveEntrySignatures: true
        manualChunks: (id) => {
          // console.log(id)
          if (id.includes("node_modules")) {
              if (id.includes("primevue")) {
                  return id.includes("data")?"vendor_primevue_data":"vendor_primevue";
              } else if (id.includes("lodash")) {
                return "vendor_lodash";
              } else if (id.includes("firebase")) {
                  return "vendor_firebase";
              }
          
              return "vendor"; // all other package goes here
          }
          },
      },
      
      // https://rollupjs.org/configuration-options/
    }
  }
})
