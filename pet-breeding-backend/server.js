const { app } = require('./src/app');

// Start the server
app.listen(process.env.PORT || 5000, () => {
  console.log('🚀 Pet Breeding Backend Server Started!');
  console.log(`📍 Port: ${process.env.PORT || 5000}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📚 API: http://localhost:${process.env.PORT || 5000}/api/health`);
});
