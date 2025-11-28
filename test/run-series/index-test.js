const { test } = require('node:test')
const assert = require('node:assert')
const series = require('../../run-series')

test('Set up env', () => {
  assert.ok(series, 'Got series module')
})

test('series runs tasks in order', (t, done) => {
  let order = []
  let tasks = [
    (cb) => {
      setTimeout(() => {
        order.push(1)
        cb(null, 'first')
      }, 50)
    },
    (cb) => {
      setTimeout(() => {
        order.push(2)
        cb(null, 'second')
      }, 10)
    },
    (cb) => {
      order.push(3)
      cb(null, 'third')
    },
  ]

  series(tasks, (err, results) => {
    assert.ok(!err, 'No error returned')
    assert.deepStrictEqual(order, [ 1, 2, 3 ], 'Tasks ran in correct order')
    assert.deepStrictEqual(results, [ 'first', 'second', 'third' ], 'Results in correct order')
    assert.strictEqual(results.length, 3, 'All results returned')
    done()
  })
})

test('series handles empty task array', (t, done) => {
  series([], (err, results) => {
    assert.ok(!err, 'No error returned')
    assert.deepStrictEqual(results, [], 'Empty results array returned')
    done()
  })
})

test('series stops on first error', (t, done) => {
  let order = []
  let tasks = [
    (cb) => {
      order.push(1)
      cb(null, 'first')
    },
    (cb) => {
      order.push(2)
      cb(new Error('Task failed'))
    },
    (cb) => {
      order.push(3)
      cb(null, 'third')
    },
  ]

  series(tasks, (err) => {
    assert.ok(err, 'Error returned')
    assert.strictEqual(err.message, 'Task failed', 'Correct error message')
    assert.deepStrictEqual(order, [ 1, 2 ], 'Only first two tasks ran')
    done()
  })
})

test('series handles synchronous tasks', (t, done) => {
  let tasks = [
    (cb) => cb(null, 'sync1'),
    (cb) => cb(null, 'sync2'),
    (cb) => cb(null, 'sync3'),
  ]

  series(tasks, (err, results) => {
    assert.ok(!err, 'No error returned')
    assert.deepStrictEqual(results, [ 'sync1', 'sync2', 'sync3' ], 'All sync results returned')
    assert.strictEqual(results.length, 3, 'Correct number of results')
    done()
  })
})

test('series handles mixed sync and async tasks', (t, done) => {
  let tasks = [
    (cb) => cb(null, 'sync'),
    (cb) => setTimeout(() => cb(null, 'async'), 10),
    (cb) => cb(null, 'sync2'),
  ]

  series(tasks, (err, results) => {
    assert.ok(!err, 'No error returned')
    assert.deepStrictEqual(results, [ 'sync', 'async', 'sync2' ], 'Mixed results returned correctly')
    done()
  })
})

test('series handles undefined results', (t, done) => {
  let tasks = [
    (cb) => cb(null),
    (cb) => cb(null, 'defined'),
    (cb) => cb(null),
  ]

  series(tasks, (err, results) => {
    assert.ok(!err, 'No error returned')
    assert.deepStrictEqual(results, [ undefined, 'defined', undefined ], 'Undefined results handled correctly')
    done()
  })
})
