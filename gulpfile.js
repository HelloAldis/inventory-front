'use strict';

const gulp = require('gulp');
const wrench = require('wrench');
const gutil = require('gulp-util');
/**
 *  This will load all js or coffee files in the gulp directory
 *  in order to load all gulp tasks
 */
wrench.readdirSyncRecursive('./gulp').filter(function (file) {
  return (/\.(js|coffee)$/i).test(file);
}).map(function (file) {
  require('./gulp/' + file);
});

/**
 *  Default task clean temporaries directories and launch the
 *  main optimization build task
 */
gulp.task('default', function () {
  gutil.log('please use command "gulp release [-a|-b|-c]" to release app version');
  gutil.log('please use command "gulp [product|qatest]" to deploy app in server');
  gutil.log('please use command "gulp [deva|devu|devm]" to develop app in proxy mode');
});
