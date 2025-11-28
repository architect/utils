const { test } = require('node:test')
const assert = require('node:assert')
const name = require('../../get-lambda-name')

test('get-lambda-name converts routes to acceptable names', () => {
  assert.strictEqual(name('/'), '-index', 'root route returns -index')
  assert.strictEqual(name('/memories'), '-memories', 'named base route converts slashes')
  assert.strictEqual(name('/batman/robin'), '-batman-robin', 'intermediate slashes are converted to dashes')
  assert.strictEqual(name('/batman.robin'), '-batman_robin', 'dots are converted to underscores')
  assert.strictEqual(name('/batman-robin'), '-batman_robin', 'dashes are converted to underscores')
  assert.strictEqual(name('/:batman'), '-000batman', 'colons are converted to triple zeros')
  assert.strictEqual(name('/path/*'), '-path-catchall', '* is converted to catchall')
  assert.strictEqual(name('\\path\\*'), '-path-catchall', 'windows path slashes are converted appropriately')
})
