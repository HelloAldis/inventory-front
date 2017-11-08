var tempUserApi = require('lib/api/v2/web/temp_user');
var sign = require('lib/api/v2/web/sign');
var image = require('lib/api/v2/web/image');
var user = require('lib/api/v2/web/user');
var requirement = require('lib/api/v2/web/requirement');
var plan = require('lib/api/v2/web/plan');
var product = require('lib/api/v2/web/product');
var favorite = require('lib/api/v2/web/favorite');
var team = require('lib/api/v2/web/team');
var share = require('lib/api/v2/web/share');
var designer = require('lib/api/v2/web/designer');
var comment = require('lib/api/v2/web/comment');
var admin = require('lib/api/v2/web/admin');
var feedback = require('lib/api/v2/web/feedback');
var wechat = require('lib/api/v2/web/wechat');
var dec_strategy = require('lib/api/v2/web/dec_strategy');
var beautiful_image = require('lib/api/v2/web/beautiful_image');
var answer = require('lib/api/v2/web/answer');
var message = require('lib/api/v2/web/message');
var diary = require('lib/api/v2/web/diary');
var quotation = require('lib/api/v2/web/quotation');

var processApp = require('lib/api/v2/app/process');

var config = require('lib/config/apiconfig');
var auth = require('lib/middlewares/auth');
var limit = require('lib/middlewares/limit');

var express = require('express');
var router = express.Router();

var multer = require('multer')
var storage = multer.memoryStorage();
var upload = multer({
  limits: '3mb',
  storage: storage
});

//未登录用户拥有的功能
router.post('/send_verify_code', limit.peripperday('send_verify_code', config.send_verify_code_per_day), sign.sendVerifyCode); //发送验证码
router.post('/verify_phone', sign.verifyPhone); //验证手机
router.post('/check_verify_code', sign.check_verify_code); //验证手机
router.post('/signup', sign.signup); //web端注册
router.post('/login', sign.login); //web端登录
router.post('/update_pass', sign.updatePass); //修改密码
router.post('/add_angel_user', tempUserApi.add); //提交天使用户
router.post('/search_share', share.search_share); //获取装修直播分享
router.get('/image/:_id', image.get); //获取图片
router.post('/imagemeta', image.imagemeta); //获取图片meta
router.get('/thumbnail/:width/:_id', image.thumbnail); //获取缩略图
router.get('/thumbnail2/:width/:height/:_id', image.thumbnail2); //获取缩略图2
router.get('/watermark/:width/:_id', image.watermark); //获取有水印图
router.post('/designer/search', designer.search); //搜索设计师
router.post('/designer_home_page', designer.designer_home_page); //游客获取设计师的主页
router.post('/search_designer_product', product.search_designer_product); //游客获取设计师作品
router.post('/product_home_page', product.product_home_page); //游客获取设计师作品
router.get('/verify_email/:key/:phone/:type', sign.verify_email); //游客验证邮箱
router.post('/beautiful_image_homepage', beautiful_image.beautiful_image_homepage); //游客获取美图主页
router.post('/search_beautiful_image', beautiful_image.search_beautiful_image); //游客搜索美图
router.post('/top_articles', dec_strategy.top_articles); //top文章
router.post('/search_article', dec_strategy.search_article); //搜索文章
router.post('/top_designers', designer.top_designers); //top设计师
router.post('/top_designer_activity', designer.top_designer_activity);
//wechat api
router.post('/wechat/receive', wechat.receive); //接收微信平台消息
router.get('/wechat/receive', wechat.signature); //认证微信平台
router.post('/image/upload', upload.single('Filedata'), image.add); //上传图片
router.post('/one_plan', plan.getOne); //获取某个方案信息
router.post('/search_diary_set', diary.search_diary_set); // 游客搜索日记集
router.post('/search_diary', diary.search_diary); // 游客搜索日记
router.post('/top_diary_set', diary.top_diary_set); // 游客热门日记集
router.post('/topic_comments', comment.topic_comments); //获取评论
router.post('/generate_quotation', quotation.generate_quotation); //获取报价

