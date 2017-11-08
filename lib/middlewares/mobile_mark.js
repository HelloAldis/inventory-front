// req flag for mobile

module.exports = function (req, res, next) {
  req.isMobile = true;

  next();
};
