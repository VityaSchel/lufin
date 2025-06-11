import { paraglideVitePlugin } from '@inlang/paraglide-js'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    svgr({
      include: '**/*.svg'
    }),
    paraglideVitePlugin({ project: './project.inlang', outdir: './src/paraglide' }),
    react()
  ],
  resolve: {
    alias: {
      $app: '/src/app',
      $pages: '/src/pages',
      $widgets: '/src/widgets',
      $features: '/src/features',
      $entities: '/src/entities',
      $shared: '/src/shared',
      $paraglide: '/src/paraglide',
      $assets: '/src/assets',
      $m: '/src/paraglide/messages.js'
    }
  }
})