//通用用户功能
router.post('/signout', auth.normalUserRequired, sign.signout); //登出
// router.post('/image/upload', auth.normalUserRequired, upload.single('Filedata'),image.add); //上传图片
router.post('/image/crop', auth.normalUserRequired, image.crop); //上传图片
router.post('/favorite/product/list', auth.normalUserRequired, favorite.list_product); //收藏列表
router.post('/favorite/product/add', auth.normalUserRequired, favorite.add_product); //收藏作品
router.post('/favorite/product/delete', auth.normalUserRequired, favorite.delete_product); //删除收藏作品
router.post('/favorite/beautiful_image/list', auth.normalUserRequired, favorite.list_beautiful_image); //收藏美图列表
router.post('/favorite/beautiful_image/add', auth.normalUserRequired, favorite.add_beautiful_image); //收藏美图
router.post('/favorite/beautiful_image/delete', auth.normalUserRequired, favorite.delete_beautiful_image); //删除收藏美图
router.post('/favorite/diary/add', auth.normalUserRequired, favorite.add_diary); //点赞日记
router.post('/favorite/diarySet/list', auth.normalUserRequired, favorite.list_diary_set); //收藏日记本列表
router.post('/favorite/diarySet/add', auth.normalUserRequired, favorite.add_diary_set); //收藏日记本
router.post('/favorite/diarySet/delete', auth.normalUserRequired, favorite.delete_diary_set); //取消收藏日记本
router.post('/add_comment', auth.normalUserRequired, comment.add_comment); //添加评论
router.post('/one_contract', auth.normalUserRequired, requirement.one_contract); //获取某个合同信息             --- 未来要废弃
router.post('/send_verify_email', auth.normalUserRequired, sign.send_verify_email); //发送验证邮箱邮件
router.get('/download_contract/:_id', auth.normalUserRequired, requirement.download_contract); //下载合同
router.post('/upload_wenjuan_answer', auth.normalUserRequired, answer.upload_wenjuan_answer); //提交问卷答案
router.post('/check_wenjuan_answer', auth.normalUserRequired, answer.check_wenjuan_answer); //获取我的问卷状态
router.post('/add_diary_set', auth.normalUserRequired, diary.add_diary_set); // 用户添加日记集
router.post('/my_diary_set', auth.normalUserRequired, diary.my_diary_set); // 用户我的日记集
router.post('/update_diary_set', auth.normalUserRequired, diary.update_diary_set); // 用户更新日记集
router.post('/add_diary', auth.normalUserRequired, diary.add_diary); // 用户添加日记
router.post('/delete_diary', auth.normalUserRequired, diary.delete_diary); // 用户删除日记

