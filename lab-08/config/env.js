require('dotenv').config();
const path = require('path');

const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'fallback_development_secret',
  dbPath: path.resolve(__dirname, '..', process.env.DB_PATH || 'database/bookStore.db'),
  allowedOrigin: process.env.ALLOWED_ORIGIN || '*'
};

module.exports = config;
