'use strict';

const eventproxy = require('eventproxy');
const User = require('lib/proxy').User;
const Plan = require('lib/proxy').Plan;
const Requirement = require('lib/proxy').Requirement;
const Designer = require('lib/proxy').Designer;
const Comment = require('lib/proxy').Comment;
const tools = require('lib/common/tools');
const _ = require('lodash');
const async = require('async');
const ApiUtil = require('lib/common/api_util');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const type = require('lib/type/type');
const sms = require('lib/common/sms');
const message_util = require('lib/common/message_util');

exports.add = function (req, res, next) {
  let plan = ApiUtil.buildPlan(req);
  let designerid = ApiUtil.getUserid(req);
  let userid = tools.trim(req.body.userid);
  let requirementid = tools.trim(req.body.requirementid);
  let ep = eventproxy();
  ep.fail(next);

  //查找是否有位上传的方案
  Plan.findOne({
    userid: userid,
    designerid: designerid,
    requirementid: requirementid,
    status: type.plan_status_designer_housecheck_no_plan
  }, null, ep.done(function (plan_indb) {
    if (plan_indb) {
      //有已响应但是没上传的方案，直接上传方案到这里
      plan.status = type.plan_status_designer_upload; //修改status为已上传
      plan.last_status_update_time = new Date().getTime();
      let query = {
        userid: userid,
        designerid: designerid,
        requirementid: requirementid,
        status: type.plan_status_designer_housecheck_no_plan
      };

      plan.name = '方案1';
      Plan.setOne(query, plan, null, ep.done(function () {
        Requirement.setOne({
          _id: requirementid,
          status: type.requirement_status_housecheck_no_plan
        }, {
          status: type.requirement_status_plan_not_final
        }, null, ep.done(function () {
          res.sendSuccessMsg();

          // Designer.findOne({
          //   _id: designerid
          // }, {
          //   username: 1,
          //   phone: 1
          // }, function (err, designer) {
          //   User.findOne({
          //     _id: userid
          //   }, {
          //     phone: 1
          //   }, function (err, user) {
          //     message_util.user_message_type_designer_upload_plan(user, designer, plan_indb)
          //     sms.sendDesignerPlanUploaded(user.phone, [
          //       designer.username, designer.phone
          //     ]);
          //   });
          // });
        }));
      }));
    } else {
      //创建新的方案
      Plan.find({
        userid: userid,
        designerid: designerid,
        requirementid: requirementid
      }, null, null, ep.done(function (plans_indb) {
        if (plans_indb.length) {
          let plan_indb = plans_indb[0];
          plan.name = '方案' + (plans_indb.length + 1);
          plan.status = type.plan_status_designer_upload;
          plan.designerid = designerid;
          plan.userid = new ObjectId(userid);
          plan.requirementid = new ObjectId(requirementid);
          plan.house_check_time = plan_indb.house_check_time;
          plan.user_ok_house_check_time = plan_indb.user_ok_house_check_time;
          plan.request_date = plan_indb.request_date;
          plan.get_phone_time = plan_indb.get_phone_time;

          Plan.newAndSave(plan, ep.done(function (plan) {
            res.sendSuccessMsg();

            // async.parallel({
            //   user: function (callback) {
            //     User.findOne({
            //       _id: plan.userid
            //     }, {
            //       username: 1
            //     }, callback);
            //   },
            //   designer: function (callback) {
            //     Designer.findOne({
            //       _id: designerid
            //     }, {
            //       username: 1
            //     }, callback);
            //   }
            // }, function (err, result) {
            //   if (!err && result.user && result.designer) {
            //     message_util.user_message_type_designer_upload_plan(result.user, result.designer, plan);
            //   }
            // });

          }));
        } else {
          res.sendErrMsg('上传方案失败！');
        }
      }));
    }
  }));
};

exports.update = function (req, res, next) {
  let plan = ApiUtil.buildPlan(req);
  let oid = tools.trim(req.body._id);
  let designerid = ApiUtil.getUserid(req);
  let ep = eventproxy();
  ep.fail(next);

  if (oid === '') {
    res.sendErrMsg('信息不完全');
    return;
  }

  Plan.setOne({
    _id: oid,
    designerid: designerid
  }, plan, null, ep.done(function () {
    res.sendSuccessMsg();
  }));
}

exports.delete = function (req, res, next) {
  let oid = tools.trim(req.body._id);
  let designerid = ApiUtil.getUserid(req);
  let ep = eventproxy();
  ep.fail(next);

  if (oid === '') {
    res.sendErrMsg('信息不完全');
    return;
  }

  Plan.removeOne({
    _id: oid,
    designerid: designerid
  }, null, ep.done(function () {
    res.sendSuccessMsg();
  }));
}

exports.user_requirement_plans = function (req, res, next) {
  let requirementid = req.body.requirementid;
  let designerid = req.body.designerid;
  let ep = eventproxy();
  ep.fail(next);
  let query = {};
  query.requirementid = requirementid;
  query.status = {
    $in: [type.plan_status_user_final, type.plan_status_user_not_final,
      type.plan_status_designer_upload
    ]
  };
  if (designerid) {
    query.designerid = designerid;
  }

  Plan.find(query, null, {
    sort: {
      request_date: 1
    }
  }, ep.done(function (plans) {
    async.mapLimit(plans, 3, function (plan, callback) {
      Designer.findOne({
        _id: plan.designerid
      }, {
        username: 1,
        imageid: 1,
        phone: 1
      }, function (err, designer) {
        plan = plan.toObject();
        plan.designer = designer;

        Comment.count({
          topicid: plan._id,
          topictype: type.topic_type_plan
        }, function (err, count) {
          plan.comment_count = count;
          callback(err, plan);
        });
      });
    }, ep.done(function (results) {
      res.sendData(results);
    }));
  }));
}

