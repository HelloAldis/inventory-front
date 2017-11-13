/**
 * this is pro config
 */

var config = {
  // debug 为 true 时，用于本地调试
  debug: true,

  // 程序运行的端口
  port: 80,

  // redis 配置，默认是本地
  redis_host: '127.0.0.1',
  redis_port: 6379,
  redis_db: 0,
  redis_pass: 'Jyz20150608',

  //Session 配置
  session_secret: 'jiayizhuang_jianfanjia_secret_dev', // 务必保密
  auth_cookie_name: 'jianfanjia',
  session_time: 1000 * 60 * 60 * 24 * 2,

  user_home_url: '/tpl/user/owner.html',
  designer_license_url: '/tpl/user/license.html',
  designer_home_url: '/tpl/user/designer.html',
};

module.exports = config;
