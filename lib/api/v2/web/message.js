var eventproxy = require('eventproxy');
var User = require('lib/proxy').User;
var UserMessage = require('lib/proxy').UserMessage;
var Designer = require('lib/proxy').Designer;
var DesignerMessage = require('lib/proxy').DesignerMessage;
var Plan = require('lib/proxy').Plan;
var Process = require('lib/proxy').Process;
var Requirement = require('lib/proxy').Requirement;
var Reschedule = require('lib/proxy').Reschedule;
var Diary = require('lib/proxy').Diary;
var DiarySet = require('lib/proxy').DiarySet;
var async = require('async');
var ApiUtil = require('lib/common/api_util');
var type = require('lib/type/type');

exports.search_user_message = function (req, res, next) {
  var query = req.body.query || {};
  var skip = req.body.from || 0;
  var limit = req.body.limit || 10;
  var sort = req.body.sort || {
    create_at: -1
  }
  query.userid = ApiUtil.getUserid(req);
  var ep = eventproxy();
  ep.fail(next);

  UserMessage.paginate(query, {
    title: 1,
    content: 1,
    status: 1,
    message_type: 1,
    create_at: 1,
    processid: 1,
    requirementid: 1,
    section: 1
  }, {
    skip: skip,
    limit: limit,
    sort: sort,
    lean: true
  }, ep.done(function (messages, total) {
    async.mapLimit(messages, 3, function (message, callback) {
      if ([type.user_message_type_designer_reschedule,
          type.user_message_type_designer_ok_reschedule,
          type.user_message_type_designer_reject_reschedule,
          type.user_message_type_procurement,
          type.user_message_type_pay,
          type.user_message_type_ys
        ].indexOf(message.message_type) > -1) {
        Process.findOne({
          _id: message.processid
        }, {
          cell: 1,
          basic_address: 1,
          sections: 1
        }, function (err, process) {
          message.process = process;
          callback(err, message);
        });
      } else if ([type.user_message_type_designer_respond,
          type.user_message_type_designer_reject,
          type.user_message_type_designer_upload_plan,
          type.user_message_type_designer_config_contract,
          type.user_message_type_designer_remind_ok_house_checked
        ].indexOf(message.message_type) > -1) {
        Requirement.findOne({
          _id: message.requirementid
        }, {
          cell: 1,
          basic_address: 1
        }, function (err, requirement) {
          message.requirement = requirement;
          callback(err, message);
        });
      } else {
        callback(null, message);
      }

    }, ep.done(function (messages) {
      res.sendData({
        list: messages,
        total: total
      });
    }));
  }));
}

exports.search_user_comment = function (req, res, next) {
  var query = req.body.query || {};
  var skip = req.body.from || 0;
  var limit = req.body.limit || 10;
  var sort = req.body.sort || {
    create_at: -1
  }
  query.userid = ApiUtil.getUserid(req);
  query.message_type = query.message_type || {
    $in: [type.user_message_type_comment_plan, type.user_message_type_comment_diary]
  }
  var ep = eventproxy();
  ep.fail(next);

  UserMessage.paginate(query, null, {
    skip: skip,
    limit: limit,
    sort: sort,
    lean: true
  }, ep.done(function (messages, total) {
    async.mapLimit(messages, 3, function (message, callback) {
      if (message.message_type === type.user_message_type_comment_plan) {
        Designer.findOne({
          _id: message.designerid
        }, {
          username: 1,
          imageid: 1
        }, function (err, designer) {
          message.designer = designer;
          callback(err, message);
        });
      } else if (message.message_type === type.user_message_type_comment_diary) {
        Diary.findOne({
          _id: message.topicid
        }, {
          diarySetid: 1,
          authorid: 1
        }, function (err, diary) {
          async.parallel({
            user: function (callback) {
              User.findOne({
                _id: message.byUserid
              }, {
                username: 1,
                imageid: 1
              }, callback);
            },
            diarySet: function (callback) {
              DiarySet.findOne({
                _id: diary.diarySetid
              }, {
                title: 1
              }, callback);
            },
            author: function (callback) {
              User.findOne({
                _id: diary.authorid
              }, {
                username: 1
              }, callback);
            }
          }, function (err, result) {
            message.user = result.user;
            message.diarySet = result.diarySet;
            message.author = result.author;
            callback(err, message);
          });
        });
      } else {
        callback(null, message);
      }
    }, ep.done(function (messages) {
      res.sendData({
        list: messages,
        total: total
      });

      query.status = type.message_status_unread;
      UserMessage.setSome(query, {
        status: type.message_status_readed
      }, {}, function () {});
    }));
  }));
}

