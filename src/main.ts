import { createApp } from 'vue'
import { VueQueryPlugin } from '@tanstack/vue-query'
import VConsole from 'vconsole'
import App from './App.vue'
import { setupRouter } from '@/router'
import { setupStore } from '@/store/index'

import 'tailwindcss/tailwind.css'
import '@/styles/index.scss'
import 'vant/es/toast/style'
import 'vant/es/dialog/style'
import 'vant/es/notify/style'
import 'vant/es/image-preview/style'

const app = createApp(App)

const MODE = import.meta.env.VITE_MODE

if (['development', 'test'].includes(MODE))
  new VConsole()

// 注册路由
setupRouter(app)

// 注册pinia
setupStore(app)

// 引入vue-query
app.use(VueQueryPlugin)

app.mount('#app')
