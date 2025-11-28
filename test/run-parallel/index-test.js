const { test } = require('node:test')
const assert = require('node:assert')
const parallel = require('../../run-parallel')

test('Set up env', () => {
  assert.ok(parallel, 'Got parallel module')
})

test('parallel runs array tasks concurrently', (t, done) => {
  let startTime = Date.now()
  let tasks = [
    (cb) => setTimeout(() => cb(null, 'first'), 50),
    (cb) => setTimeout(() => cb(null, 'second'), 30),
    (cb) => setTimeout(() => cb(null, 'third'), 10),
  ]

  parallel(tasks, (err, results) => {
    let elapsed = Date.now() - startTime
    assert.ok(!err, 'No error returned')
    assert.deepStrictEqual(results, [ 'first', 'second', 'third' ], 'Results in original order')
    assert.strictEqual(results.length, 3, 'All results returned')
    assert.ok(elapsed < 80, 'Tasks ran concurrently (should be ~50ms, not 90ms)')
    done()
  })
})

test('parallel runs object tasks concurrently', (t, done) => {
  let startTime = Date.now()
  let tasks = {
    a: (cb) => setTimeout(() => cb(null, 'first'), 50),
    b: (cb) => setTimeout(() => cb(null, 'second'), 30),
    c: (cb) => setTimeout(() => cb(null, 'third'), 10),
  }

  parallel(tasks, (err, results) => {
    let elapsed = Date.now() - startTime
    assert.ok(!err, 'No error returned')
    assert.deepStrictEqual(results, { a: 'first', b: 'second', c: 'third' }, 'Results keyed correctly')
    assert.strictEqual(Object.keys(results).length, 3, 'All results returned')
    assert.ok(elapsed < 80, 'Tasks ran concurrently')
    done()
  })
})

test('parallel handles empty array', (t, done) => {
  parallel([], (err, results) => {
    assert.ok(!err, 'No error returned')
    assert.deepStrictEqual(results, [], 'Empty array returned')
    done()
  })
})

test('parallel handles empty object', (t, done) => {
  parallel({}, (err, results) => {
    assert.ok(!err, 'No error returned')
    assert.deepStrictEqual(results, {}, 'Empty object returned')
    done()
  })
})

test('parallel stops on first error (array)', (t, done) => {
  let tasks = [
    (cb) => setTimeout(() => cb(null, 'success'), 50),
    (cb) => setTimeout(() => cb(new Error('Task failed')), 10),
    (cb) => setTimeout(() => cb(null, 'also success'), 30),
  ]

  parallel(tasks, (err) => {
    assert.ok(err, 'Error returned')
    assert.strictEqual(err.message, 'Task failed', 'Correct error message')
    done()
  })
})

test('parallel stops on first error (object)', (t, done) => {
  let tasks = {
    slow: (cb) => setTimeout(() => cb(null, 'success'), 50),
    fast: (cb) => setTimeout(() => cb(new Error('Task failed')), 10),
    medium: (cb) => setTimeout(() => cb(null, 'also success'), 30),
  }

  parallel(tasks, (err) => {
    assert.ok(err, 'Error returned')
    assert.strictEqual(err.message, 'Task failed', 'Correct error message')
    done()
  })
})

test('parallel handles synchronous tasks', (t, done) => {
  let tasks = [
    (cb) => cb(null, 'sync1'),
    (cb) => cb(null, 'sync2'),
    (cb) => cb(null, 'sync3'),
  ]

  parallel(tasks, (err, results) => {
    assert.ok(!err, 'No error returned')
    assert.deepStrictEqual(results, [ 'sync1', 'sync2', 'sync3' ], 'All sync results returned')
    done()
  })
})

test('parallel handles mixed sync and async tasks', (t, done) => {
  let tasks = [
    (cb) => cb(null, 'sync'),
    (cb) => setTimeout(() => cb(null, 'async'), 10),
    (cb) => cb(null, 'sync2'),
  ]

  parallel(tasks, (err, results) => {
    assert.ok(!err, 'No error returned')
    assert.deepStrictEqual(results, [ 'sync', 'async', 'sync2' ], 'Mixed results returned correctly')
    done()
  })
})

test('parallel handles undefined results', (t, done) => {
  let tasks = [
    (cb) => cb(null),
    (cb) => cb(null, 'defined'),
    (cb) => cb(null),
  ]

  parallel(tasks, (err, results) => {
    assert.ok(!err, 'No error returned')
    assert.deepStrictEqual(results, [ undefined, 'defined', undefined ], 'Undefined results handled correctly')
    done()
  })
})

test('parallel prevents multiple callback invocations', (t, done) => {
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
    assert.ok(!err, 'No error returned')
    assert.deepStrictEqual(results, [ 'first', 'second' ], 'Results returned correctly')

    // Wait a bit to ensure the delayed callback doesn't fire
    setTimeout(() => {
      assert.strictEqual(callbackCount, 1, 'Callback only called once')
      done()
    }, 50)
  })
})
