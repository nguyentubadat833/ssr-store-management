// https://nuxt.com/docs/api/configuration/nuxt-config
import path from 'path';

export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  // srcDir: 'src/',
  extends: [
    './base'
  ],
  runtimeConfig: {
    auth: {
      secret: process.env.NUXT_AUTH_SECRET,
      clientId: process.env.NUXT_AUTH_GOOGLE_CLIENT_ID,
      secretId: process.env.NUXT_AUTH_GOOGLE_CLIENT_SECRET
    }
  },
  modules: ["@prisma/nuxt", '@nuxt/ui', "nuxt-lodash"],
  prisma: {
    installStudio: false
  },
  imports: {
    dirs: [
    //   'stores',
      'composables',
      'composables/*/index.{ts,js,mjs,mts}',
      'composables/**/**',
      // 'utils',
      // 'utils/*/index.{ts,js,mjs,mts}',
      // 'utils/**/**',
      'types',
      'types/*/index.{ts,js,mjs,mts}',
      'types/**/**',
    ]
  },
  colorMode: {
    preference: 'light'
  },
  experimental: {
    componentIslands: true
  }

})