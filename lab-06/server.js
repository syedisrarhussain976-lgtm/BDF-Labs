const express = require('express');
const path = require('path');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');

const app = express();
app.use(express.json());

const PORT = 3000;
const dbPath = path.join(__dirname, 'database', 'relational.db');
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    await db.run('PRAGMA foreign_keys = ON;');
    app.listen(PORT, () => {
      console.log(`Server Running at http://localhost:${PORT}/`);
      console.log(`Relational Database connected at ${dbPath}`);
    });
  } catch (error) {
    console.error(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// 1. GET /authors/ - Fetch all authors
app.get('/authors/', async (request, response) => {
  try {
    const getAuthorsQuery = `SELECT * FROM author ORDER BY id ASC;`;
    const authors = await db.all(getAuthorsQuery);
    response.status(200).json(authors);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

// 2. POST /authors/ - Create a new author
app.post('/authors/', async (request, response) => {
  try {
    const { name, email, country } = request.body;
    if (!name || !email || !country) {
      return response.status(400).json({ error: 'Missing required author fields: name, email, country' });
    }
    const addAuthorQuery = `INSERT INTO author (name, email, country) VALUES (?, ?, ?);`;
    const result = await db.run(addAuthorQuery, [name, email, country]);
    response.status(201).json({ message: 'Author Added Successfully', authorId: result.lastID });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

// 3. GET /authors/:authorId/books/ - All books by specific author
app.get('/authors/:authorId/books/', async (request, response) => {
  try {
    const { authorId } = request.params;
    const authorQuery = `SELECT * FROM author WHERE id = ?;`;
    const author = await db.get(authorQuery, [authorId]);
    if (!author) {
      return response.status(404).json({ error: 'Author Not Found' });
    }
    const booksQuery = `SELECT id, title, price, pages FROM book WHERE author_id = ? ORDER BY id ASC;`;
    const books = await db.all(booksQuery, [authorId]);
    response.status(200).json({ author: author, books: books });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

// 4. GET /books-with-authors/ - SQL INNER JOIN
app.get('/books-with-authors/', async (request, response) => {
  try {
    const joinQuery = `
      SELECT
        book.id AS book_id,
        book.title,
        book.price,
        book.pages,
        author.id AS author_id,
        author.name AS author_name,
        author.country AS author_country
      FROM
        book
      INNER JOIN
        author ON book.author_id = author.id
      ORDER BY
        book.id ASC;
    `;
    const joinedData = await db.all(joinQuery);
    response.status(200).json(joinedData);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

// 5. GET /authors-stats/ - SQL LEFT JOIN with GROUP BY and aggregate COUNT
app.get('/authors-stats/', async (request, response) => {
  try {
    const statsQuery = `
      SELECT
        author.id AS author_id,
        author.name AS author_name,
        author.country,
        COUNT(book.id) AS total_books_published,
        COALESCE(AVG(book.price), 0) AS average_book_price
      FROM
        author
      LEFT JOIN
        book ON author.id = book.author_id
      GROUP BY
        author.id
      ORDER BY
        total_books_published DESC;
    `;
    const stats = await db.all(statsQuery);
    response.status(200).json(stats);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

module.exports = app;
