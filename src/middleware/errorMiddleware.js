const errorHandler = (err, req, res, next) => {
  res.status(400).json({
    message: err.message || 'Something went wrong'
  });
};

module.exports = errorHandler;