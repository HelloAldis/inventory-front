"use strict"

const eventproxy = require('eventproxy');
const Product = require('lib/proxy').Product;
const Designer = require('lib/proxy').Designer;
const Favorite = require('lib/proxy').Favorite;
const tools = require('lib/common/tools');
const _ = require('lodash');
const async = require('async');
const ApiUtil = require('lib/common/api_util');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const limit = require('lib/middlewares/limit');
const type = require('lib/type/type');
const reg_util = require('lib/common/reg_util');
const user_habit_collect = require('lib/business/user_habit_collect');

exports.add = function (req, res, next) {
  let product = ApiUtil.buildProduct(req);
  let designerid = ApiUtil.getUserid(req);
  product.designerid = designerid;
  product.auth_date = new Date().getTime();
  let ep = new eventproxy();
  ep.fail(next);

  Product.newAndSave(product, ep.done(function (product) {
    if (product) {
      Designer.incOne({
        _id: designerid
      }, {
        product_count: 1
      }, {});

      res.sendSuccessMsg();
    } else {
      res.sendErrMsg('添加失败');
    }
  }));
};

exports.update = function (req, res, next) {
  let product = ApiUtil.buildProduct(req);
  let oid = tools.trim(req.body._id) || tools.trim(req.body.product._id);
  let designerid = ApiUtil.getUserid(req);
  product.auth_type = type.product_auth_type_new;
  product.auth_date = new Date().getTime();
  let ep = new eventproxy();
  ep.fail(next);

  if (oid === '') {
    res.sendErrMsg('信息不完全');
    return;
  }

  Product.setOne({
    _id: oid,
    designerid: designerid
  }, product, {}, ep.done(function (product) {
    if (product) {
      if (product.auth_type === type.product_auth_type_done) {
        Designer.incOne({
          _id: designerid
        }, {
          authed_product_count: -1
        }, {});
      }
    }

    res.sendSuccessMsg();
  }));
}

exports.delete = function (req, res, next) {
  let designerid = ApiUtil.getUserid(req);
  let oid = tools.trim(req.body._id);
  let ep = new eventproxy();
  ep.fail(next);

  if (oid === '') {
    res.sendErrMsg('信息不完全');
    return;
  }

  Product.removeOne({
    _id: new ObjectId(oid),
    designerid: designerid
  }, {}, ep.done(function (product) {
    if (product) {
      let inc = {
        product_count: -1
      };

      if (product.auth_type === type.product_auth_type_done) {
        inc.authed_product_count = -1;
      }

      Designer.incOne({
        _id: designerid
      }, inc, {});
    }

    res.sendSuccessMsg();
  }));
}

exports.search_designer_product = function (req, res, next) {
  let query = req.body.query || {};
  let sort = req.body.sort || {
    create_at: 1
  };
  let skip = req.body.from || 0;
  let limit = req.body.limit || 10;
  query.auth_type = type.product_auth_type_done;
  let ep = new eventproxy();
  ep.fail(next);

  let search_word = req.body.search_word;
  if (search_word && search_word.trim().length > 0) {
    search_word = reg_util.reg(tools.trim(search_word), 'i');
    query.cell = search_word;
  }

  Product.paginate(query, null, {
    sort: sort,
    skip: skip,
    limit: limit,
    lean: true
  }, ep.done(function (products, total) {
    async.mapLimit(products, 3, function (product, callback) {
      Designer.findOne({
        _id: product.designerid
      }, {
        username: 1,
        imageid: 1,
        auth_type: 1
      }, function (err, designer) {
        product.designer = designer;
        callback(err, product);
      });
    }, ep.done(function (products) {
      res.sendData({
        products: products,
        total: total
      });
    }));
  }));
}

exports.designer_my_products = function (req, res, next) {
  let sort = req.body.sort || {
    create_at: -1
  };
  let skip = req.body.from || 0;
  let limit = req.body.limit || 10;
  let designerid = ApiUtil.getUserid(req);
  let ep = new eventproxy();
  ep.fail(next);

  Product.paginate({
    designerid: designerid
  }, null, {
    sort: sort,
    skip: skip,
    limit: limit
  }, ep.done(function (products, total) {
    res.sendData({
      products: products,
      total: total
    });
  }));
}

exports.product_home_page = function (req, res, next) {
  let productid = req.body._id;
  let userid = ApiUtil.getUserid(req);
  let usertype = ApiUtil.getUsertype(req);
  let ep = new eventproxy();
  ep.fail(next);

  Product.findOne({
    _id: productid
  }, ep.done(function (product) {
    if (product) {
      Designer.findOne({
        _id: product.designerid
      }, {
        username: 1,
        imageid: 1,
        auth_type: 1
      }, ep.done(function (designer) {
        product = product.toObject();
        product.designer = designer;

        if (userid && usertype !== type.role_admin) {
          Favorite.findOne({
            userid: userid,
            favorite_product: productid
          }, null, ep.done(function (favorite) {
            if (favorite) {
              product.is_my_favorite = true;
            } else {
              product.is_my_favorite = false;
            }
            res.sendData(product);
          }));
        } else {
          res.sendData(product);
        }
      }));

      limit.perwhatperdaydo('productgetone', req.ip + productid, 1, function () {
        Product.incOne({
          _id: productid
        }, {
          view_count: 1
        });
      });

      user_habit_collect.add_product_history(userid, usertype, productid);
    } else {
      res.sendData({});
    }
  }));
}

exports.designer_one_product = function (req, res, next) {
  let _id = req.body._id;
  let ep = new eventproxy();
  ep.fail(next);

  Product.findOne({
    _id: _id
  }, null, ep.done(function (product) {
    res.sendData(product);
  }));
}

exports.top_products = function (req, res, next) {
  let ep = new eventproxy();
  ep.fail(next);
  let limit = req.body.limit || 20;

  Product.find({
    auth_type: type.product_auth_type_done
  }, {
    images: 1,
    cover_imageid: 1
  }, {
    sort: {
      view_count: -1
    },
    skip: 0,
    limit: 300
  }, ep.done(function (products) {
    let recs = _.sample(products, limit);
    res.sendData(recs);
  }));
}
