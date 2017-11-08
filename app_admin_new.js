//load configuration
'use strict'
const config = require('lib/config/apiconfig');

const express = require('express');
const path = require('path');
const compression = require('compression');
const session = require('express-session');
const timeout = require('connect-timeout');
// const passport = require('passport');
const req_res_log = require('lib/middlewares/req_res_log');
const api_router_web_v2 = require('lib/router/api_router_web_v2');
const auth = require('lib/middlewares/auth');
const responseUtil = require('lib/middlewares/response_util');
const platform_check = require('lib/middlewares/platform_check');
const RedisStore = require('connect-redis')(session);
const bodyParser = require('body-parser');
const cors = require('cors');
const logger = require('lib/common/logger');
const web_static = require('lib/middlewares/web_static');
const helmet = require('helmet');
//防治跨站请求伪造攻击
//const csurf = require('csurf');
const api_statistic = require('lib/middlewares/api_statistic');

//config the web app
const app = express();
// configuration in all env
app.enable('trust proxy');

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

app.use(require('cookie-parser')(config.session_secret));
app.use(session({
  cookie: {
    // domain: '.jianfanjia.com',
    path: '/',
    httpOnly: true,
    secure: false,
    maxAge: config.session_time
  },
  secret: config.session_secret,
  store: new RedisStore({
    port: config.redis_port,
    host: config.redis_host,
    pass: config.redis_pass
  }),
  rolling: true,
  resave: false,
  saveUninitialized: false
}));

//check浏览器端cookie状态
app.use('/index.html', auth.checkCookie);
//拦截web
app.use('/', auth.authAdminWeb);
// 静态资源
app.use('/', web_static(express, path.join(__dirname, 'web/admin-new')));

app.use('/api', responseUtil);

// routes
app.use('/api/v2', function (req, res, next) {
  if (!(req.body instanceof Buffer)) {
    logger.debug(req.body);
  }

  next();
});

//API Request logger
app.use('/api', req_res_log);
app.use('/api/v2/web', cors(), platform_check, api_statistic.api_statistic, api_router_web_v2);

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
  res.end('404 error!')
});

module.exports = app;
