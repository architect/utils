const { test } = require('node:test')
const assert = require('node:assert')
const { join } = require('path')
const _inventory = require('@architect/inventory')
const cwd = process.cwd()
const sut = join(cwd, 'deep-frozen-copy')
const deepFrozenCopy = require(sut)
let inventory

test('Set up env', async () => {
  assert.ok(deepFrozenCopy, 'Got deepFrozenCopy module')
  inventory = await _inventory({ cwd: join(cwd, 'test', 'mock', 'project') })
  assert.ok(inventory, 'Inventoried a decent sized project')
})

test('Result is an immutable copy', () => {
  let result = deepFrozenCopy(inventory)
  assert.deepStrictEqual(result, inventory, 'Copy is deeply equal to original')
  result.inv._arc.version = 'lol'
  result.inv._arc.pragmas.all.push['idk']
  assert.deepStrictEqual(result, inventory, 'Copy is still deeply equal to original even after attempted mutation')
})

test('Benchmark', () => {
  let runs = 1000
  let start = Date.now()
  for (let i = 0; i < runs; i++) {
    deepFrozenCopy(inventory)
  }
  let end = Date.now()
  let result = end - start
  console.log(`Deep copied project ${runs} times in ${result}ms`)
  assert.ok(result / runs < 1, `Average deepFrozenCopy was less than 1ms: ${result / runs}ms`)
})
