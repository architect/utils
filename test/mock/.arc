@app
testapp

@static
@http
get /
get /foo/:bar
post /baz

@queues
pong

@events
ping

@scheduled
jump rate(1 hour)

@tables
cats
  catID *String
