import js from '@eslint/js'
import ts from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import prettier from 'eslint-config-prettier'
import prettierPlugin from 'eslint-plugin-prettier'
import globals from 'globals'

export default [
  {
    ignores: ['node_modules/**']
  },
  js.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      sourceType: 'module',
      ecmaVersion: 'latest',
      globals: {
        ...globals.node
      }
    },
    plugins: {
      '@typescript-eslint': ts,
      prettier: prettierPlugin,
    },
    rules: {
      ...ts.configs.recommended.rules,
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      'prettier/prettier': 'error',
    },
  },
  prettier,
]
