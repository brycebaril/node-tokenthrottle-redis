module.exports = redisThrottle
module.exports.RedisTable = RedisTable

var Throttle = require("tokenthrottle")
var redis = require("redis")

/**
 * A npm.im/tokenthrottle implementation on top of Redis
 * @param  {Object} options          [REQUIRED] The same options as npm.im/tokenthrottle, plus:
 *                                   - expiry: the number of seconds to expire untouched entires (optional)
 *                                   - prefix: an optional namespace prefix for the key (optional)
 * @param  {RedisClient} redisClient A redis client to use.
 * @return {TokenThrottle}           A token throttle backed by Redis
 */
function redisThrottle(options, redisClient) {
  if (!options) throw new Error("Please supply required options.")
  options.tokensTable = RedisTable(redisClient, options)
  return Throttle(options)
}

/**
 * A Redis TokenTable implementation.
 * @param {RedisClient} redisClient A redis client to use.
 * @param {Options} options RedisTable options
 *                          - expiry: Number of seconds to expire untouched entries (optional)
 *                          - prefix: A string to prefix all token entries with (default 'redisThrottle')
 */
function RedisTable(redisClient, options) {
  if (!(this instanceof RedisTable)) return new RedisTable(redisClient, options)
  this.client = redisClient || redis.createClient()
  options = options || {}
  this.expiry = options.expiry
  this.prefix = options.prefix || "redisThrottle"
}

RedisTable.prototype._key = function (key) {
  return [this.prefix, key].join("~")
}

RedisTable.prototype.get = function (key, cb) {
  var myKey = this._key(key)
  this.client.hgetall(myKey, cb)
  if (this.expiry) this.client.expire(myKey, this.expiry)
}

RedisTable.prototype.put = function (key, value, cb) {
  var myKey = this._key(key)
  this.client.hmset(myKey, value, cb)
  if (this.expiry) this.client.expire(myKey, this.expiry)
}
