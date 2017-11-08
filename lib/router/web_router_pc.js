'use strict'

const express = require('express');
const sign = require('lib/controllers/sign');
const site = require('lib/controllers/site');
const wechat = require('lib/controllers/wechat');
const dec_strategy = require('lib/controllers/dec_strategy');
const home = require('lib/controllers/pc/home');
const designer = require('lib/controllers/pc/designer');
const product = require('lib/controllers/pc/product');
const diary_book = require('lib/controllers/pc/diary_book');
const response_util = require('lib/middlewares/response_util');
const auth = require('lib/middlewares/auth');
const share = require('lib/controllers/pc/share');

var router = express.Router();

// home page
// router.get('/', site.index);
router.get('/', response_util, home.index);
router.get('/index.html|/index.htm', function (req, res) {
  res.redirect('/');
});
router.get('/tpl/user/', response_util, site.homePage);
router.get('/download/user/app', response_util, site.download_user_app);
router.get('/download/user/apk', response_util, site.download_user_apk);
router.get('/download/designer/apk', response_util, site.download_designer_apk);
// router.post('/signup', sign.signup);
// router.post('/login', sign.login);
router.get('/tpl/article/detail.html', response_util, function (req, res) {
  res.redirect(301, '/tpl/article/strategy/' + req.query.pid);
});
router.get('/tpl/article/strategy/:_id', response_util, dec_strategy.dec_strategy_homepage);
router.get('/tpl/designer/:designerid', response_util, designer.designer_page);
router.get('/tpl/product/:productid', response_util, product.product_page);
router.get('/tpl/user/designer/homepage', auth.designerRequired, response_util, designer.designer_my_homepage);
router.get('/tpl/diary/book/:diarySetid', response_util, diary_book.diary_book_page);
router.get('/tpl/go/diary/:diaryid', response_util, diary_book.go_diary);
router.get('/tpl/live/:shareid', response_util, share.share_process_homepage);

router.get('/wechat/user_login_callback', response_util, sign.wechat_user_login_callback);
router.get('/wechat/user_login', sign.wechat_user_login);
router.get('/wechat/user_wenjuan/:wenjuanid', wechat.user_wenjuan);
router.get('/wechat/user_wenjuan_callback/:wenjuanid', response_util, wechat.user_wenjuan_callback);
module.exports = router;
