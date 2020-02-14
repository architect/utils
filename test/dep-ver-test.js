let test = require('tape')
let package = require('../package.json')

let deps = Object.keys(package.dependencies)
let devDeps = Object.keys(package.devDependencies)
let valid = ver => {
  return !ver.startsWith('~') &&
         !ver.startsWith('^') &&
         !ver.toLowerCase().includes('x') &&
         !ver.includes('*')
}
let ok = dep => `${dep} `.padEnd(25, '.')

test('Primary dependencies must be version locked', t => {
  t.plan(deps.length)
  deps.forEach(dep => {
    let ver = package.dependencies[dep]
    if (valid(ver))
      t.pass(`${ok(dep)} locked to v${ver}`)
    else
      t.fail(`${dep} must be version-locked in package.json: ${ver}`)
  })
})

test('Dev dependencies must be version locked', t => {
  t.plan(devDeps.length)
  devDeps.forEach(dep => {
    let ver = package.devDependencies[dep]
    if (valid(ver))
      t.pass(`${ok(dep)} locked to v${ver}`)
    else
      t.fail(`${dep} must be version-locked in package.json: ${ver}`)
  })
})
