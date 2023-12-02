import '@/assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from '@/App.vue'

import devtools from '@vue/devtools'

if (process.env.NODE_ENV === 'development') {
    devtools.connect()
}


createApp(App)
    .use(createPinia())
    .mount('#app')
