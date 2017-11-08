var mailer = require('nodemailer');
var config = require('lib/config/apiconfig');
var util = require('util');
var logger = require('./logger');
var transport = mailer.createTransport(config.mail_opts);

/**
 * Send an email
 * @param {Object} data 邮件对象
 */
var sendMail = function (data, callback) {
  if (!config.send_email) {
    return;
  }

  transport.sendMail(data, function (err) {
    if (err) {
      // 写为日志
      logger.info(err);
    }
    callback(err);
  });
};
exports.sendMail = sendMail;

/**
 * 发送激活通知邮件
 * @param {String} who 接收人的邮件地址
 * @param {String} token 重置用的token字符串
 * @param {String} name 接收人的用户名
 */
exports.send_verify_email = function (who, token, name, phone, type, url,
  callback) {

  if (!name) {
    name = '简繁家用户';
  }

  var from = util.format('%s <%s>', '简繁家', config.mail_opts.auth.user);
  var to = who;
  var subject = '简繁家邮箱认证';
  var html = '<p>您好：' + name + '</p>' +
    '<p>我们收到您在简繁家的邮箱认证请求，请点击下面的链接来确认你的邮箱</p>' +
    '<a href  = "http://' + url + '/api/v2/web/verify_email/' + token +
    '/' + phone + '/' + type + '">激活链接</a>' +
    '<p>若您没有在简繁家申请邮箱认证，说明有人滥用了您的电子邮箱，请删除此邮件，我们对给您造成的打扰感到抱歉。</p>' +
    '<p>简繁家 欢迎你。</p>';

  logger.debug(html);
  exports.sendMail({
    from: from,
    to: to,
    subject: subject,
    html: html
  }, callback);
};

/**
 * 发送密码重置通知邮件
 * @param {String} who 接收人的邮件地址
 * @param {String} token 重置用的token字符串
 * @param {String} name 接收人的用户名
 */
// exports.sendResetPassMail = function (who, token, name) {
//   var from = util.format('%s <%s>', config.name, config.mail_opts.auth.user);
//   var to = who;
//   var subject = config.name + '社区密码重置';
//   var html = '<p>您好：' + name + '</p>' +
//     '<p>我们收到您在' + config.name + '社区重置密码的请求，请在24小时内单击下面的链接来重置密码：</p>' +
//     '<a href="' + SITE_ROOT_URL + '/reset_pass?key=' + token + '&name=' +
//     name + '">重置密码链接</a>' +
//     '<p>若您没有在' + config.name +
//     '社区填写过注册信息，说明有人滥用了您的电子邮箱，请删除此邮件，我们对给您造成的打扰感到抱歉。</p>' +
//     '<p>' + config.name + '社区 谨上。</p>';
//
//   exports.sendMail({
//     from: from,
//     to: to,
//     subject: subject,
//     html: html
//   });
// };
