import fs from 'fs/promises'
import path from 'path'
import { build } from 'vite'
import glob from 'fast-glob'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import svgr from 'vite-plugin-svgr'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import prompts from 'prompts'
import scss from 'rollup-plugin-scss'

const __dirname = dirname(fileURLToPath(import.meta.url)) + '/'

const getImports = async () => {
  const files = await glob(['./src/**/package.json', '!**/node_modules/**/*'])
  const imports = await Promise.all(
    files.map(async file => {
      const content = await fs.readFile(file, 'utf-8')
      const pkg = JSON.parse(content)
      return {
        name: pkg.name,
        lib: path.resolve(file, '../index.tsx'),
        style: path.resolve(file, '../styles.module.scss')
      }
    })
  )
  return imports
}

let imports = await getImports()
const buildingImports = await prompts({
  type: 'multiselect',
  name: 'components',
  message: 'Select components to build',
  choices: imports.map(i => ({title: i.name, value: i.name}))
}).then(r => r.components)
if (buildingImports.length === 0)  {
  console.error('Please specify components to build')
  process.exit(0)
}
console.log('Building', buildingImports.join(', '))
imports = imports.filter(i => buildingImports.includes(i.name))

for(const item of imports) {
  await fs.rm('./dist/' + item.name, {recursive: true, force: true})
  await build({
    configFile: false,
    build: {
      emptyOutDir: false,
      lib: {
        entry: item.lib,
        name: item.name
      },
      rollupOptions: {
        external: ['react', 'react-dom', 'next', '@mui/material'],
        output: {
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM'
          },
          assetFileNames: `${item.name}/[name].[ext]`,
          entryFileNames: () => `${item.name}/[name].[format].js`
        }
      }
    },
    plugins: [
      svgr({exportAsDefault: true}),
      react(),
      scss({ fileName: 'bundle.css' }),
      dts({
        insertTypesEntry: true,
      }),
    ],
    resolve: {
      alias: [
        { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
      ]
    }
  })
}

for (const item of imports) {
  await fs.writeFile('./dist/' + item.name + '/package.json', JSON.stringify({
    'main': './index.umd.js',
    'module': './index.es.js',
    'types': './index.d.ts',
    'exports': {
      '.': {
        'import': './index.es.js',
        'require': './index.umd.js'
      }
    }
  }), 'utf-8')
}

async function copyPackageJSON() {
  const data = await fs.readFile(__dirname + 'package.json', 'utf8')

  let packageJson = JSON.parse(data)

  delete packageJson.scripts?.prepublishOnly
  delete packageJson.scripts?.publish
  delete packageJson.scripts?.build

  await fs.writeFile(__dirname + 'dist/package.json', JSON.stringify(packageJson, null, 2), 'utf8')
}
await copyPackageJSON()