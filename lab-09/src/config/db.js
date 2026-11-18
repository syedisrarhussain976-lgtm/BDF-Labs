const path = require('path');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');

const dbPath = path.resolve(__dirname, '../../database/bookStore.db');
let dbInstance = null;

const getDatabase = async () => {
  if (!dbInstance) {
    dbInstance = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
  }
  return dbInstance;
};

module.exports = { getDatabase, dbPath };