exports.unread_user_message_count = function (req, res, next) {
  var userid = ApiUtil.getUserid(req);
  var query_array = req.body.query_array;
  var ep = eventproxy();
  ep.fail(next);

  async.mapLimit(query_array, 3, function (query, callback) {
    var q = {};
    q.userid = userid;
    q.status = type.message_status_unread;
    q.message_type = {
      $in: query
    };
    UserMessage.count(q, callback);
  }, ep.done(function (count_array) {
    res.sendData(count_array);
  }));
}

exports.user_message_detail = function (req, res, next) {
  var userid = ApiUtil.getUserid(req);
  var messageid = req.body.messageid;
  var ep = eventproxy();
  ep.fail(next);

  UserMessage.findOne({
    _id: messageid,
    userid: userid
  }, null, ep.done(function (message) {
    if ([type.user_message_type_designer_ok_reschedule,
        type.user_message_type_designer_reject_reschedule,
        type.user_message_type_procurement,
        type.user_message_type_pay,
        type.user_message_type_ys
      ].indexOf(message.message_type) > -1) {
      Process.findOne({
        _id: message.processid
      }, {
        cell: 1,
        basic_address: 1,
        sections: 1
      }, ep.done(function (process) {
        message = message.toObject();
        message.process = process;
        res.sendData(message);
      }));
    } else if ([type.user_message_type_designer_respond,
        type.user_message_type_designer_reject,
        type.user_message_type_designer_config_contract
      ].indexOf(message.message_type) > -1) {
      Requirement.findOne({
        _id: message.requirementid
      }, {
        cell: 1,
        basic_address: 1,
        status: 1,
        work_type: 1
      }, ep.done(function (requirement) {
        message = message.toObject();
        message.requirement = requirement;
        res.sendData(message);
      }));
    } else if (type.user_message_type_designer_reschedule === message.message_type) {
      async.parallel({
        process: function (callback) {
          Process.findOne({
            _id: message.processid
          }, {
            cell: 1,
            basic_address: 1,
            sections: 1
          }, callback);
        },
        reschedule: function (callback) {
          Reschedule.findOne({
            _id: message.rescheduleid
          }, null, callback);
        }
      }, ep.done(function (result) {
        message = message.toObject();
        message.process = result.process;
        message.reschedule = result.reschedule;
        res.sendData(message);
      }));
    } else if ([type.user_message_type_designer_upload_plan,
        type.user_message_type_designer_remind_ok_house_checked
      ].indexOf(message.message_type) > -1) {
      async.parallel({
        requirement: function (callback) {
          Requirement.findOne({
            _id: message.requirementid
          }, {
            cell: 1,
            basic_address: 1,
            status: 1,
            dec_type: 1,
            cell_phase: 1,
            house_area: 1,
            work_type: 1,
            house_type: 1,
            package_type: 1
          }, callback);
        },
        plan: function (callback) {
          Plan.findOne({
            _id: message.planid
          }, null, callback);
        }
      }, ep.done(function (result) {
        message = message.toObject();
        message.requirement = result.requirement;
        message.plan = result.plan;
        res.sendData(message);
      }));
    } else {
      res.sendData(message);
    }

    UserMessage.setOne({
      _id: messageid,
      userid: userid
    }, {
      status: type.message_status_readed
    }, function () {});
  }));
}

exports.read_user_message = function (req, res, next) {
  var userid = ApiUtil.getUserid(req);
  var messageid = req.body.messageid;
  var ep = eventproxy();
  ep.fail(next);

  UserMessage.setOne({
    _id: messageid,
    userid: userid
  }, {
    status: type.message_status_readed
  }, ep.done(function () {
    res.sendSuccessMsg();
  }));
}

