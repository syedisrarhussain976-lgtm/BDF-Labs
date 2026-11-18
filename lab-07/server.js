const express = require('express');
const path = require('path');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const validateBook = require('./middleware/validateBook');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./middleware/logger');

const app = express();
app.use(express.json());
app.use(logger);

const PORT = 3000;
const dbPath = path.join(__dirname, 'database', 'bookStore.db');
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    app.listen(PORT, () => {
      console.log(`Server Running at http://localhost:${PORT}/`);
      console.log(`Database connected at ${dbPath}`);
    });
  } catch (error) {
    console.error(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// GET /books/
app.get('/books/', async (request, response, next) => {
  try {
    const getBooksQuery = `SELECT * FROM book ORDER BY id ASC;`;
    const books = await db.all(getBooksQuery);
    response.status(200).json(books);
  } catch (error) {
    next(error);
  }
});

// POST /books/ with input validation middleware
app.post('/books/', validateBook, async (request, response, next) => {
  try {
    const { title, author, price, pages } = request.body;
    const addBookQuery = `INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?);`;
    const result = await db.run(addBookQuery, [title.trim(), author.trim(), price, pages]);
    response.status(201).json({
      message: 'Book Added Successfully',
      bookId: result.lastID
    });
  } catch (error) {
    next(error);
  }
});

// Route to simulate unhandled error to demonstrate centralized errorHandler
app.get('/error-trigger', (request, response, next) => {
  const error = new Error('Simulated runtime database failure');
  error.statusCode = 500;
  next(error);
});

// Centralized Error Handling Middleware (must be registered last)
app.use(errorHandler);

module.exports = app;
