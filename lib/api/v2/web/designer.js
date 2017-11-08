"use strict"

const eventproxy = require('eventproxy');
const Designer = require('lib/proxy').Designer;
const Plan = require('lib/proxy').Plan;
const User = require('lib/proxy').User;
const Requirement = require('lib/proxy').Requirement;
const Favorite = require('lib/proxy').Favorite;
const Evaluation = require('lib/proxy').Evaluation;
const Product = require('lib/proxy').Product;
const tools = require('lib/common/tools');
const _ = require('lodash');
const async = require('async');
const ApiUtil = require('lib/common/api_util');
const type = require('lib/type/type');
const limit = require('lib/middlewares/limit')
const designer_match_util = require('lib/common/designer_match');
const DateUtil = require('lib/common/date_util');
const sms = require('lib/common/sms');
const authMiddleWare = require('lib/middlewares/auth');
const message_util = require('lib/common/message_util');
const reg_util = require('lib/common/reg_util');
const pc_web_header = require('lib/business/pc_web_header');
const user_habit_collect = require('lib/business/user_habit_collect');

let noPassAndToken = {
  pass: 0,
  accessToken: 0
};

let noPrivateInfo = {
  pass: 0,
  accessToken: 0,
  uid: 0,
  phone: 0,
  email: 0,
  bank: 0,
  bank_card: 0
}

exports.getInfo = function (req, res, next) {
  let designerid = ApiUtil.getUserid(req);
  let ep = new eventproxy();
  ep.fail(next);

  Designer.findOne({
    _id: designerid
  }, noPassAndToken, ep.done(function (designer) {
    res.sendData(designer);
  }));
};

exports.updateInfo = function (req, res, next) {
  let userid = ApiUtil.getUserid(req);
  let designer = ApiUtil.buildDesinger(req);
  designer.auth_type = type.designer_auth_type_processing;
  designer.auth_date = new Date().getTime();
  designer.auth_message = '';
  let ep = new eventproxy();
  ep.fail(next);

  Designer.setOne({
    _id: userid
  }, designer, {
    new: true
  }, ep.done(function (designer) {
    authMiddleWare.gen_session(designer, type.role_designer, req, res);
    res.sendSuccessMsg();
  }));
};

exports.updateNoReviewInfo = function (req, res, next) {
  let userid = ApiUtil.getUserid(req);
  let designer = ApiUtil.buildDesingerNoReviewInfo(req);
  let ep = new eventproxy();
  ep.fail(next);

  Designer.setOne({
    _id: userid
  }, designer, null, ep.done(function () {
    res.sendSuccessMsg();
  }));
};

exports.update_business_info = function (req, res, next) {
  let userid = ApiUtil.getUserid(req);
  let designer = ApiUtil.buildDesignerBusinessInfo(req);
  let ep = new eventproxy();
  ep.fail(next);

  Designer.setOne({
    _id: userid
  }, designer, ep.done(function () {
    res.sendSuccessMsg();
  }));
};

exports.uid_bank_info = function (req, res, next) {
  let userid = ApiUtil.getUserid(req);
  let uidbank = ApiUtil.buildUidBank(req);
  uidbank.uid_auth_type = type.designer_auth_type_processing;
  uidbank.uid_auth_date = new Date().getTime();
  uidbank.uid_auth_message = '';
  let ep = new eventproxy();
  ep.fail(next);

  Designer.setOne({
    _id: userid
  }, uidbank, {}, ep.done(function () {
    res.sendSuccessMsg();
  }));
};

exports.email_info = function (req, res, next) {
  let userid = ApiUtil.getUserid(req);
  let email = tools.trim(req.body.email);
  let ep = new eventproxy();
  ep.fail(next);

  Designer.setOne({
    _id: userid
  }, {
    email: email,
    email_auth_type: type.designer_auth_type_processing,
    email_auth_date: new Date().getTime(),
    email_auth_message: ''
  }, {}, ep.done(function () {
    res.sendSuccessMsg();
  }));
};

