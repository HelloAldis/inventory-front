"use strict"

const eventproxy = require('eventproxy');
const DecStrategy = require('lib/proxy').DecStrategy;
const async = require('async');
const type = require('lib/type/type');

exports.top_articles = function (req, res, next) {
  let limit = req.body.limit || 5;
  let ep = eventproxy();
  ep.fail(next);

  async.parallel({
    dec_strategies: function (callback) {
      DecStrategy.find({
        status: type.article_status_public,
        articletype: type.articletype_dec_strategy
      }, {
        title: 1,
        description: 1,
        cover_imageid: 1,
        articletype: 1
      }, {
        sort: {
          create_at: -1
        },
        skip: 0,
        limit: limit
      }, callback);
    },
    dec_tips: function (callback) {
      DecStrategy.find({
        status: type.article_status_public,
        articletype: type.articletype_dec_tip
      }, {
        title: 1,
        description: 1,
        cover_imageid: 1,
        articletype: 1
      }, {
        sort: {
          create_at: -1
        },
        skip: 0,
        limit: limit
      }, callback);
    }
  }, ep.done(function (result) {
    res.sendData(result);
  }));
}

exports.search_article = function (req, res, next) {
  let query = req.body.query || {};
  query.status = type.article_status_public;
  let sort = req.body.sort || {
    create_at: -1
  };
  let skip = req.body.from || 0;
  let limit = req.body.limit || 10;
  let ep = eventproxy();
  ep.fail(next);

  DecStrategy.paginate(query, {
    title: 1,
    description: 1,
    cover_imageid: 1,
    articletype: 1
  }, {
    sort: sort,
    skip: skip,
    limit: limit
  }, ep.done(function (articles, total) {
    res.sendData({
      articles: articles,
      total: total
    });
  }));
}
