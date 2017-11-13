'use strict'

const eventproxy = require('eventproxy');
const _ = require('lodash');
const async = require('async');
const utility = require('utility');
const validator = require('validator');

const tools = require('lib/common/tools');
const ue_config = require('lib/config/ue_config');
const ApiUtil = require('lib/common/api_util');
const type = require('lib/type/type');

exports.login = function (req, res) {
  if (req.body.username === 'sunny' && req.body.pass === '!@Jyz20150608#$') {
    req.session.userid = 'Admin';
    req.session.usertype = type.role_admin;
    res.cookie('username', 'Admin'); //cookie 有效期1天
    res.cookie('usertype', type.role_admin);

    res.sendSuccessMsg();
  } else {
    res.sendErrMsg('ooooooOps');
  }
}
