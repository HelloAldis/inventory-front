"use strict";

const type = require('lib/type/type');
const UserMessage = require('lib/proxy').UserMessage;
const DesignerMessage = require('lib/proxy').DesignerMessage;
const gt = require('lib/getui/gt.js');
const date_util = require('./date_util');
const logger = require('./logger')
const _ = require('lodash');
const util = require('util');

function saveDesignerMessageAndPush(designer_message) {
  DesignerMessage.newAndSave(designer_message, function (err, designer_message_indb) {
    if (err) {
      logger.error(err);
      return;
    }

    if (designer_message_indb) {
      DesignerMessage.count({
        designerid: designer_message_indb.designerid,
        status: type.message_status_unread
      }, function (err, count) {
        if (err) {
          logger.error(err);
          return;
        }

        let payload = gt.buildPayloadFromDesignerMessage(designer_message_indb);
        payload.badge = count;
        gt.pushMessageToDesigner(designer_message_indb.designerid, payload);
      });
    }
  });
}

function saveDesignerCommentAndPush(designer_message, username) {
  DesignerMessage.newAndSave(designer_message, function (err, designer_message_indb) {
    if (err) {
      logger.error(err);
      return;
    }

    if (designer_message_indb) {
      DesignerMessage.count({
        designerid: designer_message_indb.designerid,
        status: type.message_status_unread
      }, function (err, count) {
        if (err) {
          logger.error(err);
          return;
        }

        let payload = gt.buildPayloadFromDesignerMessage(designer_message_indb);
        payload.badge = count;
        payload.content = username + ' 评论您：' + removeUnusedWord(payload.content);
        gt.pushMessageToDesigner(designer_message_indb.designerid, payload);
      });
    }
  });
}

function removeUnusedWord(word) {
  word = word || '';
  let index = word.indexOf('：');
  if (index >= 0 && word.startsWith('回复')) {
    word = word.slice(index + 1);
  }

  return word;
}

function saveUserMessageAndPush(user_message) {
  UserMessage.newAndSave(user_message, function (err, user_message_indb) {
    if (err) {
      logger.error(err);
      return;
    }

    if (user_message_indb) {
      UserMessage.count({
        userid: user_message_indb.userid,
        status: type.message_status_unread
      }, function (err, count) {
        if (err) {
          logger.error(err);
          return;
        }

        let payload = gt.buildPayloadFromUserMessage(user_message_indb);
        payload.badge = count;
        gt.pushMessageToUser(user_message_indb.userid, payload);
      });
    }
  });
}

function saveUserCommentAndPush(user_message, username) {
  UserMessage.newAndSave(user_message, function (err, user_message_indb) {
    if (err) {
      logger.error(err);
      return;
    }

    if (user_message_indb) {
      UserMessage.count({
        userid: user_message_indb.userid,
        status: type.message_status_unread
      }, function (err, count) {
        if (err) {
          logger.error(err);
          return;
        }

        let payload = gt.buildPayloadFromUserMessage(user_message_indb);
        payload.badge = count;
        payload.content = username + ' 评论您：' + removeUnusedWord(payload.content);
        gt.pushMessageToUser(user_message_indb.userid, payload);
      });
    }
  });
}

exports.user_message_type_platform_notification = function (user, title, content, html) {
  let user_message = {
    userid: user._id,
    title: title,
    content: content,
    html: html,
    message_type: type.user_message_type_platform_notification,
    status: type.message_status_unread
  };

  saveUserMessageAndPush(user_message);
}

let user_message_type_designer_reschedule_template =
  '<html>\
<body style="padding-left:10; color:#7c8389; font-size:15">\
<p>尊敬的业主您好：</p>\
<p>您的设计师【%s】希望将本阶段工期修改至</p>\
<p style="color:#fe7003; font-size:16">%s</p>\
<p>等待您的确认！如有问题请及时与设计师联系。</p>\
<p>也可以拨打我们的客服热线：<a href="tel:400-8515-167">400-8515-167</a></p>\
</body>\
</html>';
exports.user_message_type_designer_reschedule = function (user, designer, reschedule) {
  let new_date = date_util.YYYY_MM_DD(reschedule.new_date)
  let user_message = {
    userid: user._id,
    designerid: designer._id,
    processid: reschedule.processid,
    rescheduleid: reschedule._id,
    section: reschedule.section,
    title: '改期提醒',
    content: '尊敬的业主您好：您的设计师【' + designer.username + '】希望将本阶段工期修改至' + new_date +
      '，等待您的确认！如有问题请及时与设计师联系，也可以拨打我们的客服热线：400-8515-167',
    html: util.format(user_message_type_designer_reschedule_template, designer.username, new_date),
    message_type: type.user_message_type_designer_reschedule,
    status: type.message_status_unread
  };

  saveUserMessageAndPush(user_message);
}

