let test = require('tape')
let waterfall = require('../../run-waterfall')

test('Set up env', t => {
  t.plan(1)
  t.ok(waterfall, 'Got waterfall module')
})

test('waterfall passes results between tasks', t => {
  t.plan(3)

  let tasks = [
    (cb) => {
      setTimeout(() => cb(null, 'first', 'data'), 10)
    },
    (arg1, arg2, cb) => {
      t.equal(arg1 + ' ' + arg2, 'first data', 'First task results passed to second')
      cb(null, arg1, arg2, 'second')
    },
    (arg1, arg2, arg3, cb) => {
      cb(null, [ arg1, arg2, arg3 ].join(' '))
    },
  ]

  waterfall(tasks, (err, result) => {
    t.notOk(err, 'No error returned')
    t.equal(result, 'first data second', 'Final result correct')
  })
})

test('waterfall handles single task', t => {
  t.plan(3)

  let tasks = [
    (cb) => cb(null, 'single', 'result'),
  ]

  waterfall(tasks, (err, arg1, arg2) => {
    t.notOk(err, 'No error returned')
    t.equal(arg1, 'single', 'First argument passed')
    t.equal(arg2, 'result', 'Second argument passed')
  })
})

test('waterfall handles empty task array', t => {
  t.plan(1)

  waterfall([], (err) => {
    t.notOk(err, 'No error returned for empty array')
  })
})

test('waterfall stops on first error', t => {
  t.plan(3)

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
    t.ok(err, 'Error returned')
    t.equal(err.message, 'Second task failed', 'Correct error message')
    t.equal(tasksCalled, 2, 'Only first two tasks called')
  })
})

test('waterfall handles synchronous tasks', t => {
  t.plan(2)

  let tasks = [
    (cb) => cb(null, 'sync1'),
    (arg, cb) => cb(null, arg, 'sync2'),
    (arg1, arg2, cb) => cb(null, arg1 + ' ' + arg2),
  ]

  waterfall(tasks, (err, result) => {
    t.notOk(err, 'No error returned')
    t.equal(result, 'sync1 sync2', 'Sync tasks chained correctly')
  })
})

test('waterfall handles no arguments from task', t => {
  t.plan(2)

  let tasks = [
    (cb) => cb(null),
    (cb) => cb(null, 'final'),
  ]

  waterfall(tasks, (err, result) => {
    t.notOk(err, 'No error returned')
    t.equal(result, 'final', 'Final result correct even with no intermediate args')
  })
})

test('waterfall handles multiple arguments', t => {
  t.plan(6)

  let tasks = [
    (cb) => cb(null, 'a', 'b', 'c', 'd'),
    (a, b, c, d, cb) => {
      t.equal(a, 'a', 'First arg correct')
      t.equal(b, 'b', 'Second arg correct')
      t.equal(c, 'c', 'Third arg correct')
      t.equal(d, 'd', 'Fourth arg correct')
      cb(null, 'done')
    },
  ]

  waterfall(tasks, (err, result) => {
    t.notOk(err, 'No error returned')
    t.equal(result, 'done', 'Final result correct')
  })
})

test('waterfall handles mixed sync and async tasks', t => {
  t.plan(2)

  let tasks = [
    (cb) => cb(null, 'sync'),
    (arg, cb) => setTimeout(() => cb(null, arg, 'async'), 10),
    (arg1, arg2, cb) => cb(null, arg1 + ' ' + arg2),
  ]

  waterfall(tasks, (err, result) => {
    t.notOk(err, 'No error returned')
    t.equal(result, 'sync async', 'Mixed sync/async tasks work correctly')
  })
})

test('waterfall preserves error without additional arguments', t => {
  t.plan(2)

  let tasks = [
    (cb) => cb(new Error('Initial error')),
  ]

  waterfall(tasks, (err) => {
    t.ok(err, 'Error returned')
    t.equal(err.message, 'Initial error', 'Error message preserved')
  })
})
