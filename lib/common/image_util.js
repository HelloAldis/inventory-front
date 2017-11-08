'use strict'

const gm = require('gm').subClass({
  nativeAutoOrient: true
});
const watermark_offset = 155;
const plan_image = global.PROJECT_ROOT + '/res/plan.jpeg';

exports.resize2stream = function (buffer, width, callback) {
  gm(buffer).resize(width).interlace('Line').stream(callback);
}

exports.resize2stream2 = function (buffer, width, height, callback) {
  gm(buffer).resize(width, height, '^').gravity('Center').extent(width, height).interlace('Line').stream(callback);
}

exports.resize2buffer = function (buffer, width, callback) {
  gm(buffer).resize(width).toBuffer(callback);
}

exports.crop2buffer = function (buffer, width, hight, x, y, callback) {
  gm(buffer).crop(width, hight, x, y).toBuffer(callback);
}

exports.jpgbuffer = function (buffer, callback) {
  gm(buffer).density(72, 72).quality(80).colorspace('RGB').compress('JPEG').interlace('Line').autoOrient().toBuffer('JPEG', callback);
}

exports.watermark = function (buffer, callback) {
  gm(buffer).size(function (err, value) {
    if (err) {
      return callback(err);
    }

    if (value && value.width) {
      var command = 'image Over ';
      var x = value.width - watermark_offset;
      command = command + x + ',10 0,0 mark.png'
      this.draw(command).stream(callback);
    } else {
      return callback('invalid image');
    }
  });
}

exports.meta = function (buffer, callback) {
  gm(buffer).size(function (err, value) {
    if (err) {
      return callback(err);
    }

    callback(null, value);
  });
}

exports.resizeThenWatermark2stream = function (buffer, width, callback) {
  var command = 'image Over ';
  var x = width - watermark_offset;
  command = command + x + ',10 0,0 mark.png'

  gm(buffer).resize(width).draw(command).interlace('Line').stream(callback);
}

exports.compare = function (file1, file2, callback) {
  gm.compare(file1, file2, callback);
}

exports.isPlanImage = function (buffer, callback) {
  gm(buffer).fuzz('5%').fill('white').opaque('black').write('temp.jpeg', function (err) {
    if (err) {
      callback(err);
      return;
    }

    exports.compare(plan_image, './temp.jpeg', callback);
  });
}