exports.designer_home_page = function (req, res, next) {
  let designerid = req.body._id;
  let userid = ApiUtil.getUserid(req);
  let usertype = ApiUtil.getUsertype(req);
  let ep = new eventproxy();
  ep.fail(next);

  Designer.findOne({
    _id: designerid
  }, noPrivateInfo, ep.done(function (designer) {
    if (designer) {
      if (userid && usertype === type.role_user) {
        Favorite.findOne({
          userid: userid,
          favorite_designer: designerid
        }, null, ep.done(function (favorite) {
          designer = designer.toObject();
          if (favorite) {
            designer.is_my_favorite = true;
          } else {
            designer.is_my_favorite = false;
          }
          res.sendData(designer);
        }));
      } else {
        res.sendData(designer);
      }

      limit.perwhatperdaydo('designergetone', req.ip + designerid, 1, function () {
        Designer.incOne({
          _id: designerid
        }, {
          view_count: 1
        }, {});
      });

      user_habit_collect.add_designer_history(userid, usertype, designerid);
    } else {
      res.sendData(null);
    }
  }));
}

exports.top_designers = function (req, res, next) {
  let ep = new eventproxy();
  ep.fail(next);
  let limit = req.body.limit;

  Designer.find({
    auth_type: type.designer_auth_type_done,
    authed_product_count: {
      $gte: 5
    }
  }, {
    username: 1,
    imageid: 1,
    auth_type: 1,
    uid_auth_type: 1,
    work_auth_type: 1
  }, null, ep.done(function (designers) {
    let recs = _.sample(designers, limit);
    res.sendData(recs);
  }));
}

exports.search = function (req, res, next) {
  let userid = ApiUtil.getUserid(req);
  let usertype = ApiUtil.getUsertype(req);
  let query = req.body.query || {};
  let sort = req.body.sort || {
    score: -1
  };
  let skip = req.body.from || 0;
  let limit = req.body.limit || 10;
  query.auth_type = type.designer_auth_type_done;
  query.authed_product_count = {
    $gte: 3
  };
  let ep = new eventproxy();
  ep.fail(next);

  let search_word = req.body.search_word;
  if (search_word && search_word.trim().length > 0) {
    search_word = reg_util.reg(tools.trim(search_word), 'i');
    query['$or'] = [{
      company: search_word
    }, {
      username: search_word
    }, {
      philosophy: search_word
    }];
  }

  Designer.paginate(query, noPrivateInfo, {
    sort: sort,
    skip: skip,
    limit: limit,
    lean: true
  }, ep.done(function (designers, total) {
    if (userid && usertype === type.role_user) {
      async.mapLimit(designers, 3, function (designer, callback) {
        Favorite.findOne({
          userid: userid,
          favorite_designer: designer._id
        }, {
          _id: 1
        }, function (err, favorite) {
          if (favorite) {
            designer.is_my_favorite = true;
          } else {
            designer.is_my_favorite = false;
          }
          callback(err, designer);
        });
      }, ep.done(function (designers) {
        res.sendData({
          designers: designers,
          total: total
        });
      }));
    } else {
      res.sendData({
        designers: designers,
        total: total
      });
    }
  }));
}

