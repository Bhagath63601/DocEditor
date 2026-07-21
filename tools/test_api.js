const http = require('http');

const req = http.request({
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/profile',
  method: 'GET'
}, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  res.on('data', (chunk) => {
    console.log(`BODY: ${chunk}`);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.end();
