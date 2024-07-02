import eslint from '@eslint/js';
import tslint from 'typescript-eslint';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

/** @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigFile} */
export default [
  {
    files: ['**/*.ts', '**/*.tsx'],
    ignores: ['dist', "**/*.config.js", "**/*.config.ts"],
    languageOptions: {
      parser: tslint.parser,
      parserOptions: {
        ecmaFeatures: {modules: true},
        ecmaVersion: 'latest',
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': tslint.plugin,
      prettier: prettierPlugin,
    },
    rules: {
      ...eslint.configs.recommended.rules,
      ...tslint.configs.eslintRecommended.rules,
      ...prettierConfig.rules, 
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      'prettier/prettier': 'error',
      'object-shorthand': ['error', 'always'],
      'no-unused-vars': 'off',
      'no-unreachable': ['error'],
      'no-unexpected-multiline': ['error'],
      'no-console': ['error', {allow: ['warn', 'error']}],
    },
  },
]
