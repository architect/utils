let { join } = require('path')
let test = require('tape')
let _inventory = require('@architect/inventory')
let cwd = process.cwd()
let sut = join(cwd, 'deep-frozen-copy')
let deepFrozenCopy = require(sut)
let inventory

test('Set up env', async t => {
  t.plan(2)
  t.ok(deepFrozenCopy, 'Got deepFrozenCopy module')
  inventory = await _inventory({ cwd: join(cwd, 'test', 'mock', 'project') })
  t.ok(inventory, 'Inventoried a decent sized project')
})

test('Result is an immutable copy', t => {
  t.plan(2)
  let result = deepFrozenCopy(inventory)
  t.deepEqual(result, inventory, 'Copy is deeply equal to original')
  result.inv._arc.version = 'lol'
  result.inv._arc.pragmas.all.push['idk']
  t.deepEqual(result, inventory, 'Copy is still deeply equal to original even after attempted mutation')
})

test('Benchmark', t => {
  t.plan(1)
  let runs = 1000
  let start = Date.now()
  for (let i = 0; i < runs; i++) {
    deepFrozenCopy(inventory)
  }
  let end = Date.now()
  let result = end - start
  console.log(`Deep copied project ${runs} times in ${result}ms`)
  t.ok(result / runs < 1, `Average deepFrozenCopy was less than 1ms: ${result / runs}ms`)
})
