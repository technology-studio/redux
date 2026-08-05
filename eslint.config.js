module.exports = (async function config() {
  const txoPackageConfigList = await import('eslint-config-txo-package-typescript')
  return [
    ...txoPackageConfigList.configList,
    {
      files: ['sample/**/*.ts'],
      settings: {
        'import/resolver': {
          typescript: {
            project: './sample/tsconfig.json',
          },
        },
      },
    },  
  ]
})()
