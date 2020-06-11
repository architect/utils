let chalk = require('chalk')
let config = require('./config')
let exec = require('child_process').exec
let fs = require('fs')
let glob = require('glob')
let path = require('path')
let { readArc } = require('@architect/parser')
let series = require('run-series')
let sha = require('sha')
let sort = require('path-sort')
let waterfall = require('run-waterfall')
let normalizePath = require('../path-to-unix')

module.exports = function fingerprint({ fingerprint=false, ignore=[] }, callback) {
  let { arc } = readArc()
  let quiet = process.env.ARC_QUIET || process.env.QUIET
  let folderSetting = tuple => tuple[0] === 'folder'
  let staticFolder = arc.static && arc.static.some(folderSetting) ? arc.static.find(folderSetting)[1] : 'public'
  let folder = normalizePath(path.join(process.cwd(), staticFolder))

  /**
   * Double check fingerprint status
   */
  if (!fingerprint && arc.static) {
    fingerprint = config(arc).fingerprint
    ignore = config(arc).ignore
    // If @static is defined, create `public/` if it doesn't exist
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true })
    }
  }
  // Allow apps and frameworks to handle their own fingerprinting
  let externalFingerprint = fingerprint === 'external'

  let staticAssets = path.join(folder, '/**/*')
  let files
  let staticManifest = {}
  waterfall([
    /**
     * Early exit if disabled, clean up if necessary
     */
    function bail(callback) {
      if (fingerprint && !externalFingerprint) callback()
      else {
        if (fs.existsSync(path.join(folder, 'static.json'))) {
          let warn = chalk.yellow('Warning')
          if (!quiet) {
            let msg = chalk.white(`Found ${folder + path.sep}static.json file with fingerprinting ${externalFingerprint ? 'set to external' : 'disabled'}, deleting file`)
            console.log(`${warn} ${msg}`)
          }
          exec('rm static.json', {cwd: folder}, (err, stdout, stderr) => {
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
              let extName = path.extname(file)
              let baseName = path.basename(file)
              let hashedName = baseName.replace(extName, '') + `-${hash}${extName}`
              // Handle any nested dirs
              let dirName = path.dirname(file).replace(folder, '').substr(1)
              let dir = `${dirName ? dirName + '/': ''}`
              // Final key + value
              let staticKey = `${dir ? dir : ''}${baseName}`
              let staticValue = `${dir ? dir : ''}${hashedName}`
              // Target shape: {'foo/bar.jpg': 'foo/bar-6bf1794b4c.jpg'}
              staticManifest[staticKey] = staticValue
              callback()
            }
          })
        }
      })
      series(hashFiles, function done(err) {
        if (err) callback(err)
        else {
          // Write out folder/static.json
          let file = path.join(folder, 'static.json')
          let data = JSON.stringify(staticManifest, null, 2)
          fs.writeFile(file, data, callback)
        }
      })
    },
  ],
  function done(err) {
    if (err && err.message === 'no_files_found') {
      if (!quiet) {
        let msg = chalk.gray('No static assets found to fingerprint from public' + path.sep)
        console.log(msg)
      }
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

module.exports.config = config
