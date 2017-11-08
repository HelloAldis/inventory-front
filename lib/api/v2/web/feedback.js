'use strict';

const eventproxy = require('eventproxy');
const Feedback = require('lib/proxy').Feedback;
const User = require('lib/proxy').User;
const Designer = require('lib/proxy').Designer;
const async = require('async');
const type = require('lib/type/type');
const tools = require('lib/common/tools');
const reg_util = require('lib/common/reg_util');

exports.search = function (req, res, next) {
  let query = req.body.query || {};
  let sort = req.body.sort || {
    create_at: -1
  };
  let skip = req.body.from || 0;
  let limit = req.body.limit || 10;
  let search_word = req.body.search_word;
  if (search_word && search_word.trim().length > 0) {
    if (tools.isValidObjectId(search_word)) {
      query['$or'] = [{
        _id: search_word
      }, {
        by: search_word
      }];
    } else {
      search_word = reg_util.reg(tools.trim(search_word), 'i');
      query['$or'] = [{
        content: search_word
      }];
    }
  }
  let ep = eventproxy();
  ep.fail(next);

  Feedback.paginate(query, null, {
    sort: sort,
    skip: skip,
    limit: limit
  }, ep.done(function (feedbacks, total) {
    async.mapLimit(feedbacks, 3, function (feedback, callback) {
      if (feedback.usertype === type.role_user) {
        User.findOne({
          _id: feedback.by
        }, {
          username: 1,
          phone: 1
        }, function (err, user) {
          feedback = feedback.toObject();
          feedback.user = user;
          callback(err, feedback);
        });
      } else if (feedback.usertype === type.role_designer) {
        Designer.findOne({
          _id: feedback.by
        }, {
          username: 1,
          phone: 1
        }, function (err, designer) {
          feedback = feedback.toObject();
          feedback.user = designer;
          callback(err, feedback);
        });
      } else {
        callback(null, feedback);
      }
    }, ep.done(function (results) {
      res.sendData({
        requirements: results,
        total: total
      });
    }));
  }));
}
