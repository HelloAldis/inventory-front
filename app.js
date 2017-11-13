"use strict";

// Add the root project directory to the app module search path:
require('app-module-path').addPath(__dirname);
global.PROJECT_ROOT = __dirname;

//load configuration
const config = require('lib/config/apiconfig');
const express = require('express');
const vhost = require('vhost');
const logger = require('lib/common/logger');

//main App
let main_app = express();
main_app.use(vhost('jianfanjia.com', function (req, res) {
  res.redirect(301, 'http://www.jianfanjia.com' + req.url);
}));
main_app.use(vhost(config.admin_web_domain_regex, require('./app_admin_new')));

main_app.listen(config.port, function () {
  logger.info('Jianfanjia listening on port %s', config.port);
});

module.exports = main_app;
