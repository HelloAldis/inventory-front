var eventproxy = require('eventproxy');
var User = require('lib/proxy').User;
var Comment = require('lib/proxy').Comment;
var Designer = require('lib/proxy').Designer;
var Process = require('lib/proxy').Process;
var Supervisor = require('lib/proxy').Supervisor;
var Diary = require('lib/proxy').Diary;
var async = require('async');
var ApiUtil = require('lib/common/api_util');
var type = require('lib/type/type');
var message_util = require('lib/common/message_util');

exports.add_comment = function (req, res, next) {
  var userid = ApiUtil.getUserid(req);
  var comment = ApiUtil.buildComment(req);
  comment.by = userid;
  comment.usertype = ApiUtil.getUsertype(req);
  comment.date = new Date().getTime();

  var ep = eventproxy();
  ep.fail(next);

  ep.on('valid', function () {
    Comment.newAndSave(comment, ep.done(function (comment_indb) {
      res.sendSuccessMsg();
      if (comment_indb && comment_indb.section && comment_indb.item && comment_indb.topictype === type.topic_type_process_item) {
        Process.addCommentCount(comment_indb.topicid, comment_indb.section, comment_indb.item, function () {});
      }

      if (comment_indb.topictype === type.topic_type_diary) {
        Diary.incOne({
          _id: comment_indb.topicid
        }, {
          comment_count: 1
        });
      }

      if (comment.to_userid && comment.by.toString() !== comment.to_userid.toString()) {
        // 评论给业主，而且不是给自己
        if (comment_indb.usertype === type.role_user) {
          // 发评论的是业主
          User.findOne({
            _id: userid
          }, {
            username: 1
          }, function (err, user) {
            if (comment.topictype === type.topic_type_plan) {
              // 方案里业主评论业主
              // 暂时无此功能
            } else if (comment.topictype === type.topic_type_process_item) {
              // 工地里业主评论业主
              // 暂时无此功能
            } else if (comment.topictype === type.topic_type_diary) {
              // 日记里业主评论业主
              message_util.user_message_type_comment_diary(comment_indb, user.username);
            }
          });
        } else if (comment_indb.usertype === type.role_designer) {
          // 发评论的是设计师
          Designer.findOne({
            _id: userid
          }, {
            username: 1
          }, function (err, designer) {
            if (comment.topictype === type.topic_type_plan) {
              // 方案里设计师评论业主
              message_util.user_message_type_comment_plan(comment_indb, designer.username);
            } else if (comment.topictype === type.topic_type_process_item) {
              // 工地里设计师评论业主
              message_util.user_message_type_comment_process_item(comment_indb, designer.username);
            } else if (comment.topictype === type.topic_type_diary) {
              // 日记里设计师评论业主
              // 暂时无此功能, 之后可以加上
            }
          });
        } else if (comment_indb.usertype === type.role_supervisor) {
          // 发评论的是监理
          Supervisor.findOne({
            _id: userid
          }, {
            username: 1
          }, function (err, supervisor) {
            if (comment.topictype === type.topic_type_plan) {
              // 方案里监理评论业主
              // 暂时无此功能
            } else if (comment.topictype === type.topic_type_process_item) {
              // 工地里监理评论业主
              message_util.user_message_type_comment_process_item(comment_indb, supervisor.username);
            } else if (comment.topictype === type.topic_type_diary) {
              // 日记里监理评论业主
              // 暂时无此功能
            }
          });
        }
      }

      if (comment.to_designerid && comment.by.toString() !== comment.to_designerid.toString()) {
        // 评论给设计师，而且不是给自己
        if (comment_indb.usertype === type.role_user) {
          // 发评论的是业主
          User.findOne({
            _id: userid
          }, {
            username: 1
          }, function (err, user) {
            if (comment.topictype === type.topic_type_plan) {
              // 方案里业主评论设计师
              message_util.designer_message_type_comment_plan(comment_indb, user.username);
            } else if (comment.topictype === type.topic_type_process_item) {
              // 工地里业主评论设计师
              message_util.designer_message_type_comment_process_item(comment_indb, user.username);
            } else if (comment.topictype === type.topic_type_diary) {
              // 日记里业主评论设计师
              // 暂时无此功能，之后可以加上
            }
          });
        } else if (comment_indb.usertype === type.role_designer) {
          // 发评论的是设计师
          Designer.findOne({
            _id: userid
          }, {
            username: 1
          }, function () {
            if (comment.topictype === type.topic_type_plan) {
              // 方案里设计师评论设计师
              // 暂时无此功能
            } else if (comment.topictype === type.topic_type_process_item) {
              // 工地里设计师评论设计师
              // 暂时无此功能
            } else if (comment.topictype === type.topic_type_diary) {
              // 日记里设计师评论设计师
              // 暂时无此功能
            }
          });
        } else if (comment_indb.usertype === type.role_supervisor) {
          // 发评论的是监理
          Supervisor.findOne({
            _id: userid
          }, {
            username: 1
          }, function (err, supervisor) {
            if (comment.topictype === type.topic_type_plan) {
              // 方案里监理评论设计师
              // 暂时无此功能
            } else if (comment.topictype === type.topic_type_process_item) {
              // 工地里监理评论设计师
              message_util.designer_message_type_comment_process_item(comment_indb, supervisor.username);
            } else if (comment.topictype === type.topic_type_diary) {
              // 日记里监理评论设计师
              // 暂时无此功能
            }
          });
        }
      }
    }));
  });

  if (comment.topictype === type.topic_type_diary) {
    Diary.findOne({
      _id: comment.topicid
    }, {
      _id: 1
    }, ep.done(function (diary) {
      if (diary) {
        // 如果日记存在，评论成功
        ep.emit('valid');
      } else {
        // 日记不存在，评论失败,
        res.sendErrMsg('无法评论，日记已被删除！');
      }
    }));
  } else {
    //非日记不用验证
    ep.emit('valid');
  }
}

exports.topic_comments = function (req, res, next) {
  var ep = eventproxy();
  ep.fail(next);
  var topicid = req.body.topicid;
  var section = req.body.section;
  var item = req.body.item;
  var skip = req.body.from || 0;
  var limit = req.body.limit || 10;

  Comment.paginate({
    topicid: topicid,
    section: section,
    item: item
  }, null, {
    skip: skip,
    limit: limit,
    sort: {
      date: -1
    },
    lean: true
  }, ep.done(function (comments, total) {
    async.mapLimit(comments, 3, function (comment, callback) {
      if (comment.usertype === type.role_user) {
        User.findOne({
          _id: comment.by
        }, {
          imageid: 1,
          username: 1
        }, function (err, user) {
          comment.byUser = user;
          callback(err, comment);
        });
      } else if (comment.usertype === type.role_designer) {
        Designer.findOne({
          _id: comment.by
        }, {
          imageid: 1,
          username: 1
        }, function (err, designer) {
          comment.byUser = designer;
          comment.byDesigner = designer;
          callback(err, comment);
        });
      } else if (comment.usertype === type.role_supervisor) {
        Supervisor.findOne({
          _id: comment.by
        }, {
          imageid: 1,
          username: 1
        }, function (err, supervisor) {
          comment.bySupervisor = supervisor;
          callback(err, comment);
        });
      }
    }, ep.done(function (results) {
      res.sendData({
        comments: results,
        total: total
      });
    }));
  }));
}
