/// <reference types="vitest" />

import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import Vue from '@vitejs/plugin-vue'
import Pages from 'vite-plugin-pages'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import VueMacros from 'unplugin-vue-macros/vite'
import legacy from '@vitejs/plugin-legacy'
import { VantResolver } from '@vant/auto-import-resolver'
import vueJsx from '@vitejs/plugin-vue-jsx'

export default ({ mode }: { mode: 'development' | 'test' | 'production' }) => {
  const VITE_PROXY = loadEnv(mode, process.cwd()).VITE_PROXY
  const timeStamp = new Date().getTime()
  return defineConfig({
    // base: './',
    resolve: {
      alias: {
        '@/': `${path.resolve(__dirname, 'src')}/`,
      },
    },
    server: {
      port: 88,
      host: true,
      proxy: {
        '/api': {
          target: VITE_PROXY,
          changeOrigin: true,
        },
      },
    },
    plugins: [
      vueJsx(),
      VueMacros({
        plugins: {
          vue: Vue({
            reactivityTransform: true,
            template: {
              compilerOptions: {
                // 将所有带短横线的标签名都视为自定义元素
                isCustomElement: tag => tag.includes('wx-open-launch'),
              },
            },
          }),
        },
      }),

      // https://github.com/hannoeru/vite-plugin-pages
      Pages(),

      // https://github.com/antfu/unplugin-auto-import
      AutoImport({
        imports: [
          'vue',
          'vue/macros',
          'vue-router',
          '@vueuse/core',
        ],
        dts: true,
        dirs: [
          './src/composables',
        ],
        vueTemplate: true,
      }),

      // https://github.com/antfu/vite-plugin-components
      Components({
        dts: true,
        resolvers: [VantResolver()],
      }),

      legacy({
        targets: [
          'chrome >= 49',
          'firefox >= 52',
          'safari >= 10',
          'edge >= 79',
          'ie >= 11',
          // 针对 Android 8.0 的内置浏览器指定版本
          'android >= 8.0',
        ],
      }),
    ],
    // 生产环境清除 console.log
    esbuild: {
      pure: mode === 'production' ? ['console.log'] : [],
    },
    // https://github.com/vitest-dev/vitest
    test: {
      environment: 'jsdom',
    },

    build: {
      target: 'es5',
      assetsDir: 'static/img/',
      rollupOptions: {
        output: {
          chunkFileNames: `static/js/[name]-[hash].${timeStamp}.js`,
          entryFileNames: `static/js/[name]-[hash].${timeStamp}.js`,
          assetFileNames: `static/[ext]/[name]-[hash].${timeStamp}.[ext]`,
        },
      },
    },
  })
}