exports.okUser = function (req, res, next) {
  let designerid = ApiUtil.getUserid(req);
  let requirementid = tools.trim(req.body.requirementid);
  let house_check_time = req.body.house_check_time;
  let ep = eventproxy();
  ep.fail(next);

  if (house_check_time) {
    Plan.setOne({
      designerid: designerid,
      requirementid: requirementid,
      status: type.plan_status_not_respond
    }, {
      house_check_time: house_check_time,
      status: type.plan_status_designer_respond_no_housecheck,
      last_status_update_time: new Date().getTime()
    }, {
      new: true
    }, ep.done(function (plan) {
      if (plan) {
        Requirement.setOne({
          _id: plan.requirementid,
          status: type.requirement_status_not_respond
        }, {
          status: type.requirement_status_respond_no_housecheck
        }, null, function () {});

        Designer.findOne({
          _id: designerid
        }, {
          username: 1,
          phone: 1
        }, function (err, designer) {
          User.findOne({
            _id: plan.userid
          }, {
            phone: 1,
            username: 1
          }, function (err, user) {
            if (user) {
              message_util.user_message_type_designer_respond(user, designer, plan);
              sms.sendDesignerRespondUser(user.phone, [designer.username,
                designer.phone, DateUtil.YYYY_MM_DD_HH_mm(house_check_time)
              ]);
            }
          });
        });
      }

      res.sendSuccessMsg();
    }));
  } else {
    Plan.findOne({
      designerid: designerid,
      requirementid: requirementid,
      status: type.plan_status_not_respond
    }, null, ep.done(function (plan) {
      if (!plan) {
        return res.sendSuccessMsg();
      }

      if (plan.get_phone_time) {
        res.sendSuccessMsg();
      } else {
        plan.get_phone_time = new Date().getTime();
        plan.last_status_update_time = plan.get_phone_time;
        plan.save(ep.done(function () {
          res.sendSuccessMsg();
        }));
      }
    }));
  }
}

exports.rejectUser = function (req, res, next) {
  let designerid = ApiUtil.getUserid(req);
  let requirementid = tools.trim(req.body.requirementid);
  let reject_respond_msg = req.body.reject_respond_msg;

  let ep = eventproxy();
  ep.fail(next);

  Plan.setOne({
    requirementid: requirementid,
    designerid: designerid,
    status: type.plan_status_not_respond
  }, {
    status: type.plan_status_designer_reject,
    last_status_update_time: new Date().getTime(),
    reject_respond_msg: reject_respond_msg
  }, null, ep.done(function (plan) {
    res.sendSuccessMsg();

    async.parallel({
      user: function (callback) {
        User.findOne({
          _id: plan.userid
        }, {
          username: 1
        }, callback);
      },
      designer: function (callback) {
        Designer.findOne({
          _id: designerid
        }, {
          username: 1
        }, callback);
      }
    }, function (err, result) {
      if (!err && result.user && result.designer) {
        message_util.user_message_type_designer_reject(result.user, result.designer, plan);
      }
    });
  }));
}

exports.agree = function (req, res, next) {
  let designerid = ApiUtil.getUserid(req);
  let ep = eventproxy();
  ep.fail(next);

  Designer.setOne({
    _id: designerid
  }, {
    'agreee_license': type.designer_agree_type_yes
  }, {}, ep.done(function () {
    req.session.agreee_license = type.designer_agree_type_yes;
    res.sendSuccessMsg();
  }));
}

exports.update_online_status = function (req, res, next) {
  let designerid = ApiUtil.getUserid(req);
  let new_oneline_status = tools.trim(req.body.new_oneline_status);
  let ep = eventproxy();
  ep.fail(next);

  Designer.setOne({
    _id: designerid
  }, {
    online_status: new_oneline_status,
    online_update_time: new Date().getTime()
  }, {}, ep.done(function () {
    res.sendSuccessMsg();
  }));
}