//业主独有功能
router.post('/user/info', auth.userRequired, user.user_update_info); //修改业主个人资料
router.post('/user/info/get', auth.userRequired, user.user_my_info); //获取业主个人资料
router.post('/user_add_requirement', auth.userRequired, requirement.user_add_requirement); //提交我的装修需求             --- 未来要废弃
router.post('/user_update_requirement', auth.userRequired, requirement.user_update_requirement); //更新我的装修需求             --- 未来要废弃
router.post('/user_my_requirement_list', auth.userRequired, requirement.user_my_requirement_list); //获取我的装修需求列表        --- 未来要废弃
router.post('/user_one_requirement', auth.userRequired, requirement.user_one_requirement); //业主获取我的某个需求
router.post('/user_requirement_detail', auth.userRequired, requirement.user_requirement_detail); // 业主获取需求详情
router.post('/designers_user_can_order', auth.userRequired, designer.designers_user_can_order); //获取用户可以预约的设计师        --- 未来要废弃
router.post('/favorite/designer/list', auth.userRequired, favorite.list_designer); //获取业主的意向设计师列表
router.post('/favorite/designer/add', auth.userRequired, favorite.add_designer); //添加设计师到意向列表
router.post('/favorite/designer/delete', auth.userRequired, favorite.delete_designer); //把设计师从意向列表删除
router.post('/user_order_designer', auth.userRequired, user.order_designer); //预约量房        --- 未来要废弃
router.post('/user_change_ordered_designer', auth.userRequired, user.user_change_ordered_designer); //业主更换预约了的设计师        --- 未来要废弃
router.post('/user_ordered_designers', auth.userRequired, designer.user_ordered_designers); //获取预约了的设计师         --- 未来要废弃
router.post('/user_requirement_plans', auth.userRequired, plan.user_requirement_plans); //业主某个需求的方案         --- 未来要废弃
router.post('/designer_house_checked', auth.userRequired, user.designer_house_checked); //确认设计师量完房         --- 未来要废弃
router.post('/user/plan/final', auth.userRequired, plan.finalPlan); //选定方案         --- 未来要废弃
router.post('/user_evaluate_designer', auth.userRequired, user.user_evaluate_designer); //业主评价设计师
router.post('/user_statistic_info', auth.userRequired, user.user_statistic_info); //业主获取自己统计信息
router.post('/user_bind_wechat', auth.userRequired, user.user_bind_wechat); //业主绑定微信
router.post('/user_bind_phone', auth.userRequired, user.user_bind_phone); //业主绑定手机号
router.post('/user/process', auth.userRequired, processApp.start); //开启装修流程         --- 未来要废弃
router.post('/search_user_message', auth.userRequired, message.search_user_message); //搜索业主通知
router.post('/user_message_detail', auth.userRequired, message.user_message_detail); //业主通知详情
router.post('/delete_user_message', auth.userRequired, message.delete_user_message); //删除业主消息
router.post('/unread_user_message_count', auth.userRequired, message.unread_user_message_count); //未读消息个数
router.post('/search_user_comment', auth.userRequired, message.search_user_comment); //获取业主的评论通知
router.post('/read_user_message', auth.userRequired, message.read_user_message); //业主标记消息已读

