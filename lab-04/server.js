const express = require('express');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

const dbDir = path.join(__dirname, 'database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'users.db');
const secretKey = 'MY_SECRET_KEY';
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    await db.exec(`
      CREATE TABLE IF NOT EXISTS user (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        name TEXT,
        password TEXT
      );
    `);

    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Server Running at http://localhost:${port}/`);
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

// Root endpoint: Student and service metadata
app.get('/', (request, response) => {
  response.status(200).json({
    message: 'Lab 4: Registration, Login and JWT Authentication',
    student: {
      name: 'SYED ISRAR HUSSAIN',
      registrationNumber: '252U1R1235',
      section: 'CSE-2E',
      faculty: 'Joel Prashanth D',
      college: 'Aurora Deemed-to-be-University'
    },
    status: 'Online',
    endpoints: {
      register: 'POST /register',
      login: 'POST /login'
    }
  });
});

// GET /register helper route
const registerInfoHandler = (request, response) => {
  response.status(200).json({
    message: 'Register endpoint is active. Send a POST request with JSON body to register a user.',
    method: 'POST',
    endpoint: '/register',
    sampleRequestBody: {
      username: 'israr_hussain',
      name: 'Syed Israr Hussain',
      password: 'securePassword123'
    }
  });
};

app.get('/register', registerInfoHandler);
app.get('/register/', registerInfoHandler);

// POST /register handler: User registration with bcrypt hashing
const registerUserHandler = async (request, response) => {
  try {
    const { username, name, password } = request.body;

    if (!username || !name || !password) {
      return response.status(400).send('Username, name and password are required');
    }

    const selectUserQuery = 'SELECT * FROM user WHERE username = ?;';
    const existingUser = await db.get(selectUserQuery, [username]);

    if (existingUser !== undefined) {
      return response.status(400).send('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const createUserQuery = 'INSERT INTO user (username, name, password) VALUES (?, ?, ?);';
    await db.run(createUserQuery, [username, name, hashedPassword]);

    response.status(201).send('User registered successfully');
  } catch (error) {
    response.status(500).send('Unable to register user');
  }
};

app.post('/register', registerUserHandler);
app.post('/register/', registerUserHandler);

// GET /login helper route
const loginInfoHandler = (request, response) => {
  response.status(200).json({
    message: 'Login endpoint is active. Send a POST request with JSON body to login and receive a JWT token.',
    method: 'POST',
    endpoint: '/login',
    sampleRequestBody: {
      username: 'israr_hussain',
      password: 'securePassword123'
    }
  });
};

app.get('/login', loginInfoHandler);
app.get('/login/', loginInfoHandler);

// POST /login handler: User authentication and JWT generation
const loginUserHandler = async (request, response) => {
  try {
    const { username, password } = request.body;

    if (!username || !password) {
      return response.status(400).send('Username and password are required');
    }

    const selectUserQuery = 'SELECT * FROM user WHERE username = ?;';
    const user = await db.get(selectUserQuery, [username]);

    if (user === undefined) {
      return response.status(400).send('Invalid username');
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);

    if (!isPasswordMatched) {
      return response.status(400).send('Invalid password');
    }

    const payload = { username: username };
    const jwtToken = jwt.sign(payload, secretKey, { expiresIn: '1h' });

    response.status(200).json({ jwt_token: jwtToken });
  } catch (error) {
    response.status(500).send('Unable to login');
  }
};

app.post('/login', loginUserHandler);
app.post('/login/', loginUserHandler);

// 404 handler for unknown routes
app.use((request, response) => {
  response.status(404).send('Page not found');
});

initializeDBAndServer();

module.exports = app;

// [Module 1]: Import core Node.js runtime and HTTP engine modules
// [Security Architecture]: bcrypt blowfish cost factor initialized to 10 rounds
// [JWT Claim Policy]: Secret key defined as constant for Lab 4 syllabus specifications
// [Database Isolation]: Guarantee users.db directory existence synchronously before driver initialization
// [Schema Provisioning]: Auto-create user table with PRIMARY KEY, UNIQUE username, name and password hash
// [Route Metadata]: Expose student profile and system status on GET / for cloud health probes
// [Input Sanitization]: Enforce mandatory presence of username, name and password fields