'use strict'

const eventproxy = require('eventproxy');
const Favorite = require('lib/proxy').Favorite;
const Product = require('lib/proxy').Product;
const Designer = require('lib/proxy').Designer;
const BeautifulImage = require('lib/proxy').BeautifulImage;
const Diary = require('lib/proxy').Diary;
const DiarySet = require('lib/proxy').DiarySet;
const tools = require('lib/common/tools');
const _ = require('lodash');
const ApiUtil = require('lib/common/api_util');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const async = require('async');

exports.list_product = function (req, res, next) {
  let userid = ApiUtil.getUserid(req);
  let skip = req.body.from || 0;
  let limit = req.body.limit || 10;
  let ep = eventproxy();
  ep.fail(next);

  Favorite.findOne({
    userid: userid
  }, null, ep.done(function (favorite) {
    if (favorite && favorite.favorite_product) {
      let productids = favorite.favorite_product.slice(skip, skip +
        limit);
      async.mapLimit(productids, 3, function (productid, callback) {
        Product.findOne({
          _id: productid
        }, null, function (err, product) {
          if (!product) {
            product = {
              _id: productid,
              is_deleted: true
            };
            callback(err, product);
          } else {
            Designer.findOne({
              _id: product.designerid
            }, {
              imageid: 1
            }, function (err, designer) {
              product = product.toObject();
              product.designer = designer;
              callback(err, product);
            });
          }
        });
      }, ep.done(function (results) {
        res.sendData({
          products: results,
          total: favorite.favorite_product.length
        });
      }));
    } else {
      return res.sendData({
        products: [],
        total: 0
      });
    }
  }));
}

exports.add_product = function (req, res, next) {
  let userid = ApiUtil.getUserid(req);
  let productid = new ObjectId(req.body._id);
  let ep = eventproxy();
  ep.fail(next);

  Favorite.findOne({
    userid: userid
  }, null, ep.done(function (favorite) {
    if (favorite) {
      Favorite.addToSet({
        userid: userid
      }, {
        favorite_product: productid
      }, null, ep.done(function () {
        let result = _.find(favorite.favorite_product, function (
          o) {
          return o.toString() === productid.toString();
        });

        if (!result) {
          Product.incOne({
            _id: productid
          }, {
            favorite_count: 1
          });
        }

        res.sendSuccessMsg();
      }));
    } else {
      Favorite.newAndSave({
        userid: userid,
        favorite_product: [productid]
      }, ep.done(function () {
        Product.incOne({
          _id: productid
        }, {
          favorite_count: 1
        });
        res.sendSuccessMsg();
      }));
    }

  }));
};

exports.delete_product = function (req, res, next) {
  let userid = ApiUtil.getUserid(req);
  let productid = new ObjectId(req.body._id);
  let ep = eventproxy();
  ep.fail(next);

  Favorite.pull({
    userid: userid
  }, {
    favorite_product: productid
  }, null, ep.done(function (favorite) {
    if (favorite) {
      let result = _.find(favorite.favorite_product, function (o) {
        return o.toString() === productid.toString();
      });

      if (result) {
        Product.incOne({
          _id: productid
        }, {
          favorite_count: -1
        });
      }
    }

    res.sendSuccessMsg();
  }));
};

exports.list_beautiful_image = function (req, res, next) {
  let userid = ApiUtil.getUserid(req);
  let skip = req.body.from || 0;
  let limit = req.body.limit || 10;
  let ep = eventproxy();
  ep.fail(next);

  Favorite.findOne({
    userid: userid
  }, null, ep.done(function (favorite) {
    if (favorite && favorite.favorite_beautiful_image) {
      let beautiful_imageids = favorite.favorite_beautiful_image.slice(
        skip, skip + limit);
      async.mapLimit(beautiful_imageids, 3, function (beautiful_imageid,
        callback) {
        BeautifulImage.findOne({
          _id: beautiful_imageid
        }, null, function (err, beautiful_image) {
          if (beautiful_image) {
            beautiful_image = beautiful_image.toObject();
          } else {
            beautiful_image = {
              _id: beautiful_imageid,
              is_deleted: true
            };
          }
          beautiful_image.is_my_favorite = true;
          callback(err, beautiful_image);
        });
      }, ep.done(function (results) {
        res.sendData({
          beautiful_images: results,
          total: favorite.favorite_beautiful_image.length
        });
      }));
    } else {
      return res.sendData({
        beautiful_images: [],
        total: 0
      });
    }
  }));
}

