//load configuration
var config = require('lib/config/apiconfig');

var express = require('express');
var path = require('path');
var compression = require('compression');
var session = require('express-session');
var timeout = require('connect-timeout');
// var passport = require('passport');
var req_res_log = require('lib/middlewares/req_res_log');
var web_router_pc = require('lib/router/web_router_pc');
var api_router_app_v2 = require('lib/router/api_router_app_v2');
var api_router_web_v2 = require('lib/router/api_router_web_v2');
var auth = require('lib/middlewares/auth');
var responseUtil = require('lib/middlewares/response_util');
var platform_check = require('lib/middlewares/platform_check');
var RedisStore = require('connect-redis')(session);
var bodyParser = require('body-parser');
var cors = require('cors');
var logger = require('lib/common/logger');
var helmet = require('helmet');
//防治跨站请求伪造攻击
//var csurf = require('csurf');
var api_statistic = require('lib/middlewares/api_statistic');

//config the web app
var app = express();
// configuration in all env
app.enable('trust proxy');

//config view engine
app.set('views', path.join(__dirname, 'web/user/template'));
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
app.use('/tpl', auth.checkCookie);
app.use('/api/v2/web/user_statistic_info', auth.checkCookie);
app.use('/api/v2/web/designer_statistic_info', auth.checkCookie);
//拦截web
app.use('/tpl/user', auth.authWeb);
//拦截微信页面
app.use('/weixin', auth.authWechat);

//后台渲染的页面
app.use('/', web_router_pc);
// 静态资源
app.use('/', express.static(path.join(__dirname, 'web/user/res')));

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
app.use('/download', req_res_log);

app.use('/api/v2/app', cors(), platform_check, api_statistic.api_statistic, api_router_app_v2);
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
  if (req.path === '/404.html') {
    res.end();
  } else {
    res.redirect('/404.html');
    logger.info('url not found :' + req.originalUrl);
  }
});

module.exports = app;
