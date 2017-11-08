var fs = require('fs');
var morgan = require('morgan');
var logger = require('lib/common/logger');

logger.stream = {
  write: function (message) {
    logger.info(message);
  }
};

var logDirectory = global.PROJECT_ROOT + '/log';

// ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

var httpLogger = undefined;
var format =
  ':remote-addr :remote-user :method :req[Content-Type] :req[cookie] :url HTTP/:http-version/:user-agent :status :res[content-length] - :response-time ms';
httpLogger = morgan(format, {
  stream: logger.stream
});

module.exports = httpLogger;
