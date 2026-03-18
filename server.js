const app = require('./src/app');
const env = require('./src/config/env');
const db = require('./src/config/db');

// Test database connection before starting server
db.getConnection()
  .then(connection => {
    connection.release();
    console.log('✅ Database connected successfully');
    
    app.listen(env.PORT, () => {
      console.log(`🚀 Server running on port ${env.PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  });