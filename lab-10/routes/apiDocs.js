const express = require('express');
const router = express.Router();

const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Backend Development Fundamentals - API Reference',
    version: '1.0.0',
    description: 'Comprehensive REST API documentation for BDF Lab Portfolio',
    contact: {
      name: 'SYED ISRAR HUSSAIN',
      email: 'syedisrarhussain976@gmail.com'
    }
  },
  servers: [{ url: 'http://localhost:3000', description: 'Local Development Server' }],
  paths: {
    '/health': {
      get: {
        summary: 'System Health Check Probe',
        responses: { '200': { description: 'System healthy and database accessible' } }
      }
    },
    '/api/books': {
      get: {
        summary: 'Retrieve all books',
        responses: { '200': { description: 'Array of book objects' } }
      },
      post: {
        summary: 'Create a new book',
        responses: { '201': { description: 'Book created successfully' } }
      }
    }
  }
};

router.get('/', (req, res) => {
  res.status(200).json(openApiSpec);
});

module.exports = router;
