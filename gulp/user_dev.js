'use strict'
/**

gulp devu  启动pc开发网站 http://localhost:9000

*/

const gulp = require('gulp');
const util = require('./util');

const user_web_port = 9000;
const user_web_root = './web/user/res';
const user_ejs_root = './web/user/template';

gulp.task('user-connect', function () { //配置代理
  util.proxy(user_web_root, user_web_port);
});

gulp.task('user-reload', function () { //监听变化
  return util.reload(user_web_root);
});

gulp.task('user-ejs-sftp', function () {
  return util.ejsFtp(user_ejs_root);
});

gulp.task('devu', ['user-connect', 'user-reload', 'user-ejs-sftp']);
