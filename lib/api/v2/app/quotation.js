'use strict';

const eventproxy = require('eventproxy');
const type = require('lib/type/type');
const Quotation = require('lib/proxy').Quotation;
const User = require('lib/proxy').User;
const ApiUtil = require('lib/common/api_util');
const tools = require('lib/common/tools');
const sms = require('lib/common/sms');
const config = require('lib/config/apiconfig');
const async = require('async');
const verify_code_business = require('lib/business/verify_code_business');

exports.generate_quotation = function (req, res, next) {
  const userid = ApiUtil.getUserid(req);
  const usertype = ApiUtil.getUsertype(req);

  if (usertype === type.role_designer) {
    return res.sendErrMsg('只有业主才可以提交哦');
  }
  const quotation = ApiUtil.buildQuotation(req);
  const phone = req.body.phone.trim();
  const code = req.body.code.trim();
  const ep = eventproxy();
  ep.fail(next);

  verify_code_business.verify_code(phone, code, true, function (errMsg) {
    if (errMsg) {
      return res.sendErrMsg(errMsg);
    }

    verify_code_business.verify_phone(phone, ep.done(function (user) {
      if (user) {
        quotation.userid = user._id;
        ep.emit('final', quotation);
      } else {
        tools.bhash('jianfanjia', ep.done(function (passhash) {
          user = {};
          user.phone = phone;
          user.pass = passhash;
          user.username = '用户' + phone.slice(-4);
          user.platform_type = req.platform_type;

          User.newAndSave(user, ep.done(function (user_indb) {
            sms.sendAdminAddUser(phone, [user.username, '帐号：' + phone + '，密码：jianfanjia']);
            quotation.userid = user_indb._id;
            ep.emit('final', quotation);
          }));
        }));
      }
    }));
  });

  ep.on('final', function (quotation) {
    Quotation.newAndSave(quotation, ep.done(function (quotation_indb) {
      res.sendData(quotation_indb._id);
    }));
  });
}
