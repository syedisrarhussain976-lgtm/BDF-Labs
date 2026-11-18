const express = require('express');
const { getDatabase, dbPath } = require('./src/config/db');
const bookRoutes = require('./src/routes/bookRoutes');

const app = express();
const PORT = 3000;

app.use(express.json());

// Mount MVC modular routes
app.use('/api/v1/books', bookRoutes);

const startServer = async () => {
  try {
    await getDatabase();
    app.listen(PORT, () => {
      console.log(`MVC Server listening at http://localhost:${PORT}/`);
      console.log(`Database mounted at ${dbPath}`);
    });
  } catch (error) {
    console.error(`Failed to initialize database: ${error.message}`);
    process.exit(1);
  }
};

startServer();

module.exports = app;
