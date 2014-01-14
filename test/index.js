var test = require("tape").test

var redis = require("redis")

var redisThrottle
var Throttle = require("tokenthrottle")


test("load", function (t) {
  t.plan(1)

  redisThrottle = require("../")
  t.ok(redisThrottle, "loaded module")
})

test("creates tokenthrottle", function (t) {
  t.plan(2)

  var redisClient = redis.createClient()

  var throttle = redisThrottle({rate: 100}, redisClient)
  t.ok(throttle instanceof Throttle, "got a TokenThrottle")
  redisClient.quit(function () {
    t.ok(1, "redisClient exited")
  })
})

test("throttle", function (t) {
  t.plan(11)

  var redisClient = redis.createClient()

  var throttle = redisThrottle({rate: 3, expiry: 6000}, redisClient)

  var i = 0
  while (i++ < 3) {
    // even setImmediate is too fast here.
    setTimeout(function () {
      throttle.rateLimit("test", function (err, limited) {
        t.notOk(err, "No error")
        t.notOk(limited, "Not throttled yet")
      })
    }, i * 10)
  }
  setTimeout(function () {
    throttle.rateLimit("test", function (err, limited) {
      t.notOk(err, "No error")
      t.ok(limited, "Should now be throttled.")
    })
  }, 50)
  setTimeout(function () {
    throttle.rateLimit("test", function (err, limited) {
      t.notOk(err, "No error")
      t.notOk(limited, "Throttle should be lifted.")
      redisClient.quit(function () {
        t.ok(1, "redis client exited")
      })
    })
  }, 400)
})

test("expires & values set in redis", function (t) {
  t.plan(7)

  var redisClient = redis.createClient()

  var throttle = redisThrottle({rate: 3, expiry: 1}, redisClient)

  throttle.rateLimit("foo", function (err, limited) {
    t.notOk(err, "No error")
    t.notOk(limited, "Not throttled")
    redisClient.hget("redisThrottle~foo", "time", function (err, value) {
      t.notOk(err, "No error")
      t.ok(value, "stuff is set in the redis throttle")
    })
    setTimeout(function () {
      redisClient.hget("redisThrottle~foo", "time", function (err, value) {
        t.notOk(err, "No error")
        t.notOk(value, "throttle entry is expired")
        redisClient.quit(function () {
          t.ok(1, "redis client exited")
        })
      })
    }, 1100)
  })
})

test("throttle multi-client", function (t) {
  t.plan(16)

  var redisClient = redis.createClient()
  var redisClient2 = redis.createClient()

  var throttle = redisThrottle({rate: 3, expiry: 10}, redisClient)
  var throttle2 = redisThrottle({rate: 3, expiry: 10}, redisClient2)

  throttle.rateLimit("multiclient", function (err, limited) {
    t.notOk(err, "No error")
    t.notOk(limited, "Not throttled yet")
  })
  setTimeout(function () {
    throttle2.rateLimit("multiclient", function (err, limited) {
      t.notOk(err, "No error")
      t.notOk(limited, "Not throttled yet")
    })
  }, 10)
  setTimeout(function () {
    throttle.rateLimit("multiclient", function (err, limited) {
      t.notOk(err, "No error")
      t.notOk(limited, "Not throttled yet")
    })
  }, 20)

  setTimeout(function () {
    throttle.rateLimit("multiclient", function (err, limited) {
      t.notOk(err, "No error")
      t.ok(limited, "Should now be throttled.")
    })
    throttle2.rateLimit("multiclient", function (err, limited) {
      t.notOk(err, "No error")
      t.ok(limited, "Should now be throttled from here as well.")
    })
  }, 50)
  setTimeout(function () {
    throttle.rateLimit("multiclient", function (err, limited) {
      t.notOk(err, "No error")
      t.notOk(limited, "Throttle should be lifted.")
    })
    throttle2.rateLimit("multiclient", function (err, limited) {
      t.notOk(err, "No error")
      t.notOk(limited, "Throttle should be lifted here as well.")
      redisClient.quit(function () {
        t.ok(1, "redis client exited")
      })
      redisClient2.quit(function () {
        t.ok(1, "second redis client quit")
      })
    })
  }, 400)
})

test("Override", function (t) {
  t.plan(9)
  var redisClient = redis.createClient()

  var throttle = redisThrottle({
    rate: 3,
    burst: 3,
    overrides: {
      test: {rate: 0, burst: 0}
    }
  }, redisClient)
  var i = 0
  while (i++ < 3) {
    // This is so much cleaner with setImmediate... *sigh 0.8.x*
    setTimeout(function () {
      throttle.rateLimit("test", function (err, limited) {
        t.notOk(err)
        t.notOk(limited, "Not throttled yet")
      })
    }, i * 10)
  }
  setTimeout(function () {
    throttle.rateLimit("test", function (err, limited) {
      t.notOk(err)
      t.notOk(limited, "This one never gets throttled.")
      redisClient.quit(function () {
        t.ok(1, "redis client exited")
      })
    })
  }, 50)
})