var cache = require('lib/common/cache');
var moment = require('moment');
var ApiUtil = require('lib/common/api_util');

var SEPARATOR = '^_^@T_T';

var makePerDayLimiter = function (identityName, identityFn) {
  return function (name, limitCount) {
    return function (req, res, next) {
      var identity = identityFn(req);
      var YYYYMMDD = moment().format('YYYYMMDD');
      var key = YYYYMMDD + SEPARATOR + identityName + SEPARATOR + name +
        SEPARATOR + identity;

      cache.get(key, function (err, count) {
        if (err) {
          return next(err);
        }
        count = count || 0;
        if (count < limitCount) {
          count += 1;
          cache.set(key, count, 60 * 60 * 24);
          res.set('X-RateLimit-Limit', limitCount);
          res.set('X-RateLimit-Remaining', limitCount - count);
          next();
        } else {
          res.sendErrMsg('ratelimit forbidden. limit is ' +
            limitCount + ' per day.');
        }
      });
    };
  };
};

var perDayDo = function (identityName) {
  return function (name, identity, limitCount, callback, next) {
    var YYYYMMDD = moment().format('YYYYMMDD');
    var key = YYYYMMDD + SEPARATOR + identityName + SEPARATOR + name +
      SEPARATOR + identity;

    cache.get(key, function (err, count) {
      if (err) {
        return next(err);
      }
      count = count || 0;
      if (count < limitCount) {
        count += 1;
        cache.set(key, count, 60 * 60 * 24);
        callback();
      } else {
        //do nothing
      }
    });
  };
};

exports.peruserperday = makePerDayLimiter('peruserperday', function (req) {
  return ApiUtil.getUserid(req);
});

exports.peripperday = makePerDayLimiter('peripperday', function (req) {
  return req.ip;
});

exports.peruserplanperday = makePerDayLimiter('peruserplanperday', function (req) {
  return ApiUtil.getUserid(req) + req.body.planid;
});

exports.perwhatperdaydo = perDayDo('perwhatperdaydo');
