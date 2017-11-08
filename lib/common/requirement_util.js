'use strict'

const type = require('lib/type/type');

exports.isDone = function (requirement) {
  if (!requirement) {
    return false;
  }

  if ((requirement.status === type.requirement_status_done_process) || (requirement.work_type === type.work_type_design_only &&
      requirement.status === type.requirement_status_final_plan)) {
    return true;
  } else {
    return false;
  }
}

exports.merge2BasciAddress = function (cell, cell_phase) {
  if (cell_phase) {
    return cell + cell_phase + '期';
  }

  return cell;
}

exports.merge2DetailAddress = function (cell_building, cell_unit, cell_detail_number) {
  let detailAddress = '';

  if (cell_building) {
    detailAddress += cell_building + '栋'
  }

  if (cell_unit) {
    detailAddress += cell_unit + '单元'
  }

  if (cell_detail_number) {
    detailAddress += cell_detail_number + '室'
  }

  return detailAddress;
}
