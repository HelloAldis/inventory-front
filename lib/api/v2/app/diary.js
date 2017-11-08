"use strict"

const eventproxy = require('eventproxy');
const DiarySet = require('lib/proxy').DiarySet;
const Diary = require('lib/proxy').Diary;
const User = require('lib/proxy').User;
const async = require('async');
const ApiUtil = require('lib/common/api_util');
const favorite_business = require('lib/business/favorite_business');

exports.get_diary_changes = function (req, res, next) {
  const diaryids = req.body.diaryids;
  const ep = new eventproxy();
  ep.fail(next);

  async.mapLimit(diaryids, 3, function (diaryid, callback) {
    Diary.findOne({
      _id: diaryid
    }, {
      favorite_count: 1,
      view_count: 1,
      comment_count: 1
    }, callback);
  }, ep.done(function (result) {
    res.sendData(result);
  }));
}

exports.diary_info = function (req, res, next) {
  const diaryid = req.body.diaryid;
  const userid = ApiUtil.getUserid(req);
  const usertype = ApiUtil.getUsertype(req);
  const ep = new eventproxy();
  ep.fail(next);

  Diary.findOne({
    _id: diaryid
  }, {
    favorite_count: 1,
    view_count: 1,
    comment_count: 1,
    diarySetid: 1
  }, ep.done(function (diary) {
    if (diary) {
      favorite_business.is_favorite_diary(userid, usertype, diaryid, function (err, is_my_favorite) {
        diary = diary.toObject();
        diary.is_my_favorite = is_my_favorite;
        res.sendData(diary);
      });

      Diary.incOne({
        _id: diaryid
      }, {
        view_count: 1
      });

      DiarySet.incOne({
        _id: diary.diarySetid
      }, {
        view_count: 1
      });
    } else {
      res.sendData({
        _id: diaryid,
        is_deleted: true
      });
    }
  }));
}

exports.diary_set_info = function (req, res, next) {
  const diarySetid = req.body.diarySetid;
  const userid = ApiUtil.getUserid(req);
  const usertype = ApiUtil.getUsertype(req);
  const ep = new eventproxy();
  ep.fail(next);

  async.parallel({
    diarySet: function (callback) {
      DiarySet.findOne({
        _id: diarySetid
      }, null, callback);
    },
    diaries: function (callback) {
      Diary.find({
        diarySetid: diarySetid
      }, null, {
        sort: {
          create_at: -1
        },
        lean: true
      }, ep.done(function (diaries) {
        async.mapLimit(diaries, 3, function (diary, callback) {
          async.parallel({
            is_my_favorite: function (callback) {
              favorite_business.is_favorite_diary(userid, usertype, diary._id, callback);
            }
          }, function (err, result) {
            diary.is_my_favorite = result.is_my_favorite;
            callback(err, diary);
          });
        }, callback);
      }));
    },
    is_my_favorite: function (callback) {
      favorite_business.is_favorite_diary_set(userid, usertype, diarySetid, callback);
    }
  }, ep.done(function (result) {
    if (result.diarySet) {
      User.findOne({
        _id: result.diarySet.authorid
      }, {
        username: 1,
        imageid: 1
      }, ep.done(function (author) {
        result.diarySet = result.diarySet.toObject();
        result.diarySet.diaries = result.diaries;
        result.diarySet.author = author;
        result.diarySet.is_my_favorite = result.is_my_favorite;
        delete result.is_my_favorite;
        res.sendData(result.diarySet);
      }));
    } else {
      res.sendData({});
    }

    DiarySet.incOne({
      _id: diarySetid
    }, {
      view_count: 1
    });
  }));
}
