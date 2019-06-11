let test = require('tape')
let readArc = require('../src/read-arc')

test('readArc', t=> {
  t.plan(1)
  try {
    let {arc, raw} = readArc()
    t.fail(arc, raw)
  }
  catch(e) {
    t.ok(e.message === 'not_found', 'not found')
  }
})
