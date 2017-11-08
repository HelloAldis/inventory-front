'use strict'

const tools = require('./tools');
const _ = require('lodash');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

exports.getUserid = function (req) {
  if (req.session) {
    return req.session.userid;
  }
}

exports.getUsertype = function (req) {
  if (req.session) {
    return req.session.usertype;
  }
}

exports.getAgreeeLicense = function (req) {
  if (req.session) {
    return req.session.agreee_license;
  }
}

exports.buildUser = function (req) {
  let user = {};
  let input;
  if (req.body.user) {
    input = req.body.user;
  } else {
    input = req.body;
  }

  user.username = input.username;
  user.sex = input.sex;
  user.province = input.province;
  user.city = input.city;
  user.district = input.district;
  user.address = input.address;
  user.email = input.email;
  user.dec_progress = input.dec_progress;
  user.dec_styles = input.dec_styles;
  user.family_description = input.family_description;

  if (input.imageid) {
    user.imageid = new ObjectId(input.imageid);
  }

  return tools.deleteUndefinedAndNullThenFilterXss(user);
}

exports.buildUserForAdmin = function (req) {
  let user = exports.buildUser(req);
  let input;
  if (req.body.user) {
    input = req.body.user;
  } else {
    input = req.body;
  }
  user.phone = input.phone;

  return user;
}

exports.buildWechatUser = function (req) {
  let user = {};
  user.username = req.body.username;
  user.sex = req.body.sex;
  user.image_url = req.body.image_url;
  user.wechat_openid = req.body.wechat_openid;
  user.wechat_unionid = req.body.wechat_unionid;

  return tools.deleteUndefinedAndNullThenFilterXss(user);
}

exports.buildDesinger = function (req) {
  let designer = {};
  let input = req.body.designer || req.body;

  designer.username = input.username;
  designer.sex = input.sex;
  designer.province = input.province;
  designer.city = input.city;
  designer.district = input.district;
  designer.address = input.address;
  designer.company = input.company;
  designer.achievement = input.achievement;
  designer.philosophy = input.philosophy;
  designer.work_year = input.work_year;
  designer.university = input.university;

  designer.diploma_imageid = tools.convert2ObjectId(input.diploma_imageid);
  designer.imageid = tools.convert2ObjectId(input.imageid);

  if (input.award_details) {
    designer.award_details = _.map(input.award_details, function (i) {
      i.award_imageid = tools.convert2ObjectId(i.award_imageid);
      return i;
    });
  }

  return tools.deleteUndefinedAndNullThenFilterXss(designer);
}

exports.buildDesingerNoReviewInfo = function (req) {
  let designer = {};
  let input = req.body.designer || req.body;

  designer.big_imageid = tools.convert2ObjectId(input.big_imageid);

  return tools.deleteUndefinedAndNullThenFilterXss(designer);
}

exports.buildDesignerBusinessInfo = function (req) {
  let designer = {};
  let input = req.body.designer || req.body;

  designer.dec_types = input.dec_types;
  designer.work_types = input.work_types;
  designer.dec_styles = input.dec_styles;
  designer.dec_districts = input.dec_districts;
  designer.dec_house_types = input.dec_house_types;
  designer.design_fee_range = input.design_fee_range;
  designer.dec_fee_half = input.dec_fee_half;
  designer.dec_fee_all = input.dec_fee_all;
  designer.communication_type = input.communication_type;

  return tools.deleteUndefinedAndNullThenFilterXss(designer);
}

exports.buildUidBank = function (req) {
  let designer = {};
  let input = req.body.designer || req.body;

  designer.realname = input.realname;
  designer.uid = input.uid;
  designer.bank_card = input.bank_card;
  designer.bank = input.bank;

  designer.uid_image1 = tools.convert2ObjectId(input.uid_image1);
  designer.uid_image2 = tools.convert2ObjectId(input.uid_image2);
  designer.bank_card_image1 = tools.convert2ObjectId(input.bank_card_image1);

  return tools.deleteUndefinedAndNullThenFilterXss(designer);
}

exports.buildTeam = function (req) {
  let team = {};
  let input = req.body.team || req.body;

  team.manager = input.manager;
  team.uid = input.uid;
  team.company = input.company;
  team.work_year = input.work_year;
  team.good_at = input.good_at;
  team.working_on = input.working_on;
  team.sex = input.sex;
  team.province = input.province;
  team.city = input.city;
  team.district = input.district;

  team.uid_image1 = tools.convert2ObjectId(input.uid_image1);
  team.uid_image2 = tools.convert2ObjectId(input.uid_image2);

  return tools.deleteUndefinedAndNullThenFilterXss(team);
}

