'use strict'

const eventproxy = require('eventproxy');
const Designer = require('lib/proxy').Designer;
const Share = require('lib/proxy').Share;
const _ = require('lodash');
const async = require('async');
const ApiUtil = require('lib/common/api_util');
const user_habit_collect = require('lib/business/user_habit_collect');

exports.search_share = function (req, res, next) {
  var query = req.body.query || {};
  var sort = req.body.sort || {
    lastupdate: -1
  };
  var skip = req.body.from || 0;
  var limit = req.body.limit || 10;
  const userid = ApiUtil.getUserid(req);
  const usertype = ApiUtil.getUsertype(req);
  var ep = new eventproxy();
  ep.fail(next);

  Share.paginate(query, null, {
      sort: sort,
      skip: skip,
      limit: limit
    },
    ep.done(function (shares, totals) {
      async.mapLimit(shares, 3, function (share, callback) {
        Designer.findOne({
          _id: share.designerid
        }, {
          _id: 1,
          username: 1,
          imageid: 1
        }, function (err, designer_indb) {
          var s = share.toObject();
          s.designer = designer_indb;
          callback(err, s);
        });
      }, ep.done(function (results) {
        res.sendData({
          shares: results,
          total: totals
        });
      }));

      if (query._id && shares.length > 0) {
        user_habit_collect.add_share_history(userid, usertype, shares[0]._id);
      }
    }));
}

var names = ["李", "王", "张", "刘", "陈", "杨", "黄", "赵", "周", "吴", "徐", "孙", "朱",
  "马", "胡", "郭", "林", "何", "高", "梁", "郑", "罗", "宋", "谢", "唐", "韩", "曹", "许",
  "邓", "萧", "冯", "曾", "程", "蔡", "彭", "潘", "袁", "於", "董", "余", "苏", "叶", "吕",
  "魏", "蒋", "田", "杜", "丁", "沈", "姜", "范", "江", "傅", "钟", "卢", "汪", "戴", "崔",
  "任", "陆", "廖", "姚", "方", "金", "邱", "夏", "谭", "韦", "贾", "邹", "石", "熊", "孟",
  "秦", "阎", "薛", "侯", "雷", "白", "龙", "段", "郝", "孔", "邵", "史", "毛", "常", "万",
  "顾", "赖", "武", "康", "贺", "严", "尹", "钱", "施"
];
var sexs = ["先生", "女士"];
var house_types = ["0", "1", "2", "3", "4", "6"]
var house_areas = [{
  start: 40,
  end: 60
}, {
  start: 60,
  end: 95
}, {
  start: 85,
  end: 150
}, {
  start: 130,
  end: 200
}, {
  start: 90,
  end: 170
}, {}, {
  start: 60,
  end: 90
}];

exports.top_shares = function (req, res, next) {
  var limit = req.body.limit || 10;
  var ep = new eventproxy();
  ep.fail(next);

  Share.paginate({}, null, {
    sort: {
      lastupdate: -1
    },
    skip: 0,
    limit: limit
  }, ep.done(function (shares) {
    async.mapLimit(shares, 3, function (share, callback) {
      Designer.findOne({
        _id: share.designerid
      }, {
        _id: 1,
        username: 1,
        imageid: 1
      }, function (err, designer_indb) {
        var s = share.toObject();
        s.designer = designer_indb;
        callback(err, s);
      });
    }, ep.done(function (results) {
      var latest_scenes = [];
      for (var i = 0; i < 30; i++) {
        var temp = {};
        temp.username = _.sample(names) + _.sample(sexs);
        temp.house_type = _.sample(house_types);
        var rang = house_areas[temp.house_type];
        temp.house_area = _.random(rang.start, rang.end);
        latest_scenes.push(temp);
      }

      res.sendData({
        shares: results,
        latest_scenes: latest_scenes
      });
    }));
  }));
}
