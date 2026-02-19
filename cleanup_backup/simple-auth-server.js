const http = require('http');
const url = require('url');

const PORT = 5000;

// Simple in-memory user store
const users = new Map();

// Generate simple token
function generateToken(user) {
  return Buffer.from(JSON.stringify({ id: user.id, email: user.email })).toString('base64');
}

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;

  console.log(`${req.method} ${path}`);

  // Health check
  if (path === '/api/v1/health') {
    return sendJSON(res, 200, {
      status: 'ok',
      message: 'Simple Auth Server running',
      timestamp: new Date().toISOString()
    });
  }

  // Register endpoint
  if (path === '/api/v1/auth/register' && req.method === 'POST') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        console.log('📝 Registration request:', body);
        
        const { email, password, firstName, lastName, phone } = JSON.parse(body);
        
        console.log('🔍 Parsed data:', { email, firstName, lastName, phone: phone || 'none' });

        // Basic validation
        if (!email || !password || !firstName || !lastName) {
          return sendJSON(res, 400, {
            success: false,
            error: 'Missing required fields'
          });
        }

        if (password.length < 6) {
          return sendJSON(res, 400, {
            success: false,
            error: 'Password must be at least 6 characters'
          });
        }

        // Check if user exists
        if (users.has(email)) {
          return sendJSON(res, 409, {
            success: false,
            error: 'User already exists'
          });
        }

        // Create user
        const newUser = {
          id: Date.now().toString(),
          email,
          firstName,
          lastName,
          phone: phone || '',
          role: 'user',
          createdAt: new Date().toISOString()
        };

        users.set(email, newUser);

        const token = generateToken(newUser);

        console.log('✅ User created successfully:', email);

        return sendJSON(res, 201, {
          success: true,
          data: {
            user: newUser,
            accessToken: token
          },
          message: 'Registration successful'
        });

      } catch (error) {
        console.error('❌ Registration error:', error);
        return sendJSON(res, 500, {
          success: false,
          error: 'Server error'
        });
      }
    });
    return;
  }

  // Login endpoint
  if (path === '/api/v1/auth/login' && req.method === 'POST') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const { email, password } = JSON.parse(body);
        
        if (!users.has(email)) {
          return sendJSON(res, 401, {
            success: false,
            error: 'Invalid credentials'
          });
        }

        const user = users.get(email);
        const token = generateToken(user);

        return sendJSON(res, 200, {
          success: true,
          data: {
            user: user,
            accessToken: token
          },
          message: 'Login successful'
        });

      } catch (error) {
        return sendJSON(res, 500, {
          success: false,
          error: 'Server error'
        });
      }
    });
    return;
  }

  // 404 for other routes
  sendJSON(res, 404, {
    success: false,
    error: 'Not found'
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Simple Auth Server running on http://localhost:${PORT}`);
  console.log(`📍 Health: http://localhost:${PORT}/api/v1/health`);
  console.log(`🔐 Register: http://localhost:${PORT}/api/v1/auth/register`);
  console.log(`🔑 Login: http://localhost:${PORT}/api/v1/auth/login`);
});
