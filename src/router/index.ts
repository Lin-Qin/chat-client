import type { App } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './routes/index'
export const router = createRouter({
  history: createWebHistory(''),
  routes,
})


export function setupRouter(app: App<Element>) {
  app.use(router)
}
