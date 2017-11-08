"use strict"

const eventproxy = require('eventproxy');
const BeautifulImage = require('lib/proxy').BeautifulImage;
const Favorite = require('lib/proxy').Favorite;
const tools = require('lib/common/tools');
const _ = require('lodash');
const async = require('async');
const ApiUtil = require('lib/common/api_util');
const type = require('lib/type/type');
const limit = require('lib/middlewares/limit');
const reg_util = require('lib/common/reg_util');
const user_habit_collect = require('lib/business/user_habit_collect');

exports.beautiful_image_homepage = function (req, res, next) {
  let _id = req.body._id;
  let previous_count = req.body.previous_count || 1;
  let next_count = req.body.next_count || 1;
  let userid = ApiUtil.getUserid(req);
  let usertype = ApiUtil.getUsertype(req);
  let ep = eventproxy();
  ep.fail(next);

  BeautifulImage.findOne({
    _id: _id
  }, null, ep.done(function (beautiful_image) {
    if (beautiful_image) {
      beautiful_image = beautiful_image.toObject();
      async.parallel({
        associate: function (callback) {
          BeautifulImage.find({
            _id: {
              $ne: beautiful_image._id
            },
            // house_type: beautiful_image.house_type,
            // dec_style: beautiful_image.dec_style,
            section: beautiful_image.section,
            status: type.beautiful_image_status_public
          }, {
            images: 1
          }, {
            sort: {
              lastupdate: -1
            },
            skip: 0,
            limit: 6
          }, callback);
        },
        top: function (callback) {
          BeautifulImage.find({
            _id: {
              $ne: beautiful_image._id
            },
            status: type.beautiful_image_status_public
          }, {
            images: 1
          }, {
            sort: {
              view_count: -1
            },
            skip: 0,
            limit: 20
          }, callback);
        },
        previous: function (callback) {
          BeautifulImage.paginate({
            section: beautiful_image.section,
            status: type.beautiful_image_status_public,
            lastupdate: {
              $gt: beautiful_image.lastupdate
            }
          }, null, {
            sort: {
              lastupdate: -1
            },
            skip: 0,
            limit: previous_count
          }, function (err, beautiful_images, total) {
            callback(err, {
              beautiful_images: beautiful_images,
              total: total
            });
          });
        },
        next: function (callback) {
          BeautifulImage.paginate({
            section: beautiful_image.section,
            status: type.beautiful_image_status_public,
            lastupdate: {
              $lt: beautiful_image.lastupdate
            }
          }, null, {
            sort: {
              lastupdate: 1
            },
            skip: 0,
            limit: next_count
          }, function (err, beautiful_images, total) {
            callback(err, {
              beautiful_images: beautiful_images,
              total: total
            });
          });
        }
      }, ep.done(function (result) {
        if (result.associate.length < 6) {
          let add = _.sample(result.top, 6 - result.associate.length);
          beautiful_image.associate_beautiful_images = result.associate
            .concat(add);
        } else {
          beautiful_image.associate_beautiful_images = result.associate;
        }
        beautiful_image.previous = result.previous;
        beautiful_image.next = result.next;

        if (userid && usertype !== type.role_admin) {
          Favorite.findOne({
            userid: userid,
            favorite_beautiful_image: _id
          }, null, ep.done(function (favorite) {
            if (favorite) {
              beautiful_image.is_my_favorite = true;
            } else {
              beautiful_image.is_my_favorite = false;
            }
            res.sendData(beautiful_image);
          }));
        } else {
          res.sendData(beautiful_image);
        }
      }));

      limit.perwhatperdaydo('beautiful_image_homepage', req.ip + _id, 1, function () {
        BeautifulImage.incOne({
          _id: _id
        }, {
          view_count: 1
        });
      });

      user_habit_collect.add_beautiful_image_history(userid, usertype, _id);
    } else {
      res.sendData({});
    }
  }));
}

exports.search_beautiful_image = function (req, res, next) {
  let query = req.body.query || {};
  query.status = type.beautiful_image_status_public;
  let sort = req.body.sort || {
    lastupdate: -1
  };
  let skip = req.body.from || 0;
  let limit = req.body.limit || 10;

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

  BeautifulImage.paginate(query, {
    title: 1,
    house_type: 1,
    section: 1,
    dec_style: 1,
    images: 1
  }, {
    sort: sort,
    skip: skip,
    limit: limit
  }, ep.done(function (beautifulImages, total) {
    res.sendData({
      beautiful_images: beautifulImages,
      total: total
    });
  }));
}

exports.top_beautiful_images = function (req, res, next) {
  let ep = new eventproxy();
  ep.fail(next);
  let limit = req.body.limit;

  BeautifulImage.find({
    status: type.beautiful_image_status_public
  }, {
    title: 1,
    house_type: 1,
    section: 1,
    dec_style: 1,
    images: 1
  }, {
    sort: {
      view_count: -1
    },
    skip: 0,
    limit: 50
  }, ep.done(function (beautifulImages) {
    let recs = _.sample(beautifulImages, limit);
    res.sendData(recs);
  }));
}