let user_message_type_designer_ok_reschedule_template =
  '<html>\
<body style="padding-left:10; color:#7c8389; font-size:15">\
<p>尊敬的业主您好：</p>\
<p>您的设计师【%s】同意了您的改期需求，本阶段工期将会修改至</p>\
<p style="color:#fe7003; font-size:16">%s</p>\
<p>如有问题请及时与设计师联系。</p>\
<p>也可以拨打我们的客服热线：<a href="tel:400-8515-167">400-8515-167</a></p>\
</body>\
</html>';
exports.user_message_type_designer_ok_reschedule = function (user, designer, reschedule) {
  let new_date = date_util.YYYY_MM_DD(reschedule.new_date);

  let user_message = {
    userid: user._id,
    designerid: designer._id,
    processid: reschedule.processid,
    rescheduleid: reschedule._id,
    section: reschedule.section,
    title: '改期提醒',
    content: '尊敬的业主您好：您的设计师【' + designer.username + '】同意了您的改期需求，本阶段工期将会修改至' + new_date + '，请及时与设计师沟通',
    html: util.format(user_message_type_designer_ok_reschedule_template, designer.username, new_date),
    message_type: type.user_message_type_designer_ok_reschedule,
    status: type.message_status_unread
  };

  saveUserMessageAndPush(user_message);
}

let user_message_type_designer_reject_reschedule_template =
  '<html>\
<body style="padding-left:10; color:#7c8389; font-size:15">\
<p>尊敬的业主您好：</p>\
<p>您的设计师【%s】不同意您修改工期。</p>\
<p>如有问题请及时与设计师联系。</p>\
<p>也可以拨打我们的客服热线：<a href="tel:400-8515-167">400-8515-167</a></p>\
</body>\
</html>';
exports.user_message_type_designer_reject_reschedule = function (user, designer, reschedule) {
  let user_message = {
    userid: user._id,
    designerid: designer._id,
    processid: reschedule.processid,
    rescheduleid: reschedule._id,
    section: reschedule.section,
    title: '改期提醒',
    content: '尊敬的业主您好：您的设计师【' + designer.username + '】不同意您修改工期。如有问题可以拨打我们的客服热线：400-8515-167',
    html: util.format(user_message_type_designer_reject_reschedule_template, designer.username),
    message_type: type.user_message_type_designer_reject_reschedule,
    status: type.message_status_unread
  };

  saveUserMessageAndPush(user_message);
}

let user_message_type_procurement_template =
  '<html>\
<body style="padding-left:10; color:#7c8389; font-size:15">\
<p>尊敬的业主您好：</p>\
<p>您即将进入【%s】阶段需要购买以下材料</p>\
<p style="color:#fe7003; font-size:16">%s</p>\
<p>为了不耽误您的工期，请您尽快采购！如有问题请及时与设计师联系。</p>\
<p>也可以拨打我们的客服热线：<a href="tel:400-8515-167">400-8515-167</a></p>\
</body>\
</html>'
exports.user_message_type_procurement = function (process, next) {
  let index = _.indexOf(type.process_work_flow, next);
  let message = type.procurement_notification_message[index];
  let name = type.process_work_flow_name[index];

  let user_message = {
    userid: process.userid,
    designerid: process.final_designerid,
    processid: process._id,
    requirementid: process.requirementid,
    planid: process.final_planid,
    section: next,
    title: '采购提醒',
    content: '尊敬的业主您好：您即将进入【' + name + '】阶段需要购买以下材料' + message + '，为了不耽误您的工期，请您尽快采购！如有问题请及时与设计师联系，也可以拨打我们的客服热线：400-8515-167',
    html: util.format(user_message_type_procurement_template, name, message),
    message_type: type.user_message_type_procurement,
    status: type.message_status_unread
  };

  saveUserMessageAndPush(user_message);
}

let user_message_type_pay_template =
  '<html>\
<body style="padding-left:10; color:#7c8389; font-size:15">\
<p>尊敬的业主您好：</p>\
<p>【%s】阶段已经完成</p>\
<p>您需要支付装修进度款，谢谢！</p>\
<p>如有问题可以拨打我们的客服热线：<a href="tel:400-8515-167">400-8515-167</a></p>\
</body>\
</html>'
exports.user_message_type_pay = function (process, section) {
  let index = _.indexOf(type.process_work_flow, section);
  let name = type.process_work_flow_name[index];

  let user_message = {
    userid: process.userid,
    designerid: process.final_designerid,
    processid: process._id,
    requirementid: process.requirementid,
    planid: process.final_planid,
    section: section,
    title: '付款提醒',
    content: '尊敬的业主您好：【' + name + '】阶段已经完成，您需要支付装修进度款，谢谢！如有问题可以拨打我们的客服热线：400-8515-167',
    html: util.format(user_message_type_pay_template, name),
    message_type: type.user_message_type_pay,
    status: type.message_status_unread
  };

  saveUserMessageAndPush(user_message);
}

