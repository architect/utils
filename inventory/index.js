let getLambdaName = require('../get-lambda-name')
let path = require('path')
let {readArc} = require('@architect/parser')

// Get full HTTP Lambda names
function getHttpName (tuple, app) {
  if (Array.isArray(tuple)) {
    let verb = tuple[0]
    let path = getLambdaName(tuple[1])
    return [ `${app}-staging-${verb}${path}`, `${app}-production-${verb}${path}` ]
  }
  else {
    let path = getLambdaName(tuple)
    return [ `${app}-staging-get${path}`, `${app}-production-get${path}` ]
  }
}

// Gets HTTP Lambda names (broken out for type)
function getHttpSystemName (tuple) {
  if (Array.isArray(tuple)) {
    let verb = tuple[0]
    let path = getLambdaName(tuple[1])
    return `${verb}${path}`
  }
  else {
    let path = getLambdaName(tuple)
    return `get${path}`
  }
}

// Get filesystem paths to Lambdae
function getPath (type, tuple) {
  if (type === 'scheduled') {
    return ['src', type, tuple[0]]
  }
  else if (Array.isArray(tuple)) {
    let verb = tuple[0]
    let path = getLambdaName(tuple[1])
    return ['src', type, `${verb}${path}`]
  }
  else {
    return ['src', type, tuple]
  }
}

// Get full event Lambda names
function getEventName (event, app) {
  return [ `${app}-staging-${event}`, `${app}-production-${event}` ]
}

// Get full queue Lambda names
// Yes, it's just a copy of getEventName (for now), but this logic may diverge
function getQueueName (queue, app) {
  return [ `${app}-staging-${queue}`, `${app}-production-${queue}` ]
}

// Get full scheduled Lambda names
function getScheduledName (arr, app) {
  let name = arr.slice(0).shift()
  return [ `${app}-staging-${name}`, `${app}-production-${name}` ]
}

// Get table names
function getTableName (tbl) {
  return Object.keys(tbl)[0]
}

/**
 * The main event
 */
function inventory (arc) {

  if (!arc) {
    arc = readArc().arc
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

  // @http
  if (arc.http && arc.http.length > 0) {
    report.lambdas = arc.http.map(t => getHttpName(t, app)).reduce((a,b)=>a.concat(b))
    report.types.http = arc.http.map(getHttpSystemName)
    report.localPaths = arc.http.map(t => {
      return path.join.apply({}, getPath('http', t))
    })
  }

  // @ws
  if (arc.ws) {
    // Handle 5 vs 6 WS naming changes
    let wsName = name => process.env.DEPRECATED ? `ws-${name}` : name
    let dir = name => path.join('src', 'ws', wsName(name))

    let infras = [ 'staging', 'production' ]
    let routes = [ 'default', 'connect', 'disconnect' ].concat(arc.ws)

    report.types.ws = routes.map(wsName)

    report.localPaths = report.localPaths.concat(routes.map(dir))

    report.websocketapis = infras.map(infra => `${app}-ws-${infra}`)

    infras.forEach(infra => {
      let lambdas = routes.map(route => `${app}-${infra}-ws-${route}`)
      report.lambdas = report.lambdas.concat(lambdas)
    })
  }

  // @events
  if (arc.events && arc.events.length > 0) {
    report.lambdas = report.lambdas.concat(arc.events.map(t => getEventName(t, app)).reduce((a, b) => a.concat(b)))
    report.types.events = arc.events.slice(0)
    arc.events.forEach(e => {
      report.snstopics.push(`${app}-staging-${e}`)
      report.snstopics.push(`${app}-production-${e}`)
    })
    report.localPaths = report.localPaths.concat(arc.events.map(t => {
      return path.join.apply({}, getPath('events', t))
    }))
  }

  // @queues
  if (arc.queues && arc.queues.length > 0) {
    report.lambdas = report.lambdas.concat(arc.queues.map(t => getQueueName(t, app)).reduce((a, b) => a.concat(b)))
    report.types.queues = arc.queues.slice(0)
    arc.queues.forEach(q => {
      report.sqstopics.push(`${app}-staging-${q}`)
      report.sqstopics.push(`${app}-production-${q}`)
    })
    report.localPaths = report.localPaths.concat(arc.queues.map(t => {
      return path.join.apply({}, getPath('queues', t))
    }))
  }

  // @scheduled
  if (arc.scheduled) {
    let scheds = arc.scheduled.map(t => getScheduledName(t, app)).slice(0).reduce((a, b) => a.concat(b))
    report.lambdas = report.lambdas.concat(scheds)
    report.types.scheduled = arc.scheduled.map(s => s[0])
    report.localPaths = report.localPaths.concat(arc.scheduled.map(t => {
      return path.join.apply({}, getPath('scheduled', t))
    }))
    report.cwerules = scheds.slice(0)
  }

  // @tables
  if (arc.tables) {
    arc.tables.forEach(tbl=> {
      let tablename = getTableName(tbl)
      report.tables.push(`${app}-staging-${tablename}`)
      report.tables.push(`${app}-production-${tablename}`)
      let keys = Object.keys(tbl[tablename])
      // Arc <6 mode
      let deprecatedLambdas = keys.filter(k => k === 'insert' || k === 'update' || k === 'destroy')
      // Arc >=6 mode
      let lambdas = keys.filter(k => k === 'stream')
      if (deprecatedLambdas.length) {
        deprecatedLambdas.forEach(q => {
          report.lambdas.push(`${app}-staging-${tablename}-${q}`)
          report.lambdas.push(`${app}-production-${tablename}-${q}`)
          report.types.tables.push(`${tablename}-${q}`)
        })
        report.localPaths = report.localPaths.concat(deprecatedLambdas.map(q => {
          return path.join.apply({}, getPath('tables', `${tablename}-${q}`))
        }))
      }
      else if (lambdas.length) {
        lambdas.forEach(() => {
          report.lambdas.push(`${app}-staging-${tablename}-stream`)
          report.lambdas.push(`${app}-production-${tablename}-stream`)
          report.types.tables.push(`${tablename}-stream`)
        })
        report.localPaths.push(path.join.apply({}, getPath('tables', tablename)))
      }
    })
  }

  // @static
  if (arc.static) {
    report.s3buckets = []
    let staging = arc.static.find(t=> t[0] === 'staging')
    let production = arc.static.find(t=> t[0] === 'production')
    if (staging) report.s3buckets.push(staging[1])
    if (production) report.s3buckets.push(production[1])
  }

  // @views
  if (arc.views && arc.views.length > 0) {
    report.views = arc.views.map(getHttpSystemName)
  }

  // pass off the data
  return report
}

module.exports = inventory
inventory.getHttpName       = getHttpName
inventory.getHttpSystemName = getHttpSystemName
inventory.getPath           = getPath
inventory.getEventName      = getEventName
inventory.getQueueName      = getQueueName
inventory.getScheduledName  = getScheduledName
inventory.getTableName      = getTableName
