const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Root Endpoint - Welcome greeting
app.get('/', (req, res) => {
  res.status(200).send('Hello World! Welcome to Backend Development Fundamentals - Lab 01.');
});

// Date Endpoint - Current server timestamp
app.get('/date', (req, res) => {
  const currentDate = new Date();
  res.status(200).json({
    message: 'Current Server Date and Time',
    date: currentDate.toDateString(),
    time: currentDate.toTimeString(),
    iso: currentDate.toISOString()
  });
});

// Page Endpoint - Render HTML content
app.get('/page', (req, res) => {
  res.status(200).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Lab 01 - Server Page</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f6f8fa; margin: 40px; color: #24292f; }
        .card { background: white; padding: 24px; border-radius: 8px; border: 1px solid #d0d7de; max-width: 600px; box-shadow: 0 1px 3px rgba(0,0,0,0.12); }
        h1 { color: #0969da; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>Backend Development Fundamentals - Lab 01</h1>
        <p><strong>Student:</strong> SYED ISRAR HUSSAIN (252U1R1235)</p>
        <p><strong>Status:</strong> HTTP Server Running on Port ${PORT}</p>
        <p>This page is dynamically served via Express HTML response pipeline.</p>
      </div>
    </body>
    </html>
  `);
});

// System Info Endpoint
app.get('/api/info', (req, res) => {
  res.status(200).json({
    course: 'Backend Development Fundamentals',
    module: 'Core HTTP & Routing',
    lab: '01',
    author: 'SYED ISRAR HUSSAIN',
    registrationNumber: '252U1R1235',
    section: 'CSE-2E',
    nodeVersion: process.version,
    platform: process.platform,
    uptimeSeconds: Math.floor(process.uptime()),
    status: 'ONLINE'
  });
});

app.listen(PORT, () => {
  console.log(`Server is running and listening on http://localhost:${PORT}`);
});
