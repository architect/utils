let test = require('tape')
let runtime = require('../../get-runtime')

test('get-runtime returns default runtime if arc or arc.aws is falsy', t => {
  t.plan(1)
  t.equals(runtime(), 'nodejs12.x', 'nodejs12.x returned for falsy arc')
})
test('get-runtime returns default runtime for unsupported runtime', t => {
  t.plan(1)
  let arc = { aws: [['runtime', 'pascal']] }
  t.deepEquals(runtime(arc), 'nodejs12.x', 'default runtime returned')
})
test('get-runtime returns correct runtime for supported runtime', t => {
  t.plan(1)
  let arc = { aws: [['runtime', 'ruby2.5']] }
  t.deepEquals(runtime(arc), 'ruby2.5', 'ruby runtime returned')
})
