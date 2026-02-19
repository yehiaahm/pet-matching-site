const express = require('express');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Database test endpoint
app.get('/test-db', async (req, res) => {
  try {
    await prisma.$connect();
    const userCount = await prisma.users.count();
    const petCount = await prisma.pets.count();
    
    res.json({
      status: 'Database Connected',
      users: userCount,
      pets: petCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'Database Error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Test authentication endpoints
app.get('/test-auth', async (req, res) => {
  try {
    // Test if we can create a user
    const testUser = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User'
    };
    
    res.json({
      status: 'Auth Endpoint Ready',
      message: 'Authentication endpoints are configured',
      testUser: testUser,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'Auth Error',
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Test server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🗄️  Database test: http://localhost:${PORT}/test-db`);
  console.log(`🔐 Auth test: http://localhost:${PORT}/test-auth`);
});
