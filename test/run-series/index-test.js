let test = require('tape')
let series = require('../../run-series')

test('Set up env', t => {
  t.plan(1)
  t.ok(series, 'Got series module')
})

test('series runs tasks in order', t => {
  t.plan(4)

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
    t.notOk(err, 'No error returned')
    t.deepEqual(order, [ 1, 2, 3 ], 'Tasks ran in correct order')
    t.deepEqual(results, [ 'first', 'second', 'third' ], 'Results in correct order')
    t.equal(results.length, 3, 'All results returned')
  })
})

test('series handles empty task array', t => {
  t.plan(2)

  series([], (err, results) => {
    t.notOk(err, 'No error returned')
    t.deepEqual(results, [], 'Empty results array returned')
  })
})

test('series stops on first error', t => {
  t.plan(3)

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
    t.ok(err, 'Error returned')
    t.equal(err.message, 'Task failed', 'Correct error message')
    t.deepEqual(order, [ 1, 2 ], 'Only first two tasks ran')
  })
})

test('series handles synchronous tasks', t => {
  t.plan(3)

  let tasks = [
    (cb) => cb(null, 'sync1'),
    (cb) => cb(null, 'sync2'),
    (cb) => cb(null, 'sync3'),
  ]

  series(tasks, (err, results) => {
    t.notOk(err, 'No error returned')
    t.deepEqual(results, [ 'sync1', 'sync2', 'sync3' ], 'All sync results returned')
    t.equal(results.length, 3, 'Correct number of results')
  })
})

test('series handles mixed sync and async tasks', t => {
  t.plan(2)

  let tasks = [
    (cb) => cb(null, 'sync'),
    (cb) => setTimeout(() => cb(null, 'async'), 10),
    (cb) => cb(null, 'sync2'),
  ]

  series(tasks, (err, results) => {
    t.notOk(err, 'No error returned')
    t.deepEqual(results, [ 'sync', 'async', 'sync2' ], 'Mixed results returned correctly')
  })
})

test('series handles undefined results', t => {
  t.plan(2)

  let tasks = [
    (cb) => cb(null),
    (cb) => cb(null, 'defined'),
    (cb) => cb(null),
  ]

  series(tasks, (err, results) => {
    t.notOk(err, 'No error returned')
    t.deepEqual(results, [ undefined, 'defined', undefined ], 'Undefined results handled correctly')
  })
})
