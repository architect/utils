let getLambdaName = require('../get-lambda-name')
let path = require('path')
let {readArc} = require('@architect/parser')

module.exports = function inventory(arc) {

  if (!arc) {
    let parsed = readArc()
    arc = parsed.arc
  }

  let app = arc.app[0]

  let report = {
    app,
    restapis: [
      `${app}-staging`,
      `${app}-production`,
    ],
    websocketapis: [],
    lambdas: [],
    types: {
      http:[],
      ws:[],
      events:[],
      queues:[],
      scheduled:[],
      tables:[],
    },
    iamroles: ['arc-role'],
    snstopics: [],
    sqstopics: [],
    s3buckets: [],
    cwerules: [],
    tables: [],
    localPaths: [],
  }

  // gets an http lambda name
  function getName(tuple) {
    if (Array.isArray(tuple)) {
      var verb = tuple[0]
      var path = getLambdaName(tuple[1])
      return [`${app}-production-${verb}${path}`, `${app}-staging-${verb}${path}`]
    }
    else {
      var path = getLambdaName(tuple)
      return [`${app}-production-get${path}`, `${app}-staging-get${path}`]
    }
  }

  function getPath(type, tuple) {
    if (type === 'scheduled') {
      return ['src', type, tuple[0]]
    }
    else if (Array.isArray(tuple)) {
      var verb = tuple[0]
      var path = getLambdaName(tuple[1])
      return ['src', type, `${verb}${path}`]
    }
    else {
      return ['src', type, tuple]
    }
  }

  // gets an http filesystem name
  function getSystemName(tuple) {
    if (Array.isArray(tuple)) {
      var verb = tuple[0]
      var path = getLambdaName(tuple[1])
      return `${verb}${path}`
    }
    else {
      var path = getLambdaName(tuple)
      return `get${path}`
    }
  }

  // get an sns lambda name
  function getEventName(event) {
    return [`${app}-production-${event}`, `${app}-staging-${event}`]
  }

  // get a scheduled lambda name
  function getScheduledName(arr) {
    var name = arr.slice(0).shift()
    return [`${app}-production-${name}`, `${app}-staging-${name}`]
  }

  // get a table name
  function getTableName(tbl) {
    return Object.keys(tbl)[0]
  }

  if (arc.http && arc.http.length > 0) {
    report.lambdas = arc.http.map(getName).reduce((a,b)=>a.concat(b))
    report.types.http = arc.http.map(getSystemName)
    report.localPaths = arc.http.map(function fmt(tuple) {
      return path.join.apply({}, getPath('http', tuple))
    })
  }

  if (arc.ws) {
    // Handle 5 vs 6 WS naming changes
    let wsName = name => process.env.DEPRECATED ? `ws-${name}` : name
    let dir = name => path.join('src', 'ws', wsName(name))

    const infras = ['staging', 'production']
    const routes = ['default', 'connect', 'disconnect'].concat(arc.ws)

    report.types.ws = routes.map(wsName)

    report.localPaths = report.localPaths.concat(routes.map(dir))

    report.websocketapis = infras.map(infra => `${app}-ws-${infra}`)

    infras.forEach(infra => {
      const lambdas = routes.map(route => `${app}-${infra}-ws-${route}`)
      report.lambdas = report.lambdas.concat(lambdas)
    })
  }

  if (arc.events && arc.events.length > 0) {
    report.lambdas = report.lambdas.concat(arc.events.map(getEventName).reduce((a,b)=>a.concat(b)))
    report.types.events = arc.events.slice(0)
    arc.events.forEach(e=> {
      report.snstopics.push(`${app}-staging-${e}`)
      report.snstopics.push(`${app}-production-${e}`)
    })
    report.localPaths = report.localPaths.concat(arc.events.map(function fmt(tuple) {
      return path.join.apply({}, getPath('events', tuple))
    }))
  }

  if (arc.queues && arc.queues.length > 0) {
    report.lambdas = report.lambdas.concat(arc.queues.map(getEventName).reduce((a,b)=>a.concat(b)))
    report.types.queues = arc.queues.slice(0)
    arc.queues.forEach(e=> {
      report.sqstopics.push(`${app}-staging-${e}`)
      report.sqstopics.push(`${app}-production-${e}`)
    })
    report.localPaths = report.localPaths.concat(arc.queues.map(function fmt(tuple) {
      return path.join.apply({}, getPath('queues', tuple))
    }))
  }

  if (arc.scheduled) {
    let scheds = arc.scheduled.map(getScheduledName).slice(0).reduce((a,b)=>a.concat(b))
    report.lambdas = report.lambdas.concat(scheds)
    report.types.scheduled = arc.scheduled.map(a=> a[0])
    report.localPaths = report.localPaths.concat(arc.scheduled.map(function fmt(tuple) {
      return path.join.apply({}, getPath('scheduled', tuple))
    }))
    report.cwerules = scheds.slice(0)
  }

  if (arc.tables) {
    arc.tables.forEach(tbl=> {
      var tablename = getTableName(tbl)
      report.tables.push(`${app}-staging-${tablename}`)
      report.tables.push(`${app}-production-${tablename}`)
      var keys = Object.keys(tbl[tablename])
      var lambdas = keys.filter(k=> k === 'insert' || k === 'update' || k === 'destroy')
      lambdas.forEach(q=> {
        report.lambdas.push(`${app}-production-${tablename}-${q}`)
        report.lambdas.push(`${app}-staging-${tablename}-${q}`)
        report.types.tables.push(`${tablename}-${q}`)
      })
      report.localPaths = report.localPaths.concat(lambdas.map(function fmt(q) {
        return path.join.apply({}, getPath('tables', `${tablename}-${q}`))
      }))
    })
  }

  if (arc.static) {
    report.s3buckets = []
    let staging = arc.static.find(t=> t[0] === 'staging')
    let production = arc.static.find(t=> t[0] === 'production')
    if (staging) report.s3buckets.push(staging[1])
    if (production) report.s3buckets.push(production[1])
  }

  if (arc.views && arc.views.length > 0) {
    report.views = arc.views.map(getSystemName)
  }

  // pass off the data
  return report
}
