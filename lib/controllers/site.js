var ApiUtil = require('lib/common/api_util');
var type = require('lib/type/type');
var eventproxy = require('eventproxy');
var fs = require('fs');

exports.homePage = function (req, res) {
  var usertype = ApiUtil.getUsertype(req);

  if (usertype === type.role_user) {
    res.redirect('/tpl/user/owner.html');
  } else if (usertype === type.role_designer) {
    res.redirect('/tpl/user/design.html');
  }
}

var apkDir = global.PROJECT_ROOT + '/web/user/res/user_build';
var designerApkDir = global.PROJECT_ROOT + '/web/user/res/designer_build';

exports.download_user_app = function (req, res, next) {
  var ep = eventproxy();
  ep.fail(next);

  var agent = req.get('user-agent');
  if (agent.search(/iphone/i) > -1) {
    res.redirect('http://www.jianfanjia.com');
  } else {
    res.redirect('http://t.cn/R4Lbu25');
  }
}

exports.download_user_apk = function (req, res, next) {
  var ep = eventproxy();
  ep.fail(next);

  fs.readdir(apkDir, ep.done(function (apks) {
    apks.sort();
    var apk = apks.pop();
    if (apk) {
      var arr = apk.split('_');
      if (arr.length !== 5) {
        res.sendErrMsg('bad apk');
      } else {
        var download_url = 'http://' + req.headers.host +
          '/user_build/' + apk;
        res.redirect(download_url);
      }
    } else {
      res.sendErrMsg('no apk');
    }
  }));
}

exports.download_designer_apk = function (req, res, next) {
  var ep = eventproxy();
  ep.fail(next);

  fs.readdir(designerApkDir, ep.done(function (apks) {
    apks.sort();
    var apk = apks.pop();
    if (apk) {
      var arr = apk.split('_');
      if (arr.length !== 5) {
        res.sendErrMsg('bad apk');
      } else {
        var download_url = 'http://' + req.headers.host +
          '/designer_build/' + apk;
        res.redirect(download_url);
      }
    } else {
      res.sendErrMsg('no apk');
    }
  }));
}

//简繁家backup url http://t.cn/R4Lbu25 http://fusion.qq.com/app_download?appid=1104973048&platform=qzone&via=QZ.MOBILEDETAIL.QRCODE&u=3046917960
//简繁家设计师backup url http://t.cn/R4b6MZH http://fusion.qq.com/app_download?appid=1104958443&platform=qzone&via=QZ.MOBILEDETAIL.QRCODE&u=3046917960
