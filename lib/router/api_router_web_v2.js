
var admin = require('lib/api/v1/web/admin');

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

//管理员独有的功能
router.post('/admin/login', admin.login); 

module.exports = router;
