let rm = require('rimraf')
let test = require('tape')
let path = require('path')
let init = require('../init')

test('init', t=> {
  t.plan(1)
  // delete prev runs
  rm.sync(path.join(__dirname, 'mock', 'src'))
  // cd into test/mock
  process.chdir(path.join(__dirname, 'mock'))
  // init the source!
  init(function done(err) {
    if (err) t.fail(err)
    else {
      t.ok(true, 'source inited')
    }
  })
})
