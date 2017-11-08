'use strict'

const eventproxy = require('eventproxy');
const fs = require('fs');

const apkDir = global.PROJECT_ROOT + '/web/user/res/user_build';
const designerApkDir = global.PROJECT_ROOT + '/web/user/res/designer_build';
const supervisorApkDir = global.PROJECT_ROOT + '/web/user/res/supervisor_build';

exports.android_build_version = function (req, res, next) {
  let ep = eventproxy();
  ep.fail(next);

  fs.readdir(apkDir, ep.done(function (apks) {
    apks.sort();
    let apk = apks.pop();
    if (apk) {
      let arr = apk.split('_');
      if (arr.length === 5) {
        let version_name = arr[4].replace(/.apk/g, '');
        res.sendData({
          version_name: version_name,
          version_code: arr[3],
          updatetype: arr[2],
          download_url: 'http://' + req.headers.host +
            '/user_build/' + apk
        });
      } else {
        res.sendErrMsg('bad apk');
      }
    } else {
      res.sendErrMsg('no apk');
    }
  }));
}

//jianfanjia_20151117_0_9999_1.0.99.apk

exports.designer_android_build_version = function (req, res, next) {
  let ep = eventproxy();
  ep.fail(next);

  fs.readdir(designerApkDir, ep.done(function (apks) {
    apks.sort();
    let apk = apks.pop();
    if (apk) {
      let arr = apk.split('_');

      if (arr.length === 5) {
        let version_name = arr[4].replace(/.apk/g, '');
        res.sendData({
          version_name: version_name,
          version_code: arr[3],
          updatetype: arr[2],
          download_url: 'http://' + req.headers.host +
            '/designer_build/' + apk
        });
      } else {
        res.sendErrMsg('bad apk');
      }
    } else {
      res.sendErrMsg('no apk');
    }
  }));
}

exports.supervisor_android_build_version = function (req, res, next) {
  let ep = eventproxy();
  ep.fail(next);

  fs.readdir(supervisorApkDir, ep.done(function (apks) {
    apks.sort();
    let apk = apks.pop();
    if (apk) {
      let arr = apk.split('_');

      if (arr.length === 5) {
        let version_name = arr[4].replace(/.apk/g, '');
        res.sendData({
          version_name: version_name,
          version_code: arr[3],
          updatetype: arr[2],
          download_url: 'http://' + req.headers.host +
            '/supervisor_build/' + apk
        });
      } else {
        res.sendErrMsg('bad apk');
      }
    } else {
      res.sendErrMsg('no apk');
    }
  }));
}
