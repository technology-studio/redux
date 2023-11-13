const txoConfig = require('eslint-config-txo-typescript')

/** @type {import('eslint').Linter.FlatConfig[]} */
const config = [
  ...txoConfig.default,
  {
    files: ['sample/**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: './sample/tsconfig.json',
      },
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: './sample/tsconfig.json',
        },
      },
    },
  },
]

module.exports = config
