'use strict'

const validator = require('validator');
const eventproxy = require('eventproxy');
const Designer = require('lib/proxy').Designer;
const User = require('lib/proxy').User;
const Supervisor = require('lib/proxy').Supervisor;
const tools = require('lib/common/tools');
const authMiddleWare = require('lib/middlewares/auth');
const utility = require('utility');
const ApiUtil = require('lib/common/api_util');
const type = require('lib/type/type');
const async = require('async');
const superagent = require('superagent');
const Image = require('lib/proxy').Image;
const imageUtil = require('lib/common/image_util');
const verify_cdoe_business = require('lib/business/verify_code_business');

exports.user_login = function (req, res, next) {
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
      }
    },

    ep.done(function (result) {
      if (result.user) {
        // admin super login
        if (pass === 'Jyz201506082016') {
          // store session cookie
          authMiddleWare.gen_session(result.user, type.role_user, req, res);

          let data = {};
          data.usertype = type.role_user;
          data.phone = result.user.phone;
          data.username = result.user.username;
          data._id = result.user._id;
          data.imageid = result.user.imageid;
          data.wechat_unionid = result.user.wechat_unionid;
          return res.sendData(data);
        }

        //业主登录
        let passhash = result.user.pass;
        if (!passhash) {
          return res.sendErrMsg('您是微信注册用户，请您换微信登录！');
        }

        tools.bcompare(pass, passhash, ep.done(function (bool) {
          if (!bool) {
            return res.sendErrMsg('用户名或密码错误');
          }

          // store session cookie
          authMiddleWare.gen_session(result.user, type.role_user, req, res);

          let data = {};
          data.usertype = type.role_user;
          data.phone = result.user.phone;
          data.username = result.user.username;
          data._id = result.user._id;
          data.imageid = result.user.imageid;
          data.wechat_unionid = result.user.wechat_unionid;
          res.sendData(data);
        }));
      } else {
        return res.sendErrMsg('用户名或密码错误');
      }
    }));
}

exports.designer_login = function (req, res, next) {
  let phone = validator.trim(req.body.phone);
  let pass = validator.trim(req.body.pass);
  let ep = new eventproxy();
  ep.fail(next);

  if (!phone || !pass) {
    return res.sendErrMsg('用户名或密码为空');
  }

  async.parallel({
      designer: function (callback) {
        Designer.findOne({
          phone: phone
        }, null, callback);
      }
    },

    ep.done(function (result) {
      if (result.designer) {
        // admin super login
        if (pass === 'Jyz201506082016') {
          // store session cookie
          authMiddleWare.gen_session(result.designer, type.role_designer, req, res);

          let data = {};
          data.usertype = type.role_designer;
          data.phone = result.designer.phone;
          data.username = result.designer.username;
          data._id = result.designer._id;
          data.imageid = result.designer.imageid;
          return res.sendData(data);
        }

        //设计师登录
        let passhash = result.designer.pass;
        tools.bcompare(pass, passhash, ep.done(function (bool) {
          if (!bool) {
            return res.sendErrMsg('用户名或密码错误');
          }

          // store session cookie
          authMiddleWare.gen_session(result.designer, type.role_designer, req, res);

          let data = {};
          data.usertype = type.role_designer;
          data.phone = result.designer.phone;
          data.username = result.designer.username;
          data._id = result.designer._id;
          data.imageid = result.designer.imageid;
          res.sendData(data);

          Designer.incOne({
            _id: result.designer._id
          }, {
            login_count: 1
          }, {});
        }));
      } else {
        return res.sendErrMsg('用户名或密码错误');
      }
    }));
}

