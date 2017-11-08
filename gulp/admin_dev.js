'use strict'
/**

gulp deva  启动admin开发网站 http://localhost:9001

*/

const gulp = require('gulp');
const util = require('./util');
const mainBowerFiles = require('main-bower-files');
const watch = require('gulp-watch');

const admin_web_port = 9001;
const admin_res = './web/admin-new/res';

gulp.task('admin-connect', function () { //配置代理
  util.proxy(admin_res, admin_web_port);
});

gulp.task('admin-reload', function () { //监听变化
  return util.reload(admin_res);
});

gulp.task('admin-inject-vender', function () {
  return util.inject(admin_res + '/*.html', mainBowerFiles({
    paths: admin_res
  }), 'bower', admin_res);
});

gulp.task('admin-inject-app', function () {
  return util.inject(admin_res + '/*.html', [admin_res + '/app/**/*.module.js',
    admin_res + '/app/**/*.js',
    admin_res + '/app/**/*.css',
    '!' + admin_res + '/app/**/templates.js'
  ], 'app', admin_res);
});

gulp.task('admin-inject', ['admin-inject-vender', 'admin-inject-app']);

gulp.task('admin-watch', function () {
  watch(mainBowerFiles({
    paths: admin_res
  }), {
    events: ['add', 'unlink']
  }, function () {
    gulp.start('admin-inject-vender');
  });

  watch([admin_res + '/app/**/*.module.js',
    admin_res + '/app/**/*.js',
    admin_res + '/app/**/*.css',
    '!' + admin_res + '/app/**/templates.js'
  ], {
    events: ['add', 'unlink']
  }, function () {
    gulp.start('admin-inject-app');
  });
})

gulp.task('deva', ['admin-connect', 'admin-reload', 'admin-watch']);
