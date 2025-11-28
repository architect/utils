const { test } = require('node:test')
const assert = require('node:assert')
const toLogicalID = require('../../to-logical-id')

test('Get', () => {
  assert.strictEqual(toLogicalID('get'), 'GetIndex', 'get returns GetIndex')
  assert.strictEqual(toLogicalID('Get'), 'GetIndex', 'Get returns GetIndex')
  assert.strictEqual(toLogicalID('getIndex'), 'GetIndex', 'GetIndex returns GetIndex')
  assert.strictEqual(toLogicalID('GetIndex'), 'GetIndex', 'GetIndex returns GetIndex')
})

test('App and environment', () => {
  assert.strictEqual(toLogicalID('my-app-staging'), 'MyAppStaging', 'my-app-staging returns MyAppStaging')
  assert.strictEqual(toLogicalID('my-app-production'), 'MyAppProduction', 'my-app-production returns MyAppProduction')
})

test('numerical app name', () => {
  assert.strictEqual(toLogicalID('1234'), '1234', '"1234" returns "1234"')
  assert.strictEqual(toLogicalID(1234), '1234', '1234 returns "1234"')
})
