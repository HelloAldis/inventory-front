"use strict";

const eventproxy = require('eventproxy');
const BeautifulImage = require('lib/proxy').BeautifulImage;
const Favorite = require('lib/proxy').Favorite;
const tools = require('lib/common/tools');
const async = require('async');
const ApiUtil = require('lib/common/api_util');
const reg_util = require('lib/common/reg_util');
const type = require('lib/type/type');

exports.search_beautiful_image = function (req, res, next) {
  let query = req.body.query || {};
  query.status = type.beautiful_image_status_public;
  let sort = req.body.sort || {
    lastupdate: -1
  };
  let skip = req.body.from || 0;
  let limit = req.body.limit || 10;
  let userid = ApiUtil.getUserid(req);
  let usertype = ApiUtil.getUsertype(req);

  let ep = eventproxy();
  ep.fail(next);

  let search_word = req.body.search_word;
  if (search_word && search_word.trim().length > 0) {
    search_word = reg_util.reg(tools.trim(search_word), 'i');
    query['$or'] = [{
      title: search_word
    }, {
      description: search_word
    }, {
      keywords: search_word
    }];
  }

  BeautifulImage.paginate(query, null, {
    sort: sort,
    skip: skip,
    limit: limit,
    lean: true
  }, ep.done(function (beautiful_images, total) {
    async.mapLimit(beautiful_images, 3, function (beautiful_image, callback) {
      if (userid && usertype !== type.role_admin) {
        Favorite.findOne({
          userid: userid,
          favorite_beautiful_image: beautiful_image._id
        }, {
          userid: 1
        }, function (err, favorite) {
          if (favorite) {
            beautiful_image.is_my_favorite = true;
          } else {
            beautiful_image.is_my_favorite = false;
          }
          callback(err, beautiful_image);
        });
      } else {
        beautiful_image.is_my_favorite = false;
        callback(null, beautiful_image);
      }
    }, ep.done(function (beautiful_images) {
      res.sendData({
        beautiful_images: beautiful_images,
        total: total
      });
    }));
  }));
}
