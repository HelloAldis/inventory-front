'use strict'

const eventproxy = require('eventproxy');
const User = require('lib/proxy').User;
const Reschedule = require('lib/proxy').Reschedule;
const Requirement = require('lib/proxy').Requirement;
const Process = require('lib/proxy').Process;
const Designer = require('lib/proxy').Designer;
const Plan = require('lib/proxy').Plan;
const tools = require('lib/common/tools');
const _ = require('lodash');
const ApiUtil = require('lib/common/api_util');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const type = require('lib/type/type');
const async = require('async');
const logger = require('lib/common/logger');
const message_util = require('lib/common/message_util');
const process_business = require('lib/business/process_business');

exports.start = function (req, res, next) {
  let requirementid = req.body.requirementid;
  let ep = eventproxy();
  ep.fail(next);

  if ([requirementid].some(function (item) {
      return !item ? true : false;
    })) {
    res.sendErrMsg('信息不完整。')
    return;
  }

  async.waterfall([
    function (callback) {
      Requirement.setOne({
        _id: requirementid,
        status: type.requirement_status_config_contract
      }, {
        status: type.requirement_status_config_process
      }, null, callback);
    },
    function (requirement, callback) {
      Plan.findOne({
        _id: requirement.final_planid
      }, {
        duration: 1
      }, function (err, plan) {
        callback(err, requirement, plan)
      });
    }
  ], ep.done(function (requirement, plan) {
    if (requirement && plan) {
      let process = {};
      process.final_designerid = requirement.final_designerid;
      process.final_planid = requirement.final_planid;
      process.requirementid = requirement._id;
      process.province = requirement.province;
      process.city = requirement.city;
      process.district = requirement.district;
      process.cell = requirement.cell;
      process.basic_address = requirement.basic_address;
      process.detail_address = requirement.detail_address;
      process.house_type = requirement.house_type;
      process.business_house_type = requirement.business_house_type;
      process.house_area = requirement.house_area;
      process.dec_style = requirement.dec_style;
      process.work_type = requirement.work_type;
      process.total_price = requirement.total_price;
      process.start_at = requirement.start_at;
      process.dec_type = requirement.dec_type;
      process.duration = plan.duration;

      process.userid = requirement.userid;
      process.going_on = type.process_section_kai_gong;

      if (process.dec_type === type.dec_type_home) {
        process.sections = process_business.getSections(process_business.home_process_workflow, process_business.home_process_60_template,
          process.duration, process.start_at);
      } else {
        process.sections = process_business.getSections(process_business.business_process_workflow, process_business.home_process_60_template,
          process.duration, process.start_at);

        //默认开启所有工序
        for (let section of process.sections) {
          section.status = type.process_item_status_going;
        }
      }

      logger.debug(process);
      Process.newAndSave(process, ep.done(function (process_indb) {
        res.sendData(process_indb);

        async.parallel({
          user: function (callback) {
            User.findOne({
              _id: requirement.userid
            }, {
              username: 1
            }, callback);
          },
          designer: function (callback) {
            Designer.findOne({
              _id: requirement.final_designerid
            }, {
              username: 1
            }, callback);
          }
        }, function (err, result) {
          if (!err && result.user && result.designer) {
            message_util.designer_message_type_user_ok_contract(result.user, result.designer, requirement);
          }
        });
      }));
    } else {
      res.sendErrMsg('配置工地失败');
    }
  }));
}

exports.addImage = function (req, res, next) {
  let section = tools.trim(req.body.section);
  let item = tools.trim(req.body.item);
  let imageid = new ObjectId(req.body.imageid);
  let _id = req.body._id;
  let ep = eventproxy();
  ep.fail(next);

  Process.addImage(_id, section, item, imageid, ep.done(function (process) {

    if (process) {
      let s = _.find(process.sections, function (o) {
        return o.name === section;
      });
      if (s) {
        let i = _.find(s.items, function (o) {
          return o.name === item;
        });

        if (i && i.status === type.process_item_status_new) {
          Process.updateStatus(_id, section, item, type.process_item_status_going,
            function () {});
        }
      }
    }
    res.sendSuccessMsg();
  }));
};

exports.add_images = function (req, res, next) {
  let section = tools.trim(req.body.section);
  let item = tools.trim(req.body.item);
  let images = req.body.images || [];
  images = images.map(function (o) {
    return new ObjectId(o);
  });
  let _id = req.body._id;
  let ep = eventproxy();
  ep.fail(next);

  Process.add_images(_id, section, item, images, ep.done(function (process) {

    if (process) {
      let s = _.find(process.sections, function (o) {
        return o.name === section;
      });
      if (s) {
        let i = _.find(s.items, function (o) {
          return o.name === item;
        });

        if (i && i.status === type.process_item_status_new) {
          Process.updateStatus(_id, section, item, type.process_item_status_going,
            function () {});
        }
      }
    }
    res.sendSuccessMsg();
  }));
};

