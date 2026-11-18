const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const config = require('./config/env');

const app = express();

// Security HTTP Headers via Helmet
app.use(helmet());

// Cross-Origin Resource Sharing (CORS) setup
app.use(cors({
  origin: config.allowedOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: config.dbPath,
      driver: sqlite3.Database
    });
    app.listen(config.port, () => {
      console.log(`Secured Server running in [${config.nodeEnv}] mode on port ${config.port}`);
      console.log(`Database mounted at ${config.dbPath}`);
    });
  } catch (error) {
    console.error(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// Health/Security Inspection Endpoint
app.get('/security/status', (request, response) => {
  response.status(200).json({
    securityEnabled: true,
    helmetProtection: 'Active (CSP, XSS-Filter, HSTS, No-Sniff, Frameguard)',
    corsOrigin: config.allowedOrigin,
    nodeEnvironment: config.nodeEnv,
    activePort: config.port
  });
});

// GET /books/
app.get('/books/', async (request, response) => {
  try {
    const books = await db.all('SELECT * FROM book;');
    response.status(200).json(books);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

module.exports = app;
