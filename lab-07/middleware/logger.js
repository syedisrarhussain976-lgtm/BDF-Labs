const logger = (request, response, next) => {
  const start = Date.now();
  response.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${request.method} ${request.originalUrl} - ${response.statusCode} (${duration}ms)`);
  });
  next();
};

module.exports = logger;
