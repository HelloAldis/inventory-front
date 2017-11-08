var eventproxy = require('eventproxy');
var User = require('lib/proxy').User;
var ApiUtil = require('lib/common/api_util');

exports.user_bind_wechat = function (req, res, next) {
  var wechat_unionid = req.body.wechat_unionid;
  var wechat_openid = req.body.wechat_openid;
  var _id = ApiUtil.getUserid(req);
  var ep = eventproxy();
  ep.fail(next);

  if ([wechat_unionid, wechat_openid].some(function (item) {
      return !item;
    })) {
    return res.sendErrMsg('信息不完整。');
  }

  //检查phone是不是被用了
  ep.all('user', function (user) {
    if (user) {
      res.sendErrMsg('此微信号已经被其他账号绑定');
    } else {
      //用户名手机号验证通过
      User.setOne({
        _id: _id
      }, {
        wechat_unionid: wechat_unionid,
        wechat_openid: wechat_openid
      }, null, ep.done(function () {
        res.sendSuccessMsg();
      }));
    }
  });

  User.findOne({
    wechat_unionid: wechat_unionid,
    _id: {
      $ne: _id
    }
  }, null, ep.done(function (user) {
    ep.emit('user', user);
  }));
}
