import { defineConfig } from 'eslint/config'
import globals from 'globals'
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'

export default defineConfig([
  prettier,
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    plugins: { js },
    languageOptions: { globals: globals.node },
    extends: ['js/recommended'],
  },
  tseslint.configs.recommended,
])