exports.user_message_type_comment_plan = function (comment, username) {
  let user_message = {
    userid: comment.to_userid,
    designerid: comment.by,
    topicid: comment.topicid,
    commentid: comment._id,
    title: '方案评论',
    content: comment.content,
    message_type: type.user_message_type_comment_plan,
    status: type.message_status_unread
  };

  saveUserCommentAndPush(user_message, username);
}

exports.user_message_type_comment_process_item = function (comment, username) {
  let user_message = {
    userid: comment.to_userid,
    designerid: comment.usertype === type.role_designer ? comment.by : undefined, //如果评论的人是设计师，存设计师id
    supervisorid: comment.usertype === type.role_supervisor ? comment.by : undefined, //如果评论的人是监理，存监理id
    topicid: comment.topicid,
    commentid: comment._id,
    section: comment.section,
    item: comment.item,
    title: '工地评论',
    content: comment.content,
    message_type: type.user_message_type_comment_process_item,
    status: type.message_status_unread
  };

  saveUserCommentAndPush(user_message, username);
}

exports.user_message_type_comment_diary = function (comment, username) {
  let user_message = {
    userid: comment.to_userid,
    designerid: comment.usertype === type.role_designer ? comment.by : undefined, //如果评论的人是设计师，存设计师id
    byUserid: comment.usertype === type.role_user ? comment.by : undefined, //如果评论的人是业主，存业主id
    topicid: comment.topicid,
    commentid: comment._id,
    title: '日记评论',
    content: comment.content,
    message_type: type.user_message_type_comment_diary,
    status: type.message_status_unread
  };

  saveUserCommentAndPush(user_message, username);
}

let user_message_type_designer_respond_template =
  '<html>\
<body style="padding-left:10; color:#7c8389; font-size:15">\
<p>尊敬的业主您好：</p>\
<p>设计师【%s，手机：<a href="tel:%s">%s</a>】已经响应了您的需求，</p>\
<p>设计师确定的量房时间是</p>\
<p style="color:#fe7003; font-size:16">%s</p>\
<p>设计师将会与您取得联系，请保持电话畅通。</p>\
<p>如有问题可以拨打我们的客服热线：<a href="tel:400-8515-167">400-8515-167</a></p>\
</body>\
</html>'
exports.user_message_type_designer_respond = function (user, designer, plan) {
  let user_message = {
    userid: user._id,
    designerid: designer._id,
    planid: plan._id,
    requirementid: plan.requirementid,
    title: '需求提醒',
    content: '尊敬的业主您好：设计师【' + designer.username + '】已经响应了您的需求，设计师将会与您取得联系，请保持电话畅通。',
    html: util.format(user_message_type_designer_respond_template, designer.username, designer.phone, designer.phone, date_util.YYYY_MM_DD_HH_mm(
      plan.house_check_time)),
    message_type: type.user_message_type_designer_respond,
    status: type.message_status_unread
  };

  saveUserMessageAndPush(user_message);
}

let user_message_type_designer_reject_template =
  '<html>\
<body style="padding-left:10; color:#7c8389; font-size:15">\
<p>尊敬的业主您好：</p>\
<p>十分抱歉，设计师【%s】拒绝了您的需求</p>\
<p>您还可以选择其他设计师。</p>\
<p>如有问题可以拨打我们的客服热线：<a href="tel:400-8515-167">400-8515-167</a></p>\
</body>\
</html>'
exports.user_message_type_designer_reject = function (user, designer, plan) {
  let user_message = {
    userid: user._id,
    designerid: designer._id,
    planid: plan._id,
    requirementid: plan.requirementid,
    title: '需求提醒',
    content: '尊敬的业主您好：十分抱歉，设计师【' + designer.username + '】拒绝了您的需求，您还可以选择其他设计师，如有问题可以拨打我们的客服热线：400-8515-167',
    html: util.format(user_message_type_designer_reject_template, designer.username),
    message_type: type.user_message_type_designer_reject,
    status: type.message_status_unread
  };

  saveUserMessageAndPush(user_message);
}

let user_message_type_designer_upload_plan_template =
  '<html>\
<body style="padding-left:10; color:#7c8389; font-size:15">\
<p>尊敬的业主您好：</p>\
<p>您的设计师【%s】已经上传了方案</p>\
<p>请您前往查看，如有问题请及时与设计师联系。</p>\
<p>也可以拨打我们的客服热线：<a href="tel:400-8515-167">400-8515-167</a></p>\
</body>\
</html>'
exports.user_message_type_designer_upload_plan = function (user, designer, plan) {
  let user_message = {
    userid: user._id,
    designerid: designer._id,
    planid: plan._id,
    requirementid: plan.requirementid,
    title: '需求提醒',
    content: '尊敬的业主您好：您的设计师【' + designer.username + '】已经上传了方案，请您前往查看！',
    html: util.format(user_message_type_designer_upload_plan_template, designer.username),
    message_type: type.user_message_type_designer_upload_plan,
    status: type.message_status_unread
  };

  saveUserMessageAndPush(user_message);
}

