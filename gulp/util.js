'use strict';

const connect = require('gulp-connect');
const url = require('url');
const proxy = require('proxy-middleware');
const gulp = require('gulp');
const watch = require('gulp-watch');
const sftp = require('gulp-sftp');
const inject = require('gulp-inject');
const gutil = require('gulp-util');

exports.proxy = function (root, port) {
  connect.server({
    root: root,
    host: 'localhost',
    port: port,
    livereload: true,
    middleware: function () {
      return [
        ['/api', (function () {
          var options = url.parse('http://dev.jianfanjia.com/api');
          options.cookieRewrite = 'dev.jianfanjia.com';
          return proxy(options);
        })()]
      ];
    }
  });
}

exports.reload = function (root) {
  const html = root + '/**/*.html';
  const css = root + '/**/*.css';
  const js = root + '/**/*.js';

  return gulp.src([html, css, js])
    .pipe(watch([html, css, js]))
    .pipe(connect.reload());
}

exports.ejsFtp = function (ejsRoot) {
  const ejs = ejsRoot + '/**/*.ejs';

  return gulp.src([ejs])
    .pipe(watch([ejs]))
    .pipe(sftp({
      host: '101.200.191.159',
      user: 'root',
      pass: 'JfJ2015+|0608~',
      remotePath: '/xvdb/jianfanjia-server/' + ejsRoot
    }));
}

exports.inject = function (html, injectFiles, tag, output) {
  return gulp.src(html)
    .pipe(inject(gulp.src(injectFiles, {
      read: false
    }), {
      name: tag,
      relative: 'true'
    }))
    .pipe(gulp.dest(output));
}

exports.errorHandler = function (title) {
  return function (err) {
    gutil.log(gutil.colors.red('[' + title + ']'), err.toString());
    this.emit('end');
  };
};
