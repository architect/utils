const { test } = require('node:test')
const assert = require('node:assert')
const waterfall = require('../../run-waterfall')

test('Set up env', () => {
  assert.ok(waterfall, 'Got waterfall module')
})

test('waterfall passes results between tasks', (t, done) => {
  let tasks = [
    (cb) => {
      setTimeout(() => cb(null, 'first', 'data'), 10)
    },
    (arg1, arg2, cb) => {
      assert.strictEqual(arg1 + ' ' + arg2, 'first data', 'First task results passed to second')
      cb(null, arg1, arg2, 'second')
    },
    (arg1, arg2, arg3, cb) => {
      cb(null, [ arg1, arg2, arg3 ].join(' '))
    },
  ]

  waterfall(tasks, (err, result) => {
    assert.ok(!err, 'No error returned')
    assert.strictEqual(result, 'first data second', 'Final result correct')
    done()
  })
})

test('waterfall handles single task', (t, done) => {
  let tasks = [
    (cb) => cb(null, 'single', 'result'),
  ]

  waterfall(tasks, (err, arg1, arg2) => {
    assert.ok(!err, 'No error returned')
    assert.strictEqual(arg1, 'single', 'First argument passed')
    assert.strictEqual(arg2, 'result', 'Second argument passed')
    done()
  })
})

test('waterfall handles empty task array', (t, done) => {
  waterfall([], (err) => {
    assert.ok(!err, 'No error returned for empty array')
    done()
  })
})

test('waterfall stops on first error', (t, done) => {
  let tasksCalled = 0
  let tasks = [
    (cb) => {
      tasksCalled++
      cb(null, 'first')
    },
    (arg, cb) => {
      tasksCalled++
      cb(new Error('Second task failed'))
    },
    (arg, cb) => {
      tasksCalled++
      cb(null, 'third')
    },
  ]

  waterfall(tasks, (err) => {
    assert.ok(err, 'Error returned')
    assert.strictEqual(err.message, 'Second task failed', 'Correct error message')
    assert.strictEqual(tasksCalled, 2, 'Only first two tasks called')
    done()
  })
})

test('waterfall handles synchronous tasks', (t, done) => {
  let tasks = [
    (cb) => cb(null, 'sync1'),
    (arg, cb) => cb(null, arg, 'sync2'),
    (arg1, arg2, cb) => cb(null, arg1 + ' ' + arg2),
  ]

  waterfall(tasks, (err, result) => {
    assert.ok(!err, 'No error returned')
    assert.strictEqual(result, 'sync1 sync2', 'Sync tasks chained correctly')
    done()
  })
})

test('waterfall handles no arguments from task', (t, done) => {
  let tasks = [
    (cb) => cb(null),
    (cb) => cb(null, 'final'),
  ]

  waterfall(tasks, (err, result) => {
    assert.ok(!err, 'No error returned')
    assert.strictEqual(result, 'final', 'Final result correct even with no intermediate args')
    done()
  })
})

test('waterfall handles multiple arguments', (t, done) => {
  let tasks = [
    (cb) => cb(null, 'a', 'b', 'c', 'd'),
    (a, b, c, d, cb) => {
      assert.strictEqual(a, 'a', 'First arg correct')
      assert.strictEqual(b, 'b', 'Second arg correct')
      assert.strictEqual(c, 'c', 'Third arg correct')
      assert.strictEqual(d, 'd', 'Fourth arg correct')
      cb(null, 'done')
    },
  ]

  waterfall(tasks, (err, result) => {
    assert.ok(!err, 'No error returned')
    assert.strictEqual(result, 'done', 'Final result correct')
    done()
  })
})

test('waterfall handles mixed sync and async tasks', (t, done) => {
  let tasks = [
    (cb) => cb(null, 'sync'),
    (arg, cb) => setTimeout(() => cb(null, arg, 'async'), 10),
    (arg1, arg2, cb) => cb(null, arg1 + ' ' + arg2),
  ]

  waterfall(tasks, (err, result) => {
    assert.ok(!err, 'No error returned')
    assert.strictEqual(result, 'sync async', 'Mixed sync/async tasks work correctly')
    done()
  })
})

test('waterfall preserves error without additional arguments', (t, done) => {
  let tasks = [
    (cb) => cb(new Error('Initial error')),
  ]

  waterfall(tasks, (err) => {
    assert.ok(err, 'Error returned')
    assert.strictEqual(err.message, 'Initial error', 'Error message preserved')
    done()
  })
})
