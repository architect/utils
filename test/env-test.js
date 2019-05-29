let parse = require('@architect/parser')
let test = require('tape')
let utils = require('../')

test('env', t=> {
  t.plan(2)
  t.ok(utils, 'utils exists')
  t.ok(typeof utils === 'object', 'is an object')
  console.log(utils)
})

test('inventory', t=> {
  t.plan(2)
  let arc = parse(`
@app
testapp

@http
get /

@ws
@static
    `)
  t.ok(true, 'parsed')
  console.log(arc)
  let report = utils.inventory(arc)
  t.ok(report, 'report')
  console.log(report)
})