exports.delete_image = function (req, res, next) {
  let section = tools.trim(req.body.section);
  let item = tools.trim(req.body.item);
  let index = req.body.index;
  let _id = req.body._id;
  let ep = eventproxy();
  ep.fail(next);

  Process.deleteImage(_id, section, item, index, ep.done(function () {
    res.sendSuccessMsg();
  }));
};

exports.addYsImage = function (req, res, next) {
  if (!req.body.imageid) {
    return res.sendErrMsg('缺少Image');
  }

  let section = tools.trim(req.body.section);
  let key = tools.trim(req.body.key);
  let imageid = new ObjectId(req.body.imageid);
  let _id = req.body._id;
  let ep = eventproxy();
  ep.fail(next);

  Process.updateYsImage(_id, section, key, imageid, ep.done(function (process) {
    if (process) {
      res.sendSuccessMsg();
    } else {
      //没有更新的 创建新的
      Process.addYsImage(_id, section, key, imageid, ep.done(function () {
        res.sendSuccessMsg();
      }));
    }
  }));
}

exports.deleteYsImage = function (req, res, next) {
  let section = tools.trim(req.body.section);
  let key = tools.trim(req.body.key);
  let _id = req.body._id;
  let ep = eventproxy();
  ep.fail(next);

  Process.deleteYsImage(_id, section, key, ep.done(function () {
    res.sendSuccessMsg();
  }));
};

exports.reschedule = function (req, res, next) {
  let reschedule = ApiUtil.buildReschedule(req);
  let usertype = ApiUtil.getUsertype(req);
  reschedule.request_role = usertype;
  reschedule.status = type.process_item_status_reschedule_req_new;
  let ep = eventproxy();
  ep.fail(next);

  ep.on('sendMessage', function (process, reschedule_indb) {
    User.findOne({
      _id: reschedule_indb.userid
    }, null, ep.done(function (user) {
      Designer.findOne({
        _id: reschedule_indb.designerid
      }, {
        _id: 1,
        username: 1
      }, ep.done(function (designer) {
        if (usertype === type.role_user) {
          message_util.designer_message_type_user_reschedule(user, designer, reschedule_indb);
        } else if (usertype === type.role_designer) {
          message_util.user_message_type_designer_reschedule(user, designer, reschedule_indb);
        }
      }));
    }));
  });

  Reschedule.findOne({
    processid: reschedule.processid,
    status: type.process_item_status_reschedule_req_new
  }, null, ep.done(function (reschedule_indb) {
    if (reschedule_indb) {
      return res.sendErrMsg('对方已经申请改期！');
    }

    Reschedule.newAndSave(reschedule, ep.done(function (reschedule_indb) {
      if (reschedule_indb) {
        Process.updateStatus(reschedule_indb.processid, reschedule_indb.section,
          null, reschedule_indb.status, ep.done(function (process) {
            res.sendSuccessMsg();
            ep.emit('sendMessage', process, reschedule_indb);
          }));
      } else {
        res.sendErrMsg('无法保存成功');
      }
    }));
  }));
};

exports.listReschdule = function (req, res, next) {
  let userid = ApiUtil.getUserid(req);
  let usertype = ApiUtil.getUsertype(req);
  let query = {};
  let ep = eventproxy();
  ep.fail(next);

  if (usertype === type.role_user) {
    query.userid = userid;
  } else if (usertype === type.role_designer) {
    query.designerid = userid;
  }

  Reschedule.find(query, null, {
    sort: {
      request_date: -1
    }
  }, ep.done(function (reschedules) {
    async.mapLimit(reschedules, 3, function (reschedule, callback) {
      Process.findOne({
        _id: reschedule.processid
      }, {
        cell: 1,
        basic_address: 1
      }, function (err, process) {
        reschedule = reschedule.toObject();
        reschedule.process = process;
        callback(err, reschedule);
      });
    }, ep.done(function (reschedules) {
      res.sendData(reschedules);
    }));
  }));
}

