const http = require('http');

const testData = {
  firstName: 'Yehia',
  lastName: 'Test',
  email: 'yehia.1952006@gmail.com',
  password: 'test123'
};

const postData = JSON.stringify(testData);

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/v1/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('🧪 Testing registration with data:', testData);
console.log('📦 Request data:', postData);

const req = http.request(options, (res) => {
  console.log('📡 Response status:', res.statusCode);
  console.log('📋 Response headers:', res.headers);
  
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    console.log('📄 Response body:', body);
    try {
      const parsed = JSON.parse(body);
      if (parsed.success) {
        console.log('✅ Registration successful!');
      } else {
        console.log('❌ Registration failed:', parsed.error);
      }
    } catch (e) {
      console.log('❌ Invalid JSON response:', e.message);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Request error:', e.message);
});

req.write(postData);
req.end();

console.log('🚀 Request sent!');
