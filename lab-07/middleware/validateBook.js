const validateBook = (request, response, next) => {
  const { title, author, price, pages } = request.body;
  const errors = [];

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    errors.push('Field `title` is required and must be a non-empty string.');
  }
  if (!author || typeof author !== 'string' || author.trim().length === 0) {
    errors.push('Field `author` is required and must be a non-empty string.');
  }
  if (price === undefined || typeof price !== 'number' || price <= 0) {
    errors.push('Field `price` is required and must be a positive integer.');
  }
  if (pages === undefined || typeof pages !== 'number' || pages <= 0) {
    errors.push('Field `pages` is required and must be a positive integer.');
  }

  if (errors.length > 0) {
    return response.status(400).json({
      error: 'Validation Failed',
      statusCode: 400,
      details: errors
    });
  }

  next();
};

module.exports = validateBook;