let user_message_type_designer_config_contract_template =
  '<html>\
<body style="padding-left:10; color:#7c8389; font-size:15">\
<p>尊敬的业主您好：</p>\
<p>您的设计师【%s】已经配置好了装修合同</p>\
<p>请您及时查阅，如有问题请及时与设计师联系。</p>\
<p>也可以拨打我们的客服热线：<a href="tel:400-8515-167">400-8515-167</a></p>\
</body>\
</html>'
exports.user_message_type_designer_config_contract = function (user, designer, requirement) {
  let user_message = {
    userid: user._id,
    designerid: designer._id,
    planid: requirement.final_planid,
    requirementid: requirement._id,
    title: '需求提醒',
    content: '尊敬的业主您好：您的设计师【' + designer.username + '】已经配置好了装修合同，请您及时查阅！如有问题请及时与设计师联系，也可以拨打我们的客服热线：400-8515-167',
    html: util.format(user_message_type_designer_config_contract_template, designer.username),
    message_type: type.user_message_type_designer_config_contract,
    status: type.message_status_unread
  };

  saveUserMessageAndPush(user_message);
}

let user_message_type_ys_template =
  '<html>\
<body style="padding-left:10; color:#7c8389; font-size:15">\
<p>尊敬的业主您好：</p>\
<p>【%s】阶段等待您的验收，请您前往确认，谢谢！</p>\
<p>如有问题可以拨打我们的客服热线：<a href="tel:400-8515-167">400-8515-167</a></p>\
</body>\
</html>'
exports.user_message_type_ys = function (process, section) {
  let index = _.indexOf(type.process_work_flow, section);
  let name = type.process_work_flow_name[index];

  let user_message = {
    userid: process.userid,
    designerid: process.final_designerid,
    processid: process._id,
    requirementid: process.requirementid,
    planid: process.final_planid,
    section: section,
    title: '验收提醒',
    content: '尊敬的业主您好：【' + name + '】阶段等待您的验收，请您前往确认，谢谢！如有问题可以拨打我们的客服热线：400-8515-167',
    html: util.format(user_message_type_ys_template, name),
    message_type: type.user_message_type_ys,
    status: type.message_status_unread
  };

  saveUserMessageAndPush(user_message);
}

let user_message_type_designer_remind_ok_house_checked_template =
  '<html>\
<body style="padding-left:10; color:#7c8389; font-size:15">\
<p>尊敬的业主您好：</p>\
<p>您的设计师【%s】已经为您量完房</p>\
<p>为了加快整个流程，请您及时确认！如有问题请及时与设计师联系</p>\
<p>也可以拨打我们的客服热线：<a href="tel:400-8515-167">400-8515-167</a></p>\
</body>\
</html>'
exports.user_message_type_designer_remind_ok_house_checked = function (user, designer, plan) {
  let user_message = {
    userid: user._id,
    designerid: designer._id,
    requirementid: plan.requirementid,
    planid: plan._id,
    title: '需求提醒',
    content: '尊敬的业主您好：您的设计师【' + designer.username + '】已经为您量完房，为了加快整个流程，请您及时确认！如有问题请及时与设计师联系，也可以拨打我们的客服热线：400-8515-167',
    html: util.format(user_message_type_designer_remind_ok_house_checked_template, designer.username),
    message_type: type.user_message_type_designer_remind_ok_house_checked,
    status: type.message_status_unread
  };

  saveUserMessageAndPush(user_message);
}

exports.designer_message_type_platform_notification = function (designer, title, content, html) {
  let designer_message = {
    designerid: designer._id,
    title: title,
    content: content,
    html: html,
    message_type: type.designer_message_type_platform_notification,
    status: type.message_status_unread
  }

  saveDesignerMessageAndPush(designer_message);
}

let designer_message_type_user_reschedule_template =
  '<html>\
<body style="padding-left:10; color:#7c8389; font-size:15">\
<p>设计师您好：</p>\
<p>业主【%s】希望将本阶段工期修改至</p>\
<p style="color:#fe7003; font-size:16">%s</p>\
<p>等待您的确认！如有问题请及时与业主或项目经理联系</p>\
<p>也可以拨打我们的客服热线：<a href="tel:400-8515-167">400-8515-167</a></p>\
</body>\
</html>'
exports.designer_message_type_user_reschedule = function (user, designer, reschedule) {
  let new_date = date_util.YYYY_MM_DD(reschedule.new_date);

  let designer_message = {
    userid: user._id,
    designerid: designer._id,
    processid: reschedule.processid,
    rescheduleid: reschedule._id,
    section: reschedule.section,
    title: '改期提醒',
    content: '设计师您好：业主【' + user.username + '】希望将本阶段工期修改至' + new_date +
      '，等待您的确认！如有问题请及时与业主或项目经理联系，也可以拨打我们的客服热线：400-8515-167',
    html: util.format(designer_message_type_user_reschedule_template, user.username, new_date),
    message_type: type.designer_message_type_user_reschedule,
    status: type.message_status_unread
  };

  saveDesignerMessageAndPush(designer_message);
}

