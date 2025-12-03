const arc = require('@architect/eslint-config')

module.exports = [
  ...arc,
  {
    ignores: [
      'glob',
      'coverage',
      'node_modules',
      'test/mock/src',
      'chalk',
      'updater',
    ],
  },
]