exports.okReschedule = function (req, res, next) {
  let usertype = ApiUtil.getUsertype(req);
  let query = {};
  let userid = ApiUtil.getUserid(req);
  query.processid = req.body.processid;
  query.status = type.process_item_status_reschedule_req_new;
  let ep = eventproxy();
  ep.fail(next);

  ep.on('sendMessage', function (reschedule) {
    User.findOne({
      _id: reschedule.userid
    }, null, ep.done(function (user) {
      Designer.findOne({
        _id: reschedule.designerid
      }, {
        _id: 1,
        username: 1
      }, ep.done(function (designer) {
        if (usertype === type.role_user) {
          message_util.designer_message_type_user_ok_reschedule(user, designer, reschedule)
        } else if (usertype === type.role_designer) {
          message_util.user_message_type_designer_ok_reschedule(user, designer, reschedule);
        }
      }));
    }));
  });

  if (usertype === type.role_user) {
    query.userid = userid;
    query.request_role = type.role_designer;
  } else if (usertype === type.role_designer) {
    query.designerid = userid;
    query.request_role = type.role_user;
  }

  Reschedule.find(query, null, {
    sort: {
      request_date: -1
    },
    skip: 0,
    limit: 1
  }, ep.done(function (reschedules) {
    if (reschedules.length < 1) {
      return res.sendErrMsg('改期不存在');
    }
    let reschedule = reschedules[0];

    let newDate = reschedule.new_date;
    let index = _.indexOf(type.process_work_flow, reschedule.section);
    Process.findOne({
      _id: reschedule.processid
    }, null, ep.done(function (process) {
      if (process) {
        if (process.sections[index].start_at >= newDate) {
          res.sendErrMsg('无法改期到比开始还早');
        } else {
          let diff = newDate - process.sections[index].end_at;
          process.sections[index].end_at = newDate;
          process.sections[index].status = type.process_item_status_reschedule_ok;
          for (let i = index + 1; i < process.sections.length; i++) {
            process.sections[i].start_at += diff;
            process.sections[i].end_at += diff;
          }

          process.save(ep.done(function () {
            res.sendSuccessMsg();
            ep.emit('sendMessage', reschedule);
          }));

          reschedule.status = type.process_item_status_reschedule_ok;
          reschedule.save(function () {});
        }
      } else {
        res.sendErrMsg('工地不存在');
      }
    }));
  }));
}

exports.rejectReschedule = function (req, res, next) {
  let usertype = ApiUtil.getUsertype(req);
  let query = {};
  let userid = ApiUtil.getUserid(req);
  if (!req.body.processid) {
    return res.sendErrMsg('缺少processid');
  }

  query.processid = req.body.processid;
  query.status = type.process_item_status_reschedule_req_new;
  let ep = eventproxy();
  ep.fail(next);

  ep.on('sendMessage', function (reschedule) {
    User.findOne({
      _id: reschedule.userid
    }, null, ep.done(function (user) {
      Designer.findOne({
        _id: reschedule.designerid
      }, {
        _id: 1,
        username: 1
      }, ep.done(function (designer) {
        if (usertype === type.role_user) {
          message_util.designer_message_type_user_reject_reschedule(user, designer, reschedule);
        } else if (usertype === type.role_designer) {
          message_util.user_message_type_designer_reject_reschedule(user, designer, reschedule);
        }
      }));
    }));
  });

  if (usertype === type.role_user) {
    query.userid = userid;
    query.request_role = type.role_designer;
  } else if (usertype === type.role_designer) {
    query.designerid = userid;
    query.request_role = type.role_user;
  }

  Reschedule.setOne(query, {
    status: type.process_item_status_reschedule_reject
  }, {
    sort: {
      request_date: -1
    }
  }, ep.done(function (reschedule) {
    if (!reschedule) {
      return res.sendErrMsg('改期不存在');
    }

    Process.updateStatus(query.processid, reschedule.section, null,
      type.process_item_status_reschedule_reject,
      ep.done(function () {
        res.sendSuccessMsg();
        ep.emit('sendMessage', reschedule);
      }));
  }));
}

exports.doneItem = function (req, res, next) {
  let section = tools.trim(req.body.section);
  let item = tools.trim(req.body.item);
  let _id = req.body._id;
  let ep = eventproxy();
  ep.fail(next);

  if (!item) {
    return res.sendErrMsg('item 不能空')
  }

  Process.updateStatus(_id, section, item, type.process_item_status_done,
    ep.done(function (process) {
      if (process) {
        //push notification
        if (section === type.process_section_kai_gong || section === type.process_section_chai_gai) {
          let result = _.find(process.sections, function (o) {
            return o.name === section;
          });
          let doneCount = 0;
          _.forEach(result.items, function (e) {
            if (e.status === type.process_item_status_done) {
              doneCount += 1;
            }
          });

          //开工拆改 开启下个流程
          if (result.items.length - doneCount <= 1) {
            let index = _.indexOf(type.process_work_flow, section);
            let next = type.process_work_flow[index + 1];
            //结束当前工序
            Process.updateStatus(_id, section, null, type.process_item_status_done, ep.done(function () {
              if (process.sections[index + 1].status === type.process_item_status_done) {
                // 如果下个工序已完工，就不开工它
                res.sendSuccessMsg();
              } else {
                Process.updateStatus(_id, next, null, type.process_item_status_going, ep.done(function () {
                  res.sendSuccessMsg();
                }));
              }

              if (process.work_type === type.work_type_half && next === type.process_section_shui_dian) {
                message_util.user_message_type_procurement(process, next);
              }
            }));
          } else {
            res.sendSuccessMsg();
          }
        } else {
          res.sendSuccessMsg();
        }
      } else {
        res.sendSuccessMsg();
      }
    }));
};

