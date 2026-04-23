import typescriptEslint from '@typescript-eslint/eslint-plugin'
import prettier from 'eslint-plugin-prettier'
import globals from 'globals'
import tsParser from '@typescript-eslint/parser'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import js from '@eslint/js'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
})

export default [
  ...compat.extends('plugin:@typescript-eslint/recommended', 'prettier'),
  {
    plugins: {
      '@typescript-eslint': typescriptEslint,
      prettier,
    },

    languageOptions: {
      globals: {
        ...globals.browser,
      },

      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',

      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      'prettier/prettier': 'warn',
      'space-before-function-paren': 'off',
      'no-use-before-define': 'off',
    },
  },
]

// import globals from "globals";
// import pluginJs from "@eslint/js";
// import typescriptEslint from '@typescript-eslint/eslint-plugin'
// // import tseslint from "typescript-eslint";
// import path from 'node:path'
// import { fileURLToPath } from 'node:url'
// import js from '@eslint/js'
// import { FlatCompat } from '@eslint/eslintrc'

// const __filename = fileURLToPath(import.meta.url)
// const __dirname = path.dirname(__filename)
// const compat = new FlatCompat({
//   baseDirectory: __dirname,
//   recommendedConfig: js.configs.recommended,
//   allConfig: js.configs.all,
// })

// export default [
//   ...compat.extends('next/core-web-vitals', 'prettier'),
//   {files: ["**/*.{js,mjs,cjs,ts}"]},
//   {languageOptions: { globals: globals.browser }},
//   pluginJs.configs.recommended,
//   // ...tseslint.configs.recommended,
//   plugins: {
//     '@typescript-eslint': typescriptEslint,
//     prettier,
//   },
// ];
