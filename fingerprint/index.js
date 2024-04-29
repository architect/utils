let { existsSync } = require('fs')
let fs = require('fs') // Broken out for testing writeFile calls
let { globSync } = require('glob')
let { basename, dirname, extname, join, sep } = require('path')
let series = require('run-series')
let sha = require('sha')
let sort = require('path-sort')
let waterfall = require('run-waterfall')
let pathToUnix = require('../path-to-unix')
let updater = require('../updater')

/**
 * Static asset fingerprinter
 * - Note: everything uses and assumes *nix-styile file paths, even when running on Windows
 */
module.exports = function fingerprint (params, callback) {
  let { fingerprint = false, ignore, inventory, update } = params
  let { inv, get } = inventory

  // Bail early if this project doesn't utilize static assets
  if (!inv.static) return callback()

  // Get the folder
  let staticFolder = get.static('folder') || '' // Should never be falsy but jic
  let folder = pathToUnix(join(inv._project.cwd, staticFolder))
  let staticJson = join(folder, 'static.json')

  if (!update) update = updater('Assets')

  fingerprint = fingerprint || inv.static.fingerprint
  ignore = ignore?.length ? ignore : inv.static.ignore || []

  // Allow apps and frameworks to handle their own fingerprinting
  let externalFingerprint = fingerprint === 'external'

  // Bail early if fingerprinting is disabled, it's set to external, or the static folder isn't present
  if (!fingerprint || externalFingerprint || !existsSync(folder)) {
    // Clean up if necessary
    if (existsSync(staticJson)) {
      let filename = join(folder, 'static.json')
      let msg = `Found ${filename} file with fingerprinting ${externalFingerprint ? 'set to external' : 'disabled'}, deleting file`
      update.warn(msg)
      try {
        fs.rmSync(staticJson, { force: true })
      }
      catch {
        let msg = `Error removing ${filename} file, please remove it manually or static asset calls may be broken`
        update.warn(msg)
      }
    }
    return callback()
  }

  let files
  let staticManifest = {}
  waterfall([
    /**
     * Scan for files in the public directory
     */
    function globFiles (callback) {
      let staticAssets = pathToUnix(folder + '/**/*')
      try {
        let filesFound = globSync(staticAssets, { dot: true, nodir: true, follow: true })
        // Renormalize to Unix, otherwise deployments from Windows will fail in Lambda
        filesFound = filesFound.map(file => pathToUnix(file))
        callback(null, filesFound)
      }
      catch (err) {
        callback(err)
      }
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
    if (err?.message === 'no_files_found') {
      let msg = `No static assets found to fingerprint from ${staticFolder}${sep}`
      update.done(msg)
      callback()
    }
    else if (err?.message === 'cancel') {
      callback()
    }
    else if (err) {
      callback(err)
    }
    else callback(null, staticManifest)
  })
}
