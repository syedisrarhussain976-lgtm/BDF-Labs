const express = require('express');
const path = require('path');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');

const app = express();
app.use(express.json());

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

// 1. GET /books/ - Query parameters for search, sorting, and pagination
// Supported queries: search_q, order_by (price, pages, title), order (ASC, DESC), limit, offset
app.get('/books/', async (request, response) => {
  try {
    const {
      search_q = '',
      order_by = 'id',
      order = 'ASC',
      limit = 10,
      offset = 0
    } = request.query;

    const validOrderColumns = ['id', 'title', 'author', 'price', 'pages'];
    const safeOrderBy = validOrderColumns.includes(order_by) ? order_by : 'id';
    const safeOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const getBooksQuery = `
      SELECT
        id, title, author, price, pages
      FROM
        book
      WHERE
        title LIKE ? OR author LIKE ?
      ORDER BY
        ${safeOrderBy} ${safeOrder}
      LIMIT ? OFFSET ?;
    `;
    const searchPattern = `%${search_q}%`;
    const books = await db.all(getBooksQuery, [
      searchPattern,
      searchPattern,
      parseInt(limit),
      parseInt(offset)
    ]);
    response.status(200).json({
      totalReturned: books.length,
      limit: parseInt(limit),
      offset: parseInt(offset),
      data: books
    });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

// 2. GET /books/filter - Price range filter
app.get('/books/filter', async (request, response) => {
  try {
    const { min_price = 0, max_price = 10000 } = request.query;
    const filterQuery = `
      SELECT id, title, author, price, pages
      FROM book
      WHERE price >= ? AND price <= ?
      ORDER BY price ASC;
    `;
    const books = await db.all(filterQuery, [parseInt(min_price), parseInt(max_price)]);
    response.status(200).json(books);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

// 3. GET /books/stats/summary - SQL Aggregations
app.get('/books/stats/summary', async (request, response) => {
  try {
    const statsQuery = `
      SELECT
        COUNT(*) AS totalBooks,
        ROUND(AVG(price), 2) AS averagePrice,
        MIN(price) AS minPrice,
        MAX(price) AS maxPrice,
        SUM(pages) AS totalPages
      FROM
        book;
    `;
    const stats = await db.get(statsQuery);
    response.status(200).json(stats);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

// 4. GET /books/author/:authorName/ - Path parameter matching
app.get('/books/author/:authorName/', async (request, response) => {
  try {
    const { authorName } = request.params;
    const authorQuery = `
      SELECT id, title, author, price, pages
      FROM book
      WHERE author LIKE ?
      ORDER BY price ASC;
    `;
    const books = await db.all(authorQuery, [`%${authorName}%`]);
    response.status(200).json(books);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

module.exports = app;
