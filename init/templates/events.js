let nodejs = `// learn more about http functions here: https://arc.codes/guides/background-tasks 
exports.handler = async function subscribe(payload) {
  console.log(JSON.stringify(payload, null, 2))
  return
}`

let ruby = `// learn more about http functions here: https://arc.codes/guides/background-tasks
def handler(event)
  puts event
  true
end`

let python = `// learn more about http functions here: https://arc.codes/guides/background-tasks
def handler(event, context):
  print(event)
  print(context)
  return True`

module.exports = {nodejs, ruby, python}