let designer_message_type_user_ok_reschedule_template =
  '<html>\
<body style="padding-left:10; color:#7c8389; font-size:15">\
<p>设计师您好：</p>\
<p>业主【%s】同意了您的改期需求，本阶段工期将会修改至</p>\
<p style="color:#fe7003; font-size:16">%s</p>\
<p>如有问题请及时与业主或项目经理联系</p>\
<p>也可以拨打我们的客服热线：<a href="tel:400-8515-167">400-8515-167</a></p>\
</body>\
</html>'
exports.designer_message_type_user_ok_reschedule = function (user, designer, reschedule) {
  let new_date = date_util.YYYY_MM_DD(reschedule.new_date);

  let designer_message = {
    userid: user._id,
    designerid: designer._id,
    processid: reschedule.processid,
    rescheduleid: reschedule._id,
    section: reschedule.section,
    title: '改期提醒',
    content: '设计师您好：业主【' + user.username + '】同意了您的改期需求，本阶段工期将会修改至' + new_date,
    html: util.format(designer_message_type_user_ok_reschedule_template, user.username, new_date),
    message_type: type.designer_message_type_user_ok_reschedule,
    status: type.message_status_unread
  };

  saveDesignerMessageAndPush(designer_message);
}

let designer_message_type_user_reject_reschedule_template =
  '<html>\
<body style="padding-left:10; color:#7c8389; font-size:15">\
<p>设计师您好：</p>\
<p>业主【%s】不同意您修改本阶段工期至</p>\
<p style="color:#fe7003; font-size:16">%s</p>\
<p>如有问题请及时与业主或项目经理联系</p>\
<p>也可以拨打我们的客服热线：<a href="tel:400-8515-167">400-8515-167</a></p>\
</body>\
</html>'
exports.designer_message_type_user_reject_reschedule = function (user, designer, reschedule) {
  let new_date = date_util.YYYY_MM_DD(reschedule.new_date)

  let designer_message = {
    userid: user._id,
    designerid: designer._id,
    processid: reschedule.processid,
    rescheduleid: reschedule._id,
    section: reschedule.section,
    title: '改期提醒',
    content: '设计师您好：业主【' + user.username + '】不同意您修改本阶段工期至' + new_date,
    html: util.format(designer_message_type_user_reject_reschedule_template, user.username, new_date),
    message_type: type.designer_message_type_user_reject_reschedule,
    status: type.message_status_unread
  };

  saveDesignerMessageAndPush(designer_message);
}

let designer_message_type_user_ok_process_section_template =
  '<html>\
<body style="padding-left:10; color:#7c8389; font-size:15">\
<p>设计师您好：</p>\
<p>业主【%s】已经对比验收完阶段</p>\
<p style="color:#fe7003; font-size:16">%s</p>\
<p>如有问题请及时与业主或项目经理联系</p>\
<p>也可以拨打我们的客服热线：<a href="tel:400-8515-167">400-8515-167</a></p>\
</body>\
</html>'
exports.designer_message_type_user_ok_process_section = function (user, process, section) {
  let index = _.indexOf(type.process_work_flow, section);
  let name = type.process_work_flow_name[index];

  let designer_message = {
    userid: user._id,
    designerid: process.final_designerid,
    requirementid: process.requirementid,
    planid: process.final_planid,
    processid: process._id,
    section: section,
    title: '验收提醒',
    content: '设计师您好：业主【' + user.username + '】已经验收完【' + name + '】阶段，如有问题请及时与业主或项目经理联系，也可以拨打我们的客服热线400-8515-167',
    html: util.format(designer_message_type_user_ok_process_section_template, user.username, name),
    message_type: type.designer_message_type_user_ok_process_section,
    status: type.message_status_unread
  }

  saveDesignerMessageAndPush(designer_message);
}

exports.designer_message_type_comment_plan = function (comment, username) {
  let designer_message = {
    userid: comment.by,
    designerid: comment.to_designerid,
    topicid: comment.topicid,
    commentid: comment._id,
    title: '方案评论',
    content: comment.content,
    message_type: type.designer_message_type_comment_plan,
    status: type.message_status_unread
  }

  saveDesignerCommentAndPush(designer_message, username);
}

exports.designer_message_type_comment_process_item = function (comment, username) {
  let designer_message = {
    userid: comment.usertype === type.role_user ? comment.by : undefined, // 如果评论的人是业主，存业主id
    designerid: comment.to_designerid,
    supervisorid: comment.usertype === type.role_supervisor ? comment.by : undefined, //如果评论的人是监理，存监理id
    topicid: comment.topicid,
    commentid: comment._id,
    section: comment.section,
    item: comment.item,
    title: '工地评论',
    content: comment.content,
    message_type: type.designer_message_type_comment_process_item,
    status: type.message_status_unread
  }

  saveDesignerCommentAndPush(designer_message, username);
}

