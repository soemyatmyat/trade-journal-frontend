import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import Components from 'unplugin-vue-components/vite';
import {PrimeVueResolver} from 'unplugin-vue-components/resolvers'; // auto-import PrimeVue 

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    https: {
      key: fileURLToPath(new URL('./certs/localhost-key.pem', import.meta.url)),
      cert: fileURLToPath(new URL('./certs/localhost.pem', import.meta.url))
    }
  },
  plugins: [
    vue(), // standard SFC support
    vueJsx(), // JSX/TSX support in Vue
    Components({
      resolvers: [
        PrimeVueResolver() // import PrimeVue components as needed
      ]
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
