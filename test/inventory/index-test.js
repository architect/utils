let test = require('tape')
let inventory = require('../../inventory')

test('Module is present', t => {
  t.plan(8)
  t.ok(inventory, 'Inventory module is present')
  t.ok(inventory.getHttpName, 'getHttpName method is present')
  t.ok(inventory.getHttpSystemName, 'getHttpSystemName method is present')
  t.ok(inventory.getPath, 'getPath method is present')
  t.ok(inventory.getEventName, 'getEventName method is present')
  t.ok(inventory.getQueueName, 'getQueueName method is present')
  t.ok(inventory.getScheduledName, 'getScheduledName method is present')
  t.ok(inventory.getTableName, 'getTableName method is present')
})

test('Inventory returns key properties', t => {
  t.plan(18)
  let arc = {
    app: [ 'an-app' ]
  }
  let i = inventory(arc)
  t.ok(i.app, 'Inventory returned app')
  t.ok(Array.isArray(i.restapis), 'Returned array of restapis')
  t.ok(Array.isArray(i.websocketapis), 'Returned array of websocketapis')
  t.ok(Array.isArray(i.lambdas), 'Returned array of lambdas')
  t.ok(i.types, 'Returned types')
  t.ok(Array.isArray(i.types.http), 'Returned array of types.http')
  t.ok(Array.isArray(i.types.ws), 'Returned array of types.ws')
  t.ok(Array.isArray(i.types.events), 'Returned array of types.events')
  t.ok(Array.isArray(i.types.queues), 'Returned array of types.queues')
  t.ok(Array.isArray(i.types.scheduled), 'Returned array of types.scheduled')
  t.ok(Array.isArray(i.types.tables), 'Returned array of types.tables')
  t.ok(Array.isArray(i.iamroles), 'Returned array of iamroles')
  t.ok(Array.isArray(i.snstopics), 'Returned array of snstopics')
  t.ok(Array.isArray(i.sqstopics), 'Returned array of sqstopics')
  t.ok(Array.isArray(i.s3buckets), 'Returned array of s3buckets')
  t.ok(Array.isArray(i.cwerules), 'Returned array of cwerules')
  t.ok(Array.isArray(i.tables), 'Returned array of tables')
  t.ok(Array.isArray(i.localPaths), 'Returned array of localPaths')
})

test('@http inventory', t => {
  t.plan(8)
  let arc = {
    app: [ 'an-app' ],
    http: [
      [ 'get', '/' ],
      [ 'post', '/foo' ]
    ]
  }
  let i = inventory(arc)
  t.equal(i.lambdas[0], 'an-app-staging-get-index', 'Returned lambda: staging get /')
  t.equal(i.lambdas[1], 'an-app-production-get-index', 'Returned lambda: production get /')
  t.equal(i.lambdas[2], 'an-app-staging-post-foo', 'Returned lambda: staging post/foo')
  t.equal(i.lambdas[3], 'an-app-production-post-foo', 'Returned lambda: production post /foo')
  t.equal(i.types.http[0], 'get-index', 'Returned types.http: get /')
  t.equal(i.types.http[1], 'post-foo', 'Returned types.http: post /foo')
  t.equal(i.localPaths[0], 'src/http/get-index', 'Returned local path: get /')
  t.equal(i.localPaths[1], 'src/http/post-foo', 'Returned local path: post /foo')
})

test('@ws inventory', t => {
  t.plan(16)
  let arc = {
    app: [ 'an-app' ],
    ws: []
  }
  let i = inventory(arc)
  t.equal(i.lambdas[0], 'an-app-staging-ws-default', 'Returned lambda: staging default')
  t.equal(i.lambdas[1], 'an-app-staging-ws-connect', 'Returned lambda: staging connect')
  t.equal(i.lambdas[2], 'an-app-staging-ws-disconnect', 'Returned lambda: staging disconnect')
  t.equal(i.lambdas[3], 'an-app-production-ws-default', 'Returned lambda: production default')
  t.equal(i.lambdas[4], 'an-app-production-ws-connect', 'Returned lambda: production connect')
  t.equal(i.lambdas[5], 'an-app-production-ws-disconnect', 'Returned lambda: production disconnect')
  t.equal(i.types.ws[0], 'default', 'Returned types.ws: default')
  t.equal(i.types.ws[1], 'connect', 'Returned types.ws: connect')
  t.equal(i.types.ws[2], 'disconnect', 'Returned types.ws: disconnect')
  t.equal(i.localPaths[0], 'src/ws/default', 'Returned local path: default')
  t.equal(i.localPaths[1], 'src/ws/connect', 'Returned local path: connect')
  t.equal(i.localPaths[2], 'src/ws/disconnect', 'Returned local path: disconnect')

  arc = {
    app: [ 'an-app' ],
    ws: [ 'arbitrary' ]
  }
  i = inventory(arc)
  t.equal(i.lambdas[3], 'an-app-staging-ws-arbitrary', 'Returned lambda: staging arbitrary')
  t.equal(i.lambdas[7], 'an-app-production-ws-arbitrary', 'Returned lambda: production arbitrary')
  t.equal(i.types.ws[3], 'arbitrary', 'Returned types.ws: arbitrary')
  t.equal(i.localPaths[3], 'src/ws/arbitrary', 'Returned local path: arbitrary')
})

