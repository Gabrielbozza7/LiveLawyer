/* eslint-disable @typescript-eslint/no-require-imports */
// It looks like this file breaks if it uses ES syntax, so the rule has to be disabled.
const path = require('path')
const { getDefaultConfig } = require('expo/metro-config')

const config = getDefaultConfig(__dirname)

config.watchFolders = [path.resolve(__dirname, '../LiveLawyerLibrary')]
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
  path.resolve(__dirname, '../LiveLawyerLibrary/node_modules'),
]

module.exports = config
