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
      console.log(`Connected to SQLite Database at ${dbPath}`);
    });
  } catch (error) {
    console.error(`DB Initialization Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// 1. GET /books/ - Retrieve all books
app.get('/books/', async (request, response) => {
  try {
    const getBooksQuery = `SELECT id, title, author, price, pages FROM book ORDER BY id ASC;`;
    const booksArray = await db.all(getBooksQuery);
    response.status(200).json(booksArray);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

// 2. GET /books/:bookId/ - Retrieve a single book
app.get('/books/:bookId/', async (request, response) => {
  try {
    const { bookId } = request.params;
    const getBookQuery = `SELECT id, title, author, price, pages FROM book WHERE id = ?;`;
    const book = await db.get(getBookQuery, [bookId]);
    if (!book) {
      response.status(404).json({ error: 'Book Not Found' });
    } else {
      response.status(200).json(book);
    }
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

// 3. POST /books/ - Add a new book
app.post('/books/', async (request, response) => {
  try {
    const { title, author, price, pages } = request.body;
    if (!title || !author || price === undefined || pages === undefined) {
      return response.status(400).json({ error: 'Missing required book fields: title, author, price, pages' });
    }
    const addBookQuery = `INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?);`;
    const dbResponse = await db.run(addBookQuery, [title, author, price, pages]);
    response.status(201).json({
      message: 'Book Added Successfully',
      bookId: dbResponse.lastID
    });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

// 4. PUT /books/:bookId/ - Update an existing book
app.put('/books/:bookId/', async (request, response) => {
  try {
    const { bookId } = request.params;
    const { title, author, price, pages } = request.body;

    const checkQuery = `SELECT id FROM book WHERE id = ?;`;
    const existingBook = await db.get(checkQuery, [bookId]);
    if (!existingBook) {
      return response.status(404).json({ error: 'Book Not Found' });
    }

    const updateBookQuery = `
      UPDATE book SET title = ?, author = ?, price = ?, pages = ? WHERE id = ?;
    `;
    await db.run(updateBookQuery, [title, author, price, pages, bookId]);
    response.status(200).json({ message: 'Book Updated Successfully' });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

// 5. DELETE /books/:bookId/ - Delete a book
app.delete('/books/:bookId/', async (request, response) => {
  try {
    const { bookId } = request.params;
    const checkQuery = `SELECT id FROM book WHERE id = ?;`;
    const existingBook = await db.get(checkQuery, [bookId]);
    if (!existingBook) {
      return response.status(404).json({ error: 'Book Not Found' });
    }

    const deleteBookQuery = `DELETE FROM book WHERE id = ?;`;
    await db.run(deleteBookQuery, [bookId]);
    response.status(200).json({ message: 'Book Deleted Successfully' });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

module.exports = app;
