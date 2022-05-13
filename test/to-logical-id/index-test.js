let test = require('tape')
let toLogicalID = require('../../to-logical-id')

test('Get', t => {
  t.plan(4)
  t.equals(toLogicalID('get'), 'GetIndex', 'get returns GetIndex')
  t.equals(toLogicalID('Get'), 'GetIndex', 'Get returns GetIndex')
  t.equals(toLogicalID('getIndex'), 'GetIndex', 'GetIndex returns GetIndex')
  t.equals(toLogicalID('GetIndex'), 'GetIndex', 'GetIndex returns GetIndex')
})

test('App and environment', t => {
  t.plan(2)
  t.equals(toLogicalID('my-app-staging'), 'MyAppStaging', 'my-app-staging returns MyAppStaging')
  t.equals(toLogicalID('my-app-production'), 'MyAppProduction', 'my-app-production returns MyAppProduction')
})

test('numerical app name', t => {
  t.plan(2)
  t.equals(toLogicalID('1234'), '1234', '"1234" returns "1234"')
  t.equals(toLogicalID(1234), '1234', '1234 returns "1234"')
})
