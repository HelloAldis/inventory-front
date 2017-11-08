var config = require('lib/config/apiconfig');
var eventproxy = require('eventproxy');
var type = require('lib/type/type');
var ApiUtil = require('lib/common/api_util');
var _ = require('lodash');

/**
 * 需要通用用户登录
 */
exports.normalUserRequired = function (req, res, next) {
  if (!ApiUtil.getUserid(req)) {
    return res.status(403).send('forbidden!');
  }

  next();
};

/**
 * 需要业主登录
 */
exports.userRequired = function (req, res, next) {
  if (ApiUtil.getUsertype(req) !== type.role_user &&
    ApiUtil.getUsertype(req) !== type.role_admin) {
    return res.status(403).send('forbidden!');
  }

  next();
};

/**
 * 需要设计师登录
 */
exports.designerRequired = function (req, res, next) {
  if (ApiUtil.getUsertype(req) !== type.role_designer &&
    ApiUtil.getUsertype(req) !== type.role_admin) {
    return res.status(403).send('forbidden!');
  }

  next();
};

/**
 * 需要监理登录
 */
exports.supervisorRequired = function (req, res, next) {
  if (ApiUtil.getUsertype(req) !== type.role_supervisor) {
    return res.status(403).send('forbidden!');
  }

  next();
};

/**
 * 需要admin登录
 */
exports.adminRequired = function (req, res, next) {
  if (ApiUtil.getUsertype(req) !== type.role_admin) {
    return res.status(403).send('forbidden!');
  }

  next();
};

exports.gen_session = function (user, usertype, req, res) {
  req.session.userid = user._id;
  req.session.usertype = usertype;
  if (usertype === type.role_designer) {
    req.session.agreee_license = user.agreee_license;
  }

  req.session.touch();
  req.session.save();

  var opts = {
    path: '/',
    maxAge: 1000 * 60 * 60 * 24 * 30,
    signed: false,
    httpOnly: false
  };
  res.cookie('username', user.username || user.phone, opts); //cookie 有效期1天
  res.cookie('usertype', usertype, opts);
}

exports.clear_session = function (req, res) {
  if (req.session) {
    req.session.destroy();
  }
  res.clearCookie('username', {
    path: '/'
  });
  res.clearCookie('usertype', {
    path: '/'
  });
}

// 验证用户是否登录
exports.authUser = function (req, res, next) {
  var ep = new eventproxy();
  ep.fail(next);

  ep.all('get_user', function (userid) {
    if (!userid) {
      return next();
    }

    req.session.userid = userid;
    return next();
  });

  if (req.session.userid) {
    ep.emit('get_user', req.session.userid);
  } else {
    var auth_token = req.signedCookies[config.auth_cookie_name];
    if (!auth_token) {
      return next();
    }

    var auth = auth_token.split('$$$$');
    var user_id = auth[0];
    ep.emit('get_user', user_id);
  }
};

var loginPages = ['/login.html'];
var designerPages = ['/designer.html', 'license.html'];
var userPages = ['/owner.html'];

exports.checkCookie = function (req, res, next) {
  var userid = ApiUtil.getUserid(req);

  if (userid) {
    //有ID session 但是username usertype cookies被篡改了 注销session
    if (!req.cookies['username'] || !req.cookies['usertype']) {
      exports.clear_session(req, res);
    }
  } else {
    //清空session
    exports.clear_session(req, res);
  }

  next();
}

exports.authWeb = function (req, res, next) {
  var url = req.path;
  var userid = ApiUtil.getUserid(req);
  var usertype = ApiUtil.getUsertype(req);

  if (_.indexOf(loginPages, url) >= 0) {
    if (userid) {
      if (usertype === type.role_user) {
        res.redirect('owner.html');
      } else if (usertype === type.role_designer) {
        res.redirect('designer.html');
      }
    } else {
      next();
    }
  } else if (_.indexOf(designerPages, url) >= 0) {
    if (userid) {
      if (usertype === type.role_user) {
        res.status(403).send('forbidden!');
      } else if (usertype === type.role_designer) {
        var agreee_license = ApiUtil.getAgreeeLicense(req);
        if (agreee_license === type.designer_agree_type_yes) {
          next();
        } else {
          res.redirect('license.html');
        }
      }
    } else {
      res.redirect('login.html');
    }
  } else if (_.indexOf(userPages, url) >= 0) {
    if (userid) {
      if (usertype === type.role_user) {
        next();
      } else if (usertype === type.role_designer) {
        res.status(403).send('forbidden!');
      }
    } else {
      res.redirect('login.html');
    }
  } else {
    next();
  }
}

var wenjuan1Pages = ['/survey/index.html'];

exports.authWechat = function (req, res, next) {
  var url = req.path;
  var userid = ApiUtil.getUserid(req);

  if (_.indexOf(wenjuan1Pages, url) >= 0) {
    if (userid) {
      next();
    } else {
      res.redirect('/wechat/user_wenjuan/1');
    }
  } else {
    next();
  }
}

var adminLoginPages = ['/login.html'];
var adminPages = ['/index.html', '/'];

exports.authAdminWeb = function (req, res, next) {
  var url = req.path;
  var userid = ApiUtil.getUserid(req);
  var usertype = ApiUtil.getUsertype(req);

  if (_.indexOf(adminLoginPages, url) >= 0) {
    if (userid && usertype === type.role_admin) {
      res.redirect('/');
    } else {
      next();
    }
  } else if (_.indexOf(adminPages, url) >= 0) {
    if (userid && usertype === type.role_admin) {
      next();
    } else {
      res.redirect(adminLoginPages[0]);
    }
  } else {
    next();
  }
}
