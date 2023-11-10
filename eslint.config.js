const txoConfig = require('eslint-config-txo-typescript')

/** @type {import('eslint').Linter.FlatConfig[]} */
const config = [
  ...txoConfig.default,
  {
    files: ['sample/**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: './__tests__/tsconfig.json',
      },
    },
  },
]

module.exports = config
