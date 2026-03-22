const bcrypt = require('bcrypt');
const db = require('./src/config/db');

async function updatePassword() {
  try {
    const email = 'monisha@test.com';
    const newPassword = 'password123';
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update the password in database
    const [result] = await db.execute(
      'UPDATE users SET password = ? WHERE email = ?',
      [hashedPassword, email]
    );
    
    if (result.affectedRows > 0) {
      console.log(`✅ Password updated for ${email}`);
      console.log(`New password: ${newPassword}`);
    } else {
      console.log(`❌ User ${email} not found`);
    }
    
    // Verify the update
    const [user] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (user.length > 0) {
      const match = await bcrypt.compare(newPassword, user[0].password);
      console.log(`✅ Password verification: ${match ? 'SUCCESS' : 'FAILED'}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updatePassword();
