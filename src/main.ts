import '@/assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from '@/App.vue'

if (process.env.NODE_ENV === 'development') {
  const devtools = await import('@vue/devtools')
  devtools.connect()
}

createApp(App).use(createPinia()).mount('#app')
