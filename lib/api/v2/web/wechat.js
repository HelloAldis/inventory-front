'use strict'

const xml2json = require('xml2json');
const utility = require('utility');
const type = require('lib/type/type');
const Kpi = require('lib/proxy').Kpi;
const eventproxy = require('eventproxy');
const cache = require('lib/common/cache');
const request = require('superagent');
const limit = require('lib/middlewares/limit');
const wechat_util = require('lib/common/wechat_util');
const config = require('lib/config/apiconfig');
const logger = require('lib/common/logger');

function toJson(xml) {
  return xml2json.toJson(xml.toString(), {
    object: true
  }).xml;
}

function handleText(msg, req, res, next) {
  let ep = eventproxy();
  ep.fail(next);

  if (msg.Content.search(/我是推广员/) > -1) {
    let username = msg.Content.slice(5).trim();
    let sceneid = new Date().getTime() % (1000 * 60 * 60 * 24 * 6);
    Kpi.setOne({
      openid: msg.FromUserName
    }, {
      username: username,
      sceneid: sceneid
    }, {
      upsert: true
    }, ep.done(function () {
      cache.get(type.wechat_token, ep.done(function (token) {
        let url =
          'https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token=' +
          token;
        request.post(url).send({
          expire_seconds: 604800,
          action_name: 'QR_SCENE',
          action_info: {
            scene: {
              scene_id: sceneid
            }
          }
        }).end(ep.done(function (wei_res) {
          if (wei_res.ok && !wei_res.body.errcode) {
            let url =
              'https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=' +
              wei_res.body.ticket;
            res.send(wechat_util.get_image_text_msg(msg.FromUserName,
              msg.ToUserName,
              '简繁家感谢你为我们推广',
              '请点击链接并保管好你的二维码', url, url));
          } else {
            logger.error(wei_res.text);
          }
        }));
      }));
    }));
  } else if (msg.Content.toLowerCase() === 'kpi') {
    Kpi.findOne({
      openid: msg.FromUserName
    }, null, ep.done(function (kpi) {
      if (kpi) {
        res.send(wechat_util.get_text_msg(msg.FromUserName, msg.ToUserName,
          '你的kpi为' + kpi.subscribe_count +
          ', 请爆发你的小宇宙吧！'));
      } else {
        res.send('success');
      }
    }));
  } else if (msg.Content.toLowerCase() === 'adminkpi') {
    Kpi.find({}, {
      _id: 0,
      username: 1,
      subscribe_count: 1,
      scan_count: 1
    }, null, ep.done(function (kpis) {
      if (kpis.length > 0) {
        let arr = kpis.map(function (kpi) {
          return kpi.username + ' ' + kpi.subscribe_count + '+' + kpi
            .scan_count;
        });
        res.send(wechat_util.get_text_msg(msg.FromUserName, msg.ToUserName,
          arr.join('\n')));
      } else {
        res.send('success');
      }
    }));
  } else {
    res.send('success');
  }
}

let wejuan1_image_url =
  'https://mmbiz.qlogo.cn/mmbiz/vibZVd8mqTIwgeicZbtFqlUzJYMnzwr6EmQKodMuibNUKqKZkYbu1N0lSiaNQhoS3UgOGxtZrweTtxmXOwFY65k31w/0?wx_fmt=jpeg';
let wenjuan1_url = '/wechat/user_wenjuan/1';

function handleEvent(msg, req, res, next) {
  let ep = eventproxy();
  ep.fail(next);

  if (msg.Event === type.wechat_Event_subscribe) {
    if (msg.EventKey && msg.EventKey.length > 8) {
      //关注了带参数二维码
      let sceneid = msg.EventKey.slice(8);
      limit.perwhatperdaydo('wechat_Event_subscribe', msg.FromUserName, 1,
        function () {
          Kpi.incOne({
            sceneid: sceneid
          }, {
            subscribe_count: 1
          });
        });
    }

    res.send(wechat_util.get_image_text_msg(msg.FromUserName,
      msg.ToUserName,
      '参与问卷，从这里开始',
      '认真填写调查问卷，回答完毕后截图，会有惊喜等你哦！', wejuan1_image_url, 'http://' + req.headers
      .host + wenjuan1_url));

  } else if (msg.Event === type.wechat_Event_SCAN && msg.EventKey) {
    if (msg.EventKey) {
      //已关注了又扫了带参数二维码
      let sceneid = msg.EventKey;
      Kpi.incOne({
        sceneid: sceneid
      }, {
        scan_count: 1
      });
    }

    res.send(wechat_util.get_image_text_msg(msg.FromUserName,
      msg.ToUserName,
      '参与问卷，从这里开始',
      '认真填写调查问卷，回答完毕后截图，会有惊喜等你哦！', wejuan1_image_url, 'http://' + req.headers
      .host + wenjuan1_url));
  } else {
    res.send('success');
  }
}

exports.receive = function (req, res, next) {
  req.on('data', function (data) {
    let msg = toJson(data);
    logger.debug(msg);
    if (msg.MsgType === type.wechat_MsgType_text) {
      handleText(msg, req, res, next);
    } else if (msg.MsgType === type.wechat_MsgType_event) {
      handleEvent(msg, req, res, next);
    } else {
      res.send('success');
    }
  });
};

exports.signature = function (req, res) {
  let signature = req.query.signature;
  let timestamp = req.query.timestamp;
  let nonce = req.query.nonce;
  let echostr = req.query.echostr;
  let arr = [config.wechat_token, timestamp, nonce];
  let str = arr.sort().join('');
  if (signature === utility.sha1(str)) {
    res.send(echostr);
  } else {
    res.end();
  }
}
