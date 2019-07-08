let test = require('tape')
let layers = require('../get-layers')

test('get-layers returns undefined if arc or arc.aws is falsy', t => {
  t.plan(1)
  t.equals(layers(), undefined, 'undefined returned for falsy arc')
})
test('get-layers returns layers from `layers` object', t => {
  t.plan(1)
  let arc = { aws: [['runtime', 'pascal'], ['layers', ['one', 'two']]] }
  t.deepEquals(layers(arc), ['one', 'two'], 'layer properly returned')
})
