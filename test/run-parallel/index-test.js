let test = require('tape')
let parallel = require('../../run-parallel')

test('Set up env', t => {
  t.plan(1)
  t.ok(parallel, 'Got parallel module')
})

test('parallel runs array tasks concurrently', t => {
  t.plan(4)

  let startTime = Date.now()
  let tasks = [
    (cb) => setTimeout(() => cb(null, 'first'), 50),
    (cb) => setTimeout(() => cb(null, 'second'), 30),
    (cb) => setTimeout(() => cb(null, 'third'), 10),
  ]

  parallel(tasks, (err, results) => {
    let elapsed = Date.now() - startTime
    t.notOk(err, 'No error returned')
    t.deepEqual(results, [ 'first', 'second', 'third' ], 'Results in original order')
    t.equal(results.length, 3, 'All results returned')
    t.ok(elapsed < 80, 'Tasks ran concurrently (should be ~50ms, not 90ms)')
  })
})

test('parallel runs object tasks concurrently', t => {
  t.plan(4)

  let startTime = Date.now()
  let tasks = {
    a: (cb) => setTimeout(() => cb(null, 'first'), 50),
    b: (cb) => setTimeout(() => cb(null, 'second'), 30),
    c: (cb) => setTimeout(() => cb(null, 'third'), 10),
  }

  parallel(tasks, (err, results) => {
    let elapsed = Date.now() - startTime
    t.notOk(err, 'No error returned')
    t.deepEqual(results, { a: 'first', b: 'second', c: 'third' }, 'Results keyed correctly')
    t.equal(Object.keys(results).length, 3, 'All results returned')
    t.ok(elapsed < 80, 'Tasks ran concurrently')
  })
})

test('parallel handles empty array', t => {
  t.plan(2)

  parallel([], (err, results) => {
    t.notOk(err, 'No error returned')
    t.deepEqual(results, [], 'Empty array returned')
  })
})

test('parallel handles empty object', t => {
  t.plan(2)

  parallel({}, (err, results) => {
    t.notOk(err, 'No error returned')
    t.deepEqual(results, {}, 'Empty object returned')
  })
})

test('parallel stops on first error (array)', t => {
  t.plan(2)

  let tasks = [
    (cb) => setTimeout(() => cb(null, 'success'), 50),
    (cb) => setTimeout(() => cb(new Error('Task failed')), 10),
    (cb) => setTimeout(() => cb(null, 'also success'), 30),
  ]

  parallel(tasks, (err) => {
    t.ok(err, 'Error returned')
    t.equal(err.message, 'Task failed', 'Correct error message')
  })
})

test('parallel stops on first error (object)', t => {
  t.plan(2)

  let tasks = {
    slow: (cb) => setTimeout(() => cb(null, 'success'), 50),
    fast: (cb) => setTimeout(() => cb(new Error('Task failed')), 10),
    medium: (cb) => setTimeout(() => cb(null, 'also success'), 30),
  }

  parallel(tasks, (err) => {
    t.ok(err, 'Error returned')
    t.equal(err.message, 'Task failed', 'Correct error message')
  })
})

test('parallel handles synchronous tasks', t => {
  t.plan(2)

  let tasks = [
    (cb) => cb(null, 'sync1'),
    (cb) => cb(null, 'sync2'),
    (cb) => cb(null, 'sync3'),
  ]

  parallel(tasks, (err, results) => {
    t.notOk(err, 'No error returned')
    t.deepEqual(results, [ 'sync1', 'sync2', 'sync3' ], 'All sync results returned')
  })
})

test('parallel handles mixed sync and async tasks', t => {
  t.plan(2)

  let tasks = [
    (cb) => cb(null, 'sync'),
    (cb) => setTimeout(() => cb(null, 'async'), 10),
    (cb) => cb(null, 'sync2'),
  ]

  parallel(tasks, (err, results) => {
    t.notOk(err, 'No error returned')
    t.deepEqual(results, [ 'sync', 'async', 'sync2' ], 'Mixed results returned correctly')
  })
})

test('parallel handles undefined results', t => {
  t.plan(2)

  let tasks = [
    (cb) => cb(null),
    (cb) => cb(null, 'defined'),
    (cb) => cb(null),
  ]

  parallel(tasks, (err, results) => {
    t.notOk(err, 'No error returned')
    t.deepEqual(results, [ undefined, 'defined', undefined ], 'Undefined results handled correctly')
  })
})

test('parallel prevents multiple callback invocations', t => {
  t.plan(3)

  let callbackCount = 0
  let tasks = [
    (cb) => {
      cb(null, 'first')
      // This should be ignored due to cb = null protection
      setTimeout(() => cb && cb(new Error('Should not be called')), 10)
    },
    (cb) => cb(null, 'second'),
  ]

  parallel(tasks, (err, results) => {
    callbackCount++
    t.notOk(err, 'No error returned')
    t.deepEqual(results, [ 'first', 'second' ], 'Results returned correctly')

    // Wait a bit to ensure the delayed callback doesn't fire
    setTimeout(() => {
      t.equal(callbackCount, 1, 'Callback only called once')
    }, 50)
  })
})
