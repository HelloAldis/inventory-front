'use strict'

//load configuration
const config = require('lib/config/apiconfig');

const express = require('express');
const path = require('path');
const compression = require('compression');
const timeout = require('connect-timeout');
const req_res_log = require('lib/middlewares/req_res_log');
const api_router_app_v2 = require('lib/router/api_router_app_v2');
const api_router_web_v2 = require('lib/router/api_router_web_v2');
const responseUtil = require('lib/middlewares/response_util');
const platform_check = require('lib/middlewares/platform_check');
// const RedisStore = require('connect-redis')(session);
const bodyParser = require('body-parser');
const cors = require('cors');
const logger = require('lib/common/logger');
const helmet = require('helmet');
const api_statistic = require('lib/middlewares/api_statistic');
const mobile_mark = require('lib/middlewares/mobile_mark');
const web_router_mobile = require('lib/router/web_router_mobile');

//config the web app
const app = express();
// configuration in all env
app.enable('trust proxy');

//config view engine
app.set('views', path.join(__dirname, 'web/mobile-new/template'));
app.set('view engine', 'ejs');
app.engine('ejs', require('ejs').__express);
app.set('view cache', !config.debug);

app.use(compression());
// 通用的中间件
app.use(require('response-time')());
app.use(timeout('60s'));
app.use(helmet.frameguard('sameorigin')); // 防止 clickjacking attacks
app.use(helmet.hidePoweredBy({
  setTo: 'By Aldis'
})); //伪造poweredby
app.use(helmet.xssFilter());
app.use(bodyParser.json({
  limit: '1mb'
}));
app.use(bodyParser.urlencoded({
  extended: true,
  limit: '1mb'
}));
app.use(bodyParser.raw({
  limit: '3mb',
  type: 'image/jpeg'
}));

// 静态资源
app.use('/', express.static(path.join(__dirname, 'web/mobile-new/res')));

// routes
app.use('/api/v2', function (req, res, next) {
  if (!(req.body instanceof Buffer)) {
    logger.debug(req.body);
  }

  next();
});

app.use('/', mobile_mark);
//api response util middleware
app.use('/api', responseUtil);
//API Request logger
app.use('/api', req_res_log);
app.use('/api/v2/app', cors(), platform_check, api_statistic.api_statistic, api_router_app_v2);
app.use('/api/v2/web', cors(), platform_check, api_statistic.api_statistic, api_router_web_v2);
app.use('/', web_router_mobile);

// error handler
app.use(function (err, req, res, next) {
  logger.error('server 500 error: %s, %s', err.stack, err.errors);
  if (config.debug) {
    return res.status(500).send({
      stack: err.stack,
      errors: err.errors
    });
  } else {
    return res.status(500).send('500 status');
  }
});

app.get('*', function (req, res) {
  res.status(404);
  if (req.path === '/404.html') {
    res.end();
  } else {
    res.redirect('/404.html');
    logger.info('url not found :' + req.originalUrl);
  }
});

module.exports = app;
