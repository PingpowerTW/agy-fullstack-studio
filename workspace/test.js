// Simple automated verification test suite
import assert from 'assert';
import http from 'http';
import app from './api.js';

app.listen(0, () => {
  const port = app.address().port;
  console.log('  [Test Suite] Server listening on port', port);
  
  const req = http.request({
    port,
    path: '/api/users',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        assert.strictEqual(res.statusCode, 201);
        assert.strictEqual(response.success, true);
        assert.strictEqual(response.data.username, 'testuser');
        console.log('  [Test Suite] ✔ Test Passed: User creation API works.');
        app.close(() => process.exit(0));
      } catch (err) {
        console.error('  [Test Suite] ✘ Test Failed:', err.message);
        app.close(() => process.exit(1));
      }
    });
  });
  
  req.on('error', (err) => {
    console.error('  [Test Suite] ✘ Request Error:', err.message);
    app.close(() => process.exit(1));
  });
  
  req.write(JSON.stringify({ username: 'testuser', email: 'test@example.com' }));
  req.end();
});