exports.delete_user_message = function (req, res, next) {
  var userid = ApiUtil.getUserid(req);
  var messageid = req.body.messageid;
  var ep = eventproxy();
  ep.fail(next);

  UserMessage.removeOne({
    _id: messageid,
    userid: userid
  }, null, ep.done(function () {
    res.sendSuccessMsg();
  }));
}

exports.search_designer_message = function (req, res, next) {
  var query = req.body.query || {};
  var skip = req.body.from || 0;
  var limit = req.body.limit || 10;
  var sort = req.body.sort || {
    create_at: -1
  }
  query.designerid = ApiUtil.getUserid(req);
  var ep = eventproxy();
  ep.fail(next);

  DesignerMessage.paginate(query, {
    title: 1,
    content: 1,
    status: 1,
    message_type: 1,
    create_at: 1,
    section: 1,
    requirementid: 1,
    processid: 1
  }, {
    skip: skip,
    limit: limit,
    sort: sort,
    lean: true
  }, ep.done(function (messages, total) {
    async.mapLimit(messages, 3, function (message, callback) {
      if ([type.designer_message_type_user_reschedule,
          type.designer_message_type_user_reject_reschedule,
          type.designer_message_type_user_ok_reschedule,
          type.designer_message_type_user_ok_process_section
        ].indexOf(message.message_type) > -1) {
        Process.findOne({
          _id: message.processid
        }, {
          cell: 1,
          basic_address: 1,
          sections: 1
        }, function (err, process) {
          message.process = process;
          callback(err, message);
        });
      } else if ([type.designer_message_type_user_order,
          type.designer_message_type_user_ok_house_checked,
          type.designer_message_type_user_unfinal_plan,
          type.designer_message_type_user_final_plan,
          type.designer_message_type_user_ok_contract
        ].indexOf(message.message_type) > -1) {
        Requirement.findOne({
          _id: message.requirementid
        }, {
          cell: 1,
          basic_address: 1
        }, function (err, requirement) {
          message.requirement = requirement;
          callback(err, message);
        });
      } else {
        callback(null, message);
      }
    }, ep.done(function (messages) {
      res.sendData({
        list: messages,
        total: total
      });
    }));
  }));
}

