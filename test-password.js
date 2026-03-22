const bcrypt = require('bcrypt');

async function testPassword() {
  try {
    const hashedPassword = '$2b$10$dl03pCvpLDe4NgR2g9ozbeQUJRcxSO/1F4jtbFfaC.iyO641lInym';
    
    // Test common passwords
    const passwords = ['password123', 'test123', 'password', '123456', 'test', 'monisha'];
    
    for (const pwd of passwords) {
      const match = await bcrypt.compare(pwd, hashedPassword);
      console.log(`Password "${pwd}": ${match ? 'MATCH' : 'NO MATCH'}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testPassword();