exports.designers_user_can_order = function (req, res, next) {
  let userid = ApiUtil.getUserid(req);
  let requirementid = req.body.requirementid;
  let ep = eventproxy();
  ep.fail(next);

  async.parallel({
      requirement: function (callback) {
        Requirement.findOne({
          _id: requirementid
        }, null, callback);
      },
      favorite: function (callback) {
        Favorite.findOne({
          userid: userid
        }, null, callback);
      }
    },

    ep.done(function (result) {
      if (result.requirement.package_type === type.requirement_package_type_jiangxin) {
        Designer.find({
          _id: {
            $nin: result.requirement.order_designerids.concat(result.requirement.obsolete_designerids)
          },
          auth_type: type.designer_auth_type_done,
          agreee_license: type.designer_agree_type_yes,
          online_status: type.online_status_on,
          authed_product_count: {
            $gte: 3
          },
          package_types: type.requirement_package_type_jiangxin
        }, {
          username: 1,
          imageid: 1,
          dec_districts: 1,
          dec_fee_all: 1,
          dec_fee_half: 1,
          dec_styles: 1,
          communication_type: 1,
          dec_house_types: 1,
          province: 1,
          city: 1,
          district: 1,
          authed_product_count: 1,
          order_count: 1,
          deal_done_count: 1,
          auth_type: 1,
          uid_auth_type: 1,
          work_auth_type: 1,
          email_auth_type: 1,
          service_attitude: 1,
          respond_speed: 1,
          view_count: 1,
          tags: 1
        }, {
          lean: true
        }, ep.done(function (designers) {
          async.mapLimit(designers, 3, function (designer, callback) {
            Product.find({
              designerid: designer._id,
              auth_type: type.product_auth_type_done
            }, null, {
              skip: 0,
              limit: 1
            }, function (err, products) {
              designer.products = products;
              callback(err, designer);
            });
          }, ep.done(function (designers) {
            res.sendData({
              rec_designer: designers
            });
          }));
        }));
      } else {
        let can_order_rec = [];
        if (result.requirement && result.requirement.rec_designerids) {
          can_order_rec = _.filter(result.requirement.rec_designerids,
            function (oid) {
              return tools.findIndexObjectId(result.requirement.order_designerids,
                oid) < 0 && tools.findIndexObjectId(result.requirement.obsolete_designerids,
                oid) < 0;
            });
        }

        let can_order_fav = [];
        if (result.requirement && result.favorite && result.favorite.favorite_designer) {
          can_order_fav = _.filter(result.favorite.favorite_designer,
            function (oid) {
              return tools.findIndexObjectId(result.requirement.order_designerids,
                oid) < 0 && tools.findIndexObjectId(result.requirement.rec_designerids,
                oid) < 0 && tools.findIndexObjectId(result.requirement.obsolete_designerids,
                oid) < 0;
            });
        }

        async.parallel({
          rec_designer: function (callback) {
            Designer.find({
              _id: {
                $in: can_order_rec
              },
              auth_type: type.designer_auth_type_done,
              agreee_license: type.designer_agree_type_yes,
              online_status: type.online_status_on,
              authed_product_count: {
                $gte: 3
              }
            }, {
              username: 1,
              imageid: 1,
              dec_districts: 1,
              dec_fee_all: 1,
              dec_fee_half: 1,
              dec_styles: 1,
              communication_type: 1,
              dec_house_types: 1,
              province: 1,
              city: 1,
              district: 1,
              authed_product_count: 1,
              order_count: 1,
              deal_done_count: 1,
              auth_type: 1,
              uid_auth_type: 1,
              work_auth_type: 1,
              email_auth_type: 1,
              service_attitude: 1,
              respond_speed: 1,
              tags: 1,
              score: 1
            }, {
              lean: true
            }, function (err, designers) {
              _.forEach(designers, function (designer) {
                designer_match_util.designer_match(designer,
                  result.requirement);
              });
              callback(err, designers)
            });
          },
          favorite_designer: function (callback) {
            Designer.find({
              _id: {
                $in: can_order_fav
              },
              auth_type: type.designer_auth_type_done,
              agreee_license: type.designer_agree_type_yes,
              online_status: type.online_status_on,
              authed_product_count: {
                $gte: 3
              },
              package_types: {
                $ne: type.requirement_package_type_jiangxin
              }
            }, {
              username: 1,
              imageid: 1,
              dec_districts: 1,
              dec_fee_all: 1,
              dec_fee_half: 1,
              dec_styles: 1,
              communication_type: 1,
              dec_house_types: 1,
              province: 1,
              city: 1,
              district: 1,
              authed_product_count: 1,
              order_count: 1,
              deal_done_count: 1,
              auth_type: 1,
              uid_auth_type: 1,
              work_auth_type: 1,
              email_auth_type: 1,
              service_attitude: 1,
              respond_speed: 1,
              tags: 1
            }, {
              lean: true
            }, function (err, designers) {
              callback(err, designers)
            });
          }
        }, ep.done(function (result) {
          res.sendData(result);
        }));
      }
    }));
}

