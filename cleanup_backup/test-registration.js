// Test registration script
const http = require('http');

const testRegistration = () => {
  const data = JSON.stringify({
    email: 'testuser@example.com',
    password: 'Test123456!',
    firstName: 'Test',
    lastName: 'User',
    phone: '+201234567890'
  });

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers: ${JSON.stringify(res.headers)}`);
    
    let body = '';
    res.on('data', (chunk) => {
      body += chunk;
    });
    
    res.on('end', () => {
      console.log('Response:', body);
      try {
        const parsed = JSON.parse(body);
        if (parsed.success) {
          console.log('✅ Registration test successful!');
        } else {
          console.log('❌ Registration test failed:', parsed.error);
        }
      } catch (e) {
        console.log('❌ Invalid JSON response');
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Request error:', e.message);
  });

  req.write(data);
  req.end();
};

console.log('🧪 Testing registration endpoint...');
testRegistration();