//设计师独有功能
router.post('/designer/agree', auth.designerRequired, designer.agree); //同意条款
router.post('/designer/info', auth.designerRequired, designer.updateInfo); //修改设计师个人资料
router.post('/designer/no_review_info', auth.designerRequired, designer.updateNoReviewInfo); //修改设计师个人资料
router.post('/designer/update_business_info', auth.designerRequired, designer.update_business_info); //修改设计师个人资料
router.post('/designer/info/get', auth.designerRequired, designer.getInfo); //获取设计师自己个人资料
router.post('/designer/uid_bank_info', auth.designerRequired, designer.uid_bank_info); //更新银行卡信息
router.post('/designer/email_info', auth.designerRequired, designer.email_info); //更新邮箱信息
router.post('/designer/product', auth.designerRequired, product.designer_my_products); //设计师获取自己的作品列表
router.post('/designer/product/one', auth.designerRequired, product.designer_one_product); //设计师获取自己的某个作品
router.post('/designer/product/add', auth.designerRequired, product.add); //上传作品
router.post('/designer/product/update', auth.designerRequired, product.update); //更新作品
router.post('/designer/product/delete', auth.designerRequired, product.delete); //删除作品
router.post('/designer/team/get', auth.designerRequired, team.list); //获取施工队伍
router.post('/designer/team/one', auth.designerRequired, team.designer_one_team); //设计师获取自己的某个施工队伍
router.post('/designer/team/add', auth.designerRequired, team.add); //添加施工队伍
router.post('/designer/team/update', auth.designerRequired, team.update); //更新施工队伍
router.post('/designer/team/delete', auth.designerRequired, team.delete); //删除施工队伍
router.post('/designer/update_online_status', auth.designerRequired, designer.update_online_status); //更改在线状态
router.post('/designer_my_requirement_list', auth.designerRequired, requirement.designer_my_requirement_list); //设计获取和自己相关的需求列表
router.post('/designer_my_requirement_history_list', auth.designerRequired, requirement.designer_my_requirement_history_list); //设计获取和自己相关的放弃的历史需求列表
router.post('/designer_one_requirement', auth.designerRequired, requirement.designer_one_requirement); //设计师获取某个需求
router.post('/designer/user/ok', auth.designerRequired, designer.okUser); //响应业主
router.post('/designer/user/reject', auth.designerRequired, designer.rejectUser); //拒绝业主
router.post('/designer/plan/add', auth.designerRequired, plan.add); //提交方案
router.post('/designer/plan/update', auth.designerRequired, plan.update); //更新方案
router.post('/designer_requirement_plans', auth.designerRequired, plan.designer_requirement_plans); //设计师获取某个需求下的方案
router.post('/config_contract', auth.designerRequired, requirement.config_contract); //配置合同
router.post('/designer_statistic_info', auth.designerRequired, designer.designer_statistic_info); //设计师获取自己统计信息
router.post('/search_designer_message', auth.designerRequired, message.search_designer_message); //搜索设计师通知
router.post('/designer_message_detail', auth.designerRequired, message.designer_message_detail); //设计师通知详情
router.post('/delete_designer_message', auth.designerRequired, message.delete_designer_message); //删除设计师消息
router.post('/unread_designer_message_count', auth.designerRequired, message.unread_designer_message_count); //未读消息个数
router.post('/search_designer_comment', auth.designerRequired, message.search_designer_comment); //获取设计师的评论通知
router.post('/read_designer_message', auth.designerRequired, message.read_designer_message); //设计师标记通知已读
router.post('/designer_remind_user_house_check', auth.designerRequired, limit.peruserplanperday('designer_remind_user_house_check', config.designer_remind_user_house_check_time_one_day),
  designer.designer_remind_user_house_check); //设计师提醒业主确认量房