exports.buildProduct = function (req) {
  let product = {};
  let input = req.body.product || req.body;

  product.province = input.province;
  product.city = input.city;
  product.district = input.district;
  product.cell = input.cell;
  product.house_type = input.house_type;
  product.business_house_type = input.business_house_type;
  product.house_area = input.house_area;
  product.dec_style = input.dec_style;
  product.dec_type = input.dec_type;
  product.work_type = input.work_type;
  product.total_price = input.total_price;
  product.description = input.description;
  product.cover_imageid = tools.convert2ObjectId(input.cover_imageid);

  if (input.images) {
    product.images = _.map(input.images, function (i) {
      i.imageid = tools.convert2ObjectId(i.imageid);
      return i;
    });
  }

  if (input.plan_images) {
    product.plan_images = _.map(input.plan_images, function (i) {
      i.imageid = tools.convert2ObjectId(i.imageid);
      return i;
    });
  }

  return tools.deleteUndefinedAndNullThenFilterXss(product);
}

exports.buildPlan = function (req) {
  let plan = {};
  plan.duration = req.body.duration;
  plan.description = req.body.description;
  plan.manager = req.body.manager;
  plan.price_detail = req.body.price_detail;
  plan.total_design_fee = req.body.total_design_fee || 0;
  plan.project_price_before_discount = req.body.project_price_before_discount || 0;
  plan.project_price_after_discount = req.body.project_price_after_discount || plan.project_price_before_discount;
  plan.total_price = req.body.total_price || (plan.total_design_fee + plan.project_price_after_discount);

  //防止没有折前价,没有折前价用折后价代替
  plan.project_price_before_discount = plan.project_price_before_discount || plan.project_price_after_discount;

  if (req.body.images) {
    plan.images = _.map(req.body.images, function (i) {
      return new ObjectId(i);
    });
  }

  return tools.deleteUndefinedAndNullThenFilterXss(plan);
}

exports.buildRequirement = function (req) {
  let requirement = {};
  let input;
  if (req.body.requirement) {
    input = req.body.requirement;
  } else {
    input = req.body;
  }

  requirement.province = input.province;
  requirement.city = input.city;
  requirement.district = input.district;

  requirement.basic_address = input.basic_address;
  requirement.detail_address = input.detail_address;

  requirement.house_type = input.house_type;
  requirement.business_house_type = input.business_house_type;
  requirement.house_area = input.house_area;
  requirement.dec_style = input.dec_style;
  requirement.dec_type = input.dec_type;
  requirement.prefer_sex = input.prefer_sex;
  requirement.work_type = input.work_type;
  requirement.total_price = input.total_price;
  requirement.communication_type = input.communication_type;
  requirement.family_description = input.family_description;
  requirement.package_type = input.package_type || '0';

  return tools.deleteUndefinedAndNullThenFilterXss(requirement);
}

exports.buildShare = function (req) {
  let share = {};
  share.manager = req.body.manager;
  share.province = req.body.province;
  share.city = req.body.city;
  share.district = req.body.district;
  share.cell = req.body.cell;
  share.house_type = req.body.house_type;
  share.house_area = req.body.house_area;
  share.dec_style = req.body.dec_style;
  share.dec_type = req.body.dec_type;
  share.work_type = req.body.work_type;
  share.total_price = req.body.total_price;
  share.description = req.body.description;
  share.process = req.body.process;
  share.start_at = req.body.start_at;
  share.status = req.body.status;
  share.progress = req.body.progress;
  share.designerid = tools.convert2ObjectId(req.body.designerid);

  _.forEach(share.process, function (p) {
    p.images = _.map(p.images, function (i) {
      return new ObjectId(i);
    });
  });
  share.cover_imageid = req.body.cover_imageid ? new ObjectId(req.body.cover_imageid) :
    undefined;

  return tools.deleteUndefinedAndNullThenFilterXss(share);
}

