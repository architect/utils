let test = require('tape')
let utils = require('../')

test('env', t=> {
  t.plan(2)
  t.ok(utils, 'utils exists')
  t.ok(typeof utils === 'object', 'is an object')
  console.log(utils)
})
