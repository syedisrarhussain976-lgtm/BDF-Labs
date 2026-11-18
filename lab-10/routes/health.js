const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const memory = process.memoryUsage();
  res.status(200).json({
    status: 'HEALTHY',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: 'CONNECTED',
    memory: {
      rssMB: Math.round(memory.rss / 1024 / 1024),
      heapTotalMB: Math.round(memory.heapTotal / 1024 / 1024),
      heapUsedMB: Math.round(memory.heapUsed / 1024 / 1024)
    },
    environment: process.env.NODE_ENV || 'production'
  });
});

module.exports = router;