exports.user_ordered_designers = function (req, res, next) {
  let userid = ApiUtil.getUserid(req);
  let requirementid = req.body.requirementid;
  let ep = eventproxy();
  ep.fail(next);

  async.waterfall([function (callback) {
    Requirement.findOne({
      _id: requirementid
    }, {
      order_designerids: 1,
      rec_designerids: 1,
      status: 1
    }, callback);
  }], ep.done(function (requirement) {
    if (requirement) {
      Designer.find({
        _id: {
          $in: requirement.order_designerids
        }
      }, {
        username: 1,
        imageid: 1,
        phone: 1,
        province: 1,
        city: 1,
        authed_product_count: 1,
        order_count: 1,
        deal_done_count: 1,
        auth_type: 1,
        uid_auth_type: 1,
        work_auth_type: 1,
        email_auth_type: 1,
        service_attitude: 1,
        respond_speed: 1,
        tags: 1
      }, null, ep.done(function (designers) {
        async.mapLimit(designers, 3, function (designer, callback) {
          Plan.find({
            designerid: designer._id,
            requirementid: requirementid
          }, {
            status: 1,
            house_check_time: 1
          }, {
            skip: 0,
            limit: 1,
            sort: {
              last_status_update_time: -1
            }
          }, function (err, plans) {
            designer = designer.toObject();
            designer.plan = plans[0];
            designer.requirement = requirement;
            if (tools.findIndexObjectId(requirement.rec_designerids,
                designer._id) > -1) {
              designer.is_rec = true;
            } else {
              designer.is_rec = false;
            }

            Evaluation.findOne({
              userid: userid,
              designerid: designer._id,
              requirementid: requirementid
            }, null, function (err, evaluation) {
              if (evaluation) {
                designer.evaluation = evaluation;
              }
              callback(err, designer);
            });
          });
        }, ep.done(function (results) {
          res.sendData(results);
        }));
      }));
    } else {
      res.sendErrMsg('需求不存在');
    }
  }));
}

exports.designer_statistic_info = function (req, res, next) {
  const _id = ApiUtil.getUserid(req);
  const usertype = ApiUtil.getUsertype(req);
  const ep = eventproxy();
  ep.fail(next);

  pc_web_header.statistic_info(_id, usertype, ep.done(function (data) {
    res.sendData(data.designer_statistic_info);
  }));
}

exports.designer_remind_user_house_check = function (req, res, next) {
  let planid = req.body.planid;
  let userid = req.body.userid;
  let ep = eventproxy();
  ep.fail(next);

  async.parallel({
    designer: function (callback) {
      Designer.findOne({
        _id: ApiUtil.getUserid(req)
      }, {
        username: 1
      }, callback);
    },
    plan: function (callback) {
      Plan.findOne({
        _id: planid
      }, null, callback);
    },
    user: function (callback) {
      User.findOne({
        _id: userid
      }, {
        username: 1
      }, callback);
    }
  }, ep.done(function (result) {
    res.sendSuccessMsg();
    if (result.user && result.designer && result.plan) {
      message_util.user_message_type_designer_remind_ok_house_checked(result.user, result.designer, result.plan);
    }
  }));
}

const DAYS = ['1', '2', '3', '4', '5'];
const ACTIVITYS = ['天前加入了简繁家', '天前与业主签订了合同', '天前去业主家上门量房', '天前上传了新案例', '天前上传了方案'];
exports.top_designer_activity = function (req, res, next) {
  const query = {
    auth_type: type.designer_auth_type_done,
    authed_product_count: {
      $gte: 3
    }
  };
  const ep = eventproxy();
  const limit = req.body.limit || 10;
  ep.fail(next);

  Designer.find(query, {
    username: 1,
    imageid: 1
  }, {
    lean: 1
  }, ep.done(function (designers) {
    const designer_sample = _.sample(designers, limit);
    for (let d of designer_sample) {
      d.activity = _.sample(DAYS, 1) + _.sample(ACTIVITYS, 1);
    }
    const sorted = designer_sample.sort(function (a, b) {
      return a.activity.localeCompare(b.activity);
    });

    res.sendData(sorted);
  }));
}
