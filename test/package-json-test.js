const { test } = require('node:test')
const assert = require('node:assert')
const pkg = require('../package.json')

test('Package.json validation for Node.js 22 upgrade', () => {
  assert.strictEqual(pkg.engines.node, '>=22', 'engines.node is set to ">=22"')
  assert.ok(!pkg.dependencies.glob, 'glob is not in dependencies')
})
