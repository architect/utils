let test = require('tape')
let pkg = require('../package.json')

test('Package.json validation for Node.js 22 upgrade', t => {
  t.plan(2)

  t.equal(pkg.engines.node, '>=22', 'engines.node is set to ">=22"')
  t.notOk(pkg.dependencies.glob, 'glob is not in dependencies')
})