exports.designer_message_detail = function (req, res, next) {
  var designerid = ApiUtil.getUserid(req);
  var messageid = req.body.messageid;
  var ep = eventproxy();
  ep.fail(next);

  DesignerMessage.findOne({
    _id: messageid,
    designerid: designerid
  }, null, ep.done(function (message) {
    if ([type.designer_message_type_user_reject_reschedule,
        type.designer_message_type_user_ok_reschedule,
        type.designer_message_type_user_ok_process_section
      ].indexOf(message.message_type) > -1) {
      Process.findOne({
        _id: message.processid
      }, {
        cell: 1,
        basic_address: 1,
        sections: 1
      }, ep.done(function (process) {
        message = message.toObject();
        message.process = process;
        res.sendData(message);
      }));
    } else if ([type.designer_message_type_user_ok_house_checked,
        type.designer_message_type_user_ok_contract
      ].indexOf(message.message_type) > -1) {
      Requirement.findOne({
        _id: message.requirementid
      }, {
        cell: 1,
        basic_address: 1,
        status: 1
      }, ep.done(function (requirement) {
        message = message.toObject();
        message.requirement = requirement;
        res.sendData(message);
      }));
    } else if (type.designer_message_type_user_reschedule === message.message_type) {
      async.parallel({
        process: function (callback) {
          Process.findOne({
            _id: message.processid
          }, {
            cell: 1,
            basic_address: 1,
            sections: 1
          }, callback);
        },
        reschedule: function (callback) {
          Reschedule.findOne({
            _id: message.rescheduleid
          }, null, callback);
        }
      }, ep.done(function (result) {
        message = message.toObject();
        message.process = result.process;
        message.reschedule = result.reschedule;
        res.sendData(message);
      }));
    } else if (type.designer_message_type_user_order === message.message_type) {
      async.parallel({
        requirement: function (callback) {
          Requirement.findOne({
            _id: message.requirementid
          }, null, callback);
        },
        plan: function (callback) {
          Plan.findOne({
            _id: message.planid
          }, {
            status: 1
          }, callback);
        },
        user: function (callback) {
          User.findOne({
            _id: message.userid
          }, {
            username: 1,
            phone: 1
          }, callback);
        }
      }, ep.done(function (result) {
        message = message.toObject();
        message.requirement = result.requirement;
        message.plan = result.plan;
        message.user = result.user;
        res.sendData(message);
      }));
    } else if ([type.designer_message_type_user_unfinal_plan,
        type.designer_message_type_user_final_plan
      ].indexOf(message.message_type) > -1) {
      async.parallel({
        requirement: function (callback) {
          Requirement.findOne({
            _id: message.requirementid
          }, {
            cell: 1,
            basic_address: 1,
            status: 1,
            dec_type: 1,
            cell_phase: 1,
            house_area: 1,
            work_type: 1,
            house_type: 1,
            package_type: 1
          }, callback);
        },
        plan: function (callback) {
          Plan.findOne({
            _id: message.planid
          }, null, callback);
        }
      }, ep.done(function (result) {
        message = message.toObject();
        message.requirement = result.requirement;
        message.plan = result.plan;
        res.sendData(message);
      }));
    } else {
      res.sendData(message);
    }

    DesignerMessage.setOne({
      _id: messageid,
      designerid: designerid
    }, {
      status: type.message_status_readed
    }, function () {});
  }));
}

exports.read_designer_message = function (req, res, next) {
  var designerid = ApiUtil.getUserid(req);
  var messageid = req.body.messageid;
  var ep = eventproxy();
  ep.fail(next);

  DesignerMessage.setOne({
    _id: messageid,
    designerid: designerid
  }, {
    status: type.message_status_readed
  }, ep.done(function () {
    res.sendSuccessMsg();
  }));
}

exports.delete_designer_message = function (req, res, next) {
  var designerid = ApiUtil.getUserid(req);
  var messageid = req.body.messageid;
  var ep = eventproxy();
  ep.fail(next);

  DesignerMessage.removeOne({
    _id: messageid,
    designerid: designerid
  }, null, ep.done(function () {
    res.sendSuccessMsg();
  }));
}

exports.unread_designer_message_count = function (req, res, next) {
  var designerid = ApiUtil.getUserid(req);
  var query_array = req.body.query_array;
  var ep = eventproxy();
  ep.fail(next);

  async.mapLimit(query_array, 3, function (query, callback) {
    var q = {};
    q.designerid = designerid;
    q.status = type.message_status_unread;
    q.message_type = {
      $in: query
    };
    DesignerMessage.count(q, callback);
  }, ep.done(function (count_array) {
    res.sendData(count_array);
  }));
}

exports.search_designer_comment = function (req, res, next) {
  var query = req.body.query || {};
  var skip = req.body.from || 0;
  var limit = req.body.limit || 10;
  var sort = req.body.sort || {
    create_at: -1
  }
  query.designerid = ApiUtil.getUserid(req);
  query.message_type = {
    $in: [type.designer_message_type_comment_plan]
  }
  var ep = eventproxy();
  ep.fail(next);

  DesignerMessage.paginate(query, null, {
    skip: skip,
    limit: limit,
    sort: sort,
    lean: true
  }, ep.done(function (messages, total) {
    async.mapLimit(messages, 3, function (message, callback) {
      User.findOne({
        _id: message.userid
      }, {
        username: 1,
        imageid: 1
      }, function (err, user) {
        message.user = user;
        callback(err, message);
      });
    }, ep.done(function (messages) {
      res.sendData({
        list: messages,
        total: total
      });

      query.status = type.message_status_unread;
      DesignerMessage.setSome(query, {
        status: type.message_status_readed
      }, {}, function () {});
    }));
  }));
}
