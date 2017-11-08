"use strict"

const escapeStringRegexp = require('escape-string-regexp');

exports.reg = function () {
  const escapedString = escapeStringRegexp(arguments[0]);
  arguments[0] = escapedString;
  return RegExp.apply(null, arguments);
}