exports.buildProcess = function (req) {
  let process = {};
  process.final_designerid = new ObjectId(req.body.final_designerid);
  process.final_planid = new ObjectId(req.body.final_planid);
  process.requirementid = new ObjectId(req.body.requirementid);
  process.province = req.body.province;
  process.city = req.body.city;
  process.district = req.body.district;
  process.cell = req.body.cell;
  process.basic_address = req.body.basic_address;
  process.detail_address = req.body.detail_address;
  process.house_type = req.body.house_type;
  process.house_area = req.body.house_area;
  process.dec_style = req.body.dec_style;
  process.work_type = req.body.work_type;
  process.total_price = req.body.total_price;
  process.start_at = req.body.start_at;
  process.duration = req.body.duration;

  return tools.deleteUndefinedAndNullThenFilterXss(process);
}

exports.buildReschedule = function (req) {
  let reschedule = {};
  reschedule.processid = new ObjectId(tools.trim(req.body.processid));
  reschedule.userid = new ObjectId(tools.trim(req.body.userid));
  reschedule.designerid = new ObjectId(tools.trim(req.body.designerid));
  reschedule.section = req.body.section;
  reschedule.new_date = req.body.new_date;

  return tools.deleteUndefinedAndNullThenFilterXss(reschedule);
}

exports.buildFeedback = function (req) {
  let feedback = {};

  feedback.content = req.body.content;
  feedback.platform = req.body.platform;
  feedback.version = req.body.version;

  return tools.deleteUndefinedAndNullThenFilterXss(feedback);
}

exports.buildTempUser = function (req) {
  let tempUser = {};

  tempUser.name = req.body.name;
  tempUser.phone = req.body.phone;
  tempUser.district = req.body.district;
  tempUser.house_area = req.body.house_area;
  tempUser.total_price = req.body.total_price;
  tempUser.designerid = tools.convert2ObjectId(req.body.designerid);

  return tools.deleteUndefinedAndNullThenFilterXss(tempUser);
}

exports.buildComment = function (req) {
  let comment = {};
  comment.topicid = req.body.topicid;
  comment.section = req.body.section;
  comment.item = req.body.item;
  comment.topictype = req.body.topictype;
  comment.content = req.body.content;
  comment.to_userid = tools.convert2ObjectId(req.body.to_userid);
  comment.to_designerid = tools.convert2ObjectId(req.body.to_designerid);
  comment.to_commentid = tools.convert2ObjectId(req.body.to_commentid);

  return tools.deleteUndefinedAndNullThenFilterXss(comment);
}

exports.buildEvaluation = function (req) {
  let evaluation = {};
  evaluation.designerid = req.body.designerid ? new ObjectId(req.body.designerid) :
    undefined;
  evaluation.requirementid = req.body.requirementid ? new ObjectId(req.body.requirementid) :
    undefined;
  evaluation.service_attitude = req.body.service_attitude > 5 ? 0 : req.body.service_attitude;
  evaluation.respond_speed = req.body.respond_speed > 5 ? 0 : req.body.respond_speed;
  evaluation.comment = req.body.comment;
  evaluation.is_anonymous = req.body.is_anonymous;

  return tools.deleteUndefinedAndNullThenFilterXss(evaluation);
}

exports.buildArticle = function (req) {
  let article = {};
  article.title = req.body.title;
  article.keywords = req.body.keywords;
  article.cover_imageid = req.body.cover_imageid ? new ObjectId(req.body.cover_imageid) : undefined;
  article.description = req.body.description;
  article.content = req.body.content;
  article.status = req.body.status;
  article.articletype = req.body.articletype;

  return tools.deleteUndefinedAndNull(article);
}

exports.buildBeautifulImage = function (req) {
  let beautifulImage = {};
  beautifulImage.title = req.body.title;
  beautifulImage.description = req.body.description;
  beautifulImage.keywords = req.body.keywords;
  beautifulImage.dec_type = req.body.dec_type;
  beautifulImage.house_type = req.body.house_type;
  beautifulImage.dec_style = req.body.dec_style;
  beautifulImage.section = req.body.section;
  beautifulImage.status = req.body.status;

  if (req.body.images) {
    beautifulImage.images = _.map(req.body.images, function (i) {
      i.imageid = new ObjectId(i.imageid);
      return i;
    });
  }

  return tools.deleteUndefinedAndNullThenFilterXss(beautifulImage);
}

exports.buildAnswers = function (req) {
  return tools.deleteUndefinedAndNullThenFilterXss(req.answers);
}

