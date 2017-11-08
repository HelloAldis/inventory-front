"use strict"

const eventproxy = require('eventproxy');
const DiarySet = require('lib/proxy').DiarySet;
const Diary = require('lib/proxy').Diary;
const User = require('lib/proxy').User;
const Comment = require('lib/proxy').Comment;
const UserMessage = require('lib/proxy').UserMessage;
const tools = require('lib/common/tools');
const _ = require('lodash');
const async = require('async');
const ApiUtil = require('lib/common/api_util');
const favorite_business = require('lib/business/favorite_business');
const push_url = require('lib/business/push_url');

exports.add_diary_set = function (req, res, next) {
  const diarySet = ApiUtil.buildDiarySet(req);
  const authorid = ApiUtil.getUserid(req);
  const usertype = ApiUtil.getUsertype(req);
  diarySet.authorid = authorid;
  diarySet.usertype = usertype;

  const ep = new eventproxy();
  ep.fail(next);

  DiarySet.newAndSave(diarySet, ep.done(function (diarySet) {
    res.sendData(diarySet);
    push_url.push_diary_set_url(diarySet._id);
  }));
}

exports.my_diary_set = function (req, res, next) {
  const authorid = ApiUtil.getUserid(req);
  const sort = req.body.sort || {
    create_at: -1
  };
  const ep = new eventproxy();
  ep.fail(next);

  DiarySet.find({
    authorid: authorid
  }, null, {
    sort: sort,
    lean: true
  }, ep.done(function (diarySets) {
    res.sendData({
      diarySets: diarySets
    });
  }));
}

exports.search_diary_set = function (req, res, next) {
  const query = req.body.query || {};
  const sort = req.body.sort || {
    create_at: -1
  };
  const skip = req.body.from || 0;
  const limit = req.body.limit || 10;
  const ep = new eventproxy();
  ep.fail(next);

  DiarySet.paginate(query, null, {
    sort: sort,
    skip: skip,
    limit: limit,
    lean: true
  }, ep.done(function (diarySets, total) {
    res.sendData({
      diarySets: diarySets,
      total: total
    });
  }));
}

exports.update_diary_set = function (req, res, next) {
  const diarySet = ApiUtil.buildDiarySet(req);
  const diarySetid = req.body.diary_set._id;
  const ep = new eventproxy();
  ep.fail(next);

  if (!tools.convert2ObjectId(diarySetid)) {
    res.sendErrMsg('信息不完全');
    return;
  }

  DiarySet.setOne({
    _id: diarySetid
  }, diarySet, null, ep.done(function () {
    res.sendSuccessMsg();
  }));
}

exports.add_diary = function (req, res, next) {
  const diary = ApiUtil.buildDiary(req);
  const authorid = ApiUtil.getUserid(req);
  const usertype = ApiUtil.getUsertype(req);
  diary.authorid = authorid;
  diary.usertype = usertype;
  const ep = new eventproxy();
  ep.fail(next);

  Diary.newAndSave(diary, ep.done(function (diary) {
    res.sendData(diary);

    DiarySet.setOne({
      _id: diary.diarySetid
    }, {
      latest_section_label: diary.section_label
    }, null, function () {});
  }));
}

exports.delete_diary = function (req, res, next) {
  const diaryid = req.body.diaryid;
  const authorid = ApiUtil.getUserid(req);
  const usertype = ApiUtil.getUsertype(req);
  const ep = new eventproxy();
  ep.fail(next);

  if (!tools.convert2ObjectId(diaryid)) {
    res.sendErrMsg('信息不完全');
    return;
  }

  Diary.removeOne({
    _id: diaryid,
    authorid: authorid,
    usertype: usertype
  }, null, ep.done(function (diary) {
    res.sendSuccessMsg();

    if (diary) {
      Comment.removeSome({
        topicid: diary._id
      }, function () {});

      UserMessage.removeSome({
        topicid: diary._id
      }, function () {});
    }

  }));
}

exports.search_diary = function (req, res, next) {
  const query = req.body.query || {};
  const sort = req.body.sort || {
    create_at: -1
  };
  const skip = req.body.from || 0;
  const limit = req.body.limit || 100;
  const userid = ApiUtil.getUserid(req);
  const usertype = ApiUtil.getUsertype(req);
  const ep = new eventproxy();
  ep.fail(next);

  Diary.paginate(query, null, {
    sort: sort,
    skip: skip,
    limit: limit,
    lean: true
  }, ep.done(function (diaries, total) {
    async.mapLimit(diaries, 3, function (diary, callback) {
      async.parallel({
        diarySet: function (callback) {
          DiarySet.findOne({
            _id: diary.diarySetid
          }, null, callback);
        },
        author: function (callback) {
          User.findOne({
            _id: diary.authorid
          }, {
            username: 1,
            imageid: 1
          }, callback);
        },
        is_my_favorite: function (callback) {
          favorite_business.is_favorite_diary(userid, usertype, diary._id, callback);
        }
      }, function (err, result) {
        diary.diarySet = result.diarySet;
        diary.author = result.author;
        diary.is_my_favorite = result.is_my_favorite;
        callback(err, diary);
      });
    }, ep.done(function (diaries) {
      res.sendData({
        diaries: diaries,
        total: total
      });
    }));
  }));
}

exports.top_diary_set = function (req, res, next) {
  const limit = req.body.limit || 5;
  const ep = new eventproxy();
  ep.fail(next);

  DiarySet.find({
    cover_imageid: {
      $exists: true
    },
    latest_section_label: {
      $exists: true
    }
  }, null, {
    sort: {
      view_count: -1
    },
    skip: 0,
    limit: 30
  }, ep.done(function (diarySets) {
    res.sendData(_.sample(diarySets, limit));
  }));
}