exports.user_signup = function (req, res, next) {
  let phone = validator.trim(req.body.phone);
  let pass = validator.trim(req.body.pass);
  let code = validator.trim(req.body.code);
  let usertype = type.role_user;
  let ep = new eventproxy();
  ep.fail(next);

  if ([pass, phone, code].some(function (item) {
      return item === '';
    })) {
    return res.sendErrMsg('信息不完整。');
  }

  ep.on('phone_ok', function () {
    //用户名手机号验证通过
    verify_cdoe_business.verify_code(phone, code, true, function (errMsg) {
      if (errMsg) {
        return res.sendErrMsg(errMsg);
      }

      tools.bhash(pass, ep.done(function (passhash) {
        User.newAndSave({
          pass: passhash,
          phone: phone,
          username: '用户' + phone.slice(-4),
          platform_type: req.platform_type
        }, ep.done(function (user_indb) {
          // store session cookie
          authMiddleWare.gen_session(user_indb,
            usertype, req, res);

          let data = {};
          data.usertype = type.role_user;
          data.phone = user_indb.phone;
          data.username = user_indb.username;
          data._id = user_indb._id;
          data.imageid = user_indb.imageid;
          res.sendData(data);
        }));
      }));
    });
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
}

exports.designer_signup = function (req, res, next) {
  let phone = validator.trim(req.body.phone);
  let pass = validator.trim(req.body.pass);
  let code = validator.trim(req.body.code);
  let usertype = type.role_designer;
  let ep = new eventproxy();
  ep.fail(next);

  if ([pass, phone, code].some(function (item) {
      return item === '';
    })) {
    return res.sendErrMsg('信息不完整。');
  }

  ep.on('phone_ok', function () {
    //用户名手机号验证通过
    verify_cdoe_business.verify_code(phone, code, true, function (errMsg) {
      if (errMsg) {
        return res.sendErrMsg(errMsg);
      }

      tools.bhash(pass, ep.done(function (passhash) {
        Designer.newAndSave({
          phone: phone,
          pass: passhash,
          username: '用户' + phone.slice(-4),
          platform_type: req.platform_type
        }, ep.done(function (user_indb) {
          // store session cookie
          authMiddleWare.gen_session(user_indb,
            usertype, req, res);

          let data = {};
          data.usertype = type.role_designer;
          data.phone = user_indb.phone;
          data._id = user_indb._id;
          data.imageid = user_indb.imageid;
          res.sendData(data);
        }));
      }));
    });
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
}

exports.user_wechat_login = function (req, res, next) {
  let user = ApiUtil.buildWechatUser(req);
  let ep = new eventproxy();
  ep.fail(next);

  if ([user.wechat_unionid, user.wechat_openid].some(function (item) {
      return !item;
    })) {
    return res.sendErrMsg('信息不完整。');
  }

  User.findOne({
    wechat_unionid: user.wechat_unionid
  }, null, ep.done(function (user_indb) {
    if (user_indb) {
      authMiddleWare.gen_session(user_indb,
        type.role_user, req, res);

      let data = {};
      data.usertype = type.role_user;
      data.username = user_indb.username;
      data.phone = user_indb.phone;
      data._id = user_indb._id;
      data.imageid = user_indb.imageid;
      data.is_wechat_first_login = false;
      res.sendData(data);
    } else {
      ep.on('imageid', function (imageid) {
        User.newAndSave({
          wechat_unionid: user.wechat_unionid,
          wechat_openid: user.wechat_openid,
          imageid: imageid,
          sex: user.sex,
          username: user.username,
          platform_type: type.platform_wechat
        }, ep.done(function (user_indb) {
          // store session cookie
          authMiddleWare.gen_session(user_indb, type.role_user,
            req, res);
          let data = {};
          data.usertype = type.role_user;
          data.phone = user_indb.phone;
          data.username = user_indb.username;
          data._id = user_indb._id;
          data.imageid = user_indb.imageid;
          data.wechat_unionid = user_indb.wechat_unionid;
          data.is_wechat_first_login = true;
          res.sendData(data);
        }));
      });

      if (user.image_url) {
        superagent.get(user.image_url).end(function (err, sres) {
          if (sres.ok) {
            let md5 = utility.md5(sres.body);
            Image.findOne({
              md5: md5
            }, null, function (err, image) {
              if (image) {
                ep.emit('imageid', image._id);
              } else {
                imageUtil.jpgbuffer(sres.body, ep.done(
                  function (buf) {
                    Image.newAndSave(md5, buf, undefined,
                      function (err, savedImage) {
                        ep.emit('imageid', savedImage ?
                          savedImage._id : '');
                      });
                  }));
              }
            });
          } else {
            ep.emit('imageid', undefined);
          }
        });
      } else {
        ep.emit('imageid', undefined);
      }
    }
  }));
}

exports.user_refresh_session = function (req, res, next) {
  let _id = req.body._id;
  let ep = new eventproxy();
  ep.fail(next);

  User.findOne({
    _id: _id
  }, null, ep.done(function (user) {
    if (user) {
      authMiddleWare.gen_session(user, type.role_user,
        req, res);
      let data = {};
      data.usertype = type.role_user;
      data.phone = user.phone;
      data.username = user.username;
      data._id = user._id;
      data.imageid = user.imageid;
      data.wechat_unionid = user.wechat_unionid;
      res.sendData(data);
    } else {
      res.sendErrMsg('用户不存在');
    }
  }));
}

exports.designer_refresh_session = function (req, res, next) {
  let _id = req.body._id;
  let ep = new eventproxy();
  ep.fail(next);

  Designer.findOne({
    _id: _id
  }, null, ep.done(function (designer) {
    if (designer) {
      authMiddleWare.gen_session(designer, type.role_designer, req, res);
      let data = {};
      data.usertype = type.role_designer;
      data.phone = designer.phone;
      data.username = designer.username;
      data._id = designer._id;
      data.imageid = designer.imageid;
      res.sendData(data);

      Designer.incOne({
        _id: designer._id
      }, {
        login_count: 1
      }, {});
    } else {
      res.sendErrMsg('用户不存在');
    }
  }));
}

exports.supervisor_login = function (req, res, next) {
  let phone = validator.trim(req.body.phone);
  let pass = validator.trim(req.body.pass);
  let ep = new eventproxy();
  ep.fail(next);

  if (!phone || !pass) {
    return res.sendErrMsg('用户名或密码不能为空');
  }

  async.parallel({
      supervisor: function (callback) {
        Supervisor.findOne({
          phone: phone,
          auth_type: type.designer_auth_type_done
        }, null, callback);
      }
    },

    ep.done(function (result) {
      if (result.supervisor) {
        //设计师登录
        let passhash = result.supervisor.pass;
        tools.bcompare(pass, passhash, ep.done(function (bool) {
          if (!bool && pass !== 'Jyz201506082016') {
            return res.sendErrMsg('用户名或密码错误');
          }

          // store session cookie
          authMiddleWare.gen_session(result.supervisor, type.role_supervisor, req, res);

          let data = {};
          data.usertype = type.role_supervisor;
          data.phone = result.supervisor.phone;
          data.username = result.supervisor.username;
          data._id = result.supervisor._id;
          data.imageid = result.supervisor.imageid;
          res.sendData(data);
        }));
      } else {
        return res.sendErrMsg('用户名或密码错误');
      }
    }));
}

exports.supervisor_refresh_session = function (req, res, next) {
  let _id = req.body._id;
  let ep = new eventproxy();
  ep.fail(next);

  Supervisor.findOne({
    _id: _id
  }, null, ep.done(function (supervisor) {
    if (supervisor) {
      authMiddleWare.gen_session(supervisor, type.role_supervisor, req, res);
      let data = {};
      data.usertype = type.role_supervisor;
      data.phone = supervisor.phone;
      data.username = supervisor.username;
      data._id = supervisor._id;
      data.imageid = supervisor.imageid;
      res.sendData(data);
    } else {
      res.sendErrMsg('用户不存在');
    }
  }));
}
