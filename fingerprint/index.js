let { exec } = require('child_process')
let { existsSync } = require('fs')
let fs = require('fs') // Broken out for testing writeFile calls
let glob = require('glob')
let { basename, dirname, extname, join, sep } = require('path')
let series = require('run-series')
let sha = require('sha')
let sort = require('path-sort')
let waterfall = require('run-waterfall')
let normalizePath = require('../path-to-unix')
let updater = require('../updater')

/**
 * Static asset fingerprinter
 * - Note: everything uses and assumes *nix-styile file paths, even when running on Windows
 */
module.exports = function fingerprint (params, callback) {
  let { fingerprint = false, ignore = [], inventory, update } = params
  let { inv, get } = inventory

  // Bail early if this project doesn't utilize static assets
  if (!inv.static) return callback()

  // Get the folder
  let staticFolder = get.static('folder') || '' // Should never be falsy but jic
  let folder = normalizePath(join(process.cwd(), staticFolder))

  // Bail early if the folder isn't present
  if (!existsSync(folder)) return callback()

  // Ok, we've cleared the pre-reqs, let's go
  if (!update) update = updater('Assets')

  fingerprint = fingerprint || inv.static.fingerprint
  ignore = ignore.length ? ignore : inv.static.ignore || []

  // Allow apps and frameworks to handle their own fingerprinting
  let externalFingerprint = fingerprint === 'external'

  let files
  let staticManifest = {}
  waterfall([
    /**
     * Early exit if disabled, clean up if necessary
     */
    function bail (callback) {
      if (fingerprint && !externalFingerprint) callback()
      else {
        if (existsSync(join(folder, 'static.json'))) {
          let msg = `Found ${folder + sep}static.json file with fingerprinting ${externalFingerprint ? 'set to external' : 'disabled'}, deleting file`
          update.warn(msg)

          let remove = process.platform.startsWith('win') ? 'del' : 'rm'
          exec(`${remove} static.json`, { cwd: folder }, (err, stdout, stderr) => {
            if (err) callback(err)
            else {
              if (stderr) {
                let msg = `Error removing static.json file, please remove it manually or static asset calls may be broken`
                update.warn(msg)
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
    function globFiles (callback) {
      let staticAssets = folder + '/**/*'
      glob(staticAssets, { dot: true, nodir: true, follow: true }, callback)
    },

    /**
     * Filter based on default and user-specified ignore rules
     */
    function filterFiles (filesFound, callback) {
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
    function writeStaticManifest (callback) {
      // Hash those files
      let hashFiles = files.map(file => {
        return (callback) => {
          sha.get(file, function done (err, hash) {
            if (err) callback(err)
            else {
              hash = hash.substr(0, 10)
              let ext = extname(file)
              let base = basename(file)
              let hashed = base.replace(ext, '') + `-${hash}${ext}`
              // Handle any nested dirs
              let dir = dirname(file).replace(folder, '').substr(1)
              dir = `${dir ? dir + '/' : ''}`
              // Final key + value
              let staticKey = `${dir ? dir : ''}${base}`
              let staticValue = `${dir ? dir : ''}${hashed}`
              // Target shape: {'foo/bar.jpg': 'foo/bar-6bf1794b4c.jpg'}
              staticManifest[staticKey] = staticValue
              callback()
            }
          })
        }
      })
      series(hashFiles, function done (err) {
        if (err) callback(err)
        else {
          // Write out folder/static.json
          let file = join(folder, 'static.json')
          let data = JSON.stringify(staticManifest, null, 2)
          fs.writeFile(file, data, callback)
        }
      })
    },
  ],
  function done (err) {
    if (err && err.message === 'no_files_found') {
      let msg = `No static assets found to fingerprint from ${staticFolder}${sep}`
      update.done(msg)
      callback()
    }
    else if (err && err.message === 'cancel') {
      callback()
    }
    else if (err) {
      callback(err, staticManifest)
    }
    else callback(null, staticManifest)
  })
}
