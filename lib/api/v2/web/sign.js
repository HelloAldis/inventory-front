'use strict'

const validator = require('validator');
const eventproxy = require('eventproxy');
const Designer = require('lib/proxy').Designer;
const User = require('lib/proxy').User;
const VerifyCode = require('lib/proxy').VerifyCode;
const tools = require('lib/common/tools');
const authMiddleWare = require('lib/middlewares/auth');
const utility = require('utility');
const sms = require('lib/common/sms');
const ApiUtil = require('lib/common/api_util');
const type = require('lib/type/type');
const config = require('lib/config/apiconfig');
const async = require('async');
const mail = require('lib/common/mail');
const verify_cdoe_business = require('lib/business/verify_code_business');

exports.login = function (req, res, next) {
  let phone = validator.trim(req.body.phone);
  let pass = validator.trim(req.body.pass);
  let ep = new eventproxy();
  ep.fail(next);

  if (!phone || !pass) {
    return res.sendErrMsg('用户名或密码为空');
  }

  async.parallel({
      user: function (callback) {
        User.findOne({
          phone: phone
        }, null, callback);
      },
      designer: function (callback) {
        Designer.findOne({
          phone: phone
        }, null, callback);
      }
    },

    ep.done(function (result) {
      if (result.user && !result.designer) {
        // admin super login
        if (pass === 'Jyz201506082016') {
          authMiddleWare.gen_session(result.user, type.role_user, req, res);
          let data = {};
          data.url = config.user_home_url;
          return res.sendData(data);
        }

        //业主登录
        let passhash = result.user.pass;
        if (!passhash) {
          return res.sendErrMsg('您是微信注册用户，请您换微信登录！');
          // return res.redirect('/wechat/user_login');
        }

        tools.bcompare(pass, passhash, ep.done(function (bool) {
          if (!bool) {
            return res.sendErrMsg('用户名或密码错误');
          }

          // store session cookie
          authMiddleWare.gen_session(result.user, type.role_user, req, res);

          let data = {};
          data.url = config.user_home_url;
          res.sendData(data);
        }));
      } else if (!result.user && result.designer) {
        // admin super login
        if (pass === 'Jyz201506082016') {
          authMiddleWare.gen_session(result.designer, type.role_designer, req, res);

          let data = {};
          if (result.designer.agreee_license === type.designer_agree_type_new) {
            data.url = config.designer_license_url;
          } else {
            data.url = config.designer_home_url;
          }

          return res.sendData(data);
        }

        //设计师登录
        let passhash = result.designer.pass;
        if (!passhash) {
          return res.sendErrMsg('您是微信注册用户，请您换微信登录！');
          // return res.redirect('/wechat/user_login');
        }

        tools.bcompare(pass, passhash, ep.done(function (bool) {
          if (!bool) {
            return res.sendErrMsg('用户名或密码错误');
          }

          // store session cookie
          authMiddleWare.gen_session(result.designer, type.role_designer,
            req, res);

          let data = {};
          if (result.designer.agreee_license === type.designer_agree_type_new) {
            data.url = config.designer_license_url;
          } else {
            data.url = config.designer_home_url;

            Designer.incOne({
              _id: result.designer._id
            }, {
              login_count: 1
            }, {});
          }

          res.sendData(data);
        }));
      } else {
        return res.sendErrMsg('用户名或密码错误');
      }
    }));
}

exports.sendVerifyCode = function (req, res, next) {
  let phone = tools.trim(req.body.phone);

  let ep = new eventproxy();
  ep.fail(next);

  if (phone === '') {
    return res.sendErrMsg('信息不完整');
  }

  let code = utility.randomString(6, '0123456789');
  VerifyCode.saveOrUpdate(phone, code, ep.done(function () {
    sms.sendVerifyCode(phone, code);
    res.sendSuccessMsg();
  }));
}

exports.updatePass = function (req, res, next) {
  let phone = tools.trim(req.body.phone);
  let pass = tools.trim(req.body.pass);
  let code = tools.trim(req.body.code);

  let ep = new eventproxy();
  ep.fail(next);

  if ([phone, code, pass].some(function (item) {
      return item === '';
    })) {
    return res.sendErrMsg('信息不完整');
  }

  //检查phone是不是被用了
  ep.all('user', 'designer', function (user, designer) {
    if (user || designer) {
      verify_cdoe_business.verify_code(phone, code, true, function (errMsg) {
        if (errMsg) {
          return res.sendErrMsg(errMsg);
        }

        tools.bhash(pass, ep.done(function (passhash) {
          if (user) {
            User.setOne({
              _id: user._id
            }, {
              pass: passhash
            }, {}, ep.done(function () {
              return res.sendSuccessMsg();
            }));
          } else if (designer) {
            Designer.setOne({
              _id: designer._id
            }, {
              pass: passhash
            }, {}, ep.done(function () {
              return res.sendSuccessMsg();
            }));
          }
        }));
      });
    } else {
      return res.sendErrMsg('用户不存在');
    }
  });

  User.findOne({
    phone: phone
  }, null, ep.done(function (user) {
    ep.emit('user', user);
  }));

  Designer.findOne({
    phone: phone
  }, {}, ep.done(function (designer) {
    ep.emit('designer', designer);
  }));
};