let designer_message_type_basic_auth_done_template =
  '<html>\
<body style="padding-left:10; color:#7c8389; font-size:15">\
<p>设计师您好：</p>\
<p>您提交的基本信息已经顺利通过审核！</p>\
<p>如有问题可以拨打我们的客服热线：<a href="tel:400-8515-167">400-8515-167</a></p>\
</body>\
</html>'
exports.designer_message_type_basic_auth_done = function (designer) {
  let designer_message = {
    designerid: designer._id,
    title: '系统通知',
    content: '设计师您好：您提交的基本信息已经顺利通过审核！',
    html: designer_message_type_basic_auth_done_template,
    message_type: type.designer_message_type_basic_auth_done,
    status: type.message_status_unread
  }

  saveDesignerMessageAndPush(designer_message);
}

let designer_message_type_basic_auth_reject_template =
  '<html>\
<body style="padding-left:10; color:#7c8389; font-size:15">\
<p>设计师您好：</p>\
<p>您提交的基本信息由于</p>\
<p style="color:#fe7003; font-size:16">%s</p>\
<p>审核没有通过，请修改后重新提交审核！</p>\
<p>如有问题可以拨打我们的客服热线：<a href="tel:400-8515-167">400-8515-167</a></p>\
</body>\
</html>'
exports.designer_message_type_basic_auth_reject = function (designer, auth_message) {
  let designer_message = {
    designerid: designer._id,
    title: '系统通知',
    content: '设计师您好：您提交的基本信息由于【' + auth_message + '】，审核没有通过，请修改后重新提交审核！如有疑问可以拨打我们的客服热线：400-8515-167',
    html: util.format(designer_message_type_basic_auth_reject_template, auth_message),
    message_type: type.designer_message_type_basic_auth_reject,
    status: type.message_status_unread
  }

  saveDesignerMessageAndPush(designer_message);
}

let designer_message_type_uid_auth_done_template =
  '<html>\
<body style="padding-left:10; color:#7c8389; font-size:15">\
<p>设计师您好：</p>\
<p>您提交的身份证和银行卡信息已经顺利通过审核！</p>\
<p>如有问题可以拨打我们的客服热线：<a href="tel:400-8515-167">400-8515-167</a></p>\
</body>\
</html>'
exports.designer_message_type_uid_auth_done = function (designer) {
  let designer_message = {
    designerid: designer._id,
    title: '系统通知',
    content: '设计师您好：您提交的身份证和银行卡信息已经顺利通过审核！',
    html: designer_message_type_uid_auth_done_template,
    message_type: type.designer_message_type_uid_auth_done,
    status: type.message_status_unread
  }

  saveDesignerMessageAndPush(designer_message);
}

let designer_message_type_uid_auth_reject_template =
  '<html>\
<body style="padding-left:10; color:#7c8389; font-size:15">\
<p>设计师您好：</p>\
<p>您提交的身份证和银行卡信息由于</p>\
<p style="color:#fe7003; font-size:16">%s</p>\
<p>审核没有通过，请修改后重新提交审核！</p>\
<p>如有问题可以拨打我们的客服热线：<a href="tel:400-8515-167">400-8515-167</a></p>\
</body>\
</html>'
exports.designer_message_type_uid_auth_reject = function (designer, auth_message) {
  let designer_message = {
    designerid: designer._id,
    title: '系统通知',
    content: '设计师您好：您提交的身份证和银行卡信息由于【' + auth_message + '】，审核没有通过，请修改后重新提交审核！如有疑问可以拨打我们的客服热线：400-8515-167',
    html: util.format(designer_message_type_uid_auth_reject_template, auth_message),
    message_type: type.designer_message_type_uid_auth_reject,
    status: type.message_status_unread
  }

  saveDesignerMessageAndPush(designer_message);
}

let designer_message_type_work_auth_done_template =
  '<html>\
<body style="padding-left:10; color:#7c8389; font-size:15">\
<p>设计师您好：</p>\
<p>您提交的工地信息已经顺利通过审核！</p>\
<p>如有问题可以拨打我们的客服热线：<a href="tel:400-8515-167">400-8515-167</a></p>\
</body>\
</html>'
exports.designer_message_type_work_auth_done = function (designer) {
  let designer_message = {
    designerid: designer._id,
    title: '系统通知',
    content: '设计师您好：您提交的工地信息已经顺利通过审核！',
    html: designer_message_type_work_auth_done_template,
    message_type: type.designer_message_type_work_auth_done,
    status: type.message_status_unread
  }

  saveDesignerMessageAndPush(designer_message);
}

