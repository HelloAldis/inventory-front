'use strict';

const gulp = require('gulp');
const gutil = require('gulp-util');
const rename = require('gulp-rename');

function cpConfig(src) {
  return function () {
    var path = 'lib/config/' + src;
    var dest = 'lib/config/';
    var name = 'apiconfig.js';
    gutil.log('cp ' + path + ' to ' + dest + name);
    gulp.src(path).pipe(rename(name)).pipe(gulp.dest(dest));
  }
}
gulp.task('cp-config-product', cpConfig('apiconfig.pro.js'));
gulp.task('cp-config-test', cpConfig('apiconfig.test.js'));

gulp.task('build', ['admin-build']);

gulp.task('product', ['build', 'cp-config-product']);
gulp.task('qatest', ['build', 'cp-config-test']);
