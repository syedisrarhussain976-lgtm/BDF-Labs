const errorHandler = (err, request, response, next) => {
  console.error(`[Error] ${err.stack || err.message}`);
  const statusCode = err.statusCode || 500;
  response.status(statusCode).json({
    success: false,
    error: true,
    message: err.message || 'Internal Server Error',
    statusCode: statusCode,
    timestamp: new Date().toISOString()
  });
};

module.exports = errorHandler;
