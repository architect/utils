let awsLite = require('@aws-lite/client')
async function main () {
  try {
    let options = { autoloadPlugins: false, region: 'us-west-1' }
    if (process.env._ARC_PROFILE) options.profile = process.env._ARC_PROFILE
    await awsLite(options)
    console.log(JSON.stringify({ ok: true }))
  }
  catch (err) {
    console.log(JSON.stringify({
      error: err.message,
      stack: err.stack,
    }))
  }
}
main()