exports.add_beautiful_image = function (req, res, next) {
  let userid = ApiUtil.getUserid(req);
  let beautiful_id = new ObjectId(req.body._id);
  let ep = eventproxy();
  ep.fail(next);

  Favorite.findOne({
    userid: userid
  }, null, ep.done(function (favorite) {
    if (favorite) {
      Favorite.addToSet({
        userid: userid
      }, {
        favorite_beautiful_image: beautiful_id
      }, null, ep.done(function () {
        res.sendSuccessMsg();
        let result = _.find(favorite.favorite_beautiful_image,
          function (o) {
            return o.toString() === beautiful_id.toString();
          });

        if (!result) {
          BeautifulImage.incOne({
            _id: beautiful_id
          }, {
            favorite_count: 1
          });
        }
      }));
    } else {
      Favorite.newAndSave({
        userid: userid,
        favorite_beautiful_image: [beautiful_id]
      }, ep.done(function () {
        BeautifulImage.incOne({
          _id: beautiful_id
        }, {
          favorite_count: 1
        });
        res.sendSuccessMsg();
      }));
    }
  }));
};

exports.delete_beautiful_image = function (req, res, next) {
  let userid = ApiUtil.getUserid(req);
  let beautiful_imageid = new ObjectId(req.body._id);
  let ep = eventproxy();
  ep.fail(next);

  Favorite.pull({
    userid: userid
  }, {
    favorite_beautiful_image: beautiful_imageid
  }, null, ep.done(function (favorite) {
    res.sendSuccessMsg();
    if (favorite) {
      let result = _.find(favorite.favorite_beautiful_image, function (
        o) {
        return o.toString() === beautiful_imageid.toString();
      });

      if (result) {
        BeautifulImage.incOne({
          _id: beautiful_imageid
        }, {
          favorite_count: -1
        });
      }
    }
  }));
};

exports.list_designer = function (req, res, next) {
  let userid = ApiUtil.getUserid(req);
  let skip = req.body.from || 0;
  let limit = req.body.limit || 10;
  let ep = eventproxy();
  ep.fail(next);

  Favorite.findOne({
    userid: userid
  }, null, ep.done(function (favorite) {
    if (favorite && favorite.favorite_designer) {
      let designerids = favorite.favorite_designer.slice(skip, skip +
        limit);
      async.mapLimit(designerids, 3, function (designerid, callback) {
        Designer.findOne({
          _id: designerid
        }, {
          username: 1,
          imageid: 1,
          province: 1,
          city: 1,
          district: 1,
          authed_product_count: 1,
          order_count: 1,
          deal_done_count: 1,
          auth_type: 1,
          uid_auth_type: 1,
          work_auth_type: 1,
          email_auth_type: 1,
          service_attitude: 1,
          respond_speed: 1,
          tags: 1
        }, function (err, designer) {
          if (!designer) {
            designer = {
              _id: designerid,
              is_deleted: true
            };
          }

          callback(err, designer);
        });
      }, ep.done(function (results) {
        res.sendData({
          designers: results,
          total: favorite.favorite_designer.length
        })
      }));
    } else {
      return res.sendData({
        designers: [],
        total: 0
      });
    }
  }));
}

exports.add_designer = function (req, res, next) {
  let userid = ApiUtil.getUserid(req);
  let designerid = new ObjectId(req.body._id);
  let ep = eventproxy();
  ep.fail(next);

  Favorite.findOne({
    userid: userid
  }, null, ep.done(function (favorite) {
    if (favorite) {
      Favorite.addToSet({
        userid: userid
      }, {
        favorite_designer: designerid
      }, null, ep.done(function () {
        let result = _.find(favorite.favorite_designer, function (o) {
          return o.toString() === designerid.toString();
        });

        if (!result) {
          Designer.incOne({
            _id: designerid
          }, {
            favorite_count: 1
          }, null);
        }

        res.sendSuccessMsg();
      }));
    } else {
      Favorite.newAndSave({
        userid: userid,
        favorite_designer: [designerid]
      }, ep.done(function () {
        Designer.incOne({
          _id: designerid
        }, {
          favorite_count: 1
        }, null);
        res.sendSuccessMsg();
      }));
    }
  }));
};

