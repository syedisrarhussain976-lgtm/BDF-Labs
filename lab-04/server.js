const express = require('express');
const path = require('path');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

const PORT = 3000;
const SECRET_KEY = 'AURORA_BDF_LAB_SECRET_KEY'; // Kept in constant as per Lab 4 syllabus; moved to .env in Lab 8
const dbPath = path.join(__dirname, 'database', 'users.db');
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    app.listen(PORT, () => {
      console.log(`Server Running at http://localhost:${PORT}/`);
      console.log(`Authentication DB connected at ${dbPath}`);
    });
  } catch (error) {
    console.error(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// 1. POST /register/ - Register a new user
app.post('/register/', async (request, response) => {
  try {
    const { username, name, password } = request.body;

    if (!username || !name || !password) {
      return response.status(400).send('Missing required fields: username, name, password');
    }

    // Check if user already exists
    const selectUserQuery = `SELECT * FROM user WHERE username = ?;`;
    const dbUser = await db.get(selectUserQuery, [username]);

    if (dbUser !== undefined) {
      // Reject duplicate username with 400 as per curriculum
      return response.status(400).send('User already exists');
    }

    // Hash password with bcrypt (salt rounds = 10)
    const hashedPassword = await bcrypt.hash(password, 10);
    const createUserQuery = `
      INSERT INTO user (username, name, password)
      VALUES (?, ?, ?);
    `;
    await db.run(createUserQuery, [username, name, hashedPassword]);
    response.status(201).send('User created successfully');
  } catch (error) {
    response.status(500).send(`Server Error: ${error.message}`);
  }
});

// 2. POST /login/ - Authenticate user and issue JWT
app.post('/login/', async (request, response) => {
  try {
    const { username, password } = request.body;

    if (!username || !password) {
      return response.status(400).send('Missing username or password');
    }

    const selectUserQuery = `SELECT * FROM user WHERE username = ?;`;
    const dbUser = await db.get(selectUserQuery, [username]);

    if (dbUser === undefined) {
      // Unknown user returns 400
      return response.status(400).send('Invalid user');
    }

    const isPasswordMatched = await bcrypt.compare(password, dbUser.password);

    if (isPasswordMatched === true) {
      // Create JWT token payload with username only (never password)
      const payload = { username: username };
      const jwtToken = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });
      response.status(200).json({ jwt_token: jwtToken });
    } else {
      // Wrong password returns 400
      response.status(400).send('Invalid password');
    }
  } catch (error) {
    response.status(500).send(`Server Error: ${error.message}`);
  }
});

module.exports = app;
