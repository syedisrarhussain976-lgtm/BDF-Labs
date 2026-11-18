const express = require('express');
const path = require('path');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const healthRoute = require('./routes/health');
const docsRoute = require('./routes/apiDocs');

const app = express();
const PORT = 3000;
const dbPath = path.join(__dirname, 'database', 'production.db');
let db = null;
let serverInstance = null;

app.use(express.json());

// Routes
app.use('/health', healthRoute);
app.use('/api/docs', docsRoute);

app.get('/api/books', async (req, res) => {
  try {
    const books = await db.all('SELECT * FROM book ORDER BY id ASC;');
    res.status(200).json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const startServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    serverInstance = app.listen(PORT, () => {
      console.log(`Production-ready server listening on http://localhost:${PORT}`);
      console.log(`Documentation available at http://localhost:${PORT}/api/docs`);
      console.log(`Health probe available at http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error(`Fatal startup error: ${error.message}`);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown protocol
const gracefulShutdown = () => {
  console.log('\nReceived termination signal. Closing HTTP server and database connections...');
  if (serverInstance) {
    serverInstance.close(async () => {
      console.log('HTTP Server closed cleanly.');
      if (db) {
        await db.close();
        console.log('SQLite database connection closed.');
      }
      process.exit(0);
    });
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

module.exports = app;
