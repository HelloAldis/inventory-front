// response util method middleware

function sendData(json) {
  if (json === null) {
    json = {};
  }

  this.send({
    data: json
  });
}

function sendSuccessMsg() {
  this.send({
    msg: 'success'
  });
}

function sendErrMsg(err) {
  this.send({
    err_msg: err
  });
}

function ejs(template, json, req) {
  json = json || {};
  json.context = json.context || {};

  json.context.url = req.url;
  this.render(template, {
    data: json
  });
}

module.exports = function (req, res, next) {
  res.sendData = sendData;
  res.sendSuccessMsg = sendSuccessMsg;
  res.sendErrMsg = sendErrMsg;
  res.ejs = ejs;

  next();
};
