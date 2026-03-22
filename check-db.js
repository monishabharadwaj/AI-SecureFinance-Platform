const db = require('./src/config/db');

async function checkDatabase() {
  try {
    console.log('Connecting to database...');
    
    // Check if users table exists and has data
    const [users] = await db.execute('SELECT * FROM users');
    console.log('Users found:', users.length);
    users.forEach(user => {
      console.log(`- ID: ${user.id}, Name: ${user.name}, Email: ${user.email}`);
    });
    
    const [testUser] = await db.execute('SELECT * FROM users WHERE email = ?', ['monisha@test.com']);
    console.log('\nSearching for monisha@test.com:', testUser.length > 0 ? 'Found' : 'Not found');
    
    if (testUser.length > 0) {
      console.log('User details:', testUser[0]);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Database error:', error);
    process.exit(1);
  }
}

checkDatabase();
