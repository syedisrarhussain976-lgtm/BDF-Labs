const express = require('express');
const path = require('path');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authenticateToken = require('./middleware/authenticateToken');

const app = express();
app.use(express.json());

const PORT = 3000;
const SECRET_KEY = 'AURORA_BDF_LAB_SECRET_KEY';
const dbPath = path.join(__dirname, 'database', 'app.db');
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

// Public: Login Endpoint
app.post('/login/', async (request, response) => {
  try {
    const { username, password } = request.body;
    const selectUserQuery = `SELECT * FROM user WHERE username = ?;`;
    const dbUser = await db.get(selectUserQuery, [username]);

    if (!dbUser) {
      return response.status(400).send('Invalid user');
    }

    const isPasswordMatched = await bcrypt.compare(password, dbUser.password);
    if (isPasswordMatched) {
      const payload = { username: username };
      const jwtToken = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });
      response.status(200).json({ jwt_token: jwtToken });
    } else {
      response.status(400).send('Invalid password');
    }
  } catch (error) {
    response.status(500).send(`Server Error: ${error.message}`);
  }
});

// Protected: Get Logged In User Profile
app.get('/profile/', authenticateToken, async (request, response) => {
  try {
    const { username } = request;
    const getUserQuery = `SELECT id, username, name FROM user WHERE username = ?;`;
    const user = await db.get(getUserQuery, [username]);
    response.status(200).json(user);
  } catch (error) {
    response.status(500).send(`Server Error: ${error.message}`);
  }
});

// Protected: Get All Books
app.get('/books/', authenticateToken, async (request, response) => {
  try {
    const getBooksQuery = `SELECT * FROM book ORDER BY id ASC;`;
    const books = await db.all(getBooksQuery);
    response.status(200).json(books);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

// Protected: Add a New Book (Tracks created_by authenticated user)
app.post('/books/', authenticateToken, async (request, response) => {
  try {
    const { title, author, price, pages } = request.body;
    const { username } = request;
    if (!title || !author || price === undefined || pages === undefined) {
      return response.status(400).json({ error: 'Missing required book fields' });
    }
    const addBookQuery = `
      INSERT INTO book (title, author, price, pages, created_by)
      VALUES (?, ?, ?, ?, ?);
    `;
    const result = await db.run(addBookQuery, [title, author, price, pages, username]);
    response.status(201).json({
      message: 'Book Added Successfully',
      bookId: result.lastID,
      createdBy: username
    });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

module.exports = app;
