let chalk = require('chalk')
let exec = require('child_process').exec
let fs = require('fs')
let glob = require('glob')
let mkdir = require('mkdirp').sync
let path = require('path')
let pathExists = fs.existsSync
let readArc = require('./read-arc')
let series = require('run-series')
let sha = require('sha')
let sort = require('path-sort')
let waterfall = require('run-waterfall')

function normalizePath(path) {
  // process.cwd() and path.join uses '\\' as a path delimiter on Windows
  // glob uses '/'
  return path.replace(/\\/g, '/')
}

module.exports = function fingerprint({fingerprint=false, ignore=[]}, callback) {
  let {static} = readArc().arc
  let publicDir = normalizePath(path.join(process.cwd(), 'public'))

  /**
   * Double check fingerprint status
   */
  if (!fingerprint && static) {
    // Maybe enable fingerprint
    if (static.some(s => {
      if (!s[0]) return false
      if (s.includes('fingerprint') && (s.includes(true) || s.includes('enabled') || s.includes('on'))) return true
      return false
    })) {fingerprint = true}

    // Collect any strings to match against for ignore
    let ignore = static.find(s => s['ignore'])
    if (ignore) {ignore = Object.getOwnPropertyNames(ignore.ignore)}
    else {ignore = []}

    // If @static is defined, create `public/` if it doesn't exist
    if (!pathExists(publicDir)) {mkdir(publicDir)}
  }

  let staticAssets = path.join(publicDir, '/**/*')
  let files
  let staticManifest = {}
  waterfall([
    /**
     * Early exit if disabled, clean up if necessary
     */
    function bail(callback) {
      if (fingerprint) callback()
      else {
        if (pathExists(path.join(publicDir, 'static.json'))) {
          let warn = chalk.yellow('Warning')
          let msg = chalk.white(`Found ${publicDir + path.sep}static.json file with fingerprinting disabled, deleting file`)
          console.log(`${warn} ${msg}`)
          exec('rm static.json', {cwd: publicDir}, (err, stdout, stderr) => {
            if (err) callback(err)
            else {
              if (stderr) {
                let msg = chalk.gray(`Error removing static.json file, please remove it manually or static asset calls may be broken`)
                console.log(`${warn} ${msg}`)
              }
              callback(Error('cancel'))
            }
          })
        }
        else callback(Error('cancel'))
      }
    },

    /**
     * Scan for files in the public directory
     */
    function globFiles(callback) {
      glob(staticAssets, {dot:true, nodir:true, follow:true}, callback)
    },

    /**
     * Filter based on default and user-specified ignore rules
     */
    function filterFiles(filesFound, callback) {
      // Always ignore these files
      ignore = ignore.concat([
        '.DS_Store',
        'node_modules',
        'readme.md',
        'static.json', // Ignored here, but uploaded later
      ])

      // Find non-ignored files and sort for readability
      files = filesFound.filter(file => !ignore.some(i => file.includes(i)))
      files = sort(files)

      if (!files.length) {
        callback(Error('no_files_found'))
      }
      else callback()
    },

    /**
     * Write (or remove) fingerprinted static asset manifest
     */
    function writeStaticManifest(callback) {
      // Hash those files
      let hashFiles = files.map(file => {
        return (callback) => {
          sha.get(file, function done(err, hash) {
            if (err) callback(err)
            else {
              hash = hash.substr(0,10)
              let filename = file.split('.')
              // This will do weird stuff on multi-ext files (*.tar.gz) ¯\_(ツ)_/¯
              filename[filename.length - 2] = `${filename[filename.length - 2]}-${hash}`
              // Target shape: {'foo/bar.jpg': 'foo/bar-6bf1794b4c.jpg'}
              staticManifest[file.replace(publicDir, '').substr(1)] = filename.join('.').replace(publicDir, '').substr(1)
              callback()
            }
          })
        }
      })
      series(hashFiles, function done(err) {
        if (err) callback(err)
        else {
          // Write out public/static.json
          fs.writeFile(path.join(publicDir, 'static.json'), JSON.stringify(staticManifest, null, 2), callback)
        }
      })
    },
  ],
  function done(err) {
    if (err && err.message === 'no_files_found') {
      let msg = chalk.gray('No static assets found to fingerprint from public' + path.sep)
      console.log(msg)
      callback()
    }
    if (err && err.message === 'cancel') {
      callback()
    }
    else if (err) {
      callback(err, staticManifest)
    }
    else callback(null, staticManifest)
  })
}
