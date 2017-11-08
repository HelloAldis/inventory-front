'use strict'
/**

gulp devm  启动移动端开发网站 http://localhost:9002

*/

const gulp = require('gulp');
const util = require('./util');

const mobile_web_port = 9002;
const mobile_web_root = './web/mobile/res';
const mobile_ejs_root = './web/mobile/template';

gulp.task('mobile-connect', function () { //配置代理
  util.proxy(mobile_web_root, mobile_web_port);
});

gulp.task('mobile-reload', function () { //监听变化
  return util.reload(mobile_web_root);
});

gulp.task('mobile-ejs-sftp', function () {
  return util.ejsFtp(mobile_ejs_root);
});

gulp.task('devm', ['mobile-connect', 'mobile-reload', 'mobile-ejs-sftp']);
