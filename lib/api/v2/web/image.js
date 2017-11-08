var eventproxy = require('eventproxy');
var Image = require('lib/proxy').Image;
var tools = require('lib/common/tools');
var async = require('async');
var ApiUtil = require('lib/common/api_util');
var utility = require('utility');
var imageUtil = require('lib/common/image_util');

exports.add = function (req, res, next) {
  var ep = eventproxy();
  ep.fail(next);

  ep.on('data', function (data) {
    var userid = ApiUtil.getUserid(req);
    var md5 = utility.md5(data);

    Image.findOne({
      md5: md5
    }, null, ep.done(function (image) {
      if (image) {
        if (!req.timedout) {
          res.sendData(image._id);
        }
      } else {
        imageUtil.jpgbuffer(data, ep.done(function (buf) {
          imageUtil.meta(buf, ep.done(function (size) {
            Image.newAndSave2({
              md5: md5,
              data: buf,
              userid: userid,
              width: size.width,
              height: size.height
            }, ep.done(function (savedImage) {
              if (!req.timedout) {
                res.sendData(savedImage._id);
              }
            }));
          }));

        }));
      }
    }));
  });

  if (Buffer.isBuffer(req.body)) {
    ep.emit('data', req.body);
  } else if (req.file) {
    if (Buffer.isBuffer(req.file.buffer)) {
      ep.emit('data', req.file.buffer);
    }
  } else {
    if (!req.timedout) {
      res.status(400).send('upload error');
    }
  }
};

exports.get = function (req, res, next) {
  var _id = tools.trim(req.params._id);
  var ep = eventproxy();
  ep.fail(next);

  if (!tools.isValidObjectId(_id)) {
    return res.status(404).end();
  }

  Image.findOne({
    _id: _id
  }, null, ep.done(function (image) {
    if (image) {
      res.writeHead(200, {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'max-age=315360000',
        'Accept-Ranges': 'bytes'
        // 'Content-Length': image.data.length,
      });
      res.write(image.data);
      res.end();
    } else {
      res.status(404).end();
    }
  }));
}

exports.thumbnail = function (req, res, next) {
  var _id = tools.trim(req.params._id);
  var width = tools.trim(req.params.width);
  var ep = eventproxy();
  ep.fail(next);

  if (!tools.isValidObjectId(_id)) {
    return res.status(404).end();
  }

  Image.findOne({
    _id: _id
  }, null, ep.done(function (image) {
    if (image) {
      imageUtil.resize2stream(image.data, width, ep.done(function (stdout) {
        res.writeHead(200, {
          'Content-Type': 'image/jpeg',
          'Cache-Control': 'max-age=315360000',
          'Accept-Ranges': 'bytes'
          // 'Content-Length': image.data.length,
        });
        stdout.pipe(res);
      }));

    } else {
      res.status(404).end();
    }
  }));
}

exports.thumbnail2 = function (req, res, next) {
  var _id = tools.trim(req.params._id);
  var width = tools.trim(req.params.width);
  var height = tools.trim(req.params.height);
  var ep = eventproxy();
  ep.fail(next);

  if (!tools.isValidObjectId(_id)) {
    return res.status(404).end();
  }

  Image.findOne({
    _id: _id
  }, null, ep.done(function (image) {
    if (image) {
      imageUtil.resize2stream2(image.data, width, height, ep.done(function (stdout) {
        res.writeHead(200, {
          'Content-Type': 'image/jpeg',
          'Cache-Control': 'max-age=315360000',
          'Accept-Ranges': 'bytes'
        });
        stdout.pipe(res);
      }));

    } else {
      res.status(404).end();
    }
  }));
}

exports.watermark = function (req, res, next) {
  var _id = tools.trim(req.params._id);
  var width = req.params.width;
  var ep = eventproxy();
  ep.fail(next);

  if (!tools.isValidObjectId(_id)) {
    return res.status(404).end();
  }

  Image.findOne({
    _id: _id
  }, null, ep.done(function (image) {
    if (image) {
      imageUtil.resizeThenWatermark2stream(image.data, width, ep.done(function (stdout) {
        res.writeHead(200, {
          'Content-Type': 'image/jpeg',
          'Cache-Control': 'max-age=315360000',
          'Accept-Ranges': 'bytes'
          // 'Content-Length': image.data.length,
        });
        stdout.pipe(res);
      }));
    } else {
      res.status(404).end();
    }
  }));
}

exports.crop = function (req, res, next) {
  var ep = eventproxy();
  ep.fail(next);

  Image.findOne({
    _id: req.body._id
  }, null, ep.done(function (image) {
    if (image) {
      imageUtil.crop2buffer(image.data, req.body.width, req.body.height,
        req.body.x, req.body.y, ep.done(function (buffer) {
          ep.emit('data', buffer);
        }));
    } else {
      res.status(404).end();
    }
  }));

  ep.on('data', function (data) {
    var userid = ApiUtil.getUserid(req);
    var md5 = utility.md5(data);

    Image.findOne({
      md5: md5
    }, null, ep.done(function (image) {
      if (image) {
        res.sendData(image._id);
      } else {
        Image.newAndSave(md5, data, userid, ep.done(function (
          savedImage) {
          res.sendData(savedImage._id);
        }));
      }
    }));
  });
}

exports.imagemeta = function (req, res, next) {
  var _ids = req.body._ids;
  var ep = eventproxy();
  ep.fail(next);

  async.mapLimit(_ids, 3, function (_id, callback) {
    Image.findOne({
      _id: _id
    }, {
      _id: 1,
      width: 1,
      height: 1
    }, function (err, image) {
      callback(err, image);
    });
  }, ep.done(function (metas) {
    res.sendData(metas);
  }));
}