exports.doneSection = function (req, res, next) {
  let section = tools.trim(req.body.section);
  let _id = req.body._id;
  let ep = eventproxy();
  ep.fail(next);

  Process.updateStatus(_id, section, null, type.process_item_status_done,
    ep.done(function (process) {
      if (process) {
        if ([type.process_section_shui_dian, type.process_section_ni_mu, type.process_section_jun_gong].indexOf(section) > -1) {
          message_util.user_message_type_pay(process, section);
        }

        User.findOne({
          _id: process.userid
        }, {
          username: 1,
          phone: 1
        }, ep.done(function (user) {
          message_util.designer_message_type_user_ok_process_section(user, process, section);
        }));
      }

      //开启下个流程
      let index = _.indexOf(type.process_work_flow, section);
      let next = type.process_work_flow[index + 1];
      if (next) {
        if (next === type.process_section_done) {
          Requirement.setOne({
            _id: process.requirementid
          }, {
            status: type.requirement_status_done_process
          }, null, ep.done(function () {
            process.going_on = next;
            process.save(ep.done(function () {
              res.sendSuccessMsg();
            }));
          }));
        } else {
          if (process.sections[index + 1].status === type.process_item_status_done) {
            // 如果下个工序已完工 ＝，就不开工它
            res.sendSuccessMsg();
          } else {
            Process.updateStatus(_id, next, null, type.process_item_status_going, ep.done(function () {
              res.sendSuccessMsg();
            }));
          }

          if (process.work_type === type.work_type_half && [type.process_section_shui_dian, type.process_section_ni_mu,
              type.process_section_you_qi, type.process_section_an_zhuang
            ].indexOf(next) > -1) {
            message_util.user_message_type_procurement(process, next);
          }
        }
      } else {
        res.sendSuccessMsg();
      }
    }));
};

exports.getOne = function (req, res, next) {
  let _id = req.params._id;
  let ep = eventproxy();
  ep.fail(next);

  Process.findOne({
    _id: _id
  }, null, ep.done(function (process) {
    if (process) {
      Reschedule.findOne({
        processid: _id,
        status: type.process_item_status_reschedule_req_new
      }, ep.done(function (reschedule) {
        if (reschedule) {
          let index = _.indexOf(type.process_work_flow,
            reschedule.section);
          process = process.toObject();
          process.sections[index].reschedule = reschedule;
          res.sendData(process);
        } else {
          res.sendData(process);
        }
      }));
    } else {
      res.sendErrMsg('工地不存在')
    }
  }));
}

exports.list = function (req, res, next) {
  let userid = ApiUtil.getUserid(req);
  let usertype = ApiUtil.getUsertype(req);
  let ep = eventproxy();
  ep.fail(next);

  ep.on('processes', function (processes) {
    async.mapLimit(processes, 3, function (process, callback) {
      async.parallel({
        user: function (callback) {
          User.findOne({
            _id: process.userid
          }, {
            username: 1,
            imageid: 1,
            phone: 1
          }, callback);
        },
        plan: function (callback) {
          Plan.findOne({
            _id: process.final_planid
          }, null, callback)
        },
        requirement: function (callback) {
          Requirement.findOne({
            _id: process.requirementid
          }, null, callback);
        }
      }, function (err, result) {
        process.user = result.user;
        process.plan = result.plan;
        process.requirement = result.requirement;
        callback(err, process);
      });

    }, ep.done(function (results) {
      res.sendData(results);
    }));
  });

  let query = {};
  if (usertype === type.role_user) {
    query.userid = userid;
  } else if (usertype === type.role_designer) {
    query.final_designerid = userid;
  } else if (usertype === type.role_supervisor) {
    query.supervisorids = userid;
  }

  Process.find(query, {
    final_designerid: 1,
    userid: 1,
    city: 1,
    district: 1,
    cell: 1,
    basic_address: 1,
    going_on: 1,
    final_planid: 1,
    requirementid: 1,
    lastupdate: 1,
    start_at: 1,
    sections: 1
  }, {
    lean: true,
    sort: {
      start_at: -1
    }
  }, ep.done(function (processes) {
    ep.emit('processes', processes);
  }));
}

exports.ys = function (req, res, next) {
  let section = tools.trim(req.body.section);
  let _id = req.body._id;
  let ep = eventproxy();
  ep.fail(next);

  Process.findOne({
    _id: _id
  }, null, ep.done(function (process) {
    if (process) {
      message_util.user_message_type_ys(process, section);
    }

    res.sendSuccessMsg();
  }));
}