//管理员独有的功能
router.post('/admin/login', admin.login); //审核设计师
router.post('/admin/update_basic_auth', auth.adminRequired, admin.update_basic_auth); //更改设计师基本信息认证
router.post('/admin/update_uid_auth', auth.adminRequired, admin.update_uid_auth); //更改设计师身份证信息认证
router.post('/admin/update_work_auth', auth.adminRequired, admin.update_work_auth); //更改设计师工地信息认证
router.post('/admin/share/search', auth.adminRequired, admin.search_share); //搜索分享
router.post('/admin/share/add', auth.adminRequired, admin.add); //创建直播分享
router.post('/admin/share/update', auth.adminRequired, admin.update); //更新直播分享
router.post('/admin/share/delete', auth.adminRequired, admin.delete); //删除直播分享
router.post('/admin/search_designer', auth.adminRequired, admin.searchDesigner); //搜索设计师
router.post('/admin/search_user', auth.adminRequired, admin.searchUser); //搜索业主
router.post('/admin/designer/:_id', auth.adminRequired, admin.getDesigner); //获取设计师信息
router.post('/admin/search_team', auth.adminRequired, admin.search_team); //搜索设计师的团队
router.post('/admin/api_statistic', auth.adminRequired, admin.api_statistic); //获取Api调用数据统计
router.post('/admin/feedback/search', auth.adminRequired, feedback.search); //获取用户反馈
router.post('/admin/product/search', auth.adminRequired, admin.searchProduct); //搜素作品
router.post('/admin/update_product_auth', auth.adminRequired, admin.update_product_auth); //搜素作品
router.post('/admin/requirement/search', auth.adminRequired, admin.search_requirement); //搜素需求
router.post('/admin/update_team', auth.adminRequired, admin.update_team); //管理员更新装修团队信息
router.post('/admin/update_designer_online_status', auth.adminRequired, admin.update_designer_online_status); //管理员更新设计师在线状态
router.post('/admin/search_plan', auth.adminRequired, admin.search_plan); //管理员搜索方案
router.post('/admin/search_angel_user', auth.adminRequired, tempUserApi.search_temp_user); //搜索天使用户
router.post('/admin/search_process', auth.adminRequired, admin.search_process); //管理员搜索工地
router.get('/admin/ueditor', auth.adminRequired, admin.ueditor_get); //ueditor
router.post('/admin/ueditor', auth.adminRequired, upload.single('Filedata'), admin.ueditor_post); //ueditor
router.post('/admin/add_article', auth.adminRequired, admin.add_article); //提交文章
router.post('/admin/update_article', auth.adminRequired, admin.update_article); //更新文章
router.post('/admin/search_article', auth.adminRequired, admin.search_article); //搜索文章
router.post('/admin/add_beautiful_image', auth.adminRequired, admin.add_beautiful_image); //提交文章
router.post('/admin/update_beautiful_image', auth.adminRequired, admin.update_beautiful_image); //更新文章
router.post('/admin/search_beautiful_image', auth.adminRequired, admin.search_beautiful_image); //搜索文章
router.post('/admin/search_answer', auth.adminRequired, admin.search_answer); // 搜索问卷答案
router.post('/admin/count_answer', auth.adminRequired, admin.count_answer); // 统计问卷答案
router.post('/admin/add_supervisor', auth.adminRequired, admin.add_supervisor); // 添加监理
router.post('/admin/statistic_info', auth.adminRequired, admin.statistic_info); // 数据统计
router.post('/admin/update_designer', auth.adminRequired, admin.update_designer); // 更新设计师信息
router.post('/admin/search_diary', auth.adminRequired, admin.search_diary); // 搜索日记
router.post('/admin/delete_diary', auth.adminRequired, admin.delete_diary); // 删除日记
router.post('/admin/search_comment', auth.adminRequired, admin.search_comment); // 搜索评论
router.post('/admin/forbid_comment', auth.adminRequired, admin.forbid_comment); // 屏蔽评论
router.post('/admin/search_supervisor', auth.adminRequired, admin.search_supervisor); // 搜索监理
router.post('/admin/assign_supervisor', auth.adminRequired, admin.assign_supervisor); // 指派监理到工地
router.post('/admin/unassign_supervisor', auth.adminRequired, admin.unassign_supervisor); // 移除指派了的监理
router.post('/admin/search_image', auth.adminRequired, admin.search_image); // 搜索图片
router.post('/admin/delete_image', auth.adminRequired, admin.delete_image); // 搜索图片
router.post('/admin/add_user', auth.adminRequired, admin.add_user); // 添加业主
router.post('/admin/push_message_to_user', auth.adminRequired, admin.push_message_to_user); // 推送消息给业主
router.post('/admin/push_message_to_designer', auth.adminRequired, admin.push_message_to_designer); // 推送消息给设计师
router.post('/admin/add_requirement', auth.adminRequired, admin.add_requirement); // 添加业主需求
router.post('/admin/assign_designer_to_requirement', auth.adminRequired, user.order_designer) // 指派设计师到需求
router.post('/admin/designer_house_checked', auth.adminRequired, user.designer_house_checked); // 确认某个设计师已经为业主量完房
router.post('/admin/user_final_plan', auth.adminRequired, plan.finalPlan); // 为业主选定方案
router.post('/admin/start_process', auth.adminRequired, processApp.start); // 开启装修流程
router.post('/admin/requirement_detail', auth.adminRequired, admin.requirement_detail); // 获取需求详情
router.post('/admin/update_user_info', auth.adminRequired, admin.update_user_info); // 更新业主个人信息
router.post('/admin/update_requirement', auth.adminRequired, admin.update_requirement); // 更新需求
router.post('/admin/search_quotation', auth.adminRequired, admin.search_quotation); // 搜索报价

module.exports = router;
