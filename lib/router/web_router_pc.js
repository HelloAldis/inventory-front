'use strict'

const express = require('express');
const sign = require('lib/controllers/sign');
const site = require('lib/controllers/site');

const response_util = require('lib/middlewares/response_util');
const auth = require('lib/middlewares/auth');

var router = express.Router();

// home page
router.get('/', response_util, home.index);
router.get('/index.html|/index.htm', function (req, res) {
  res.redirect('/');
});
router.get('/download/inventory/app', response_util, site.download_user_app);

module.exports = router;