exports.finalPlan = function (req, res, next) {
  let planid = new ObjectId(req.body.planid);
  let designerid = new ObjectId(req.body.designerid);
  let requirementid = req.body.requirementid;
  let ep = eventproxy();
  ep.fail(next);

  Requirement.setOne({
    _id: requirementid,
    status: type.requirement_status_plan_not_final
  }, {
    final_designerid: designerid,
    final_planid: planid,
    status: type.requirement_status_final_plan
  }, null, ep.done(function (requirement) {
    if (requirement) {
      // 标记未上传方案的设计师都是过期状态
      Plan.update({
        requirementid: requirement._id,
        _id: {
          $ne: planid
        },
        status: {
          $in: [type.plan_status_not_respond, type.plan_status_designer_respond_no_housecheck, type.plan_status_designer_housecheck_no_plan]
        }
      }, {
        status: type.plan_status_designer_expired,
        last_status_update_time: new Date().getTime()
      }, {
        multi: true
      }, function () {});

      // 标记其他方案为未中标
      Plan.update({
        requirementid: requirement._id,
        _id: {
          $ne: planid
        },
        status: type.plan_status_designer_upload
      }, {
        status: type.plan_status_user_not_final,
        last_status_update_time: new Date().getTime()
      }, {
        multi: true
      }, ep.done(function () {
        //标记方案为中标
        Plan.setOne({
          _id: planid,
          userid: requirement.userid,
          status: type.plan_status_designer_upload
        }, {
          status: type.plan_status_user_final,
          last_status_update_time: new Date().getTime()
        }, {}, ep.done(function (plan) {
          if (plan) {
            Designer.incOne({
              _id: designerid
            }, {
              deal_done_count: 1
            }, {});
          }

          res.sendSuccessMsg();

          User.findOne({
              _id: requirement.userid
            }, {
              username: 1,
              phone: 1
            },
            function (err, user) {
              if (user) {
                _.forEach(requirement.order_designerids, function (designerid) {
                  Plan.find({
                    designerid: designerid,
                    requirementid: requirementid
                  }, {
                    status: 1,
                    requirementid: 1
                  }, {
                    skip: 0,
                    limit: 1,
                    sort: {
                      last_status_update_time: -1
                    }
                  }, function (err, plans) {
                    if (plans.length > 0) {
                      Designer.findOne({
                        _id: designerid
                      }, {
                        phone: 1,
                        username: 1
                      }, function (err, designer) {
                        if (plans[0].status === type.plan_status_user_final) {
                          message_util.designer_message_type_user_final_plan(user, designer, plans[0], requirement.work_type);
                          sms.sendDesignerPlanFinaled(
                            designer.phone, [user.username, user.phone]);
                        } else if (plans[0].status === type.plan_status_user_not_final) {
                          message_util.designer_message_type_user_unfinal_plan(user, designer, plans[0]);
                          sms.sendDesignerPlanNotFinaled(
                            designer.phone, [user.username, user.phone]);
                        }
                      });
                    }
                  });
                });
              }
            });
        }));
      }));
    } else {
      res.sendErrMsg('选定失败');
    }
  }));
}

exports.designer_requirement_plans = function (req, res, next) {
  let designerid = ApiUtil.getUserid(req);
  let requirementid = req.body.requirementid;
  let ep = eventproxy();
  ep.fail(next);

  Plan.find({
    designerid: designerid,
    requirementid: requirementid,
    status: {
      $in: [type.plan_status_user_final, type.plan_status_user_not_final,
        type.plan_status_designer_upload
      ]
    }
  }, null, {
    sort: {
      request_date: 1
    }
  }, ep.done(function (plans) {
    async.mapLimit(plans, 3, function (plan, callback) {
      User.findOne({
        _id: plan.userid
      }, {
        username: 1,
        phone: 1,
        imageid: 1
      }, function (err, user) {
        plan = plan.toObject();
        plan.user = user;

        Comment.count({
          topicid: plan._id,
          topictype: type.topic_type_plan
        }, function (err, count) {
          plan.comment_count = count;
          callback(err, plan);
        });
      });
    }, ep.done(function (results) {
      res.sendData(results);
    }));
  }));
}

exports.getOne = function (req, res, next) {
  let query = req.body;
  let ep = eventproxy();
  ep.fail(next);

  Plan.findOne(query, null, ep.done(function (plan) {
    async.parallel([
      function (callback) {
        Designer.findOne({
          _id: plan.designerid
        }, {
          username: 1,
          imageid: 1
        }, callback);
      },
      function (callback) {
        User.findOne({
          _id: plan.userid
        }, {
          username: 1,
          imageid: 1
        }, callback);
      },
      function (callback) {
        Requirement.findOne({
          _id: plan.requirementid
        }, null, callback);
      }
    ], ep.done(function (result) {
      plan = plan.toObject();
      plan.designer = result[0];
      plan.user = result[1];
      plan.requirement = result[2];
      res.sendData(plan);
    }));
  }));
}
