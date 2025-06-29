import js from '@eslint/js'
import ts from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import react from 'eslint-plugin-react'
import reactNative from 'eslint-plugin-react-native'
import prettier from 'eslint-config-prettier'
import prettierPlugin from 'eslint-plugin-prettier'
import globals from 'globals'

export default [
  {
    ignores: [
      'node_modules/**',
      'assets/**',
      'app-example/**',
      '.expo/**',
      'expo-env.d.ts',
    ]
  },
  js.configs.recommended,
  {
    files: ['**/*.ts', '**/*.js', '**/*.tsx', '**/*.jsx'],
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
      react,
      'react-native': reactNative,
      prettier: prettierPlugin,
    },
    rules: {
      ...ts.configs.recommended.rules,
      'react-native/no-unused-styles': 'warn',
      'react-native/no-inline-styles': 'warn',
      'react-native/no-color-literals': 'warn',
      'react-native/no-raw-text': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      'prettier/prettier': 'error',
    },
  },
  prettier,
]
