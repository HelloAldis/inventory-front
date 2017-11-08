'use strict'

const winston = require('winston');
const Rotate = require('winston-daily-rotate-file');
const date_util = require('./date_util');

const logDirectory = global.PROJECT_ROOT + '/log';

const logger = new winston.Logger({
  transports: [
    new Rotate({
      level: 'debug',
      filename: logDirectory + '/all.log',
      handleExceptions: true,
      humanReadableUnhandledException: true,
      datePattern: '.yyyy-MM-dd',
      // maxsize: 5242880, //5MB
      // maxFiles: 5,
      json: false,
      colorize: false,
      timestamp: function () {
        return date_util.YYYY_MM_DD_HH_mm_ss_SSS();
      }
    }),
    new winston.transports.File({
      level: 'error',
      filename: logDirectory + '/error.log',
      handleExceptions: true,
      humanReadableUnhandledException: true,
      maxsize: 5242880, //5MB
      maxFiles: 5,
      json: false,
      colorize: false,
      timestamp: function () {
        return date_util.YYYY_MM_DD_HH_mm_ss_SSS();
      }
    }),
    new winston.transports.Console({
      level: 'debug',
      handleExceptions: true,
      humanReadableUnhandledException: true,
      json: false,
      colorize: true,
      timestamp: function () {
        return date_util.YYYY_MM_DD_HH_mm_ss_SSS();
      }
    })
  ],
  exitOnError: false
});

logger.stream = {
  write: function (message) {
    logger.info(message);
  }
};

module.exports = logger;
