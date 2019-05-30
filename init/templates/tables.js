let nodejs = `// learn more about table triggers here: https://arc.codes/reference/tables 
exports.handler = async function subscribe(payload) {
  console.log(JSON.stringify(payload, null, 2))
  return
}`

let ruby = `// learn more about table triggers here: https://arc.codes/reference/tables
def handler(event)
  puts event
  true
end`

let python = `// learn more about table triggers here: https://arc.codes/reference/tables
def handler(event, context):
  print(event)
  print(context)
  return True`

module.exports = {nodejs, ruby, python}