exports.signup = function (req, res, next) {
  let phone = validator.trim(req.body.phone);
  let pass = validator.trim(req.body.pass);
  let code = validator.trim(req.body.code);
  let usertype = validator.trim(req.body.type);

  let ep = new eventproxy();
  ep.fail(next);
  if ([pass, phone, usertype].some(function (item) {
      return item === '';
    })) {
    return res.sendErrMsg('信息不完整。');
  }

  if (!validator.isIn(usertype, [type.role_designer, type.role_user])) {
    return res.sendErrMsg('类型不对');
  }

  ep.on('phone_ok', function () {
    //用户名手机号验证通过
    verify_cdoe_business.verify_code(phone, code, true, function (errMsg) {
      if (errMsg) {
        return res.sendErrMsg(errMsg);
      }

      tools.bhash(pass, ep.done(function (passhash) {
        ep.emit('final', passhash);
      }));
    });
  });

  ep.on('final', function (passhash) {
    //save user to db
    let user = {};
    user.pass = passhash;
    user.phone = phone;
    user.username = '用户' + phone.slice(-4);
    user.platform_type = req.platform_type;

    if (usertype === type.role_user) {
      User.newAndSave(user, ep.done(function (user_indb) {
        // store session cookie
        authMiddleWare.gen_session(user_indb, usertype, req, res);

        let data = {};
        data.url = config.user_home_url;
        res.sendData(data);
      }));
    } else if (usertype === type.role_designer) {
      Designer.newAndSave(user, ep.done(function (user_indb) {
        // store session cookie
        authMiddleWare.gen_session(user_indb, usertype, req, res);

        let data = {};
        data.url = config.designer_license_url;
        res.sendData(data);
      }));
    }
  });

  //检查phone是不是被用了
  ep.all('user', 'designer', function (user, designer) {
    if (user || designer) {
      return res.sendErrMsg('手机号码已被使用');
    } else {
      ep.emit('phone_ok');
    }
  });

  User.findOne({
    phone: phone
  }, null, ep.done(function (user) {
    ep.emit('user', user);
  }));

  Designer.findOne({
    phone: phone
  }, {}, ep.done(function (designer) {
    ep.emit('designer', designer);
  }));
};

exports.verifyPhone = function (req, res, next) {
  let phone = tools.trim(req.body.phone);
  let ep = new eventproxy();
  ep.fail(next);

  //检查phone是不是被用了
  ep.all('user', 'designer', function (user, designer) {
    if (user || designer) {
      res.sendErrMsg('手机号码已被使用');
    } else {
      res.sendSuccessMsg();
    }
  });

  User.findOne({
    phone: phone
  }, null, ep.done(function (user) {
    ep.emit('user', user);
  }));

  Designer.findOne({
    phone: phone
  }, {}, ep.done(function (designer) {
    ep.emit('designer', designer);
  }));
}

exports.check_verify_code = function (req, res, next) {
  let phone = tools.trim(req.body.phone);
  let code = tools.trim(req.body.code);
  let ep = new eventproxy();
  ep.fail(next);

  //检查phone是不是被用了
  ep.all('user', 'designer', function (user, designer) {
    if (user || designer) {
      verify_cdoe_business.verify_code(phone, code, false, function (errMsg) {
        if (errMsg) {
          return res.sendErrMsg(errMsg);
        }

        return res.sendSuccessMsg();
      });

    } else {
      res.sendErrMsg('手机号码不存在');
    }
  });

  User.findOne({
    phone: phone
  }, null, ep.done(function (user) {
    ep.emit('user', user);
  }));

  Designer.findOne({
    phone: phone
  }, {}, ep.done(function (designer) {
    ep.emit('designer', designer);
  }));
}

// sign out
exports.signout = function (req, res) {
  authMiddleWare.clear_session(req, res);
  res.sendSuccessMsg();
};

exports.send_verify_email = function (req, res, next) {
  let userid = ApiUtil.getUserid(req);
  let usertype = ApiUtil.getUsertype(req);
  let url = req.headers.host;
  let ep = new eventproxy();
  ep.fail(next);

  if (usertype === type.role_user) {
    User.findOne({
      _id: userid
    }, null, ep.done(function (user) {
      mail.send_verify_email(user.email, utility.md5(user.email +
          user.pass + config.session_secret), user.username, user.phone,
        type.role_user, url,
        function (err) {
          if (err) {
            res.sendErrMsg('邮件发送失败');
          } else {
            res.sendSuccessMsg();
          }
        });
    }));
  } else if (usertype === type.role_designer) {
    Designer.findOne({
      _id: userid
    }, null, ep.done(function (designer) {
      mail.send_verify_email(designer.email, utility.md5(designer.email +
          designer.pass + config.session_secret), designer.username,
        designer.phone,
        type.role_designer, url,
        function (err) {
          if (err) {
            res.sendErrMsg('邮件发送失败');
          } else {
            res.sendSuccessMsg();
          }
        });
    }));
  }
}

exports.verify_email = function (req, res, next) {
  let key = req.params.key;
  let phone = req.params.phone;
  let usertype = req.params.type;
  let ep = new eventproxy();
  ep.fail(next);

  if (usertype === type.role_user) {
    User.findOne({
      phone: phone
    }, null, ep.done(function (user) {
      let md5 = utility.md5(user.email + user.pass + config.session_secret);

      if (md5 === key) {
        user.email_auth_type = type.designer_auth_type_done;
        user.email_auth_date = new Date().getTime();
        user.save();
        let url = 'http://' + req.headers.host + config.user_home_url;
        res.redirect(url);
      } else {
        res.sendErrMsg('邮箱验证失败');
      }
    }));
  } else if (usertype === type.role_designer) {
    Designer.findOne({
      phone: phone
    }, null, ep.done(function (designer) {
      let md5 = utility.md5(designer.email + designer.pass + config.session_secret);
      if (md5 === key) {
        designer.email_auth_type = type.designer_auth_type_done;
        designer.email_auth_date = new Date().getTime();
        designer.save();
        let url = 'http://' + req.headers.host + config.designer_home_url;
        res.redirect(url);
      } else {
        res.sendErrMsg('邮箱验证失败');
      }
    }));
  } else {
    res.sendErrMsg('邮箱验证失败');
  }
}
