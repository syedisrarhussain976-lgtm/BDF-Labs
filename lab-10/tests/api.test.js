const http = require('http');

console.log('Running automated integration tests for Lab 10...');

function testHealthEndpoint() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/health',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      const json = JSON.parse(data);
      if (res.statusCode === 200 && json.status === 'HEALTHY') {
        console.log('[PASS] GET /health returns 200 OK with HEALTHY status');
      } else {
        console.error('[FAIL] GET /health returned', res.statusCode);
      }
    });
  });

  req.on('error', (e) => {
    console.log('[NOTE] Server must be running on port 3000 before running tests');
  });

  req.end();
}

testHealthEndpoint();
