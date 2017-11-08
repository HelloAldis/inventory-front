'use strict'

const _ = require('lodash');
const moment = require('moment');

exports.add = function (date, num, f) {
  let ds = num * f;
  ds = _.round(ds);
  if (ds === 0) {
    ds = 1;
  }

  date = date + (1000 * 60 * 60 * 24 * ds);
  return date;
}

moment.locale('zh-cn'); // 使用中文
// 格式化时间
exports.YYYY_MM_DD = function (time) {
  let date = moment(new Date(time));
  return date.format('YYYY-MM-DD');
};

exports.YYYY_MM_DD_HH_mm = function (time) {
  let date = moment(new Date(time));
  return date.format('YYYY-MM-DD HH:mm');
};

exports.YYYYMMDDHHmmssSSS = function () {
  let date = moment(new Date());
  return date.format('YYYYMMDDHHmmssSSS');
}

exports.YYYY_MM_DD_HH_mm_ss_SSS = function (time) {
  let date = undefined;
  if (time) {
    date = new Date(time);
  } else {
    date = new Date();
  }

  return moment(date).format('YYYY-MM-DD HH:mm:ss:SSS');
}
