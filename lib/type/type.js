/**
 * config
 */

var type = {
  designer_auth_type_new: '0',
  designer_auth_type_processing: '1',
  designer_auth_type_done: '2',
  designer_auth_type_reject: '3',
  designer_auth_type_illegal: '4',

  product_auth_type_new: '0',
  product_auth_type_done: '1',
  product_auth_type_reject: '2',
  product_auth_type_illegal: '3',

  designer_agree_type_new: '0',
  designer_agree_type_yes: '1',

  requirement_status_new: '0',
  requirement_status_not_respond: '1',
  requirement_status_respond_no_housecheck: '2',
  requirement_status_housecheck_no_plan: '6',
  requirement_status_plan_not_final: '3',
  requirement_status_final_plan: '4',
  requirement_status_config_contract: '7',
  requirement_status_config_process: '5',
  requirement_status_done_process: '8',

  plan_status_not_respond: '0',
  plan_status_designer_reject: '1',
  plan_status_designer_no_respond_expired: '7',
  plan_status_designer_respond_no_housecheck: '2',
  plan_status_designer_housecheck_no_plan: '6',
  plan_status_designer_no_plan_expired: '8',
  plan_status_designer_upload: '3',
  plan_status_user_not_final: '4',
  plan_status_user_final: '5',
  plan_status_designer_expired: '9', //业主选定方案后，未上传方案的设计师都是过期状态

  role_admin: '0',
  role_user: '1',
  role_designer: '2',
  role_supervisor: '3',

  work_type_half: '0',
  work_type_all: '1',
  work_type_design_only: '2',

  process_item_status_new: '0',
  process_item_status_going: '1',
  process_item_status_done: '2',
  process_item_status_reschedule_req_new: '3',
  process_item_status_reschedule_ok: '4',
  process_item_status_reschedule_reject: '5',

  process_section_kai_gong: 'kai_gong',
  process_section_chai_gai: 'chai_gai',
  process_section_shui_dian: 'shui_dian',
  process_section_ni_mu: 'ni_mu',
  process_section_you_qi: 'you_qi',
  process_section_an_zhuang: 'an_zhuang',
  process_section_jun_gong: 'jun_gong',
  process_section_done: 'done',

  process_work_flow: ['kai_gong', 'chai_gai', 'shui_dian', 'ni_mu', 'you_qi',
    'an_zhuang', 'jun_gong', 'done'
  ],

  process_work_flow_name: ['开工', '拆改', '水电', '泥木', '油漆', '安装', '竣工'],

  procurement_notification_message: ['', '', '水电材料', '蹲便器（及水箱）、防水涂料以及石膏角线、墙地砖、水泥、沙、地漏、泥工材料、木工工程相关材料',
    '油漆工程相关材料',
    '石材、洁具、厨卫吊顶、五金、厨柜、水槽、烟机灶具、木地板、木门、面板、灯具、墙纸', ''
  ],

  message_type_reschedule: '0',
  message_type_procurement: '1',
  message_type_pay: '2',
  message_type_user_ys: '3',

  platform_android_app: '0',
  platform_ios_app: '1',
  platform_pc: '2',
  platform_wechat: '3',
  platform_admin: '4',
  platform_ios_web: '5',
  platform_android_web: '6',

  online_status_on: '0',
  online_status_off: '1',

  comment_status_all_read: '0',
  comment_status_need_user_read: '1',
  comment_status_need_designer_read: '2',

  topic_type_plan: '0',
  topic_type_process_item: '1',
  topic_type_diary: '2',

  evaluation_is_anonymous_no: '0',
  evaluation_is_anonymous_yes: '1',

  sex_man: '0',
  sex_female: '1',
  sex_no_limit: '2',

  communication_type_free: '0',
  communication_type_expressive: '1',
  communication_type_listener: '2',

  design_fee_range_50_100: '0',
  design_fee_range_100_200: '1',
  design_fee_range_200_300: '2',
  design_fee_range_300: '3',

  wechat_MsgType_text: 'text',
  wechat_MsgType_event: 'event',
  wechat_Event_subscribe: 'subscribe',
  wechat_Event_SCAN: 'SCAN',
  wechat_token: 'wechat_token',

  articletype_dec_strategy: '0',
  articletype_dec_tip: '1',

  article_status_private: '0',
  article_status_public: '1',

  beautiful_image_status_private: '0',
  beautiful_image_status_public: '1',

  share_status_private: '0',
  share_status_public: '1',

  share_progress_going: '0',
  share_progress_done: '1',

  user_message_type_designer_reschedule: '0',
  user_message_type_procurement: '1',
  user_message_type_pay: '2',
  user_message_type_ys: '3',
  user_message_type_platform_notification: '4',
  user_message_type_comment_plan: '5',
  user_message_type_comment_process_item: '6',
  user_message_type_designer_respond: '7',
  user_message_type_designer_reject: '8',
  user_message_type_designer_upload_plan: '9',
  user_message_type_designer_config_contract: '10',
  user_message_type_designer_reject_reschedule: '11',
  user_message_type_designer_ok_reschedule: '12',
  user_message_type_designer_remind_ok_house_checked: '13',
  user_message_type_comment_diary: '14',

  designer_message_type_user_reschedule: '0',
  designer_message_type_procurement: '1',
  designer_message_type_platform_notification: '2',
  designer_message_type_comment_plan: '3',
  designer_message_type_comment_process_item: '4',
  designer_message_type_basic_auth_done: '5',
  designer_message_type_basic_auth_reject: '6',
  designer_message_type_uid_auth_done: '7',
  designer_message_type_uid_auth_reject: '8',
  designer_message_type_work_auth_done: '9',
  designer_message_type_work_auth_reject: '10',
  designer_message_type_product_auth_done: '11',
  designer_message_type_product_auth_reject: '12',
  designer_message_type_product_auth_illegal: '13',
  designer_message_type_user_order: '14',
  designer_message_type_user_ok_house_checked: '15',
  designer_message_type_user_final_plan: '16',
  designer_message_type_user_unfinal_plan: '17',
  designer_message_type_user_ok_contract: '18',
  designer_message_type_user_reject_reschedule: '19',
  designer_message_type_user_ok_reschedule: '20',
  designer_message_type_user_ok_process_section: '21',

  message_status_unread: '0',
  message_status_readed: '1',

  dec_type_home: '0',
  dec_type_business: '1',

  requirement_package_type_default: '0',
  requirement_package_type_365: '1',
  requirement_package_type_jiangxin: '2'
}

module.exports = type;
