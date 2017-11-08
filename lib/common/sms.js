var http = require('http');
var querystring = require('querystring');
var config = require('lib/config/apiconfig');
var DateUtil = require('./date_util');
var utility = require('utility');
var logger = require('./logger');

exports.sendWeiMi = function (phone, cid, p1) {
  logger.info('weimi send to phone = ' + phone);
  if (!config.send_sms) {
    return;
  }

  var postData = {
    uid: config.sms_uid,
    pas: config.sms_pas,
    mob: phone,
    cid: cid,
    type: 'json',
    p1: p1
  };
  var content = querystring.stringify(postData);

  var options = {
    host: 'api.weimi.cc',
    path: '/2/sms/send.html',
    method: 'POST',
    agent: false,
    rejectUnauthorized: false,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': content.length
    }
  };

  var req = http.request(options, function (res) {
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      logger.info(JSON.parse(chunk));
    });
    res.on('end', function () {
      logger.info('over');
    });
  });
  req.write(content);
  req.end();
}

exports.sendVerifyCode = function (phone, code) {
  exports.sendWeiMi(phone, 'd4OXVcW1Py8A', code);
}

exports.sendYuyue = function (phone) {
  exports.sendWeiMi(phone, 'FIgUFcBhel9I');
}

function yzx(phone, templateId, paramArray) {
  logger.info('yzx send to phone = ' + phone);
  if (!config.send_sms) {
    return;
  }

  var param = paramArray.join(',');
  var time = DateUtil.YYYYMMDDHHmmssSSS();
  var sign = utility.md5(config.yzx_sid + time + config.yzx_token);
  var postData = {
    sid: config.yzx_sid,
    appId: config.yzx_appid,
    sign: sign,
    time: time,
    templateId: templateId,
    to: phone,
    param: param
  };

  var content = querystring.stringify(postData);
  var options = {
    hostname: 'www.ucpaas.com',
    path: '/maap/sms/code?' + content,
    method: 'GET'
  };

  var req = http.request(options, function (res) {
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      logger.info(JSON.parse(chunk));
    });
  });
  req.end();
}

exports.sendYzxAuthSuccess = function (phone, paramArray) {
  yzx(phone, '12836', paramArray);
}

exports.sendYzxRequirementSuccess = function (phone, paramArray) {
  yzx(phone, '12837', paramArray);
}

exports.sendUserOrderDesigner = function (phone, paramArray) {
  yzx(phone, '14448', paramArray);
}

exports.sendDesignerRespondUser = function (phone, paramArray) {
  yzx(phone, '12838', paramArray);
}

exports.sendRemimdDesignerPlan = function (phone, paramArray) {
  yzx(phone, '14444', paramArray);
}

exports.sendDesignerPlanUploaded = function (phone, paramArray) {
  yzx(phone, '12840', paramArray);
}

exports.sendDesignerPlanFinaled = function (phone, paramArray) {
  yzx(phone, '12841', paramArray);
}

exports.sendDesignerPlanNotFinaled = function (phone, paramArray) {
  yzx(phone, '12842', paramArray);
}

exports.sendAdminAddUser = function (phone, paramArray) {
  yzx(phone, '26808', paramArray);
}

exports.sendQuotation = function (phone, paramArray) {
  yzx(phone, '28429', paramArray);
}
