const arc = require('@architect/eslint-config')

module.exports = [
  ...arc,
  {
    ignores: [
      'coverage',
      'node_modules',
      'test/mock/src',
    ],
  },
]
