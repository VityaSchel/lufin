import fs from 'fs'
import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import svgr from 'vite-plugin-svgr'
import { paraglideVitePlugin } from '@inlang/paraglide-js'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
// import { analyzer } from 'vite-bundle-analyzer'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    svgr({
      include: ['**/*.svg', '**/*.svg?react']
    }),
    paraglideVitePlugin({
      project: './project.inlang',
      outdir: './src/paraglide',
      strategy: ['cookie', 'preferredLanguage', 'baseLocale']
    }),
    tailwindcss(),
    react(),
    // analyzer(),
    {
      name: 'announce-api-url',
      apply: 'build',
      closeBundle() {
        const env = loadEnv(mode, process.cwd())
        const outDir = path.resolve('dist/.well-known')
        fs.mkdirSync(outDir, { recursive: true })
        fs.writeFileSync(
          path.join(outDir, 'lufin.json'),
          JSON.stringify({
            api: env.VITE_API_URL
          })
        )
      }
    }
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
  },
  build: {
    chunkSizeWarningLimit: 1500
  }
}))