let designer_message_type_work_auth_reject_template =
  '<html>\
<body style="padding-left:10; color:#7c8389; font-size:15">\
<p>设计师您好：</p>\
<p>您提交的工地信息由于</p>\
<p style="color:#fe7003; font-size:16">%s</p>\
<p>审核没有通过，请修改后重新提交审核！</p>\
<p>如有问题可以拨打我们的客服热线：<a href="tel:400-8515-167">400-8515-167</a></p>\
</body>\
</html>'
exports.designer_message_type_work_auth_reject = function (designer, auth_message) {
  let designer_message = {
    designerid: designer._id,
    title: '系统通知',
    content: '设计师您好：您提交的工地信息由于【' + auth_message + '】，审核没有通过，请修改后重新提交审核！如有疑问可以拨打我们的客服热线：400-8515-167',
    html: util.format(designer_message_type_work_auth_reject_template, auth_message),
    message_type: type.designer_message_type_work_auth_reject,
    status: type.message_status_unread
  }

  saveDesignerMessageAndPush(designer_message);
}

let designer_message_type_product_auth_done_template =
  '<html>\
<body style="padding-left:10; color:#7c8389; font-size:15">\
<p>设计师您好：</p>\
<p>您提交的设计案例已经顺利通过审核！</p>\
<p>为了提高匹配率、增加接单的几率，请您上传更多有效作品！</p>\
<p>如有问题可以拨打我们的客服热线：<a href="tel:400-8515-167">400-8515-167</a></p>\
</body>\
</html>'
exports.designer_message_type_product_auth_done = function (designer, product) {
  let designer_message = {
    designerid: designer._id,
    productid: product._id,
    title: '系统通知',
    content: '设计师您好：您提交的设计案例已经顺利通过审核！为了提高匹配率、增加接单的几率，请您上传更多有效作品！',
    html: designer_message_type_product_auth_done_template,
    message_type: type.designer_message_type_product_auth_done,
    status: type.message_status_unread
  }

  saveDesignerMessageAndPush(designer_message);
}

let designer_message_type_product_auth_reject_template =
  '<html>\
<body style="padding-left:10; color:#7c8389; font-size:15">\
<p>设计师您好：</p>\
<p>您提交的设计案例由于</p>\
<p style="color:#fe7003; font-size:16">%s</p>\
<p>审核没有通过，请修改后重新提交审核！</p>\
<p>如有问题可以拨打我们的客服热线：<a href="tel:400-8515-167">400-8515-167</a></p>\
</body>\
</html>'
exports.designer_message_type_product_auth_reject = function (designer, product, auth_message) {
  let designer_message = {
    designerid: designer._id,
    productid: product._id,
    title: '系统通知',
    content: '设计师您好：您提交的设计案例由于【' + auth_message + '】，审核没有通过，请修改后重新提交审核！如有疑问可以拨打我们的客服热线：400-8515-167',
    html: util.format(designer_message_type_product_auth_reject_template, auth_message),
    message_type: type.designer_message_type_product_auth_reject,
    status: type.message_status_unread
  }

  saveDesignerMessageAndPush(designer_message);
}

let designer_message_type_product_auth_illegal_template =
  '<html>\
<body style="padding-left:10; color:#7c8389; font-size:15">\
<p>设计师您好：</p>\
<p>您提交的设计案例由于</p>\
<p style="color:#fe7003; font-size:16">%s</p>\
<p>而下线，请修改后重新提交审核！</p>\
<p>如有问题可以拨打我们的客服热线：<a href="tel:400-8515-167">400-8515-167</a></p>\
</body>\
</html>'
exports.designer_message_type_product_auth_illegal = function (designer, product, auth_message) {
  let designer_message = {
    designerid: designer._id,
    productid: product._id,
    title: '系统通知',
    content: '设计师您好：您提交的设计案例由于【' + auth_message + '】而下线，请修改后重新提交审核！如有疑问可以拨打我们的客服热线：400-8515-167',
    html: util.format(designer_message_type_product_auth_illegal_template, auth_message),
    message_type: type.designer_message_type_product_auth_illegal,
    status: type.message_status_unread
  }

  saveDesignerMessageAndPush(designer_message);
}

let designer_message_type_user_order_template =
  '<html>\
<body style="padding-left:10; color:#7c8389; font-size:15">\
<p>设计师您好：</p>\
<p>业主【%s】预约您上门量房，请及时响应！</p>\
<p>如有问题可以拨打我们的客服热线：<a href="tel:400-8515-167">400-8515-167</a></p>\
</body>\
</html>'
exports.designer_message_type_user_order = function (user, designer, plan) {
  let designer_message = {
    userid: user._id,
    designerid: designer._id,
    requirementid: plan.requirementid,
    planid: plan._id,
    title: '预约提醒',
    content: '设计师您好：业主【' + user.username + '】预约您上门量房，请及时响应！',
    html: util.format(designer_message_type_user_order_template, user.username),
    message_type: type.designer_message_type_user_order,
    status: type.message_status_unread
  }

  saveDesignerMessageAndPush(designer_message);
}

