var eventproxy = require('eventproxy');
var User = require('lib/proxy').User;
var Plan = require('lib/proxy').Plan;
var Requirement = require('lib/proxy').Requirement;
var Designer = require('lib/proxy').Designer;
var Process = require('lib/proxy').Process;
var Evaluation = require('lib/proxy').Evaluation;
var ApiUtil = require('lib/common/api_util');
var type = require('lib/type/type');
var async = require('async');

exports.user_my_requirement_list = function (req, res, next) {
  var userid = ApiUtil.getUserid(req);
  var ep = eventproxy();
  ep.fail(next);

  Requirement.find({
    userid: userid
  }, null, {
    sort: {
      create_at: -1
    }
  }, ep.done(function (requirements) {
    if (requirements.length > 0) {
      async.mapLimit(requirements, 3, function (requirement, callback) {
        requirement = requirement.toObject();
        if (requirement.order_designerids && requirement.order_designerids.length > 0) {
          Designer.find({
            _id: {
              $in: requirement.order_designerids
            }
          }, {
            username: 1,
            imageid: 1,
            auth_type: 1,
            tags: 1
          }, null, ep.done(function (designers) {
            async.mapLimit(designers, 3, function (designer, callback) {
              Plan.find({
                designerid: designer._id,
                requirementid: requirement._id
              }, null, {
                skip: 0,
                limit: 1,
                sort: {
                  last_status_update_time: -1
                }
              }, function (err, plans) {
                designer = designer.toObject();
                designer.plan = plans[0];
                callback(err, designer);
              });
            }, ep.done(function (designers) {
              requirement.order_designers = designers;
              callback(null, requirement);
            }));
          }));
        } else if (requirement.rec_designerids && requirement.rec_designerids.length > 0) {
          Designer.find({
            _id: {
              $in: requirement.rec_designerids
            }
          }, {
            username: 1,
            imageid: 1,
            auth_type: 1,
            tags: 1
          }, null, ep.done(function (designers) {
            requirement.rec_designers = designers;
            callback(null, requirement);
          }));
        } else {
          callback(null, requirement);
        }
      }, ep.done(function (requirements) {
        async.mapLimit(requirements, 3, function (requirement, callback) {
          if (requirement.status === type.requirement_status_config_process || requirement.status === type.requirement_status_done_process) {
            Process.findOne({
              requirementid: requirement._id
            }, {
              _id: 1
            }, function (err, process) {
              requirement.process = process;
              callback(err, requirement);
            });
          } else {
            callback(null, requirement);
          }
        }, ep.done(function (requirements) {
          res.sendData(requirements);
        }));
      }));
    } else {
      res.sendData([]);
    }
  }));
}

exports.designer_get_user_requirements = function (req, res, next) {
  var designerid = ApiUtil.getUserid(req);
  var ep = eventproxy();
  ep.fail(next);

  Requirement.find({
    order_designerids: designerid
  }, null, {
    lean: true
  }, ep.done(function (requirements) {
    async.mapLimit(requirements, 3, function (requirement, callback) {
      async.parallel({
        plan: function (callback) {
          Plan.find({
            designerid: designerid,
            requirementid: requirement._id
          }, {
            status: 1,
            request_date: 1,
            house_check_time: 1,
            last_status_update_time: 1,
            reject_respond_msg: 1,
            total_price: 1,
            duration: 1
          }, {
            skip: 0,
            limit: 1,
            sort: {
              last_status_update_time: -1
            },
            lean: true
          }, function (err, plans) {
            callback(err, plans[0]);
          });
        },
        evaluation: function (callback) {
          Evaluation.findOne({
            userid: requirement.userid,
            designerid: designerid,
            requirementid: requirement._id
          }, null, function (err, evaluation) {
            if (evaluation) {
              callback(err, evaluation);
            } else {
              callback(err, undefined);
            }
          });
        },
        user: function (callback) {
          User.findOne({
            _id: requirement.userid
          }, {
            username: 1,
            imageid: 1,
            sex: 1,
            phone: 1
          }, callback);
        }
      }, function (err, result) {
        requirement.user = result.user;
        requirement.evaluation = result.evaluation;
        requirement.plan = result.plan;
        callback(err, requirement);
      });
    }, ep.done(function (requirements) {
      Designer.findOne({
        _id: designerid
      }, {
        username: 1,
        imageid: 1,
        service_attitude: 1,
        respond_speed: 1
      }, ep.done(function (designer) {
        requirements.sort(function (a, b) {
          return b.plan.request_date - a.plan.request_date;
        });
        requirements = requirements.map(function (o) {
          o.designer = designer;
          return o;
        });
        res.sendData(requirements);
      }));
    }));
  }));
}
