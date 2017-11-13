// response util method middleware

function sendData(json) {
  if (json === null) {
    json = {};
  }

  this.send({
    data: json,
    msg: 'success'
  });
}

function sendErrMsg(err) {
  this.send({
    err_msg: err
  });
}

module.exports = function (req, res, next) {
  res.sendData = sendData;
  res.sendErrMsg = sendErrMsg;

  next();
};