let designer_message_type_user_ok_house_checked_template =
  '<html>\
<body style="padding-left:10; color:#7c8389; font-size:15">\
<p>设计师您好：</p>\
<p>业主【%s】已经确认了量房信息，请您尽快上传方案！</p>\
<p>如有问题可以拨打我们的客服热线：<a href="tel:400-8515-167">400-8515-167</a></p>\
</body>\
</html>'
exports.designer_message_type_user_ok_house_checked = function (user, designer, plan) {
  let designer_message = {
    userid: user._id,
    designerid: designer._id,
    requirementid: plan.requirementid,
    planid: plan._id,
    title: '量房提醒',
    content: '设计师您好：业主【' + user.username + '】已经确认了量房信息，请您尽快上传方案！',
    html: util.format(designer_message_type_user_ok_house_checked_template, user.username),
    message_type: type.designer_message_type_user_ok_house_checked,
    status: type.message_status_unread
  }

  saveDesignerMessageAndPush(designer_message);
}

let designer_message_type_user_unfinal_plan_template =
  '<html>\
<body style="padding-left:10; color:#7c8389; font-size:15">\
<p>设计师您好：</p>\
<p>您提交的方案没有被业主【%s】采纳</p>\
<p>请继续努力不要灰心，下一次一定能成功中标！</p>\
<p>如有问题可以拨打我们的客服热线：<a href="tel:400-8515-167">400-8515-167</a></p>\
</body>\
</html>'
exports.designer_message_type_user_unfinal_plan = function (user, designer, plan) {
  let designer_message = {
    userid: user._id,
    designerid: designer._id,
    requirementid: plan.requirementid,
    planid: plan._id,
    title: '丢标提醒',
    content: '设计师您好：您提交的方案没有被业主【' + user.username + '】采纳，请继续努力不要灰心，下一次一定能成功中标！',
    html: util.format(designer_message_type_user_unfinal_plan_template, user.username),
    message_type: type.designer_message_type_user_unfinal_plan,
    status: type.message_status_unread
  }

  saveDesignerMessageAndPush(designer_message);
}

let designer_message_type_user_final_plan_template =
  '<html>\
<body style="padding-left:10; color:#7c8389; font-size:15">\
<p>设计师您好：</p>\
<p>您提交的方案已经被业主【%s】采纳</p>\
<p>简繁家工作人员会联系您线下签合同</p>\
<p>请及时与业主联系并配置合同设置开工时间</p>\
<p>如有问题可以拨打我们的客服热线：<a href="tel:400-8515-167">400-8515-167</a></p>\
</body>\
</html>';
let designer_message_type_user_final_plan_template_for_design_only =
  '<html>\
<body style="padding-left:10; color:#7c8389; font-size:15">\
<p>设计师您好：</p>\
<p>您提交的方案已经被业主【%s】采纳</p>\
<p>简繁家工作人员会联系您线下签合同</p>\
<p>请及时与业主联系</p>\
<p>如有问题可以拨打我们的客服热线：<a href="tel:400-8515-167">400-8515-167</a></p>\
</body>\
</html>';
exports.designer_message_type_user_final_plan = function (user, designer, plan, work_type) {
  let designer_message = {
    userid: user._id,
    designerid: designer._id,
    requirementid: plan.requirementid,
    planid: plan._id,
    title: '中标提醒',
    message_type: type.designer_message_type_user_final_plan,
    status: type.message_status_unread
  }

  if (work_type === type.work_type_design_only) {
    designer_message.content = '设计师您好：您提交的方案已经被业主【' + user.username + '】采纳，简繁家工作人员会联系您线下签合同，请及时与业主联系!';
    designer_message.html = util.format(designer_message_type_user_final_plan_template_for_design_only, user.username);
  } else {
    designer_message.content = '设计师您好：您提交的方案已经被业主【' + user.username + '】采纳，简繁家工作人员会联系您线下签合同，请及时与业主联系并配置合同设置开工时间!';
    designer_message.html = util.format(designer_message_type_user_final_plan_template, user.username);
  }

  saveDesignerMessageAndPush(designer_message);
}

let designer_message_type_user_ok_contract_template =
  '<html>\
<body style="padding-left:10; color:#7c8389; font-size:15">\
<p>设计师您好：</p>\
<p>业主【%s】已经确认了您的合同信息，请及时与业主联系签署合同！</p>\
<p>请及时与业主联系并进入下一步流程!</p>\
<p>如有问题可以拨打我们的客服热线：<a href="tel:400-8515-167">400-8515-167</a></p>\
</body>\
</html>'
exports.designer_message_type_user_ok_contract = function (user, designer, requirement) {
  let designer_message = {
    userid: requirement.userid,
    designerid: requirement.final_designerid,
    requirementid: requirement._id,
    planid: requirement.final_planid,
    title: '合同提醒',
    content: '设计师您好：业主【' + user.username + '】已经确认了您的合同信息，请及时与业主联系签署合同！',
    html: util.format(designer_message_type_user_ok_contract_template, user.username),
    message_type: type.designer_message_type_user_ok_contract,
    status: type.message_status_unread
  };

  saveDesignerMessageAndPush(designer_message);
}
