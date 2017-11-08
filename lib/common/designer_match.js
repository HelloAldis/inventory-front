'use strict'

const _ = require('lodash');
const type = require('lib/type/type');
const config = require('lib/config/apiconfig');

exports.designer_match = function (designer, requirement) {
  let price_perm = requirement.total_price * 10000 / requirement.house_area;
  designer.match = 0;

  //匹配区域
  if (_.indexOf(designer.dec_districts, requirement.district) >= 0) {
    designer.match++;
  }

  //匹配钱
  if (requirement.work_type === type.work_type_half) {
    if (Math.abs(designer.dec_fee_half - price_perm) < 100) {
      designer.match++;
    }
  } else if (requirement.work_type === type.work_type_all) {
    if (Math.abs(designer.dec_fee_all <= price_perm) < 100) {
      designer.match++;
    }
  } else if (requirement.work_type === type.work_type_design_only) {
    // No logic here
  }

  //匹配风格
  if (_.indexOf(designer.dec_styles, requirement.dec_style) >= 0) {
    designer.match++;
  }

  //匹配沟通
  if ((requirement.communication_type === designer.communication_type) || (
      requirement.communication_type === type.communication_type_free) || (
      designer.communication_type === type.communication_type_free)) {
    designer.match++;
  }

  //匹配房型
  if (_.indexOf(designer.dec_house_types, requirement.house_type) >=
    0 || !requirement.house_type) {
    designer.match++;
  }

  //匹配装修类型
  if (_.indexOf(designer.dec_types, requirement.dec_type) >= 0) {
    designer.match++;
  }

  //匹配性别
  if ((designer.sex === requirement.prefer_sex) || requirement.prefer_sex === type.sex_no_limit) {
    designer.match++;
  }

  let baseMatch = designer.score > 80 ? 50 : parseInt(designer.score / 1.6);

  designer.match = baseMatch + designer.match * 7;
}

exports.top_designers = function (designers, requirement) {
  //计算设计师的匹配度
  _.forEach(designers, function (designer) {
    exports.designer_match(designer, requirement);
  });

  //找到3个最高匹配的设计师
  let tops = [];
  for (let i = 0; i < config.recommend_designer_count; i++) {
    let topIndex = 0;
    for (let j = 1; j < designers.length; j++) {
      if (designers[j].match > designers[topIndex].match) {
        topIndex = j;
      }
    }

    if (designers.length > 0) {
      tops.push(designers[topIndex]);
      designers.splice(topIndex, 1);
    }
  }

  return tops.reverse();
}