exports.buildSupervisor = function (req) {
  let supervisor = {};

  supervisor.username = req.body.supervisor.username;
  supervisor.sex = req.body.supervisor.sex;
  supervisor.province = req.body.supervisor.province;
  supervisor.city = req.body.supervisor.city;
  supervisor.district = req.body.supervisor.district;
  supervisor.address = req.body.supervisor.address;
  supervisor.imageid = tools.convert2ObjectId(req.body.supervisor.imageid);

  return tools.deleteUndefinedAndNullThenFilterXss(supervisor);
}

exports.buildDiarySet = function (req) {
  let diarySet = {};
  let input = req.body.diary_set;

  diarySet.cover_imageid = tools.convert2ObjectId(input.cover_imageid);
  diarySet.title = input.title;
  diarySet.house_area = input.house_area;
  diarySet.house_type = input.house_type;
  diarySet.dec_style = input.dec_style;
  diarySet.work_type = input.work_type;

  return tools.deleteUndefinedAndNullThenFilterXss(diarySet);
}

exports.buildDiary = function (req) {
  let diary = {};
  let input = req.body.diary;

  diary.diarySetid = tools.convert2ObjectId(input.diarySetid);
  diary.content = input.content;
  diary.section_label = input.section_label;
  if (input.images) {
    diary.images = _.map(input.images, function (i) {
      i.imageid = tools.convert2ObjectId(i.imageid);
      return i;
    });
  }

  return tools.deleteUndefinedAndNullThenFilterXss(diary);
}

exports.buildAdminDesingerUpdate = function (req) {
  let designer = {};
  let input = req.body.designer;
  designer.tags = input.tags;

  return tools.deleteUndefinedAndNullThenFilterXss(designer);
}

function addToSections(sections, section, count) {
  count = count || 0;
  for (var i = 0; i < count; i++) {
    sections.push(section);
  }
}

exports.buildQuotation = function (req) {
  const living_dining_room = {
    name: '客餐厅',
    area: 30,
    base_price: 10300 + 4650,
    main_price: 4400 + 2100
  };

  const dining_room = {
    name: '餐厅',
    area: 10,
    base_price: 4650,
    main_price: 2100
  };

  const living_room = {
    name: '客厅',
    area: 30,
    base_price: 10300,
    main_price: 4400
  };

  const master_bedroom = {
    name: '主卧',
    area: 14,
    base_price: 3710,
    main_price: 2450
  };

  const extra_bedroom = {
    name: '次卧',
    area: 12,
    base_price: 3180,
    main_price: 2450
  };

  const study_room = {
    name: '书房',
    area: 10,
    base_price: 2650,
    main_price: 2200
  };

  const child_bedroom = {
    name: '儿童房',
    area: 12,
    base_price: 3180,
    main_price: 2450
  };

  const cloakroom = {
    name: '衣帽间',
    area: 8,
    base_price: 2120,
    main_price: 1850
  };

  const kitchen = {
    name: '厨房',
    area: 7,
    base_price: 3878,
    main_price: 11800
  };

  const master_washroom = {
    name: '主卫',
    area: 5,
    base_price: 4250,
    main_price: 7700
  };

  const washroom = {
    name: '客卫',
    area: 6,
    base_price: 5100,
    main_price: 8200
  };

  const living_room_count = req.body.living_room_count;
  const kitchen_count = req.body.kitchen_count
  const washroom_count = req.body.washroom_count;
  const extra_bedroom_count = req.body.extra_bedroom_count;
  const child_bedroom_count = req.body.child_bedroom_count;
  const study_room_count = req.body.study_room_count;
  const cloakroom_count = req.body.cloakroom_count;

  let quotation = {};
  const sections = [];
  //客厅
  if (living_room_count == 1) {
    addToSections(sections, living_dining_room, 1);
  } else {
    addToSections(sections, living_room, 1);
    addToSections(sections, dining_room, 1);
  }

  //卧室
  addToSections(sections, master_bedroom, 1);
  addToSections(sections, extra_bedroom, extra_bedroom_count);
  addToSections(sections, child_bedroom, child_bedroom_count);
  addToSections(sections, study_room, study_room_count);
  addToSections(sections, cloakroom, cloakroom_count);

  //厨房
  addToSections(sections, kitchen, kitchen_count);

  //卫生间
  addToSections(sections, washroom, 1);
  addToSections(sections, master_washroom, washroom_count - 1);

  quotation.sections = sections;
  quotation.house_area = req.body.house_area;
  quotation.dec_styles = req.body.dec_styles;

  return quotation;
}
