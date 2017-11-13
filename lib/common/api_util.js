'use strict'

const tools = require('./tools');
const _ = require('lodash');

exports.getUserid = function (req) {
  if (req.session) {
    return req.session.userid;
  }
}

exports.getUsertype = function (req) {
  if (req.session) {
    return req.session.usertype;
  }
}
