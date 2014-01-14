Redis TokenThrottle
===================

[![NPM](https://nodei.co/npm/tokenthrottle-redis.png)](https://nodei.co/npm/tokenthrottle-redis/)

[![david-dm](https://david-dm.org/brycebaril/node-tokenthrottle-redis.png)](https://david-dm.org/brycebaril/node-tokenthrottle-redis/)
[![david-dm](https://david-dm.org/brycebaril/node-tokenthrottle-redis/dev-status.png)](https://david-dm.org/brycebaril/node-tokenthrottle-redis#info=devDependencies/)

A Redis-backed implementation of [tokenthrottle](http://npm.im/tokenthrottle)

Simply wraps [tokenthrottle](http://npm.im/tokenthrottle) with a Redis back-end, so you can use it across multiple servers/processes.

```javascript
// Create a redis client
var redisClient = require("redis").createClient()

// Create a throttle with 100 access limit per second.
var throttle = require("tokenthrottle-redis")({rate: 100, expiry: 86400}, redisClient)

// in some_function that you want to rate limit
  throttle.rateLimit(id, function (err, limited) {
    /* ... handle err ... */
    if (limited) {
      return res.next(new Error("Rate limit exceeded, please slow down."));
    }
    else {
      /* ... do work ... */
    }
  })

```

Options
=======

Accepts all of the same options as [tokenthrottle](http://npm.im/tokenthrottle), plus two extra:

* expiry: {Number} Number of seconds after which untouched tokens will be expired, to save memory in Redis. (defaults to no expiry)
* prefix: {String} An optional string to prefix throttle keys with in redis, default is "redisThrottle"

License
=======

(The MIT License)

Copyright (c) Bryce B. Baril <bryce@ravenwall.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