exports.delete_designer = function (req, res, next) {
  let userid = ApiUtil.getUserid(req);
  let designerid = tools.trim(req.body._id);
  let ep = eventproxy();
  ep.fail(next);

  Favorite.pull({
    userid: userid
  }, {
    favorite_designer: designerid
  }, null, ep.done(function (favorite) {
    if (favorite) {
      let result = _.find(favorite.favorite_designer, function (o) {
        return o.toString() === designerid.toString();
      });

      if (result) {
        Designer.incOne({
          _id: designerid
        }, {
          favorite_count: -1
        }, null);
      }
    }

    res.sendSuccessMsg();
  }));
};

exports.add_diary = function (req, res, next) {
  let userid = ApiUtil.getUserid(req);
  let diaryid = new ObjectId(req.body.diaryid);
  let ep = eventproxy();
  ep.fail(next);

  Favorite.findOne({
    userid: userid
  }, null, ep.done(function (favorite) {
    if (favorite) {
      Favorite.addToSet({
        userid: userid
      }, {
        favorite_diary: diaryid
      }, null, ep.done(function () {
        let result = tools.findIndexObjectId(favorite.favorite_diary, diaryid);

        if (result < 0) {
          Diary.incOne({
            _id: diaryid
          }, {
            favorite_count: 1
          });
          res.sendSuccessMsg();
        } else {
          res.sendErrMsg('您已经赞过了！');
        }
      }));
    } else {
      Favorite.newAndSave({
        userid: userid,
        favorite_diary: [diaryid]
      }, ep.done(function () {
        Diary.incOne({
          _id: diaryid
        }, {
          favorite_count: 1
        });
        res.sendSuccessMsg();
      }));
    }
  }));
}

exports.list_diary_set = function (req, res, next) {
  let userid = ApiUtil.getUserid(req);
  let skip = req.body.from || 0;
  let limit = req.body.limit || 10;
  let ep = eventproxy();
  ep.fail(next);

  Favorite.findOne({
    userid: userid
  }, null, ep.done(function (favorite) {
    if (favorite && favorite.favorite_diary_set) {
      let ids = favorite.favorite_diary_set.slice(skip, skip + limit);

      async.mapLimit(ids, 3, function (id, callback) {
        DiarySet.findOne({
          _id: id
        }, null, function (err, diarySet) {
          if (err) {
            return callback(err);
          }

          if (diarySet) {
            callback(null, diarySet);
          } else {
            callback(null, {
              _id: id,
              is_deleted: true
            });
          }
        });
      }, ep.done(function (diarySets) {
        res.sendData({
          diarySets: diarySets,
          total: favorite.favorite_diary_set.length
        });
      }));
    } else {
      return res.sendData({
        designers: [],
        total: 0
      });
    }
  }));
}

exports.add_diary_set = function (req, res, next) {
  let userid = ApiUtil.getUserid(req);
  let diarySetid = new ObjectId(req.body.diarySetid);
  let ep = eventproxy();
  ep.fail(next);

  Favorite.findOne({
    userid: userid
  }, null, ep.done(function (favorite) {
    if (favorite) {
      Favorite.addToSet({
        userid: userid
      }, {
        favorite_diary_set: diarySetid
      }, null, ep.done(function () {
        let result = tools.findIndexObjectId(favorite.favorite_diary_set, diarySetid);

        if (result < 0) {
          DiarySet.incOne({
            _id: diarySetid
          }, {
            favorite_count: 1
          });
          res.sendSuccessMsg();
        } else {
          res.sendErrMsg('您已经关注了！');
        }
      }));
    } else {
      Favorite.newAndSave({
        userid: userid,
        favorite_diary_set: [diarySetid]
      }, ep.done(function () {
        DiarySet.incOne({
          _id: diarySetid
        }, {
          favorite_count: 1
        });
        res.sendSuccessMsg();
      }));
    }
  }));
}

exports.delete_diary_set = function (req, res, next) {
  let userid = ApiUtil.getUserid(req);
  let diarySetid = new ObjectId(req.body.diarySetid);
  let ep = eventproxy();
  ep.fail(next);

  Favorite.pull({
    userid: userid
  }, {
    favorite_diary_set: diarySetid
  }, null, ep.done(function (favorite) {
    if (favorite) {
      let index = tools.findIndexObjectId(favorite.favorite_diary_set, diarySetid);

      if (index >= 0) {
        DiarySet.incOne({
          _id: diarySetid
        }, {
          favorite_count: -1
        }, null);
      }
    }

    res.sendSuccessMsg();
  }));
};