test('@events inventory', t => {
  t.plan(6)
  let arc = {
    app: [ 'an-app' ],
    events: [ 'an-event' ]
  }
  let i = inventory(arc)
  t.equal(i.lambdas[0], 'an-app-staging-an-event', 'Returned lambda: staging an-event')
  t.equal(i.lambdas[1], 'an-app-production-an-event', 'Returned lambda: production an-event')
  t.equal(i.types.events[0], 'an-event', 'Returned types.events: event')
  t.equal(i.snstopics[0], 'an-app-staging-an-event', 'Returned SNS topic: staging an-event')
  t.equal(i.snstopics[1], 'an-app-production-an-event', 'Returned SNS topic: production an-event')
  t.equal(i.localPaths[0], 'src/events/an-event', 'Returned local path: an-event')
})

test('@scheduled inventory', t => {
  t.plan(6)
  let arc = {
    app: [ 'an-app' ],
    scheduled: [ [ 'a-scheduled-event', 'rate(1', 'hour)' ] ]
  }
  let i = inventory(arc)
  t.equal(i.lambdas[0], 'an-app-staging-a-scheduled-event', 'Returned lambda: staging a-scheduled-event')
  t.equal(i.lambdas[1], 'an-app-production-a-scheduled-event', 'Returned lambda: production a-scheduled-event')
  t.equal(i.types.scheduled[0], 'a-scheduled-event', 'Returned types.events: event')
  t.equal(i.cwerules[0], 'an-app-staging-a-scheduled-event', 'Returned SNS topic: staging a-scheduled-event')
  t.equal(i.cwerules[1], 'an-app-production-a-scheduled-event', 'Returned SNS topic: production a-scheduled-event')
  t.equal(i.localPaths[0], 'src/scheduled/a-scheduled-event', 'Returned local path: a-scheduled-event')
})

test('@tables inventory', t => {
  t.plan(20)
  // Legacy mode
  let arc = {
    app: [ 'an-app' ],
    tables: [ { 'some-data': {
      id: '*String',
      update: 'Lambda',
      insert: 'Lambda',
      destroy: 'Lambda',
    } } ]
  }
  let i = inventory(arc)
  t.equal(i.lambdas[0], 'an-app-staging-some-data-update', 'Returned lambda: staging some-data update')
  t.equal(i.lambdas[1], 'an-app-production-some-data-update', 'Returned lambda: production some-data update')
  t.equal(i.lambdas[2], 'an-app-staging-some-data-insert', 'Returned lambda: staging some-data insert')
  t.equal(i.lambdas[3], 'an-app-production-some-data-insert', 'Returned lambda: production some-data insert')
  t.equal(i.lambdas[4], 'an-app-staging-some-data-destroy', 'Returned lambda: staging some-data destroy')
  t.equal(i.lambdas[5], 'an-app-production-some-data-destroy', 'Returned lambda: production some-data destroy')
  t.equal(i.types.tables[0], 'some-data-update', 'Returned types.tables: some-data-update')
  t.equal(i.types.tables[1], 'some-data-insert', 'Returned types.tables: some-data-insert')
  t.equal(i.types.tables[2], 'some-data-destroy', 'Returned types.tables: some-data-destroy')
  t.equal(i.tables[0], 'an-app-staging-some-data', 'Returned tables: staging some-data')
  t.equal(i.tables[1], 'an-app-production-some-data', 'Returned tables: production some-data')
  t.equal(i.localPaths[0], 'src/tables/some-data-update', 'Returned local path: some-data-update')
  t.equal(i.localPaths[1], 'src/tables/some-data-insert', 'Returned local path: some-data-insert')
  t.equal(i.localPaths[2], 'src/tables/some-data-destroy', 'Returned local path: some-data-destroy')

  arc = {
    app: [ 'an-app' ],
    tables: [ { things: { id: '*String', stream: true } } ]
  }
  i = inventory(arc)
  t.equal(i.lambdas[0], 'an-app-staging-things-stream', 'Returned lambda: staging things stream')
  t.equal(i.lambdas[1], 'an-app-production-things-stream', 'Returned lambda: production things stream')
  t.equal(i.types.tables[0], 'things-stream', 'Returned types.tables: things-stream')
  t.equal(i.tables[0], 'an-app-staging-things', 'Returned tables: staging things')
  t.equal(i.tables[1], 'an-app-production-things', 'Returned tables: production things')
  t.equal(i.localPaths[0], 'src/tables/things', 'Returned local path: things')
})

test('@static inventory', t => {
  t.plan(3)
  let arc = {
    app: [ 'an-app' ],
    static: []
  }
  let i = inventory(arc)
  t.ok(Array.isArray(i.s3buckets), 'Returned array of s3buckets')

  arc = {
    app: [ 'an-app' ],
    static: [
      [ 'staging', 'staging-bucket' ],
      [ 'production', 'production-bucket' ],
    ]
  }
  i = inventory(arc)
  t.equal(i.s3buckets[0], 'staging-bucket', 'Returned s3bucket: staging-bucket')
  t.equal(i.s3buckets[1], 'production-bucket', 'Returned s3bucket: production-bucket')
})

test('@views inventory', t => {
  t.plan(1)
  let arc = {
    app: [ 'an-app' ],
    views: [ ['get', '/'] ]
  }
  let i = inventory(arc)
  t.equal(i.views[0], 'get-index', 'Returned views: get-index')
})
